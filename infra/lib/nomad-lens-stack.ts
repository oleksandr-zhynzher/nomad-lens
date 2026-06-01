import { execFileSync } from 'node:child_process';
import { cpSync } from 'node:fs';
import * as path from 'node:path';

import * as cdk from 'aws-cdk-lib';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigwv2Integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cloudwatchActions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as sns from 'aws-cdk-lib/aws-sns';
import type { Construct } from 'constructs';

const hostedZoneName = 'nomad-lens.org';
const siteDomainName = `www.${hostedZoneName}`;
const githubDeployRoleName = 'nomad-lens-github-deploy';
const defaultCertificateArn =
  'arn:aws:acm:us-east-1:881081146494:certificate/3e7ab294-d1a5-41b1-bc86-5297fedce409';
const defaultHostedZoneId = 'Z0189551QJ0Z9ZRWEXO8';

const getContextString = (scope: Construct, key: string): string | undefined => {
  const value: unknown = scope.node.tryGetContext(key);

  return typeof value === 'string' && value.length > 0 ? value : undefined;
};

const DEFAULT_CORS_ORIGINS = ['https://nomad-lens.org', 'https://www.nomad-lens.org'];

export const SERVER_BUNDLING_COMMANDS = [
  'cp -R /asset-input/. /tmp/server',
  'cd /tmp/server',
  'npm ci',
  'npm run build',
  'cp -R dist /asset-output/dist',
  'cp -R src/data /asset-output/dist/data',
  'cp package.json /asset-output/package.json',
  'cp package-lock.json /asset-output/package-lock.json',
  'cd /asset-output',
  'npm ci --omit=dev --ignore-scripts',
] as const;

export const API_ACCESS_LOG_FORMAT = JSON.stringify({
  error: '$context.integrationErrorMessage',
  httpMethod: '$context.httpMethod',
  ip: '$context.identity.sourceIp',
  protocol: '$context.protocol',
  requestId: '$context.requestId',
  requestTime: '$context.requestTime',
  responseLength: '$context.responseLength',
  routeKey: '$context.routeKey',
  status: '$context.status',
});

function getCorsOrigins(): readonly string[] {
  const raw = process.env['CORS_ORIGINS'];
  if (raw === undefined || raw.trim() === '') {
    return DEFAULT_CORS_ORIGINS;
  }

  const parsedOrigins = raw
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  if (parsedOrigins.length === 0) {
    throw new Error('CORS_ORIGINS must contain at least one origin when provided.');
  }

  if (parsedOrigins.includes('*')) {
    throw new Error('CORS_ORIGINS cannot include "*".');
  }

  return parsedOrigins;
}

export class NomadLensStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const corsOrigins = [...getCorsOrigins()];
    const snsManagedKey = kms.Alias.fromAliasName(this, 'SnsManagedKey', 'alias/aws/sns');
    const alarmTopic = new sns.Topic(this, 'OperationsAlarmTopic', {
      displayName: 'Nomad Lens production alarms',
      masterKey: snsManagedKey,
    });

    // ── Custom domain ───────────────────────────────────────────────────────
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: getContextString(this, 'hostedZoneId') ?? defaultHostedZoneId,
      zoneName: hostedZoneName,
    });
    const certificate = acm.Certificate.fromCertificateArn(
      this,
      'SiteCertificate',
      getContextString(this, 'certificateArn') ?? defaultCertificateArn,
    );
    const githubOidcProvider = new iam.OpenIdConnectProvider(this, 'GitHubOidcProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
    });
    const githubDeployRole = new iam.Role(this, 'GitHubActionsDeployRole', {
      roleName: githubDeployRoleName,
      assumedBy: new iam.OpenIdConnectPrincipal(githubOidcProvider).withConditions({
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
        },
        StringLike: {
          'token.actions.githubusercontent.com:sub': [
            'repo:oleksandr-zhynzher/nomad-lens:ref:refs/heads/main',
            'repo:oleksandr-zhynzher/nomad-lens:environment:production',
          ],
        },
      }),
    });
    githubDeployRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['sts:AssumeRole'],
        resources: [
          `arn:aws:iam::${this.account}:role/cdk-hnb659fds-*-${this.account}-${this.region}`,
        ],
      }),
    );
    githubDeployRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['cloudformation:DescribeStacks'],
        resources: ['*'],
      }),
    );

    // ── S3 bucket (SPA static assets) ─────────────────────────────────────
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      versioned: true,
    });
    // CDK's Bucket type is structurally compatible; this avoids an exactOptionalPropertyTypes mismatch.
    const siteBucketForConsumers = siteBucket as s3.IBucket;

    // ── Lambda (Express API) ───────────────────────────────────────────────
    const serverDir = path.join(__dirname, '../../server');
    const apiLogGroup = new logs.LogGroup(this, 'ApiFunctionLogGroup', {
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      retention: logs.RetentionDays.ONE_MONTH,
    });

    const apiFn = new lambda.Function(this, 'ApiFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'dist/lambda.handler',
      code: lambda.Code.fromAsset(serverDir, {
        bundling: {
          image: lambda.Runtime.NODEJS_22_X.bundlingImage,
          command: ['bash', '-c', SERVER_BUNDLING_COMMANDS.join(' && ')],
          local: {
            tryBundle(outputDir: string) {
              const outputDistDir = path.join(outputDir, 'dist');
              execFileSync('npm', ['ci', '--prefix', serverDir], { stdio: 'inherit' });
              execFileSync('npm', ['run', 'build', '--prefix', serverDir], { stdio: 'inherit' });
              cpSync(path.join(serverDir, 'dist'), outputDistDir, { recursive: true });
              cpSync(path.join(serverDir, 'src/data'), path.join(outputDistDir, 'data'), {
                recursive: true,
              });
              cpSync(path.join(serverDir, 'package.json'), path.join(outputDir, 'package.json'));
              cpSync(
                path.join(serverDir, 'package-lock.json'),
                path.join(outputDir, 'package-lock.json'),
              );
              execFileSync('npm', ['ci', '--omit=dev', '--ignore-scripts', '--prefix', outputDir], {
                stdio: 'inherit',
              });
              return true;
            },
          },
        },
      }),
      architecture: lambda.Architecture.ARM_64,
      environment: {
        CORS_ORIGINS: corsOrigins.join(','),
        NODE_ENV: 'production',
      },
      logGroup: apiLogGroup,
      memorySize: 256,
      timeout: cdk.Duration.seconds(10),
    });

    const alarmPeriod = cdk.Duration.minutes(5);

    const apiFunctionErrorAlarm = new cloudwatch.Alarm(this, 'ApiFunctionErrorAlarm', {
      metric: apiFn.metricErrors({ period: alarmPeriod, statistic: 'sum' }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    });
    apiFunctionErrorAlarm.addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));

    // ── HTTP API Gateway ───────────────────────────────────────────────────
    const apiAccessLogGroup = new logs.LogGroup(this, 'HttpApiAccessLogGroup', {
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      retention: logs.RetentionDays.ONE_MONTH,
    });
    const httpApi = new apigwv2.HttpApi(this, 'HttpApi', {
      createDefaultStage: false,
      corsPreflight: {
        allowHeaders: ['Authorization', 'Content-Type', 'X-Request-Id'],
        allowMethods: [apigwv2.CorsHttpMethod.GET, apigwv2.CorsHttpMethod.OPTIONS],
        allowOrigins: corsOrigins,
      },
    });

    httpApi.addRoutes({
      path: '/api/{proxy+}',
      methods: [apigwv2.HttpMethod.GET],
      integration: new apigwv2Integrations.HttpLambdaIntegration('ApiIntegration', apiFn),
    });

    new apigwv2.CfnStage(this, 'HttpApiDefaultStage', {
      apiId: httpApi.apiId,
      stageName: '$default',
      autoDeploy: true,
      accessLogSettings: {
        destinationArn: apiAccessLogGroup.logGroupArn,
        format: API_ACCESS_LOG_FORMAT,
      },
    });

    const httpApiServerErrorAlarm = new cloudwatch.Alarm(this, 'HttpApiServerErrorAlarm', {
      metric: httpApi.metricServerError({ period: alarmPeriod, statistic: 'sum' }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    });
    httpApiServerErrorAlarm.addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));

    // ── CloudFront distribution ────────────────────────────────────────────
    const apiOrigin = new origins.HttpOrigin(
      `${httpApi.httpApiId}.execute-api.${this.region}.amazonaws.com`,
      { protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY },
    );

    const spaRewriteFunction = new cloudfront.Function(this, 'SpaRewriteFunction', {
      code: cloudfront.FunctionCode.fromInline(`
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri.indexOf('/api/') === 0 || uri.indexOf('.') !== -1) {
    return request;
  }

  request.uri = '/index.html';
  return request;
}
`),
    });

    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      certificate,
      domainNames: [hostedZoneName, siteDomainName],
      defaultRootObject: 'index.html',
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucketForConsumers),
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        functionAssociations: [
          {
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
            function: spaRewriteFunction,
          },
        ],
        responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: apiOrigin,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
      },
    });

    siteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [siteBucket.arnForObjects('*')],
        principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
        conditions: {
          StringEquals: {
            'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
          },
        },
      }),
    );

    new route53.ARecord(this, 'SiteAliasRecord', {
      zone: hostedZone,
      recordName: 'www',
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });

    new route53.AaaaRecord(this, 'SiteIpv6AliasRecord', {
      zone: hostedZone,
      recordName: 'www',
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });

    new route53.ARecord(this, 'ApexAliasRecord', {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });

    new route53.AaaaRecord(this, 'ApexIpv6AliasRecord', {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });

    // ── Deploy client build to S3 + invalidate CloudFront ─────────────────
    new s3deploy.BucketDeployment(this, 'SiteDeploy', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../client/dist'))],
      destinationBucket: siteBucketForConsumers,
      distribution,
      distributionPaths: ['/*'],
    });

    // ── Outputs ────────────────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'SiteUrl', {
      value: `https://${siteDomainName}`,
      description: 'Nomad Lens public URL',
    });

    new cdk.CfnOutput(this, 'ApexSiteUrl', {
      value: `https://${hostedZoneName}`,
      description: 'Nomad Lens apex URL',
    });

    new cdk.CfnOutput(this, 'CloudFrontUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront distribution URL',
    });

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: httpApi.apiEndpoint,
      description: 'API Gateway endpoint URL',
    });

    new cdk.CfnOutput(this, 'GitHubActionsDeployRoleArn', {
      value: githubDeployRole.roleArn,
      description: 'OIDC role used by GitHub Actions production deployment',
    });

    new cdk.CfnOutput(this, 'OperationsAlarmTopicArn', {
      value: alarmTopic.topicArn,
      description: 'SNS topic for production alarm notifications',
    });
  }
}

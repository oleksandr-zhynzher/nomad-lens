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
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import type { Construct } from 'constructs';

const hostedZoneName = 'nomad-lens.org';
const siteDomainName = `www.${hostedZoneName}`;
const githubDeployRoleName = 'nomad-lens-github-deploy';
const defaultCertificateArn =
  'arn:aws:acm:us-east-1:881081146494:certificate/3e7ab294-d1a5-41b1-bc86-5297fedce409';
const defaultHostedZoneId = 'Z0189551QJ0Z9ZRWEXO8';

interface ApiFunctionOptions {
  readonly environment?: Record<string, string>;
  readonly memorySize?: number;
  readonly timeout?: cdk.Duration;
}

const getContextString = (scope: Construct, key: string): string | undefined => {
  const value: unknown = scope.node.tryGetContext(key);

  return typeof value === 'string' && value.length > 0 ? value : undefined;
};

export class NomadLensStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
          'token.actions.githubusercontent.com:sub':
            'repo:oleksandr-zhynzher/nomad-lens:ref:refs/heads/main',
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
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    const siteBucketReference = s3.Bucket.fromBucketName(
      this,
      'SiteBucketReference',
      siteBucket.bucketName,
    );

    // ── DynamoDB production data ───────────────────────────────────────────
    const dataTable = new dynamodb.Table(this, 'DataTable', {
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // ── Route-specific Lambda API handlers ─────────────────────────────────
    const serverDir = path.join(__dirname, '../../server');
    const apiCode = lambda.Code.fromAsset(serverDir, {
      bundling: {
        image: lambda.Runtime.NODEJS_22_X.bundlingImage,
        command: ['bash', '-c', 'echo "Docker fallback"'],
        local: {
          tryBundle(outputDir: string) {
            const outputDistDir = path.join(outputDir, 'dist');
            cpSync(path.join(serverDir, 'dist'), outputDistDir, { recursive: true });
            cpSync(path.join(serverDir, 'package.json'), path.join(outputDir, 'package.json'));
            execFileSync(
              'npm',
              [
                'install',
                '--omit=dev',
                '--legacy-peer-deps',
                '--ignore-scripts',
                '--prefix',
                outputDir,
              ],
              { stdio: 'inherit' },
            );
            return true;
          },
        },
      },
    });
    const createApiFunction = (
      functionId: string,
      handler: string,
      options: ApiFunctionOptions = {},
    ): lambda.Function =>
      new lambda.Function(this, functionId, {
        runtime: lambda.Runtime.NODEJS_22_X,
        handler,
        code: apiCode,
        memorySize: options.memorySize ?? 128,
        timeout: options.timeout ?? cdk.Duration.seconds(5),
        logGroup: new logs.LogGroup(this, `${functionId}LogGroup`, {
          retention: logs.RetentionDays.TWO_WEEKS,
          removalPolicy: cdk.RemovalPolicy.DESTROY,
        }),
        environment: { NODE_ENV: 'production', ...options.environment },
      });

    const healthFunction = createApiFunction('HealthFunction', 'dist/handlers/health.handler');
    const countriesListFunction = createApiFunction(
      'CountriesListFunction',
      'dist/handlers/countries.listHandler',
      {
        environment: { DATA_TABLE_NAME: dataTable.tableName },
        memorySize: 512,
        timeout: cdk.Duration.seconds(15),
      },
    );
    const countryDetailFunction = createApiFunction(
      'CountryDetailFunction',
      'dist/handlers/countries.getHandler',
      {
        environment: { DATA_TABLE_NAME: dataTable.tableName },
        memorySize: 256,
      },
    );
    const metaFunction = createApiFunction('MetaFunction', 'dist/handlers/meta.handler', {
      environment: { DATA_TABLE_NAME: dataTable.tableName },
    });

    dataTable.grantReadData(countriesListFunction);
    dataTable.grantReadData(countryDetailFunction);
    dataTable.grantReadData(metaFunction);
    const alarmPeriod = cdk.Duration.minutes(5);

    for (const apiFunction of [
      { id: 'HealthFunctionErrorAlarm', value: healthFunction },
      { id: 'CountriesListFunctionErrorAlarm', value: countriesListFunction },
      { id: 'CountryDetailFunctionErrorAlarm', value: countryDetailFunction },
      { id: 'MetaFunctionErrorAlarm', value: metaFunction },
    ]) {
      new cloudwatch.Alarm(this, apiFunction.id, {
        metric: apiFunction.value.metricErrors({ period: alarmPeriod, statistic: 'sum' }),
        threshold: 1,
        evaluationPeriods: 1,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      });
    }

    // ── HTTP API Gateway ───────────────────────────────────────────────────
    const httpApi = new apigwv2.HttpApi(this, 'HttpApi', {
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [apigwv2.CorsHttpMethod.ANY],
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    httpApi.addRoutes({
      path: '/api/health',
      methods: [apigwv2.HttpMethod.GET],
      integration: new apigwv2Integrations.HttpLambdaIntegration(
        'HealthIntegration',
        healthFunction,
      ),
    });

    httpApi.addRoutes({
      path: '/api/countries',
      methods: [apigwv2.HttpMethod.GET],
      integration: new apigwv2Integrations.HttpLambdaIntegration(
        'CountriesListIntegration',
        countriesListFunction,
      ),
    });

    httpApi.addRoutes({
      path: '/api/countries/{code}',
      methods: [apigwv2.HttpMethod.GET],
      integration: new apigwv2Integrations.HttpLambdaIntegration(
        'CountryDetailIntegration',
        countryDetailFunction,
      ),
    });

    httpApi.addRoutes({
      path: '/api/meta',
      methods: [apigwv2.HttpMethod.GET],
      integration: new apigwv2Integrations.HttpLambdaIntegration('MetaIntegration', metaFunction),
    });

    new cloudwatch.Alarm(this, 'HttpApiServerErrorAlarm', {
      metric: httpApi.metricServerError({ period: alarmPeriod, statistic: 'sum' }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    });

    for (const dataTableThrottleMetric of [
      { id: 'DataTableGetThrottleAlarm', operation: 'GetItem' },
      { id: 'DataTableQueryThrottleAlarm', operation: 'Query' },
      { id: 'DataTablePutThrottleAlarm', operation: 'PutItem' },
    ]) {
      new cloudwatch.Alarm(this, dataTableThrottleMetric.id, {
        metric: dataTable.metricThrottledRequestsForOperation(dataTableThrottleMetric.operation, {
          period: alarmPeriod,
          statistic: 'sum',
        }),
        threshold: 1,
        evaluationPeriods: 1,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      });
    }

    // ── CloudFront distribution ────────────────────────────────────────────
    const apiOrigin = new origins.HttpOrigin(
      `${httpApi.httpApiId}.execute-api.${this.region}.amazonaws.com`,
      { protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY },
    );

    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      certificate,
      domainNames: [hostedZoneName, siteDomainName],
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucketReference),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: apiOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        },
      },
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html' },
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html' },
      ],
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
      destinationBucket: siteBucketReference,
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

    new cdk.CfnOutput(this, 'DataTableName', {
      value: dataTable.tableName,
      description: 'DynamoDB table for production country data',
    });

    new cdk.CfnOutput(this, 'GitHubActionsDeployRoleArn', {
      value: githubDeployRole.roleArn,
      description: 'OIDC role used by GitHub Actions production deployment',
    });
  }
}

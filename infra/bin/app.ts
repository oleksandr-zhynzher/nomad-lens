import * as cdk from 'aws-cdk-lib';
import { NomadLensStack } from '../lib/nomad-lens-stack';

const app = new cdk.App();

const account = process.env['CDK_DEFAULT_ACCOUNT'];
const region = process.env['CDK_DEFAULT_REGION'] ?? 'us-east-1';

new NomadLensStack(app, 'NomadLensStack', {
  ...(account && { env: { account, region } }),
  description: 'Nomad Lens — country quality-of-life explorer',
});

app.synth();

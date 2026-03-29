import * as cdk from 'aws-cdk-lib';
import { NomadLensStack } from '../lib/nomad-lens-stack';

const app = new cdk.App();

new NomadLensStack(app, 'NomadLensStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
  },
  description: 'Nomad Lens — country quality-of-life explorer',
});

app.synth();

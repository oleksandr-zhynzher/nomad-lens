import * as cdk from 'aws-cdk-lib';

import { NomadLensStack } from '../lib/nomad-lens-stack';

const app = new cdk.App();

const account = process.env['CDK_DEFAULT_ACCOUNT'];
const region = process.env['CDK_DEFAULT_REGION'] ?? 'us-east-1';
const stackProps =
  account === undefined || account === ''
    ? {
        description: 'Nomad Lens — country quality-of-life explorer',
      }
    : {
        description: 'Nomad Lens — country quality-of-life explorer',
        env: { account, region },
      };

new NomadLensStack(app, 'NomadLensStack', stackProps);

app.synth();

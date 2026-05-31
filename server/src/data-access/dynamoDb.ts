import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export const createDocumentClient = (): DynamoDBDocumentClient =>
  DynamoDBDocumentClient.from(new DynamoDBClient({}), {
    marshallOptions: {
      convertClassInstanceToMap: true,
      removeUndefinedValues: true,
    },
  });

export const getRequiredEnv = (name: string): string => {
  const value = process.env[name];

  if (value === undefined || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

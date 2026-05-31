import type { DynamoDBDocumentClient, QueryCommandInput } from '@aws-sdk/lib-dynamodb';
import { GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

export const activeDatasetPartitionKey = 'META';
export const activeDatasetSortKey = 'DATASET#countries';
export const countryListPartitionKey = (datasetVersion: string): string =>
  `COUNTRY_LIST#${datasetVersion}`;
export const countryPartitionKey = (code: string): string => `COUNTRY#${code.toUpperCase()}`;

export interface DatasetMeta {
  readonly activeVersion: string;
  readonly chunkCount: number;
  readonly countryCount: number;
  readonly generatedAt: string;
  readonly importedAt: string;
}

interface DatasetMetaItem extends DatasetMeta {
  readonly pk: typeof activeDatasetPartitionKey;
  readonly sk: typeof activeDatasetSortKey;
}

interface CountryListChunkItem {
  readonly countries: unknown[];
  readonly datasetVersion: string;
  readonly pk: string;
  readonly sk: string;
}

interface CountryProfileItem {
  readonly code: string;
  readonly country: unknown;
  readonly datasetVersion: string;
  readonly pk: string;
  readonly sk: 'PROFILE';
}

type CountryLookupResult =
  | { readonly country: unknown; readonly found: true }
  | { readonly found: false };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isDatasetMetaItem = (value: unknown): value is DatasetMetaItem =>
  isRecord(value) &&
  value['pk'] === activeDatasetPartitionKey &&
  value['sk'] === activeDatasetSortKey &&
  typeof value['activeVersion'] === 'string' &&
  typeof value['chunkCount'] === 'number' &&
  typeof value['countryCount'] === 'number' &&
  typeof value['generatedAt'] === 'string' &&
  typeof value['importedAt'] === 'string';

const isCountryListChunkItem = (value: unknown): value is CountryListChunkItem =>
  isRecord(value) &&
  typeof value['pk'] === 'string' &&
  typeof value['sk'] === 'string' &&
  typeof value['datasetVersion'] === 'string' &&
  Array.isArray(value['countries']);

const isCountryProfileItem = (value: unknown): value is CountryProfileItem =>
  isRecord(value) &&
  typeof value['pk'] === 'string' &&
  value['sk'] === 'PROFILE' &&
  typeof value['code'] === 'string' &&
  typeof value['datasetVersion'] === 'string' &&
  'country' in value;

const getCountryCode = (country: unknown): string => {
  if (!isRecord(country) || typeof country['code'] !== 'string' || country['code'].length === 0) {
    throw new Error('Country record is missing a code');
  }

  return country['code'].toUpperCase();
};

export class CountryRepository {
  public constructor(
    private readonly client: DynamoDBDocumentClient,
    private readonly tableName: string,
  ) {}

  public async getDatasetMeta(): Promise<DatasetMeta> {
    const result = await this.client.send(
      new GetCommand({
        Key: { pk: activeDatasetPartitionKey, sk: activeDatasetSortKey },
        TableName: this.tableName,
      }),
    );

    if (!isDatasetMetaItem(result.Item)) {
      throw new Error('Active countries dataset metadata was not found');
    }

    return {
      activeVersion: result.Item.activeVersion,
      chunkCount: result.Item.chunkCount,
      countryCount: result.Item.countryCount,
      generatedAt: result.Item.generatedAt,
      importedAt: result.Item.importedAt,
    };
  }

  public async listCountries(): Promise<unknown[]> {
    const meta = await this.getDatasetMeta();
    const countries: unknown[] = [];
    let exclusiveStartKey: QueryCommandInput['ExclusiveStartKey'];

    do {
      const queryInput: QueryCommandInput = {
        ExpressionAttributeValues: {
          ':pk': countryListPartitionKey(meta.activeVersion),
        },
        KeyConditionExpression: 'pk = :pk',
        ScanIndexForward: true,
        TableName: this.tableName,
      };

      if (exclusiveStartKey !== undefined) {
        queryInput.ExclusiveStartKey = exclusiveStartKey;
      }

      const result = await this.client.send(new QueryCommand(queryInput));
      const items = result.Items ?? [];

      for (const item of items) {
        if (!isCountryListChunkItem(item)) {
          throw new Error('Invalid country list chunk returned from DynamoDB');
        }

        countries.push(...item.countries);
      }

      exclusiveStartKey = result.LastEvaluatedKey;
    } while (exclusiveStartKey !== undefined);

    return countries;
  }

  public async getCountry(code: string): Promise<CountryLookupResult> {
    const meta = await this.getDatasetMeta();
    const result = await this.client.send(
      new GetCommand({
        Key: { pk: countryPartitionKey(code), sk: 'PROFILE' },
        TableName: this.tableName,
      }),
    );

    if (result.Item === undefined) {
      return { found: false };
    }

    if (!isCountryProfileItem(result.Item) || result.Item.datasetVersion !== meta.activeVersion) {
      throw new Error(`Invalid country profile returned for ${code}`);
    }

    return { country: result.Item.country, found: true };
  }
}

export interface ImportCountriesInput {
  readonly chunkSizeBytes: number;
  readonly countries: unknown[];
  readonly datasetVersion: string;
  readonly generatedAt: string;
  readonly importedAt: string;
  readonly tableName: string;
}

const getChunkSortKey = (index: number): string => `CHUNK#${index.toString().padStart(4, '0')}`;

const splitCountryChunks = (countries: unknown[], maxChunkBytes: number): unknown[][] => {
  const chunks: unknown[][] = [];
  let currentChunk: unknown[] = [];
  let currentBytes = 2;

  for (const country of countries) {
    const countryBytes = Buffer.byteLength(JSON.stringify(country), 'utf8') + 1;

    if (currentChunk.length > 0 && currentBytes + countryBytes > maxChunkBytes) {
      chunks.push(currentChunk);
      currentChunk = [];
      currentBytes = 2;
    }

    currentChunk.push(country);
    currentBytes += countryBytes;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
};

const putAll = async (
  client: DynamoDBDocumentClient,
  tableName: string,
  items: Array<Record<string, unknown>>,
): Promise<void> => {
  await Promise.all(
    items.map(async (item) => {
      await client.send(new PutCommand({ Item: item, TableName: tableName }));
    }),
  );
};

export const importCountries = async (
  client: DynamoDBDocumentClient,
  input: ImportCountriesInput,
): Promise<DatasetMeta> => {
  const chunks = splitCountryChunks(input.countries, input.chunkSizeBytes);
  const countryItems: Array<Record<string, unknown>> = input.countries.map((country) => {
    const code = getCountryCode(country);

    return {
      code,
      country,
      datasetVersion: input.datasetVersion,
      pk: countryPartitionKey(code),
      sk: 'PROFILE',
    };
  });
  const chunkItems: Array<Record<string, unknown>> = chunks.map((countries, index) => ({
    countries,
    datasetVersion: input.datasetVersion,
    pk: countryListPartitionKey(input.datasetVersion),
    sk: getChunkSortKey(index),
  }));

  await putAll(client, input.tableName, [...countryItems, ...chunkItems]);

  const meta: DatasetMetaItem = {
    activeVersion: input.datasetVersion,
    chunkCount: chunks.length,
    countryCount: input.countries.length,
    generatedAt: input.generatedAt,
    importedAt: input.importedAt,
    pk: activeDatasetPartitionKey,
    sk: activeDatasetSortKey,
  };

  await client.send(
    new PutCommand({
      Item: meta,
      TableName: input.tableName,
    }),
  );

  return meta;
};

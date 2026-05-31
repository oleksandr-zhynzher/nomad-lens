import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { importCountries } from '../data-access/countryRepository';
import { createDocumentClient, getRequiredEnv } from '../data-access/dynamoDb';

const chunkSizeBytes = 320_000;

const isCountryArray = (value: unknown): value is unknown[] => Array.isArray(value);

const loadCountries = async (): Promise<unknown[]> => {
  const countriesFilePath = path.resolve(__dirname, '../data/countries.json');
  const fileContent = await readFile(countriesFilePath, 'utf8');
  const parsed = JSON.parse(fileContent) as unknown;

  if (!isCountryArray(parsed)) {
    throw new Error('countries.json must contain an array');
  }

  return parsed;
};

const getDatasetVersion = (): string => {
  const value = process.env['DATASET_VERSION'];

  if (value !== undefined && value.length > 0) {
    return value;
  }

  return new Date()
    .toISOString()
    .replaceAll('-', '')
    .replaceAll(':', '')
    .replaceAll('.', '')
    .slice(0, 15);
};

const main = async (): Promise<void> => {
  const tableName = getRequiredEnv('DATA_TABLE_NAME');
  const countries = await loadCountries();
  const importedAt = new Date().toISOString();
  const meta = await importCountries(createDocumentClient(), {
    chunkSizeBytes,
    countries,
    datasetVersion: getDatasetVersion(),
    generatedAt: importedAt,
    importedAt,
    tableName,
  });

  console.info(
    `Imported ${meta.countryCount.toString()} countries into ${tableName} as ${meta.chunkCount.toString()} chunks`,
  );
};

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

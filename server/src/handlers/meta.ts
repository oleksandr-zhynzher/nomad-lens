import { CountryRepository } from '../data-access/countryRepository';
import { createDocumentClient, getRequiredEnv } from '../data-access/dynamoDb';
import type { ApiHandler } from '../shared/http';
import { jsonResponse, withErrorHandling } from '../shared/http';

const repository = new CountryRepository(createDocumentClient(), getRequiredEnv('DATA_TABLE_NAME'));

export const handler: ApiHandler = withErrorHandling(async () => {
  const meta = await repository.getDatasetMeta();

  return jsonResponse(200, meta);
});

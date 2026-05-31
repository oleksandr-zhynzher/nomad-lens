import { CountryRepository } from '../data-access/countryRepository';
import { createDocumentClient, getRequiredEnv } from '../data-access/dynamoDb';
import type { ApiHandler } from '../shared/http';
import { jsonResponse, notFoundResponse, withErrorHandling } from '../shared/http';

const repository = new CountryRepository(createDocumentClient(), getRequiredEnv('DATA_TABLE_NAME'));

const normalizeCountryCode = (code: string | undefined): string | undefined => {
  if (code === undefined) {
    return undefined;
  }

  const normalized = code.trim().toUpperCase();

  return /^[A-Z]{2}$/.test(normalized) ? normalized : undefined;
};

export const listHandler: ApiHandler = withErrorHandling(async () => {
  const countries = await repository.listCountries();

  return jsonResponse(200, countries);
});

export const getHandler: ApiHandler = withErrorHandling(async (event) => {
  const code = normalizeCountryCode(event.pathParameters?.['code']);

  if (code === undefined) {
    return jsonResponse(400, { error: 'Country code must be a two-letter ISO code' });
  }

  const result = await repository.getCountry(code);

  if (!result.found) {
    return notFoundResponse(`Country ${code} was not found`);
  }

  return jsonResponse(200, result.country);
});

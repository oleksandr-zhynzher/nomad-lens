import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

const FETCH_TIMEOUT_MS = 10_000;

export async function fetchWithTimeout(
  url: string,
  timeoutMs = FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

const jsonHeaders = {
  'access-control-allow-origin': '*',
  'content-type': 'application/json; charset=utf-8',
} as const;

export type ApiHandler = (
  event: APIGatewayProxyEventV2,
) => Promise<APIGatewayProxyStructuredResultV2> | APIGatewayProxyStructuredResultV2;

export const jsonResponse = (
  statusCode: number,
  body: unknown,
): APIGatewayProxyStructuredResultV2 => ({
  body: JSON.stringify(body),
  headers: jsonHeaders,
  statusCode,
});

export const notFoundResponse = (message: string): APIGatewayProxyStructuredResultV2 =>
  jsonResponse(404, { error: message });

export const serverErrorResponse = (error: unknown): APIGatewayProxyStructuredResultV2 => {
  console.error(error);

  return jsonResponse(500, { error: 'Internal server error' });
};

export const withErrorHandling =
  (handler: ApiHandler): ApiHandler =>
  async (event) => {
    try {
      return await handler(event);
    } catch (error: unknown) {
      return serverErrorResponse(error);
    }
  };

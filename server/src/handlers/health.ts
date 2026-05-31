import type { ApiHandler } from '../shared/http';
import { jsonResponse, withErrorHandling } from '../shared/http';

export const handler: ApiHandler = withErrorHandling(() =>
  jsonResponse(200, {
    environment: process.env['NODE_ENV'] ?? 'production',
    status: 'ok',
    timestamp: new Date().toISOString(),
  }),
);

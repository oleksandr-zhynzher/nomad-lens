import type { ErrorRequestHandler, RequestHandler } from 'express';

import { config } from '../config';
import { logger } from '../logger';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getNumericProperty(value: unknown, key: string): number | null {
  if (!isRecord(value)) {
    return null;
  }

  const property = value[key];
  return typeof property === 'number' && Number.isInteger(property) ? property : null;
}

function getBooleanProperty(value: unknown, key: string): boolean | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const property = value[key];
  return typeof property === 'boolean' ? property : undefined;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unexpected server error';
}

function getStatusCode(error: unknown): number {
  const statusCode = getNumericProperty(error, 'statusCode') ?? getNumericProperty(error, 'status');
  if (statusCode !== null && statusCode >= 400 && statusCode <= 599) {
    return statusCode;
  }

  return 500;
}

function getRequestId(res: {
  readonly getHeader: (name: string) => number | string | string[] | undefined;
}): string | undefined {
  const value = res.getHeader('x-request-id');
  return typeof value === 'string' ? value : undefined;
}

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.originalUrl,
    requestId: getRequestId(res),
  });
};

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const statusCode = getStatusCode(error);
  const expose = getBooleanProperty(error, 'expose') ?? statusCode < 500;
  const message = config.isProduction && !expose ? 'Internal Server Error' : getErrorMessage(error);

  logger.error('request_error', {
    error,
    method: req.method,
    path: req.originalUrl,
    requestId: getRequestId(res),
    statusCode,
  });

  res.status(statusCode).json({
    error: message,
    requestId: getRequestId(res),
  });
};

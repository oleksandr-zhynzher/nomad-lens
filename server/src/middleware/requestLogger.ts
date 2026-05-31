import { performance } from 'node:perf_hooks';

import type { RequestHandler } from 'express';

import { logger } from '../logger';

function getRequestId(res: {
  readonly getHeader: (name: string) => number | string | string[] | undefined;
}): string | undefined {
  const value = res.getHeader('x-request-id');
  return typeof value === 'string' ? value : undefined;
}

export const requestLogger: RequestHandler = (req, res, next) => {
  const startedAt = performance.now();

  res.on('finish', () => {
    const durationMs = Math.round((performance.now() - startedAt) * 100) / 100;
    const context = {
      durationMs,
      method: req.method,
      path: req.originalUrl,
      requestId: getRequestId(res),
      statusCode: res.statusCode,
    };

    if (res.statusCode >= 500) {
      logger.error('http_request', context);
      return;
    }

    if (res.statusCode >= 400) {
      logger.warn('http_request', context);
      return;
    }

    logger.info('http_request', context);
  });

  next();
};

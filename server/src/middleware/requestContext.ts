import { randomUUID } from 'node:crypto';

import type { RequestHandler } from 'express';

const MAX_REQUEST_ID_LENGTH = 128;

function normalizeRequestId(value: string | undefined): string {
  if (value === undefined || value.trim() === '') {
    return randomUUID();
  }

  return value.trim().slice(0, MAX_REQUEST_ID_LENGTH);
}

export const requestContext: RequestHandler = (req, res, next) => {
  const requestId = normalizeRequestId(req.header('x-request-id'));
  res.setHeader('x-request-id', requestId);
  next();
};

import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { logger } from '../../logger';
import { errorHandler, notFoundHandler } from '../errorHandlers';

vi.mock('../../logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

function makeReq(overrides: Partial<Request> = {}): Request {
  return {
    method: 'GET',
    originalUrl: '/test',
    ...overrides,
  } as unknown as Request;
}

function makeRes(overrides: Partial<Response> = {}): Response {
  const res = {
    getHeader: vi.fn(),
    headersSent: false,
    json: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis(),
    ...overrides,
  } as unknown as Response;
  return res;
}

const next: NextFunction = vi.fn();

describe('notFoundHandler', () => {
  it('responds with 404 status', () => {
    const req = makeReq({ originalUrl: '/missing' });
    const res = makeRes();
    notFoundHandler(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('responds with error and path in JSON body', () => {
    const req = makeReq({ originalUrl: '/missing' });
    const res = makeRes();
    notFoundHandler(req, res, next);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Not Found', path: '/missing' }),
    );
  });

  it('includes requestId when x-request-id header is present', () => {
    const req = makeReq();
    const res = makeRes({ getHeader: vi.fn().mockReturnValue('req-123') });
    notFoundHandler(req, res, next);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ requestId: 'req-123' }));
  });

  it('sets requestId to undefined when header is absent', () => {
    const req = makeReq();
    const res = makeRes();
    notFoundHandler(req, res, next);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ requestId: undefined }));
  });
});

describe('errorHandler', () => {
  beforeEach(() => {
    vi.mocked(logger.error).mockClear();
  });

  it('calls next when headers already sent', () => {
    const mockNext = vi.fn() as unknown as NextFunction;
    const req = makeReq();
    const res = makeRes({ headersSent: true });
    const err = new Error('after headers');
    errorHandler(err, req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(err);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('responds with 500 for plain Error', () => {
    const req = makeReq();
    const res = makeRes();
    errorHandler(new Error('crash'), req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('uses statusCode from error object when present', () => {
    const req = makeReq();
    const res = makeRes();
    const err = Object.assign(new Error('bad req'), { statusCode: 400 });
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('uses status property from error object when statusCode missing', () => {
    const req = makeReq();
    const res = makeRes();
    const err = Object.assign(new Error('not found'), { status: 404 });
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('defaults to 500 when statusCode is out of range', () => {
    const req = makeReq();
    const res = makeRes();
    const err = Object.assign(new Error('bad'), { statusCode: 200 });
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('exposes message for 4xx errors in non-production', () => {
    const req = makeReq();
    const res = makeRes();
    const err = Object.assign(new Error('bad input'), { statusCode: 422 });
    errorHandler(err, req, res, next);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'bad input' }));
  });

  it('exposes generic message for 5xx errors in non-production', () => {
    // In test env, isProduction = false — message IS exposed even for 500
    const req = makeReq();
    const res = makeRes();
    errorHandler(new Error('internal detail'), req, res, next);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'internal detail' }));
  });

  it('logs the error via logger.error', () => {
    const req = makeReq();
    const res = makeRes();
    errorHandler(new Error('crash'), req, res, next);
    expect(logger.error).toHaveBeenCalledWith('request_error', expect.objectContaining({}));
  });

  it('includes requestId in response when header is present', () => {
    const req = makeReq();
    const res = makeRes({ getHeader: vi.fn().mockReturnValue('rid-abc') });
    errorHandler(new Error('e'), req, res, next);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ requestId: 'rid-abc' }));
  });
});

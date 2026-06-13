import { EventEmitter } from 'node:events';

import type { NextFunction, Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { logger } from '../../logger';
import { requestLogger } from '../requestLogger';

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
    originalUrl: '/api/test',
    ...overrides,
  } as unknown as Request;
}

function makeRes(statusCode: number, requestId?: string): Response & EventEmitter {
  const emitter = new EventEmitter();
  return Object.assign(emitter, {
    getHeader: vi.fn().mockReturnValue(requestId),
    statusCode,
  }) as unknown as Response & EventEmitter;
}

describe('requestLogger middleware', () => {
  beforeEach(() => {
    vi.mocked(logger.info).mockClear();
    vi.mocked(logger.warn).mockClear();
    vi.mocked(logger.error).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls next()', () => {
    const req = makeReq();
    const res = makeRes(200);
    const next = vi.fn() as unknown as NextFunction;
    requestLogger(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('logs info for 2xx responses on finish', () => {
    const req = makeReq();
    const res = makeRes(200);
    const next = vi.fn() as unknown as NextFunction;
    requestLogger(req, res, next);
    res.emit('finish');
    expect(logger.info).toHaveBeenCalledWith('http_request', expect.objectContaining({}));
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('logs warn for 4xx responses on finish', () => {
    const req = makeReq();
    const res = makeRes(404);
    const next = vi.fn() as unknown as NextFunction;
    requestLogger(req, res, next);
    res.emit('finish');
    expect(logger.warn).toHaveBeenCalledWith('http_request', expect.objectContaining({}));
    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('logs error for 5xx responses on finish', () => {
    const req = makeReq();
    const res = makeRes(500);
    const next = vi.fn() as unknown as NextFunction;
    requestLogger(req, res, next);
    res.emit('finish');
    expect(logger.error).toHaveBeenCalledWith('http_request', expect.objectContaining({}));
    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('includes method, path, statusCode and durationMs in log context', () => {
    const req = makeReq({ method: 'POST', originalUrl: '/api/data' });
    const res = makeRes(201);
    const next = vi.fn() as unknown as NextFunction;
    requestLogger(req, res, next);
    res.emit('finish');
    expect(logger.info).toHaveBeenCalledWith(
      'http_request',
      expect.objectContaining({
        method: 'POST',
        path: '/api/data',
        statusCode: 201,
        durationMs: expect.any(Number),
      }),
    );
  });

  it('includes requestId in log context when header is present', () => {
    const req = makeReq();
    const res = makeRes(200, 'req-xyz');
    const next = vi.fn() as unknown as NextFunction;
    requestLogger(req, res, next);
    res.emit('finish');
    expect(logger.info).toHaveBeenCalledWith(
      'http_request',
      expect.objectContaining({ requestId: 'req-xyz' }),
    );
  });

  it('does not log before finish event', () => {
    const req = makeReq();
    const res = makeRes(200);
    const next = vi.fn() as unknown as NextFunction;
    requestLogger(req, res, next);
    expect(logger.info).not.toHaveBeenCalled();
  });
});

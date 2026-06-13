import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { requestContext } from '../requestContext';

function makeReq(xRequestId?: string): Request {
  return {
    header: vi.fn().mockReturnValue(xRequestId),
  } as unknown as Request;
}

type HeaderValue = string | number | string[];

function makeRes(): Response & { headers: Record<string, HeaderValue> } {
  const headers: Record<string, HeaderValue> = {};
  return {
    getHeader: (name: string) => headers[name.toLowerCase()],
    headers,
    setHeader: vi.fn().mockImplementation((name: string, value: string) => {
      headers[name.toLowerCase()] = value;
    }),
  } as unknown as Response & { headers: Record<string, HeaderValue> };
}

describe('requestContext middleware', () => {
  it('calls next()', () => {
    const req = makeReq();
    const res = makeRes();
    const next = vi.fn() as unknown as NextFunction;
    requestContext(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('sets x-request-id header on the response', () => {
    const req = makeReq();
    const res = makeRes();
    const next = vi.fn() as unknown as NextFunction;
    requestContext(req, res, next);
    expect(res.setHeader).toHaveBeenCalledWith('x-request-id', expect.any(String));
  });

  it('generates a UUID when x-request-id header is absent', () => {
    const req = makeReq();
    const res = makeRes();
    const next = vi.fn() as unknown as NextFunction;
    requestContext(req, res, next);
    const id = (res.setHeader as ReturnType<typeof vi.fn>).mock.calls[0]?.[1];
    expect(typeof id).toBe('string');
    expect((id as string).length).toBeGreaterThan(0);
  });

  it('generates a UUID when x-request-id is empty string', () => {
    const req = makeReq('');
    const res = makeRes();
    const next = vi.fn() as unknown as NextFunction;
    requestContext(req, res, next);
    const id = (res.setHeader as ReturnType<typeof vi.fn>).mock.calls[0]?.[1];
    expect(typeof id).toBe('string');
    expect((id as string).length).toBeGreaterThan(0);
  });

  it('uses the incoming x-request-id header when present', () => {
    const req = makeReq('client-provided-id');
    const res = makeRes();
    const next = vi.fn() as unknown as NextFunction;
    requestContext(req, res, next);
    const id = (res.setHeader as ReturnType<typeof vi.fn>).mock.calls[0]?.[1];
    expect(id).toBe('client-provided-id');
  });

  it('trims whitespace from the incoming header', () => {
    const req = makeReq('  my-id  ');
    const res = makeRes();
    const next = vi.fn() as unknown as NextFunction;
    requestContext(req, res, next);
    const id = (res.setHeader as ReturnType<typeof vi.fn>).mock.calls[0]?.[1];
    expect(id).toBe('my-id');
  });

  it('truncates incoming header to 128 characters', () => {
    const longId = 'x'.repeat(200);
    const req = makeReq(longId);
    const res = makeRes();
    const next = vi.fn() as unknown as NextFunction;
    requestContext(req, res, next);
    const id = (res.setHeader as ReturnType<typeof vi.fn>).mock.calls[0]?.[1];
    expect((id as string).length).toBe(128);
  });

  it('generates different IDs for each call without header', () => {
    const next = vi.fn() as unknown as NextFunction;
    const res1 = makeRes();
    const res2 = makeRes();
    requestContext(makeReq(), res1, next);
    requestContext(makeReq(), res2, next);
    const id1 = (res1.setHeader as ReturnType<typeof vi.fn>).mock.calls[0]?.[1];
    const id2 = (res2.setHeader as ReturnType<typeof vi.fn>).mock.calls[0]?.[1];
    expect(id1).not.toBe(id2);
  });
});

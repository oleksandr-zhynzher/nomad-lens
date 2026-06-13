import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  fetchWithTimeout,
  jsonResponse,
  notFoundResponse,
  serverErrorResponse,
  withErrorHandling,
} from '../http';

describe('fetchWithTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('resolves with Response on success', async () => {
    const mockResponse = new Response(JSON.stringify({ ok: true }), { status: 200 });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    const resultPromise = fetchWithTimeout('https://example.com', 5000);
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result).toBe(mockResponse);
  });

  it('aborts after timeout and rejects', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(
        (_url: string, opts: { signal: AbortSignal }) =>
          new Promise((_, reject) => {
            opts.signal.addEventListener('abort', () => {
              reject(new DOMException('The operation was aborted', 'AbortError'));
            });
          }),
      ),
    );

    const resultPromise = fetchWithTimeout('https://example.com', 500);
    // Attach rejection handler before advancing timers to prevent unhandled rejection
    const assertion = expect(resultPromise).rejects.toBeDefined();
    await vi.advanceTimersByTimeAsync(600);
    await assertion;
  });

  it('clears timeout after successful fetch', async () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const mockResponse = new Response('{}', { status: 200 });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    const resultPromise = fetchWithTimeout('https://example.com', 5000);
    await vi.runAllTimersAsync();
    await resultPromise;

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});

describe('jsonResponse', () => {
  it('returns the correct statusCode', () => {
    const result = jsonResponse(200, { hello: 'world' });
    expect(result.statusCode).toBe(200);
  });

  it('serializes the body to JSON string', () => {
    const result = jsonResponse(200, { key: 'value' });
    expect(result.body).toBe(JSON.stringify({ key: 'value' }));
  });

  it('sets content-type to application/json', () => {
    const result = jsonResponse(200, {});
    expect(result.headers?.['content-type']).toContain('application/json');
  });

  it('sets CORS header', () => {
    const result = jsonResponse(200, {});
    expect(result.headers?.['access-control-allow-origin']).toBe('*');
  });

  it('handles non-200 status codes', () => {
    const result = jsonResponse(422, { error: 'bad' });
    expect(result.statusCode).toBe(422);
  });
});

describe('notFoundResponse', () => {
  it('returns 404 status', () => {
    const result = notFoundResponse('Resource not found');
    expect(result.statusCode).toBe(404);
  });

  it('includes the error message in body', () => {
    const result = notFoundResponse('Resource not found');
    const body = JSON.parse(result.body ?? '{}') as { error: string };
    expect(body.error).toBe('Resource not found');
  });
});

describe('serverErrorResponse', () => {
  it('returns 500 status', () => {
    const result = serverErrorResponse(new Error('crash'));
    expect(result.statusCode).toBe(500);
  });

  it('returns generic error body', () => {
    const result = serverErrorResponse(new Error('detail'));
    const body = JSON.parse(result.body ?? '{}') as { error: string };
    expect(body.error).toBe('Internal server error');
  });
});

describe('withErrorHandling', () => {
  it('calls the handler and returns its result', async () => {
    const handler = vi.fn().mockResolvedValue(jsonResponse(200, { ok: true }));
    const wrapped = withErrorHandling(handler);
    const event = {} as APIGatewayProxyEventV2;
    const result = await wrapped(event);
    expect(result.statusCode).toBe(200);
  });

  it('catches thrown errors and returns serverErrorResponse', async () => {
    const handler = vi.fn().mockRejectedValue(new Error('handler crash'));
    const wrapped = withErrorHandling(handler);
    const event = {} as APIGatewayProxyEventV2;
    const result = await wrapped(event);
    expect(result.statusCode).toBe(500);
  });

  it('passes the event to the handler', async () => {
    const handler = vi.fn().mockResolvedValue(jsonResponse(200, {}));
    const wrapped = withErrorHandling(handler);
    const event = { requestContext: {} } as unknown as APIGatewayProxyEventV2;
    await wrapped(event);
    expect(handler).toHaveBeenCalledWith(event);
  });
});

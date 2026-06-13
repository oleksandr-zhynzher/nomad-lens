import * as http from 'node:http';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { app } from '../../app';

let server: http.Server;
let baseUrl: string;

beforeAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address() as http.AddressInfo;
      baseUrl = `http://127.0.0.1:${addr.port}`;
      resolve();
    });
    server.on('error', reject);
  });
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe('GET /api/countries', () => {
  it('returns 200', async () => {
    const res = await fetch(`${baseUrl}/api/countries`);
    expect(res.status).toBe(200);
  });

  it('returns JSON content-type', async () => {
    const res = await fetch(`${baseUrl}/api/countries`);
    expect(res.headers.get('content-type')).toContain('application/json');
  });

  it('returns an array of country objects', async () => {
    const res = await fetch(`${baseUrl}/api/countries`);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect((data as unknown[]).length).toBeGreaterThan(0);
  });

  it('each country has a 2-character code', async () => {
    const res = await fetch(`${baseUrl}/api/countries`);
    const data = (await res.json()) as Array<{ code: string }>;
    expect(data.every((c) => typeof c.code === 'string' && c.code.length === 2)).toBe(true);
  });

  it('each country has a name field', async () => {
    const res = await fetch(`${baseUrl}/api/countries`);
    const data = (await res.json()) as Array<{ name: string }>;
    expect(data.every((c) => typeof c.name === 'string')).toBe(true);
  });

  it('includes x-request-id in response headers', async () => {
    const res = await fetch(`${baseUrl}/api/countries`);
    expect(res.headers.has('x-request-id')).toBe(true);
  });

  it('echoes the x-request-id header when provided', async () => {
    const res = await fetch(`${baseUrl}/api/countries`, {
      headers: { 'x-request-id': 'test-id-123' },
    });
    expect(res.headers.get('x-request-id')).toBe('test-id-123');
  });
});

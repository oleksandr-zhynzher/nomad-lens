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

describe('GET /api/health', () => {
  it('returns 200', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.status).toBe(200);
  });

  it('returns JSON content-type', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.headers.get('content-type')).toContain('application/json');
  });

  it('returns status ok when data is loaded', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    const data = (await res.json()) as { status: string };
    expect(data.status).toBe('ok');
  });

  it('includes apis.countries in response', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    const data = (await res.json()) as { apis: { countries: boolean } };
    expect(typeof data.apis.countries).toBe('boolean');
  });

  it('includes data.countries.count in response', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    const data = (await res.json()) as { data: { countries: { count: number } } };
    expect(data.data.countries.count).toBeGreaterThan(0);
  });

  it('includes environment field', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    const data = (await res.json()) as { environment: string };
    expect(data.environment).toBe('test');
  });

  it('includes a timestamp', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    const data = (await res.json()) as { timestamp: string };
    expect(typeof data.timestamp).toBe('string');
  });

  it('includes uptimeSeconds', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    const data = (await res.json()) as { uptimeSeconds: number };
    expect(typeof data.uptimeSeconds).toBe('number');
  });
});

describe('GET /api/livez', () => {
  it('returns 200 with status ok', async () => {
    const res = await fetch(`${baseUrl}/api/livez`);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { status: string };
    expect(data.status).toBe('ok');
  });

  it('includes timestamp and uptimeSeconds', async () => {
    const res = await fetch(`${baseUrl}/api/livez`);
    const data = (await res.json()) as { timestamp: string; uptimeSeconds: number };
    expect(typeof data.timestamp).toBe('string');
    expect(typeof data.uptimeSeconds).toBe('number');
  });
});

describe('GET /api/readyz', () => {
  it('returns 200 when countries are loaded', async () => {
    const res = await fetch(`${baseUrl}/api/readyz`);
    expect(res.status).toBe(200);
  });

  it('includes checks.countries in response', async () => {
    const res = await fetch(`${baseUrl}/api/readyz`);
    const data = (await res.json()) as { checks: { countries: { loaded: boolean } } };
    expect(typeof data.checks.countries.loaded).toBe('boolean');
  });
});

describe('GET /api/meta', () => {
  it('returns 200 with app name', async () => {
    const res = await fetch(`${baseUrl}/api/meta`);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { name: string };
    expect(data.name).toBe('nomad-lens');
  });

  it('includes environment and status', async () => {
    const res = await fetch(`${baseUrl}/api/meta`);
    const data = (await res.json()) as { environment: string; status: string };
    expect(data.environment).toBe('test');
    expect(data.status).toBe('ok');
  });
});

describe('unknown routes', () => {
  it('returns 404 for unmatched paths', async () => {
    const res = await fetch(`${baseUrl}/api/does-not-exist`);
    expect(res.status).toBe(404);
  });

  it('404 response includes path in body', async () => {
    const res = await fetch(`${baseUrl}/api/does-not-exist`);
    const data = (await res.json()) as { path: string };
    expect(data.path).toBe('/api/does-not-exist');
  });
});

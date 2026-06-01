import { describe, expect, it } from 'vitest';

import { API_ACCESS_LOG_FORMAT, SERVER_BUNDLING_COMMANDS } from '../lib/nomad-lens-stack';

describe('Nomad Lens infrastructure guardrails', () => {
  it('keeps Lambda packaging reproducible and production-only', () => {
    expect(SERVER_BUNDLING_COMMANDS).toContain('npm ci');
    expect(SERVER_BUNDLING_COMMANDS).toContain(
      'cp package-lock.json /asset-output/package-lock.json',
    );
    expect(SERVER_BUNDLING_COMMANDS).toContain('npm ci --omit=dev --ignore-scripts');
  });

  it('keeps API Gateway access logs correlated by request id and status', () => {
    const format = JSON.parse(API_ACCESS_LOG_FORMAT) as Record<string, string>;

    expect(format['requestId']).toBe('$context.requestId');
    expect(format['routeKey']).toBe('$context.routeKey');
    expect(format['status']).toBe('$context.status');
    expect(format['error']).toBe('$context.integrationErrorMessage');
  });
});

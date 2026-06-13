import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('config', () => {
  describe('test environment defaults', () => {
    it('has nodeEnv = test', async () => {
      const { config } = await import('../config');
      expect(config.nodeEnv).toBe('test');
    });

    it('isProduction is false in test', async () => {
      const { config } = await import('../config');
      expect(config.isProduction).toBe(false);
    });

    it('port is a positive integer', async () => {
      const { config } = await import('../config');
      expect(typeof config.port).toBe('number');
      expect(config.port).toBeGreaterThan(0);
    });

    it('corsOrigins is a non-empty array of strings', async () => {
      const { config } = await import('../config');
      expect(Array.isArray(config.corsOrigins)).toBe(true);
      expect(config.corsOrigins.length).toBeGreaterThan(0);
      expect(config.corsOrigins.every((o) => typeof o === 'string')).toBe(true);
    });

    it('rateLimitMax is a positive integer', async () => {
      const { config } = await import('../config');
      expect(config.rateLimitMax).toBeGreaterThan(0);
    });

    it('rateLimitWindowMs is a positive integer', async () => {
      const { config } = await import('../config');
      expect(config.rateLimitWindowMs).toBeGreaterThan(0);
    });

    it('jsonBodyLimit is a non-empty string', async () => {
      const { config } = await import('../config');
      expect(typeof config.jsonBodyLimit).toBe('string');
      expect(config.jsonBodyLimit.length).toBeGreaterThan(0);
    });
  });

  describe('dynamic environment overrides', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('production mode sets isProduction = true', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('CORS_ORIGINS', '');
      const { config } = await import('../config');
      expect(config.nodeEnv).toBe('production');
      expect(config.isProduction).toBe(true);
    });

    it('production mode uses production CORS origins by default', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('CORS_ORIGINS', '');
      const { config } = await import('../config');
      expect(config.corsOrigins).toContain('https://nomad-lens.org');
    });

    it('development mode uses development CORS origins by default', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      vi.stubEnv('CORS_ORIGINS', '');
      const { config } = await import('../config');
      expect(config.corsOrigins).toContain('http://localhost:3001');
    });

    it('throws on invalid NODE_ENV', async () => {
      vi.stubEnv('NODE_ENV', 'invalid_env');
      await expect(import('../config')).rejects.toThrow('Invalid NODE_ENV');
    });

    it('reads custom PORT', async () => {
      vi.stubEnv('NODE_ENV', 'test');
      vi.stubEnv('PORT', '4000');
      const { config } = await import('../config');
      expect(config.port).toBe(4000);
    });

    it('throws on non-integer PORT', async () => {
      vi.stubEnv('NODE_ENV', 'test');
      vi.stubEnv('PORT', 'abc');
      await expect(import('../config')).rejects.toThrow('PORT must be a positive integer');
    });

    it('throws on non-positive PORT', async () => {
      vi.stubEnv('NODE_ENV', 'test');
      vi.stubEnv('PORT', '-1');
      await expect(import('../config')).rejects.toThrow('PORT must be a positive integer');
    });

    it('uses PORT fallback when PORT is empty string', async () => {
      vi.stubEnv('NODE_ENV', 'test');
      vi.stubEnv('PORT', '');
      const { config } = await import('../config');
      expect(config.port).toBe(3001);
    });

    it('reads custom CORS_ORIGINS', async () => {
      vi.stubEnv('NODE_ENV', 'test');
      vi.stubEnv('CORS_ORIGINS', 'https://a.example.com, https://b.example.com');
      const { config } = await import('../config');
      expect(config.corsOrigins).toEqual(['https://a.example.com', 'https://b.example.com']);
    });

    it('throws when CORS_ORIGINS is "*" in production', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('CORS_ORIGINS', '*');
      await expect(import('../config')).rejects.toThrow(
        'CORS_ORIGINS cannot include "*" in production',
      );
    });

    it('reads custom RATE_LIMIT_MAX', async () => {
      vi.stubEnv('NODE_ENV', 'test');
      vi.stubEnv('RATE_LIMIT_MAX', '100');
      const { config } = await import('../config');
      expect(config.rateLimitMax).toBe(100);
    });

    it('reads custom RATE_LIMIT_WINDOW_MS', async () => {
      vi.stubEnv('NODE_ENV', 'test');
      vi.stubEnv('RATE_LIMIT_WINDOW_MS', '30000');
      const { config } = await import('../config');
      expect(config.rateLimitWindowMs).toBe(30_000);
    });

    it('reads custom JSON_BODY_LIMIT', async () => {
      vi.stubEnv('NODE_ENV', 'test');
      vi.stubEnv('JSON_BODY_LIMIT', '50kb');
      const { config } = await import('../config');
      expect(config.jsonBodyLimit).toBe('50kb');
    });
  });
});

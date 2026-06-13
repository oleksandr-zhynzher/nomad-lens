import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { logger } from '../logger';

describe('logger', () => {
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function parseLog(spy: ReturnType<typeof vi.spyOn>): Record<string, unknown> {
    const firstCall = spy.mock.calls[0];
    const arg = firstCall?.[0];
    return JSON.parse(String(arg)) as Record<string, unknown>;
  }

  describe('info', () => {
    it('writes to console.log', () => {
      logger.info('hello world');
      expect(consoleSpy.log).toHaveBeenCalledOnce();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });

    it('encodes level as info', () => {
      logger.info('test');
      const payload = parseLog(consoleSpy.log);
      expect(payload['level']).toBe('info');
    });

    it('encodes the message', () => {
      logger.info('my message');
      const payload = parseLog(consoleSpy.log);
      expect(payload['message']).toBe('my message');
    });

    it('includes a timestamp', () => {
      logger.info('ts check');
      const payload = parseLog(consoleSpy.log);
      expect(typeof payload['timestamp']).toBe('string');
    });

    it('spreads context fields into payload', () => {
      logger.info('ctx', { userId: 42, action: 'login' });
      const payload = parseLog(consoleSpy.log);
      expect(payload['userId']).toBe(42);
      expect(payload['action']).toBe('login');
    });

    it('works without context', () => {
      expect(() => logger.info('bare')).not.toThrow();
    });
  });

  describe('warn', () => {
    it('writes to console.warn', () => {
      logger.warn('careful');
      expect(consoleSpy.warn).toHaveBeenCalledOnce();
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('encodes level as warn', () => {
      logger.warn('careful');
      const payload = parseLog(consoleSpy.warn);
      expect(payload['level']).toBe('warn');
    });

    it('spreads context into payload', () => {
      logger.warn('slow', { ms: 5000 });
      const payload = parseLog(consoleSpy.warn);
      expect(payload['ms']).toBe(5000);
    });
  });

  describe('error', () => {
    it('writes to console.error', () => {
      logger.error('boom');
      expect(consoleSpy.error).toHaveBeenCalledOnce();
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('encodes level as error', () => {
      logger.error('boom');
      const payload = parseLog(consoleSpy.error);
      expect(payload['level']).toBe('error');
    });

    it('serializes Error instances in context', () => {
      const err = new Error('something broke');
      logger.error('oops', { err });
      const payload = parseLog(consoleSpy.error);
      const serialized = payload['err'] as Record<string, unknown>;
      expect(serialized['message']).toBe('something broke');
      expect(serialized['name']).toBe('Error');
      expect(typeof serialized['stack']).toBe('string');
    });

    it('passes non-Error context values through', () => {
      logger.error('bad', { code: 500 });
      const payload = parseLog(consoleSpy.error);
      expect(payload['code']).toBe(500);
    });
  });
});

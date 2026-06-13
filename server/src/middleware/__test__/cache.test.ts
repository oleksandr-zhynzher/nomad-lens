import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MemoryCache } from '../cache';

describe('MemoryCache', () => {
  let cache: MemoryCache;

  beforeEach(() => {
    vi.useFakeTimers();
    cache = new MemoryCache(1); // 1-hour TTL
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('get / set', () => {
    it('returns undefined for a missing key', () => {
      expect(cache.get('missing')).toBeUndefined();
    });

    it('returns the stored value for an existing key', () => {
      cache.set('k', 42);
      expect(cache.get<number>('k')).toBe(42);
    });

    it('stores and retrieves objects', () => {
      const obj = { a: 1, b: [2, 3] };
      cache.set('obj', obj);
      expect(cache.get('obj')).toEqual(obj);
    });

    it('returns undefined after TTL expires', () => {
      cache.set('k', 'value');
      vi.advanceTimersByTime(60 * 60 * 1000 + 1); // just past 1 hour
      expect(cache.get('k')).toBeUndefined();
    });

    it('returns the value before TTL expires', () => {
      cache.set('k', 'value');
      vi.advanceTimersByTime(60 * 60 * 1000 - 1); // just before 1 hour
      expect(cache.get('k')).toBe('value');
    });

    it('overwrites an existing entry', () => {
      cache.set('k', 1);
      cache.set('k', 2);
      expect(cache.get<number>('k')).toBe(2);
    });
  });

  describe('has', () => {
    it('returns false for missing key', () => {
      expect(cache.has('missing')).toBe(false);
    });

    it('returns true for existing key', () => {
      cache.set('k', 'v');
      expect(cache.has('k')).toBe(true);
    });

    it('returns false after TTL expires', () => {
      cache.set('k', 'v');
      vi.advanceTimersByTime(60 * 60 * 1000 + 1);
      expect(cache.has('k')).toBe(false);
    });
  });

  describe('invalidate', () => {
    it('removes the specified key', () => {
      cache.set('k', 1);
      cache.invalidate('k');
      expect(cache.get('k')).toBeUndefined();
    });

    it('does not affect other keys', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.invalidate('a');
      expect(cache.get<number>('b')).toBe(2);
    });

    it('is a no-op for missing key', () => {
      expect(() => cache.invalidate('nonexistent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('removes all entries', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.clear();
      expect(cache.size()).toBe(0);
    });

    it('is a no-op on empty cache', () => {
      expect(() => cache.clear()).not.toThrow();
    });
  });

  describe('size', () => {
    it('returns 0 for empty cache', () => {
      expect(cache.size()).toBe(0);
    });

    it('increments as entries are added', () => {
      cache.set('a', 1);
      expect(cache.size()).toBe(1);
      cache.set('b', 2);
      expect(cache.size()).toBe(2);
    });

    it('decrements after invalidate', () => {
      cache.set('a', 1);
      cache.invalidate('a');
      expect(cache.size()).toBe(0);
    });

    it('counts expired entries (lazy deletion)', () => {
      // Expired entries remain in the underlying Map until accessed
      cache.set('k', 1);
      vi.advanceTimersByTime(60 * 60 * 1000 + 1);
      expect(cache.size()).toBe(1); // still in the map until get() is called
    });
  });

  describe('TTL edge cases', () => {
    it('0-hour TTL expires immediately', () => {
      const instant = new MemoryCache(0);
      instant.set('k', 'v');
      vi.advanceTimersByTime(1);
      expect(instant.get('k')).toBeUndefined();
    });

    it('default TTL is 24 hours', () => {
      const defaultCache = new MemoryCache();
      defaultCache.set('k', 'v');
      vi.advanceTimersByTime(24 * 60 * 60 * 1000 - 1); // just under 24 h
      expect(defaultCache.get('k')).toBe('v');
      vi.advanceTimersByTime(2);
      expect(defaultCache.get('k')).toBeUndefined();
    });
  });
});

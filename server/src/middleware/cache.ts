/**
 * Simple in-memory TTL cache.
 * Stores serialized data keyed by a string, expires after `ttlMs`.
 */
export class MemoryCache {
  private store = new Map<string, { data: unknown; expiresAt: number }>();
  private readonly ttlMs: number;

  constructor(ttlHours = 24) {
    this.ttlMs = ttlHours * 60 * 60 * 1000;
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T): void {
    this.store.set(key, { data, expiresAt: Date.now() + this.ttlMs });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}

/** Singleton shared across the Lambda warm instance */
export const cache = new MemoryCache(24);

import { describe, expect, it } from "vitest";

import type { JsonStorage } from "../src/core/utils";
import { readVersionedJson, writeVersionedJson } from "../src/core/utils";

function createMemoryStorage(initial: Record<string, string> = {}): JsonStorage {
  const entries = new Map(Object.entries(initial));

  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => {
      entries.set(key, value);
    },
    removeItem: (key) => {
      entries.delete(key);
    },
  };
}

describe("versioned JSON storage", () => {
  it("returns the fallback when a key is missing", () => {
    const value = readVersionedJson({
      key: "missing",
      version: 1,
      fallback: () => ({ count: 0 }),
      sanitize: () => ({ count: 1 }),
      storage: createMemoryStorage(),
    });

    expect(value).toEqual({ count: 0 });
  });

  it("reads current-version envelopes through the sanitizer", () => {
    const storage = createMemoryStorage({
      preferences: JSON.stringify({ version: 2, data: { count: 5 } }),
    });

    const value = readVersionedJson({
      key: "preferences",
      version: 2,
      fallback: () => ({ count: 0 }),
      sanitize: (input) => ({ count: (input as { count: number }).count }),
      storage,
    });

    expect(value).toEqual({ count: 5 });
  });

  it("migrates legacy unversioned data", () => {
    const storage = createMemoryStorage({
      preferences: JSON.stringify({ count: 9 }),
    });

    const value = readVersionedJson({
      key: "preferences",
      version: 1,
      fallback: () => ({ count: 0 }),
      sanitize: () => ({ count: 1 }),
      migrate: (input, version) => ({
        count: (input as { count: number }).count + version,
      }),
      storage,
    });

    expect(value).toEqual({ count: 9 });
  });

  it("writes versioned envelopes", () => {
    const storage = createMemoryStorage();

    writeVersionedJson("preferences", 3, { count: 7 }, storage);

    const value = readVersionedJson({
      key: "preferences",
      version: 3,
      fallback: () => ({ count: 0 }),
      sanitize: (input) => input as { count: number },
      storage,
    });
    expect(value).toEqual({ count: 7 });
  });
});

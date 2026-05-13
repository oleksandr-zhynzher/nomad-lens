export interface JsonStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface VersionedEnvelope {
  version: number;
  data: unknown;
}

interface VersionedStorageOptions<T> {
  key: string;
  version: number;
  fallback: () => T;
  sanitize: (value: unknown) => T;
  migrate?: (value: unknown, fromVersion: number) => T;
  storage?: JsonStorage;
}

function getDefaultStorage(): JsonStorage | undefined {
  if (globalThis.window == null) return undefined;
  return globalThis.localStorage;
}

function isVersionedEnvelope(value: unknown): value is VersionedEnvelope {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as VersionedEnvelope).version === "number" &&
    "data" in value
  );
}

export function readVersionedJson<T>({
  key,
  version,
  fallback,
  sanitize,
  migrate,
  storage = getDefaultStorage(),
}: VersionedStorageOptions<T>): T {
  if (!storage) return fallback();

  try {
    const raw = storage.getItem(key);
    if (!raw) return fallback();

    const parsed = JSON.parse(raw) as unknown;
    if (!isVersionedEnvelope(parsed)) {
      return migrate ? migrate(parsed, 0) : sanitize(parsed);
    }

    if (parsed.version === version) {
      return sanitize(parsed.data);
    }

    return migrate ? migrate(parsed.data, parsed.version) : fallback();
  } catch (error) {
    console.warn(`Failed to read stored JSON for ${key}`, error);
    return fallback();
  }
}

export function writeVersionedJson<T>(
  key: string,
  version: number,
  data: T,
  storage: JsonStorage | undefined = getDefaultStorage(),
) {
  if (!storage) return;

  storage.setItem(
    key,
    JSON.stringify({
      version,
      data,
    }),
  );
}

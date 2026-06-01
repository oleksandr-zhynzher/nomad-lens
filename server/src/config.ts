const PRODUCTION_CORS_ORIGINS: string[] = ['https://nomad-lens.org', 'https://www.nomad-lens.org'];
const DEVELOPMENT_CORS_ORIGINS: string[] = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
];

type NodeEnvironment = 'development' | 'production' | 'test';

export interface ServerConfig {
  readonly corsOrigins: string[];
  readonly isProduction: boolean;
  readonly jsonBodyLimit: string;
  readonly nodeEnv: NodeEnvironment;
  readonly port: number;
  readonly rateLimitMax: number;
  readonly rateLimitWindowMs: number;
}

function readNodeEnvironment(): NodeEnvironment {
  const value = process.env['NODE_ENV'] ?? 'development';
  if (value === 'development' || value === 'production' || value === 'test') {
    return value;
  }
  throw new Error(`Invalid NODE_ENV "${value}". Expected development, production, or test.`);
}

function readPositiveInteger(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined) {
    return fallback;
  }

  const trimmed = raw.trim();
  if (trimmed === '') {
    return fallback;
  }

  const value = Number.parseInt(trimmed, 10);
  if (!Number.isInteger(value) || value <= 0 || String(value) !== trimmed) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return value;
}

function readCorsOrigins(nodeEnv: NodeEnvironment): string[] {
  const raw = process.env['CORS_ORIGINS'];
  if (raw === undefined) {
    return nodeEnv === 'production' ? PRODUCTION_CORS_ORIGINS : DEVELOPMENT_CORS_ORIGINS;
  }

  const trimmed = raw.trim();
  if (trimmed === '') {
    return nodeEnv === 'production' ? PRODUCTION_CORS_ORIGINS : DEVELOPMENT_CORS_ORIGINS;
  }

  const origins: string[] = [];
  for (const origin of trimmed.split(',')) {
    const normalizedOrigin = origin.trim();
    if (normalizedOrigin.length > 0) {
      origins.push(normalizedOrigin);
    }
  }

  if (origins.length === 0) {
    throw new Error('CORS_ORIGINS must contain at least one origin when provided.');
  }

  const originSet = new Set(origins);
  if (nodeEnv === 'production' && originSet.has('*')) {
    throw new Error('CORS_ORIGINS cannot include "*" in production.');
  }

  return origins;
}

const nodeEnv = readNodeEnvironment();

export const config: ServerConfig = {
  corsOrigins: readCorsOrigins(nodeEnv),
  isProduction: nodeEnv === 'production',
  jsonBodyLimit: process.env['JSON_BODY_LIMIT'] ?? '100kb',
  nodeEnv,
  port: readPositiveInteger('PORT', 3001),
  rateLimitMax: readPositiveInteger('RATE_LIMIT_MAX', 300),
  rateLimitWindowMs: readPositiveInteger('RATE_LIMIT_WINDOW_MS', 60_000),
};

const PRODUCTION_CORS_ORIGINS = ['https://nomad-lens.org', 'https://www.nomad-lens.org'];
const DEVELOPMENT_CORS_ORIGINS = [
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
  if (raw === undefined || raw.trim() === '') {
    return fallback;
  }

  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value <= 0 || String(value) !== raw.trim()) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return value;
}

function readCorsOrigins(nodeEnv: NodeEnvironment): string[] {
  const raw = process.env['CORS_ORIGINS'];
  if (raw === undefined || raw.trim() === '') {
    return nodeEnv === 'production' ? PRODUCTION_CORS_ORIGINS : DEVELOPMENT_CORS_ORIGINS;
  }

  const origins = raw
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  if (origins.length === 0) {
    throw new Error('CORS_ORIGINS must contain at least one origin when provided.');
  }

  if (nodeEnv === 'production' && origins.includes('*')) {
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

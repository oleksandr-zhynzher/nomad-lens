import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandlers';
import { requestContext } from './middleware/requestContext';
import { requestLogger } from './middleware/requestLogger';
import { countriesRouter } from './routes/countries';
import { healthRouter } from './routes/health';
import { getCountriesDataStatus } from './services/countriesData';

export const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

const corsOriginSet = new Set<string>(config.corsOrigins);

const isCorsOriginAllowed = (origin: string | undefined): boolean => {
  if (origin === undefined) {
    return true;
  }

  return corsOriginSet.has(origin);
};

const corsOptions: cors.CorsOptions = {
  allowedHeaders: ['Authorization', 'Content-Type', 'X-Request-Id'],
  credentials: false,
  exposedHeaders: ['X-Request-Id'],
  maxAge: 86_400,
  methods: ['GET', 'OPTIONS'],
  origin(origin, callback) {
    callback(null, isCorsOriginAllowed(origin));
  },
};

const apiRateLimiter = rateLimit({
  handler: (_req, res) => {
    res.status(429).json({ error: 'Too many requests' });
  },
  legacyHeaders: false,
  limit: config.rateLimitMax,
  standardHeaders: 'draft-8',
  windowMs: config.rateLimitWindowMs,
});

app.use(requestContext);
app.use(requestLogger);
app.use(helmet());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: config.jsonBodyLimit }));

app.get('/api/livez', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
  });
});

app.get('/api/readyz', (_req, res) => {
  const countries = getCountriesDataStatus();
  res.status(countries.loaded ? 200 : 503).json({
    checks: {
      countries,
    },
    status: countries.loaded ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/meta', (_req, res) => {
  res.json({
    environment: config.nodeEnv,
    name: 'nomad-lens',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', apiRateLimiter);
app.use('/api/countries', countriesRouter);
app.use('/api/health', healthRouter);

app.use(notFoundHandler);
app.use(errorHandler);

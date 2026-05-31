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

export const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

const isCorsOriginAllowed = (origin: string | undefined): boolean => {
  if (origin === undefined) {
    return true;
  }

  return config.corsOrigins.includes(origin);
};

const corsOptions: cors.CorsOptions = {
  allowedHeaders: ['Authorization', 'Content-Type', 'X-Request-Id'],
  credentials: false,
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
app.use('/api', apiRateLimiter);

app.use('/api/countries', countriesRouter);
app.use('/api/health', healthRouter);

app.use(notFoundHandler);
app.use(errorHandler);

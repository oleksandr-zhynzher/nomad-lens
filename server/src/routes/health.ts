import { Router } from 'express';

import { config } from '../config';
import { getCountriesDataStatus } from '../services/countriesData';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  const countries = getCountriesDataStatus();

  res.json({
    apis: {
      countries: countries.loaded,
    },
    data: {
      countries,
    },
    environment: config.nodeEnv,
    status: countries.loaded ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
  });
});

import express from 'express';
import cors from 'cors';
import { countriesRouter } from './routes/countries';
import { healthRouter } from './routes/health';

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/countries', countriesRouter);
app.use('/api/health', healthRouter);

// Generic error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ error: err.message ?? 'Internal server error' });
  },
);

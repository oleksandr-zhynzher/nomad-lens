import { Router } from 'express';

import { getCountriesData } from '../services/countriesData';

export const countriesRouter = Router();

countriesRouter.get('/', (_req, res) => {
  res.json(getCountriesData());
});

import * as fs from 'node:fs';
import path from 'node:path';

import { Router } from 'express';

export const countriesRouter = Router();

const dataPath = path.join(__dirname, '..', 'data', 'countries.json');
const countriesData = JSON.parse(fs.readFileSync(dataPath, 'utf8')) as unknown;

countriesRouter.get('/', (_req, res) => {
  res.json(countriesData);
});

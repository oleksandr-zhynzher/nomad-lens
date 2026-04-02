import { Router } from 'express';
import * as fs from 'fs';
import * as path from 'path';

export const countriesRouter = Router();

const dataPath = path.join(__dirname, '..', 'data', 'countries.json');
const countriesData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

countriesRouter.get('/', (_req, res) => {
  res.json(countriesData);
});

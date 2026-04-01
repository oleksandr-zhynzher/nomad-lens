import { Router } from 'express';
import type { CountryData, ClimateData, RestCountry } from '../utils/types';
import { cache } from '../middleware/cache';
import { fetchRestCountries } from '../services/restCountries';
import { fetchWorldBankIndicators } from '../services/worldBank';
import { fetchWhoLifeExpectancy } from '../services/whoGho';
import { fetchClimate } from '../services/openMeteo';
import { buildCountryData } from '../services/buildCountryData';

const CACHE_KEY = 'countries:all';

export const countriesRouter = Router();

countriesRouter.get('/', async (_req, res, next) => {
  try {
    const cached = cache.get<CountryData[]>(CACHE_KEY);
    if (cached) return res.json(cached);

    const [countries, wbData, whoData] = await Promise.all([
      fetchRestCountries(),
      fetchWorldBankIndicators(),
      fetchWhoLifeExpectancy(),
    ]);

    // Fetch climate for all capitals in parallel
    const climateMap = new Map<string, ClimateData>();
    await Promise.all(
      countries.map(async (c) => {
        const latLng = c.capitalInfo?.latlng ?? c.latlng;
        if (!latLng) return;
        const result = await fetchClimate(latLng[0], latLng[1]).catch(() => null);
        if (result) climateMap.set(c.cca2.toUpperCase(), result);
      }),
    );

    const data = buildCountryData({ countries, wbData, whoData, climateMap });

    cache.set(CACHE_KEY, data);
    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

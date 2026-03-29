import { Router } from 'express';
import type { CountryData, CategoryScore, RestCountry } from '../utils/types';
import { cache } from '../middleware/cache';
import { fetchRestCountries } from '../services/restCountries';
import { fetchWorldBankIndicators, WB_INDICATORS } from '../services/worldBank';
import { fetchWhoLifeExpectancy } from '../services/whoGho';
import { fetchClimate } from '../services/openMeteo';
import { localData } from '../services/localData';
import {
  minMax,
  logMinMax,
  invertMinMax,
  average,
  climateScore,
} from '../utils/normalize';

const CACHE_KEY = 'countries:all';

export const countriesRouter = Router();

function ind(value: number, unit: string, year: number) {
  return { raw: value, unit, year };
}

countriesRouter.get('/', async (_req, res, next) => {
  try {
    const cached = cache.get<CountryData[]>(CACHE_KEY);
    if (cached) return res.json(cached);

    const [countries, wbData, whoData] = await Promise.all([
      fetchRestCountries(),
      fetchWorldBankIndicators(),
      fetchWhoLifeExpectancy(),
    ]);

    // Build ISO3 → ISO2 mapping
    const iso3ToIso2 = new Map<string, string>();
    for (const c of countries as (RestCountry & { cca3?: string })[]) {
      if (c.cca3 && c.cca2) iso3ToIso2.set(c.cca3.toUpperCase(), c.cca2.toUpperCase());
    }

    // Fetch climate for all capitals in parallel
    const climateMap = new Map<string, { annualMeanTemp: number; annualPrecipitation: number }>();
    await Promise.all(
      countries.map(async (c) => {
        const latLng = c.capitalInfo?.latlng ?? c.latlng;
        if (!latLng) return;
        const result = await fetchClimate(latLng[0], latLng[1]).catch(() => null);
        if (result) climateMap.set(c.cca2.toUpperCase(), result);
      }),
    );

    const data: CountryData[] = [];

    for (const rc of countries as (RestCountry & { cca3?: string })[]) {
      const iso2 = rc.cca2?.toUpperCase();
      if (!iso2) continue;

      const iso3 = rc.cca3?.toUpperCase();
      const wb = iso3 ? wbData[iso3] : undefined;

      // ── Economy ────────────────────────────────────────────────────────────
      const gdp = wb?.[WB_INDICATORS.gdpPerCapita];
      const unemp = wb?.[WB_INDICATORS.unemployment];
      const gini = wb?.[WB_INDICATORS.gini];

      const economy: CategoryScore = {
        value: average([
          logMinMax(gdp?.value ?? null, 500, 80_000),
          invertMinMax(unemp?.value ?? null, 0, 30),
          invertMinMax(gini?.value ?? null, 20, 65),
        ]),
        indicators: {
          ...(gdp?.value != null ? { gdpPerCapita: ind(gdp.value, 'USD', gdp.year) } : {}),
          ...(unemp?.value != null ? { unemployment: ind(unemp.value, '%', unemp.year) } : {}),
          ...(gini?.value != null ? { gini: ind(gini.value, 'index', gini.year) } : {}),
        },
      };

      // ── Affordability ──────────────────────────────────────────────────────
      const gdpPpp = wb?.[WB_INDICATORS.gdpPerCapitaPPP];

      const affordability: CategoryScore = {
        value: invertMinMax(gdpPpp?.value ?? null, 1_000, 100_000),
        indicators: {
          ...(gdpPpp?.value != null ? { gdpPerCapitaPPP: ind(gdpPpp.value, 'PPP $', gdpPpp.year) } : {}),
        },
      };

      // ── Food Security ────────────────────────────────────────────────────
      const undrnrsh = wb?.[WB_INDICATORS.undernourishment];

      const foodSecurity: CategoryScore = {
        value: invertMinMax(undrnrsh?.value ?? null, 0, 55),
        indicators: {
          ...(undrnrsh?.value != null ? { undernourishment: ind(undrnrsh.value, '%', undrnrsh.year) } : {}),
        },
      };

      // ── Healthcare ─────────────────────────────────────────────────────────
      const beds = wb?.[WB_INDICATORS.hospitalBeds];
      const phys = wb?.[WB_INDICATORS.physicians];
      const whoLifeExp = iso3 ? (whoData.get(iso3) ?? null) : null;
      const wbLifeExp = wb?.[WB_INDICATORS.lifeExpectancy];
      const lifeExp = whoLifeExp ?? wbLifeExp?.value ?? null;
      const lifeExpYear = wbLifeExp?.year ?? new Date().getFullYear() - 2;

      const healthcare: CategoryScore = {
        value: average([
          minMax(lifeExp, 50, 85),
          minMax(beds?.value ?? null, 0, 10),
          minMax(phys?.value ?? null, 0, 7),
        ]),
        indicators: {
          ...(lifeExp != null ? { lifeExpectancy: ind(lifeExp, 'years', lifeExpYear) } : {}),
          ...(beds?.value != null ? { hospitalBeds: ind(beds.value, 'per 1k', beds.year) } : {}),
          ...(phys?.value != null ? { physicians: ind(phys.value, 'per 1k', phys.year) } : {}),
        },
      };

      // ── Education ──────────────────────────────────────────────────────────
      const lit = wb?.[WB_INDICATORS.literacy];
      const enroll = wb?.[WB_INDICATORS.schoolEnrollment];

      const education: CategoryScore = {
        value: average([
          minMax(lit?.value ?? null, 40, 100),
          minMax(enroll?.value ?? null, 30, 100),
        ]),
        indicators: {
          ...(lit?.value != null ? { literacy: ind(lit.value, '%', lit.year) } : {}),
          ...(enroll?.value != null ? { schoolEnrollment: ind(enroll.value, '%', enroll.year) } : {}),
        },
      };

      // ── Environment ────────────────────────────────────────────────────────
      const pm25 = wb?.[WB_INDICATORS.pm25];

      const environment: CategoryScore = {
        value: invertMinMax(pm25?.value ?? null, 0, 100),
        indicators: {
          ...(pm25?.value != null ? { pm25: ind(pm25.value, 'μg/m³', pm25.year) } : {}),
        },
      };

      // ── Climate ────────────────────────────────────────────────────────────
      const clim = climateMap.get(iso2);
      const climVal = clim
        ? climateScore(clim.annualMeanTemp, clim.annualPrecipitation)
        : null;

      const climate: CategoryScore = {
        value: climVal,
        indicators: {
          ...(clim
            ? {
                annualMeanTemp: ind(Math.round(clim.annualMeanTemp * 10) / 10, '°C', 2023),
                annualPrecipitation: ind(Math.round(clim.annualPrecipitation), 'mm', 2023),
              }
            : {}),
        },
      };

      // ── Safety ─────────────────────────────────────────────────────────────
      const crime = localData.getCrime(iso2);
      const peace = localData.getPeace(iso2);

      const safety: CategoryScore = {
        value: average([
          invertMinMax(crime?.homicideRate ?? null, 0, 50),
          invertMinMax(peace?.score ?? null, 1, 4),
        ]),
        indicators: {
          ...(crime ? { homicideRate: ind(crime.homicideRate, 'per 100k', crime.year) } : {}),
          ...(peace ? { peaceIndex: ind(peace.score, 'index', peace.year) } : {}),
        },
      };

      // ── Infrastructure ─────────────────────────────────────────────────────
      const internet = wb?.[WB_INDICATORS.internetUsers];
      const elec = wb?.[WB_INDICATORS.electricityAccess];

      const infrastructure: CategoryScore = {
        value: average([
          minMax(internet?.value ?? null, 0, 100),
          minMax(elec?.value ?? null, 0, 100),
        ]),
        indicators: {
          ...(internet?.value != null ? { internetUsers: ind(internet.value, '%', internet.year) } : {}),
          ...(elec?.value != null ? { electricityAccess: ind(elec.value, '%', elec.year) } : {}),
        },
      };

      // ── Happiness ──────────────────────────────────────────────────────────
      const hap = localData.getHappiness(iso2);

      const happiness: CategoryScore = {
        value: minMax(hap?.score ?? null, 2, 8),
        indicators: {
          ...(hap ? { cantrilScore: ind(hap.score, 'score', hap.year) } : {}),
        },
      };

      // ── Human Development ──────────────────────────────────────────────────
      const hdi = localData.getHdi(iso2);

      const humanDevelopment: CategoryScore = {
        value: minMax(hdi?.hdi ?? null, 0.4, 1.0),
        indicators: {
          ...(hdi ? { hdi: ind(hdi.hdi, 'index', hdi.year) } : {}),
        },
      };

      // ── English Proficiency ─────────────────────────────────────────────────
      const epiEntry = localData.getEpi(iso2);

      const englishProficiency: CategoryScore = {
        value: minMax(epiEntry?.score ?? null, 390, 624),
        indicators: {
          ...(epiEntry ? { epiScore: ind(epiEntry.score, 'score', epiEntry.year) } : {}),
        },
      };

      // ── Governance ─────────────────────────────────────────────────────────
      const cpi = localData.getCpi(iso2);
      const corruption = wb?.[WB_INDICATORS.controlOfCorruption];
      const ruleLaw = wb?.[WB_INDICATORS.ruleOfLaw];
      const polStab = wb?.[WB_INDICATORS.politicalStability];
      const govEff = wb?.[WB_INDICATORS.govEffectiveness];
      const regQual = wb?.[WB_INDICATORS.regulatoryQuality];
      const voiceAcc = wb?.[WB_INDICATORS.voiceAccountability];

      const governance: CategoryScore = {
        value: average([
          minMax(corruption?.value ?? null, -2.5, 2.5),
          minMax(ruleLaw?.value ?? null, -2.5, 2.5),
          minMax(polStab?.value ?? null, -2.5, 2.5),
          minMax(govEff?.value ?? null, -2.5, 2.5),
          minMax(regQual?.value ?? null, -2.5, 2.5),
          minMax(voiceAcc?.value ?? null, -2.5, 2.5),
          minMax(cpi?.score ?? null, 0, 100),
        ]),
        indicators: {
          ...(corruption?.value != null ? { controlOfCorruption: ind(corruption.value, 'WGI', corruption.year) } : {}),
          ...(ruleLaw?.value != null ? { ruleOfLaw: ind(ruleLaw.value, 'WGI', ruleLaw.year) } : {}),
          ...(polStab?.value != null ? { politicalStability: ind(polStab.value, 'WGI', polStab.year) } : {}),
          ...(govEff?.value != null ? { govEffectiveness: ind(govEff.value, 'WGI', govEff.year) } : {}),
          ...(regQual?.value != null ? { regulatoryQuality: ind(regQual.value, 'WGI', regQual.year) } : {}),
          ...(voiceAcc?.value != null ? { voiceAccountability: ind(voiceAcc.value, 'WGI', voiceAcc.year) } : {}),
          ...(cpi ? { cpiScore: ind(cpi.score, 'score', cpi.year) } : {}),
        },
      };

      // Drop countries that have fewer than 3 non-null category scores
      const scores = {
        economy,
        affordability,
        foodSecurity,
        healthcare,
        education,
        environment,
        climate,
        safety,
        infrastructure,
        happiness,
        humanDevelopment,
        governance,
        englishProficiency,
      };
      const nonNull = Object.values(scores).filter((s) => s.value !== null).length;
      if (nonNull < 3) continue;

      data.push({
        code: iso2,
        name: rc.name.common,
        region: rc.region,
        population: rc.population,
        flagUrl: rc.flags.svg || rc.flags.png,
        capital: rc.capital?.[0] ?? '',
        lat: rc.capitalInfo?.latlng?.[0] ?? rc.latlng?.[0] ?? 0,
        lng: rc.capitalInfo?.latlng?.[1] ?? rc.latlng?.[1] ?? 0,
        scores,
      });
    }

    cache.set(CACHE_KEY, data);
    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

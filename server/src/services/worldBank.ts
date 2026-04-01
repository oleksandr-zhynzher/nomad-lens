import { cache } from '../middleware/cache';
import type { WorldBankIndicatorMap } from '../utils/types';

const CACHE_KEY = 'worldbank:indicators';

/** World Bank indicator codes fetched per request. */
export const WB_INDICATORS = {
  gdpPerCapita: 'NY.GDP.PCAP.CD',
  unemployment: 'SL.UEM.TOTL.ZS',
  gini: 'SI.POV.GINI',
  lifeExpectancy: 'SP.DYN.LE00.IN',
  hospitalBeds: 'SH.MED.BEDS.ZS',
  physicians: 'SH.MED.PHYS.ZS',
  literacy: 'SE.ADT.LITR.ZS',
  schoolEnrollment: 'SE.SEC.ENRR',
  tertiaryEnrollment: 'SE.TER.ENRR',
  pm25: 'EN.ATM.PM25.MC.M3',
  internetUsers: 'IT.NET.USER.ZS',
  electricityAccess: 'EG.ELC.ACCS.ZS',
  gdpPerCapitaPPP: 'NY.GDP.PCAP.PP.CD',
  undernourishment: 'SN.ITK.DEFC.ZS',
  broadband: 'IT.NET.BBND.P2',
  // ── Worldwide Governance Indicators (WGI) ─────────────────────────────────
  controlOfCorruption: 'CC.EST',
  ruleOfLaw: 'RL.EST',
  politicalStability: 'PV.EST',
  govEffectiveness: 'GE.EST',
  regulatoryQuality: 'RQ.EST',
  voiceAccountability: 'VA.EST',
  // ── New metrics ────────────────────────────────────────────────────────────
  logistics: 'LP.LPI.OVRL.XQ',
  protectedLand: 'ER.LND.PTLD.ZS',
  forestArea: 'AG.LND.FRST.ZS',
  taxRevenue: 'GC.TAX.TOTL.GD.ZS',
  airPassengers: 'IS.AIR.PSGR',
  healthExpendOOP: 'SH.XPD.OOPC.CH.ZS',
  tourismArrivals: 'ST.INT.ARVL',
} as const;

type IndicatorCode = (typeof WB_INDICATORS)[keyof typeof WB_INDICATORS];

interface WbDataPoint {
  countryiso3code: string;
  date: string;
  value: number | null;
}

async function fetchIndicator(code: IndicatorCode): Promise<WbDataPoint[]> {
  // mrv=5: fetch up to 5 most-recent years so sparse indicators (education,
  // climate proxies) still resolve to the most recently available non-null year.
  // per_page=2000 covers 250+ countries × 5 years in a single request.
  const url = `https://api.worldbank.org/v2/country/all/indicator/${code}?format=json&mrv=5&per_page=2000`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`World Bank ${code} returned ${res.status}`);

  const json = (await res.json()) as [unknown, WbDataPoint[] | null];
  return json[1] ?? [];
}

export async function fetchWorldBankIndicators(): Promise<WorldBankIndicatorMap> {
  const cached = cache.get<WorldBankIndicatorMap>(CACHE_KEY);
  if (cached) return cached;

  const codes = Object.values(WB_INDICATORS) as IndicatorCode[];
  const results = await Promise.allSettled(codes.map(fetchIndicator));

  const map: WorldBankIndicatorMap = {};

  for (let i = 0; i < codes.length; i += 1) {
    const code = codes[i];
    const result = results[i];
    if (result.status === 'rejected') {
      console.warn(`World Bank fetch failed for ${code}:`, result.reason);
      continue;
    }

    for (const point of result.value) {
      const iso3 = point.countryiso3code?.toUpperCase();
      if (!iso3 || point.value === null) continue;

      if (!map[iso3]) map[iso3] = {};
      // WB returns rows newest-first; only store the first (most recent) non-null
      // value per country+indicator — subsequent rows are older fallbacks.
      if (!map[iso3][code]) {
        map[iso3][code] = { value: point.value, year: parseInt(point.date, 10) };
      }
    }
  }

  cache.set(CACHE_KEY, map);
  return map;
}

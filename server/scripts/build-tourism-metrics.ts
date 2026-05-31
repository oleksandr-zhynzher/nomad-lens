/**
 * Reproducible builder for src/data/tourism-ai-metrics.json
 * ---------------------------------------------------------
 * Each output value is a 0–100 composite score for a tourism dimension.
 *
 * Philosophy
 * ----------
 * There is no single public dataset that assigns a 0–100 "nightlife" or
 * "photography" score to every country — those dimensions are inherently
 * expert/travel-consensus composites. What CAN be grounded in authoritative
 * data are four dimensions, which this script anchors to real 2025/26 sources:
 *
 *   - historicalSites      → UNESCO World Heritage Sites (src/data/culturalHeritage.json, 2025)
 *   - touristScamSafety    → Global Peace Index 2025 + UN intentional-homicide rate
 *                            (src/data/peace.json, src/data/crime.json)
 *   - streetFoodCuisine    → TasteAtlas World Food Awards 2025/26 ranking
 *   - beachWaterQuality    → Blue Flag 2026 programme (FEE) leaders
 *
 * IMPORTANT: the authoritative anchors are imperfect proxies for *tourist*
 * value (e.g. Egypt has only 7 UNESCO sites yet is a premier history
 * destination; the Maldives has ~no Blue Flags yet world-class water). So the
 * anchors are used to NUDGE/BOOST and to CORRECT clear errors — they are
 * deliberately not allowed to bulldoze sound expert nuance. The weighting of
 * each blend is documented inline below.
 *
 * The six remaining dimensions (nightlifeEntertainment, walkabilityScenicBeauty,
 * shoppingMarkets, photographySpots, familyFriendliness, adventureSports) are
 * carried over from the reviewed expert baseline, with explicit corrections
 * applied via the OVERRIDES table.
 *
 * Usage:  npx tsx scripts/build-tourism-metrics.ts
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const OUT_FILE = path.join(DATA_DIR, 'tourism-ai-metrics.json');

interface TourismEntry {
  code: string;
  nightlifeEntertainment: number;
  touristScamSafety: number;
  streetFoodCuisine: number;
  beachWaterQuality: number | null;
  walkabilityScenicBeauty: number;
  shoppingMarkets: number;
  photographySpots: number;
  familyFriendliness: number;
  adventureSports: number;
  historicalSites: number;
}

const METRIC_KEYS: (keyof Omit<TourismEntry, 'code'>)[] = [
  'nightlifeEntertainment',
  'touristScamSafety',
  'streetFoodCuisine',
  'beachWaterQuality',
  'walkabilityScenicBeauty',
  'shoppingMarkets',
  'photographySpots',
  'familyFriendliness',
  'adventureSports',
  'historicalSites',
];

function readData<T>(file: string): T[] {
  const raw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8')) as { data: T[] };
  return raw.data;
}

const existing = readData<TourismEntry>('tourism-ai-metrics.json');
const heritage = readData<{ code: string; sites: number }>('culturalHeritage.json');
const peace = readData<{ code: string; score: number }>('peace.json');
const crime = readData<{ code: string; homicideRate: number }>('crime.json');

const whsByCode = new Map(heritage.map((e) => [e.code.toUpperCase(), e.sites]));
const peaceByCode = new Map(peace.map((e) => [e.code.toUpperCase(), e.score]));
const homicideByCode = new Map(crime.map((e) => [e.code.toUpperCase(), e.homicideRate]));

// ── helpers ──────────────────────────────────────────────────────────────
const clamp = (n: number) => Math.max(0, Math.min(100, n));
const r = (n: number) => Math.round(clamp(n));

// Global Peace Index score (≈1.0 best … ≈3.45 worst) → 0..100 (higher = safer)
const peaceComp = (g: number) => clamp(((2.75 - g) / (2.75 - 1.0)) * 100);
// UN intentional-homicide rate per 100k → 0..100 (higher = safer). Log curve so
// the very-violent tail (Jamaica ~53, Lesotho ~44) is separated from the safe pack.
const homComp = (h: number) => clamp(100 - 24 * Math.log10(h + 1));
// UNESCO WHS count → 0..100 saturating curve (60 sites ≈ saturated).
const whsCurve = (s: number) => clamp(13.5 * Math.sqrt(s) + 6);

// ── streetFoodCuisine anchor: TasteAtlas World Food Awards 2025/26 ─────────
// Street-food-aware mapping of the TasteAtlas leaderboard to a 0..100 anchor.
// Source: tasteatlas.com/best/cuisines (2025/26) + World Food Awards 2025.
const TASTEATLAS: Record<string, number> = {
  GR: 96,
  IT: 96,
  MX: 95,
  JP: 95,
  TH: 95,
  IN: 94,
  CN: 93,
  VN: 92,
  TW: 92,
  ES: 92,
  TR: 92,
  FR: 92,
  SG: 92,
  PE: 91,
  HK: 90,
  KR: 90,
  PT: 90,
  MY: 88,
  ID: 88,
  MA: 84,
  LB: 85,
  GE: 82,
  US: 80,
  PL: 80,
  DE: 78,
  HU: 78,
  BR: 78,
  AR: 78,
  PH: 74,
  RO: 72,
  HR: 72,
  CO: 72,
  RS: 70,
  IR: 72,
  LK: 76,
  PK: 72,
  BD: 65,
  DZ: 60,
  EG: 66,
  IL: 76,
};

// ── beachWaterQuality anchor: Blue Flag 2026 programme leaders (FEE) ───────
// Blue Flag count is only a *boost* for the Mediterranean/clean-coast leaders;
// tropical destinations (Maldives, Seychelles, Caribbean) already score high in
// the expert baseline and barely participate in the programme, so we never
// lower them. Values below are minimum floors.
const BLUE_FLAG_FLOOR: Record<string, number> = {
  ES: 90,
  GR: 94,
  TR: 80,
  IT: 84,
  FR: 80,
  PT: 90,
  HR: 92,
  DK: 60,
  DE: 48,
  NL: 50,
};

// ── explicit corrections (highest priority) ───────────────────────────────
// Hard pins applied AFTER all formulas. Use sparingly and only where confident.
// Each pin sets the final value for that country/metric.
const OVERRIDES: Record<string, Partial<Record<keyof Omit<TourismEntry, 'code'>, number>>> = {
  // Iconic-heritage floors so the UNESCO boost never under-credits archaeology
  // heavyweights that have few sites but immense draw.
  EG: { historicalSites: 98 }, // Pyramids, Luxor, Valley of the Kings
  GR: { historicalSites: 98 },
  IT: { historicalSites: 98 },
  PE: { historicalSites: 95 }, // Machu Picchu
  JO: { historicalSites: 92 }, // Petra
  KH: { historicalSites: 90 }, // Angkor
  IR: { historicalSites: 92 },
  IQ: { historicalSites: 82 }, // Mesopotamia (Babylon, Ur)
  SY: { historicalSites: 86 }, // Palmyra, Damascus
  // Scam-reputation pins (peaceful but notorious for tourist scams/overcharging,
  // or the inverse) — keeps the GPI nudge from misreading petty-crime risk.
  JP: { touristScamSafety: 95 },
  SG: { touristScamSafety: 93 },
  CH: { touristScamSafety: 95 },
};

// ── build ─────────────────────────────────────────────────────────────────
const out: TourismEntry[] = existing.map((e) => {
  const code = e.code.toUpperCase();
  const next: TourismEntry = { ...e };

  // 1) touristScamSafety — 65% reviewed baseline + 35% violent-safety data.
  const g = peaceByCode.get(code);
  const h = homicideByCode.get(code);
  if (g !== undefined || h !== undefined) {
    const pc = g !== undefined ? peaceComp(g) : e.touristScamSafety;
    const hc = h !== undefined ? homComp(h) : e.touristScamSafety;
    const safetyData = 0.55 * pc + 0.45 * hc;
    next.touristScamSafety = r(0.65 * e.touristScamSafety + 0.35 * safetyData);
  }

  // 2) historicalSites — UNESCO-grounded BOOST only (never lowers a country
  //    below its reviewed value, because WHS count under-credits icons).
  const s = whsByCode.get(code);
  if (s !== undefined) {
    const boosted = 0.6 * e.historicalSites + 0.4 * whsCurve(s);
    next.historicalSites = r(Math.max(e.historicalSites, boosted));
  }

  // 3) streetFoodCuisine — 70% reviewed baseline + 30% TasteAtlas anchor.
  const ta = TASTEATLAS[code];
  if (ta !== undefined) {
    next.streetFoodCuisine = r(0.7 * e.streetFoodCuisine + 0.3 * ta);
  }

  // 4) beachWaterQuality — preserve null (landlocked); apply Blue Flag floor.
  if (e.beachWaterQuality !== null) {
    const floor = BLUE_FLAG_FLOOR[code];
    next.beachWaterQuality = r(
      floor !== undefined ? Math.max(e.beachWaterQuality, floor) : e.beachWaterQuality,
    );
  }

  // 5) explicit corrections win.
  const ov = OVERRIDES[code];
  if (ov) {
    for (const [k, v] of Object.entries(ov)) {
      if (k === 'beachWaterQuality' && next.beachWaterQuality === null) continue;
      (next as unknown as Record<string, number | null>)[k] = v;
    }
  }

  return next;
});

// ── serialize with a documented, sourced header ───────────────────────────
const header = {
  _source:
    'Composite 0–100 tourism scores. Authoritative anchors: UNESCO World Heritage List 2025 (historicalSites); Global Peace Index 2025 + UNODC intentional-homicide rate (touristScamSafety); TasteAtlas World Food Awards 2025/26 (streetFoodCuisine); Blue Flag 2026 / FEE (beachWaterQuality). Remaining dimensions are reviewed expert/travel-consensus composites.',
  _version: '2.0.0',
  _generatedDate: new Date().toISOString().slice(0, 10),
  _generator: 'scripts/build-tourism-metrics.ts',
  _note:
    'Each value is a 0–100 composite score. null = data unavailable or concept inapplicable (e.g. beach for landlocked). historicalSites is UNESCO-grounded but boosted for archaeological icons; touristScamSafety blends peace/crime data with petty-scam reputation; streetFoodCuisine blends the TasteAtlas leaderboard with street-food reputation; beachWaterQuality uses Blue Flag for the Mediterranean leaders while preserving tropical water-quality reputation.',
  _metrics: {
    nightlifeEntertainment: 'Bars, clubs, live music, festivals, cultural events quality',
    touristScamSafety: 'Safety from tourist scams, overcharging, fraud (higher = safer)',
    streetFoodCuisine: 'Quality & variety of street food, food markets, local cuisine reputation',
    beachWaterQuality:
      'Beach quality, water clarity, Blue Flag status. null for landlocked countries',
    walkabilityScenicBeauty: 'Pedestrian-friendly cities, scenic old towns, viewpoints, promenades',
    shoppingMarkets: 'Bazaars, malls, luxury outlets, local crafts, souvenir shopping',
    photographySpots: 'Iconic landmarks, photogenic landscapes, unique architecture',
    familyFriendliness: 'Kid-friendly attractions, theme parks, safety, family accommodation',
    adventureSports: 'Paragliding, bungee, surfing, rafting, zip-lines, trekking, diving',
    historicalSites:
      'Ruins, castles, ancient cities, UNESCO heritage density, archaeological richness',
  },
};

// Emit each data row on a single line for a compact, diff-friendly file.
const rows = out
  .map((e) => {
    const fields = [`"code": ${JSON.stringify(e.code)}`].concat(
      METRIC_KEYS.map((k) => `"${k}": ${e[k] === null ? 'null' : e[k]}`),
    );
    return `    { ${fields.join(', ')} }`;
  })
  .join(',\n');

const headerStr = JSON.stringify(header, null, 2);
const json = headerStr.replace(/\n}\s*$/, `,\n  "data": [\n${rows}\n  ]\n}\n`);

fs.writeFileSync(OUT_FILE, json, 'utf8');
console.log(`✓ Wrote ${out.length} countries to ${path.relative(process.cwd(), OUT_FILE)}`);

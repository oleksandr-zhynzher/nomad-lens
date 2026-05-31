/**
 * Re-anchor the `visaFriendliness` AI metric to authoritative in-repo data.
 *
 * The metric (see ai-metrics-config.json) is a composite of 5 sub-indicators:
 *   touristVisaLength (0.25)  ← visas.json (hard)
 *   visaRunEase       (0.15)  ← soft / judgment
 *   eVisaAvailability (0.15)  ← soft / judgment
 *   nomadVisaProgram  (0.25)  ← nomadVisa.json + nomadVisaDetails.json (hard)
 *   pathToResidency   (0.20)  ← soft / judgment
 *
 * We can source the two hard sub-indicators (0.50 of the score) directly. The
 * soft 0.50 is retained from the existing AI score (best available proxy for
 * visa-run / e-visa / residency nuance). For countries without a dedicated
 * nomad visa, the program slot keeps the existing judgment instead of being
 * forced to 0 — that avoids unfairly punishing genuinely visa-easy countries
 * (e.g. MX: 180-day tourist + easy residency) that simply lack a "nomad visa".
 *
 *   new = 0.25*touristScore + 0.25*programScore + 0.50*existingScore
 *   programScore = quality(60–95) if a nomad visa exists, else existingScore
 *
 * Cayman (KY) lost its program in the data refresh, so it receives no program
 * credit automatically. Only `visaFriendliness` is modified; all other metrics
 * are left untouched. North Korea (null) is skipped.
 *
 * Usage: npx tsx scripts/recalibrate-visa-friendliness.ts
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const DATA = path.join(__dirname, '..', 'src', 'data');
const METRICS_FILE = path.join(DATA, 'ai-metrics.json');

/* eslint-disable @typescript-eslint/no-explicit-any */
const metrics: any = JSON.parse(fs.readFileSync(path.join(DATA, 'ai-metrics.json'), 'utf8'));
const visas: any = JSON.parse(fs.readFileSync(path.join(DATA, 'visas.json'), 'utf8'));
const visaList: string[] = JSON.parse(
  fs.readFileSync(path.join(DATA, 'nomadVisa.json'), 'utf8'),
).countries;
const details: any[] = JSON.parse(
  fs.readFileSync(path.join(DATA, 'nomadVisaDetails.json'), 'utf8'),
);

const detailByCode = Object.fromEntries(details.map((d) => [d.code, d]));
const hasProgram = new Set(visaList);
const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

// Tourist-visa length (days, for a strong US/EU passport) → 0–100 sub-score.
function touristScore(days: number | null | undefined): number | null {
  if (days === undefined) return null; // not in dataset → caller falls back
  if (days === null) return 15; // visa required / no visa-free access
  if (days <= 15) return 35;
  if (days <= 30) return 50;
  if (days <= 45) return 60;
  if (days <= 60) return 68;
  if (days <= 90) return 80;
  if (days <= 120) return 88;
  if (days <= 180) return 95;
  return 100; // 365-day (e.g. Georgia)
}

// Quality (60–95) of an existing dedicated nomad-visa program.
function programQuality(code: string): number {
  const d = detailByCode[code];
  if (!d) return 75;
  let q = 70;
  const total = (d.duration?.initial ?? 0) + (d.duration?.maxExtension ?? 0);
  if (total >= 48) q += 12;
  else if (total >= 36) q += 10;
  else if (total >= 24) q += 6;
  else q += 2;
  const noIncomeMin = d.incomeRequirement?.monthly == null && d.incomeRequirement?.annual == null;
  q += noIncomeMin ? 8 : 3; // lower barrier = friendlier
  if (d.duration?.renewable) q += 4;
  return clamp(q, 60, 95);
}

const changes: Array<{ code: string; from: number; to: number }> = [];
for (const e of metrics.data) {
  const existing = e.visaFriendliness;
  if (existing === null) continue; // KP — leave null

  const t = touristScore(visas.touristVisaDays[e.code]);
  const T = t ?? existing; // fall back to existing if no tourist data
  const P = hasProgram.has(e.code) ? programQuality(e.code) : existing;

  const next = clamp(Math.round(0.25 * T + 0.25 * P + 0.5 * existing));
  if (next !== existing) changes.push({ code: e.code, from: existing, to: next });
  e.visaFriendliness = next;
}

metrics._visaFriendlinessRecalibrated =
  '2026-05-31 — visaFriendliness re-anchored to visas.json (tourist-visa length) + nomadVisa.json/nomadVisaDetails.json (program presence & quality) via scripts/recalibrate-visa-friendliness.ts. Soft sub-indicators (visa-run, e-visa, residency) retained from prior AI scores. Other metrics unchanged.';

fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2) + '\n', 'utf8');

changes.sort((a, b) => Math.abs(b.to - b.from) - Math.abs(a.to - a.from));
console.log(`✓ visaFriendliness updated for ${changes.length} countries`);
console.log('Biggest movers:');
for (const c of changes.slice(0, 18))
  console.log(
    `  ${c.code}: ${c.from} → ${c.to} (${c.to - c.from >= 0 ? '+' : ''}${c.to - c.from})`,
  );

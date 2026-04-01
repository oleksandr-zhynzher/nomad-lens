/**
 * generate-data.ts
 *
 * Fetches all external data sources (World Bank, REST Countries, WHO, Open-Meteo)
 * plus local JSON datasets, scores every country, and writes:
 *   1. client/src/data/countries.json  — full CountryData[] for inlining
 *   2. client/src/data/countries-110m.json — world-atlas TopoJSON for bundling
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

// Server modules (tsx handles CommonJS imports fine)
import { fetchRestCountries } from '../server/src/services/restCountries';
import { fetchWorldBankIndicators } from '../server/src/services/worldBank';
import { fetchWhoLifeExpectancy } from '../server/src/services/whoGho';
import { fetchClimate } from '../server/src/services/openMeteo';
import { buildCountryData } from '../server/src/services/buildCountryData';
import type { ClimateData } from '../server/src/utils/types';

const DATA_DIR = resolve(__dirname, '../client/src/data');

async function downloadWorldAtlas(): Promise<void> {
  const url = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
  console.log('⬇  Downloading world-atlas countries-110m.json …');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download world-atlas: ${res.status}`);
  const json = await res.text();
  const outPath = resolve(DATA_DIR, 'countries-110m.json');
  writeFileSync(outPath, json, 'utf-8');
  console.log(`✓  world-atlas saved (${(json.length / 1024).toFixed(0)} KB)`);
}

async function generateCountryData(): Promise<void> {
  console.log('🌍 Fetching REST Countries, World Bank, WHO …');
  const [countries, wbData, whoData] = await Promise.all([
    fetchRestCountries(),
    fetchWorldBankIndicators(),
    fetchWhoLifeExpectancy(),
  ]);

  console.log(`   ${countries.length} countries, ${Object.keys(wbData).length} WB entries, ${whoData.size} WHO entries`);

  console.log('🌤  Fetching climate data for capitals …');
  const climateMap = new Map<string, ClimateData>();
  // Process in batches of 5 with delay to respect Open-Meteo rate limits
  const BATCH = 5;
  const DELAY = 300;
  for (let i = 0; i < countries.length; i += BATCH) {
    const batch = countries.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (c) => {
        const latLng = c.capitalInfo?.latlng ?? c.latlng;
        if (!latLng) return;
        const result = await fetchClimate(latLng[0], latLng[1]).catch(() => null);
        if (result) climateMap.set(c.cca2.toUpperCase(), result);
      }),
    );
    if (i + BATCH < countries.length) {
      await new Promise((r) => setTimeout(r, DELAY));
    }
  }
  console.log(`   Climate data for ${climateMap.size} countries`);

  console.log('📊 Building country scores …');
  const data = buildCountryData({ countries, wbData, whoData, climateMap });

  const outPath = resolve(DATA_DIR, 'countries.json');
  const json = JSON.stringify(data);
  writeFileSync(outPath, json, 'utf-8');
  console.log(`✓  ${data.length} countries → countries.json (${(json.length / 1024).toFixed(0)} KB)`);
}

async function main(): Promise<void> {
  mkdirSync(DATA_DIR, { recursive: true });

  await Promise.all([
    downloadWorldAtlas(),
    generateCountryData(),
  ]);

  console.log('\n✅ Data generation complete');
}

main().catch((err) => {
  console.error('❌ Data generation failed:', err);
  process.exit(1);
});

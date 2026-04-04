/**
 * Generates country-name + capital-name translations (Ukrainian + Russian) using Wikidata SPARQL.
 * Output: server/src/data/countries-i18n.json
 *
 * Usage: npx tsx scripts/generate-countries-i18n.ts
 */

import * as fs from "fs";
import * as path from "path";

const SPARQL_URL = "https://query.wikidata.org/sparql";

// Query for country names in Ukrainian + Russian, and capital names
const QUERY = `
SELECT ?countryCode ?countryLabelEn ?countryLabelUk ?countryLabelRu
       ?capitalLabelEn ?capitalLabelUk ?capitalLabelRu
WHERE {
  ?country wdt:P31 wd:Q6256 ;          # instance of country
           wdt:P297 ?countryCode .      # ISO 3166-1 alpha-2
  ?country rdfs:label ?countryLabelEn . FILTER(LANG(?countryLabelEn) = "en")
  OPTIONAL { ?country rdfs:label ?countryLabelUk . FILTER(LANG(?countryLabelUk) = "uk") }
  OPTIONAL { ?country rdfs:label ?countryLabelRu . FILTER(LANG(?countryLabelRu) = "ru") }
  OPTIONAL {
    ?country wdt:P36 ?capital .
    ?capital rdfs:label ?capitalLabelEn . FILTER(LANG(?capitalLabelEn) = "en")
    OPTIONAL { ?capital rdfs:label ?capitalLabelUk . FILTER(LANG(?capitalLabelUk) = "uk") }
    OPTIONAL { ?capital rdfs:label ?capitalLabelRu . FILTER(LANG(?capitalLabelRu) = "ru") }
  }
}
ORDER BY ?countryCode
`;

interface SparqlResult {
  results: {
    bindings: Array<{
      countryCode: { value: string };
      countryLabelEn: { value: string };
      countryLabelUk?: { value: string };
      countryLabelRu?: { value: string };
      capitalLabelEn?: { value: string };
      capitalLabelUk?: { value: string };
      capitalLabelRu?: { value: string };
    }>;
  };
}

interface I18nEntry {
  name: { en: string; ua?: string; ru?: string };
  capital?: { en: string; ua?: string; ru?: string };
}

async function main() {
  console.log("⏳ Querying Wikidata for country + capital translations…");

  const res = await fetch(SPARQL_URL, {
    method: "POST",
    headers: {
      Accept: "application/sparql-results+json",
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "NomadLens/1.0 (i18n-generator)",
    },
    body: `query=${encodeURIComponent(QUERY)}`,
  });

  if (!res.ok) {
    throw new Error(`Wikidata SPARQL returned ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as SparqlResult;
  const map: Record<string, I18nEntry> = {};

  for (const b of data.results.bindings) {
    const code = b.countryCode.value.toUpperCase();
    // Take first result per country
    if (map[code]) continue;

    const entry: I18nEntry = {
      name: {
        en: b.countryLabelEn.value,
        ua: b.countryLabelUk?.value,
        ru: b.countryLabelRu?.value,
      },
    };

    if (b.capitalLabelEn?.value) {
      entry.capital = {
        en: b.capitalLabelEn.value,
        ua: b.capitalLabelUk?.value,
        ru: b.capitalLabelRu?.value,
      };
    }

    map[code] = entry;
  }

  const outPath = path.join(__dirname, "..", "server", "src", "data", "countries-i18n.json");
  fs.writeFileSync(outPath, JSON.stringify(map, null, 2) + "\n");
  console.log(`✅ Wrote ${Object.keys(map).length} country translations to ${path.relative(process.cwd(), outPath)}`);
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});

/**
 * Standalone script that fetches all external data, computes scores,
 * and writes the result to src/data/countries.json.
 *
 * Usage: npx tsx src/generate.ts
 */
import * as fs from "fs";
import * as path from "path";
import type {
  CountryData,
  CategoryScore,
  ClimateData,
  RestCountry,
} from "./utils/types";
import { fetchRestCountries } from "./services/restCountries";
import { fetchWorldBankIndicators, WB_INDICATORS } from "./services/worldBank";
import { fetchWhoLifeExpectancy } from "./services/whoGho";
import { fetchClimate } from "./services/openMeteo";
import { localData } from "./services/localData";
import {
  minMax,
  logMinMax,
  invertMinMax,
  invertLogMinMax,
  average,
  climateScore,
} from "./utils/normalize";
import {
  computeTourismTags,
  computeTourismTagScores,
  computeTourismTagSeasonality,
} from "./utils/tourismTags";

// Country name + capital translations (Ukrainian / Russian) from Wikidata
const countriesI18n: Record<
  string,
  {
    name: { en: string; ua?: string; ru?: string };
    capital?: { en: string; ua?: string; ru?: string };
  }
> = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "countries-i18n.json"), "utf-8"),
);

function ind(value: number, unit: string, year: number) {
  return { raw: value, unit, year };
}

function deriveRegion(region: string, subregion?: string): string {
  if (subregion === "Western Asia") return "Middle East";
  return region;
}

async function generate(): Promise<void> {
  console.log("⏳ Fetching external data…");

  const [countries, wbData, whoData] = await Promise.all([
    fetchRestCountries(),
    fetchWorldBankIndicators(),
    fetchWhoLifeExpectancy(),
  ]);

  console.log(`  ✔ REST Countries: ${countries.length} entries`);
  console.log(`  ✔ World Bank: ${Object.keys(wbData).length} countries`);
  console.log(`  ✔ WHO life expectancy: ${whoData.size} countries`);

  // Build ISO3 → ISO2 mapping
  const iso3ToIso2 = new Map<string, string>();
  for (const c of countries as (RestCountry & { cca3?: string })[]) {
    if (c.cca3 && c.cca2)
      iso3ToIso2.set(c.cca3.toUpperCase(), c.cca2.toUpperCase());
  }

  // Fetch climate for all capitals in batches
  const CLIMATE_BATCH = 3;
  const CLIMATE_DELAY = 1500;
  const climateMap = new Map<string, ClimateData>();
  console.log("⏳ Fetching climate data (batched)…");
  for (let i = 0; i < countries.length; i += CLIMATE_BATCH) {
    const batch = countries.slice(i, i + CLIMATE_BATCH);
    await Promise.all(
      batch.map(async (c) => {
        const latLng = c.latlng;
        if (!latLng) return;
        const result = await fetchClimate(latLng[0], latLng[1]).catch(
          () => null,
        );
        if (result) climateMap.set(c.cca2.toUpperCase(), result);
      }),
    );
    if (i + CLIMATE_BATCH < countries.length) {
      await new Promise((r) => setTimeout(r, CLIMATE_DELAY));
    }
    // Progress indicator every 30 countries
    if ((i + CLIMATE_BATCH) % 30 === 0) {
      process.stdout.write(
        `  … ${Math.min(i + CLIMATE_BATCH, countries.length)}/${countries.length}\n`,
      );
    }
  }
  console.log(`  ✔ Climate: ${climateMap.size} countries`);

  // ── Score every country ────────────────────────────────────────────────
  const data: CountryData[] = [];

  for (const rc of countries as (RestCountry & { cca3?: string })[]) {
    const iso2 = rc.cca2?.toUpperCase();
    if (!iso2) continue;

    const iso3 = rc.cca3?.toUpperCase();
    const wb = iso3 ? wbData[iso3] : undefined;

    // ── Economy ──────────────────────────────────────────────────────────
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
        ...(gdp?.value != null
          ? { gdpPerCapita: ind(gdp.value, "USD", gdp.year) }
          : {}),
        ...(unemp?.value != null
          ? { unemployment: ind(unemp.value, "%", unemp.year) }
          : {}),
        ...(gini?.value != null
          ? { gini: ind(gini.value, "index", gini.year) }
          : {}),
      },
    };

    // ── Affordability ────────────────────────────────────────────────────
    // Two complementary signals for how expensive a country is:
    //
    // 1. Price Level Ratio (PLR) = nominal GDP / PPP GDP.
    //    PLR < 1 → local prices below international average.
    //    PLR > 1 → local prices above international average.
    //    Scored 0-100: low PLR → high score (cheaper is better).
    //
    // 2. Nominal GDP per capita (log-inverted).
    //    High nominal GDP/capita strongly correlates with high consumer prices.
    //    Scored 0-100: low GDP → high score (cheaper is better).
    //
    // Final score: simple average of both (handles missing data gracefully).
    const gdpPpp = wb?.[WB_INDICATORS.gdpPerCapitaPPP];

    const plrRaw =
      gdp?.value != null && gdpPpp?.value != null && gdpPpp.value > 0
        ? gdp.value / gdpPpp.value
        : null;

    // PLR: 0.20 (ultra-cheap) → 100 … 1.50 (very expensive) → 0
    const plrScore = invertMinMax(plrRaw, 0.2, 1.5);

    // Nominal GDP/capita: $400 → 100 … $120 000 → 0 (log scale)
    const gdpCostScore = invertLogMinMax(gdp?.value ?? null, 400, 120_000);

    const affordScore = average([plrScore, gdpCostScore]);

    const affordability: CategoryScore = {
      value: affordScore,
      indicators: {
        ...(plrRaw != null
          ? {
              priceLevelRatio: ind(
                Math.round(plrRaw * 100) / 100,
                "vs intl avg",
                gdp!.year,
              ),
            }
          : {}),
        ...(gdpPpp?.value != null
          ? { gdpPerCapitaPPP: ind(gdpPpp.value, "PPP $", gdpPpp.year) }
          : {}),
        ...(gdp?.value != null
          ? { gdpPerCapita: ind(gdp.value, "USD", gdp.year) }
          : {}),
      },
    };

    // ── Food Security ────────────────────────────────────────────────────
    const undrnrsh = wb?.[WB_INDICATORS.undernourishment];

    const foodSecurity: CategoryScore = {
      value: invertMinMax(undrnrsh?.value ?? null, 0, 55),
      indicators: {
        ...(undrnrsh?.value != null
          ? { undernourishment: ind(undrnrsh.value, "%", undrnrsh.year) }
          : {}),
      },
    };

    // ── Healthcare ───────────────────────────────────────────────────────
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
        ...(lifeExp != null
          ? { lifeExpectancy: ind(lifeExp, "years", lifeExpYear) }
          : {}),
        ...(beds?.value != null
          ? { hospitalBeds: ind(beds.value, "per 1k", beds.year) }
          : {}),
        ...(phys?.value != null
          ? { physicians: ind(phys.value, "per 1k", phys.year) }
          : {}),
      },
    };

    // ── Education ────────────────────────────────────────────────────────
    const lit = wb?.[WB_INDICATORS.literacy];
    const enroll = wb?.[WB_INDICATORS.schoolEnrollment];
    const tertiary = wb?.[WB_INDICATORS.tertiaryEnrollment];

    const education: CategoryScore = {
      value: average([
        minMax(lit?.value ?? null, 40, 100),
        minMax(enroll?.value ?? null, 30, 120),
        minMax(tertiary?.value ?? null, 0, 100),
      ]),
      indicators: {
        ...(lit?.value != null
          ? { literacy: ind(lit.value, "%", lit.year) }
          : {}),
        ...(enroll?.value != null
          ? { secondaryEnrollment: ind(enroll.value, "%", enroll.year) }
          : {}),
        ...(tertiary?.value != null
          ? { tertiaryEnrollment: ind(tertiary.value, "%", tertiary.year) }
          : {}),
      },
    };

    // ── Environment ──────────────────────────────────────────────────────
    const pm25 = wb?.[WB_INDICATORS.pm25];

    const environment: CategoryScore = {
      value: invertMinMax(pm25?.value ?? null, 0, 100),
      indicators: {
        ...(pm25?.value != null
          ? { pm25: ind(pm25.value, "μg/m³", pm25.year) }
          : {}),
      },
    };

    // ── Climate ──────────────────────────────────────────────────────────
    const clim = climateMap.get(iso2);
    const climVal = clim
      ? climateScore(clim.annualMeanTemp, clim.annualPrecipitation)
      : null;

    const climate: CategoryScore = {
      value: climVal,
      indicators: {
        ...(clim
          ? {
              annualMeanTemp: ind(
                Math.round(clim.annualMeanTemp * 10) / 10,
                "°C",
                2023,
              ),
              annualPrecipitation: ind(
                Math.round(clim.annualPrecipitation),
                "mm",
                2023,
              ),
            }
          : {}),
      },
    };

    // ── Safety ───────────────────────────────────────────────────────────
    const crime = localData.getCrime(iso2);
    const peace = localData.getPeace(iso2);

    const safety: CategoryScore = {
      value: average([
        invertMinMax(crime?.homicideRate ?? null, 0, 50),
        invertMinMax(peace?.score ?? null, 1, 4),
      ]),
      indicators: {
        ...(crime
          ? { homicideRate: ind(crime.homicideRate, "per 100k", crime.year) }
          : {}),
        ...(peace ? { peaceIndex: ind(peace.score, "index", peace.year) } : {}),
      },
    };

    // ── Infrastructure ───────────────────────────────────────────────────
    const internet = wb?.[WB_INDICATORS.internetUsers];
    const elec = wb?.[WB_INDICATORS.electricityAccess];
    const bb = wb?.[WB_INDICATORS.broadband];

    const infrastructure: CategoryScore = {
      value: average([
        minMax(internet?.value ?? null, 0, 100),
        minMax(elec?.value ?? null, 0, 100),
        minMax(bb?.value ?? null, 0, 50),
      ]),
      indicators: {
        ...(internet?.value != null
          ? { internetUsers: ind(internet.value, "%", internet.year) }
          : {}),
        ...(elec?.value != null
          ? { electricityAccess: ind(elec.value, "%", elec.year) }
          : {}),
        ...(bb?.value != null
          ? { broadband: ind(bb.value, "subs/100", bb.year) }
          : {}),
      },
    };

    // ── Happiness ────────────────────────────────────────────────────────
    const hap = localData.getHappiness(iso2);

    const happiness: CategoryScore = {
      value: minMax(hap?.score ?? null, 2, 8),
      indicators: {
        ...(hap ? { cantrilScore: ind(hap.score, "score", hap.year) } : {}),
      },
    };

    // ── Human Development ────────────────────────────────────────────────
    const hdi = localData.getHdi(iso2);

    const humanDevelopment: CategoryScore = {
      value: minMax(hdi?.hdi ?? null, 0.4, 1.0),
      indicators: {
        ...(hdi ? { hdi: ind(hdi.hdi, "index", hdi.year) } : {}),
      },
    };

    // ── English Proficiency ──────────────────────────────────────────────
    const epiEntry = localData.getEpi(iso2);

    // Native English-speaking countries are excluded from the EPI survey.
    // We assign them a perfect score of 100 when no EPI data is available.
    const NATIVE_ENGLISH_ISO2 = new Set([
      "AU",
      "NZ",
      "GB",
      "IE",
      "US",
      "CA",
      "JM",
      "TT",
      "BB",
      "BZ",
      "GY",
      "AG",
      "BS",
      "DM",
      "GD",
      "KN",
      "LC",
      "VC",
      "SB",
      "PG",
      "FJ",
      "VU",
      "WS",
      "TO",
      "NR",
      "TV",
      "KI",
      "MH",
      "FM",
      "PW",
      "ZW",
      "SL",
      "NG",
      "GH",
      "KE",
      "UG",
      "TZ",
      "ZM",
      "MW",
      "BW",
      "LS",
      "SZ",
      "NA",
      "CM",
      "RW",
      "SS",
      "SD",
      "ET",
      "ER",
      "SO",
      "LR",
      "GM",
      "SL",
    ]);
    const isNativeEnglish = NATIVE_ENGLISH_ISO2.has(iso2);

    const englishProficiency: CategoryScore =
      isNativeEnglish && !epiEntry
        ? {
            value: 100,
            indicators: {
              nativeSpeaker: ind(100, "score", new Date().getFullYear()),
            },
          }
        : {
            value: minMax(epiEntry?.score ?? null, 390, 624),
            indicators: {
              ...(epiEntry
                ? { epiScore: ind(epiEntry.score, "score", epiEntry.year) }
                : {}),
            },
          };

    // ── Governance ───────────────────────────────────────────────────────
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
        ...(corruption?.value != null
          ? {
              controlOfCorruption: ind(
                corruption.value,
                "WGI",
                corruption.year,
              ),
            }
          : {}),
        ...(ruleLaw?.value != null
          ? { ruleOfLaw: ind(ruleLaw.value, "WGI", ruleLaw.year) }
          : {}),
        ...(polStab?.value != null
          ? { politicalStability: ind(polStab.value, "WGI", polStab.year) }
          : {}),
        ...(govEff?.value != null
          ? { govEffectiveness: ind(govEff.value, "WGI", govEff.year) }
          : {}),
        ...(regQual?.value != null
          ? { regulatoryQuality: ind(regQual.value, "WGI", regQual.year) }
          : {}),
        ...(voiceAcc?.value != null
          ? { voiceAccountability: ind(voiceAcc.value, "WGI", voiceAcc.year) }
          : {}),
        ...(cpi ? { cpiScore: ind(cpi.score, "score", cpi.year) } : {}),
      },
    };

    // ── Digital Freedom ──────────────────────────────────────────────────
    const digFree = localData.getDigitalFreedom(iso2);

    const digitalFreedom: CategoryScore = {
      value: minMax(digFree?.score ?? null, 0, 100),
      indicators: {
        ...(digFree
          ? { freedomOnNet: ind(digFree.score, "score", digFree.year) }
          : {}),
      },
    };

    // ── Personal Freedom ─────────────────────────────────────────────────
    const persFree = localData.getPersonalFreedom(iso2);

    const personalFreedom: CategoryScore = {
      value: minMax(persFree?.score ?? null, 0, 10),
      indicators: {
        ...(persFree
          ? { hfiPersonal: ind(persFree.score, "score", persFree.year) }
          : {}),
      },
    };

    // ── Logistics & Transport ────────────────────────────────────────────
    const lpi = wb?.[WB_INDICATORS.logistics];

    const logistics: CategoryScore = {
      value: minMax(lpi?.value ?? null, 1, 5),
      indicators: {
        ...(lpi?.value != null
          ? { lpiScore: ind(lpi.value, "score", lpi.year) }
          : {}),
      },
    };

    // ── Biodiversity & Nature ────────────────────────────────────────────
    const protLand = wb?.[WB_INDICATORS.protectedLand];
    const nbi = localData.getBiodiversity(iso2);

    const biodiversity: CategoryScore = {
      value: average([
        minMax(nbi?.nbi ?? null, 0, 1),
        minMax(protLand?.value ?? null, 0, 50),
      ]),
      indicators: {
        ...(nbi
          ? { nationalBiodiversityIndex: ind(nbi.nbi, "index", nbi.year) }
          : {}),
        ...(protLand?.value != null
          ? { protectedLand: ind(protLand.value, "%", protLand.year) }
          : {}),
      },
    };

    // ── Social Tolerance ─────────────────────────────────────────────────
    const socTol = localData.getSocialTolerance(iso2);

    const socialTolerance: CategoryScore = {
      value: minMax(socTol?.score ?? null, 0, 100),
      indicators: {
        ...(socTol
          ? { lgbtqRights: ind(socTol.score, "score", socTol.year) }
          : {}),
      },
    };

    // ── Tax Friendliness ─────────────────────────────────────────────────
    const taxRev = wb?.[WB_INDICATORS.taxRevenue];
    const taxBurden = localData.getTaxBurden(iso2);

    const taxFriendliness: CategoryScore = {
      value: average([
        invertMinMax(taxRev?.value ?? null, 0, 50),
        minMax(taxBurden?.score ?? null, 0, 100),
      ]),
      indicators: {
        ...(taxRev?.value != null
          ? { taxRevenueGDP: ind(taxRev.value, "% GDP", taxRev.year) }
          : {}),
        ...(taxBurden
          ? { taxBurdenScore: ind(taxBurden.score, "score", taxBurden.year) }
          : {}),
      },
    };

    // ── Startup / Business Environment ───────────────────────────────────
    const startup = localData.getStartup(iso2);

    const startupEnvironment: CategoryScore = {
      value: minMax(startup?.score ?? null, 0, 100),
      indicators: {
        ...(startup
          ? { businessFreedom: ind(startup.score, "score", startup.year) }
          : {}),
      },
    };

    // ── Air Connectivity ─────────────────────────────────────────────────
    const airPax = wb?.[WB_INDICATORS.airPassengers];
    const airport = localData.getAirport(iso2);

    const airConnectivity: CategoryScore = {
      value: average([
        logMinMax(airPax?.value ?? null, 100_000, 200_000_000),
        logMinMax(airport?.destinationCountries ?? null, 5, 110),
      ]),
      indicators: {
        ...(airPax?.value != null
          ? { airPassengers: ind(airPax.value, "passengers", airPax.year) }
          : {}),
        ...(airport
          ? {
              destinationCountries: ind(
                airport.destinationCountries,
                "countries",
                airport.year,
              ),
            }
          : {}),
      },
    };

    // ── Cultural Heritage & Tourism ──────────────────────────────────────
    const heritage = localData.getHeritage(iso2);
    const intangible = localData.getIntangibleHeritage(iso2);
    const tourismArr = wb?.[WB_INDICATORS.tourismArrivals];

    const culturalHeritage: CategoryScore = {
      value: average([
        logMinMax(heritage?.sites ?? null, 1, 60),
        logMinMax(intangible?.elements ?? null, 1, 45),
        logMinMax(tourismArr?.value ?? null, 50_000, 100_000_000),
      ]),
      indicators: {
        ...(heritage
          ? { worldHeritageSites: ind(heritage.sites, "sites", heritage.year) }
          : {}),
        ...(intangible
          ? {
              intangibleHeritage: ind(
                intangible.elements,
                "elements",
                intangible.year,
              ),
            }
          : {}),
        ...(tourismArr?.value != null
          ? {
              tourismArrivals: ind(
                tourismArr.value,
                "arrivals",
                tourismArr.year,
              ),
            }
          : {}),
      },
    };

    // ── Cost of Healthcare ───────────────────────────────────────────────
    const oopExp = wb?.[WB_INDICATORS.healthExpendOOP];

    const healthcareCost: CategoryScore = {
      value: invertMinMax(oopExp?.value ?? null, 0, 80),
      indicators: {
        ...(oopExp?.value != null
          ? {
              outOfPocketExpend: ind(oopExp.value, "% health exp", oopExp.year),
            }
          : {}),
      },
    };

    // ── Tourism Safety ───────────────────────────────────────────────────
    // Reuses crime/peace (from safety) and polStab (from governance).
    const tourismSafety: CategoryScore = {
      value: average([
        invertMinMax(crime?.homicideRate ?? null, 0.5, 50),
        invertMinMax(peace?.score ?? null, 1, 3.5),
        minMax(polStab?.value ?? null, -2.5, 2.5),
      ]),
      indicators: {
        ...(crime
          ? { homicideRate: ind(crime.homicideRate, "per 100k", crime.year) }
          : {}),
        ...(peace ? { peaceIndex: ind(peace.score, "index", peace.year) } : {}),
        ...(polStab?.value != null
          ? { politicalStability: ind(polStab.value, "WGI", polStab.year) }
          : {}),
      },
    };

    // ── Accommodation Cost ───────────────────────────────────────────────
    const col = localData.getCostOfLiving(iso2);

    const accommodationCost: CategoryScore = {
      value: average([
        invertMinMax(col?.rentMajorCity ?? null, 150, 3000),
        invertMinMax(col?.rentSmallerCity ?? null, 100, 2000),
      ]),
      indicators: {
        ...(col?.rentMajorCity != null
          ? { rentMajorCity: ind(col.rentMajorCity, "USD/mo", 2025) }
          : {}),
        ...(col?.rentSmallerCity != null
          ? { rentSmallerCity: ind(col.rentSmallerCity, "USD/mo", 2025) }
          : {}),
      },
    };

    // ── Transport Cost ───────────────────────────────────────────────────
    // Local transport affordability for travellers.
    const transportCost: CategoryScore = {
      value: average([
        invertMinMax(col?.transport ?? null, 10, 200),
        invertMinMax(col?.utilities ?? null, 20, 300),
      ]),
      indicators: {
        ...(col?.transport != null
          ? { transportCost: ind(col.transport, "USD/mo", 2025) }
          : {}),
        ...(col?.utilities != null
          ? { utilitiesCost: ind(col.utilities, "USD/mo", 2025) }
          : {}),
      },
    };

    // ── Tourism Infrastructure ───────────────────────────────────────────
    // Internet, electricity, coworking — practical infrastructure for tourists.
    const tourismInfrastructure: CategoryScore = {
      value: average([
        minMax(internet?.value ?? null, 0, 100),
        minMax(elec?.value ?? null, 50, 100),
        invertMinMax(col?.coworking ?? null, 20, 400),
      ]),
      indicators: {
        ...(internet?.value != null
          ? { internetUsers: ind(internet.value, "%", internet.year) }
          : {}),
        ...(elec?.value != null
          ? { electricityAccess: ind(elec.value, "%", elec.year) }
          : {}),
        ...(col?.coworking != null
          ? { coworkingCost: ind(col.coworking, "USD/mo", 2025) }
          : {}),
      },
    };

    // ── Local Friendliness ───────────────────────────────────────────────
    // English proficiency, social tolerance, and happiness — how welcoming
    // the locals are to tourists.
    const localFriendliness: CategoryScore = {
      value: average([
        minMax(epiEntry?.score ?? null, 200, 700),
        minMax(socTol?.score ?? null, 0, 100),
        minMax(hap?.score ?? null, 2, 8),
      ]),
      indicators: {
        ...(epiEntry
          ? {
              englishProficiency: ind(
                epiEntry.score,
                "EPI score",
                epiEntry.year,
              ),
            }
          : {}),
        ...(socTol
          ? { socialTolerance: ind(socTol.score, "score", socTol.year) }
          : {}),
        ...(hap ? { happinessScore: ind(hap.score, "score", hap.year) } : {}),
      },
    };

    // ── AI-Analyzed Metrics ──────────────────────────────────────────────
    const ai = localData.getAiMetrics(iso2);
    const tourismAi = localData.getTourismAiMetrics(iso2);

    const nomadCommunity: CategoryScore = {
      value: ai?.nomadCommunity ?? null,
      indicators: {
        ...(ai?.nomadCommunity != null
          ? { aiComposite: ind(ai.nomadCommunity, "AI score", 2025) }
          : {}),
      },
    };

    const visaFriendliness: CategoryScore = {
      value: ai?.visaFriendliness ?? null,
      indicators: {
        ...(ai?.visaFriendliness != null
          ? { aiComposite: ind(ai.visaFriendliness, "AI score", 2025) }
          : {}),
      },
    };

    const costEfficiency: CategoryScore = {
      value: ai?.costEfficiency ?? null,
      indicators: {
        ...(ai?.costEfficiency != null
          ? { aiComposite: ind(ai.costEfficiency, "AI score", 2025) }
          : {}),
      },
    };

    const workLifeBalance: CategoryScore = {
      value: ai?.workLifeBalance ?? null,
      indicators: {
        ...(ai?.workLifeBalance != null
          ? { aiComposite: ind(ai.workLifeBalance, "AI score", 2025) }
          : {}),
      },
    };

    const digitalReadiness: CategoryScore = {
      value: ai?.digitalReadiness ?? null,
      indicators: {
        ...(ai?.digitalReadiness != null
          ? { aiComposite: ind(ai.digitalReadiness, "AI score", 2025) }
          : {}),
      },
    };

    const culturalFit: CategoryScore = {
      value: ai?.culturalFit ?? null,
      indicators: {
        ...(ai?.culturalFit != null
          ? { aiComposite: ind(ai.culturalFit, "AI score", 2025) }
          : {}),
      },
    };

    // ── Tourism AI Metrics ───────────────────────────────────────────────
    const nightlifeEntertainment: CategoryScore = {
      value: tourismAi?.nightlifeEntertainment ?? null,
      indicators: {
        ...(tourismAi?.nightlifeEntertainment != null
          ? {
              aiComposite: ind(
                tourismAi.nightlifeEntertainment,
                "AI score",
                2026,
              ),
            }
          : {}),
      },
    };

    const touristScamSafety: CategoryScore = {
      value: tourismAi?.touristScamSafety ?? null,
      indicators: {
        ...(tourismAi?.touristScamSafety != null
          ? { aiComposite: ind(tourismAi.touristScamSafety, "AI score", 2026) }
          : {}),
      },
    };

    const streetFoodCuisine: CategoryScore = {
      value: tourismAi?.streetFoodCuisine ?? null,
      indicators: {
        ...(tourismAi?.streetFoodCuisine != null
          ? { aiComposite: ind(tourismAi.streetFoodCuisine, "AI score", 2026) }
          : {}),
      },
    };

    const beachWaterQuality: CategoryScore = {
      value: tourismAi?.beachWaterQuality ?? null,
      indicators: {
        ...(tourismAi?.beachWaterQuality != null
          ? { aiComposite: ind(tourismAi.beachWaterQuality, "AI score", 2026) }
          : {}),
      },
    };

    const walkabilityScenicBeauty: CategoryScore = {
      value: tourismAi?.walkabilityScenicBeauty ?? null,
      indicators: {
        ...(tourismAi?.walkabilityScenicBeauty != null
          ? {
              aiComposite: ind(
                tourismAi.walkabilityScenicBeauty,
                "AI score",
                2026,
              ),
            }
          : {}),
      },
    };

    const shoppingMarkets: CategoryScore = {
      value: tourismAi?.shoppingMarkets ?? null,
      indicators: {
        ...(tourismAi?.shoppingMarkets != null
          ? { aiComposite: ind(tourismAi.shoppingMarkets, "AI score", 2026) }
          : {}),
      },
    };

    const photographySpots: CategoryScore = {
      value: tourismAi?.photographySpots ?? null,
      indicators: {
        ...(tourismAi?.photographySpots != null
          ? { aiComposite: ind(tourismAi.photographySpots, "AI score", 2026) }
          : {}),
      },
    };

    const familyFriendliness: CategoryScore = {
      value: tourismAi?.familyFriendliness ?? null,
      indicators: {
        ...(tourismAi?.familyFriendliness != null
          ? { aiComposite: ind(tourismAi.familyFriendliness, "AI score", 2026) }
          : {}),
      },
    };

    const adventureSports: CategoryScore = {
      value: tourismAi?.adventureSports ?? null,
      indicators: {
        ...(tourismAi?.adventureSports != null
          ? { aiComposite: ind(tourismAi.adventureSports, "AI score", 2026) }
          : {}),
      },
    };

    const historicalSites: CategoryScore = {
      value: tourismAi?.historicalSites ?? null,
      indicators: {
        ...(tourismAi?.historicalSites != null
          ? { aiComposite: ind(tourismAi.historicalSites, "AI score", 2026) }
          : {}),
      },
    };

    // ── Assemble & filter ────────────────────────────────────────────────
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
      digitalFreedom,
      personalFreedom,
      logistics,
      biodiversity,
      socialTolerance,
      taxFriendliness,
      startupEnvironment,
      airConnectivity,
      culturalHeritage,
      healthcareCost,
      tourismSafety,
      accommodationCost,
      transportCost,
      tourismInfrastructure,
      localFriendliness,
      nightlifeEntertainment,
      touristScamSafety,
      streetFoodCuisine,
      beachWaterQuality,
      walkabilityScenicBeauty,
      shoppingMarkets,
      photographySpots,
      familyFriendliness,
      adventureSports,
      historicalSites,
      nomadCommunity,
      visaFriendliness,
      costEfficiency,
      workLifeBalance,
      digitalReadiness,
      culturalFit,
    };
    const nonNull = Object.values(scores).filter(
      (s) => s.value !== null,
    ).length;
    if (nonNull < 5) continue;

    // Build country-level i18n (name + capital)
    const ci = countriesI18n[iso2];
    const nameRu = ci?.name?.ru;
    const nameUa = ci?.name?.ua;
    const capRu = ci?.capital?.ru;
    const capUa = ci?.capital?.ua;
    const countryI18n: CountryData["i18n"] = {};
    if (nameRu || capRu) {
      countryI18n.ru = {
        ...(nameRu ? { name: nameRu } : {}),
        ...(capRu ? { capital: capRu } : {}),
      };
    }
    if (nameUa || capUa) {
      countryI18n.ua = {
        ...(nameUa ? { name: nameUa } : {}),
        ...(capUa ? { capital: capUa } : {}),
      };
    }

    const tourismTags = computeTourismTags(
      iso2,
      rc.landlocked ?? false,
      clim?.hottestMonth,
    );
    const tourismTagScores = computeTourismTagScores(iso2, tourismTags);
    const tourismTagSeasonality =
      tourismTags.length > 0 && clim
        ? computeTourismTagSeasonality(
            iso2,
            tourismTags,
            rc.latlng?.[0] ?? 0,
            clim.annualMeanTemp,
            clim.tempRange,
          )
        : undefined;

    data.push({
      code: iso2,
      name: rc.name.common,
      region: deriveRegion(rc.region, rc.subregion),
      population: rc.population,
      flagUrl: rc.flags.svg || rc.flags.png,
      capital: rc.capital?.[0] ?? "",
      lat: rc.latlng?.[0] ?? 0,
      lng: rc.latlng?.[1] ?? 0,
      hasNomadVisa: localData.hasNomadVisa(iso2),
      isSchengen: localData.isSchengen(iso2),
      touristVisaDays: localData.getTouristVisaDays(iso2),
      landlocked: rc.landlocked ?? false,
      tourismTags,
      tourismTagScores,
      tourismTagSeasonality,
      nomadVisa: localData.getNomadVisaDetails(iso2) ?? undefined,
      climateData: clim ?? undefined,
      costOfLiving: col ?? null,
      scores,
      ...(Object.keys(countryI18n).length > 0 ? { i18n: countryI18n } : {}),
    });
  }

  // ── Write output ───────────────────────────────────────────────────────
  const outPath = path.join(__dirname, "data", "countries.json");
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log(
    `\n✅ Wrote ${data.length} countries to ${path.relative(process.cwd(), outPath)}`,
  );
}

generate().catch((err) => {
  console.error("❌ Generate failed:", err);
  process.exit(1);
});

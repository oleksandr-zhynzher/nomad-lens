import { describe, expect, it } from "vitest";
import countries from "../public/countries.json";
import { computeScore, defaultWeights, rankCountries } from "../src/features/country-ranking/utils";
import type { CountryData } from "../src/core/models";

const sampleCountries = (countries as CountryData[]).slice(0, 5);

describe("scoring utilities", () => {
  it("creates visible default weights that add up to 100", () => {
    const weights = defaultWeights();
    const total = Object.values(weights).reduce((sum, value) => sum + value, 0);

    expect(total).toBe(100);
  });

  it("computes a bounded score for country data", () => {
    const sampleCountry = sampleCountries[0];
    expect(sampleCountry).toBeDefined();
    if (sampleCountry === undefined) throw new Error("Expected at least one sample country");

    const score = computeScore(sampleCountry, defaultWeights());

    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("ranks countries in descending score order", () => {
    const ranked = rankCountries(sampleCountries, defaultWeights());

    expect(ranked).toHaveLength(sampleCountries.length);
    expect(ranked.map((entry) => entry.rank)).toEqual([1, 2, 3, 4, 5]);
    const top = ranked[0];
    const bottom = ranked.at(-1);
    expect(top).toBeDefined();
    expect(bottom).toBeDefined();
    if (top === undefined || bottom === undefined) {
      throw new Error("Expected ranked countries to include first and last entries");
    }
    expect(top.finalScore).toBeGreaterThanOrEqual(bottom.finalScore);
  });
});

import { describe, expect, it } from "vitest";

import { CATEGORY_KEYS } from "../src/core/models";
import { parseCountryDataArray } from "../src/core/utils";

const scores = Object.fromEntries(CATEGORY_KEYS.map((key) => [key, { value: 75, indicators: {} }]));

const validCountry = {
  code: "PT",
  name: "Portugal",
  region: "Europe",
  population: 10_400_000,
  flagUrl: "https://flagcdn.com/pt.svg",
  capital: "Lisbon",
  scores,
};

describe("country data validation", () => {
  it("accepts complete country payloads", () => {
    expect(parseCountryDataArray([validCountry])).toEqual([validCountry]);
  });

  it("rejects countries with missing category contracts", () => {
    const invalidCountry = {
      ...validCountry,
      scores: { ...scores, economy: { value: "high", indicators: {} } },
    };

    expect(() => parseCountryDataArray([invalidCountry])).toThrow("invalid economy score");
  });

  it("rejects malformed optional tourism data", () => {
    expect(() => parseCountryDataArray([{ ...validCountry, tourismTags: ["beach", 12] }])).toThrow(
      "tourismTags must be an array of strings",
    );
  });
});

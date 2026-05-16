import { describe, expect, it } from "vitest";

import {
  buildCompareShareParams,
  getRawCompareCountryCodes,
  parseCompareCountryCodes,
  parseCompareMode,
  setCompareCountryCodesParam,
  setCompareModeParam,
} from "../src/features/compare/utils";

describe("compare URL state", () => {
  it("parses invalid or missing mode as countries", () => {
    expect(parseCompareMode(new URLSearchParams())).toBe("countries");
    expect(parseCompareMode(new URLSearchParams("m=invalid"))).toBe("countries");
    expect(parseCompareMode(new URLSearchParams("m=budget"))).toBe("budget");
  });

  it("normalizes duplicate and invalid selected country codes", () => {
    const validCodes = new Set(["DE", "ES"]);
    const params = new URLSearchParams("c=de,ES,xx,de");

    expect(getRawCompareCountryCodes(params)).toEqual(["DE", "ES", "XX", "DE"]);
    expect(parseCompareCountryCodes(params, validCodes)).toEqual(["DE", "ES"]);
  });

  it("removes default or empty values while updating params", () => {
    const params = new URLSearchParams("m=budget&c=DE,ES");

    setCompareModeParam(params, "countries");
    setCompareCountryCodesParam(params, []);

    expect(params.toString()).toBe("");
  });

  it("serializes share params with stable ordering", () => {
    const params = buildCompareShareParams("tourism", ["JP", "KR"]);

    expect(params.toString()).toBe("c=JP%2CKR&m=tourism");
  });
});

import { describe, expect, it } from "vitest";
import {
  buildBudgetPreferencesFromSearch,
  createDefaultBudgetPreferences,
  isDefaultBudgetPreferences,
  sanitizeBudgetCategoryWeights,
  sanitizeBudgetPreferences,
} from "../src/features/budget/store";

describe("budget preference model", () => {
  it("sanitizes persisted values into safe ranges", () => {
    const preferences = sanitizeBudgetPreferences({
      budget: 100000,
      housing: "smallerCity",
      peopleCount: 0,
      bedrooms: 4,
      qualityBlend: -10,
      categoryWeights: {
        housing: 150,
        groceries: Number.NaN,
      },
    });

    expect(preferences).toMatchObject({
      budget: 10000,
      housing: "smallerCity",
      peopleCount: 1,
      bedrooms: 1,
      qualityBlend: 0,
    });
    expect(preferences.categoryWeights.housing).toBe(100);
    expect(preferences.categoryWeights.groceries).toBe(100);
  });

  it("parses and clamps share URL state", () => {
    const preferences = buildBudgetPreferencesFromSearch(
      "?budget=2500&housing=smallerCity&bedrooms=3&people=40&quality=85&cw=housing:60,dining:20",
    );

    expect(preferences).toMatchObject({
      budget: 2500,
      housing: "smallerCity",
      bedrooms: 3,
      peopleCount: 20,
      qualityBlend: 85,
    });
    expect(preferences.categoryWeights.housing).toBe(60);
    expect(preferences.categoryWeights.dining).toBe(20);
  });

  it("detects default preferences", () => {
    expect(isDefaultBudgetPreferences(createDefaultBudgetPreferences())).toBe(true);
    expect(
      isDefaultBudgetPreferences({
        ...createDefaultBudgetPreferences(),
        budget: 3000,
      }),
    ).toBe(false);
  });

  it("keeps category weights complete when partial input is provided", () => {
    const weights = sanitizeBudgetCategoryWeights({ dining: 25 });

    expect(weights.dining).toBe(25);
    expect(weights.housing).toBe(100);
    expect(Object.keys(weights)).toHaveLength(7);
  });
});

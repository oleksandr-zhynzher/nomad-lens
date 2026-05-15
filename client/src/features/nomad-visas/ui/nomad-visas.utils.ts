import type { ClimatePreferences, CountryData, WeightMap } from "@core/models";
import { computeClimateScore, computeScore } from "@features/country-ranking/utils";
import { localizeCountry } from "@core/utils";
import type { SortField, VisaRow } from "./nomad-visas.types";

export function applyClimate(country: CountryData, climatePrefs: ClimatePreferences): CountryData {
  if (!country.climateData) return country;

  return {
    ...country,
    scores: {
      ...country.scores,
      climate: {
        ...country.scores.climate,
        value: computeClimateScore(country.climateData, climatePrefs),
      },
    },
  };
}

export function computeOverallScore(country: CountryData, weights: WeightMap) {
  return computeScore(country, weights);
}

export function compareVisaRows(a: VisaRow, b: VisaRow, field: SortField, lang: string): number {
  switch (field) {
    case "country":
      return localizeCountry(a.country, lang).name.localeCompare(
        localizeCountry(b.country, lang).name,
      );
    case "overallScore":
      return a.overallScore - b.overallScore;
    case "monthlyBudget": {
      if (a.monthlyBudget == null && b.monthlyBudget == null) return 0;
      if (a.monthlyBudget == null) return 1;
      if (b.monthlyBudget == null) return -1;
      return a.monthlyBudget - b.monthlyBudget;
    }
    case "duration":
      return a.country.nomadVisa.duration.initial - b.country.nomadVisa.duration.initial;
    case "cost":
      return a.country.nomadVisa.cost.amount - b.country.nomadVisa.cost.amount;
    case "income": {
      const aIncome =
        a.country.nomadVisa.incomeRequirement.monthly ??
        a.country.nomadVisa.incomeRequirement.annual ??
        0;
      const bIncome =
        b.country.nomadVisa.incomeRequirement.monthly ??
        b.country.nomadVisa.incomeRequirement.annual ??
        0;
      return aIncome - bIncome;
    }
    case "tax":
      return a.country.nomadVisa.tax.status.localeCompare(b.country.nomadVisa.tax.status);
  }
}

export function visaRowClass(isSelected: boolean, isHighlighted: boolean): string {
  const base = "cursor-pointer border-b border-[#1E1E1E] transition-colors";
  if (isSelected) return `${base} bg-[#1A2A1A]`;
  if (isHighlighted) return `${base} bg-[#1A1208]`;
  return `${base} bg-transparent`;
}

export function budgetCellClass(budget: number | null, maxBudget: number): string {
  if (budget != null && budget <= maxBudget)
    return "font-mono text-sm font-semibold text-[#44CC66]";
  if (budget == null) return "font-mono text-sm font-semibold text-dimmest";
  return "font-mono text-sm font-semibold text-white";
}

type TranslateFn = (key: string) => string;

export function getTaxStatusLabel(
  status: "exempt" | "standard" | "special",
  t: TranslateFn,
): string {
  if (status === "exempt") return t("countryPage.taxExemptLabel");
  if (status === "special") return t("countryPage.specialTaxLabel");
  return t("countryPage.standardTaxLabel");
}

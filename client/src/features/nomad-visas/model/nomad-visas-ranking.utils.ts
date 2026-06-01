import type { CountryData, WeightMap } from "@core/models";
import { localizeCountry } from "@core/utils";
import { computeScore } from "@core/utils/scoring.utils";

import type { SortField, VisaRow } from "./nomad-visas.types";

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

export { applyClimate } from "@core/utils/scoring.utils";

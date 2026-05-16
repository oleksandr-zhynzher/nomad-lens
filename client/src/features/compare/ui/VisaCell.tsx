import { scoreColourClass } from "@core/utils";
import type { VisaCellProps } from "@features/compare/utils";
import { getLocalizedVisa } from "@features/compare/utils";
import { applyClimate, computeScore } from "@features/country-ranking/utils";
import { useTranslation } from "react-i18next";

import { VisaDetailCell } from "./VisaDetailCell";

export function VisaCell({
  slot,
  field,
  weights,
  climatePrefs,
  budgetMatchByCode,
  lang,
}: VisaCellProps) {
  const { t } = useTranslation();
  const { visa } = getLocalizedVisa(slot.country, lang);

  switch (field) {
    case "visaName":
      return <span className="text-[13px] text-on-surface">{visa.visaName}</span>;
    case "overallScore": {
      const overallScore = computeScore(applyClimate(slot.country, climatePrefs), weights);
      return (
        <span
          className={`font-mono text-[20px] font-semibold ${scoreColourClass(overallScore, "text")}`}
        >
          {overallScore.toFixed(1)}
        </span>
      );
    }
    case "monthlyBudget": {
      const monthlyBudget = budgetMatchByCode.get(slot.country.code)?.monthlyCost;
      return (
        <span
          className={`font-mono text-[20px] font-semibold ${monthlyBudget == null ? "text-dimmest" : "text-on-surface"}`}
        >
          {monthlyBudget == null ? "—" : `$${monthlyBudget.toLocaleString()}`}
        </span>
      );
    }
    case "duration":
      return (
        <span
          className={`font-mono text-[20px] font-semibold ${visa.duration.initial >= 12 ? "text-success" : "text-warn"}`}
        >
          {visa.duration.initial}
          <span className="ml-[2px] text-xs text-dim">{t("countryPage.visa.months")}</span>
        </span>
      );
    case "maxExtension":
      return (
        <span
          className={`font-mono text-[20px] font-semibold ${visa.duration.maxExtension > 0 ? "text-[#5B8FA8]" : "text-dimmest"}`}
        >
          {visa.duration.maxExtension > 0 ? (
            <>
              +{visa.duration.maxExtension}
              <span className="ml-[2px] text-xs text-dim">{t("countryPage.visa.months")}</span>
            </>
          ) : (
            "—"
          )}
        </span>
      );
    case "renewable":
    case "cost":
    case "income":
    case "taxStatus":
    case "online":
    case "processingTime":
    case "benefits":
      return <VisaDetailCell slot={slot} field={field} lang={lang} />;
  }
}

// Re-export types used by NomadVisaComparison
export type {
  SelectedSlot,
  VisaCellProps,
  VisaCountry,
  VisaSlotLangProps,
} from "@features/compare/utils";

import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle } from "lucide-react";
import { applyClimate, computeScore } from "@features/country-ranking/utils";
import { scoreColourClass } from "@core/utils";
import type { VisaCellProps } from "@features/compare/utils";
import { getCurrencySymbol, getLocalizedVisa } from "@features/compare/utils";
import { VisaIncomeCell } from "./VisaIncomeCell";
import { VisaTaxCell } from "./VisaTaxCell";
import { VisaBenefitsCell } from "./VisaBenefitsCell";

export function VisaCell({
  slot,
  field,
  weights,
  climatePrefs,
  budgetMatchByCode,
  lang,
}: VisaCellProps) {
  const { t } = useTranslation();
  const { visa, loc } = getLocalizedVisa(slot.country, lang);

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
      return visa.duration.renewable ? (
        <CheckCircle2 size={20} className="text-success" />
      ) : (
        <XCircle size={20} className="text-dimmer" />
      );
    case "cost":
      return (
        <span
          className={`font-mono text-[20px] font-semibold ${visa.cost.amount === 0 ? "text-success" : "text-on-surface"}`}
        >
          {visa.cost.amount === 0 ? (
            t("countryPage.free")
          ) : (
            <>
              {getCurrencySymbol(visa.cost.currency)} {visa.cost.amount.toLocaleString()}
            </>
          )}
        </span>
      );
    case "income":
      return <VisaIncomeCell slot={slot} lang={lang} />;
    case "taxStatus":
      return <VisaTaxCell slot={slot} lang={lang} />;
    case "online":
      return visa.applicationProcess.online ? (
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={16} className="text-success" />
          <span className="text-xs text-success">{t("compare.online")}</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <XCircle size={16} className="text-muted" />
          <span className="text-xs text-muted">{t("compare.inPerson")}</span>
        </div>
      );
    case "processingTime":
      return (
        <span className="text-[13px] text-on-surface">
          {loc?.applicationProcess?.processingTime ?? visa.applicationProcess.processingTime}
        </span>
      );
    case "benefits":
      return <VisaBenefitsCell slot={slot} lang={lang} />;
  }
}

// Re-export types used by NomadVisaComparison
export type {
  VisaCountry,
  SelectedSlot,
  VisaCellProps,
  VisaSlotLangProps,
} from "@features/compare/utils";

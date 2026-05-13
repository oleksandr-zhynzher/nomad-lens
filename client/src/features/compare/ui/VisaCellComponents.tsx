import type React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle } from "lucide-react";
import { applyClimate, computeScore } from "@features/country-ranking/utils";
import { scoreColourClass } from "@core/utils";
import { TAX_STATUS_COLORS } from "@core/constants";
import type { VisaCellProps, VisaSlotLangProps } from "@features/compare/utils";
import { getCurrencySymbol, getLocalizedVisa } from "@features/compare/utils";

export function VisaIncomeCell({ slot, lang }: VisaSlotLangProps) {
  const { t } = useTranslation();
  const { visa } = getLocalizedVisa(slot.country, lang);
  const monthly = visa.incomeRequirement.monthly;
  const annual = visa.incomeRequirement.annual;
  if (monthly == null && annual == null) {
    return <span className="text-[13px] text-success">{t("countryPage.visa.noMinimum")}</span>;
  }
  const cur = getCurrencySymbol(visa.incomeRequirement.currency);
  return (
    <span className="font-mono text-[20px] font-semibold text-on-surface">
      {cur}
      {monthly != null ? monthly.toLocaleString() : annual?.toLocaleString()}
      <span className="ml-[2px] text-xs text-dim">
        /{monthly != null ? t("countryPage.visa.mo") : t("countryPage.visa.yr")}
      </span>
    </span>
  );
}

export function VisaTaxCell({ slot, lang }: VisaSlotLangProps) {
  const { t } = useTranslation();
  const { visa, loc } = getLocalizedVisa(slot.country, lang);
  const status = visa.tax.status;
  const colors = TAX_STATUS_COLORS[status] ?? { bg: "#2A2A2A", text: "#9E9E9E" };
  const taxStatusLabels: Record<typeof status, string> = {
    exempt: t("countryPage.visa.taxExempt"),
    special: t("countryPage.visa.taxSpecial"),
    standard: t("countryPage.visa.taxStandard"),
  };
  const label = taxStatusLabels[status];
  const taxNotes = loc?.tax?.notes ?? visa.tax.notes;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex items-center gap-2">
        <span
          className="rounded-full bg-[var(--tax-bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--tax-text)]"
          style={{ "--tax-bg": colors.bg, "--tax-text": colors.text } as React.CSSProperties}
        >
          {label}
        </span>
        {visa.tax.rate == null ? null : (
          <span
            className="font-mono text-[16px] font-semibold text-[var(--tax-text)]"
            style={{ "--tax-text": colors.text } as React.CSSProperties}
          >
            {visa.tax.rate}%
          </span>
        )}
      </div>
      {taxNotes !== "" ? (
        <span className="max-w-[260px] text-center text-[11px] leading-[1.4] text-dim">
          {taxNotes}
        </span>
      ) : null}
    </div>
  );
}

export function VisaBenefitsCell({ slot, lang }: VisaSlotLangProps) {
  const { loc, visa } = getLocalizedVisa(slot.country, lang);
  const items = loc?.benefits ?? visa.benefits;
  return (
    <div className="flex flex-col gap-1">
      {items.map((b) => (
        <span key={b} className="text-[11px] leading-[1.3] text-muted">
          • {b}
        </span>
      ))}
    </div>
  );
}

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

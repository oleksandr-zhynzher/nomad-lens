import { useTranslation } from "react-i18next";
import type { VisaSlotLangProps } from "@features/compare/utils";
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

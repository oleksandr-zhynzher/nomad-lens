import { TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { NomadVisaDetails as NomadVisaDetailsType } from "@core/models";

interface NomadVisaIncomeFieldProps {
  readonly incomeRequirement: NomadVisaDetailsType["incomeRequirement"];
}

export function NomadVisaIncomeField({ incomeRequirement }: NomadVisaIncomeFieldProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-1 rounded bg-surface-2 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-tertiary">
          <TrendingUp size={12} className="inline" />
          {t("countryPage.visa.income", "Income")}
        </span>
        {incomeRequirement.monthly !== null ? (
          <span className="font-mono text-[11px] font-semibold text-white">
            {incomeRequirement.currency} {incomeRequirement.monthly.toLocaleString()}/mo
          </span>
        ) : null}
        {incomeRequirement.monthly === null && incomeRequirement.annual !== null ? (
          <span className="font-mono text-[10px] font-semibold text-white">
            {incomeRequirement.currency} {incomeRequirement.annual.toLocaleString()}/yr
          </span>
        ) : null}
        {incomeRequirement.monthly === null && incomeRequirement.annual === null ? (
          <span className="font-mono text-[11px] font-semibold text-success">
            {t("countryPage.visa.noMinimum", "None")}
          </span>
        ) : null}
      </div>
    </div>
  );
}

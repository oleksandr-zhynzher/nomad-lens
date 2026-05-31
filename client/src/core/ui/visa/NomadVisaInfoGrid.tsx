import { TAX_STATUS_COLORS } from "@core/constants";
import type { NomadVisaDetails as NomadVisaDetailsType } from "@core/models";
import { getTaxStatusLabel } from "@core/utils/visa-label.utils";
import { Clock, DollarSign, Shield } from "lucide-react";
import type React from "react";
import { useTranslation } from "react-i18next";

import { NomadVisaIncomeField } from "./NomadVisaIncomeField";

interface NomadVisaInfoGridProps {
  readonly visa: NomadVisaDetailsType;
}

export function NomadVisaInfoGrid({ visa }: NomadVisaInfoGridProps) {
  const { t } = useTranslation();
  const taxColors = TAX_STATUS_COLORS[visa.tax.status];
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
      <div className="flex flex-col gap-1 rounded bg-surface-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-tertiary">
            {t("countryPage.visa.visaName", "Visa Name")}
          </span>
        </div>
        <p className="mt-0.5 font-mono text-[11px] text-muted">{visa.visaName}</p>
      </div>

      <div className="flex flex-col gap-1 rounded bg-surface-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-tertiary">
            <Clock size={12} className="inline" />
            {t("countryPage.visa.duration", "Duration")}
          </span>
          <span className="font-mono text-xs font-semibold text-white">
            {visa.duration.initial} mo
          </span>
        </div>
        {visa.duration.maxExtension > 0 ? (
          <p className="mt-0.5 font-mono text-[10px] text-dim">
            +{visa.duration.maxExtension} mo extension
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1 rounded bg-surface-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-tertiary">
            <DollarSign size={12} className="inline" />
            {t("countryPage.visa.cost", "Cost")}
          </span>
          <span
            className={`font-mono text-xs font-semibold ${visa.cost.amount === 0 ? "text-success" : "text-white"}`}
          >
            {visa.cost.amount === 0
              ? t("countryPage.visa.free", "Free")
              : `${visa.cost.currency} ${visa.cost.amount.toLocaleString()}`}
          </span>
        </div>
      </div>

      <NomadVisaIncomeField incomeRequirement={visa.incomeRequirement} />

      <div className="flex flex-col gap-1 rounded bg-surface-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-tertiary">
            <Shield size={12} className="inline" />
            {t("countryPage.visa.tax", "Tax")}
          </span>
          <span
            className="inline-flex items-center rounded-full bg-[var(--tax-bg)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--tax-c)]"
            style={
              {
                "--tax-bg": taxColors.bg,
                "--tax-c": taxColors.text,
              } as React.CSSProperties
            }
          >
            {getTaxStatusLabel(visa.tax.status, t)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1 rounded bg-surface-2 p-3">
        <span className="mb-1 text-xs font-semibold text-tertiary">
          {t("countryPage.visa.officialInfo", "Official Information")}
        </span>
        <a
          href={visa.officialUrl}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[10px] break-all text-accent no-underline"
        >
          {t("countryPage.visa.visitWebsite", "Visit Website →")}
        </a>
      </div>
    </div>
  );
}

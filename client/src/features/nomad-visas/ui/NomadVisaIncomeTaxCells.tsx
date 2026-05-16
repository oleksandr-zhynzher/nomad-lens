import { TAX_STATUS_COLORS } from "@core/constants";
import type { CountryData } from "@core/models";
import type React from "react";
import { useTranslation } from "react-i18next";

import { getTaxStatusLabel } from "./nomad-visas.utils";

type VisaType = NonNullable<CountryData["nomadVisa"]>;

interface IncomeCellProps {
  readonly visa: VisaType;
}

export function VisaRowIncomeCell({ visa }: IncomeCellProps) {
  const { t } = useTranslation();
  const { monthly, annual, currency } = visa.incomeRequirement;
  let incomeContent: React.ReactNode;

  if (monthly !== null) {
    incomeContent = (
      <>
        <span className="font-mono text-sm font-semibold text-white">
          {currency} {monthly.toLocaleString()}
        </span>
        <span className="ml-0.5 text-xs text-dim">/{t("countryPage.visa.mo")}</span>
      </>
    );
  } else if (annual !== null) {
    incomeContent = (
      <>
        <span className="font-mono text-[13px] font-semibold text-white">
          {currency} {annual.toLocaleString()}
        </span>
        <span className="ml-0.5 text-xs text-dim">/{t("countryPage.visa.yr")}</span>
      </>
    );
  } else {
    incomeContent = (
      <span className="font-mono text-[13px] font-semibold text-[#44CC66]">
        {t("countryPage.visa.noMinimum", "None")}
      </span>
    );
  }

  return <td className="px-3 py-4 text-right">{incomeContent}</td>;
}

interface TaxCellProps {
  readonly visa: VisaType;
}

export function VisaRowTaxCell({ visa }: TaxCellProps) {
  const { t } = useTranslation();
  const taxColors = TAX_STATUS_COLORS[visa.tax.status];
  return (
    <td className="px-3 py-4 text-center">
      <span
        className="inline-flex items-center rounded-full bg-[var(--tax-bg)] px-2 py-1 font-mono text-[11px] font-semibold whitespace-nowrap text-[var(--tax-text)]"
        style={{ "--tax-bg": taxColors.bg, "--tax-text": taxColors.text } as React.CSSProperties}
      >
        {getTaxStatusLabel(visa.tax.status, t)}
      </span>
    </td>
  );
}

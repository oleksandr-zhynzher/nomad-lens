import type React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TAX_STATUS_COLORS } from "@core/constants";
import type { CountryData } from "@core/models";
import { getTaxStatusLabel } from "./nomad-visas.utils";

type VisaType = NonNullable<CountryData["nomadVisa"]>;

interface CheckboxCellProps {
  readonly isSelected: boolean;
  readonly localizedName: string;
  readonly countryCode: string;
  readonly onToggleSelect: (code: string) => void;
}

export function VisaRowCheckboxCell({
  isSelected,
  localizedName,
  countryCode,
  onToggleSelect,
}: CheckboxCellProps) {
  return (
    <td
      className="py-4 pr-1 pl-3"
      onClick={(e) => {
        e.stopPropagation();
        onToggleSelect(countryCode);
      }}
    >
      <div
        aria-label={`Select ${localizedName}`}
        className={`pointer-events-none flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] transition-all ${isSelected ? "border-2 border-accent bg-accent" : "border-2 border-[#404040] bg-transparent"}`}
      >
        {isSelected ? (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path
              d="M1 3.5L3.5 6L8 1"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </div>
    </td>
  );
}

interface CountryCellProps {
  readonly country: CountryData & { nomadVisa: VisaType };
  readonly localizedName: string;
  readonly langPrefix: string;
  readonly compareMode: boolean;
  readonly onToggleSelect: (code: string) => void;
}

export function VisaRowCountryCell({
  country,
  localizedName,
  langPrefix,
  compareMode,
  onToggleSelect,
}: CountryCellProps) {
  const { t } = useTranslation();
  return (
    <td className="px-3 py-4">
      <Link
        to={`${langPrefix}/country/${country.code.toLowerCase()}`}
        className="flex items-center gap-2.5 no-underline"
        onClick={(e) => {
          if (compareMode) {
            e.preventDefault();
            e.stopPropagation();
            onToggleSelect(country.code);
          }
        }}
      >
        <img
          src={country.flagUrl}
          alt={t("a11y.flagAlt", "{{country}} flag", { country: localizedName })}
          className="h-[19px] w-7 shrink-0 rounded-[3px] object-cover"
          loading="lazy"
        />
        <span className="text-sm font-medium text-white">{localizedName}</span>
      </Link>
    </td>
  );
}

interface IncomeCellProps {
  readonly visa: VisaType;
}

export function VisaRowIncomeCell({ visa }: IncomeCellProps) {
  const { t } = useTranslation();
  const { monthly, annual, currency } = visa.incomeRequirement;
  return (
    <td className="px-3 py-4 text-right">
      {monthly !== null ? (
        <>
          <span className="font-mono text-sm font-semibold text-white">
            {currency} {monthly.toLocaleString()}
          </span>
          <span className="ml-0.5 text-xs text-dim">/{t("countryPage.visa.mo")}</span>
        </>
      ) : annual !== null ? (
        <>
          <span className="font-mono text-[13px] font-semibold text-white">
            {currency} {annual.toLocaleString()}
          </span>
          <span className="ml-0.5 text-xs text-dim">/{t("countryPage.visa.yr")}</span>
        </>
      ) : (
        <span className="font-mono text-[13px] font-semibold text-[#44CC66]">
          {t("countryPage.visa.noMinimum", "None")}
        </span>
      )}
    </td>
  );
}

interface TaxCellProps {
  readonly visa: VisaType;
}

export function VisaRowTaxCell({ visa }: TaxCellProps) {
  const { t } = useTranslation();
  const taxColors = TAX_STATUS_COLORS[visa.tax.status] ?? TAX_STATUS_COLORS.standard;
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

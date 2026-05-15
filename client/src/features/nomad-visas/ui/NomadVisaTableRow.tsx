import type React from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { localizeCountry, scoreColourClass } from "@core/utils";
import { TAX_STATUS_COLORS } from "@core/constants";
import type { CountryData } from "@core/models";
import { visaRowClass, budgetCellClass, getTaxStatusLabel } from "./nomad-visas.utils";

type VisaCountry = CountryData & { nomadVisa: NonNullable<CountryData["nomadVisa"]> };

interface NomadVisaTableRowProps {
  readonly country: VisaCountry;
  readonly overallScore: number;
  readonly monthlyBudget: number | null;
  readonly budget: number;
  readonly compareMode: boolean;
  readonly isSelected: boolean;
  readonly isHighlighted: boolean;
  readonly onRowClick: (code: string) => void;
  readonly onToggleSelect: (code: string) => void;
  readonly langPrefix: string;
  readonly lang: string;
}

export function NomadVisaTableRow({
  country,
  overallScore,
  monthlyBudget,
  budget,
  compareMode,
  isSelected,
  isHighlighted,
  onRowClick,
  onToggleSelect,
  langPrefix,
  lang,
}: NomadVisaTableRowProps) {
  const { t } = useTranslation();
  const visa = country.nomadVisa;
  const taxColors = TAX_STATUS_COLORS[visa.tax.status] ?? TAX_STATUS_COLORS.standard;
  const localizedName = localizeCountry(country, lang).name;

  return (
    <tr
      key={country.code}
      data-country-code={country.code.toLowerCase()}
      className={visaRowClass(isSelected, isHighlighted)}
      onClick={() => {
        onRowClick(country.code);
      }}
      onMouseEnter={(e) => {
        if (!isHighlighted && !isSelected) {
          e.currentTarget.style.backgroundColor = "#232326";
        }
      }}
      onMouseLeave={(e) => {
        if (!isHighlighted && !isSelected) {
          e.currentTarget.style.backgroundColor = "transparent";
        }
      }}
    >
      {/* Checkbox — compare mode only */}
      {compareMode ? (
        <td
          className="py-4 pr-1 pl-3"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(country.code);
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
      ) : null}

      {/* Country */}
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

      {/* Visa Name */}
      <td className="px-3 py-4">
        <span className="text-[13px] text-tertiary">{visa.visaName}</span>
      </td>

      {/* Overall score */}
      <td className="px-3 py-4 text-right">
        <span
          className={`font-mono text-sm font-semibold ${scoreColourClass(overallScore, "text")}`}
        >
          {overallScore.toFixed(1)}
        </span>
      </td>

      {/* Monthly budget */}
      <td className="px-3 py-4 text-right">
        <span className={budgetCellClass(monthlyBudget, budget)}>
          {monthlyBudget == null ? "—" : `$${monthlyBudget.toLocaleString()}`}
        </span>
      </td>

      {/* Duration */}
      <td className="px-3 py-4">
        <span className="font-mono text-sm font-semibold text-white">{visa.duration.initial}</span>
        <span className="ml-[3px] text-xs text-dim">{t("countryPage.visa.mo")}</span>
        {visa.duration.maxExtension > 0 ? (
          <span className="ml-1 text-[11px] text-dimmer">+{visa.duration.maxExtension}</span>
        ) : null}
      </td>

      {/* Cost */}
      <td className="px-3 py-4 text-right">
        <span
          className={`font-mono text-sm font-semibold ${visa.cost.amount === 0 ? "text-[#44CC66]" : "text-white"}`}
        >
          {visa.cost.amount === 0
            ? t("countryPage.visa.free", "Free")
            : `${visa.cost.currency} ${visa.cost.amount.toLocaleString()}`}
        </span>
      </td>

      {/* Income */}
      <td className="px-3 py-4 text-right">
        {visa.incomeRequirement.monthly !== null ? (
          <>
            <span className="font-mono text-sm font-semibold text-white">
              {visa.incomeRequirement.currency} {visa.incomeRequirement.monthly.toLocaleString()}
            </span>
            <span className="ml-0.5 text-xs text-dim">/{t("countryPage.visa.mo")}</span>
          </>
        ) : null}
        {visa.incomeRequirement.monthly === null && visa.incomeRequirement.annual !== null ? (
          <>
            <span className="font-mono text-[13px] font-semibold text-white">
              {visa.incomeRequirement.currency} {visa.incomeRequirement.annual.toLocaleString()}
            </span>
            <span className="ml-0.5 text-xs text-dim">/{t("countryPage.visa.yr")}</span>
          </>
        ) : null}
        {visa.incomeRequirement.monthly === null && visa.incomeRequirement.annual === null ? (
          <span className="font-mono text-[13px] font-semibold text-[#44CC66]">
            {t("countryPage.visa.noMinimum", "None")}
          </span>
        ) : null}
      </td>

      {/* Tax */}
      <td className="px-3 py-4 text-center">
        <span
          className="inline-flex items-center rounded-full bg-[var(--tax-bg)] px-2 py-1 font-mono text-[11px] font-semibold whitespace-nowrap text-[var(--tax-text)]"
          style={
            {
              "--tax-bg": taxColors.bg,
              "--tax-text": taxColors.text,
            } as React.CSSProperties
          }
        >
          {getTaxStatusLabel(visa.tax.status, t)}
        </span>
      </td>

      {/* External link */}
      <td className="px-3 py-4 text-center">
        <a
          href={visa.officialUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="inline-flex text-accent"
        >
          <ExternalLink size={16} />
        </a>
      </td>
    </tr>
  );
}

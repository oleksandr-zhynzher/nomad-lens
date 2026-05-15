import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { localizeCountry, scoreColourClass } from "@core/utils";
import type { CountryData } from "@core/models";
import { visaRowClass, budgetCellClass } from "./nomad-visas.utils";
import {
  VisaRowCheckboxCell,
  VisaRowCountryCell,
  VisaRowIncomeCell,
  VisaRowTaxCell,
} from "./NomadVisaRowCells";

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
  const localizedName = localizeCountry(country, lang).name;

  return (
    <tr
      data-country-code={country.code.toLowerCase()}
      className={visaRowClass(isSelected, isHighlighted)}
      onClick={() => {
        onRowClick(country.code);
      }}
      onMouseEnter={(e) => {
        if (!isHighlighted && !isSelected) e.currentTarget.style.backgroundColor = "#232326";
      }}
      onMouseLeave={(e) => {
        if (!isHighlighted && !isSelected) e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {compareMode ? (
        <VisaRowCheckboxCell
          isSelected={isSelected}
          localizedName={localizedName}
          countryCode={country.code}
          onToggleSelect={onToggleSelect}
        />
      ) : null}
      <VisaRowCountryCell
        country={country}
        localizedName={localizedName}
        langPrefix={langPrefix}
        compareMode={compareMode}
        onToggleSelect={onToggleSelect}
      />
      <td className="px-3 py-4">
        <span className="text-[13px] text-tertiary">{visa.visaName}</span>
      </td>
      <td className="px-3 py-4 text-right">
        <span
          className={`font-mono text-sm font-semibold ${scoreColourClass(overallScore, "text")}`}
        >
          {overallScore.toFixed(1)}
        </span>
      </td>
      <td className="px-3 py-4 text-right">
        <span className={budgetCellClass(monthlyBudget, budget)}>
          {monthlyBudget == null ? "—" : `$${monthlyBudget.toLocaleString()}`}
        </span>
      </td>
      <td className="px-3 py-4">
        <span className="font-mono text-sm font-semibold text-white">{visa.duration.initial}</span>
        <span className="ml-[3px] text-xs text-dim">{t("countryPage.visa.mo")}</span>
        {visa.duration.maxExtension > 0 ? (
          <span className="ml-1 text-[11px] text-dimmer">+{visa.duration.maxExtension}</span>
        ) : null}
      </td>
      <td className="px-3 py-4 text-right">
        <span
          className={`font-mono text-sm font-semibold ${visa.cost.amount === 0 ? "text-[#44CC66]" : "text-white"}`}
        >
          {visa.cost.amount === 0
            ? t("countryPage.visa.free", "Free")
            : `${visa.cost.currency} ${visa.cost.amount.toLocaleString()}`}
        </span>
      </td>
      <VisaRowIncomeCell visa={visa} />
      <VisaRowTaxCell visa={visa} />
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

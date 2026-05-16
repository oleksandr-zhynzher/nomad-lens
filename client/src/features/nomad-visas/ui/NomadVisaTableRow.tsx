import type { CountryData } from "@core/models";
import { localizeCountry } from "@core/utils";
import { ExternalLink } from "lucide-react";

import { visaRowClass } from "./nomad-visas.utils";
import { NomadVisaRowBodyCells } from "./NomadVisaRowBodyCells";
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
      <NomadVisaRowBodyCells
        visa={visa}
        overallScore={overallScore}
        monthlyBudget={monthlyBudget}
        budget={budget}
      />
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

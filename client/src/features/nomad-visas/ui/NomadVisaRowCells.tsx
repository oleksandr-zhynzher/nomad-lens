import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { CountryData } from "@core/models";

export { VisaRowIncomeCell, VisaRowTaxCell } from "./NomadVisaIncomeTaxCells";

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

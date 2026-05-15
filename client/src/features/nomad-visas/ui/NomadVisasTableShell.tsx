import { useTranslation } from "react-i18next";
import type { NavigateFunction } from "react-router-dom";
import type { CountryData } from "@core/models";
import { LoadingRows } from "@core/ui/states";
import { EmptyState } from "@core/ui/states";
import type { SortField, SortDirection } from "./nomad-visas.types";
import { NomadVisaTableHeader } from "./NomadVisaTableHeader";
import { NomadVisaTableRow } from "./NomadVisaTableRow";

type VisaCountry = CountryData & { nomadVisa: NonNullable<CountryData["nomadVisa"]> };
interface SortedCountry {
  country: VisaCountry;
  overallScore: number;
  monthlyBudget: number | null;
}

interface NomadVisasTableShellProps {
  readonly loading: boolean;
  readonly sortedCountries: SortedCountry[];
  readonly compareMode: boolean;
  readonly selectedCodes: Set<string>;
  readonly onToggleSelect: (code: string) => void;
  readonly sortField: SortField;
  readonly sortDirection: SortDirection;
  readonly onSort: (field: SortField) => void;
  readonly theadTop: number;
  readonly theadRef: React.RefObject<HTMLDivElement | null>;
  readonly bodyRef: React.RefObject<HTMLDivElement | null>;
  readonly onBodyScroll: () => void;
  readonly budget: number;
  readonly langPrefix: string;
  readonly navigate: NavigateFunction;
  readonly highlightCode: string | null;
}

export function NomadVisasTableShell({
  loading,
  sortedCountries,
  compareMode,
  selectedCodes,
  onToggleSelect,
  sortField,
  sortDirection,
  onSort,
  theadTop,
  theadRef,
  bodyRef,
  onBodyScroll,
  budget,
  langPrefix,
  navigate,
  highlightCode,
}: NomadVisasTableShellProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const tableMinWidth = compareMode ? "1170px" : "1122px";
  const colgroup = (
    <colgroup>
      {compareMode ? <col className="w-12" /> : null}
      <col className="w-[200px]" />
      <col className="w-[160px]" />
      <col className="w-[110px]" />
      <col className="w-[130px]" />
      <col className="w-[90px]" />
      <col className="w-[110px]" />
      <col className="w-[150px]" />
      <col className="w-[130px]" />
      <col className="w-[52px]" />
    </colgroup>
  );

  if (loading) {
    return <LoadingRows count={8} />;
  }

  return (
    <div className="mx-auto box-content w-full max-w-[1200px] px-4 pb-12">
      <div
        ref={theadRef}
        className="no-scrollbar sticky top-[var(--thead-top)] z-10 overflow-x-scroll bg-bg"
        style={{ "--thead-top": `${theadTop}px` } as React.CSSProperties}
      >
        <table
          className="w-full min-w-[var(--tmin-w)] table-fixed border-separate border-spacing-0"
          style={{ "--tmin-w": tableMinWidth } as React.CSSProperties}
        >
          {colgroup}
          <NomadVisaTableHeader
            sortField={sortField}
            sortDirection={sortDirection}
            compareMode={compareMode}
            onSort={onSort}
          />
        </table>
      </div>
      <div ref={bodyRef} className="overflow-x-auto" onScroll={onBodyScroll}>
        {sortedCountries.length === 0 ? (
          <EmptyState message={t("nomadVisasPage.noResults", "No countries found")} />
        ) : (
          <table
            className="w-full min-w-[var(--tmin-w)] table-fixed border-separate border-spacing-0"
            style={{ "--tmin-w": tableMinWidth } as React.CSSProperties}
          >
            {colgroup}
            <tbody>
              {sortedCountries.map(({ country, overallScore, monthlyBudget }) => (
                <NomadVisaTableRow
                  key={country.code}
                  country={country}
                  overallScore={overallScore}
                  monthlyBudget={monthlyBudget}
                  budget={budget}
                  compareMode={compareMode}
                  isSelected={selectedCodes.has(country.code)}
                  isHighlighted={highlightCode === country.code}
                  onRowClick={(code) => {
                    if (compareMode) {
                      onToggleSelect(code);
                    } else {
                      void navigate(`${langPrefix}/country/${code.toLowerCase()}`);
                    }
                  }}
                  onToggleSelect={onToggleSelect}
                  langPrefix={langPrefix}
                  lang={lang}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

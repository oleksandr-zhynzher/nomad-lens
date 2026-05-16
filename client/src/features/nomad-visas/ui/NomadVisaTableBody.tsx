import { EmptyState } from "@core/ui/states";
import type { CSSProperties, RefObject } from "react";
import { useTranslation } from "react-i18next";
import type { NavigateFunction } from "react-router-dom";

import type { VisaRow } from "./nomad-visas.types";
import { NomadVisaTableRow } from "./NomadVisaTableRow";

interface NomadVisaTableBodyProps {
  readonly sortedCountries: VisaRow[];
  readonly compareMode: boolean;
  readonly selectedCodes: Set<string>;
  readonly onToggleSelect: (code: string) => void;
  readonly minW: string;
  readonly bodyRef: RefObject<HTMLDivElement | null>;
  readonly onBodyScroll: () => void;
  readonly budget: number;
  readonly langPrefix: string;
  readonly navigate: NavigateFunction;
  readonly highlightCode: string | null;
}

export function NomadVisaTableBody({
  sortedCountries,
  compareMode,
  selectedCodes,
  onToggleSelect,
  minW,
  bodyRef,
  onBodyScroll,
  budget,
  langPrefix,
  navigate,
  highlightCode,
}: NomadVisaTableBodyProps) {
  const { i18n } = useTranslation();
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
  const { t } = useTranslation();
  return (
    <div ref={bodyRef} className="overflow-x-auto" onScroll={onBodyScroll}>
      {sortedCountries.length === 0 ? (
        <EmptyState message={t("nomadVisasPage.noResults", "No countries found")} />
      ) : (
        <table
          className="w-full min-w-[var(--tmin-w)] table-fixed border-separate border-spacing-0"
          style={{ "--tmin-w": minW } as CSSProperties}
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
                onRowClick={(code) =>
                  compareMode
                    ? onToggleSelect(code)
                    : void navigate(`${langPrefix}/country/${code.toLowerCase()}`)
                }
                onToggleSelect={onToggleSelect}
                langPrefix={langPrefix}
                lang={i18n.language}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

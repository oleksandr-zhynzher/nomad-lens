import type { NavigateFunction } from "react-router-dom";
import type { RefObject, CSSProperties } from "react";
import type { SortField, SortDirection, VisaRow } from "./nomad-visas.types";
import { NomadVisaTableHeader } from "./NomadVisaTableHeader";
import { NomadVisaTableBody } from "./NomadVisaTableBody";

interface NomadVisaTableContentProps {
  readonly sortedCountries: VisaRow[];
  readonly compareMode: boolean;
  readonly selectedCodes: Set<string>;
  readonly onToggleSelect: (code: string) => void;
  readonly sortField: SortField;
  readonly sortDirection: SortDirection;
  readonly onSort: (field: SortField) => void;
  readonly theadTop: number;
  readonly theadRef: RefObject<HTMLDivElement | null>;
  readonly bodyRef: RefObject<HTMLDivElement | null>;
  readonly onBodyScroll: () => void;
  readonly budget: number;
  readonly langPrefix: string;
  readonly navigate: NavigateFunction;
  readonly highlightCode: string | null;
}

export function NomadVisaTableContent({
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
}: NomadVisaTableContentProps) {
  const minW = compareMode ? "1170px" : "1122px";
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
  return (
    <div className="mx-auto box-content w-full max-w-[1200px] px-4 pb-12">
      <div
        ref={theadRef}
        className="no-scrollbar sticky top-[var(--thead-top)] z-10 overflow-x-scroll bg-bg"
        style={{ "--thead-top": `${theadTop}px` } as CSSProperties}
      >
        <table
          className="w-full min-w-[var(--tmin-w)] table-fixed border-separate border-spacing-0"
          style={{ "--tmin-w": minW } as CSSProperties}
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
      <NomadVisaTableBody
        sortedCountries={sortedCountries}
        compareMode={compareMode}
        selectedCodes={selectedCodes}
        onToggleSelect={onToggleSelect}
        minW={minW}
        bodyRef={bodyRef}
        onBodyScroll={onBodyScroll}
        budget={budget}
        langPrefix={langPrefix}
        navigate={navigate}
        highlightCode={highlightCode}
      />
    </div>
  );
}

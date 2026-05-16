import { LoadingRows } from "@core/ui/states";
import type { NavigateFunction } from "react-router-dom";

import type { SortDirection, SortField, VisaRow } from "./nomad-visas.types";
import { NomadVisaTableContent } from "./NomadVisaTableContent";

interface NomadVisasTableShellProps {
  readonly loading: boolean;
  readonly sortedCountries: VisaRow[];
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
  if (loading) {
    return <LoadingRows count={8} />;
  }

  return (
    <NomadVisaTableContent
      sortedCountries={sortedCountries}
      compareMode={compareMode}
      selectedCodes={selectedCodes}
      onToggleSelect={onToggleSelect}
      sortField={sortField}
      sortDirection={sortDirection}
      onSort={onSort}
      theadTop={theadTop}
      theadRef={theadRef}
      bodyRef={bodyRef}
      onBodyScroll={onBodyScroll}
      budget={budget}
      langPrefix={langPrefix}
      navigate={navigate}
      highlightCode={highlightCode}
    />
  );
}

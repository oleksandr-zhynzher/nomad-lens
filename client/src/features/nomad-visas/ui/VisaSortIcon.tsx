import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";

import type { SortDirection, SortField } from "./nomad-visas.types";

export interface VisaSortIconProps {
  readonly field: SortField;
  readonly sortField: SortField;
  readonly sortDirection: SortDirection;
}

export function VisaSortIcon({ field, sortField, sortDirection }: VisaSortIconProps) {
  if (sortField !== field) {
    return <ChevronsUpDown size={14} className="ml-1 inline opacity-30" />;
  }
  return sortDirection === "asc" ? (
    <ChevronUp size={14} className="ml-1 inline" />
  ) : (
    <ChevronDown size={14} className="ml-1 inline" />
  );
}

import { useTranslation } from "react-i18next";

import type { SortDirection, SortField } from "./nomad-visas.types";
import { VisaSortIcon } from "./VisaSortIcon";

interface NomadVisaTableHeaderProps {
  readonly sortField: SortField;
  readonly sortDirection: SortDirection;
  readonly compareMode: boolean;
  readonly onSort: (field: SortField) => void;
}

export function NomadVisaTableHeader({
  sortField,
  sortDirection,
  compareMode,
  onSort,
}: NomadVisaTableHeaderProps) {
  const { t } = useTranslation();

  return (
    <thead>
      <tr className="border-b-2 border-border">
        {compareMode ? (
          <th className="bg-bg px-3 py-4" aria-label={t("a11y.selectColumn", "Select")} />
        ) : null}
        <th
          onClick={() => {
            onSort("country");
          }}
          className="cursor-pointer bg-bg px-3 py-4 text-left text-[11px] font-semibold tracking-[1px] whitespace-nowrap text-muted uppercase select-none"
        >
          {t("nomadVisasPage.table.country", "Country")}{" "}
          <VisaSortIcon field="country" sortField={sortField} sortDirection={sortDirection} />
        </th>
        <th className="bg-bg px-3 py-4 text-left text-[11px] font-semibold tracking-[1px] whitespace-nowrap text-muted uppercase">
          {t("nomadVisasPage.table.visaName", "Visa Name")}
        </th>
        <th
          onClick={() => {
            onSort("overallScore");
          }}
          className="cursor-pointer bg-bg px-3 py-4 text-right text-[11px] font-semibold tracking-[1px] whitespace-nowrap text-muted uppercase select-none"
        >
          {t("nomadVisasPage.table.overallScore", "Overall Score")}{" "}
          <VisaSortIcon field="overallScore" sortField={sortField} sortDirection={sortDirection} />
        </th>
        <th
          onClick={() => {
            onSort("monthlyBudget");
          }}
          className="cursor-pointer bg-bg px-3 py-4 text-right text-[11px] font-semibold tracking-[1px] whitespace-nowrap text-muted uppercase select-none"
        >
          {t("nomadVisasPage.table.monthlyBudget", "Monthly Budget")}{" "}
          <VisaSortIcon field="monthlyBudget" sortField={sortField} sortDirection={sortDirection} />
        </th>
        <th
          onClick={() => {
            onSort("duration");
          }}
          className="cursor-pointer bg-bg px-3 py-4 text-left text-[11px] font-semibold tracking-[1px] whitespace-nowrap text-muted uppercase select-none"
        >
          {t("nomadVisasPage.table.duration", "Duration")}{" "}
          <VisaSortIcon field="duration" sortField={sortField} sortDirection={sortDirection} />
        </th>
        <th
          onClick={() => {
            onSort("cost");
          }}
          className="cursor-pointer bg-bg px-3 py-4 text-right text-[11px] font-semibold tracking-[1px] whitespace-nowrap text-muted uppercase select-none"
        >
          {t("nomadVisasPage.table.cost", "Cost")}{" "}
          <VisaSortIcon field="cost" sortField={sortField} sortDirection={sortDirection} />
        </th>
        <th
          onClick={() => {
            onSort("income");
          }}
          className="cursor-pointer bg-bg px-3 py-4 text-right text-[11px] font-semibold tracking-[1px] whitespace-nowrap text-muted uppercase select-none"
        >
          {t("nomadVisasPage.table.income", "Income Req.")}{" "}
          <VisaSortIcon field="income" sortField={sortField} sortDirection={sortDirection} />
        </th>
        <th
          onClick={() => {
            onSort("tax");
          }}
          className="cursor-pointer bg-bg px-3 py-4 text-center text-[11px] font-semibold tracking-[1px] whitespace-nowrap text-muted uppercase select-none"
        >
          {t("nomadVisasPage.table.tax", "Tax Status")}{" "}
          <VisaSortIcon field="tax" sortField={sortField} sortDirection={sortDirection} />
        </th>
        <th className="bg-bg px-3 py-4" aria-label={t("a11y.actionsColumn", "Actions")} />
      </tr>
    </thead>
  );
}

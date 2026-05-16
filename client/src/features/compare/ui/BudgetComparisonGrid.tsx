import type { CountryData } from "@core/models";
import { localizeCountry } from "@core/utils";
import { BUDGET_COMPARISON_COLUMN_WIDTH } from "@features/budget/constants";
import type { BudgetMatch } from "@features/budget/hooks";
import type { RefObject } from "react";
import { useTranslation } from "react-i18next";

import { BudgetComparisonRows } from "./BudgetComparisonRows";
import { ComparisonTableHeader } from "./ComparisonTableHeader";

interface ComparisonSlot {
  readonly country: CountryData;
  readonly color: string;
  readonly index: number;
}

interface BudgetComparisonGridProps {
  readonly sortedSlots: ComparisonSlot[];
  readonly matchMap: Map<string, BudgetMatch>;
  readonly headerRef: RefObject<HTMLDivElement | null>;
  readonly bodyRef: RefObject<HTMLDivElement | null>;
  readonly lang: string;
}

export function BudgetComparisonGrid({
  sortedSlots,
  matchMap,
  headerRef,
  bodyRef,
  lang,
}: BudgetComparisonGridProps) {
  const { t } = useTranslation();
  return (
    <div className="mt-8">
      <div className="h-px bg-[#1C1C1C]" />
      <ComparisonTableHeader
        ref={headerRef}
        label={t("compare.indicatorHeader", "Category")}
        columns={sortedSlots.map((slot) => ({
          key: slot.index,
          flagUrl: slot.country.flagUrl,
          name: localizeCountry(slot.country, lang).name,
        }))}
        columnWidth={BUDGET_COMPARISON_COLUMN_WIDTH}
      />
      <div ref={bodyRef} className="overflow-x-auto">
        <BudgetComparisonRows sortedSlots={sortedSlots} matchMap={matchMap} />
      </div>
    </div>
  );
}

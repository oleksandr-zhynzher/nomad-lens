import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { LoadingRows, EmptyState } from "@core/ui";
import type { BudgetMatch } from "@features/budget/hooks";
import { BudgetRowItem } from "./BudgetRowItem";

interface BudgetResultsListProps {
  readonly loading: boolean;
  readonly matchesTotal: number;
  readonly filteredMatches: BudgetMatch[];
  readonly compareMode: boolean;
  readonly selectedCodes: Set<string>;
  readonly expandedCode: string | null;
  readonly toggleSelect: (code: string) => void;
  readonly setExpandedCode: Dispatch<SetStateAction<string | null>>;
  readonly budget: number;
}

export function BudgetResultsList({
  loading,
  matchesTotal,
  filteredMatches,
  compareMode,
  selectedCodes,
  expandedCode,
  toggleSelect,
  setExpandedCode,
  budget,
}: BudgetResultsListProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="mt-4">
        <LoadingRows count={8} />
      </div>
    );
  }

  if (matchesTotal === 0) {
    return <EmptyState message={t("budget.noResults", "No countries with cost data available")} />;
  }

  return (
    <div className="flex flex-col">
      <div className="my-4 flex items-center justify-between px-1 text-xs">
        <span className="text-muted">
          {t("countryList.clickHint", "Click on a country to view details")}
        </span>
        <span className="text-dim">
          {t("countryList.count", { count: filteredMatches.length })}
        </span>
      </div>
      {filteredMatches.length === 0 ? (
        <p className="py-20 text-center text-sm text-dim">{t("countryList.noResults")}</p>
      ) : (
        filteredMatches.map((m, i) => (
          <BudgetRowItem
            key={m.country.code}
            match={m}
            rank={i + 1}
            compareMode={compareMode}
            isSelected={selectedCodes.has(m.country.code)}
            expandedCode={expandedCode}
            toggleSelect={toggleSelect}
            setExpandedCode={setExpandedCode}
            budget={budget}
          />
        ))
      )}
    </div>
  );
}

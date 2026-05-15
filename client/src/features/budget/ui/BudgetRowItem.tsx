import type { Dispatch, SetStateAction } from "react";
import { BudgetCountryCard } from "@features/budget/ui";
import type { BudgetMatch } from "@features/budget/hooks";

interface BudgetRowItemProps {
  readonly match: BudgetMatch;
  readonly rank: number;
  readonly compareMode: boolean;
  readonly isSelected: boolean;
  readonly expandedCode: string | null;
  readonly toggleSelect: (code: string) => void;
  readonly setExpandedCode: Dispatch<SetStateAction<string | null>>;
  readonly budget: number;
}

export function BudgetRowItem({
  match,
  rank,
  compareMode,
  isSelected,
  expandedCode,
  toggleSelect,
  setExpandedCode,
  budget,
}: BudgetRowItemProps) {
  return (
    <div
      onClick={
        compareMode
          ? () => {
              toggleSelect(match.country.code);
            }
          : undefined
      }
      onKeyDown={
        compareMode
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleSelect(match.country.code);
              }
            }
          : undefined
      }
      role={compareMode ? "button" : undefined}
      tabIndex={compareMode ? 0 : undefined}
      className={compareMode ? "cursor-pointer" : ""}
    >
      <BudgetCountryCard
        match={match}
        budget={budget}
        rank={rank}
        expanded={compareMode ? undefined : expandedCode === match.country.code}
        onToggle={
          compareMode
            ? undefined
            : () => {
                setExpandedCode((prev) =>
                  prev === match.country.code ? null : match.country.code,
                );
              }
        }
        compareMode={compareMode}
        isSelected={isSelected}
      />
    </div>
  );
}

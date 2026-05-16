import type { BudgetMatch } from "@features/budget/hooks";
import { BudgetCountryCard } from "@features/budget/ui";
import type { Dispatch, SetStateAction } from "react";

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
      {...(compareMode
        ? {
            onClick: () => {
              toggleSelect(match.country.code);
            },
            onKeyDown: (event: React.KeyboardEvent) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleSelect(match.country.code);
              }
            },
            role: "button" as const,
            tabIndex: 0,
          }
        : {})}
      className={compareMode ? "cursor-pointer" : ""}
    >
      <BudgetCountryCard
        match={match}
        budget={budget}
        rank={rank}
        {...(!compareMode && { expanded: expandedCode === match.country.code })}
        {...(!compareMode && {
          onToggle: () => {
            setExpandedCode((prev) => (prev === match.country.code ? null : match.country.code));
          },
        })}
        compareMode={compareMode}
        isSelected={isSelected}
      />
    </div>
  );
}

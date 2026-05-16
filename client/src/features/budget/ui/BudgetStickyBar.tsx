import { CompareModeActions, SearchInput } from "@core/ui";
import { BUDGET_CATEGORIES, COST_COLORS } from "@features/budget/constants";
import type { RefObject } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface BudgetStickyBarProps {
  readonly searchInputRef: RefObject<HTMLInputElement | null>;
  readonly search: string;
  readonly onSearch: (value: string) => void;
  readonly compareMode: boolean;
  readonly selectedCodes: Set<string>;
  readonly onEnterCompareMode: () => void;
  readonly onExitCompareMode: () => void;
  readonly onCompare: () => void;
  readonly langPrefix: string;
}

export function BudgetStickyBar({
  searchInputRef,
  search,
  onSearch,
  compareMode,
  selectedCodes,
  onEnterCompareMode,
  onExitCompareMode,
  onCompare,
  langPrefix,
}: BudgetStickyBarProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className="h-0" />
      <div className="sticky top-14 z-20 -mx-4 border-b border-surface bg-bg px-4 py-3 md:-mx-6 md:px-6">
        <div className="mb-1 flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput
            name="budget-country-search"
            value={search}
            onValueChange={onSearch}
            placeholder={t("search.placeholder", "Search countries…")}
            clearLabel={t("a11y.clearSearch", "Clear search")}
            inputRef={searchInputRef}
          />
          <CompareModeActions
            active={compareMode}
            selectedCount={selectedCodes.size}
            enterLabel={t("compare.compareMode", "Compare")}
            compareLabel={t("nomadVisasPage.compareSelected", "Compare")}
            exitLabel={t("a11y.exitCompareMode", "Exit compare mode")}
            {...(compareMode && {
              helperText: t(
                "compare.helperText",
                "Choose countries using the checkboxes in the list, then click Compare to open the comparison view.",
              ),
            })}
            onEnter={onEnterCompareMode}
            onExit={onExitCompareMode}
            onCompare={onCompare}
          />
        </div>
        <Link
          to={`${langPrefix}/budget-categories`}
          className="flex flex-wrap gap-x-4 gap-y-1 px-0.5 no-underline"
        >
          {BUDGET_CATEGORIES.map(({ key }) => (
            <div key={key} className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 shrink-0 rounded-full bg-[var(--c)]"
                style={{ "--c": COST_COLORS[key] } as React.CSSProperties}
              />
              <span className="text-[11px] text-dim">{t(`budget.categories.${key}`)}</span>
            </div>
          ))}
        </Link>
      </div>
    </>
  );
}

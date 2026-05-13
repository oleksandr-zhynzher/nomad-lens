import { ChevronDown, ChevronUp, Filter, List, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "@core/ui";
import type { SearchMode } from "./home.types";
import { homeNavButtonClass } from "./home.utils";

export interface HomeSearchControlsProps {
  readonly searchMode: SearchMode;
  readonly search: string;
  readonly matchingCodes: readonly string[];
  readonly matchCursor: number;
  readonly onClear: () => void;
  readonly onPrev: () => void;
  readonly onNext: () => void;
  readonly onModeChange: (mode: SearchMode) => void;
  readonly onCursorReset: () => void;
}

export function HomeSearchControls({
  searchMode,
  search,
  matchingCodes,
  matchCursor,
  onClear,
  onPrev,
  onNext,
  onModeChange,
  onCursorReset,
}: HomeSearchControlsProps) {
  const { t } = useTranslation();
  const hasMatches = matchingCodes.length > 0;
  return (
    <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1">
      <button
        onClick={onClear}
        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-[3px] border-0 bg-surface-4 text-tertiary"
        aria-label={t("a11y.clearSearch", "Clear search")}
      >
        <X size={14} />
      </button>
      {searchMode === "highlight" && search.trim().length > 0 ? (
        <>
          <span className="min-w-9 text-right font-mono text-[11px] text-dim">
            {hasMatches ? `${matchCursor + 1}/${matchingCodes.length}` : "0/0"}
          </span>
          <button
            onClick={onPrev}
            disabled={!hasMatches}
            className={homeNavButtonClass(hasMatches)}
            aria-label={t("a11y.previousMatch", "Previous match")}
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={onNext}
            disabled={!hasMatches}
            className={homeNavButtonClass(hasMatches)}
            aria-label={t("a11y.nextMatch", "Next match")}
          >
            <ChevronDown size={14} />
          </button>
        </>
      ) : null}
      <Tooltip
        side="bottom"
        content={
          searchMode === "filter" ? (
            <span>
              {t(
                "a11y.searchModeScrollTooltip",
                "Switch to scroll mode - shows all countries and scrolls to each match.",
              )}
            </span>
          ) : (
            <span>
              {t(
                "a11y.searchModeFilterTooltip",
                "Switch to filter mode - hides non-matching countries.",
              )}
            </span>
          )
        }
      >
        <button
          onClick={() => {
            onModeChange(searchMode === "filter" ? "highlight" : "filter");
            onCursorReset();
          }}
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-[3px] border-0 bg-surface-4 text-muted"
          aria-label={
            searchMode === "filter"
              ? t("a11y.switchToScrollMode", "Switch to scroll mode")
              : t("a11y.switchToFilterMode", "Switch to filter mode")
          }
        >
          {searchMode === "filter" ? <List size={13} /> : <Filter size={13} />}
        </button>
      </Tooltip>
    </div>
  );
}

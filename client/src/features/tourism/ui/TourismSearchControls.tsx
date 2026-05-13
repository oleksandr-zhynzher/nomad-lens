import { ChevronDown, ChevronUp, Filter, List } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "@core/ui";
import type { SearchMode } from "./tourism.types";
import { navButtonClass } from "./tourism.utils";

export interface TourismSearchControlsProps {
  readonly searchMode: SearchMode;
  readonly matchingCodes: readonly string[];
  readonly matchCursor: number;
  readonly onPrev: () => void;
  readonly onNext: () => void;
  readonly onModeChange: (mode: SearchMode) => void;
  readonly onCursorReset: () => void;
}

export function TourismSearchControls({
  searchMode,
  matchingCodes,
  matchCursor,
  onPrev,
  onNext,
  onModeChange,
  onCursorReset,
}: TourismSearchControlsProps) {
  const { t } = useTranslation();
  const hasMatches = matchingCodes.length > 0;
  return (
    <div className="flex shrink-0 items-center gap-1">
      {searchMode === "highlight" && hasMatches ? (
        <>
          <span className="font-mono text-[11px] whitespace-nowrap text-dim">
            {matchCursor + 1}/{matchingCodes.length}
          </span>
          <button
            onClick={onPrev}
            disabled={!hasMatches}
            className={navButtonClass(hasMatches)}
            aria-label={t("tourism.a11y.previousMatch", "Previous match")}
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={onNext}
            disabled={!hasMatches}
            className={navButtonClass(hasMatches)}
            aria-label={t("tourism.a11y.nextMatch", "Next match")}
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
                "tourism.searchModeScrollTooltip",
                "Switch to scroll mode - shows all countries and scrolls to each match.",
              )}
            </span>
          ) : (
            <span>
              {t(
                "tourism.searchModeFilterTooltip",
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
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-[3px] border-0 bg-[#2A2A2A] text-on-surface"
          aria-label={
            searchMode === "filter"
              ? t("tourism.a11y.switchToScrollMode", "Switch to scroll mode")
              : t("tourism.a11y.switchToFilterMode", "Switch to filter mode")
          }
        >
          {searchMode === "filter" ? <List size={13} /> : <Filter size={13} />}
        </button>
      </Tooltip>
    </div>
  );
}

import { SearchMatchControls } from "@core/ui/forms/SearchMatchControls";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { SearchMode } from "./home.types";

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
  return (
    <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1">
      <button
        type="button"
        onClick={onClear}
        className="flex size-6 cursor-pointer items-center justify-center rounded-[3px] border-0 bg-surface-4 text-tertiary"
        aria-label={t("a11y.clearSearch", "Clear search")}
      >
        <X size={14} />
      </button>
      {search.trim().length > 0 ? (
        <SearchMatchControls
          mode={searchMode}
          matchCount={matchingCodes.length}
          cursor={matchCursor}
          onPrev={onPrev}
          onNext={onNext}
          onModeChange={(mode) => {
            onModeChange(mode);
            onCursorReset();
          }}
          scrollModeTooltip={t(
            "a11y.searchModeScrollTooltip",
            "Switch to scroll mode - shows all countries and scrolls to each match.",
          )}
          filterModeTooltip={t(
            "a11y.searchModeFilterTooltip",
            "Switch to filter mode - hides non-matching countries.",
          )}
          prevLabel={t("a11y.previousMatch", "Previous match")}
          nextLabel={t("a11y.nextMatch", "Next match")}
          switchToScrollLabel={t("a11y.switchToScrollMode", "Switch to scroll mode")}
          switchToFilterLabel={t("a11y.switchToFilterMode", "Switch to filter mode")}
        />
      ) : null}
    </div>
  );
}

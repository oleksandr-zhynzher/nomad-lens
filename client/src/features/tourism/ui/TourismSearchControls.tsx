import { SearchMatchControls } from "@core/ui/forms/SearchMatchControls";
import { useTranslation } from "react-i18next";

import type { SearchMode } from "./tourism.types";

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
  return (
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
        "tourism.searchModeScrollTooltip",
        "Switch to scroll mode - shows all countries and scrolls to each match.",
      )}
      filterModeTooltip={t(
        "tourism.searchModeFilterTooltip",
        "Switch to filter mode - hides non-matching countries.",
      )}
      prevLabel={t("tourism.a11y.previousMatch", "Previous match")}
      nextLabel={t("tourism.a11y.nextMatch", "Next match")}
      switchToScrollLabel={t("tourism.a11y.switchToScrollMode", "Switch to scroll mode")}
      switchToFilterLabel={t("tourism.a11y.switchToFilterMode", "Switch to filter mode")}
      navButtonClassName="flex h-6 w-6 cursor-pointer items-center justify-center rounded-[3px] border-0 bg-[#2A2A2A] text-on-surface disabled:opacity-40"
    />
  );
}

import { CompareModeActions } from "@core/ui";
import type { TourismTag } from "@features/tourism/hooks";
import { useTranslation } from "react-i18next";

import type { SearchMode } from "./tourism.types";
import { TourismSearchBar } from "./TourismSearchBar";
import { TourismTagFilters } from "./TourismTagFilters";

interface TourismStickyBarProps {
  readonly search: string;
  readonly updateSearch: (v: string) => void;
  readonly clearSearch: () => void;
  readonly searchMode: SearchMode;
  readonly setSearchMode: (m: SearchMode) => void;
  readonly matchingCodes: string[];
  readonly matchCursor: number;
  readonly setMatchCursor: (n: number) => void;
  readonly goNext: () => void;
  readonly goPrev: () => void;
  readonly searchInputRef: React.RefObject<HTMLInputElement | null>;
  readonly compareMode: boolean;
  readonly selectedCodes: Set<string>;
  readonly onEnterCompareMode: () => void;
  readonly exitCompareMode: () => void;
  readonly handleCompare: () => void;
  readonly requiredTags: string[];
  readonly onToggleTag: (tag: TourismTag) => void;
}

export function TourismStickyBar({
  search,
  updateSearch,
  clearSearch,
  searchMode,
  setSearchMode,
  matchingCodes,
  matchCursor,
  setMatchCursor,
  goNext,
  goPrev,
  searchInputRef,
  compareMode,
  selectedCodes,
  onEnterCompareMode,
  exitCompareMode,
  handleCompare,
  requiredTags,
  onToggleTag,
}: TourismStickyBarProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className="sticky top-14 z-20 bg-[#0A0A0F] pt-2 pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
          <TourismSearchBar
            search={search}
            updateSearch={updateSearch}
            clearSearch={clearSearch}
            searchMode={searchMode}
            setSearchMode={setSearchMode}
            matchingCodes={matchingCodes}
            matchCursor={matchCursor}
            setMatchCursor={setMatchCursor}
            goNext={goNext}
            goPrev={goPrev}
            searchInputRef={searchInputRef}
          />
          <CompareModeActions
            active={compareMode}
            selectedCount={selectedCodes.size}
            enterLabel={t("compare.compareMode", "Compare")}
            compareLabel={t("compare.compareSelected", "Compare")}
            exitLabel={t("tourism.a11y.exitCompareMode", "Exit compare mode")}
            {...(compareMode && {
              helperText: t(
                "compare.helperText",
                "Choose countries using the checkboxes in the list, then click Compare to open the comparison view.",
              ),
            })}
            onEnter={onEnterCompareMode}
            onExit={exitCompareMode}
            onCompare={handleCompare}
          />
        </div>
      </div>
      <TourismTagFilters requiredTags={requiredTags} onToggleTag={onToggleTag} />
    </>
  );
}

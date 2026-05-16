import { CompareModeActions } from "@core/ui";
import { useTranslation } from "react-i18next";

import type { SearchMode } from "./home.types";
import { HomeSearchInput } from "./HomeSearchInput";

interface HomeSearchRowProps {
  readonly search: string;
  readonly updateSearch: (v: string) => void;
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
}

export function HomeSearchRow({
  search,
  updateSearch,
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
}: HomeSearchRowProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <HomeSearchInput
        searchInputRef={searchInputRef}
        search={search}
        updateSearch={updateSearch}
        searchMode={searchMode}
        setSearchMode={setSearchMode}
        matchingCodes={matchingCodes}
        matchCursor={matchCursor}
        setMatchCursor={setMatchCursor}
        goNext={goNext}
        goPrev={goPrev}
      />
      <CompareModeActions
        active={compareMode}
        selectedCount={selectedCodes.size}
        enterLabel={t("compare.compareMode", "Compare")}
        compareLabel={t("compare.compareSelected", "Compare")}
        exitLabel={t("a11y.exitCompareMode", "Exit compare mode")}
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
  );
}

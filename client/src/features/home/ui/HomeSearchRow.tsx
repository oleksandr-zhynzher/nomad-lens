import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CompareModeActions } from "@core/ui";
import type { SearchMode } from "./home.types";
import { getSearchPaddingRight } from "./home.utils";
import { HomeSearchControls } from "./HomeSearchControls";

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
      <div className="relative min-w-0 flex-1">
        <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-dim" size={18} />
        <input
          ref={searchInputRef}
          name="country-search"
          type="text"
          placeholder={t("search.placeholder")}
          value={search}
          onChange={(e) => {
            updateSearch(e.target.value);
          }}
          className="h-10 w-full rounded-md border border-surface bg-[#161616] pr-[var(--pr)] pl-12 text-sm text-white focus:outline-none"
          style={
            {
              "--pr": getSearchPaddingRight(
                search.length === 0,
                searchMode,
                search.trim().length > 0,
              ),
            } as React.CSSProperties
          }
        />
        {search !== "" ? (
          <HomeSearchControls
            searchMode={searchMode}
            search={search}
            matchingCodes={matchingCodes}
            matchCursor={matchCursor}
            onClear={() => {
              updateSearch("");
            }}
            onPrev={goPrev}
            onNext={goNext}
            onModeChange={setSearchMode}
            onCursorReset={() => {
              setMatchCursor(0);
            }}
          />
        ) : null}
      </div>
      <CompareModeActions
        active={compareMode}
        selectedCount={selectedCodes.size}
        enterLabel={t("compare.compareMode", "Compare")}
        compareLabel={t("compare.compareSelected", "Compare")}
        exitLabel={t("a11y.exitCompareMode", "Exit compare mode")}
        helperText={
          compareMode
            ? t(
                "compare.helperText",
                "Choose countries using the checkboxes in the list, then click Compare to open the comparison view.",
              )
            : undefined
        }
        onEnter={onEnterCompareMode}
        onExit={exitCompareMode}
        onCompare={handleCompare}
      />
    </div>
  );
}

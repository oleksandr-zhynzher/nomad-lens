import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { SearchMode } from "./home.types";
import { getSearchPaddingRight } from "./home.utils";
import { HomeSearchControls } from "./HomeSearchControls";

interface HomeSearchInputProps {
  readonly searchInputRef: React.RefObject<HTMLInputElement | null>;
  readonly search: string;
  readonly updateSearch: (v: string) => void;
  readonly searchMode: SearchMode;
  readonly setSearchMode: (m: SearchMode) => void;
  readonly matchingCodes: string[];
  readonly matchCursor: number;
  readonly setMatchCursor: (n: number) => void;
  readonly goNext: () => void;
  readonly goPrev: () => void;
}

export function HomeSearchInput({
  searchInputRef,
  search,
  updateSearch,
  searchMode,
  setSearchMode,
  matchingCodes,
  matchCursor,
  setMatchCursor,
  goNext,
  goPrev,
}: HomeSearchInputProps) {
  const { t } = useTranslation();
  return (
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
  );
}

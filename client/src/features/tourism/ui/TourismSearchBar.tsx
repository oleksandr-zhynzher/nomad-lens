import { useTranslation } from "react-i18next";
import type { SearchMode } from "./tourism.types";
import { TourismSearchControls } from "./TourismSearchControls";

interface TourismSearchBarProps {
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
}

export function TourismSearchBar({
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
}: TourismSearchBarProps) {
  const { t } = useTranslation();
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <div className="flex h-10 flex-1 items-center gap-2 rounded-[6px] border border-[#333333] bg-[#1A1A1C] px-3">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#757575"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={searchInputRef}
          name="tourism-search"
          type="text"
          value={search}
          onChange={(e) => {
            updateSearch(e.target.value);
            setMatchCursor(0);
          }}
          placeholder={t("tourism.searchPlaceholder", "Search countries…")}
          className="flex-1 border-none bg-transparent text-sm text-[#E8E9EB] outline-none"
        />
        {search !== "" ? (
          <button
            type="button"
            onClick={clearSearch}
            className="flex cursor-pointer items-center border-0 bg-transparent text-dimmer"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        ) : null}
      </div>
      {search.trim() !== "" ? (
        <TourismSearchControls
          searchMode={searchMode}
          matchingCodes={matchingCodes}
          matchCursor={matchCursor}
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

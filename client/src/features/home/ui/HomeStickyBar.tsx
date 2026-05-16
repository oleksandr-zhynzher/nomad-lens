import { useRef } from "react";

import type { SearchMode } from "./home.types";
import { HomeRegionFilters } from "./HomeRegionFilters";
import { HomeSearchRow } from "./HomeSearchRow";
import { useHomeStickyScroll } from "./useHomeStickyScroll";

interface HomeStickyBarProps {
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
  readonly regions: string[];
  readonly selectedRegions: Set<string>;
  readonly setSelectedRegions: (fn: (prev: Set<string>) => Set<string>) => void;
  readonly onClearRegions: () => void;
}

export function HomeStickyBar({
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
  regions,
  selectedRegions,
  setSelectedRegions,
  onClearRegions,
}: HomeStickyBarProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isSticky = useHomeStickyScroll(sentinelRef);
  return (
    <>
      <div ref={sentinelRef} className="h-0" />
      <div
        className={`sticky top-14 z-20 -mx-4 border-b border-surface bg-bg px-4 pb-4 md:-mx-6 md:px-6 ${isSticky ? "pt-3" : "pt-0"}`}
      >
        <div className={isSticky ? "" : "mb-4"}>
          <HomeSearchRow
            search={search}
            updateSearch={updateSearch}
            searchMode={searchMode}
            setSearchMode={setSearchMode}
            matchingCodes={matchingCodes}
            matchCursor={matchCursor}
            setMatchCursor={setMatchCursor}
            goNext={goNext}
            goPrev={goPrev}
            searchInputRef={searchInputRef}
            compareMode={compareMode}
            selectedCodes={selectedCodes}
            onEnterCompareMode={onEnterCompareMode}
            exitCompareMode={exitCompareMode}
            handleCompare={handleCompare}
          />
        </div>
        {isSticky ? null : (
          <HomeRegionFilters
            regions={regions}
            selectedRegions={selectedRegions}
            setSelectedRegions={setSelectedRegions}
            onClearRegions={onClearRegions}
          />
        )}
      </div>
    </>
  );
}

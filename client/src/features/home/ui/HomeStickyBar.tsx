import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CompareModeActions } from "@core/ui";
import type { SearchMode } from "./home.types";
import { getSearchPaddingRight } from "./home.utils";
import { HomeSearchControls } from "./HomeSearchControls";

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
  const { t } = useTranslation();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const HEADER_H = 57;
    let ticking = false;
    const update = () => {
      const rect = sentinelRef.current?.getBoundingClientRect();
      if (rect) setIsSticky(rect.top < HEADER_H);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="h-0" />
      <div
        className={`sticky top-14 z-20 -mx-4 border-b border-surface bg-bg px-4 pb-4 md:-mx-6 md:px-6 ${isSticky ? "pt-3" : "pt-0"}`}
      >
        <div className={isSticky ? "" : "mb-4"}>
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
        </div>
        {isSticky ? null : (
          <div className="mb-0">
            <div className="mb-3 text-[13px] font-bold tracking-[2px] text-muted uppercase">
              {t("regions.label")}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onClearRegions}
                className={`cursor-pointer rounded-[3px] border-0 px-[18px] py-2 text-[13px] font-semibold ${selectedRegions.size === 0 ? "bg-accent text-white" : "bg-surface-4 text-muted"}`}
              >
                {t("regions.all")}
              </button>
              {regions.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setSelectedRegions((prev) => {
                      const next = new Set(prev);
                      if (next.has(r)) {
                        next.delete(r);
                      } else {
                        next.add(r);
                      }
                      return next;
                    });
                  }}
                  className={`cursor-pointer rounded-[3px] border-0 px-[18px] py-2 text-[13px] font-semibold ${selectedRegions.has(r) ? "bg-accent text-white" : "bg-surface-4 text-muted"}`}
                >
                  {t(`regions.${r.replaceAll(/\s/g, "")}`, r)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

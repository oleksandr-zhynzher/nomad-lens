import { useTranslation } from "react-i18next";
import { CompareModeActions } from "@core/ui";
import { ALL_TOURISM_TAGS, type TourismTag } from "@features/tourism/hooks";
import type { SearchMode } from "./tourism.types";
import { TourismSearchControls } from "./TourismSearchControls";

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
          <CompareModeActions
            active={compareMode}
            selectedCount={selectedCodes.size}
            enterLabel={t("compare.compareMode", "Compare")}
            compareLabel={t("compare.compareSelected", "Compare")}
            exitLabel={t("tourism.a11y.exitCompareMode", "Exit compare mode")}
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
      <div className="mb-0">
        <div className="mb-3 text-[13px] font-bold tracking-[2px] text-on-surface uppercase">
          {t("tourismFilters.activityTags", "Activities")}
        </div>
        <div className="flex flex-wrap gap-2">
          {ALL_TOURISM_TAGS.map((tag) => {
            const active = requiredTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  onToggleTag(tag);
                }}
                className={`cursor-pointer rounded-[3px] border-0 px-[18px] py-2 text-[13px] font-semibold ${active ? "bg-[#8F5A3C] text-white" : "bg-[#2A2A2A] text-on-surface"}`}
              >
                {t(`tourismTags.${tag}`, tag)}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

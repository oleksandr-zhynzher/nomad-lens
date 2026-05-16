import { GitCompare, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface NomadVisasToolbarProps {
  readonly searchBarRef: React.RefObject<HTMLDivElement | null>;
  readonly searchQuery: string;
  readonly onSearchQueryChange: (v: string) => void;
  readonly compareMode: boolean;
  readonly onEnterCompareMode: () => void;
  readonly selectedCodes: Set<string>;
  readonly onCompare: () => void;
  readonly onExitCompareMode: () => void;
}
export function NomadVisasToolbar({
  searchBarRef,
  searchQuery,
  onSearchQueryChange,
  compareMode,
  onEnterCompareMode,
  selectedCodes,
  onCompare,
  onExitCompareMode,
}: NomadVisasToolbarProps) {
  const { t } = useTranslation();
  return (
    <div ref={searchBarRef} className="sticky top-14 z-20 bg-bg py-3">
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              size={16}
              color="#808080"
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
            />
            <input
              name="visa-country-search"
              type="text"
              placeholder={t("nomadVisasPage.search", "Search countries...")}
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className={`h-10 w-full rounded-md border border-surface bg-[#161616] pl-9 text-sm text-white outline-none ${searchQuery !== "" ? "pr-9" : "pr-3"}`}
            />
            {searchQuery !== "" ? (
              <button
                onClick={() => onSearchQueryChange("")}
                className="absolute top-1/2 right-2.5 flex h-[22px] w-[22px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-[3px] border-0 bg-surface-4 text-tertiary"
                aria-label={t("a11y.clearSearch", "Clear search")}
              >
                <X size={12} />
              </button>
            ) : null}
          </div>
          {compareMode ? (
            <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto">
              <button
                onClick={onCompare}
                disabled={selectedCodes.size < 2}
                className={`flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md px-3.5 text-[13px] font-semibold whitespace-nowrap transition-all sm:flex-none cursor-${selectedCodes.size < 2 ? "default" : "pointer"} ${selectedCodes.size < 2 ? "border border-accent-dim bg-transparent text-accent-dim" : "border-0 bg-accent text-white"}`}
              >
                <GitCompare size={15} />
                {t("nomadVisasPage.compareSelected", "Compare")}
                {selectedCodes.size > 0 ? (
                  <span
                    className={`rounded-[10px] px-[7px] py-px text-xs ${selectedCodes.size < 2 ? "bg-[rgba(143,90,60,0.2)]" : "bg-[rgba(255,255,255,0.25)]"}`}
                  >
                    {selectedCodes.size}
                  </span>
                ) : null}
              </button>
              <button
                onClick={onExitCompareMode}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-surface-4 bg-transparent text-dim"
                aria-label={t("a11y.exitCompareMode", "Exit compare mode")}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={onEnterCompareMode}
              className="flex h-10 w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-surface-4 bg-transparent px-3.5 text-[13px] font-medium whitespace-nowrap text-muted sm:w-auto"
            >
              <GitCompare size={15} />
              {t("nomadVisasPage.compareMode", "Compare")}
            </button>
          )}
        </div>
        {compareMode ? (
          <p className="mt-1.5 text-xs text-dim">
            {t(
              "compare.helperText",
              "Choose countries using the checkboxes in the list, then click Compare to open the comparison view.",
            )}
          </p>
        ) : null}
      </div>
    </div>
  );
}

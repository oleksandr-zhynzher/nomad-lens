import { useTranslation } from "react-i18next";
import type { RankedCountry } from "@core/models";
import { CountryCard } from "./CountryCard";
import { useInfiniteScroll } from "@features/country-ranking/hooks";

interface CountryListProps {
  ranked: RankedCountry[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  highlightedCode?: string | null;
  expandedCode?: string | null;
  onToggleExpanded?: (code: string) => void;
  /** When true (e.g. active search), all items are rendered without pagination */
  showAll?: boolean;
  compareMode?: boolean;
  selectedCodes?: Set<string>;
  onToggleSelect?: (code: string) => void;
}

export function CountryList({
  ranked,
  loading,
  error,
  onRetry,
  highlightedCode,
  expandedCode,
  onToggleExpanded,
  showAll = false,
  compareMode = false,
  selectedCodes = new Set<string>(),
  onToggleSelect,
}: CountryListProps) {
  const { t } = useTranslation();

  const { visible, hasMore, sentinelRef } = useInfiniteScroll(ranked, showAll);

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse bg-surface border-t border-border" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-danger">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded text-sm font-medium transition-colors bg-accent text-white"
        >
          {t("countryList.retry")}
        </button>
      </div>
    );
  }

  if (ranked.length === 0) {
    return <p className="text-center py-20 text-sm text-dim">{t("countryList.noResults")}</p>;
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-1 my-4 text-xs">
        <span className="text-muted">
          {compareMode
            ? t("compare.countrySubtitle", "Select countries to compare across all indicators")
            : t("countryList.clickHint", "Click on a country to view details")}
        </span>
        <span className="text-dim">{t("countryList.count", { count: ranked.length })}</span>
      </div>
      {visible.map((r, index) => (
        <CountryCard
          key={r.country.code}
          ranked={r}
          highlighted={r.country.code === highlightedCode}
          index={index}
          expanded={expandedCode === r.country.code}
          onToggle={() => onToggleExpanded?.(r.country.code)}
          compareMode={compareMode}
          selected={selectedCodes.has(r.country.code)}
          onSelectToggle={() => onToggleSelect?.(r.country.code)}
        />
      ))}
      {/* Invisible sentinel — entering the viewport triggers the next page load */}
      {hasMore && <div ref={sentinelRef} className="h-px" />}
    </div>
  );
}

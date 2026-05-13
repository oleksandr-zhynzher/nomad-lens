import { useTranslation } from "react-i18next";
import type { RankedCountry, WeightMap } from "@core/models";
import { CountryCard } from "./CountryCard";
import { useInfiniteScroll } from "@features/country-ranking/hooks";

interface CountryListProps {
  readonly ranked: RankedCountry[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly onRetry: () => void;
  readonly highlightedCode?: string | null;
  readonly expandedCode?: string | null;
  readonly onToggleExpanded?: (code: string) => void;
  /** When true (e.g. active search), all items are rendered without pagination */
  readonly showAll?: boolean;
  readonly compareMode?: boolean;
  readonly selectedCodes?: Set<string>;
  readonly onToggleSelect?: (code: string) => void;
  /** Active weight map — dots are hidden for categories with weight 0. */
  readonly weights?: WeightMap;
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
  weights,
}: CountryListProps) {
  const { t } = useTranslation();

  const { visible, hasMore, sentinelRef } = useInfiniteScroll(ranked, showAll);

  if (loading) {
    const SKELETON_KEYS = ["s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7"] as const;
    return (
      <div className="flex flex-col gap-2">
        {SKELETON_KEYS.map((k) => (
          <div key={k} className="h-14 animate-pulse border-t border-border bg-surface" />
        ))}
      </div>
    );
  }

  if (error !== null) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-danger">{error}</p>
        <button
          onClick={onRetry}
          className="rounded bg-accent px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          {t("countryList.retry")}
        </button>
      </div>
    );
  }

  if (ranked.length === 0) {
    return <p className="py-20 text-center text-sm text-dim">{t("countryList.noResults")}</p>;
  }

  return (
    <div className="flex flex-col">
      <div className="my-4 flex items-center justify-between px-1 text-xs">
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
          weights={weights}
        />
      ))}
      {/* Invisible sentinel — entering the viewport triggers the next page load */}
      {hasMore ? <div ref={sentinelRef} className="h-px" /> : null}
    </div>
  );
}

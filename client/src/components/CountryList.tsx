import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { RankedCountry } from "../utils/types";
import { CountryCard } from "./CountryCard";

const PAGE_SIZE = 50;

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

  // Track visible count and reset it whenever the ranked list identity changes.
  // Storing prevRanked in state is the React-recommended pattern for deriving
  // state from props without a useEffect.
  const [{ prevRanked, visibleCount }, setPagination] = useState({
    prevRanked: ranked,
    visibleCount: PAGE_SIZE,
  });
  if (prevRanked !== ranked) {
    setPagination({ prevRanked: ranked, visibleCount: PAGE_SIZE });
  }

  // Sentinel element observed to auto-load the next page on scroll
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (showAll) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPagination((s) =>
            s.visibleCount < s.prevRanked.length
              ? { ...s, visibleCount: s.visibleCount + PAGE_SIZE }
              : s,
          );
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [showAll, ranked]);

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-14 animate-pulse"
            style={{
              backgroundColor: "#1A1A1A",
              borderTop: "1px solid #333333",
            }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p
          style={{
            color: "var(--color-danger)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {error}
        </p>
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded text-sm transition-colors"
          style={{
            backgroundColor: "var(--color-accent)",
            color: "#FFFFFF",
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
          }}
        >
          {t("countryList.retry")}
        </button>
      </div>
    );
  }

  if (ranked.length === 0) {
    return (
      <p
        className="text-center py-20"
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
          color: "#8A8A8A",
        }}
      >
        {t("countryList.noResults")}
      </p>
    );
  }

  const visible = showAll ? ranked : ranked.slice(0, visibleCount);
  const hasMore = !showAll && visibleCount < ranked.length;

  return (
    <div className="flex flex-col">
      <div
        className="flex items-center justify-between px-1 my-4"
        style={{ fontFamily: "Inter, sans-serif", fontSize: "12px" }}
      >
        <span style={{ color: "#9E9E9E" }}>
          {compareMode
            ? t(
                "compare.countrySubtitle",
                "Select countries to compare across all indicators",
              )
            : t("countryList.clickHint", "Click on a country to view details")}
        </span>
        <span style={{ color: "#8A8A8A" }}>
          {t("countryList.count", { count: ranked.length })}
        </span>
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
      {hasMore && <div ref={sentinelRef} style={{ height: "1px" }} />}
    </div>
  );
}

import { useState } from "react";
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
}

export function CountryList({
  ranked,
  loading,
  error,
  onRetry,
  highlightedCode,
  expandedCode,
  onToggleExpanded,
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
          color: "#666666",
        }}
      >
        {t("countryList.noResults")}
      </p>
    );
  }

  const visible = ranked.slice(0, visibleCount);
  const hasMore = visibleCount < ranked.length;

  return (
    <div className="flex flex-col">
      <p
        className="text-xs text-right pr-1 my-4"
        style={{ fontFamily: "Inter, sans-serif", color: "#666666" }}
      >
        {t("countryList.count", { count: ranked.length })}
      </p>
      {visible.map((r, index) => (
        <CountryCard
          key={r.country.code}
          ranked={r}
          highlighted={r.country.code === highlightedCode}
          index={index}
          expanded={expandedCode === r.country.code}
          onToggle={() => onToggleExpanded?.(r.country.code)}
        />
      ))}
      {hasMore && (
        <button
          onClick={() =>
            setPagination((s) => ({
              ...s,
              visibleCount: s.visibleCount + PAGE_SIZE,
            }))
          }
          className="w-full py-3 transition-colors"
          style={{
            backgroundColor: "transparent",
            border: "1px solid #252525",
            borderTop: "none",
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            color: "#555555",
            cursor: "pointer",
          }}
        >
          {t("countryList.showMore", {
            shown: visible.length,
            total: ranked.length,
          })}
        </button>
      )}
    </div>
  );
}

import type { RankedCountry } from "../utils/types";
import { CountryCard } from "./CountryCard";

interface CountryListProps {
  ranked: RankedCountry[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  highlightedCode?: string | null;
  expandedCode?: string | null;
  onToggleExpanded?: (code: string) => void;
}

export function CountryList({ ranked, loading, error, onRetry, highlightedCode, expandedCode, onToggleExpanded }: CountryListProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-14 animate-pulse"
            style={{ backgroundColor: "#1A1A1A", borderTop: "1px solid #333333" }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p style={{ color: "var(--color-danger)", fontFamily: "Inter, sans-serif" }}>{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded text-sm transition-colors"
          style={{ backgroundColor: "var(--color-accent)", color: "#FFFFFF", fontFamily: "Inter, sans-serif", fontWeight: 500 }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (ranked.length === 0) {
    return (
      <p className="text-center py-20" style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#666666" }}>
        No countries match your search.
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      <p className="text-xs text-right pr-1 mb-2" style={{ fontFamily: "Geist, sans-serif", color: "#666666" }}>
        {ranked.length} countries
      </p>
      {ranked.map((r, index) => (
        <CountryCard
          key={r.country.code}
          ranked={r}
          highlighted={r.country.code === highlightedCode}
          index={index}
          expanded={expandedCode === r.country.code}
          onToggle={() => onToggleExpanded?.(r.country.code)}
        />
      ))}
    </div>
  );
}

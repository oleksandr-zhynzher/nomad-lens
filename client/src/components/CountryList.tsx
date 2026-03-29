import type { RankedCountry } from "../utils/types";
import { CountryCard } from "./CountryCard";

interface CountryListProps {
  ranked: RankedCountry[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function CountryList({ ranked, loading, error, onRetry }: CountryListProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-xl bg-slate-800 animate-pulse border border-slate-700"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-red-400">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (ranked.length === 0) {
    return (
      <p className="text-center text-slate-500 py-20">
        No countries match your search.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-slate-500 text-right pr-1">
        {ranked.length} countries
      </p>
      {ranked.map((r) => (
        <CountryCard key={r.country.code} ranked={r} />
      ))}
    </div>
  );
}

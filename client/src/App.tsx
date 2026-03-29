import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Layout } from "./components/Layout";
import { WeightPanel } from "./components/WeightPanel";
import { CountryList } from "./components/CountryList";
import { WorldMap } from "./components/WorldMap";
import { useCountries } from "./hooks/useCountries";
import { useScoring } from "./hooks/useScoring";
import { defaultWeights } from "./utils/scoring";
import type { CategoryKey, WeightMap } from "./utils/types";
import { CATEGORY_KEYS } from "./utils/types";
import "./index.css";

function weightsFromSearch(search: string): WeightMap {
  const params = new URLSearchParams(search);
  const base = defaultWeights();
  for (const key of CATEGORY_KEYS) {
    const v = params.get(key);
    if (v !== null) {
      const n = Number(v);
      if (!isNaN(n)) base[key] = Math.max(0, Math.min(100, n));
    }
  }
  return base;
}

function weightsToSearch(weights: WeightMap): string {
  const params = new URLSearchParams();
  for (const key of CATEGORY_KEYS) {
    params.set(key, String(weights[key]));
  }
  return params.toString();
}

export default function App() {
  const [weights, setWeights] = useState<WeightMap>(() =>
    weightsFromSearch(window.location.search),
  );
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [view, setView] = useState<"list" | "map">("list");
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { countries, loading, error, refresh } = useCountries();
  const ranked = useScoring(countries, weights, search, region);

  // Sync weights to URL for shareable links
  useEffect(() => {
    const qs = weightsToSearch(weights);
    window.history.replaceState(null, "", "?" + qs);
  }, [weights]);

  const handleWeightChange = useCallback(
    (key: CategoryKey, value: number) => {
      setWeights((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleReset = useCallback(() => {
    setWeights(defaultWeights());
  }, []);

  const handleCountryClick = useCallback((iso2: string) => {
    setView("list");
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    setHighlightedCode(iso2);
    // Scroll after React re-renders
    setTimeout(() => {
      const el = document.querySelector(`[data-country-code="${iso2}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      highlightTimer.current = setTimeout(() => setHighlightedCode(null), 2500);
    }, 80);
  }, []);

  const regions = useMemo(
    () => [...new Set(countries.map((c) => c.region))].sort(),
    [countries],
  );

  return (
    <Layout>
      <div className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          Find Your Ideal Country
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          Compare countries across 9 dimensions. Adjust weights to match your
          priorities — rankings update instantly.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* View toggle */}
        <div className="flex rounded-xl border border-slate-700 p-0.5 bg-slate-800 w-fit">
          {(["list", "map"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-[10px] text-sm font-medium transition-colors ${
                view === v
                  ? "bg-sky-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {v === "list" ? "🗂 List" : "🗺 Map"}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Search countries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
        />
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-sky-500"
        >
          <option value="">All regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      </div>

      {view === "map" ? (
        <WorldMap ranked={ranked} onCountryClick={handleCountryClick} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          <WeightPanel
            weights={weights}
            onChange={handleWeightChange}
            onReset={handleReset}
          />
          <CountryList
            ranked={ranked}
            loading={loading}
            error={error}
            onRetry={refresh}
            highlightedCode={highlightedCode}
          />
        </div>
      )}
    </Layout>
  );
}

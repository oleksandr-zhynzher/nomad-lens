import { useCallback, useEffect, useMemo, useState } from "react";
import { Layout } from "./components/Layout";
import { WeightPanel } from "./components/WeightPanel";
import { CountryList } from "./components/CountryList";
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
        />
      </div>
    </Layout>
  );
}

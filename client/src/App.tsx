import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Layout } from "./components/Layout";
import { WeightPanel } from "./components/WeightPanel";
import { CountryList } from "./components/CountryList";
import { WorldMap } from "./components/WorldMap";
import { useCountries } from "./hooks/useCountries";
import { useScoring } from "./hooks/useScoring";
import { defaultClimatePreferences, defaultWeights } from "./utils/scoring";
import type { CategoryKey, ClimatePreferences, WeightMap } from "./utils/types";
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
  const [showWeights, setShowWeights] = useState(false);
  const [nomadVisaOnly, setNomadVisaOnly] = useState(false);
  const [climatePrefs, setClimatePrefs] = useState<ClimatePreferences>(defaultClimatePreferences);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { countries, loading, error, refresh } = useCountries();
  const ranked = useScoring(countries, weights, search, region, nomadVisaOnly, climatePrefs);

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
    <Layout view={view} onViewChange={setView}>
      {/* Hero section - only in list view */}
      {view === "list" && (
        <div className="relative mb-12 rounded-lg overflow-hidden" style={{ height: "320px", background: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 50%, #1a1a1a 100%)" }}>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)" }} />
          <div className="relative h-full flex flex-col items-center justify-center px-4">
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-accent)" }} />
              <span style={{ fontFamily: "Geist, sans-serif", fontSize: "11px", fontWeight: 500, letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--color-accent-dim)" }}>
                DISCOVER · COMPARE · DECIDE
              </span>
            </div>
            {/* H1 */}
            <h1 style={{ fontFamily: "Anton, sans-serif", fontSize: "64px", fontWeight: 400, lineHeight: "0.95", color: "#FFFFFF", marginBottom: "16px", textAlign: "center" }}>
              FIND YOUR NEXT COUNTRY
            </h1>
            {/* Tagline */}
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "#777777", maxWidth: "520px", textAlign: "center", marginBottom: "24px" }}>
              Personalised rankings for digital nomads — live data from 8 global sources.
            </p>
            {/* Copper rule */}
            <div style={{ width: "80px", height: "2px", backgroundColor: "var(--color-accent)", marginBottom: "20px" }} />
            {/* Stats row */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "22px", fontWeight: 600, color: "var(--color-accent-dim)", lineHeight: "1" }}>180</div>
                <div style={{ fontFamily: "Geist, sans-serif", fontSize: "10px", color: "#444444", textTransform: "uppercase", letterSpacing: "1px", marginTop: "4px" }}>Countries</div>
              </div>
              <div className="w-px h-8" style={{ backgroundColor: "#333333" }} />
              <div className="text-center">
                <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "22px", fontWeight: 600, color: "var(--color-accent-dim)", lineHeight: "1" }}>13</div>
                <div style={{ fontFamily: "Geist, sans-serif", fontSize: "10px", color: "#444444", textTransform: "uppercase", letterSpacing: "1px", marginTop: "4px" }}>Indicators</div>
              </div>
              <div className="w-px h-8" style={{ backgroundColor: "#333333" }} />
              <div className="text-center">
                <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "22px", fontWeight: 600, color: "var(--color-accent-dim)", lineHeight: "1" }}>8</div>
                <div style={{ fontFamily: "Geist, sans-serif", fontSize: "10px", color: "#444444", textTransform: "uppercase", letterSpacing: "1px", marginTop: "4px" }}>Data Sources</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: "#666666" }} />
        <input
          type="search"
          placeholder="Search by country name or ISO code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-md focus:outline-none"
          style={{ backgroundColor: "#161616", border: "1px solid #1E1E22", color: "#FFFFFF", fontFamily: "Inter, sans-serif", fontSize: "14px" }}
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Nomad visa toggle - pill switch */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setNomadVisaOnly((p) => !p)}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            style={{ backgroundColor: nomadVisaOnly ? "var(--color-accent)" : "#333333" }}
          >
            <span
              className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              style={{ transform: nomadVisaOnly ? "translateX(26px)" : "translateX(4px)" }}
            />
          </button>
          <span style={{ fontFamily: "Geist, sans-serif", fontSize: "12px", color: "#AAAAAA" }}>Nomad Visa Only</span>
        </div>

        {/* Weights toggle — only in map view */}
        {view === "map" && (
          <button
            onClick={() => setShowWeights((p) => !p)}
            className="flex items-center gap-1.5 px-4 py-2 rounded border text-sm font-medium transition-colors"
            style={{
              backgroundColor: showWeights ? "var(--color-accent)" : "#1A1A1A",
              borderColor: showWeights ? "var(--color-accent)" : "#333333",
              color: showWeights ? "#FFFFFF" : "#999999",
              fontFamily: "Inter, sans-serif"
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Parameters
          </button>
        )}
      </div>

      {/* Region chips */}
      <div className="mb-6">
        <div style={{ fontFamily: "Geist, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: "#444444", marginBottom: "12px" }}>
          REGIONS
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setRegion("")}
            className="px-3 py-1.5 rounded-full transition-colors"
            style={{
              fontFamily: "Geist, sans-serif",
              fontSize: "12px",
              backgroundColor: region === "" ? "var(--color-accent)" : "#1C1C1C",
              color: region === "" ? "#FFFFFF" : "#666666",
              border: region === "" ? "none" : "1px solid #2C2C2C",
            }}
          >
            All Regions
          </button>
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className="px-3 py-1.5 rounded-full transition-colors"
              style={{
                fontFamily: "Geist, sans-serif",
                fontSize: "12px",
                backgroundColor: region === r ? "var(--color-accent)" : "#1C1C1C",
                color: region === r ? "#FFFFFF" : "#666666",
                border: region === r ? "none" : "1px solid #2C2C2C",
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {view === "map" ? (
        <div className={`grid gap-6 ${
          showWeights ? "grid-cols-1 lg:grid-cols-[300px_1fr]" : "grid-cols-1"
        }`}>
          {showWeights && (
            <WeightPanel
              weights={weights}
              onChange={handleWeightChange}
              onReset={handleReset}
              climatePrefs={climatePrefs}
              onClimatePrefsChange={setClimatePrefs}
            />
          )}
          <WorldMap ranked={ranked} onCountryClick={handleCountryClick} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          <WeightPanel
            weights={weights}
            onChange={handleWeightChange}
            onReset={handleReset}
            climatePrefs={climatePrefs}
            onClimatePrefsChange={setClimatePrefs}
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

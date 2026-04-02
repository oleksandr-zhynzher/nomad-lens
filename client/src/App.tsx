import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, ArrowDownWideNarrow, Flag, Globe, SlidersHorizontal, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "./components/Layout";
import { WeightPanel } from "./components/WeightPanel";
import { CountryList } from "./components/CountryList";
import { WorldMap } from "./components/WorldMap";
import { RegionComparison } from "./components/RegionComparison";
import { CountryComparison } from "./components/CountryComparison";
import { useCountries } from "./hooks/useCountries";
import { useScoring } from "./hooks/useScoring";
import { defaultClimatePreferences, defaultWeights, redistributeWeights } from "./utils/scoring";
import type { CategoryKey, ClimatePreferences, WeightMap } from "./utils/types";
import { CATEGORY_KEYS, VISIBLE_CATEGORY_KEYS } from "./utils/types";
import "./index.css";

function weightsFromSearch(search: string): WeightMap {
  const params = new URLSearchParams(search);
  const base = defaultWeights();
  let hasParams = false;
  for (const key of CATEGORY_KEYS) {
    const v = params.get(key);
    if (v !== null) {
      const n = Number(v);
      if (!isNaN(n)) { base[key] = Math.max(0, Math.min(100, n)); hasParams = true; }
    }
  }
  if (!hasParams) return base;
  // Normalize visible weights to exactly 100
  const visibleSum = VISIBLE_CATEGORY_KEYS.reduce((s, k) => s + base[k], 0);
  if (visibleSum === 0 || visibleSum === 100) return base;
  const scale = 100 / visibleSum;
  const exactShares = VISIBLE_CATEGORY_KEYS.map((k) => base[k] * scale);
  const floors = exactShares.map((s) => Math.floor(s));
  const floorSum = floors.reduce((a, b) => a + b, 0);
  let leftover = 100 - floorSum;
  const remainders = exactShares.map((s, i) => ({ i, r: s - floors[i] }));
  remainders.sort((a, b) => b.r - a.r);
  remainders.forEach(({ i }) => { if (leftover > 0) { floors[i]++; leftover--; } });
  VISIBLE_CATEGORY_KEYS.forEach((k, i) => { base[k] = floors[i]; });
  return base;
}

function weightsToSearch(weights: WeightMap): string {
  const params = new URLSearchParams();
  for (const key of CATEGORY_KEYS) {
    params.set(key, String(weights[key]));
  }
  return params.toString();
}

const LS_WEIGHTS_KEY = "nomad-lens:weights";

function loadWeightsFromStorage(): WeightMap {
  // Check if the URL contains a shared weight link (any CATEGORY_KEY present)
  const urlParams = new URLSearchParams(window.location.search);
  const hasSharedWeights = CATEGORY_KEYS.some((k) => urlParams.has(k));
  if (hasSharedWeights) {
    const imported = weightsFromSearch(window.location.search);
    // Save to localStorage so the weights persist after URL is cleaned
    try {
      localStorage.setItem(LS_WEIGHTS_KEY, JSON.stringify(imported));
    } catch { /* ignore */ }
    // Strip weight params from URL without triggering a navigation
    window.history.replaceState(null, "", window.location.pathname);
    return imported;
  }

  try {
    const raw = localStorage.getItem(LS_WEIGHTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const base = defaultWeights();
      for (const key of CATEGORY_KEYS) {
        const v = parsed[key];
        if (typeof v === "number" && !isNaN(v)) {
          base[key] = Math.max(0, Math.min(100, Math.round(v)));
        }
      }
      return base;
    }
  } catch {
    // ignore malformed data
  }
  return defaultWeights();
}

export default function App() {
  const [searchParams] = useSearchParams();
  const [weights, setWeights] = useState<WeightMap>(loadWeightsFromStorage);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [view, setView] = useState<"list" | "map" | "compare">(() => {
    const v = searchParams.get("view");
    if (v === "list" || v === "map" || v === "compare") return v;
    return "list";
  });
  const [compareMode, setCompareMode] = useState<"regions" | "countries">("countries");
  const [sortTrigger, setSortTrigger] = useState(0);
  const [countrySelectionCount, setCountrySelectionCount] = useState(0);
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);
  const [showWeights, setShowWeights] = useState(false);
  const [nomadVisaOnly, setNomadVisaOnly] = useState(false);
  const [schengenOnly, setSchengenOnly] = useState(false);
  const [minTouristDays, setMinTouristDays] = useState<number | null>(null);
  const [climatePrefs, setClimatePrefs] = useState<ClimatePreferences>(defaultClimatePreferences);
  const [mobileParamsOpen, setMobileParamsOpen] = useState(false);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { countries, loading, error, refresh } = useCountries();
  const ranked = useScoring(countries, weights, search, region, nomadVisaOnly, schengenOnly, minTouristDays, climatePrefs);

  // Persist weights to localStorage
  useEffect(() => {
    localStorage.setItem(LS_WEIGHTS_KEY, JSON.stringify(weights));
  }, [weights]);

  const handleWeightChange = useCallback(
    (key: CategoryKey, value: number) => {
      setWeights((prev) => redistributeWeights(key, value, prev));
    },
    [],
  );

  const handleReset = useCallback(() => {
    setWeights(defaultWeights());
  }, []);

  const weightsAreDefault = useMemo(() => {
    const def = defaultWeights();
    return CATEGORY_KEYS.every((k) => weights[k] === def[k]);
  }, [weights]);

  const handleShare = useCallback(() => {
    const url = window.location.origin + window.location.pathname + "?" + weightsToSearch(weights);
    navigator.clipboard.writeText(url).catch(() => {
      // fallback: select a temporary textarea
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    });
  }, [weights]);

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
      {view === "list" ? (
        <div className="flex">
          {/* Left sidebar - Weight Panel (hidden on mobile) */}
          <aside className="hidden md:block sticky top-14 self-start" style={{ width: "320px", height: "calc(100vh - 56px)" }}>
            <WeightPanel
              weights={weights}
              onChange={handleWeightChange}
              onReset={handleReset}
              weightsAreDefault={weightsAreDefault}
              onShare={handleShare}
              climatePrefs={climatePrefs}
              onClimatePrefsChange={setClimatePrefs}
              nomadVisaOnly={nomadVisaOnly}
              onNomadVisaOnlyChange={setNomadVisaOnly}
              schengenOnly={schengenOnly}
              onSchengenOnlyChange={setSchengenOnly}
              minTouristDays={minTouristDays}
              onMinTouristDaysChange={setMinTouristDays}
            />
          </aside>

          {/* Mobile parameters bottom sheet */}
          {mobileParamsOpen && (
            <div className="md:hidden fixed inset-0 z-50 flex flex-col" onClick={() => setMobileParamsOpen(false)}>
              <div className="flex-1" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} />
              <div
                className="relative flex flex-col"
                style={{ height: "85vh", backgroundColor: "#1A1A1A", borderTopLeftRadius: "12px", borderTopRightRadius: "12px" }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                  <div style={{ width: "36px", height: "4px", borderRadius: "2px", backgroundColor: "#444444" }} />
                </div>
                {/* Close button */}
                <div className="flex items-center justify-between px-4 pb-2 shrink-0">
                  <span style={{ fontFamily: "Geist, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#999999" }}>
                    Weights & Preferences
                  </span>
                  <button
                    onClick={() => setMobileParamsOpen(false)}
                    className="flex items-center justify-center"
                    style={{ width: "32px", height: "32px", borderRadius: "4px", backgroundColor: "#333333", color: "#999999" }}
                    aria-label="Close parameters"
                  >
                    <X size={18} />
                  </button>
                </div>
                <WeightPanel
                  weights={weights}
                  onChange={handleWeightChange}
                  onReset={handleReset}
                  weightsAreDefault={weightsAreDefault}
                  onShare={handleShare}
                  climatePrefs={climatePrefs}
                  onClimatePrefsChange={setClimatePrefs}
                  nomadVisaOnly={nomadVisaOnly}
                  onNomadVisaOnlyChange={setNomadVisaOnly}
                  schengenOnly={schengenOnly}
                  onSchengenOnlyChange={setSchengenOnly}
                  minTouristDays={minTouristDays}
                  onMinTouristDaysChange={setMinTouristDays}
                  mobile
                />
              </div>
            </div>
          )}

          {/* Mobile FAB - Parameters button */}
          <button
            className="md:hidden fixed z-40 flex items-center gap-2 shadow-lg"
            style={{
              bottom: "24px",
              right: "16px",
              height: "48px",
              paddingLeft: "16px",
              paddingRight: "18px",
              borderRadius: "24px",
              backgroundColor: "var(--color-accent)",
              color: "#FFFFFF",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 600,
            }}
            onClick={() => setMobileParamsOpen(true)}
            aria-label="Open parameters"
          >
            <SlidersHorizontal size={18} />
            Parameters
          </button>

          {/* Right content area */}
          <main className="flex-1 min-w-0" style={{ backgroundColor: "#0F1114" }}>
            <div className="px-4 py-4 md:px-6 md:py-6">
              {/* Hero section */}
              <div className="relative mb-6 md:mb-12 rounded-lg overflow-hidden" style={{ 
                background: "#0A0D12",
                backgroundImage: `url('/hero-map.png')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
              }}>
                {/* Gradient overlay - transparent top to black bottom */}
                <div className="absolute inset-0" style={{ 
                  background: "linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.85) 100%)"
                }} />
                
                <div className="relative flex flex-col justify-end px-4 pb-4 md:px-12 md:pb-12" style={{ minHeight: "160px" }}>
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-accent)" }} />
              <span style={{ fontFamily: "Geist, sans-serif", fontSize: "11px", fontWeight: 500, letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--color-accent-dim)" }}>
                DISCOVER · COMPARE · DECIDE
              </span>
            </div>
            {/* H1 — responsive font */}
            <h1 className="text-3xl md:text-6xl" style={{ fontFamily: "Anton, sans-serif", fontWeight: 400, lineHeight: "0.95", color: "#FFFFFF", marginBottom: "8px" }}>
              FIND YOUR NEXT COUNTRY
            </h1>
            {/* Tagline */}
            <p className="hidden md:block" style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "#777777", maxWidth: "580px", marginBottom: "20px" }}>
              Personalised rankings for digital nomads — live data from 10 global sources.
            </p>
            {/* Copper rule */}
            <div className="hidden md:block" style={{ width: "128px", height: "2px", backgroundColor: "var(--color-accent)", marginBottom: "16px" }} />
            {/* Stats row */}
            <div className="flex items-center gap-4 md:gap-6">
              <div>
                <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "18px", fontWeight: 600, color: "var(--color-accent-dim)", lineHeight: "1" }}>{countries.length}</div>
                <div style={{ fontFamily: "Geist, sans-serif", fontSize: "10px", color: "#444444", textTransform: "uppercase", letterSpacing: "1px", marginTop: "4px" }}>Countries</div>
              </div>
              <div className="w-px h-6 md:h-8" style={{ backgroundColor: "#333333" }} />
              <Link to="/indicators" style={{ textDecoration: "none" }}>
                <div>
                  <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "18px", fontWeight: 600, color: "var(--color-accent-dim)", lineHeight: "1" }}>{VISIBLE_CATEGORY_KEYS.length}</div>
                  <div style={{ fontFamily: "Geist, sans-serif", fontSize: "10px", color: "#444444", textTransform: "uppercase", letterSpacing: "1px", marginTop: "4px" }}>Indicators</div>
                </div>
              </Link>
              <div className="w-px h-6 md:h-8" style={{ backgroundColor: "#333333" }} />
              <Link to="/data-sources" style={{ textDecoration: "none" }}>
                <div>
                  <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "18px", fontWeight: 600, color: "var(--color-accent-dim)", lineHeight: "1" }}>10</div>
                  <div style={{ fontFamily: "Geist, sans-serif", fontSize: "10px", color: "#444444", textTransform: "uppercase", letterSpacing: "1px", marginTop: "4px" }}>Data Sources</div>
                </div>
              </Link>
            </div>
                </div>
              </div>

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

              {/* Country list */}
              <CountryList
                ranked={ranked}
                loading={loading}
                error={error}
                onRetry={refresh}
                highlightedCode={highlightedCode}
              />
            </div>
          </main>
        </div>
      ) : view === "map" ? (
        <div className="px-2 py-2 md:px-6 md:py-6">
          <div className={`grid gap-4 md:gap-6 ${
            showWeights ? "grid-cols-1 lg:grid-cols-[300px_1fr]" : "grid-cols-1"
          }`}>
            {showWeights && (
              <div className="hidden md:block">
                <WeightPanel
                  weights={weights}
                  onChange={handleWeightChange}
                  onReset={handleReset}
                  weightsAreDefault={weightsAreDefault}
                  onShare={handleShare}
                  climatePrefs={climatePrefs}
                  onClimatePrefsChange={setClimatePrefs}
                  nomadVisaOnly={nomadVisaOnly}
                  onNomadVisaOnlyChange={setNomadVisaOnly}
                  schengenOnly={schengenOnly}
                  onSchengenOnlyChange={setSchengenOnly}
                  minTouristDays={minTouristDays}
                  onMinTouristDaysChange={setMinTouristDays}
                />
              </div>
            )}
            <WorldMap ranked={ranked} onCountryClick={handleCountryClick} onToggleWeights={() => setShowWeights((p) => !p)} showWeights={showWeights} />
          </div>
        </div>
      ) : (
        <div>
          {/* Hero band */}
          <div
            className="relative overflow-hidden"
            style={{
              backgroundColor: "#141416",
            }}
          >
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, #0D0D0FCC 0%, transparent 60%)",
              }}
            />
            <div className="relative h-full max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 flex flex-col justify-center" style={{ minHeight: "80px" }}>
              <span
                style={{
                  fontFamily: "Geist, sans-serif",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "2.5px",
                  textTransform: "uppercase",
                  color: "var(--color-accent)",
                  marginBottom: "6px",
                }}
              >
                COMPARE
              </span>
              <h2
                className="text-2xl md:text-4xl"
                style={{
                  fontFamily: "Anton, sans-serif",
                  fontWeight: 400,
                  lineHeight: 1,
                  color: "#E8E9EB",
                  margin: 0,
                }}
              >
                {compareMode === "countries" ? "COUNTRY COMPARISON" : "REGION COMPARISON"}
              </h2>
              <p className="hidden md:block"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  color: "#666666",
                  marginTop: "8px",
                }}
              >
                {compareMode === "countries"
                  ? "Select countries to compare across all indicators"
                  : "Compare average scores across world regions"}
              </p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          {/* Mode toggle + Parameters row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 mb-4 md:mb-6">
            {/* Compare mode toggle pills */}
            <div className="flex w-full sm:w-auto rounded-md p-1" style={{ backgroundColor: "#1A1A1A", border: "1px solid #252525" }}>
              <button
                onClick={() => setCompareMode("countries")}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-1.5 rounded transition-colors"
                style={{
                  backgroundColor: compareMode === "countries" ? "var(--color-accent)" : "transparent",
                  color: compareMode === "countries" ? "#FFFFFF" : "#777777",
                  fontFamily: "Geist, sans-serif",
                  fontSize: "13px",
                  fontWeight: compareMode === "countries" ? 500 : 400,
                }}
              >
                <Flag size={14} />
                Countries
              </button>
              <button
                onClick={() => setCompareMode("regions")}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-1.5 rounded transition-colors"
                style={{
                  backgroundColor: compareMode === "regions" ? "var(--color-accent)" : "transparent",
                  color: compareMode === "regions" ? "#FFFFFF" : "#777777",
                  fontFamily: "Geist, sans-serif",
                  fontSize: "13px",
                  fontWeight: compareMode === "regions" ? 500 : 400,
                }}
              >
                <Globe size={14} />
                Regions
              </button>
            </div>

            {/* Weights toggle */}
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

            {/* Sort button — visible when 2+ countries in country mode */}
            {compareMode === "countries" && countrySelectionCount > 1 && (
              <button
                onClick={() => setSortTrigger((p) => p + 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded border text-sm font-medium transition-colors hover:border-[#555555]"
                style={{
                  backgroundColor: "#1A1A1A",
                  borderColor: "#333333",
                  color: "#999999",
                  fontFamily: "Inter, sans-serif",
                  cursor: "pointer",
                }}
              >
                <ArrowDownWideNarrow size={16} />
                Sort by Score
              </button>
            )}
          </div>

          <div className={`grid gap-4 md:gap-6 ${
            showWeights ? "grid-cols-1 lg:grid-cols-[300px_1fr]" : "grid-cols-1"
          }`}>
            {showWeights && (
              <div className="hidden md:block">
                <WeightPanel
                  weights={weights}
                  onChange={handleWeightChange}
                  onReset={handleReset}
                  weightsAreDefault={weightsAreDefault}
                  onShare={handleShare}
                  climatePrefs={climatePrefs}
                  onClimatePrefsChange={setClimatePrefs}
                  nomadVisaOnly={nomadVisaOnly}
                  onNomadVisaOnlyChange={setNomadVisaOnly}
                  schengenOnly={schengenOnly}
                  onSchengenOnlyChange={setSchengenOnly}
                  minTouristDays={minTouristDays}
                  onMinTouristDaysChange={setMinTouristDays}
                />
              </div>
            )}
            {compareMode === "regions" ? (
              <RegionComparison countries={countries} weights={weights} climatePrefs={climatePrefs} />
            ) : (
              <CountryComparison countries={countries} weights={weights} climatePrefs={climatePrefs} sortTrigger={sortTrigger} onSelectionCount={setCountrySelectionCount} />
            )}
          </div>
        </div>
        </div>
      )}
    </Layout>
  );
}

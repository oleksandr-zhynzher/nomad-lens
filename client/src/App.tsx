import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, ArrowDownWideNarrow, Flag, Globe, SlidersHorizontal, X, ChevronUp, ChevronDown } from "lucide-react";
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
const LS_FILTERS_KEY = "nomad-lens:filters";
const FILTER_URL_KEYS = ["nomadVisa", "schengen", "minDays", "regions", "climateSeason", "climateMin", "climateMax"];

// Parse the URL once at module load, clean it, and share the params with both loaders.
const _sharedParams = (() => {
  const urlParams = new URLSearchParams(window.location.search);
  const hasShared = CATEGORY_KEYS.some((k) => urlParams.has(k)) || FILTER_URL_KEYS.some((k) => urlParams.has(k));
  if (hasShared) {
    window.history.replaceState(null, "", window.location.pathname);
    return urlParams;
  }
  return null;
})();

function loadWeightsFromStorage(): WeightMap {
  if (_sharedParams && CATEGORY_KEYS.some((k) => _sharedParams.has(k))) {
    const imported = weightsFromSearch(_sharedParams.toString());
    try { localStorage.setItem(LS_WEIGHTS_KEY, JSON.stringify(imported)); } catch { /* ignore */ }
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
  } catch { /* ignore malformed data */ }
  return defaultWeights();
}

type LoadedFilters = {
  nomadVisaOnly: boolean;
  schengenOnly: boolean;
  minTouristDays: number | null;
  selectedRegions: Set<string>;
  climatePrefs: ClimatePreferences;
};

function filtersToStorable(f: LoadedFilters) {
  return {
    nomadVisa: f.nomadVisaOnly,
    schengen: f.schengenOnly,
    minDays: f.minTouristDays,
    regions: [...f.selectedRegions],
    climateSeason: f.climatePrefs.seasonType,
    climateMin: f.climatePrefs.minTemp,
    climateMax: f.climatePrefs.maxTemp,
  };
}

function loadFiltersFromStorage(): LoadedFilters {
  const def = defaultClimatePreferences();

  if (_sharedParams) {
    const minDaysStr = _sharedParams.get("minDays");
    const regionsStr = _sharedParams.get("regions");
    const loaded: LoadedFilters = {
      nomadVisaOnly: _sharedParams.get("nomadVisa") === "1",
      schengenOnly: _sharedParams.get("schengen") === "1",
      minTouristDays: minDaysStr !== null && !isNaN(Number(minDaysStr)) ? Number(minDaysStr) : null,
      selectedRegions: regionsStr ? new Set(regionsStr.split(",").filter(Boolean)) : new Set<string>(),
      climatePrefs: {
        seasonType: (_sharedParams.get("climateSeason") ?? def.seasonType) as ClimatePreferences["seasonType"],
        minTemp: _sharedParams.has("climateMin") && !isNaN(Number(_sharedParams.get("climateMin"))) ? Number(_sharedParams.get("climateMin")) : def.minTemp,
        maxTemp: _sharedParams.has("climateMax") && !isNaN(Number(_sharedParams.get("climateMax"))) ? Number(_sharedParams.get("climateMax")) : def.maxTemp,
      },
    };
    try { localStorage.setItem(LS_FILTERS_KEY, JSON.stringify(filtersToStorable(loaded))); } catch { /* ignore */ }
    return loaded;
  }

  try {
    const raw = localStorage.getItem(LS_FILTERS_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Record<string, unknown>;
      return {
        nomadVisaOnly: p.nomadVisa === true,
        schengenOnly: p.schengen === true,
        minTouristDays: typeof p.minDays === "number" ? p.minDays : null,
        selectedRegions: Array.isArray(p.regions)
          ? new Set(p.regions.filter((r): r is string => typeof r === "string"))
          : new Set<string>(),
        climatePrefs: {
          seasonType: typeof p.climateSeason === "string" ? p.climateSeason as ClimatePreferences["seasonType"] : def.seasonType,
          minTemp: typeof p.climateMin === "number" ? p.climateMin : def.minTemp,
          maxTemp: typeof p.climateMax === "number" ? p.climateMax : def.maxTemp,
        },
      };
    }
  } catch { /* ignore */ }

  return { nomadVisaOnly: false, schengenOnly: false, minTouristDays: null, selectedRegions: new Set<string>(), climatePrefs: def };
}

const _initialFilters = loadFiltersFromStorage();

export default function App() {
  const [searchParams] = useSearchParams();
  const [weights, setWeights] = useState<WeightMap>(loadWeightsFromStorage);
  const [search, setSearch] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(() => _initialFilters.selectedRegions);
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
  const [nomadVisaOnly, setNomadVisaOnly] = useState(() => _initialFilters.nomadVisaOnly);
  const [schengenOnly, setSchengenOnly] = useState(() => _initialFilters.schengenOnly);
  const [minTouristDays, setMinTouristDays] = useState<number | null>(() => _initialFilters.minTouristDays);
  const [climatePrefs, setClimatePrefs] = useState<ClimatePreferences>(() => _initialFilters.climatePrefs);
  const [mobileParamsOpen, setMobileParamsOpen] = useState(false);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { countries, loading, error, refresh } = useCountries();
  const ranked = useScoring(countries, weights, selectedRegions, nomadVisaOnly, schengenOnly, minTouristDays, climatePrefs);

  // Persist weights to localStorage
  useEffect(() => {
    localStorage.setItem(LS_WEIGHTS_KEY, JSON.stringify(weights));
  }, [weights]);

  // Persist filter state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LS_FILTERS_KEY, JSON.stringify({
        nomadVisa: nomadVisaOnly, schengen: schengenOnly, minDays: minTouristDays,
        regions: [...selectedRegions], climateSeason: climatePrefs.seasonType,
        climateMin: climatePrefs.minTemp, climateMax: climatePrefs.maxTemp,
      }));
    } catch { /* ignore */ }
  }, [nomadVisaOnly, schengenOnly, minTouristDays, selectedRegions, climatePrefs]);

  const handleWeightChange = useCallback(
    (key: CategoryKey, value: number) => {
      setWeights((prev) => redistributeWeights(key, value, prev));
    },
    [],
  );

  const handleReset = useCallback(() => {
    setWeights(defaultWeights());
    setNomadVisaOnly(false);
    setSchengenOnly(false);
    setMinTouristDays(null);
    setSelectedRegions(new Set());
    setClimatePrefs(defaultClimatePreferences());
  }, []);

  const weightsAreDefault = useMemo(() => {
    const def = defaultWeights();
    const defClimate = defaultClimatePreferences();
    return (
      CATEGORY_KEYS.every((k) => weights[k] === def[k]) &&
      !nomadVisaOnly && !schengenOnly && minTouristDays === null &&
      selectedRegions.size === 0 &&
      climatePrefs.seasonType === defClimate.seasonType &&
      climatePrefs.minTemp === defClimate.minTemp &&
      climatePrefs.maxTemp === defClimate.maxTemp
    );
  }, [weights, nomadVisaOnly, schengenOnly, minTouristDays, selectedRegions, climatePrefs]);

  const handleShare = useCallback(() => {
    const params = new URLSearchParams(weightsToSearch(weights));
    if (nomadVisaOnly) params.set("nomadVisa", "1");
    if (schengenOnly) params.set("schengen", "1");
    if (minTouristDays !== null) params.set("minDays", String(minTouristDays));
    if (selectedRegions.size > 0) params.set("regions", [...selectedRegions].join(","));
    const defClimate = defaultClimatePreferences();
    if (climatePrefs.seasonType !== defClimate.seasonType) params.set("climateSeason", climatePrefs.seasonType);
    if (climatePrefs.minTemp !== defClimate.minTemp) params.set("climateMin", String(climatePrefs.minTemp));
    if (climatePrefs.maxTemp !== defClimate.maxTemp) params.set("climateMax", String(climatePrefs.maxTemp));
    const url = window.location.origin + window.location.pathname + "?" + params.toString();
    navigator.clipboard.writeText(url).catch(() => {
      // fallback: select a temporary textarea
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    });
  }, [weights, nomadVisaOnly, schengenOnly, minTouristDays, selectedRegions, climatePrefs]);

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

  // Search navigation
  const matchingCodes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length < 2) return [];
    return ranked
      .filter((r) => {
        const name = r.country.name.toLowerCase();
        const code = r.country.code.toLowerCase();
        // Exact ISO code match
        if (code === q) return true;
        // Name match: for short queries use word-start, for longer use contains
        if (q.length <= 3) return name.split(" ").some((word) => word.startsWith(q));
        return name.includes(q);
      })
      .map((r) => r.country.code);
  }, [ranked, search]);
  const [matchCursor, setMatchCursor] = useState(0);
  useEffect(() => { setMatchCursor(0); }, [search]);
  useEffect(() => {
    const code = matchingCodes[matchCursor];
    if (!code) return;
    const el = document.querySelector(`[data-country-code="${code}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [matchCursor, matchingCodes]);
  const goNext = useCallback(() => setMatchCursor((c) => matchingCodes.length ? (c + 1) % matchingCodes.length : 0), [matchingCodes]);
  const goPrev = useCallback(() => setMatchCursor((c) => matchingCodes.length ? (c - 1 + matchingCodes.length) % matchingCodes.length : 0), [matchingCodes]);

  // Free keyboard navigation (no search active)
  const [navCursor, setNavCursor] = useState<number | null>(null);
  const allCodes = useMemo(() => ranked.map((r) => r.country.code), [ranked]);
  useEffect(() => { setNavCursor(null); }, [ranked]);
  useEffect(() => {
    if (navCursor === null) return;
    const code = allCodes[navCursor];
    if (!code) return;
    const el = document.querySelector(`[data-country-code="${code}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [navCursor, allCodes]);

  // Arrow key handler
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isSearchInput = e.target === searchInputRef.current;

      if (e.key === "Enter") {
        const highlighted = search.trim().length >= 2
          ? (matchingCodes[matchCursor] ?? null)
          : (navCursor !== null ? (allCodes[navCursor] ?? null) : null);
        if (highlighted) {
          e.preventDefault();
          setExpandedCode((c) => (c === highlighted ? null : highlighted));
        }
        return;
      }

      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      if (!isSearchInput && (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) return;
      e.preventDefault();
      if (search.trim().length >= 2) {
        // Navigate within search matches
        if (e.key === "ArrowDown") goNext();
        else goPrev();
      } else if (!isSearchInput) {
        // Navigate full list (only when not typing in search)
        setNavCursor((c) => {
          const len = allCodes.length;
          if (!len) return null;
          if (c === null) return e.key === "ArrowDown" ? 0 : len - 1;
          return e.key === "ArrowDown" ? (c + 1) % len : (c - 1 + len) % len;
        });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [search, goNext, goPrev, allCodes, matchingCodes, matchCursor, navCursor]);

  const activeHighlight = search.trim().length >= 2
    ? (matchingCodes[matchCursor] ?? null)
    : (navCursor !== null ? (allCodes[navCursor] ?? null) : highlightedCode);

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

              {/* Search bar + Region chips — sticky below header */}
              <div className="sticky z-20 -mx-4 px-4 md:-mx-6 md:px-6 py-4" style={{ top: "56px", backgroundColor: "#0F1114", borderBottom: "1px solid #1a1a1a" }}>
              {/* Search bar */}
              <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: "#666666" }} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search by country name or ISO code…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 py-3 rounded-md focus:outline-none"
                  style={{ paddingRight: search.length === 0 ? "16px" : search.trim().length >= 2 ? "128px" : "44px", backgroundColor: "#161616", border: "1px solid #1E1E22", color: "#FFFFFF", fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                />
                {search.length > 0 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      onClick={() => setSearch("")}
                      className="flex items-center justify-center"
                      style={{ width: "24px", height: "24px", borderRadius: "3px", border: "none", cursor: "pointer", backgroundColor: "#2A2A2A", color: "#CCCCCC" }}
                      aria-label="Clear search"
                    >
                      <X size={14} />
                    </button>
                    {search.trim().length >= 2 && (
                      <>
                        <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "11px", color: "#666666", minWidth: "36px", textAlign: "right" }}>
                          {matchingCodes.length > 0 ? `${matchCursor + 1}/${matchingCodes.length}` : "0/0"}
                        </span>
                        <button
                          onClick={goPrev}
                          disabled={matchingCodes.length === 0}
                          className="flex items-center justify-center"
                          style={{ width: "24px", height: "24px", borderRadius: "3px", border: "none", cursor: matchingCodes.length ? "pointer" : "default", backgroundColor: "#2A2A2A", color: matchingCodes.length ? "#CCCCCC" : "#444444" }}
                          aria-label="Previous match"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          onClick={goNext}
                          disabled={matchingCodes.length === 0}
                          className="flex items-center justify-center"
                          style={{ width: "24px", height: "24px", borderRadius: "3px", border: "none", cursor: matchingCodes.length ? "pointer" : "default", backgroundColor: "#2A2A2A", color: matchingCodes.length ? "#CCCCCC" : "#444444" }}
                          aria-label="Next match"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Region chips */}
              <div className="mb-0">
                <div style={{ fontFamily: "Geist, sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#888888", marginBottom: "12px" }}>
                  REGIONS
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedRegions(new Set())}
                    style={{
                      fontFamily: "Geist, sans-serif",
                      fontSize: "13px",
                      fontWeight: 600,
                      padding: "8px 18px",
                      borderRadius: "3px",
                      border: "none",
                      cursor: "pointer",
                      backgroundColor: selectedRegions.size === 0 ? "#8F5A3C" : "#2A2A2A",
                      color: selectedRegions.size === 0 ? "#FFFFFF" : "#999999",
                    }}
                  >
                    All
                  </button>
                  {regions.map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRegions((prev) => {
                        const next = new Set(prev);
                        if (next.has(r)) next.delete(r);
                        else next.add(r);
                        return next;
                      })}
                      style={{
                        fontFamily: "Geist, sans-serif",
                        fontSize: "13px",
                        fontWeight: 600,
                        padding: "8px 18px",
                        borderRadius: "3px",
                        border: "none",
                        cursor: "pointer",
                        backgroundColor: selectedRegions.has(r) ? "#8F5A3C" : "#2A2A2A",
                        color: selectedRegions.has(r) ? "#FFFFFF" : "#999999",
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              </div>

              {/* Country list */}
              <CountryList
                ranked={ranked}
                loading={loading}
                error={error}
                onRetry={refresh}
                highlightedCode={activeHighlight}
                expandedCode={expandedCode}
                onToggleExpanded={(code) => setExpandedCode((c) => (c === code ? null : code))}
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

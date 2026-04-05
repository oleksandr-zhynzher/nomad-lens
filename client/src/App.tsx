import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronUp,
  ChevronDown,
  Filter,
  List,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout } from "./components/Layout";
import { WeightPanel } from "./components/WeightPanel";
import { CountryList } from "./components/CountryList";
import { Tooltip } from "./components/Tooltip";
import { useCountries } from "./hooks/useCountries";
import { useScoring } from "./hooks/useScoring";
import { useLangPrefix } from "./hooks/useLangPrefix";
import { useWeightState } from "./hooks/useWeightState";
import { localizeCountry } from "./utils/localize";
import { VISIBLE_CATEGORY_KEYS, AI_CATEGORY_KEYS } from "./utils/types";
import "./index.css";

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const langPrefix = useLangPrefix();
  const lang = i18n.language;
  const ws = useWeightState();

  const [search, setSearch] = useState("");
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);
  const [mobileParamsOpen, setMobileParamsOpen] = useState(false);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<"filter" | "highlight">(
    "filter",
  );
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  // Detect when the sticky sentinel scrolls above the header (56px)
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { rootMargin: "-57px 0px 0px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { countries, loading, error, refresh } = useCountries();
  const ranked = useScoring(
    countries,
    ws.weights,
    ws.selectedRegions,
    ws.nomadVisaOnly,
    ws.schengenOnly,
    ws.minTouristDays,
    ws.climatePrefs,
  );

  // Handle ?highlight=XX coming from map page country click
  useEffect(() => {
    const h = searchParams.get("highlight");
    if (!h) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("highlight");
        return next;
      },
      { replace: true },
    );
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    setHighlightedCode(h);
    setTimeout(() => {
      const el = document.querySelector(`[data-country-code="${h}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      highlightTimer.current = setTimeout(() => setHighlightedCode(null), 2500);
    }, 80);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayedRanked = useMemo(() => {
    if (searchMode === "filter" && search.trim().length >= 1) {
      const q = search.trim().toLowerCase();
      return ranked.filter(
        (r) =>
          localizeCountry(r.country, lang).name.toLowerCase().includes(q) ||
          r.country.code.toLowerCase() === q,
      );
    }
    return ranked;
  }, [ranked, search, searchMode, lang]);

  const regions = useMemo(
    () => [...new Set(countries.map((c) => c.region))].sort(),
    [countries],
  );

  // Search navigation
  const matchingCodes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length < 1) return [];
    return ranked
      .filter(
        (r) =>
          localizeCountry(r.country, lang).name.toLowerCase().includes(q) ||
          r.country.code.toLowerCase() === q,
      )
      .map((r) => r.country.code);
  }, [ranked, search, lang]);
  const [matchCursor, setMatchCursor] = useState(0);
  useEffect(() => {
    setMatchCursor(0);
  }, [search]);
  useEffect(() => {
    const code = matchingCodes[matchCursor];
    if (!code) return;
    const el = document.querySelector(`[data-country-code="${code}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [matchCursor, matchingCodes]);
  const goNext = useCallback(
    () =>
      setMatchCursor((c) =>
        matchingCodes.length ? (c + 1) % matchingCodes.length : 0,
      ),
    [matchingCodes],
  );
  const goPrev = useCallback(
    () =>
      setMatchCursor((c) =>
        matchingCodes.length
          ? (c - 1 + matchingCodes.length) % matchingCodes.length
          : 0,
      ),
    [matchingCodes],
  );

  // Free keyboard navigation (no search active)
  const [navCursor, setNavCursor] = useState<number | null>(null);
  const allCodes = useMemo(() => ranked.map((r) => r.country.code), [ranked]);
  useEffect(() => {
    setNavCursor(null);
  }, [ranked]);
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
        const highlighted =
          search.trim().length >= 1
            ? (matchingCodes[matchCursor] ?? null)
            : navCursor !== null
              ? (allCodes[navCursor] ?? null)
              : null;
        if (highlighted) {
          e.preventDefault();
          setExpandedCode((c) => (c === highlighted ? null : highlighted));
        }
        return;
      }

      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      if (
        !isSearchInput &&
        (e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement)
      )
        return;
      e.preventDefault();
      if (search.trim().length >= 1) {
        if (searchMode === "highlight") {
          // Navigate within search matches (highlight mode only)
          if (e.key === "ArrowDown") goNext();
          else goPrev();
        }
        // In filter mode with active search: arrows do nothing (filtered list shown)
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
  }, [
    search,
    searchMode,
    goNext,
    goPrev,
    allCodes,
    matchingCodes,
    matchCursor,
    navCursor,
  ]);

  const activeHighlight =
    searchMode === "highlight" && search.trim().length >= 1
      ? (matchingCodes[matchCursor] ?? null)
      : navCursor !== null
        ? (allCodes[navCursor] ?? null)
        : highlightedCode;

  return (
    <Layout>
      <div className="flex">
        {/* Left sidebar - Weight Panel (hidden on mobile) */}
        <aside
          className="hidden md:block sticky top-14 self-start"
          style={{ width: "340px", height: "calc(100vh - 56px)" }}
        >
          <WeightPanel
            weights={ws.weights}
            onChange={ws.handleWeightChange}
            onReset={ws.handleReset}
            weightsAreDefault={ws.weightsAreDefault}
            onShare={() => ws.handleShare()}
            climatePrefs={ws.climatePrefs}
            onClimatePrefsChange={ws.setClimatePrefs}
            nomadVisaOnly={ws.nomadVisaOnly}
            onNomadVisaOnlyChange={ws.setNomadVisaOnly}
            schengenOnly={ws.schengenOnly}
            onSchengenOnlyChange={ws.setSchengenOnly}
            minTouristDays={ws.minTouristDays}
            onMinTouristDaysChange={ws.setMinTouristDays}
            weightMode={ws.weightMode}
            onWeightModeChange={ws.handleWeightModeChange}
          />
        </aside>

        {/* Mobile parameters bottom sheet */}
        {mobileParamsOpen && (
          <div
            className="md:hidden fixed inset-0 z-50 flex flex-col"
            onClick={() => setMobileParamsOpen(false)}
          >
            <div
              className="flex-1"
              style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            />
            <div
              className="relative flex flex-col"
              style={{
                height: "85vh",
                backgroundColor: "#1A1A1A",
                borderTopLeftRadius: "12px",
                borderTopRightRadius: "12px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div
                  style={{
                    width: "36px",
                    height: "4px",
                    borderRadius: "2px",
                    backgroundColor: "#444444",
                  }}
                />
              </div>
              {/* Close button */}
              <div className="flex items-center justify-between px-4 pb-2 shrink-0">
                <span
                  style={{
                    fontFamily: "Geist, sans-serif",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    color: "#999999",
                  }}
                >
                  {t("mobileSheet.weightsAndPreferences")}
                </span>
                <button
                  onClick={() => setMobileParamsOpen(false)}
                  className="flex items-center justify-center"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "4px",
                    backgroundColor: "#333333",
                    color: "#999999",
                  }}
                  aria-label="Close parameters"
                >
                  <X size={18} />
                </button>
              </div>
              <WeightPanel
                weights={ws.weights}
                onChange={ws.handleWeightChange}
                onReset={ws.handleReset}
                weightsAreDefault={ws.weightsAreDefault}
                onShare={() => ws.handleShare()}
                climatePrefs={ws.climatePrefs}
                onClimatePrefsChange={ws.setClimatePrefs}
                nomadVisaOnly={ws.nomadVisaOnly}
                onNomadVisaOnlyChange={ws.setNomadVisaOnly}
                schengenOnly={ws.schengenOnly}
                onSchengenOnlyChange={ws.setSchengenOnly}
                minTouristDays={ws.minTouristDays}
                onMinTouristDaysChange={ws.setMinTouristDays}
                weightMode={ws.weightMode}
                onWeightModeChange={ws.handleWeightModeChange}
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
          {t("mobileSheet.parameters")}
        </button>

        {/* Right content area */}
        <main className="flex-1 min-w-0" style={{ backgroundColor: "#0F1114" }}>
          <div className="px-4 md:px-6">
            {/* Hero section */}
            <div
              className="relative mb-6 md:mb-12 rounded-lg overflow-hidden"
              style={{
                background: "#0A0D12",
                backgroundImage: `url('/hero-map.png')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              {/* Gradient overlay - transparent top to black bottom */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.85) 100%)",
                }}
              />

              <div
                className="relative flex flex-col justify-end px-4 py-4 md:px-12 md:py-12"
                style={{ minHeight: "160px" }}
              >
                {/* Eyebrow */}
                <div className="flex items-center gap-2 mb-2 md:mb-3">
                  {t("hero.eyebrow")
                    .split("·")
                    .map((word, i) => (
                      <span
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            width: "4px",
                            height: "4px",
                            borderRadius: "50%",
                            backgroundColor: "var(--color-accent-dim)",
                            flexShrink: 0,
                            display: "inline-block",
                            position: "relative",
                            top: "0px",
                          }}
                        />
                        <span
                          style={{
                            fontFamily: "Geist, sans-serif",
                            fontSize: "11px",
                            fontWeight: 500,
                            letterSpacing: "2.5px",
                            textTransform: "uppercase",
                            color: "var(--color-accent-dim)",
                            lineHeight: 1,
                          }}
                        >
                          {word.trim()}
                        </span>
                      </span>
                    ))}
                </div>
                {/* H1 — responsive font */}
                <h1
                  className="text-3xl md:text-6xl"
                  style={{
                    fontFamily: "Anton, sans-serif",
                    fontWeight: 400,
                    lineHeight: "0.95",
                    color: "#FFFFFF",
                    marginBottom: "8px",
                  }}
                >
                  {t("hero.title")}
                </h1>
                {/* Tagline */}
                <p
                  className="hidden md:block"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "15px",
                    color: "#777777",
                    maxWidth: "580px",
                    marginBottom: "20px",
                  }}
                >
                  {t("hero.tagline")}
                </p>
                {/* Copper rule */}
                <div
                  className="hidden md:block"
                  style={{
                    width: "128px",
                    height: "2px",
                    backgroundColor: "var(--color-accent)",
                    marginBottom: "16px",
                  }}
                />
                {/* Stats row */}
                <div className="flex items-center gap-4 md:gap-6">
                  <div>
                    <div
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "var(--color-accent-dim)",
                        lineHeight: "1",
                      }}
                    >
                      {countries.length}
                    </div>
                    <div
                      style={{
                        fontFamily: "Geist, sans-serif",
                        fontSize: "10px",
                        color: "#444444",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        marginTop: "4px",
                      }}
                    >
                      {t("hero.countries")}
                    </div>
                  </div>
                  <div
                    className="w-px h-6 md:h-8"
                    style={{ backgroundColor: "#333333" }}
                  />
                  <Link
                    to={`${langPrefix}/indicators`}
                    style={{ textDecoration: "none" }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: "IBM Plex Mono, monospace",
                          fontSize: "18px",
                          fontWeight: 600,
                          color: "var(--color-accent-dim)",
                          lineHeight: "1",
                        }}
                      >
                        {VISIBLE_CATEGORY_KEYS.length}
                      </div>
                      <div
                        style={{
                          fontFamily: "Geist, sans-serif",
                          fontSize: "10px",
                          color: "#444444",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          marginTop: "4px",
                        }}
                      >
                        {t("hero.indicators")}
                      </div>
                    </div>
                  </Link>
                  <div
                    className="w-px h-6 md:h-8"
                    style={{ backgroundColor: "#333333" }}
                  />
                  <Link
                    to={`${langPrefix}/data-sources`}
                    style={{ textDecoration: "none" }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: "IBM Plex Mono, monospace",
                          fontSize: "18px",
                          fontWeight: 600,
                          color: "var(--color-accent-dim)",
                          lineHeight: "1",
                        }}
                      >
                        10
                      </div>
                      <div
                        style={{
                          fontFamily: "Geist, sans-serif",
                          fontSize: "10px",
                          color: "#444444",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          marginTop: "4px",
                        }}
                      >
                        {t("hero.dataSources")}
                      </div>
                    </div>
                  </Link>
                  <div
                    className="w-px h-6 md:h-8"
                    style={{ backgroundColor: "#333333" }}
                  />
                  <div>
                    <div
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "var(--color-accent-dim)",
                        lineHeight: "1",
                      }}
                    >
                      {AI_CATEGORY_KEYS.length}
                    </div>
                    <div
                      style={{
                        fontFamily: "Geist, sans-serif",
                        fontSize: "10px",
                        color: "#444444",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        marginTop: "4px",
                      }}
                    >
                      {t("hero.aiIndicators")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sentinel — used by IntersectionObserver to detect sticky state */}
            <div ref={sentinelRef} style={{ height: 0 }} />

            {/* Search bar + Region chips — sticky below header */}
            <div
              className="sticky z-20 -mx-4 px-4 md:-mx-6 md:px-6 py-4"
              style={{
                top: "56px",
                backgroundColor: "#0F1114",
                borderBottom: "1px solid #1a1a1a",
              }}
            >
              {/* Search bar */}
              <div className={`relative${isSticky ? "" : " mb-4"}`}>
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  size={18}
                  style={{ color: "#666666" }}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t("search.placeholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 py-3 rounded-md focus:outline-none"
                  style={{
                    paddingRight:
                      search.length === 0
                        ? "16px"
                        : searchMode === "highlight" &&
                            search.trim().length >= 1
                          ? "164px"
                          : "72px",
                    backgroundColor: "#161616",
                    border: "1px solid #1E1E22",
                    color: "#FFFFFF",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "14px",
                  }}
                />
                {search.length > 0 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      onClick={() => setSearch("")}
                      className="flex items-center justify-center"
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "3px",
                        border: "none",
                        cursor: "pointer",
                        backgroundColor: "#2A2A2A",
                        color: "#CCCCCC",
                      }}
                      aria-label="Clear search"
                    >
                      <X size={14} />
                    </button>
                    {searchMode === "highlight" &&
                      search.trim().length >= 1 && (
                        <>
                          <span
                            style={{
                              fontFamily: "IBM Plex Mono, monospace",
                              fontSize: "11px",
                              color: "#666666",
                              minWidth: "36px",
                              textAlign: "right",
                            }}
                          >
                            {matchingCodes.length > 0
                              ? `${matchCursor + 1}/${matchingCodes.length}`
                              : "0/0"}
                          </span>
                          <button
                            onClick={goPrev}
                            disabled={matchingCodes.length === 0}
                            className="flex items-center justify-center"
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "3px",
                              border: "none",
                              cursor: matchingCodes.length
                                ? "pointer"
                                : "default",
                              backgroundColor: "#2A2A2A",
                              color: matchingCodes.length
                                ? "#CCCCCC"
                                : "#444444",
                            }}
                            aria-label="Previous match"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            onClick={goNext}
                            disabled={matchingCodes.length === 0}
                            className="flex items-center justify-center"
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "3px",
                              border: "none",
                              cursor: matchingCodes.length
                                ? "pointer"
                                : "default",
                              backgroundColor: "#2A2A2A",
                              color: matchingCodes.length
                                ? "#CCCCCC"
                                : "#444444",
                            }}
                            aria-label="Next match"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </>
                      )}
                    <Tooltip
                      side="bottom"
                      content={
                        searchMode === "filter" ? (
                          <span>
                            Switch to <strong>scroll mode</strong> — shows all
                            countries, scrolls to each match.
                          </span>
                        ) : (
                          <span>
                            Switch to <strong>filter mode</strong> — hides
                            non-matching countries.
                          </span>
                        )
                      }
                    >
                      <button
                        onClick={() => {
                          setSearchMode((m) =>
                            m === "filter" ? "highlight" : "filter",
                          );
                          setMatchCursor(0);
                        }}
                        className="flex items-center justify-center"
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "3px",
                          border: "none",
                          cursor: "pointer",
                          backgroundColor: "#2A2A2A",
                          color: "#888888",
                        }}
                        aria-label={
                          searchMode === "filter"
                            ? "Switch to scroll mode"
                            : "Switch to filter mode"
                        }
                      >
                        {searchMode === "filter" ? (
                          <List size={13} />
                        ) : (
                          <Filter size={13} />
                        )}
                      </button>
                    </Tooltip>
                  </div>
                )}
              </div>

              {/* Region chips — hidden when sticky */}
              {!isSticky && (
                <div className="mb-0">
                  <div
                    style={{
                      fontFamily: "Geist, sans-serif",
                      fontSize: "13px",
                      fontWeight: 700,
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      color: "#888888",
                      marginBottom: "12px",
                    }}
                  >
                    {t("regions.label")}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => ws.setSelectedRegions(new Set())}
                      style={{
                        fontFamily: "Geist, sans-serif",
                        fontSize: "13px",
                        fontWeight: 600,
                        padding: "8px 18px",
                        borderRadius: "3px",
                        border: "none",
                        cursor: "pointer",
                        backgroundColor:
                          ws.selectedRegions.size === 0 ? "#8F5A3C" : "#2A2A2A",
                        color:
                          ws.selectedRegions.size === 0 ? "#FFFFFF" : "#999999",
                      }}
                    >
                      {t("regions.all")}
                    </button>
                    {regions.map((r) => (
                      <button
                        key={r}
                        onClick={() =>
                          ws.setSelectedRegions((prev) => {
                            const next = new Set(prev);
                            if (next.has(r)) next.delete(r);
                            else next.add(r);
                            return next;
                          })
                        }
                        style={{
                          fontFamily: "Geist, sans-serif",
                          fontSize: "13px",
                          fontWeight: 600,
                          padding: "8px 18px",
                          borderRadius: "3px",
                          border: "none",
                          cursor: "pointer",
                          backgroundColor: ws.selectedRegions.has(r)
                            ? "#8F5A3C"
                            : "#2A2A2A",
                          color: ws.selectedRegions.has(r)
                            ? "#FFFFFF"
                            : "#999999",
                        }}
                      >
                        {t(`regions.${r.replace(/\s/g, "")}`, r)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Country list */}
            <CountryList
              ranked={displayedRanked}
              loading={loading}
              error={error}
              onRetry={refresh}
              highlightedCode={activeHighlight}
              expandedCode={expandedCode}
              onToggleExpanded={(code) =>
                setExpandedCode((c) => (c === code ? null : code))
              }
            />
          </div>
        </main>
      </div>
    </Layout>
  );
}

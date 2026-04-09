import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronUp,
  ChevronDown,
  Filter,
  List,
  GitCompare,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
import { AI_CATEGORY_KEYS, DISPLAYED_CORE_CATEGORY_KEYS } from "./utils/types";
import { DATA_SOURCE_KEYS } from "./utils/dataSources";
import "./index.css";

export default function App() {
  const navigate = useNavigate();
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
  const [compareMode, setCompareMode] = useState(false);
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  // Detect sticky state by reading the sentinel's actual position on every
  // scroll frame. This is more stable than IntersectionObserver, which can
  // fire spuriously when the sticky bar changes height (e.g. regions shown/
  // hidden), causing the sentinel to appear/disappear in a loop.
  useEffect(() => {
    const HEADER_H = 57;
    let ticking = false;
    const update = () => {
      const rect = sentinelRef.current?.getBoundingClientRect();
      if (rect) setIsSticky(rect.top < HEADER_H);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  useEffect(() => {
    if (!mobileParamsOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileParamsOpen]);

  const activeHighlight =
    searchMode === "highlight" && search.trim().length >= 1
      ? (matchingCodes[matchCursor] ?? null)
      : navCursor !== null
        ? (allCodes[navCursor] ?? null)
        : highlightedCode;

  const toggleSelect = useCallback((code: string) => {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }, []);

  const exitCompareMode = useCallback(() => {
    setCompareMode(false);
    setSelectedCodes(new Set());
  }, []);

  const handleCompare = useCallback(() => {
    if (selectedCodes.size < 2) return;
    navigate(`${langPrefix}/compare?c=${Array.from(selectedCodes).join(",")}`);
  }, [selectedCodes, navigate, langPrefix]);

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
            className="md:hidden fixed inset-0 z-50 flex"
            role="dialog"
            aria-modal="true"
            aria-label={t("mobileSheet.weightsAndPreferences")}
            onClick={() => setMobileParamsOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setMobileParamsOpen(false);
                return;
              }
              if (e.key !== "Tab") return;
              const sheet = e.currentTarget.querySelector<HTMLElement>(
                "[data-mobile-sheet]",
              );
              if (!sheet) return;
              const focusable = Array.from(
                sheet.querySelectorAll<HTMLElement>(
                  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
                ),
              ).filter((el) => !el.hasAttribute("disabled"));
              if (focusable.length === 0) return;
              const first = focusable[0];
              const last = focusable[focusable.length - 1];
              if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
              } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
              }
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: "rgba(0,0,0,0.72)",
                backdropFilter: "blur(6px)",
              }}
            />
            <div
              data-mobile-sheet
              className="relative mt-auto flex w-full flex-col overflow-hidden"
              style={{
                minHeight: "70vh",
                maxHeight: "calc(100dvh - 16px)",
                backgroundColor: "#1A1A1A",
                borderTopLeftRadius: "24px",
                borderTopRightRadius: "24px",
                borderTop: "1px solid #2A2A2A",
                boxShadow: "0 -18px 42px rgba(0,0,0,0.45)",
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
                    fontFamily: "Inter, sans-serif",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    color: "#9E9E9E",
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
                    color: "#9E9E9E",
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
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
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
        <main
          className="flex-1 min-w-0 pb-28 md:pb-0"
          style={{ backgroundColor: "#0F1114" }}
        >
          <div className="px-4 md:px-6">
            {/* Hero section */}
            <div
              className="relative -mx-4 mb-6 overflow-hidden md:mx-0 md:mb-6 md:rounded-lg"
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
                            fontFamily: "Inter, sans-serif",
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
                    fontFamily: "Oswald, sans-serif",
                    fontWeight: 700,
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
                    color: "#8A8A8A",
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
                <div className="hero-stats-row hero-banner-stats">
                  <div className="min-w-0">
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
                        fontFamily: "Inter, sans-serif",
                        fontSize: "10px",
                        color: "#757575",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        marginTop: "4px",
                      }}
                    >
                      {t("hero.stats.countries", { count: countries.length })}
                    </div>
                  </div>
                  <div className="hero-stat-divider" />
                  <Link
                    to={`${langPrefix}/indicators`}
                    className="min-w-0"
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
                        {DISPLAYED_CORE_CATEGORY_KEYS.length}
                      </div>
                      <div
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "10px",
                          color: "#757575",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          marginTop: "4px",
                        }}
                      >
                        {t("hero.stats.indicators", {
                          count: DISPLAYED_CORE_CATEGORY_KEYS.length,
                        })}
                      </div>
                    </div>
                  </Link>
                  <div className="hero-stat-divider" />
                  <Link
                    to={`${langPrefix}/data-sources`}
                    className="min-w-0"
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
                        {DATA_SOURCE_KEYS.flat().length}
                      </div>
                      <div
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "10px",
                          color: "#757575",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          marginTop: "4px",
                        }}
                      >
                        {t("hero.stats.dataSources", {
                          count: DATA_SOURCE_KEYS.flat().length,
                        })}
                      </div>
                    </div>
                  </Link>
                  <div className="hero-stat-divider" />
                  <Link
                    to={`${langPrefix}/ai-indicators`}
                    className="min-w-0"
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
                        {AI_CATEGORY_KEYS.length}
                      </div>
                      <div
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "10px",
                          color: "#757575",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          marginTop: "4px",
                        }}
                      >
                        {t("hero.stats.aiIndicators", {
                          count: AI_CATEGORY_KEYS.length,
                        })}
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Sentinel — used by IntersectionObserver to detect sticky state */}
            <div ref={sentinelRef} style={{ height: 0 }} />

            {/* Search bar + Region chips — sticky below header */}
            <div
              className="sticky z-20 -mx-4 px-4 pt-0 pb-4 md:-mx-6 md:px-6"
              style={{
                top: "56px",
                backgroundColor: "#0F1114",
                borderBottom: "1px solid #1a1a1a",
              }}
            >
              {/* Search + compare row */}
              <div className={`${isSticky ? "" : " mb-4"}`}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative flex-1 min-w-0">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      size={18}
                      style={{ color: "#8A8A8A" }}
                    />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder={t("search.placeholder")}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-12 rounded-md focus:outline-none"
                      style={{
                        height: "40px",
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
                                  color: "#8A8A8A",
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
                                    : "#757575",
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
                                    : "#757575",
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
                                Switch to <strong>scroll mode</strong> — shows
                                all countries, scrolls to each match.
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
                              color: "#9E9E9E",
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

                  <div className="flex w-full items-center justify-end gap-2 shrink-0 sm:w-auto">
                    {compareMode ? (
                      <>
                        <button
                          onClick={handleCompare}
                          className="flex-1 justify-center sm:flex-none"
                          disabled={selectedCodes.size < 2}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            height: "40px",
                            paddingLeft: "14px",
                            paddingRight: "14px",
                            borderRadius: "6px",
                            border:
                              selectedCodes.size < 2
                                ? "1px solid var(--color-accent-dim)"
                                : "none",
                            cursor:
                              selectedCodes.size < 2 ? "default" : "pointer",
                            backgroundColor:
                              selectedCodes.size < 2
                                ? "transparent"
                                : "var(--color-accent)",
                            color:
                              selectedCodes.size < 2
                                ? "var(--color-accent-dim)"
                                : "#FFFFFF",
                            fontFamily: "Inter, sans-serif",
                            fontSize: "13px",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            transition: "all 0.15s ease",
                            flexShrink: 0,
                          }}
                        >
                          <GitCompare size={15} />
                          {t("compare.compareSelected", "Compare")}
                          {selectedCodes.size > 0 && (
                            <span
                              style={{
                                backgroundColor:
                                  selectedCodes.size < 2
                                    ? "rgba(143,90,60,0.2)"
                                    : "rgba(255,255,255,0.25)",
                                borderRadius: "10px",
                                padding: "1px 7px",
                                fontSize: "12px",
                              }}
                            >
                              {selectedCodes.size}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={exitCompareMode}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "40px",
                            height: "40px",
                            borderRadius: "6px",
                            border: "1px solid #2A2A2A",
                            cursor: "pointer",
                            backgroundColor: "transparent",
                            color: "#8A8A8A",
                            flexShrink: 0,
                          }}
                          aria-label="Exit compare mode"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setCompareMode(true)}
                        className="w-full justify-center sm:w-auto"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          height: "40px",
                          paddingLeft: "14px",
                          paddingRight: "14px",
                          borderRadius: "6px",
                          border: "1px solid #2A2A2A",
                          cursor: "pointer",
                          backgroundColor: "transparent",
                          color: "#9E9E9E",
                          fontFamily: "Inter, sans-serif",
                          fontSize: "13px",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        <GitCompare size={15} />
                        {t("compare.compareMode", "Compare")}
                      </button>
                    )}
                  </div>
                </div>

                {compareMode && (
                  <p
                    style={{
                      marginTop: "8px",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "12px",
                      color: "#8A8A8A",
                      paddingLeft: "2px",
                    }}
                  >
                    {t(
                      "compare.helperText",
                      "Choose countries using the checkboxes in the list, then click Compare to open the comparison view.",
                    )}
                  </p>
                )}
              </div>

              {/* Region chips — hidden when sticky */}
              {!isSticky && (
                <div className="mb-0">
                  <div
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "13px",
                      fontWeight: 700,
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      color: "#9E9E9E",
                      marginBottom: "12px",
                    }}
                  >
                    {t("regions.label")}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => ws.setSelectedRegions(new Set())}
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "13px",
                        fontWeight: 600,
                        padding: "8px 18px",
                        borderRadius: "3px",
                        border: "none",
                        cursor: "pointer",
                        backgroundColor:
                          ws.selectedRegions.size === 0 ? "#8F5A3C" : "#2A2A2A",
                        color:
                          ws.selectedRegions.size === 0 ? "#FFFFFF" : "#9E9E9E",
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
                          fontFamily: "Inter, sans-serif",
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
                            : "#9E9E9E",
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
              expandedCode={compareMode ? null : expandedCode}
              onToggleExpanded={
                compareMode
                  ? undefined
                  : (code) => setExpandedCode((c) => (c === code ? null : code))
              }
              showAll={search.trim().length > 0}
              compareMode={compareMode}
              selectedCodes={selectedCodes}
              onToggleSelect={toggleSelect}
            />
          </div>
        </main>
      </div>
    </Layout>
  );
}

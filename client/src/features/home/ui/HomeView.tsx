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
import { Layout } from "@core/ui/layout";
import { CountryList } from "@features/country-ranking/ui";
import { WeightPanel } from "@features/country-ranking/ui";
import { Tooltip } from "@core/ui";
import { MobileSheet } from "@core/ui";
import { useCountries } from "@core/hooks";
import { useScoring } from "@features/country-ranking/hooks";
import { useLangPrefix } from "@core/hooks";
import { useWeightState } from "@features/country-ranking/hooks";
import { localizeCountry } from "@core/utils";
import { AI_CATEGORY_KEYS, DISPLAYED_CORE_CATEGORY_KEYS } from "@core/models";
import { DATA_SOURCE_KEYS } from "@features/data-sources/constants";

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
  const [searchMode, setSearchMode] = useState<"filter" | "highlight">("filter");
  const [compareMode, setCompareMode] = useState(false);
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialHighlightRef = useRef(searchParams.get("highlight"));
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
    const h = initialHighlightRef.current;
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
    const scrollTimer = setTimeout(() => {
      setHighlightedCode(h);
      const el = document.querySelector(`[data-country-code="${h}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      highlightTimer.current = setTimeout(() => setHighlightedCode(null), 2500);
    }, 80);

    return () => {
      clearTimeout(scrollTimer);
      if (highlightTimer.current) {
        clearTimeout(highlightTimer.current);
        highlightTimer.current = null;
      }
    };
  }, [setSearchParams]);

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

  const regions = useMemo(() => [...new Set(countries.map((c) => c.region))].sort(), [countries]);

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
  const updateSearch = useCallback((value: string) => {
    setSearch(value);
    setMatchCursor(0);
  }, []);
  useEffect(() => {
    const code = matchingCodes[matchCursor];
    if (!code) return;
    const el = document.querySelector(`[data-country-code="${code}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [matchCursor, matchingCodes]);
  const goNext = useCallback(
    () => setMatchCursor((c) => (matchingCodes.length ? (c + 1) % matchingCodes.length : 0)),
    [matchingCodes],
  );
  const goPrev = useCallback(
    () =>
      setMatchCursor((c) =>
        matchingCodes.length ? (c - 1 + matchingCodes.length) % matchingCodes.length : 0,
      ),
    [matchingCodes],
  );

  // Free keyboard navigation (no search active)
  const [navCursor, setNavCursor] = useState<number | null>(null);
  const allCodes = useMemo(() => ranked.map((r) => r.country.code), [ranked]);
  const activeNavCursor =
    navCursor !== null && navCursor >= 0 && navCursor < allCodes.length ? navCursor : null;
  useEffect(() => {
    if (activeNavCursor === null) return;
    const code = allCodes[activeNavCursor];
    if (!code) return;
    const el = document.querySelector(`[data-country-code="${code}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeNavCursor, allCodes]);

  // Arrow key handler
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isSearchInput = e.target === searchInputRef.current;

      if (e.key === "Enter") {
        const highlighted =
          search.trim().length >= 1
            ? (matchingCodes[matchCursor] ?? null)
            : activeNavCursor !== null
              ? (allCodes[activeNavCursor] ?? null)
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
        (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
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
  }, [search, searchMode, goNext, goPrev, allCodes, matchingCodes, matchCursor, activeNavCursor]);

  const activeHighlight =
    searchMode === "highlight" && search.trim().length >= 1
      ? (matchingCodes[matchCursor] ?? null)
      : activeNavCursor !== null
        ? (allCodes[activeNavCursor] ?? null)
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
        <aside className="hidden md:block sticky top-14 self-start w-[340px] h-[calc(100vh-56px)]">
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

        <MobileSheet
          open={mobileParamsOpen}
          title={t("mobileSheet.weightsAndPreferences")}
          closeLabel={t("a11y.closeParameters", "Close parameters")}
          onClose={() => setMobileParamsOpen(false)}
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
            mobile
          />
        </MobileSheet>

        {/* Mobile FAB - Parameters button */}
        <button
          className="md:hidden fixed z-40 flex items-center gap-2 shadow-lg h-12 pl-4 pr-[18px] rounded-[24px] bg-accent text-white text-sm font-semibold right-4"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)" }}
          onClick={() => setMobileParamsOpen(true)}
          aria-label={t("a11y.openParameters", "Open parameters")}
        >
          <SlidersHorizontal size={18} />
          {t("mobileSheet.parameters")}
        </button>

        {/* Right content area */}
        <main className="flex-1 min-w-0 pb-28 md:pb-0 bg-bg">
          <div className="px-4 md:px-6">
            {/* Hero section */}
            <div
              className="relative -mx-4 mb-6 overflow-hidden md:mx-0 md:mb-6 md:rounded-lg"
              style={{
                background: "#0A0A0F",
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

              <div className="relative flex flex-col justify-end px-4 py-4 md:px-12 md:py-12 min-h-[160px]">
                {/* Eyebrow */}
                <div className="flex items-center gap-2 mb-2 md:mb-3">
                  {t("hero.eyebrow")
                    .split("·")
                    .map((word, i) => (
                      <span key={i} className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-accent-dim shrink-0 inline-block relative" />
                        <span className="text-[11px] font-medium tracking-[2.5px] uppercase text-accent-dim leading-none">
                          {word.trim()}
                        </span>
                      </span>
                    ))}
                </div>
                {/* H1 — responsive font */}
                <h1 className="text-3xl md:text-6xl font-bold leading-[0.95] text-white mb-2 font-display">
                  {t("hero.title")}
                </h1>
                {/* Tagline */}
                <p className="hidden md:block text-[15px] text-dim max-w-[580px] mb-5">
                  {t("hero.tagline")}
                </p>
                {/* Copper rule */}
                <div className="hidden md:block w-32 h-0.5 bg-accent mb-4" />
                {/* Stats row */}
                <div className="hero-stats-row hero-banner-stats">
                  <div className="min-w-0">
                    <div className="font-mono text-lg font-semibold text-accent-dim leading-none">
                      {countries.length}
                    </div>
                    <div className="text-[10px] text-dimmest uppercase tracking-[1px] mt-1">
                      {t("hero.stats.countries", { count: countries.length })}
                    </div>
                  </div>
                  <div className="hero-stat-divider" />
                  <Link to={`${langPrefix}/indicators`} className="min-w-0 no-underline">
                    <div>
                      <div className="font-mono text-lg font-semibold text-accent-dim leading-none">
                        {DISPLAYED_CORE_CATEGORY_KEYS.length}
                      </div>
                      <div className="text-[10px] text-dimmest uppercase tracking-[1px] mt-1">
                        {t("hero.stats.indicators", {
                          count: DISPLAYED_CORE_CATEGORY_KEYS.length,
                        })}
                      </div>
                    </div>
                  </Link>
                  <div className="hero-stat-divider" />
                  <Link to={`${langPrefix}/data-sources`} className="min-w-0 no-underline">
                    <div>
                      <div className="font-mono text-lg font-semibold text-accent-dim leading-none">
                        {DATA_SOURCE_KEYS.flat().length}
                      </div>
                      <div className="text-[10px] text-dimmest uppercase tracking-[1px] mt-1">
                        {t("hero.stats.dataSources", {
                          count: DATA_SOURCE_KEYS.flat().length,
                        })}
                      </div>
                    </div>
                  </Link>
                  <div className="hero-stat-divider" />
                  <Link to={`${langPrefix}/ai-indicators`} className="min-w-0 no-underline">
                    <div>
                      <div className="font-mono text-lg font-semibold text-accent-dim leading-none">
                        {AI_CATEGORY_KEYS.length}
                      </div>
                      <div className="text-[10px] text-dimmest uppercase tracking-[1px] mt-1">
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
            <div ref={sentinelRef} className="h-0" />

            {/* Search bar + Region chips — sticky below header */}
            <div
              className={`sticky z-20 -mx-4 px-4 pb-4 md:-mx-6 md:px-6 top-14 bg-bg border-b border-surface ${isSticky ? "pt-3" : "pt-0"}`}
            >
              {/* Search + compare row */}
              <div className={`${isSticky ? "" : " mb-4"}`}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative flex-1 min-w-0">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-dim"
                      size={18}
                    />
                    <input
                      ref={searchInputRef}
                      name="country-search"
                      type="text"
                      placeholder={t("search.placeholder")}
                      value={search}
                      onChange={(e) => updateSearch(e.target.value)}
                      className="w-full pl-12 rounded-md focus:outline-none h-10 text-white text-sm bg-[#161616] border border-surface pr-[var(--pr)]"
                      style={
                        {
                          "--pr":
                            search.length === 0
                              ? "16px"
                              : searchMode === "highlight" && search.trim().length >= 1
                                ? "164px"
                                : "72px",
                        } as React.CSSProperties
                      }
                    />
                    {search.length > 0 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          onClick={() => updateSearch("")}
                          className="flex items-center justify-center w-6 h-6 rounded-[3px] border-0 cursor-pointer bg-surface-4 text-tertiary"
                          aria-label={t("a11y.clearSearch", "Clear search")}
                        >
                          <X size={14} />
                        </button>
                        {searchMode === "highlight" && search.trim().length >= 1 && (
                          <>
                            <span className="font-mono text-[11px] text-dim min-w-9 text-right">
                              {matchingCodes.length > 0
                                ? `${matchCursor + 1}/${matchingCodes.length}`
                                : "0/0"}
                            </span>
                            <button
                              onClick={goPrev}
                              disabled={matchingCodes.length === 0}
                              className={`flex items-center justify-center w-6 h-6 rounded-[3px] border-0 bg-surface-4 ${matchingCodes.length ? "cursor-pointer text-tertiary" : "cursor-default text-dimmest"}`}
                              aria-label={t("a11y.previousMatch", "Previous match")}
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              onClick={goNext}
                              disabled={matchingCodes.length === 0}
                              className={`flex items-center justify-center w-6 h-6 rounded-[3px] border-0 bg-surface-4 ${matchingCodes.length ? "cursor-pointer text-tertiary" : "cursor-default text-dimmest"}`}
                              aria-label={t("a11y.nextMatch", "Next match")}
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
                                {t(
                                  "a11y.searchModeScrollTooltip",
                                  "Switch to scroll mode - shows all countries and scrolls to each match.",
                                )}
                              </span>
                            ) : (
                              <span>
                                {t(
                                  "a11y.searchModeFilterTooltip",
                                  "Switch to filter mode - hides non-matching countries.",
                                )}
                              </span>
                            )
                          }
                        >
                          <button
                            onClick={() => {
                              setSearchMode((m) => (m === "filter" ? "highlight" : "filter"));
                              setMatchCursor(0);
                            }}
                            className="flex items-center justify-center w-6 h-6 rounded-[3px] border-0 cursor-pointer bg-surface-4 text-muted"
                            aria-label={
                              searchMode === "filter"
                                ? t("a11y.switchToScrollMode", "Switch to scroll mode")
                                : t("a11y.switchToFilterMode", "Switch to filter mode")
                            }
                          >
                            {searchMode === "filter" ? <List size={13} /> : <Filter size={13} />}
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
                          className={`flex-1 justify-center sm:flex-none flex items-center gap-1.5 h-10 px-3.5 rounded-md text-[13px] font-semibold whitespace-nowrap shrink-0 transition-all duration-150 ${selectedCodes.size < 2 ? "border border-accent-dim cursor-default bg-[#161616] text-accent-dim" : "border-0 cursor-pointer bg-accent text-white"}`}
                          disabled={selectedCodes.size < 2}
                        >
                          <GitCompare size={15} />
                          {t("compare.compareSelected", "Compare")}
                          {selectedCodes.size > 0 && (
                            <span
                              className={`rounded-[10px] px-[7px] py-px text-xs ${selectedCodes.size < 2 ? "bg-[rgba(143,90,60,0.2)]" : "bg-[rgba(255,255,255,0.25)]"}`}
                            >
                              {selectedCodes.size}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={exitCompareMode}
                          className="flex items-center justify-center w-10 h-10 rounded-md border border-surface-4 cursor-pointer bg-[#161616] text-dim shrink-0"
                          aria-label={t("a11y.exitCompareMode", "Exit compare mode")}
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setCompareMode(true)}
                        className="w-full justify-center sm:w-auto flex items-center gap-1.5 h-10 px-3.5 rounded-md border border-surface-4 cursor-pointer bg-[#161616] text-muted text-[13px] font-medium whitespace-nowrap shrink-0"
                      >
                        <GitCompare size={15} />
                        {t("compare.compareMode", "Compare")}
                      </button>
                    )}
                  </div>
                </div>

                {compareMode && (
                  <p className="mt-2 text-xs text-dim pl-0.5">
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
                  <div className="text-[13px] font-bold tracking-[2px] uppercase text-muted mb-3">
                    {t("regions.label")}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => ws.setSelectedRegions(new Set())}
                      className={`text-[13px] font-semibold px-[18px] py-2 rounded-[3px] border-0 cursor-pointer ${ws.selectedRegions.size === 0 ? "bg-accent text-white" : "bg-surface-4 text-muted"}`}
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
                        className={`text-[13px] font-semibold px-[18px] py-2 rounded-[3px] border-0 cursor-pointer ${ws.selectedRegions.has(r) ? "bg-accent text-white" : "bg-surface-4 text-muted"}`}
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
              showAll={search.trim().length > 0 || highlightedCode !== null}
              compareMode={compareMode}
              selectedCodes={selectedCodes}
              onToggleSelect={toggleSelect}
              weights={ws.weights}
            />
          </div>
        </main>
      </div>
    </Layout>
  );
}

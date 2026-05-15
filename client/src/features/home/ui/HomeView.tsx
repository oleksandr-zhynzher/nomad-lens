import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout, ResponsiveSidePanelLayout } from "@core/ui/layout";
import { CompareModeActions } from "@core/ui";
import { CountryList } from "@features/country-ranking/ui";
import { WeightPanel } from "@features/country-ranking/ui";
import { useCountries } from "@core/hooks";
import { useScoring } from "@features/country-ranking/hooks";
import { useLangPrefix } from "@core/hooks";
import { useWeightState } from "@features/country-ranking/hooks";
import { localizeCountry } from "@core/utils";
import { AI_CATEGORY_KEYS, DISPLAYED_CORE_CATEGORY_KEYS } from "@core/models";
import { DATA_SOURCE_KEYS } from "@features/data-sources/constants";
import type { SearchMode } from "./home.types";
import { getSearchPaddingRight, getActiveHighlight } from "./home.utils";
import { HomeSearchControls } from "./HomeSearchControls";

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
  const [searchMode, setSearchMode] = useState<SearchMode>("filter");
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
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
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
    if (h == null) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("highlight");
        return next;
      },
      { replace: true },
    );
    if (highlightTimer.current != null) clearTimeout(highlightTimer.current);
    const scrollTimer = setTimeout(() => {
      setHighlightedCode(h);
      const el = document.querySelector(`[data-country-code="${h}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      highlightTimer.current = setTimeout(() => {
        setHighlightedCode(null);
      }, 2500);
    }, 80);

    return () => {
      clearTimeout(scrollTimer);
      if (highlightTimer.current != null) {
        clearTimeout(highlightTimer.current);
        highlightTimer.current = null;
      }
    };
  }, [setSearchParams]);

  const displayedRanked = useMemo(() => {
    if (searchMode === "filter" && search.trim().length > 0) {
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
    () => [...new Set(countries.map((c) => c.region))].sort((a, b) => a.localeCompare(b)),
    [countries],
  );

  // Search navigation
  const matchingCodes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length === 0) return [];
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
    if (matchingCodes.length === 0) return;
    const code = matchingCodes[matchCursor % matchingCodes.length];
    const el = document.querySelector(`[data-country-code="${code}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [matchCursor, matchingCodes]);
  const goNext = useCallback(() => {
    setMatchCursor((c) => (matchingCodes.length > 0 ? (c + 1) % matchingCodes.length : 0));
  }, [matchingCodes]);
  const goPrev = useCallback(() => {
    setMatchCursor((c) =>
      matchingCodes.length > 0 ? (c - 1 + matchingCodes.length) % matchingCodes.length : 0,
    );
  }, [matchingCodes]);

  // Free keyboard navigation (no search active)
  const [navCursor, setNavCursor] = useState<number | null>(null);
  const allCodes = useMemo(() => ranked.map((r) => r.country.code), [ranked]);
  const activeNavCursor =
    navCursor !== null && navCursor >= 0 && navCursor < allCodes.length ? navCursor : null;
  useEffect(() => {
    if (activeNavCursor === null || activeNavCursor >= allCodes.length) return;
    const code = allCodes[activeNavCursor];
    const el = document.querySelector(`[data-country-code="${code}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeNavCursor, allCodes]);

  // Arrow key handler
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isSearchInput = e.target === searchInputRef.current;

      if (e.key === "Enter") {
        let highlighted: string | null = null;
        if (search.trim().length > 0) {
          highlighted = matchingCodes[matchCursor] ?? null;
        } else if (activeNavCursor !== null) {
          highlighted = allCodes[activeNavCursor] ?? null;
        }
        if (highlighted !== null) {
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
      if (search.trim().length > 0) {
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
          if (len === 0) return null;
          if (c === null) return e.key === "ArrowDown" ? 0 : len - 1;
          return e.key === "ArrowDown" ? (c + 1) % len : (c - 1 + len) % len;
        });
      }
    };
    globalThis.addEventListener("keydown", onKeyDown);
    return () => {
      globalThis.removeEventListener("keydown", onKeyDown);
    };
  }, [search, searchMode, goNext, goPrev, allCodes, matchingCodes, matchCursor, activeNavCursor]);

  const activeHighlight = getActiveHighlight(
    searchMode,
    search,
    matchingCodes,
    matchCursor,
    activeNavCursor,
    highlightedCode,
    allCodes,
  );

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
    void navigate(`${langPrefix}/compare?c=${[...selectedCodes].join(",")}`);
  }, [selectedCodes, navigate, langPrefix]);

  const weightPanelProps = {
    weights: ws.weights,
    onChange: ws.handleWeightChange,
    onReset: ws.handleReset,
    weightsAreDefault: ws.weightsAreDefault,
    onShare: () => {
      ws.handleShare();
    },
    climatePrefs: ws.climatePrefs,
    onClimatePrefsChange: ws.setClimatePrefs,
    nomadVisaOnly: ws.nomadVisaOnly,
    onNomadVisaOnlyChange: ws.setNomadVisaOnly,
    schengenOnly: ws.schengenOnly,
    onSchengenOnlyChange: ws.setSchengenOnly,
    minTouristDays: ws.minTouristDays,
    onMinTouristDaysChange: ws.setMinTouristDays,
    weightMode: ws.weightMode,
    onWeightModeChange: ws.handleWeightModeChange,
  };

  return (
    <Layout>
      <ResponsiveSidePanelLayout
        sidebar={<WeightPanel {...weightPanelProps} />}
        mobileSheet={{
          open: mobileParamsOpen,
          title: t("mobileSheet.weightsAndPreferences"),
          closeLabel: t("a11y.closeParameters", "Close parameters"),
          onClose: () => {
            setMobileParamsOpen(false);
          },
          children: <WeightPanel {...weightPanelProps} mobile />,
        }}
        mobileFab={{
          label: t("mobileSheet.parameters"),
          ariaLabel: t("a11y.openParameters", "Open parameters"),
          icon: <SlidersHorizontal size={18} aria-hidden />,
          onClick: () => {
            setMobileParamsOpen(true);
          },
        }}
      >
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
                background: "linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.85) 100%)",
              }}
            />

            <div className="relative flex min-h-[160px] flex-col justify-end px-4 py-4 md:px-12 md:py-12">
              {/* Eyebrow */}
              <div className="mb-2 flex items-center gap-2 md:mb-3">
                {t("hero.eyebrow")
                  .split("·")
                  .map((word) => (
                    <span key={word.trim()} className="flex items-center gap-2">
                      <span className="relative inline-block h-1 w-1 shrink-0 rounded-full bg-accent-dim" />
                      <span className="text-[11px] leading-none font-medium tracking-[2.5px] text-accent-dim uppercase">
                        {word.trim()}
                      </span>
                    </span>
                  ))}
              </div>
              {/* H1 — responsive font */}
              <h1 className="mb-2 font-display text-3xl leading-[0.95] font-bold text-white md:text-6xl">
                {t("hero.title")}
              </h1>
              {/* Tagline */}
              <p className="mb-5 hidden max-w-[580px] text-[15px] text-dim md:block">
                {t("hero.tagline")}
              </p>
              {/* Copper rule */}
              <div className="mb-4 hidden h-0.5 w-32 bg-accent md:block" />
              {/* Stats row */}
              <div className="hero-stats-row hero-banner-stats">
                <div className="min-w-0">
                  <div className="font-mono text-lg leading-none font-semibold text-accent-dim">
                    {countries.length}
                  </div>
                  <div className="mt-1 text-[10px] tracking-[1px] text-dimmest uppercase">
                    {t("hero.stats.countries", { count: countries.length })}
                  </div>
                </div>
                <div className="hero-stat-divider" />
                <Link to={`${langPrefix}/indicators`} className="min-w-0 no-underline">
                  <div>
                    <div className="font-mono text-lg leading-none font-semibold text-accent-dim">
                      {DISPLAYED_CORE_CATEGORY_KEYS.length}
                    </div>
                    <div className="mt-1 text-[10px] tracking-[1px] text-dimmest uppercase">
                      {t("hero.stats.indicators", {
                        count: DISPLAYED_CORE_CATEGORY_KEYS.length,
                      })}
                    </div>
                  </div>
                </Link>
                <div className="hero-stat-divider" />
                <Link to={`${langPrefix}/data-sources`} className="min-w-0 no-underline">
                  <div>
                    <div className="font-mono text-lg leading-none font-semibold text-accent-dim">
                      {DATA_SOURCE_KEYS.flat().length}
                    </div>
                    <div className="mt-1 text-[10px] tracking-[1px] text-dimmest uppercase">
                      {t("hero.stats.dataSources", {
                        count: DATA_SOURCE_KEYS.flat().length,
                      })}
                    </div>
                  </div>
                </Link>
                <div className="hero-stat-divider" />
                <Link to={`${langPrefix}/ai-indicators`} className="min-w-0 no-underline">
                  <div>
                    <div className="font-mono text-lg leading-none font-semibold text-accent-dim">
                      {AI_CATEGORY_KEYS.length}
                    </div>
                    <div className="mt-1 text-[10px] tracking-[1px] text-dimmest uppercase">
                      {t("hero.stats.aiIndicators", {
                        count: AI_CATEGORY_KEYS.length,
                      })}
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Sentinel — used by scroll detection */}
          <div ref={sentinelRef} className="h-0" />

          {/* Search bar + Region chips — sticky below header */}
          <div
            className={`sticky top-14 z-20 -mx-4 border-b border-surface bg-bg px-4 pb-4 md:-mx-6 md:px-6 ${isSticky ? "pt-3" : "pt-0"}`}
          >
            {/* Search + compare row */}
            <div className={isSticky ? "" : "mb-4"}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                  <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-dim" size={18} />
                  <input
                    ref={searchInputRef}
                    name="country-search"
                    type="text"
                    placeholder={t("search.placeholder")}
                    value={search}
                    onChange={(e) => {
                      updateSearch(e.target.value);
                    }}
                    className="h-10 w-full rounded-md border border-surface bg-[#161616] pr-[var(--pr)] pl-12 text-sm text-white focus:outline-none"
                    style={
                      {
                        "--pr": getSearchPaddingRight(
                          search.length === 0,
                          searchMode,
                          search.trim().length > 0,
                        ),
                      } as React.CSSProperties
                    }
                  />
                  {search !== "" ? (
                    <HomeSearchControls
                      searchMode={searchMode}
                      search={search}
                      matchingCodes={matchingCodes}
                      matchCursor={matchCursor}
                      onClear={() => {
                        updateSearch("");
                      }}
                      onPrev={goPrev}
                      onNext={goNext}
                      onModeChange={setSearchMode}
                      onCursorReset={() => {
                        setMatchCursor(0);
                      }}
                    />
                  ) : null}
                </div>

                <CompareModeActions
                  active={compareMode}
                  selectedCount={selectedCodes.size}
                  enterLabel={t("compare.compareMode", "Compare")}
                  compareLabel={t("compare.compareSelected", "Compare")}
                  exitLabel={t("a11y.exitCompareMode", "Exit compare mode")}
                  helperText={
                    compareMode
                      ? t(
                          "compare.helperText",
                          "Choose countries using the checkboxes in the list, then click Compare to open the comparison view.",
                        )
                      : undefined
                  }
                  onEnter={() => {
                    setCompareMode(true);
                  }}
                  onExit={exitCompareMode}
                  onCompare={handleCompare}
                />
              </div>
            </div>

            {/* Region chips — hidden when sticky */}
            {isSticky ? null : (
              <div className="mb-0">
                <div className="mb-3 text-[13px] font-bold tracking-[2px] text-muted uppercase">
                  {t("regions.label")}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      ws.setSelectedRegions(new Set());
                    }}
                    className={`cursor-pointer rounded-[3px] border-0 px-[18px] py-2 text-[13px] font-semibold ${ws.selectedRegions.size === 0 ? "bg-accent text-white" : "bg-surface-4 text-muted"}`}
                  >
                    {t("regions.all")}
                  </button>
                  {regions.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        ws.setSelectedRegions((prev) => {
                          const next = new Set(prev);
                          if (next.has(r)) next.delete(r);
                          else next.add(r);
                          return next;
                        });
                      }}
                      className={`cursor-pointer rounded-[3px] border-0 px-[18px] py-2 text-[13px] font-semibold ${ws.selectedRegions.has(r) ? "bg-accent text-white" : "bg-surface-4 text-muted"}`}
                    >
                      {t(`regions.${r.replaceAll(/\s/g, "")}`, r)}
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
                : (code) => {
                    setExpandedCode((c) => (c === code ? null : code));
                  }
            }
            showAll={search.trim().length > 0 || highlightedCode !== null}
            compareMode={compareMode}
            selectedCodes={selectedCodes}
            onToggleSelect={toggleSelect}
            weights={ws.weights}
          />
        </div>
      </ResponsiveSidePanelLayout>
    </Layout>
  );
}

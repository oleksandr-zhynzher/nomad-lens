import { useMemo, useState, useRef, useCallback, useEffect } from "react";
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
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout } from "@core/ui/layout";
import { TourismCountryCard } from "@features/tourism/ui";
import { TourismWeightPanel } from "@features/tourism/ui";
import { Tooltip } from "@core/ui";
import { MobileSheet } from "@core/ui";
import { useCountries } from "@core/hooks";
import { useLangPrefix } from "@core/hooks";
import { useTourismScoring } from "@features/tourism/hooks";
import { ALL_TOURISM_TAGS, useTourismWeightState } from "@features/tourism/hooks";
import { localizeCountry } from "@core/utils";
import { TOURISM_CATEGORY_KEYS } from "@core/models";

export function TourismPage() {
  const { t, i18n } = useTranslation();
  const langPrefix = useLangPrefix();
  const navigate = useNavigate();
  const { countries, loading } = useCountries();

  const ws = useTourismWeightState();
  const ranked = useTourismScoring(
    countries,
    ws.weights,
    ws.selectedRegions,
    ws.toggles,
    ws.budgetState,
    ws.travelDates,
  );

  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState<"filter" | "highlight">("filter");
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);
  const [matchCursor, setMatchCursor] = useState(0);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [mobileParamsOpen, setMobileParamsOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Search — matching codes for highlight mode
  const matchingCodes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || searchMode !== "highlight") return [];
    const codes: string[] = [];
    for (const rankedCountry of ranked) {
      if (localizeCountry(rankedCountry.country, i18n.language).name.toLowerCase().includes(q)) {
        codes.push(rankedCountry.country.code);
      }
    }
    return codes;
  }, [search, searchMode, ranked, i18n.language]);

  useEffect(() => {
    // Use a microtask to avoid synchronous setState inside effect (react-hooks/set-state-in-effect)
    const id = setTimeout(() => {
      if (searchMode === "highlight" && matchingCodes.length > 0) {
        setHighlightedCode(matchingCodes[matchCursor % matchingCodes.length]);
      } else {
        setHighlightedCode(null);
      }
    }, 0);
    return () => {
      clearTimeout(id);
    };
  }, [matchingCodes, matchCursor, searchMode]);

  // Scroll to highlighted country
  useEffect(() => {
    if (!highlightedCode) return;
    const el = document.querySelector(`[data-country-code="${highlightedCode}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightedCode]);

  const goNext = useCallback(() => {
    setMatchCursor((c) => (matchingCodes.length > 0 ? (c + 1) % matchingCodes.length : 0));
  }, [matchingCodes.length]);
  const goPrev = useCallback(() => {
    setMatchCursor((c) =>
      matchingCodes.length > 0 ? (c - 1 + matchingCodes.length) % matchingCodes.length : 0,
    );
  }, [matchingCodes.length]);

  // Filtered/displayed list
  const displayedRanked = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || searchMode === "highlight") return ranked;
    return ranked.filter((r) =>
      localizeCountry(r.country, i18n.language).name.toLowerCase().includes(q),
    );
  }, [ranked, search, searchMode, i18n.language]);

  const activeHighlight = searchMode === "highlight" ? highlightedCode : undefined;

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
    void navigate(`${langPrefix}/compare?m=tourism&c=${[...selectedCodes].join(",")}`);
  }, [selectedCodes, navigate, langPrefix]);

  return (
    <Layout>
      <div className="flex">
        {/* Left sidebar - Tourism Weight Panel (hidden on mobile) */}
        <aside className="sticky top-14 hidden h-[calc(100vh-56px)] w-[340px] self-start md:block">
          <TourismWeightPanel
            weights={ws.weights}
            onChange={ws.handleWeightChange}
            onReset={ws.handleReset}
            weightsAreDefault={ws.weightsAreDefault}
            budgetState={ws.budgetState}
            onBudgetChange={ws.setBudgetField}
            toggles={ws.toggles}
            onToggleFieldChange={ws.setToggleField}
            travelDates={ws.travelDates}
            onTravelDatesChange={ws.setTravelDates}
          />
        </aside>

        <MobileSheet
          open={mobileParamsOpen}
          title={t("tourismWeights.title", "Tourism Weights")}
          closeLabel={t("tourism.a11y.closeParameters", "Close parameters")}
          onClose={() => {
            setMobileParamsOpen(false);
          }}
        >
          <TourismWeightPanel
            weights={ws.weights}
            onChange={ws.handleWeightChange}
            onReset={ws.handleReset}
            weightsAreDefault={ws.weightsAreDefault}
            budgetState={ws.budgetState}
            onBudgetChange={ws.setBudgetField}
            toggles={ws.toggles}
            onToggleFieldChange={ws.setToggleField}
            travelDates={ws.travelDates}
            onTravelDatesChange={ws.setTravelDates}
            mobile
          />
        </MobileSheet>

        {/* Mobile FAB - Parameters button */}
        <button
          className="fixed right-4 z-40 flex h-12 items-center gap-2 rounded-[24px] bg-accent pr-[18px] pl-4 text-sm font-semibold text-white shadow-lg md:hidden"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)" }}
          onClick={() => {
            setMobileParamsOpen(true);
          }}
          aria-label={t("tourism.a11y.openParameters", "Open parameters")}
        >
          <SlidersHorizontal size={18} />
          {t("mobileSheet.parameters", "Parameters")}
        </button>

        {/* Right content area */}
        <main className="min-w-0 flex-1 bg-[#0A0A0F] pb-28 md:pb-0">
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
              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.85) 100%)",
                }}
              />

              <div className="relative flex min-h-[160px] flex-col justify-end px-4 py-4 md:px-12 md:py-12">
                <div className="mb-2 flex items-center gap-2 md:mb-3">
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-1 w-1 shrink-0 rounded-full bg-accent-dim" />
                    <span className="text-[11px] leading-none font-medium tracking-[2.5px] text-accent-dim uppercase">
                      {t("tourism.eyebrow", "EXPLORE")}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-1 w-1 shrink-0 rounded-full bg-accent-dim" />
                    <span className="text-[11px] leading-none font-medium tracking-[2.5px] text-accent-dim uppercase">
                      {t("nav.tourism", "TOURISM")}
                    </span>
                  </span>
                </div>

                {/* H1 */}
                <h1 className="mb-2 font-display text-3xl leading-[0.95] font-semibold text-white md:text-6xl">
                  {t("tourism.title", "TOURISM EXPLORER")}
                </h1>

                {/* Tagline */}
                <p className="mb-5 hidden max-w-[580px] text-[15px] text-dim md:block">
                  {t("tourism.subtitle")}
                </p>

                {/* Copper rule */}
                <div className="mb-4 hidden h-0.5 w-32 bg-accent md:block" />

                {/* Stats row */}
                <div className="hero-stats-row hero-banner-stats">
                  <div className="min-w-0">
                    <div className="font-mono text-[18px] leading-none font-semibold text-accent-dim">
                      {ranked.length}
                    </div>
                    <div className="mt-1 text-[10px] tracking-[1px] text-dimmer uppercase">
                      {t("hero.stats.countries", {
                        count: ranked.length,
                      })}
                    </div>
                  </div>
                  <div className="hero-stat-divider" />
                  <div className="min-w-0">
                    <div className="font-mono text-[18px] leading-none font-semibold text-accent-dim">
                      {TOURISM_CATEGORY_KEYS.length}
                    </div>
                    <div className="mt-1 text-[10px] tracking-[1px] text-dimmer uppercase">
                      {t("tourismWeights.metricsLabel", "Tourism Metrics")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sentinel for sticky detection */}
            <div ref={sentinelRef} className="h-px" />

            {/* Sticky search bar */}
            <div className="sticky top-14 z-20 bg-[#0A0A0F] pt-2 pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div className="flex h-10 flex-1 items-center gap-2 rounded-[6px] border border-[#333333] bg-[#1A1A1C] px-3">
                    <Search size={16} color="#757575" />
                    <input
                      ref={searchInputRef}
                      name="tourism-search"
                      type="text"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setMatchCursor(0);
                      }}
                      placeholder={t("tourism.searchPlaceholder", "Search countries…")}
                      className="flex-1 border-none bg-transparent text-sm text-[#E8E9EB] outline-none"
                    />
                    {search ? (
                      <button
                        onClick={() => {
                          setSearch("");
                          setHighlightedCode(null);
                          setMatchCursor(0);
                        }}
                        className="flex cursor-pointer items-center border-0 bg-transparent text-dimmer"
                      >
                        <X size={14} />
                      </button>
                    ) : null}
                  </div>

                  {/* Search mode controls */}
                  {search.trim() ? (
                    <div className="flex shrink-0 items-center gap-1">
                      {searchMode === "highlight" && matchingCodes.length > 0 ? (
                        <>
                          <span className="font-mono text-[11px] whitespace-nowrap text-dim">
                            {matchCursor + 1}/{matchingCodes.length}
                          </span>
                          <button
                            onClick={goPrev}
                            disabled={matchingCodes.length === 0}
                            className={`flex h-6 w-6 items-center justify-center rounded-[3px] border-0 bg-[#2A2A2A] ${matchingCodes.length > 0 ? "cursor-pointer text-muted" : "cursor-default text-dimmer"}`}
                            aria-label={t("tourism.a11y.previousMatch", "Previous match")}
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            onClick={goNext}
                            disabled={matchingCodes.length === 0}
                            className={`flex h-6 w-6 items-center justify-center rounded-[3px] border-0 bg-[#2A2A2A] ${matchingCodes.length > 0 ? "cursor-pointer text-muted" : "cursor-default text-dimmer"}`}
                            aria-label={t("tourism.a11y.nextMatch", "Next match")}
                          >
                            <ChevronDown size={14} />
                          </button>
                        </>
                      ) : null}
                      <Tooltip
                        side="bottom"
                        content={
                          searchMode === "filter" ? (
                            <span>
                              {t(
                                "tourism.searchModeScrollTooltip",
                                "Switch to scroll mode - shows all countries and scrolls to each match.",
                              )}
                            </span>
                          ) : (
                            <span>
                              {t(
                                "tourism.searchModeFilterTooltip",
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
                          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-[3px] border-0 bg-[#2A2A2A] text-on-surface"
                          aria-label={
                            searchMode === "filter"
                              ? t("tourism.a11y.switchToScrollMode", "Switch to scroll mode")
                              : t("tourism.a11y.switchToFilterMode", "Switch to filter mode")
                          }
                        >
                          {searchMode === "filter" ? <List size={13} /> : <Filter size={13} />}
                        </button>
                      </Tooltip>
                    </div>
                  ) : null}
                </div>

                <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto">
                  {compareMode ? (
                    <>
                      <button
                        onClick={handleCompare}
                        className={`flex h-10 flex-1 shrink-0 items-center justify-center gap-1.5 rounded-[6px] px-[14px] text-[13px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out sm:flex-none ${selectedCodes.size < 2 ? "cursor-default border border-accent-dim bg-[#161616] text-accent-dim" : "cursor-pointer border-0 bg-accent text-white"}`}
                        disabled={selectedCodes.size < 2}
                      >
                        <GitCompare size={15} />
                        {t("compare.compareSelected", "Compare")}
                        {selectedCodes.size > 0 ? (
                          <span
                            className={`rounded-[10px] px-[7px] py-px text-xs ${selectedCodes.size < 2 ? "bg-[rgba(143,90,60,0.2)]" : "bg-[rgba(255,255,255,0.25)]"}`}
                          >
                            {selectedCodes.size}
                          </span>
                        ) : null}
                      </button>
                      <button
                        onClick={exitCompareMode}
                        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[6px] border border-[#2A2A2A] bg-[#161616] text-dim"
                        aria-label={t("tourism.a11y.exitCompareMode", "Exit compare mode")}
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setCompareMode(true);
                      }}
                      className="flex h-10 w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[6px] border border-[#2A2A2A] bg-[#161616] px-[14px] text-[13px] font-medium whitespace-nowrap text-on-surface sm:w-auto"
                    >
                      <GitCompare size={15} />
                      {t("compare.compareMode", "Compare")}
                    </button>
                  )}
                </div>
              </div>

              {compareMode ? (
                <p className="mt-2 pl-0.5 text-xs text-dim">
                  {t(
                    "compare.helperText",
                    "Choose countries using the checkboxes in the list, then click Compare to open the comparison view.",
                  )}
                </p>
              ) : null}
            </div>

            {/* Activity tag chips */}
            <div className="mb-0">
              <div className="mb-3 text-[13px] font-bold tracking-[2px] text-on-surface uppercase">
                {t("tourismFilters.activityTags", "Activities")}
              </div>
              <div className="flex flex-wrap gap-2">
                {ALL_TOURISM_TAGS.map((tag) => {
                  const active = ws.toggles.requiredTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        ws.handleToggleTag(tag);
                      }}
                      className={`cursor-pointer rounded-[3px] border-0 px-[18px] py-2 text-[13px] font-semibold ${active ? "bg-[#8F5A3C] text-white" : "bg-[#2A2A2A] text-on-surface"}`}
                    >
                      {t(`tourismTags.${tag}`, tag)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Country list */}
          <div className="px-4 md:px-6">
            <div className="my-4 flex items-center justify-between px-1 text-xs">
              <span className="text-on-surface">
                {compareMode
                  ? t(
                      "compare.tourismSelectionSubtitle",
                      "Select countries to compare tourism appeal side by side",
                    )
                  : t("countryList.clickHint", "Click on a country to view details")}
              </span>
              <span className="text-dim">
                {t("countryList.count", { count: displayedRanked.length })}
              </span>
            </div>

            <div className="flex flex-col">
              {loading ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-14 animate-pulse border-t border-[#333333] bg-[#1A1A1A]"
                    />
                  ))}
                </div>
              ) : displayedRanked.length === 0 ? (
                <p className="py-20 text-center text-sm text-dim">
                  {t("tourism.noResults", "No countries match your filters.")}
                </p>
              ) : (
                displayedRanked.map((r, i) => (
                  <TourismCountryCard
                    key={r.country.code}
                    ranked={r}
                    index={i}
                    highlighted={r.country.code === activeHighlight}
                    expanded={compareMode ? false : expandedCode === r.country.code}
                    onToggle={
                      compareMode
                        ? undefined
                        : () => {
                            setExpandedCode((c) => (c === r.country.code ? null : r.country.code));
                          }
                    }
                    compareMode={compareMode}
                    isSelected={selectedCodes.has(r.country.code)}
                    onSelect={() => {
                      toggleSelect(r.country.code);
                    }}
                    selectedTags={ws.toggles.requiredTags}
                    travelDates={ws.travelDates}
                  />
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}

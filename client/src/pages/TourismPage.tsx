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
import { Layout } from "../components/Layout";
import { TourismWeightPanel } from "../components/TourismWeightPanel";
import { TourismCountryCard } from "../components/TourismCountryCard";
import { Tooltip } from "../components/Tooltip";
import { MobileSheet } from "../shared/ui/MobileSheet";
import { useCountries } from "../hooks/useCountries";
import { useLangPrefix } from "../hooks/useLangPrefix";
import { useTourismWeightState } from "../hooks/useTourismWeightState";
import { ALL_TOURISM_TAGS } from "../hooks/useTourismWeightState";
import { useTourismScoring } from "../hooks/useTourismScoring";
import { localizeCountry } from "../utils/localize";
import { TOURISM_CATEGORY_KEYS } from "../utils/types";

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
    return () => clearTimeout(id);
  }, [matchingCodes, matchCursor, searchMode]);

  // Scroll to highlighted country
  useEffect(() => {
    if (!highlightedCode) return;
    const el = document.querySelector(`[data-country-code="${highlightedCode}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightedCode]);

  const goNext = useCallback(
    () => setMatchCursor((c) => (matchingCodes.length ? (c + 1) % matchingCodes.length : 0)),
    [matchingCodes.length],
  );
  const goPrev = useCallback(
    () =>
      setMatchCursor((c) =>
        matchingCodes.length ? (c - 1 + matchingCodes.length) % matchingCodes.length : 0,
      ),
    [matchingCodes.length],
  );

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
    navigate(`${langPrefix}/compare?m=tourism&c=${Array.from(selectedCodes).join(",")}`);
  }, [selectedCodes, navigate, langPrefix]);

  return (
    <Layout>
      <div className="flex">
        {/* Left sidebar - Tourism Weight Panel (hidden on mobile) */}
        <aside className="hidden md:block sticky top-14 self-start w-[340px] h-[calc(100vh-56px)]">
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
          onClose={() => setMobileParamsOpen(false)}
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
          className="md:hidden fixed z-40 flex items-center gap-2 shadow-lg h-12 pl-4 pr-[18px] rounded-[24px] bg-accent text-white text-sm font-semibold right-4"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)" }}
          onClick={() => setMobileParamsOpen(true)}
          aria-label={t("tourism.a11y.openParameters", "Open parameters")}
        >
          <SlidersHorizontal size={18} />
          {t("mobileSheet.parameters", "Parameters")}
        </button>

        {/* Right content area */}
        <main className="flex-1 min-w-0 pb-28 md:pb-0 bg-[#0A0A0F]">
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

              <div className="relative flex flex-col justify-end px-4 py-4 md:px-12 md:py-12 min-h-[160px]">
                <div className="flex items-center gap-2 mb-2 md:mb-3">
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-1 h-1 rounded-full bg-accent-dim shrink-0" />
                    <span className="text-[11px] font-medium tracking-[2.5px] uppercase text-accent-dim leading-none">
                      {t("tourism.eyebrow", "EXPLORE")}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-1 h-1 rounded-full bg-accent-dim shrink-0" />
                    <span className="text-[11px] font-medium tracking-[2.5px] uppercase text-accent-dim leading-none">
                      {t("nav.tourism", "TOURISM")}
                    </span>
                  </span>
                </div>

                {/* H1 */}
                <h1 className="text-3xl md:text-6xl font-semibold leading-[0.95] text-white mb-2 font-display">
                  {t("tourism.title", "TOURISM EXPLORER")}
                </h1>

                {/* Tagline */}
                <p className="hidden md:block text-[15px] text-dim max-w-[580px] mb-5">
                  {t("tourism.subtitle")}
                </p>

                {/* Copper rule */}
                <div className="hidden md:block w-32 h-0.5 bg-accent mb-4" />

                {/* Stats row */}
                <div className="hero-stats-row hero-banner-stats">
                  <div className="min-w-0">
                    <div className="font-mono text-[18px] font-semibold text-accent-dim leading-none">
                      {ranked.length}
                    </div>
                    <div className="text-[10px] text-dimmer uppercase tracking-[1px] mt-1">
                      {t("hero.stats.countries", {
                        count: ranked.length,
                      })}
                    </div>
                  </div>
                  <div className="hero-stat-divider" />
                  <div className="min-w-0">
                    <div className="font-mono text-[18px] font-semibold text-accent-dim leading-none">
                      {TOURISM_CATEGORY_KEYS.length}
                    </div>
                    <div className="text-[10px] text-dimmer uppercase tracking-[1px] mt-1">
                      {t("tourismWeights.metricsLabel", "Tourism Metrics")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sentinel for sticky detection */}
            <div ref={sentinelRef} className="h-px" />

            {/* Sticky search bar */}
            <div className="sticky z-20 bg-[#0A0A0F] pt-2 pb-3 top-14">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                <div className="flex flex-1 items-center gap-2 min-w-0">
                  <div className="flex flex-1 items-center bg-[#1A1A1C] border border-[#333333] rounded-[6px] h-10 px-3 gap-2">
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
                      className="flex-1 bg-transparent border-none outline-none text-sm text-[#E8E9EB]"
                    />
                    {search && (
                      <button
                        onClick={() => {
                          setSearch("");
                          setHighlightedCode(null);
                          setMatchCursor(0);
                        }}
                        className="bg-transparent border-0 cursor-pointer text-dimmer flex items-center"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Search mode controls */}
                  {search.trim() && (
                    <div className="flex items-center gap-1 shrink-0">
                      {searchMode === "highlight" && matchingCodes.length > 0 && (
                        <>
                          <span className="font-mono text-[11px] text-dim whitespace-nowrap">
                            {matchCursor + 1}/{matchingCodes.length}
                          </span>
                          <button
                            onClick={goPrev}
                            disabled={matchingCodes.length === 0}
                            className={`flex items-center justify-center w-6 h-6 rounded-[3px] border-0 bg-[#2A2A2A] ${matchingCodes.length ? "cursor-pointer text-muted" : "cursor-default text-dimmer"}`}
                            aria-label={t("tourism.a11y.previousMatch", "Previous match")}
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            onClick={goNext}
                            disabled={matchingCodes.length === 0}
                            className={`flex items-center justify-center w-6 h-6 rounded-[3px] border-0 bg-[#2A2A2A] ${matchingCodes.length ? "cursor-pointer text-muted" : "cursor-default text-dimmer"}`}
                            aria-label={t("tourism.a11y.nextMatch", "Next match")}
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
                          className="flex items-center justify-center w-6 h-6 rounded-[3px] border-0 bg-[#2A2A2A] cursor-pointer text-on-surface"
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
                  )}
                </div>

                <div className="flex w-full items-center justify-end gap-2 shrink-0 sm:w-auto">
                  {compareMode ? (
                    <>
                      <button
                        onClick={handleCompare}
                        className={`flex flex-1 items-center justify-center gap-1.5 sm:flex-none h-10 px-[14px] rounded-[6px] text-[13px] font-semibold whitespace-nowrap shrink-0 transition-all duration-150 ease-in-out ${selectedCodes.size < 2 ? "border border-accent-dim cursor-default bg-[#161616] text-accent-dim" : "border-0 cursor-pointer bg-accent text-white"}`}
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
                        className="flex items-center justify-center w-10 h-10 rounded-[6px] border border-[#2A2A2A] cursor-pointer bg-[#161616] text-dim shrink-0"
                        aria-label={t("tourism.a11y.exitCompareMode", "Exit compare mode")}
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setCompareMode(true)}
                      className="w-full justify-center sm:w-auto flex items-center gap-1.5 h-10 px-[14px] rounded-[6px] border border-[#2A2A2A] cursor-pointer bg-[#161616] text-on-surface text-[13px] font-medium whitespace-nowrap shrink-0"
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

            {/* Activity tag chips */}
            <div className="mb-0">
              <div className="text-[13px] font-bold tracking-[2px] uppercase text-on-surface mb-3">
                {t("tourismFilters.activityTags", "Activities")}
              </div>
              <div className="flex flex-wrap gap-2">
                {ALL_TOURISM_TAGS.map((tag) => {
                  const active = ws.toggles.requiredTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => ws.handleToggleTag(tag)}
                      className={`text-[13px] font-semibold py-2 px-[18px] rounded-[3px] border-0 cursor-pointer ${active ? "bg-[#8F5A3C] text-white" : "bg-[#2A2A2A] text-on-surface"}`}
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
            <div className="flex items-center justify-between px-1 my-4 text-xs">
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
                      className="h-14 animate-pulse bg-[#1A1A1A] border-t border-[#333333]"
                    />
                  ))}
                </div>
              ) : displayedRanked.length === 0 ? (
                <p className="text-center py-20 text-sm text-dim">
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
                        : () =>
                            setExpandedCode((c) => (c === r.country.code ? null : r.country.code))
                    }
                    compareMode={compareMode}
                    isSelected={selectedCodes.has(r.country.code)}
                    onSelect={() => toggleSelect(r.country.code)}
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

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout } from "@core/ui/layout";
import { ResponsiveSidePanelLayout } from "@core/ui/layout";
import { CompareModeActions, EmptyState, LoadingRows } from "@core/ui";
import { TourismCountryCard } from "@features/tourism/ui";
import { TourismWeightPanel } from "@features/tourism/ui";
import { useCountries } from "@core/hooks";
import { useLangPrefix } from "@core/hooks";
import { useTourismScoring } from "@features/tourism/hooks";
import { ALL_TOURISM_TAGS, useTourismWeightState } from "@features/tourism/hooks";
import { TOURISM_CATEGORY_KEYS } from "@core/models";
import type { SearchMode } from "./tourism.types";
import { findMatchingCodes, filterRanked, toggleSetItem } from "./tourism.utils";
import { TourismSearchControls } from "./TourismSearchControls";

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
  const [searchMode, setSearchMode] = useState<SearchMode>("filter");
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);
  const [matchCursor, setMatchCursor] = useState(0);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [mobileParamsOpen, setMobileParamsOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Search — matching codes for highlight mode
  const matchingCodes = useMemo(
    () => findMatchingCodes(ranked, search.trim().toLowerCase(), i18n.language, searchMode),
    [search, searchMode, ranked, i18n.language],
  );

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
    if (highlightedCode == null) return;
    const el = document.querySelector(`[data-country-code="${highlightedCode}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightedCode]);

  const goNext = useCallback(() => {
    setMatchCursor(matchingCodes.length > 0 ? (matchCursor + 1) % matchingCodes.length : 0);
  }, [matchingCodes.length, matchCursor]);
  const goPrev = useCallback(() => {
    setMatchCursor(
      matchingCodes.length > 0
        ? (matchCursor - 1 + matchingCodes.length) % matchingCodes.length
        : 0,
    );
  }, [matchingCodes.length, matchCursor]);

  // Filtered/displayed list
  const displayedRanked = useMemo(
    () => filterRanked(ranked, search, searchMode, i18n.language),
    [ranked, search, searchMode, i18n.language],
  );

  const activeHighlight = searchMode === "highlight" ? highlightedCode : undefined;

  const toggleSelect = useCallback((code: string) => {
    setSelectedCodes((prev) => toggleSetItem(prev, code));
  }, []);

  const exitCompareMode = useCallback(() => {
    setCompareMode(false);
    setSelectedCodes(new Set());
  }, []);

  const handleCompare = useCallback(() => {
    if (selectedCodes.size < 2) return;
    void navigate(`${langPrefix}/compare?m=tourism&c=${[...selectedCodes].join(",")}`);
  }, [selectedCodes, navigate, langPrefix]);

  let countryListContent: React.ReactNode;
  if (loading) {
    countryListContent = (
      <LoadingRows count={8} rowClassName="h-14 border-t border-[#333333] bg-[#1A1A1A]" />
    );
  } else if (displayedRanked.length === 0) {
    countryListContent = (
      <EmptyState message={t("tourism.noResults", "No countries match your filters.")} />
    );
  } else {
    countryListContent = displayedRanked.map((r, i) => (
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
                setExpandedCode(expandedCode === r.country.code ? null : r.country.code);
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
    ));
  }

  const sidebarContent = (
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
  );

  return (
    <Layout>
      <ResponsiveSidePanelLayout
        sidebar={sidebarContent}
        mobileSheet={{
          open: mobileParamsOpen,
          title: t("tourismWeights.title", "Tourism Weights"),
          closeLabel: t("tourism.a11y.closeParameters", "Close parameters"),
          onClose: () => {
            setMobileParamsOpen(false);
          },
          children: (
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
          ),
        }}
        mobileFab={{
          label: t("mobileSheet.parameters", "Parameters"),
          ariaLabel: t("tourism.a11y.openParameters", "Open parameters"),
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
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.85) 100%)",
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
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#757575"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
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
                  {search !== "" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setHighlightedCode(null);
                        setMatchCursor(0);
                      }}
                      className="flex cursor-pointer items-center border-0 bg-transparent text-dimmer"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  ) : null}
                </div>

                {/* Search mode controls */}
                {search.trim() !== "" ? (
                  <TourismSearchControls
                    searchMode={searchMode}
                    matchingCodes={matchingCodes}
                    matchCursor={matchCursor}
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
                exitLabel={t("tourism.a11y.exitCompareMode", "Exit compare mode")}
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
                    type="button"
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

          <div className="flex flex-col">{countryListContent}</div>
        </div>
      </ResponsiveSidePanelLayout>
    </Layout>
  );
}

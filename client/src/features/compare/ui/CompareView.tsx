import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Flag, Globe, ArrowDownWideNarrow, Plane, Wallet, Palmtree } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout } from "@core/ui/layout";
import { BudgetComparison } from "@features/compare/ui";
import { CountryComparison } from "@features/compare/ui";
import { NomadVisaComparison } from "@features/compare/ui";
import { RegionComparison } from "@features/compare/ui";
import { TourismComparison } from "@features/compare/ui";
import { PageHeroBanner } from "@core/ui/page-hero";
import { MobileSheet } from "@core/ui";
import { useCountries } from "@core/hooks";
import { useLangPrefix } from "@core/hooks";
import { useWeightState } from "@features/country-ranking/hooks";
import { useTourismWeightState } from "@features/tourism/hooks";
import { useBudgetMatcher } from "@features/budget/hooks";
import { useBudgetState } from "@features/budget/hooks";
import { normalizeCountryCodes } from "@features/compare/utils";
import { AI_CATEGORY_KEYS, DISPLAYED_CORE_CATEGORY_KEYS } from "@core/models";
import type { ClimatePreferences, CountryData, WeightMap } from "@core/models";
import type { BudgetMatch } from "@features/budget/hooks";
import {
  buildCompareShareParams,
  getRawCompareCountryCodes,
  parseCompareCountryCodes,
  parseCompareMode,
  setCompareCountryCodesParam,
  setCompareModeParam,
} from "@features/compare/utils";
import type { CompareMode } from "@features/compare/utils";
import { CompareParametersPanel } from "@features/compare/ui";

const SORTABLE_COMPARE_MODES = new Set<CompareMode>(["countries", "budget", "tourism"]);
const SHOW_WEIGHTS_MODES = new Set<CompareMode>(["budget", "tourism"]);

function delayedReset(setter: (v: false) => void, delayMs: number): void {
  setTimeout(() => {
    setter(false);
  }, delayMs);
}

function applyPanelHeight(el: HTMLDivElement | null): void {
  if (el == null) return;
  const top = el.getBoundingClientRect().top;
  el.style.height = `${window.innerHeight - Math.max(top, 16) - 16}px`;
}

function getActionGridClass(showSort: boolean): string {
  return showSort ? "grid-cols-3" : "grid-cols-2";
}

type SortDirection = "desc" | "asc" | null;

function getSortIconClass(direction: SortDirection): string {
  return direction === "asc" ? "rotate-180" : "rotate-0";
}

interface ComparePanelProps {
  readonly compareMode: CompareMode;
  readonly countries: CountryData[];
  readonly weights: WeightMap;
  readonly climatePrefs: ClimatePreferences;
  readonly budgetMatches: BudgetMatch[];
  readonly selectedCodes: string[];
  readonly onSelectedCodesChange: (codes: string[]) => void;
  readonly sortTrigger: number;
  readonly sortDirection: SortDirection;
  readonly onSelectionCount: (count: number) => void;
}

function ComparePanel({
  compareMode,
  countries,
  weights,
  climatePrefs,
  budgetMatches,
  selectedCodes,
  onSelectedCodesChange,
  sortTrigger,
  sortDirection,
  onSelectionCount,
}: ComparePanelProps): React.JSX.Element {
  switch (compareMode) {
    case "regions":
      return (
        <RegionComparison countries={countries} weights={weights} climatePrefs={climatePrefs} />
      );
    case "nomadVisas":
      return (
        <NomadVisaComparison
          countries={countries}
          weights={weights}
          climatePrefs={climatePrefs}
          budgetMatches={budgetMatches}
          selectedCodes={selectedCodes}
          onSelectedCodesChange={onSelectedCodesChange}
        />
      );
    case "budget":
      return (
        <BudgetComparison
          countries={countries}
          matches={budgetMatches}
          selectedCodes={selectedCodes}
          onSelectedCodesChange={onSelectedCodesChange}
          sortTrigger={sortTrigger}
          sortDirection={sortDirection}
        />
      );
    case "tourism":
      return (
        <TourismComparison
          countries={countries}
          selectedCodes={selectedCodes}
          onSelectedCodesChange={onSelectedCodesChange}
          sortTrigger={sortTrigger}
          sortDirection={sortDirection}
          onSelectionCount={onSelectionCount}
        />
      );
    case "countries":
      return (
        <CountryComparison
          countries={countries}
          weights={weights}
          climatePrefs={climatePrefs}
          selectedCodes={selectedCodes}
          onSelectedCodesChange={onSelectedCodesChange}
          sortTrigger={sortTrigger}
          sortDirection={sortDirection}
          onSelectionCount={onSelectionCount}
        />
      );
  }
}

export function ComparePage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const compareMode = parseCompareMode(searchParams);

  const [showWeights, setShowWeights] = useState(compareMode === "budget");
  const [sortTrigger, setSortTrigger] = useState(0);
  const [countrySelectionCount, setCountrySelectionCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [sortFeedbackActive, setSortFeedbackActive] = useState(false);
  const [mobileParamsOpen, setMobileParamsOpen] = useState(false);

  const ws = useWeightState();
  const tws = useTourismWeightState();
  const langPrefix = useLangPrefix();
  const { countries } = useCountries();
  const validCountryCodes = useMemo(
    () => new Set(countries.map((country) => country.code.toUpperCase())),
    [countries],
  );
  const rawSelectedCodes = useMemo(() => getRawCompareCountryCodes(searchParams), [searchParams]);
  const selectedCodes = useMemo(
    () => parseCompareCountryCodes(searchParams, validCountryCodes),
    [searchParams, validCountryCodes],
  );
  const bs = useBudgetState();
  const budgetMatches = useBudgetMatcher(
    countries,
    bs.budget,
    bs.housing,
    bs.bedrooms,
    bs.peopleCount,
    bs.categoryWeights,
    bs.qualityBlend,
  );
  const coreIndicatorCount = DISPLAYED_CORE_CATEGORY_KEYS.length;
  const aiIndicatorCount = AI_CATEGORY_KEYS.length;
  const nomadVisaCountryCount = countries.filter((country) => country.hasNomadVisa).length;
  const compareCoreIndicatorsLabel = t("compare.coreIndicatorsLabel", {
    count: coreIndicatorCount,
  });
  const compareAiIndicatorsLabel = t("compare.aiIndicatorsLabel", {
    count: aiIndicatorCount,
  });

  // Keep the weight panel sized to fit from its current position to the viewport bottom
  const panelRef = useRef<HTMLDivElement>(null);
  const syncPanelHeight = useCallback(() => {
    applyPanelHeight(panelRef.current);
  }, []);

  useEffect(() => {
    if (!showWeights) return;
    // wait one frame so the DOM has the panel mounted
    requestAnimationFrame(syncPanelHeight);
    window.addEventListener("scroll", syncPanelHeight, { passive: true });
    window.addEventListener("resize", syncPanelHeight, { passive: true });
    return () => {
      window.removeEventListener("scroll", syncPanelHeight);
      window.removeEventListener("resize", syncPanelHeight);
    };
  }, [showWeights, syncPanelHeight]);

  useEffect(() => {
    if (countries.length === 0) return;
    if (rawSelectedCodes.join(",") === selectedCodes.join(",")) return;
    const syncNext = new URLSearchParams(searchParams);
    setCompareCountryCodesParam(syncNext, selectedCodes);
    setSearchParams(syncNext, { replace: true });
  }, [countries.length, rawSelectedCodes, searchParams, selectedCodes, setSearchParams]);

  const setCompareMode = (mode: CompareMode) => {
    if (SHOW_WEIGHTS_MODES.has(mode)) {
      setShowWeights(true);
    }
    const modeNext = new URLSearchParams(searchParams);
    setCompareModeParam(modeNext, mode);
    setSearchParams(modeNext, { replace: true });
  };

  const handleSelectedCodesChange = (codes: string[]) => {
    const nextCodes = normalizeCountryCodes(codes, validCountryCodes);
    const codesNext = new URLSearchParams(searchParams);
    setCompareCountryCodesParam(codesNext, nextCodes);
    setSearchParams(codesNext, { replace: true });
  };

  const handleShare = () => {
    ws.handleShare(buildCompareShareParams(compareMode, selectedCodes));
    setCopied(true);
    delayedReset(setCopied, 3000);
  };

  const handleSortByScore = () => {
    setSortDirection(sortDirection === "desc" ? "asc" : "desc");
    setSortTrigger(sortTrigger + 1);
    setSortFeedbackActive(true);
    delayedReset(setSortFeedbackActive, 1000);
  };

  const sortableSelectionCount =
    compareMode === "budget" ? selectedCodes.length : countrySelectionCount;
  const showSortAction = SORTABLE_COMPARE_MODES.has(compareMode) && sortableSelectionCount > 1;
  const mobileViewportMaxWidth = 1024;
  const actionGridClassName = getActionGridClass(showSortAction);
  const sortButtonBaseLabels: Record<CompareMode, string> = {
    countries: t("compare.sortByScore"),
    regions: t("compare.sortByScore"),
    budget: t("compare.sortByBudget"),
    tourism: t("compare.sortByScore"),
    nomadVisas: t("compare.sortByScore"),
  };
  const sortButtonLabel = sortFeedbackActive
    ? t("compare.sorted")
    : sortButtonBaseLabels[compareMode];
  const sortButtonIconClassName = getSortIconClass(sortDirection);

  const compareTitles: Record<CompareMode, string> = {
    countries: t("compare.countryTitle"),
    regions: t("compare.regionTitle"),
    budget: t("compare.budgetTitle", "Budget Comparison"),
    tourism: t("compare.tourismTitle", "Tourism Comparison"),
    nomadVisas: t("compare.nomadVisaTitle"),
  };
  const compareTitle = compareTitles[compareMode];

  const compareSubtitles: Record<CompareMode, string> = {
    countries: t("compare.countrySubtitle", {
      coreIndicatorsLabel: compareCoreIndicatorsLabel,
      aiIndicatorsLabel: compareAiIndicatorsLabel,
    }),
    regions: t("compare.regionSubtitle"),
    budget: t(
      "compare.budgetSubtitle",
      "Compare monthly cost of living across countries side by side",
    ),
    tourism: t("compare.tourismSubtitle", "Compare tourism appeal across countries side by side"),
    nomadVisas: t("compare.nomadVisaSubtitle"),
  };
  const compareSubtitle = compareSubtitles[compareMode];

  return (
    <Layout>
      <div>
        <PageHeroBanner
          backgroundImage="/hero-map.png"
          eyebrow={t("compare.eyebrow")}
          title={compareTitle}
          subtitle={compareSubtitle}
        >
          <div className="hero-stats-row hero-banner-stats">
            <div className="min-w-0">
              <div className="font-mono text-[18px] leading-none font-semibold text-accent-dim">
                {countries.length}
              </div>
              <div className="mt-1 text-[10px] tracking-[1px] text-dimmer uppercase">
                {t("hero.stats.countries", { count: countries.length })}
              </div>
            </div>
            <div className="hero-stat-divider" />
            <Link to={`${langPrefix}/nomad-visas`} className="min-w-0 no-underline">
              <div>
                <div className="font-mono text-[18px] leading-none font-semibold text-accent-dim">
                  {nomadVisaCountryCount}
                </div>
                <div className="mt-1 text-[10px] tracking-[1px] text-dimmer uppercase">
                  {t("compare.nomadVisaCountries", {
                    count: nomadVisaCountryCount,
                  })}
                </div>
              </div>
            </Link>
            <div className="hero-stat-divider" />
            <Link to={`${langPrefix}/indicators`} className="min-w-0 no-underline">
              <div>
                <div className="font-mono text-[18px] leading-none font-semibold text-accent-dim">
                  {coreIndicatorCount}
                </div>
                <div className="mt-1 text-[10px] tracking-[1px] text-dimmer uppercase">
                  {t("hero.stats.indicators", { count: coreIndicatorCount })}
                </div>
              </div>
            </Link>
            <div className="hero-stat-divider" />
            <Link to={`${langPrefix}/ai-indicators`} className="min-w-0 no-underline">
              <div>
                <div className="font-mono text-[18px] leading-none font-semibold text-accent-dim">
                  {aiIndicatorCount}
                </div>
                <div className="mt-1 text-[10px] tracking-[1px] text-dimmer uppercase">
                  {t("hero.stats.aiIndicators", { count: aiIndicatorCount })}
                </div>
              </div>
            </Link>
          </div>
        </PageHeroBanner>

        <div className="mx-auto max-w-[1200px] px-4 pb-6">
          {/* Mode toggle + actions row */}
          <div className="mb-4 flex flex-col items-start gap-3 sm:sticky sm:top-14 sm:z-20 sm:-mx-4 md:mb-6 sm:flex-row sm:items-center md:gap-4 sm:border-b sm:border-[#1C1C1C] sm:bg-[#0F1114] sm:px-4 sm:py-2">
            {/* Compare mode toggle pills */}
            <div className="w-full rounded-md border border-[#252525] bg-[#1A1A1A] p-1 sm:w-auto">
              <div className="flex w-full gap-1">
                <button
                  onClick={() => {
                    setCompareMode("countries");
                  }}
                  className={`flex min-w-0 flex-1 basis-1/5 items-center justify-center gap-1.5 rounded px-3 py-2 text-xs transition-colors sm:px-4 sm:py-1.5 ${compareMode === "countries" ? "bg-accent font-medium text-white" : "bg-transparent font-normal text-dim"}`}
                >
                  <Flag size={14} className="shrink-0" />
                  {t("compare.countries")}
                </button>
                <button
                  onClick={() => {
                    setCompareMode("regions");
                  }}
                  className={`flex min-w-0 flex-1 basis-1/5 items-center justify-center gap-1.5 rounded px-3 py-2 text-xs transition-colors sm:px-4 sm:py-1.5 ${compareMode === "regions" ? "bg-accent font-medium text-white" : "bg-transparent font-normal text-dim"}`}
                >
                  <Globe size={16} className="shrink-0" />
                  {t("compare.regions")}
                </button>
                <button
                  onClick={() => {
                    setCompareMode("nomadVisas");
                  }}
                  className={`flex min-w-0 flex-1 basis-1/5 items-center justify-center gap-1.5 rounded px-3 py-2 text-center text-xs leading-tight transition-colors sm:px-4 sm:py-1.5 ${compareMode === "nomadVisas" ? "bg-accent font-medium text-white" : "bg-transparent font-normal text-dim"}`}
                >
                  <Plane size={14} className="shrink-0" />
                  {t("compare.nomadVisas")}
                </button>
                <button
                  onClick={() => {
                    setCompareMode("budget");
                  }}
                  className={`flex min-w-0 flex-1 basis-1/5 items-center justify-center gap-1.5 rounded px-3 py-2 text-xs transition-colors sm:px-4 sm:py-1.5 ${compareMode === "budget" ? "bg-accent font-medium text-white" : "bg-transparent font-normal text-dim"}`}
                >
                  <Wallet size={14} className="shrink-0" />
                  {t("compare.budget", "Budget")}
                </button>
                <button
                  onClick={() => {
                    setCompareMode("tourism");
                  }}
                  className={`flex min-w-0 flex-1 basis-1/5 items-center justify-center gap-1.5 rounded px-3 py-2 text-xs transition-colors sm:px-4 sm:py-1.5 ${compareMode === "tourism" ? "bg-accent font-medium text-white" : "bg-transparent font-normal text-dim"}`}
                >
                  <Palmtree size={14} className="shrink-0" />
                  {t("compare.tourism", "Tourism")}
                </button>
              </div>
            </div>

            {/* Parameters + Sort + Share controls */}
            <div className="w-full sm:w-auto">
              <div className="w-full rounded-md border border-[#252525] bg-[#1A1A1A] p-1 sm:w-auto">
                <div className={`grid gap-1 sm:flex sm:w-auto ${actionGridClassName}`}>
                  <button
                    onClick={() => {
                      if (window.innerWidth <= mobileViewportMaxWidth) {
                        setMobileParamsOpen(true);
                      } else {
                        setShowWeights((p) => !p);
                      }
                    }}
                    className={`flex min-w-0 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded px-3 py-2 text-center text-xs transition-colors sm:flex-initial sm:px-4 sm:py-1.5 ${showWeights && window.innerWidth > mobileViewportMaxWidth ? "bg-accent font-medium text-white" : "bg-transparent font-normal text-dim"}`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                      />
                    </svg>
                    {t("compare.parameters")}
                  </button>

                  {showSortAction ? (
                    <button
                      onClick={handleSortByScore}
                      className={`flex min-w-0 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded px-3 py-2 text-center text-xs leading-tight transition-all duration-150 ease-in-out sm:flex-initial sm:px-4 sm:py-1.5 ${sortFeedbackActive ? "bg-[#2A4A2A] font-medium text-[#88CC88]" : "bg-transparent font-normal text-dim"}`}
                    >
                      <ArrowDownWideNarrow
                        size={16}
                        className={`transition-transform ${sortButtonIconClassName}`}
                      />
                      {sortButtonLabel}
                    </button>
                  ) : null}

                  <button
                    onClick={handleShare}
                    className={`flex min-w-0 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded px-3 py-2 text-center text-xs transition-all duration-150 ease-in-out sm:flex-initial sm:px-4 sm:py-1.5 ${copied ? "bg-[#2A4A2A] font-medium text-[#88CC88]" : "bg-transparent font-normal text-dim"}`}
                  >
                    {copied ? (
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                    )}
                    {copied ? t("weights.linkCopied") : t("compare.share")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <MobileSheet
            open={mobileParamsOpen}
            title={t("compare.parameters")}
            closeLabel={t("a11y.closeParameters", "Close parameters")}
            onClose={() => {
              setMobileParamsOpen(false);
            }}
          >
            <div className="flex-1 overflow-y-auto">
              <CompareParametersPanel
                compareMode={compareMode}
                rankingState={ws}
                tourismState={tws}
                budgetState={bs}
                onShare={handleShare}
                mobile
              />
            </div>
          </MobileSheet>

          <div
            className={`grid gap-4 md:gap-6 ${
              showWeights ? "grid-cols-1 lg:grid-cols-[340px_1fr]" : "grid-cols-1"
            }`}
          >
            {showWeights ? (
              <div
                ref={panelRef}
                className={`sticky top-4 hidden rounded-lg md:block ${compareMode === "budget" || compareMode === "nomadVisas" ? "overflow-auto" : "overflow-hidden"}`}
              >
                <CompareParametersPanel
                  compareMode={compareMode}
                  rankingState={ws}
                  tourismState={tws}
                  budgetState={bs}
                  onShare={handleShare}
                />
              </div>
            ) : null}
            <div className="min-w-0">
              <ComparePanel
                compareMode={compareMode}
                countries={countries}
                weights={ws.weights}
                climatePrefs={ws.climatePrefs}
                budgetMatches={budgetMatches}
                selectedCodes={selectedCodes}
                onSelectedCodesChange={handleSelectedCodesChange}
                sortTrigger={sortTrigger}
                sortDirection={sortDirection}
                onSelectionCount={setCountrySelectionCount}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

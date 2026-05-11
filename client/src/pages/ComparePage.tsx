import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Flag, Globe, ArrowDownWideNarrow, Plane, Wallet, Palmtree } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout } from "../components/Layout";
import { CountryComparison } from "../components/CountryComparison";
import { RegionComparison } from "../components/RegionComparison";
import { NomadVisaComparison } from "../components/NomadVisaComparison";
import { BudgetComparison } from "../components/BudgetComparison";
import { TourismComparison } from "../components/TourismComparison";
import { PageHeroBanner } from "../components/PageHeroBanner";
import { MobileSheet } from "../shared/ui/MobileSheet";
import { useCountries } from "../hooks/useCountries";
import { useLangPrefix } from "../hooks/useLangPrefix";
import { useWeightState } from "../hooks/useWeightState";
import { useTourismWeightState } from "../hooks/useTourismWeightState";
import { useBudgetState } from "../hooks/useBudgetState";
import { useBudgetMatcher } from "../hooks/useBudgetMatcher";
import { normalizeCountryCodes } from "../utils/countryCodeSelection";
import { AI_CATEGORY_KEYS, DISPLAYED_CORE_CATEGORY_KEYS } from "../utils/types";
import {
  buildCompareShareParams,
  getRawCompareCountryCodes,
  parseCompareCountryCodes,
  parseCompareMode,
  setCompareCountryCodesParam,
  setCompareModeParam,
} from "../features/compare/model/compareUrlState";
import type { CompareMode } from "../features/compare/model/compareUrlState";
import { CompareParametersPanel } from "../features/compare/ui/CompareParametersPanel";

export function ComparePage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortDirection, setSortDirection] = useState<"desc" | "asc" | null>(null);
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
    const el = panelRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    el.style.height = `${window.innerHeight - Math.max(top, 16) - 16}px`;
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
    if (!countries.length) return;
    if (rawSelectedCodes.join(",") === selectedCodes.join(",")) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        setCompareCountryCodesParam(next, selectedCodes);
        return next;
      },
      { replace: true },
    );
  }, [countries.length, rawSelectedCodes, selectedCodes, setSearchParams]);

  const setCompareMode = (mode: CompareMode) => {
    if (mode === "budget") {
      setShowWeights(true);
    }
    if (mode === "tourism") {
      setShowWeights(true);
    }
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        setCompareModeParam(next, mode);
        return next;
      },
      { replace: true },
    );
  };

  const handleSelectedCodesChange = (codes: string[]) => {
    const nextCodes = normalizeCountryCodes(codes, validCountryCodes);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        setCompareCountryCodesParam(next, nextCodes);
        return next;
      },
      { replace: true },
    );
  };

  const handleShare = () => {
    ws.handleShare(buildCompareShareParams(compareMode, selectedCodes));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSortByScore = () => {
    setSortDirection((previous) => (previous === "desc" ? "asc" : "desc"));
    setSortTrigger((previous) => previous + 1);
    setSortFeedbackActive(true);
    setTimeout(() => setSortFeedbackActive(false), 1000);
  };

  const showParametersAction = true;
  const showSortAction =
    (compareMode === "countries" && countrySelectionCount > 1) ||
    (compareMode === "budget" && selectedCodes.length > 1) ||
    (compareMode === "tourism" && countrySelectionCount > 1);
  const mobileViewportMaxWidth = 1024;
  const actionGridClassName =
    showParametersAction && showSortAction
      ? "grid-cols-3"
      : showParametersAction || showSortAction
        ? "grid-cols-2"
        : "grid-cols-1";
  const sortButtonLabel = sortFeedbackActive
    ? t("compare.sorted")
    : compareMode === "budget"
      ? t("compare.sortByBudget")
      : t("compare.sortByScore");
  const sortButtonIconClassName = sortDirection === "asc" ? "rotate-180" : "rotate-0";

  return (
    <Layout>
      <div>
        <PageHeroBanner
          backgroundImage="/hero-map.png"
          eyebrow={t("compare.eyebrow")}
          title={
            compareMode === "countries"
              ? t("compare.countryTitle")
              : compareMode === "regions"
                ? t("compare.regionTitle")
                : compareMode === "budget"
                  ? t("compare.budgetTitle", "Budget Comparison")
                  : compareMode === "tourism"
                    ? t("compare.tourismTitle", "Tourism Comparison")
                    : t("compare.nomadVisaTitle")
          }
          subtitle={
            compareMode === "countries"
              ? t("compare.countrySubtitle", {
                  coreIndicatorsLabel: compareCoreIndicatorsLabel,
                  aiIndicatorsLabel: compareAiIndicatorsLabel,
                })
              : compareMode === "regions"
                ? t("compare.regionSubtitle")
                : compareMode === "budget"
                  ? t(
                      "compare.budgetSubtitle",
                      "Compare monthly cost of living across countries side by side",
                    )
                  : compareMode === "tourism"
                    ? t(
                        "compare.tourismSubtitle",
                        "Compare tourism appeal across countries side by side",
                      )
                    : t("compare.nomadVisaSubtitle")
          }
        >
          <div className="hero-stats-row hero-banner-stats">
            <div className="min-w-0">
              <div className="font-mono text-[18px] font-semibold text-accent-dim leading-none">
                {countries.length}
              </div>
              <div className="text-[10px] text-dimmer uppercase tracking-[1px] mt-1">
                {t("hero.stats.countries", { count: countries.length })}
              </div>
            </div>
            <div className="hero-stat-divider" />
            <Link to={`${langPrefix}/nomad-visas`} className="min-w-0 no-underline">
              <div>
                <div className="font-mono text-[18px] font-semibold text-accent-dim leading-none">
                  {nomadVisaCountryCount}
                </div>
                <div className="text-[10px] text-dimmer uppercase tracking-[1px] mt-1">
                  {t("compare.nomadVisaCountries", {
                    count: nomadVisaCountryCount,
                  })}
                </div>
              </div>
            </Link>
            <div className="hero-stat-divider" />
            <Link to={`${langPrefix}/indicators`} className="min-w-0 no-underline">
              <div>
                <div className="font-mono text-[18px] font-semibold text-accent-dim leading-none">
                  {coreIndicatorCount}
                </div>
                <div className="text-[10px] text-dimmer uppercase tracking-[1px] mt-1">
                  {t("hero.stats.indicators", { count: coreIndicatorCount })}
                </div>
              </div>
            </Link>
            <div className="hero-stat-divider" />
            <Link to={`${langPrefix}/ai-indicators`} className="min-w-0 no-underline">
              <div>
                <div className="font-mono text-[18px] font-semibold text-accent-dim leading-none">
                  {aiIndicatorCount}
                </div>
                <div className="text-[10px] text-dimmer uppercase tracking-[1px] mt-1">
                  {t("hero.stats.aiIndicators", { count: aiIndicatorCount })}
                </div>
              </div>
            </Link>
          </div>
        </PageHeroBanner>

        <div className="max-w-[1200px] mx-auto px-4 pb-6">
          {/* Mode toggle + actions row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 mb-4 md:mb-6 sm:sticky sm:top-14 sm:z-20 sm:bg-[#0F1114] sm:-mx-4 sm:px-4 sm:py-2 sm:border-b sm:border-[#1C1C1C]">
            {/* Compare mode toggle pills */}
            <div className="w-full rounded-md p-1 sm:w-auto bg-[#1A1A1A] border border-[#252525]">
              <div className="flex w-full gap-1">
                <button
                  onClick={() => setCompareMode("countries")}
                  className={`flex min-w-0 flex-1 basis-1/5 items-center justify-center gap-1.5 rounded px-3 py-2 transition-colors sm:px-4 sm:py-1.5 text-xs ${compareMode === "countries" ? "bg-accent text-white font-medium" : "bg-transparent text-dim font-normal"}`}
                >
                  <Flag size={14} className="shrink-0" />
                  {t("compare.countries")}
                </button>
                <button
                  onClick={() => setCompareMode("regions")}
                  className={`flex min-w-0 flex-1 basis-1/5 items-center justify-center gap-1.5 rounded px-3 py-2 transition-colors sm:px-4 sm:py-1.5 text-xs ${compareMode === "regions" ? "bg-accent text-white font-medium" : "bg-transparent text-dim font-normal"}`}
                >
                  <Globe size={16} className="shrink-0" />
                  {t("compare.regions")}
                </button>
                <button
                  onClick={() => setCompareMode("nomadVisas")}
                  className={`flex min-w-0 flex-1 basis-1/5 items-center justify-center gap-1.5 rounded px-3 py-2 transition-colors sm:px-4 sm:py-1.5 text-xs text-center leading-tight ${compareMode === "nomadVisas" ? "bg-accent text-white font-medium" : "bg-transparent text-dim font-normal"}`}
                >
                  <Plane size={14} className="shrink-0" />
                  {t("compare.nomadVisas")}
                </button>
                <button
                  onClick={() => setCompareMode("budget")}
                  className={`flex min-w-0 flex-1 basis-1/5 items-center justify-center gap-1.5 rounded px-3 py-2 transition-colors sm:px-4 sm:py-1.5 text-xs ${compareMode === "budget" ? "bg-accent text-white font-medium" : "bg-transparent text-dim font-normal"}`}
                >
                  <Wallet size={14} className="shrink-0" />
                  {t("compare.budget", "Budget")}
                </button>
                <button
                  onClick={() => setCompareMode("tourism")}
                  className={`flex min-w-0 flex-1 basis-1/5 items-center justify-center gap-1.5 rounded px-3 py-2 transition-colors sm:px-4 sm:py-1.5 text-xs ${compareMode === "tourism" ? "bg-accent text-white font-medium" : "bg-transparent text-dim font-normal"}`}
                >
                  <Palmtree size={14} className="shrink-0" />
                  {t("compare.tourism", "Tourism")}
                </button>
              </div>
            </div>

            {/* Parameters + Sort + Share controls */}
            <div className="w-full sm:w-auto">
              <div className="w-full rounded-md p-1 sm:w-auto bg-[#1A1A1A] border border-[#252525]">
                <div className={`grid gap-1 sm:flex sm:w-auto ${actionGridClassName}`}>
                  {showParametersAction && (
                    <button
                      onClick={() => {
                        if (window.innerWidth <= mobileViewportMaxWidth) {
                          setMobileParamsOpen(true);
                        } else {
                          setShowWeights((p) => !p);
                        }
                      }}
                      className={`flex min-w-0 items-center justify-center gap-1.5 rounded px-3 py-2 text-center transition-colors sm:flex-initial sm:px-4 sm:py-1.5 cursor-pointer text-xs shrink-0 ${showWeights && window.innerWidth > mobileViewportMaxWidth ? "bg-accent text-white font-medium" : "bg-transparent text-dim font-normal"}`}
                    >
                      <svg
                        className="w-4 h-4"
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
                  )}

                  {showSortAction && (
                    <button
                      onClick={handleSortByScore}
                      className={`flex min-w-0 items-center justify-center gap-1.5 rounded px-3 py-2 text-center transition-all duration-150 ease-in-out sm:flex-initial sm:px-4 sm:py-1.5 cursor-pointer text-xs shrink-0 leading-tight ${sortFeedbackActive ? "bg-[#2A4A2A] text-[#88CC88] font-medium" : "bg-transparent text-dim font-normal"}`}
                    >
                      <ArrowDownWideNarrow
                        size={16}
                        className={`transition-transform ${sortButtonIconClassName}`}
                      />
                      {sortButtonLabel}
                    </button>
                  )}

                  <button
                    onClick={handleShare}
                    className={`flex min-w-0 items-center justify-center gap-1.5 rounded px-3 py-2 text-center transition-all duration-150 ease-in-out sm:flex-initial sm:px-4 sm:py-1.5 cursor-pointer text-xs shrink-0 ${copied ? "bg-[#2A4A2A] text-[#88CC88] font-medium" : "bg-transparent text-dim font-normal"}`}
                  >
                    {copied ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
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
            onClose={() => setMobileParamsOpen(false)}
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
            {showWeights && (
              <div
                ref={panelRef}
                className={`hidden md:block sticky top-4 rounded-lg ${compareMode === "budget" || compareMode === "nomadVisas" ? "overflow-auto" : "overflow-hidden"}`}
              >
                <CompareParametersPanel
                  compareMode={compareMode}
                  rankingState={ws}
                  tourismState={tws}
                  budgetState={bs}
                  onShare={handleShare}
                />
              </div>
            )}
            <div className="min-w-0">
              {compareMode === "regions" ? (
                <RegionComparison
                  countries={countries}
                  weights={ws.weights}
                  climatePrefs={ws.climatePrefs}
                />
              ) : compareMode === "nomadVisas" ? (
                <NomadVisaComparison
                  countries={countries}
                  weights={ws.weights}
                  climatePrefs={ws.climatePrefs}
                  budgetMatches={budgetMatches}
                  selectedCodes={selectedCodes}
                  onSelectedCodesChange={handleSelectedCodesChange}
                />
              ) : compareMode === "budget" ? (
                <BudgetComparison
                  countries={countries}
                  matches={budgetMatches}
                  selectedCodes={selectedCodes}
                  onSelectedCodesChange={handleSelectedCodesChange}
                  sortTrigger={sortTrigger}
                  sortDirection={sortDirection}
                />
              ) : compareMode === "tourism" ? (
                <TourismComparison
                  countries={countries}
                  selectedCodes={selectedCodes}
                  onSelectedCodesChange={handleSelectedCodesChange}
                  sortTrigger={sortTrigger}
                  sortDirection={sortDirection}
                  onSelectionCount={setCountrySelectionCount}
                />
              ) : (
                <CountryComparison
                  countries={countries}
                  weights={ws.weights}
                  climatePrefs={ws.climatePrefs}
                  selectedCodes={selectedCodes}
                  onSelectedCodesChange={handleSelectedCodesChange}
                  sortTrigger={sortTrigger}
                  sortDirection={sortDirection}
                  onSelectionCount={setCountrySelectionCount}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

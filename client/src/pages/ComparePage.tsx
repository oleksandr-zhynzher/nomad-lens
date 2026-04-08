import { useCallback, useEffect, useRef, useState } from "react";
import {
  Flag,
  Globe,
  ArrowDownWideNarrow,
  Plane,
  Wallet,
  X,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout } from "../components/Layout";
import { WeightPanel } from "../components/WeightPanel";
import { CountryComparison } from "../components/CountryComparison";
import { RegionComparison } from "../components/RegionComparison";
import { NomadVisaComparison } from "../components/NomadVisaComparison";
import { BudgetComparison } from "../components/BudgetComparison";
import { BudgetFilterPanel } from "../components/BudgetFilterPanel";
import { PageHeroBanner } from "../components/PageHeroBanner";
import { useCountries } from "../hooks/useCountries";
import { useLangPrefix } from "../hooks/useLangPrefix";
import { useWeightState } from "../hooks/useWeightState";
import { useBudgetState } from "../hooks/useBudgetState";
import { useBudgetMatcher } from "../hooks/useBudgetMatcher";
import { AI_CATEGORY_KEYS, DISPLAYED_CORE_CATEGORY_KEYS } from "../utils/types";

export function ComparePage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const compareMode: "countries" | "regions" | "nomadVisas" | "budget" =
    searchParams.get("m") === "regions"
      ? "regions"
      : searchParams.get("m") === "nomadVisas"
        ? "nomadVisas"
        : searchParams.get("m") === "budget"
          ? "budget"
          : "countries";
  const selectedCodes = searchParams.get("c")?.split(",").filter(Boolean) ?? [];

  const [showWeights, setShowWeights] = useState(compareMode === "budget");
  const [sortTrigger, setSortTrigger] = useState(0);
  const [countrySelectionCount, setCountrySelectionCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [sorted, setSorted] = useState(false);
  const [mobileParamsOpen, setMobileParamsOpen] = useState(false);

  const ws = useWeightState();
  const langPrefix = useLangPrefix();
  const { countries } = useCountries();
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
    if (!mobileParamsOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileParamsOpen]);

  const setCompareMode = (
    mode: "countries" | "regions" | "nomadVisas" | "budget",
  ) => {
    if (mode === "budget") {
      setShowWeights(true);
    }
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (mode === "countries") next.delete("m");
        else next.set("m", mode);
        return next;
      },
      { replace: true },
    );
  };

  const handleSelectedCodesChange = (codes: string[]) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (codes.length === 0) next.delete("c");
        else next.set("c", codes.join(","));
        return next;
      },
      { replace: true },
    );
  };

  const handleShare = () => {
    const extra = new URLSearchParams();
    if (selectedCodes.length > 0) extra.set("c", selectedCodes.join(","));
    if (compareMode !== "countries") extra.set("m", compareMode);
    ws.handleShare(extra);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSortByScore = () => {
    setSortTrigger((previous) => previous + 1);
    setSorted(true);
    setTimeout(() => setSorted(false), 3000);
  };

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
                  : t("compare.nomadVisaTitle")
          }
          subtitle={
            compareMode === "countries"
              ? t("compare.countrySubtitle", {
                  coreCount: coreIndicatorCount,
                  aiCount: aiIndicatorCount,
                })
              : compareMode === "regions"
                ? t("compare.regionSubtitle")
                : compareMode === "budget"
                  ? t(
                      "compare.budgetSubtitle",
                      "Compare monthly cost of living across countries side by side",
                    )
                  : t("compare.nomadVisaSubtitle")
          }
        >
          <div className="grid grid-cols-2 gap-x-5 gap-y-3 md:flex md:items-center md:gap-6">
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
                {t("hero.countries")}
              </div>
            </div>
            <div
              className="hidden md:block w-px h-6 md:h-8"
              style={{ backgroundColor: "#333333" }}
            />
            <Link
              to={`${langPrefix}/nomad-visas`}
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
                  {countries.filter((c) => c.hasNomadVisa).length}
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
                  {t("compare.nomadVisas")}
                </div>
              </div>
            </Link>
            <div
              className="hidden md:block w-px h-6 md:h-8"
              style={{ backgroundColor: "#333333" }}
            />
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
                  {coreIndicatorCount}
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
                  {t("hero.indicators")}
                </div>
              </div>
            </Link>
            <div
              className="hidden md:block w-px h-6 md:h-8"
              style={{ backgroundColor: "#333333" }}
            />
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
                  {aiIndicatorCount}
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
                  {t("hero.aiIndicators")}
                </div>
              </div>
            </Link>
          </div>
        </PageHeroBanner>

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "16px 16px 24px",
          }}
        >
          {/* Mode toggle + actions row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 mb-4 md:mb-6">
            {/* Compare mode toggle pills */}
            <div
              className="w-full rounded-md p-1 sm:w-auto"
              style={{
                backgroundColor: "#1A1A1A",
                border: "1px solid #252525",
              }}
            >
              <div className="grid grid-cols-2 gap-1 sm:flex sm:w-auto">
                <button
                  onClick={() => setCompareMode("countries")}
                  className="flex min-w-0 items-center justify-center gap-1.5 rounded px-3 py-2 transition-colors sm:flex-initial sm:px-4 sm:py-1.5"
                  style={{
                    backgroundColor:
                      compareMode === "countries"
                        ? "var(--color-accent)"
                        : "transparent",
                    color: compareMode === "countries" ? "#FFFFFF" : "#8A8A8A",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "12px",
                    fontWeight: compareMode === "countries" ? 500 : 400,
                  }}
                >
                  <Flag size={14} />
                  {t("compare.countries")}
                </button>
                <button
                  onClick={() => setCompareMode("regions")}
                  className="flex min-w-0 items-center justify-center gap-1.5 rounded px-3 py-2 transition-colors sm:flex-initial sm:px-4 sm:py-1.5"
                  style={{
                    backgroundColor:
                      compareMode === "regions"
                        ? "var(--color-accent)"
                        : "transparent",
                    color: compareMode === "regions" ? "#FFFFFF" : "#8A8A8A",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "12px",
                    fontWeight: compareMode === "regions" ? 500 : 400,
                  }}
                >
                  <Globe size={14} />
                  {t("compare.regions")}
                </button>
                <button
                  onClick={() => setCompareMode("nomadVisas")}
                  className="flex min-w-0 items-center justify-center gap-1.5 rounded px-3 py-2 transition-colors sm:flex-initial sm:px-4 sm:py-1.5"
                  style={{
                    backgroundColor:
                      compareMode === "nomadVisas"
                        ? "var(--color-accent)"
                        : "transparent",
                    color: compareMode === "nomadVisas" ? "#FFFFFF" : "#8A8A8A",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "12px",
                    fontWeight: compareMode === "nomadVisas" ? 500 : 400,
                    lineHeight: 1.2,
                    textAlign: "center",
                  }}
                >
                  <Plane size={14} />
                  {t("compare.nomadVisas")}
                </button>
                <button
                  onClick={() => setCompareMode("budget")}
                  className="flex min-w-0 items-center justify-center gap-1.5 rounded px-3 py-2 transition-colors sm:flex-initial sm:px-4 sm:py-1.5"
                  style={{
                    backgroundColor:
                      compareMode === "budget"
                        ? "var(--color-accent)"
                        : "transparent",
                    color: compareMode === "budget" ? "#FFFFFF" : "#8A8A8A",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "12px",
                    fontWeight: compareMode === "budget" ? 500 : 400,
                  }}
                >
                  <Wallet size={14} />
                  {t("compare.budget", "Budget")}
                </button>
              </div>
            </div>

            {/* Parameters + Sort + Share controls */}
            <div className="flex w-full flex-wrap gap-2 sm:w-auto">
              {compareMode !== "nomadVisas" && (
                <button
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      setMobileParamsOpen(true);
                    } else {
                      setShowWeights((p) => !p);
                    }
                  }}
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
                    backgroundColor:
                      showWeights && window.innerWidth >= 768
                        ? "var(--color-accent)"
                        : "transparent",
                    color:
                      showWeights && window.innerWidth >= 768
                        ? "#FFFFFF"
                        : "#8A8A8A",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "13px",
                    fontWeight:
                      showWeights && window.innerWidth >= 768 ? 500 : 400,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
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

              {((compareMode === "countries" && countrySelectionCount > 1) ||
                (compareMode === "budget" && selectedCodes.length > 1)) && (
                <button
                  onClick={handleSortByScore}
                  className="w-full justify-center sm:w-auto"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    height: "40px",
                    paddingLeft: "14px",
                    paddingRight: "14px",
                    borderRadius: "6px",
                    border: sorted
                      ? "1px solid rgba(136,204,136,0.35)"
                      : "1px solid #2A2A2A",
                    cursor: "pointer",
                    backgroundColor: sorted ? "#2A4A2A" : "transparent",
                    color: sorted ? "#88CC88" : "#8A8A8A",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "13px",
                    fontWeight: sorted ? 500 : 400,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    transition: "all 0.15s ease",
                  }}
                >
                  {sorted ? (
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
                    <ArrowDownWideNarrow size={16} />
                  )}
                  {sorted
                    ? t("compare.sorted")
                    : compareMode === "budget"
                      ? t("compare.sortByBudget")
                      : t("compare.sortByScore")}
                </button>
              )}

              <button
                onClick={handleShare}
                className="w-full justify-center sm:w-auto"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  height: "40px",
                  paddingLeft: "14px",
                  paddingRight: "14px",
                  borderRadius: "6px",
                  border: copied
                    ? "1px solid rgba(136,204,136,0.35)"
                    : "1px solid #2A2A2A",
                  cursor: "pointer",
                  backgroundColor: copied ? "#2A4A2A" : "transparent",
                  color: copied ? "#88CC88" : "#8A8A8A",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  fontWeight: copied ? 500 : 400,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: "all 0.15s ease",
                }}
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

          {mobileParamsOpen && compareMode !== "nomadVisas" && (
            <div
              className="md:hidden fixed inset-0 z-50 flex"
              role="dialog"
              aria-modal="true"
              aria-label={t("compare.parameters")}
              onClick={() => setMobileParamsOpen(false)}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: "rgba(0,0,0,0.72)",
                  backdropFilter: "blur(6px)",
                }}
              />
              <div
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
                    {t("compare.parameters")}
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
                      border: "none",
                      cursor: "pointer",
                    }}
                    aria-label="Close parameters"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {compareMode === "budget" ? (
                    <BudgetFilterPanel bs={bs} />
                  ) : (
                    <WeightPanel
                      weights={ws.weights}
                      onChange={ws.handleWeightChange}
                      onReset={ws.handleReset}
                      weightsAreDefault={ws.weightsAreDefault}
                      onShare={handleShare}
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
                  )}
                </div>
              </div>
            </div>
          )}

          <div
            className={`grid gap-4 md:gap-6 ${
              showWeights
                ? "grid-cols-1 lg:grid-cols-[340px_1fr]"
                : "grid-cols-1"
            }`}
          >
            {showWeights && (
              <div
                ref={panelRef}
                className="hidden md:block"
                style={{
                  position: "sticky",
                  top: "16px",
                  overflow: compareMode === "budget" ? "auto" : "hidden",
                  borderRadius: "8px",
                }}
              >
                {compareMode === "budget" ? (
                  <BudgetFilterPanel bs={bs} />
                ) : (
                  <WeightPanel
                    weights={ws.weights}
                    onChange={ws.handleWeightChange}
                    onReset={ws.handleReset}
                    weightsAreDefault={ws.weightsAreDefault}
                    onShare={handleShare}
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
                )}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              {compareMode === "regions" ? (
                <RegionComparison
                  countries={countries}
                  weights={ws.weights}
                  climatePrefs={ws.climatePrefs}
                />
              ) : compareMode === "nomadVisas" ? (
                <NomadVisaComparison
                  countries={countries}
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
                />
              ) : (
                <CountryComparison
                  countries={countries}
                  weights={ws.weights}
                  climatePrefs={ws.climatePrefs}
                  selectedCodes={selectedCodes}
                  onSelectedCodesChange={handleSelectedCodesChange}
                  sortTrigger={sortTrigger}
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

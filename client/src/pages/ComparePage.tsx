import { useCallback, useEffect, useRef, useState } from "react";
import { Flag, Globe, ArrowDownWideNarrow, Plane } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout } from "../components/Layout";
import { WeightPanel } from "../components/WeightPanel";
import { CountryComparison } from "../components/CountryComparison";
import { RegionComparison } from "../components/RegionComparison";
import { NomadVisaComparison } from "../components/NomadVisaComparison";
import { useCountries } from "../hooks/useCountries";
import { useWeightState } from "../hooks/useWeightState";

export function ComparePage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showWeights, setShowWeights] = useState(false);
  const [sortTrigger, setSortTrigger] = useState(0);
  const [countrySelectionCount, setCountrySelectionCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const ws = useWeightState();
  const { countries } = useCountries();

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

  // URL-driven compare state — persisted so links are shareable
  const compareMode: "countries" | "regions" | "nomadVisas" =
    searchParams.get("m") === "regions"
      ? "regions"
      : searchParams.get("m") === "nomadVisas"
        ? "nomadVisas"
        : "countries";
  const selectedCodes = searchParams.get("c")?.split(",").filter(Boolean) ?? [];

  const setCompareMode = (mode: "countries" | "regions" | "nomadVisas") => {
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

  return (
    <Layout>
      <div>
        {/* Hero band */}
        <div
          className="relative overflow-hidden"
          style={{ backgroundColor: "#141416" }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, #0D0D0FCC 0%, transparent 60%)",
            }}
          />
          <div
            className="relative h-full max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 flex flex-col justify-center"
            style={{ minHeight: "80px" }}
          >
            <span
              style={{
                fontFamily: "Geist, sans-serif",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                color: "var(--color-accent)",
                marginBottom: "6px",
              }}
            >
              {t("compare.eyebrow")}
            </span>
            <h2
              className="text-2xl md:text-4xl"
              style={{
                fontFamily: "Anton, sans-serif",
                fontWeight: 400,
                lineHeight: 1,
                color: "#E8E9EB",
                margin: 0,
              }}
            >
              {compareMode === "countries"
                ? t("compare.countryTitle")
                : compareMode === "regions"
                  ? t("compare.regionTitle")
                  : t("compare.nomadVisaTitle")}
            </h2>
            <p
              className="hidden md:block"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                color: "#666666",
                marginTop: "8px",
              }}
            >
              {compareMode === "countries"
                ? t("compare.countrySubtitle")
                : compareMode === "regions"
                  ? t("compare.regionSubtitle")
                  : t("compare.nomadVisaSubtitle")}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          {/* Mode toggle + Parameters row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 mb-4 md:mb-6">
            {/* Compare mode toggle pills */}
            <div
              className="flex w-full sm:w-auto rounded-md p-1"
              style={{
                backgroundColor: "#1A1A1A",
                border: "1px solid #252525",
              }}
            >
              <button
                onClick={() => setCompareMode("countries")}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-1.5 rounded transition-colors"
                style={{
                  backgroundColor:
                    compareMode === "countries"
                      ? "var(--color-accent)"
                      : "transparent",
                  color: compareMode === "countries" ? "#FFFFFF" : "#777777",
                  fontFamily: "Geist, sans-serif",
                  fontSize: "13px",
                  fontWeight: compareMode === "countries" ? 500 : 400,
                }}
              >
                <Flag size={14} />
                {t("compare.countries")}
              </button>
              <button
                onClick={() => setCompareMode("regions")}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-1.5 rounded transition-colors"
                style={{
                  backgroundColor:
                    compareMode === "regions"
                      ? "var(--color-accent)"
                      : "transparent",
                  color: compareMode === "regions" ? "#FFFFFF" : "#777777",
                  fontFamily: "Geist, sans-serif",
                  fontSize: "13px",
                  fontWeight: compareMode === "regions" ? 500 : 400,
                }}
              >
                <Globe size={14} />
                {t("compare.regions")}
              </button>
              <button
                onClick={() => setCompareMode("nomadVisas")}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-1.5 rounded transition-colors"
                style={{
                  backgroundColor:
                    compareMode === "nomadVisas"
                      ? "var(--color-accent)"
                      : "transparent",
                  color: compareMode === "nomadVisas" ? "#FFFFFF" : "#777777",
                  fontFamily: "Geist, sans-serif",
                  fontSize: "13px",
                  fontWeight: compareMode === "nomadVisas" ? 500 : 400,
                }}
              >
                <Plane size={14} />
                {t("compare.nomadVisas")}
              </button>
            </div>

            {/* Weights toggle */}
            {compareMode !== "nomadVisas" && (
              <button
                onClick={() => setShowWeights((p) => !p)}
                className="flex items-center gap-1.5 px-4 py-2 rounded border text-sm font-medium transition-colors"
                style={{
                  backgroundColor: showWeights
                    ? "var(--color-accent)"
                    : "#1A1A1A",
                  borderColor: showWeights ? "var(--color-accent)" : "#333333",
                  color: showWeights ? "#FFFFFF" : "#999999",
                  fontFamily: "Inter, sans-serif",
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

            {/* Sort button — visible when 2+ countries in country mode */}
            {compareMode === "countries" && countrySelectionCount > 1 && (
              <button
                onClick={() => setSortTrigger((p) => p + 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded border text-sm font-medium transition-colors hover:border-[#555555]"
                style={{
                  backgroundColor: "#1A1A1A",
                  borderColor: "#333333",
                  color: "#999999",
                  fontFamily: "Inter, sans-serif",
                  cursor: "pointer",
                }}
              >
                <ArrowDownWideNarrow size={16} />
                {t("compare.sortByScore")}
              </button>
            )}

            {/* Share button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2 rounded border text-sm font-medium transition-colors"
              style={{
                backgroundColor: copied ? "#2A4A2A" : "#1A1A1A",
                borderColor: copied ? "#4A8A4A" : "#333333",
                color: copied ? "#88CC88" : "#999999",
                fontFamily: "Inter, sans-serif",
                cursor: "pointer",
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
                  overflow: "hidden",
                  borderRadius: "8px",
                }}
              >
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

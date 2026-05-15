import { useEffect, useMemo, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout, ResponsiveSidePanelLayout } from "@core/ui/layout";
import { CountryList } from "@features/country-ranking/ui";
import { WeightPanel } from "@features/country-ranking/ui";
import { useCountries } from "@core/hooks";
import { useScoring } from "@features/country-ranking/hooks";
import { useLangPrefix } from "@core/hooks";
import { useWeightState } from "@features/country-ranking/hooks";
import { getActiveHighlight } from "./home.utils";
import { HomeHeroSection } from "./HomeHeroSection";
import { HomeStickyBar } from "./HomeStickyBar";
import { useHomeSearch, useHomeCompareMode } from "@features/home/hooks";

export default function App() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const langPrefix = useLangPrefix();
  const lang = i18n.language;
  const ws = useWeightState();

  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);
  const [mobileParamsOpen, setMobileParamsOpen] = useState(false);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialHighlightRef = useRef(searchParams.get("highlight"));

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
  const {
    compareMode,
    setCompareMode,
    selectedCodes,
    toggleSelect,
    exitCompareMode,
    handleCompare,
  } = useHomeCompareMode(langPrefix, navigate);
  const {
    search,
    updateSearch,
    searchMode,
    setSearchMode,
    matchingCodes,
    matchCursor,
    setMatchCursor,
    goNext,
    goPrev,
    displayedRanked,
    searchInputRef,
    allCodes,
    activeNavCursor,
  } = useHomeSearch(ranked, lang, setExpandedCode);

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

  const regions = useMemo(
    () => [...new Set(countries.map((c) => c.region))].sort((a, b) => a.localeCompare(b)),
    [countries],
  );
  const activeHighlight = getActiveHighlight(
    searchMode,
    search,
    matchingCodes,
    matchCursor,
    activeNavCursor,
    highlightedCode,
    allCodes,
  );
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
          <HomeHeroSection countriesCount={countries.length} langPrefix={langPrefix} />
          <HomeStickyBar
            search={search}
            updateSearch={updateSearch}
            searchMode={searchMode}
            setSearchMode={setSearchMode}
            matchingCodes={matchingCodes}
            matchCursor={matchCursor}
            setMatchCursor={setMatchCursor}
            goNext={goNext}
            goPrev={goPrev}
            searchInputRef={searchInputRef}
            compareMode={compareMode}
            selectedCodes={selectedCodes}
            onEnterCompareMode={() => {
              setCompareMode(true);
            }}
            exitCompareMode={exitCompareMode}
            handleCompare={handleCompare}
            regions={regions}
            selectedRegions={ws.selectedRegions}
            setSelectedRegions={ws.setSelectedRegions}
            onClearRegions={() => {
              ws.setSelectedRegions(new Set());
            }}
          />
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

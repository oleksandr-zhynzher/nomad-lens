import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout, ResponsiveSidePanelLayout } from "@core/ui/layout";
import { useCountries, useLangPrefix } from "@core/hooks";
import {
  useTourismScoring,
  useTourismWeightState,
  useTourismSearch,
  useTourismCompareMode,
} from "@features/tourism/hooks";
import { TourismHeroSection } from "./TourismHeroSection";
import { TourismStickyBar } from "./TourismStickyBar";
import { TourismWeightSidebar } from "./TourismWeightSidebar";
import { TourismCountryList } from "./TourismCountryList";

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
  const {
    search,
    updateSearch,
    clearSearch,
    searchMode,
    setSearchMode,
    matchingCodes,
    matchCursor,
    setMatchCursor,
    goNext,
    goPrev,
    displayedRanked,
    activeHighlight,
    searchInputRef,
  } = useTourismSearch(ranked, i18n.language);
  const {
    compareMode,
    setCompareMode,
    selectedCodes,
    toggleSelect,
    exitCompareMode,
    handleCompare,
  } = useTourismCompareMode(langPrefix, navigate);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [mobileParamsOpen, setMobileParamsOpen] = useState(false);

  return (
    <Layout>
      <ResponsiveSidePanelLayout
        sidebar={<TourismWeightSidebar ws={ws} />}
        mobileSheet={{
          open: mobileParamsOpen,
          title: t("tourismWeights.title", "Tourism Weights"),
          closeLabel: t("tourism.a11y.closeParameters", "Close parameters"),
          onClose: () => {
            setMobileParamsOpen(false);
          },
          children: <TourismWeightSidebar ws={ws} mobile />,
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
          <TourismHeroSection countriesCount={ranked.length} />
          <TourismStickyBar
            search={search}
            updateSearch={updateSearch}
            clearSearch={clearSearch}
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
            requiredTags={ws.toggles.requiredTags}
            onToggleTag={ws.handleToggleTag}
          />
        </div>
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
            <TourismCountryList
              loading={loading}
              displayedRanked={displayedRanked}
              compareMode={compareMode}
              expandedCode={expandedCode}
              setExpandedCode={setExpandedCode}
              selectedCodes={selectedCodes}
              toggleSelect={toggleSelect}
              ws={ws}
              activeHighlight={activeHighlight ?? null}
            />
          </div>
        </div>
      </ResponsiveSidePanelLayout>
    </Layout>
  );
}

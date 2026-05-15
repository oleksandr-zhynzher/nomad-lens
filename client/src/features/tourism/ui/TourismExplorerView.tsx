import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout } from "@core/ui/layout";
import { ResponsiveSidePanelLayout } from "@core/ui/layout";
import { EmptyState, LoadingRows } from "@core/ui";
import { TourismCountryCard } from "@features/tourism/ui";
import { TourismWeightPanel } from "@features/tourism/ui";
import { useCountries } from "@core/hooks";
import { useLangPrefix } from "@core/hooks";
import { useTourismScoring, useTourismWeightState } from "@features/tourism/hooks";
import { useTourismSearch, useTourismCompareMode } from "@features/tourism/hooks";
import { TourismHeroSection } from "./TourismHeroSection";
import { TourismStickyBar } from "./TourismStickyBar";

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
          <div className="flex flex-col">{countryListContent}</div>
        </div>
      </ResponsiveSidePanelLayout>
    </Layout>
  );
}

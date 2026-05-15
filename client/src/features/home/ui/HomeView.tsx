import { SlidersHorizontal } from "lucide-react";
import { Layout, ResponsiveSidePanelLayout } from "@core/ui/layout";
import { CountryList } from "@features/country-ranking/ui";
import { HomeHeroSection } from "./HomeHeroSection";
import { HomeStickyBar } from "./HomeStickyBar";
import { HomeWeightSidebar } from "./HomeWeightSidebar";
import { useHomePageState } from "./useHomePageState";

export default function App() {
  const {
    ws,
    t,
    langPrefix,
    countries,
    loading,
    error,
    refresh,
    compareMode,
    setCompareMode,
    selectedCodes,
    toggleSelect,
    exitCompareMode,
    handleCompare,
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
    expandedCode,
    setExpandedCode,
    mobileParamsOpen,
    setMobileParamsOpen,
    regions,
    activeHighlight,
    highlightedCode,
  } = useHomePageState();

  return (
    <Layout>
      <ResponsiveSidePanelLayout
        sidebar={<HomeWeightSidebar ws={ws} />}
        mobileSheet={{
          open: mobileParamsOpen,
          title: t("mobileSheet.weightsAndPreferences"),
          closeLabel: t("a11y.closeParameters", "Close parameters"),
          onClose: () => {
            setMobileParamsOpen(false);
          },
          children: <HomeWeightSidebar ws={ws} mobile />,
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

import { SlidersHorizontal } from "lucide-react";
import { Layout, ResponsiveSidePanelLayout } from "@core/ui/layout";
import { CountryList } from "@features/country-ranking/ui";
import { HomeHeroSection } from "./HomeHeroSection";
import { HomeStickyBar } from "./HomeStickyBar";
import { HomeWeightSidebar } from "./HomeWeightSidebar";
import { useHomePageState } from "./useHomePageState";

export default function App() {
  const state = useHomePageState();
  const { ws } = state;

  return (
    <Layout>
      <ResponsiveSidePanelLayout
        sidebar={<HomeWeightSidebar ws={ws} />}
        mobileSheet={{
          open: state.mobileParamsOpen,
          title: state.t("mobileSheet.weightsAndPreferences"),
          closeLabel: state.t("a11y.closeParameters", "Close parameters"),
          onClose: () => state.setMobileParamsOpen(false),
          children: <HomeWeightSidebar ws={ws} mobile />,
        }}
        mobileFab={{
          label: state.t("mobileSheet.parameters"),
          ariaLabel: state.t("a11y.openParameters", "Open parameters"),
          icon: <SlidersHorizontal size={18} aria-hidden />,
          onClick: () => state.setMobileParamsOpen(true),
        }}
      >
        <div className="px-4 md:px-6">
          <HomeHeroSection countriesCount={state.countries.length} langPrefix={state.langPrefix} />
          <HomeStickyBar
            search={state.search}
            updateSearch={state.updateSearch}
            searchMode={state.searchMode}
            setSearchMode={state.setSearchMode}
            matchingCodes={state.matchingCodes}
            matchCursor={state.matchCursor}
            setMatchCursor={state.setMatchCursor}
            goNext={state.goNext}
            goPrev={state.goPrev}
            searchInputRef={state.searchInputRef}
            compareMode={state.compareMode}
            selectedCodes={state.selectedCodes}
            onEnterCompareMode={() => state.setCompareMode(true)}
            exitCompareMode={state.exitCompareMode}
            handleCompare={state.handleCompare}
            regions={state.regions}
            selectedRegions={ws.selectedRegions}
            setSelectedRegions={ws.setSelectedRegions}
            onClearRegions={() => ws.setSelectedRegions(new Set())}
          />
          <CountryList
            ranked={state.displayedRanked}
            loading={state.loading}
            error={state.error}
            onRetry={state.refresh}
            highlightedCode={state.activeHighlight}
            expandedCode={state.compareMode ? null : state.expandedCode}
            showAll={state.search.trim().length > 0 || state.highlightedCode !== null}
            compareMode={state.compareMode}
            selectedCodes={state.selectedCodes}
            onToggleSelect={state.toggleSelect}
            weights={ws.weights}
            {...(!state.compareMode && {
              onToggleExpanded: (code: string) =>
                state.setExpandedCode((c) => (c === code ? null : code)),
            })}
          />
        </div>
      </ResponsiveSidePanelLayout>
    </Layout>
  );
}

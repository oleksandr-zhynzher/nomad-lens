import { SlidersHorizontal } from "lucide-react";
import { Layout, ResponsiveSidePanelLayout } from "@core/ui/layout";
import { TourismHeroSection } from "./TourismHeroSection";
import { TourismStickyBar } from "./TourismStickyBar";
import { TourismWeightSidebar } from "./TourismWeightSidebar";
import { TourismCountryList } from "./TourismCountryList";
import { useTourismPage } from "./useTourismPage";

export function TourismPage() {
  const page = useTourismPage();
  const { t, ws } = page;

  return (
    <Layout>
      <ResponsiveSidePanelLayout
        sidebar={<TourismWeightSidebar ws={ws} />}
        mobileSheet={{
          open: page.mobileParamsOpen,
          title: t("tourismWeights.title", "Tourism Weights"),
          closeLabel: t("tourism.a11y.closeParameters", "Close parameters"),
          onClose: () => {
            page.setMobileParamsOpen(false);
          },
          children: <TourismWeightSidebar ws={ws} mobile />,
        }}
        mobileFab={{
          label: t("mobileSheet.parameters", "Parameters"),
          ariaLabel: t("tourism.a11y.openParameters", "Open parameters"),
          icon: <SlidersHorizontal size={18} aria-hidden />,
          onClick: () => {
            page.setMobileParamsOpen(true);
          },
        }}
      >
        <div className="px-4 md:px-6">
          <TourismHeroSection countriesCount={page.ranked.length} />
          <TourismStickyBar
            search={page.search}
            updateSearch={page.updateSearch}
            clearSearch={page.clearSearch}
            searchMode={page.searchMode}
            setSearchMode={page.setSearchMode}
            matchingCodes={page.matchingCodes}
            matchCursor={page.matchCursor}
            setMatchCursor={page.setMatchCursor}
            goNext={page.goNext}
            goPrev={page.goPrev}
            searchInputRef={page.searchInputRef}
            compareMode={page.compareMode}
            selectedCodes={page.selectedCodes}
            onEnterCompareMode={() => {
              page.setCompareMode(true);
            }}
            exitCompareMode={page.exitCompareMode}
            handleCompare={page.handleCompare}
            requiredTags={ws.toggles.requiredTags}
            onToggleTag={ws.handleToggleTag}
          />
        </div>
        <div className="px-4 md:px-6">
          <div className="my-4 flex items-center justify-between px-1 text-xs">
            <span className="text-on-surface">
              {page.compareMode
                ? t(
                    "compare.tourismSelectionSubtitle",
                    "Select countries to compare tourism appeal side by side",
                  )
                : t("countryList.clickHint", "Click on a country to view details")}
            </span>
            <span className="text-dim">
              {t("countryList.count", { count: page.displayedRanked.length })}
            </span>
          </div>
          <div className="flex flex-col">
            <TourismCountryList
              loading={page.loading}
              displayedRanked={page.displayedRanked}
              compareMode={page.compareMode}
              expandedCode={page.expandedCode}
              setExpandedCode={page.setExpandedCode}
              selectedCodes={page.selectedCodes}
              toggleSelect={page.toggleSelect}
              ws={ws}
              activeHighlight={page.activeHighlight ?? null}
            />
          </div>
        </div>
      </ResponsiveSidePanelLayout>
    </Layout>
  );
}

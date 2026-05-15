import { useTranslation } from "react-i18next";
import { Layout } from "@core/ui/layout";
import { PageHeroBanner } from "@core/ui/page-hero";
import { useCompareView } from "@features/compare/hooks";
import { CompareHeroStats } from "./CompareHeroStats";
import { CompareActionSection } from "./CompareActionSection";
import { ComparePanelGrid } from "./ComparePanelGrid";

export function ComparePage() {
  const { t } = useTranslation();
  const {
    compareMode,
    setCompareMode,
    sortDirection,
    showWeights,
    mobileParamsOpen,
    setMobileParamsOpen,
    copied,
    sortFeedbackActive,
    selectedCodes,
    handleSelectedCodesChange,
    handleShare,
    handleSortByScore,
    handleToggleWeights,
    showSortAction,
    actionGridClassName,
    sortButtonLabel,
    sortButtonIconClassName,
    compareTitle,
    compareSubtitle,
    panelRef,
    setCountrySelectionCount,
    ws,
    tws,
    bs,
    budgetMatches,
    countries,
    langPrefix,
    nomadVisaCountryCount,
  } = useCompareView();

  return (
    <Layout>
      <div>
        <PageHeroBanner
          backgroundImage="/hero-map.png"
          eyebrow={t("compare.eyebrow")}
          title={compareTitle}
          subtitle={compareSubtitle}
        >
          <CompareHeroStats
            countriesCount={countries.length}
            nomadVisaCountryCount={nomadVisaCountryCount}
            langPrefix={langPrefix}
          />
        </PageHeroBanner>

        <div className="mx-auto max-w-[1200px] px-4 pb-6">
          <CompareActionSection
            compareMode={compareMode}
            onCompareMode={setCompareMode}
            showWeights={showWeights}
            onToggleWeights={handleToggleWeights}
            showSortAction={showSortAction}
            sortFeedbackActive={sortFeedbackActive}
            sortButtonLabel={sortButtonLabel}
            sortButtonIconClassName={sortButtonIconClassName}
            onSortByScore={handleSortByScore}
            copied={copied}
            onShare={handleShare}
            actionGridClassName={actionGridClassName}
            mobileParamsOpen={mobileParamsOpen}
            onMobileParamsClose={() => {
              setMobileParamsOpen(false);
            }}
            rankingState={ws}
            tourismState={tws}
            budgetState={bs}
          />

          <ComparePanelGrid
            showWeights={showWeights}
            panelRef={panelRef}
            compareMode={compareMode}
            rankingState={ws}
            tourismState={tws}
            budgetState={bs}
            onShare={handleShare}
            countries={countries}
            budgetMatches={budgetMatches}
            selectedCodes={selectedCodes}
            onSelectedCodesChange={handleSelectedCodesChange}
            sortDirection={sortDirection}
            onSelectionCount={setCountrySelectionCount}
          />
        </div>
      </div>
    </Layout>
  );
}

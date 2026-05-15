import { useTranslation } from "react-i18next";
import { Layout } from "@core/ui/layout";
import { PageHeroBanner } from "@core/ui/page-hero";
import { MobileSheet } from "@core/ui";
import { useCompareView } from "@features/compare/hooks";
import { CompareParametersPanel } from "./CompareParametersPanel";
import { CompareHeroStats } from "./CompareHeroStats";
import { CompareModeToggle } from "./CompareModeToggle";
import { CompareActionBar } from "./CompareActionBar";
import { ComparePanel } from "./ComparePanel";

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
          <div className="mb-4 flex flex-col items-start gap-3 sm:sticky sm:top-14 sm:z-20 sm:-mx-4 md:mb-6 sm:flex-row sm:items-center md:gap-4 sm:border-b sm:border-[#1C1C1C] sm:bg-[#0F1114] sm:px-4 sm:py-2">
            <CompareModeToggle compareMode={compareMode} onCompareMode={setCompareMode} />
            <CompareActionBar
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
            />
          </div>

          <MobileSheet
            open={mobileParamsOpen}
            title={t("compare.parameters")}
            closeLabel={t("a11y.closeParameters", "Close parameters")}
            onClose={() => {
              setMobileParamsOpen(false);
            }}
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
            className={`grid gap-4 md:gap-6 ${showWeights ? "grid-cols-1 lg:grid-cols-[340px_1fr]" : "grid-cols-1"}`}
          >
            {showWeights ? (
              <div
                ref={panelRef}
                className={`sticky top-4 hidden rounded-lg md:block ${compareMode === "budget" || compareMode === "nomadVisas" ? "overflow-auto" : "overflow-hidden"}`}
              >
                <CompareParametersPanel
                  compareMode={compareMode}
                  rankingState={ws}
                  tourismState={tws}
                  budgetState={bs}
                  onShare={handleShare}
                />
              </div>
            ) : null}
            <div className="min-w-0">
              <ComparePanel
                compareMode={compareMode}
                countries={countries}
                weights={ws.weights}
                climatePrefs={ws.climatePrefs}
                budgetMatches={budgetMatches}
                selectedCodes={selectedCodes}
                onSelectedCodesChange={handleSelectedCodesChange}
                sortDirection={sortDirection}
                onSelectionCount={setCountrySelectionCount}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

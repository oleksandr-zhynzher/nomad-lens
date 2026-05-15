import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Layout } from "@core/ui/layout";
import { PageHeroBanner } from "@core/ui/page-hero";
import { useBudgetMatcher } from "@features/budget/hooks";
import { useBudgetState } from "@features/budget/hooks";
import { useCountries } from "@core/hooks";
import { useLangPrefix } from "@core/hooks";
import { useWeightState } from "@features/country-ranking/hooks";
import { useNomadVisasState } from "@features/nomad-visas/hooks";
import { NomadVisaHeroStats } from "./NomadVisaHeroStats";
import { NomadVisasToolbar } from "./NomadVisasToolbar";
import { NomadVisasTableShell } from "./NomadVisasTableShell";

export function NomadVisasPage() {
  const { t } = useTranslation();
  const { countries, loading } = useCountries();
  const langPrefix = useLangPrefix();
  const navigate = useNavigate();
  const ws = useWeightState();
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

  const {
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    handleSort,
    compareMode,
    setCompareMode,
    selectedCodes,
    toggleSelect,
    exitCompareMode,
    handleCompare,
    searchBarRef,
    theadTop,
    headerScrollRef,
    bodyScrollRef,
    syncHeaderScroll,
    allVisaCountries,
    sortedCountries,
    taxExemptCount,
    freeVisaCount,
    highlightCode,
  } = useNomadVisasState({
    countries,
    weights: ws.weights,
    climatePrefs: ws.climatePrefs,
    budgetMatches,
    navigate,
    langPrefix,
  });

  return (
    <Layout>
      <div className="mx-auto box-content w-full max-w-[1200px] px-4 pb-12">
        <PageHeroBanner
          backgroundImage="/hero-map.png"
          eyebrow={t("nomadVisasPage.eyebrow", "TRAVEL & WORK")}
          title={t("nav.nomadVisas")}
          subtitle={t(
            "nomadVisasPage.subtitle",
            "Compare digital nomad visa programs across {{count}} countries",
            { count: allVisaCountries.length },
          )}
        >
          <NomadVisaHeroStats
            totalCountries={allVisaCountries.length}
            taxExemptCount={taxExemptCount}
            freeVisaCount={freeVisaCount}
          />
        </PageHeroBanner>
        <div className="h-0" />
      </div>
      <NomadVisasToolbar
        searchBarRef={searchBarRef}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        compareMode={compareMode}
        onEnterCompareMode={() => {
          setCompareMode(true);
        }}
        selectedCodes={selectedCodes}
        onCompare={handleCompare}
        onExitCompareMode={exitCompareMode}
      />
      <NomadVisasTableShell
        loading={loading}
        sortedCountries={sortedCountries}
        compareMode={compareMode}
        selectedCodes={selectedCodes}
        onToggleSelect={toggleSelect}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        theadTop={theadTop}
        theadRef={headerScrollRef}
        bodyRef={bodyScrollRef}
        onBodyScroll={syncHeaderScroll}
        budget={bs.budget}
        langPrefix={langPrefix}
        navigate={navigate}
        highlightCode={highlightCode}
      />
    </Layout>
  );
}

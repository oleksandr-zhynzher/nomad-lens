import { useNavigate } from "react-router-dom";
import { Layout } from "@core/ui/layout";
import { useBudgetMatcher, useBudgetState } from "@features/budget/hooks";
import { useCountries, useLangPrefix } from "@core/hooks";
import { useWeightState } from "@features/country-ranking/hooks";
import { useNomadVisasState } from "@features/nomad-visas/hooks";
import { NomadVisaPageBanner } from "./NomadVisaPageBanner";
import { NomadVisasToolbar } from "./NomadVisasToolbar";
import { NomadVisasTableShell } from "./NomadVisasTableShell";

export function NomadVisasPage() {
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
      <NomadVisaPageBanner
        count={allVisaCountries.length}
        taxExemptCount={taxExemptCount}
        freeVisaCount={freeVisaCount}
      />
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

import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RouteLoadingFallback } from "./RouteLoadingFallback";
import { LangWrapper } from "@core/ui/layout";
import { routeModule } from "./router.utils";

const HomePage = lazy(async () => import("@features/home/ui/HomeView"));
const MapPage = lazy(async () =>
  import("@features/country-map/ui/MapView").then(routeModule("MapPage")),
);
const ComparePage = lazy(async () =>
  import("@features/compare/ui/CompareView").then(routeModule("ComparePage")),
);
const CountryPage = lazy(async () =>
  import("@features/country-profile/ui/CountryProfileView").then(routeModule("CountryPage")),
);
const NomadVisasPage = lazy(async () =>
  import("@features/nomad-visas/ui/NomadVisasView").then(routeModule("NomadVisasPage")),
);
const NomadVisaComparePage = lazy(async () =>
  import("@features/nomad-visas/ui/NomadVisaCompareView").then(routeModule("NomadVisaComparePage")),
);
const BudgetMatcherPage = lazy(async () =>
  import("@features/budget/ui/BudgetMatcherView").then(routeModule("BudgetMatcherPage")),
);
const DataSourcesPage = lazy(async () =>
  import("@features/data-sources/ui/DataSourcesView").then(routeModule("DataSourcesPage")),
);
const IndicatorsPage = lazy(async () =>
  import("@features/indicator-catalog/ui/IndicatorsView").then(routeModule("IndicatorsPage")),
);
const AiIndicatorsPage = lazy(async () =>
  import("@features/indicator-catalog/ui/AiIndicatorsView").then(routeModule("AiIndicatorsPage")),
);
const BudgetCategoriesPage = lazy(async () =>
  import("@features/budget/ui/BudgetCategoriesView").then(routeModule("BudgetCategoriesPage")),
);
const TourismPage = lazy(async () =>
  import("@features/tourism/ui/TourismExplorerView").then(routeModule("TourismPage")),
);

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route path="/:lang?" element={<LangWrapper />}>
            <Route index element={<HomePage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="compare" element={<ComparePage />} />
            <Route path="country/:code" element={<CountryPage />} />
            <Route path="nomad-visas" element={<NomadVisasPage />} />
            <Route path="nomad-visas/compare" element={<NomadVisaComparePage />} />
            <Route path="budget-matcher" element={<BudgetMatcherPage />} />
            <Route path="data-sources" element={<DataSourcesPage />} />
            <Route path="indicators" element={<IndicatorsPage />} />
            <Route path="ai-indicators" element={<AiIndicatorsPage />} />
            <Route path="budget-categories" element={<BudgetCategoriesPage />} />
            <Route path="tourism" element={<TourismPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

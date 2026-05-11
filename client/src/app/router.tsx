import { lazy, Suspense, type ComponentType } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RouteLoadingFallback } from "./RouteLoadingFallback";
import { LangWrapper } from "../components/LangWrapper";

const HomePage = lazy(() => import("../App"));
const MapPage = lazy(() => import("../pages/MapPage").then(routeModule("MapPage")));
const ComparePage = lazy(() => import("../pages/ComparePage").then(routeModule("ComparePage")));
const CountryPage = lazy(() => import("../pages/CountryPage").then(routeModule("CountryPage")));
const NomadVisasPage = lazy(() =>
  import("../pages/NomadVisasPage").then(routeModule("NomadVisasPage")),
);
const NomadVisaComparePage = lazy(() =>
  import("../pages/NomadVisaComparePage").then(routeModule("NomadVisaComparePage")),
);
const BudgetMatcherPage = lazy(() =>
  import("../pages/BudgetMatcherPage").then(routeModule("BudgetMatcherPage")),
);
const DataSourcesPage = lazy(() =>
  import("../pages/DataSourcesPage").then(routeModule("DataSourcesPage")),
);
const IndicatorsPage = lazy(() =>
  import("../pages/IndicatorsPage").then(routeModule("IndicatorsPage")),
);
const AiIndicatorsPage = lazy(() =>
  import("../pages/AiIndicatorsPage").then(routeModule("AiIndicatorsPage")),
);
const BudgetCategoriesPage = lazy(() =>
  import("../pages/BudgetCategoriesPage").then(routeModule("BudgetCategoriesPage")),
);
const TourismPage = lazy(() => import("../pages/TourismPage").then(routeModule("TourismPage")));

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

function routeModule<TModule, TKey extends keyof TModule>(key: TKey) {
  return (module: TModule) => ({ default: module[key] as ComponentType });
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./i18n";
import "./index.css";
import App from "./App.tsx";
import { DataSourcesPage } from "./pages/DataSourcesPage.tsx";
import { IndicatorsPage } from "./pages/IndicatorsPage.tsx";
import { MapPage } from "./pages/MapPage.tsx";
import { ComparePage } from "./pages/ComparePage.tsx";
import { CountryPage } from "./pages/CountryPage.tsx";
import { NomadVisasPage } from "./pages/NomadVisasPage.tsx";
import { NomadVisaComparePage } from "./pages/NomadVisaComparePage.tsx";
import { BudgetMatcherPage } from "./pages/BudgetMatcherPage.tsx";
import { AiIndicatorsPage } from "./pages/AiIndicatorsPage.tsx";
import { BudgetCategoriesPage } from "./pages/BudgetCategoriesPage.tsx";
import { LangWrapper } from "./components/LangWrapper.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/:lang?" element={<LangWrapper />}>
          <Route index element={<App />} />
          <Route path="map" element={<MapPage />} />
          <Route path="compare" element={<ComparePage />} />
          <Route path="country/:code" element={<CountryPage />} />
          <Route path="nomad-visas" element={<NomadVisasPage />} />
          <Route
            path="nomad-visas/compare"
            element={<NomadVisaComparePage />}
          />
          <Route path="budget-matcher" element={<BudgetMatcherPage />} />
          <Route path="data-sources" element={<DataSourcesPage />} />
          <Route path="indicators" element={<IndicatorsPage />} />
          <Route path="ai-indicators" element={<AiIndicatorsPage />} />
          <Route path="budget-categories" element={<BudgetCategoriesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);

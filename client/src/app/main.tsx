import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@i18n";
import "./styles/index.css";
import { AppRouter } from "./router/AppRouter";

const rootElement = document.querySelector("#root");
if (!rootElement) throw new Error("Root element #root not found");
createRoot(rootElement).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);

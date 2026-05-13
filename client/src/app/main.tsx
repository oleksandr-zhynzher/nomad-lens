import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@i18n";
import "./styles/index.css";
import { AppRouter } from "@app/router/AppRouter";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);

import "@i18n";
import "./styles/index.css";

import { queryClient } from "@core/api";
import { AppErrorBoundary } from "@core/ui/states";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AppRouter } from "./router/AppRouter";

const rootElement = document.querySelector("#root");
if (!rootElement) throw new Error("Root element #root not found");
createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppErrorBoundary>
        <AppRouter />
      </AppErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
);

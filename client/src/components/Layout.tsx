import type { ReactNode } from "react";
import { List, Map, Github } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  view: "list" | "map";
  onViewChange: (view: "list" | "map") => void;
}

export function Layout({ children, view, onViewChange }: LayoutProps) {
  return (
    <div className="min-h-screen text-slate-100" style={{ backgroundColor: "var(--color-bg)" }}>
      <header className="border-b sticky top-0 z-10" style={{ backgroundColor: "#1A1A1A", borderColor: "#252525", height: "56px" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-xl">🌍</span>
            <span style={{ fontFamily: "Anton, sans-serif", fontSize: "20px", letterSpacing: "2px", textTransform: "uppercase" }}>
              NOMAD LENS
            </span>
          </div>

          {/* Right side: View toggle + divider + GitHub */}
          <div className="flex items-center gap-4">
            {/* View toggle - segmented control */}
            <div className="flex rounded-md p-1" style={{ backgroundColor: "#2A2A2A", gap: "4px" }}>
              <button
                onClick={() => onViewChange("list")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors"
                style={{
                  backgroundColor: view === "list" ? "var(--color-accent)" : "transparent",
                  color: view === "list" ? "#FFFFFF" : "#999999",
                  fontFamily: "Geist, sans-serif",
                  fontSize: "13px",
                  fontWeight: view === "list" ? 500 : 400,
                }}
              >
                <List size={16} />
                List
              </button>
              <button
                onClick={() => onViewChange("map")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors"
                style={{
                  backgroundColor: view === "map" ? "var(--color-accent)" : "transparent",
                  color: view === "map" ? "#FFFFFF" : "#999999",
                  fontFamily: "Geist, sans-serif",
                  fontSize: "13px",
                  fontWeight: view === "map" ? 500 : 400,
                }}
              >
                <Map size={16} />
                Map
              </button>
            </div>

            {/* Divider */}
            <div className="h-6 w-px" style={{ backgroundColor: "#252525" }} />

            {/* GitHub link */}
            <a
              href="https://github.com/oleksandr-zhynzher/nomad-lens"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-slate-200 transition-colors"
              style={{ fontFamily: "Geist, sans-serif", fontSize: "13px", color: "#999999" }}
            >
              <Github size={16} />
              GitHub
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</main>

      <footer className="border-t mt-16 py-6 text-center text-xs" style={{ borderColor: "#333333", color: "#666666" }}>
        Data: World Bank · WHO · Open-Meteo · REST Countries · UNDP · World Happiness Report · Global Peace Index · UNODC
      </footer>
    </div>
  );
}

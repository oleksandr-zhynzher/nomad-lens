import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌍</span>
            <span className="font-bold text-lg tracking-tight">Nomad Lens</span>
            <span className="hidden sm:inline text-xs text-slate-500 ml-1 border border-slate-700 rounded px-1.5 py-0.5">
              beta
            </span>
          </div>
          <nav className="flex items-center gap-4 text-sm text-slate-400">
            <a
              href="https://github.com/oleksandr-zhynzher/nomad-lens"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-200 transition-colors"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</main>

      <footer className="border-t border-slate-800 mt-16 py-6 text-center text-xs text-slate-600">
        Data: World Bank · WHO · Open-Meteo · REST Countries · UNDP · World Happiness Report · Global Peace Index · UNODC
      </footer>
    </div>
  );
}

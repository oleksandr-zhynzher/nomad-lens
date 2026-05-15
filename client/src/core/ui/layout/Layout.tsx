import { type ReactNode, useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLangPrefix } from "@core/hooks";
import { LogoMark } from "./LogoMark";
import { INFO_PAGES } from "@core/utils";
import {
  navigateToView,
  computeLangSwitchPath,
  computeActiveView,
  type NavView,
} from "./layout.utils";
import { DesktopNav } from "./DesktopNav";
import { LangDropdown } from "./LangDropdown";
import { MobileMenu } from "./MobileMenu";

interface LayoutProps {
  readonly children: ReactNode;
  readonly activePage?: "data-sources" | "indicators" | "ai-indicators" | "budget-categories";
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { t, i18n } = useTranslation();
  const langPrefix = useLangPrefix();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const langSwitchPath = (targetLang: string) =>
    computeLangSwitchPath(targetLang, pathname, langPrefix, search);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  const isInfoPage = INFO_PAGES.some((pagePath) => pathname.endsWith(pagePath));
  const activeView = computeActiveView(pathname, isInfoPage);

  const handleViewClick = (view: NavView) => {
    navigateToView(view, langPrefix, navigate, () => {
      setMobileMenuOpen(false);
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg text-slate-100">
      <header className="sticky top-0 z-30 h-14 border-b border-[#252525] bg-[#0D0E10]">
        <div className="mx-auto flex h-full w-full max-w-[1200px] items-center justify-between px-4">
          <button
            onClick={() => {
              handleViewClick("list");
            }}
            className="-mt-1 flex h-8 cursor-pointer items-center gap-2.5 border-none bg-transparent p-0 leading-none"
          >
            <LogoMark size={32} />
            <span className="-mt-1 flex h-8 items-center [font-family:Oswald,_sans-serif] text-[20px] leading-none font-bold tracking-[2px] uppercase">
              NOMAD LENS
            </span>
          </button>

          <div className="hidden items-center gap-4 md:flex">
            <DesktopNav
              activeView={activeView}
              onViewClick={handleViewClick}
              langPrefix={langPrefix}
              pathname={pathname}
            />
            <LangDropdown currentLangCode={i18n.language} langSwitchPath={langSwitchPath} />
          </div>

          <button
            className="flex h-10 w-10 items-center justify-center text-muted md:hidden"
            onClick={() => {
              setMobileMenuOpen((previous) => !previous);
            }}
            aria-label={t("a11y.toggleMenu", "Toggle menu")}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => {
          setMobileMenuOpen(false);
        }}
        activeView={activeView}
        onViewClick={handleViewClick}
        langPrefix={langPrefix}
        pathname={pathname}
        langSwitchPath={langSwitchPath}
        currentLangCode={i18n.language}
      />

      <main
        className={activeView === "compare" ? "" : "mx-auto w-full max-w-7xl px-4 pb-4 md:pb-6"}
      >
        {children}
      </main>

      <footer className="mt-16 border-t border-border px-4 py-6 text-center text-xs text-dim">
        {t("footer.data")}
      </footer>
    </div>
  );
}

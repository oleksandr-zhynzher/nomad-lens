import { type ReactNode, useEffect, useRef, useState } from "react";
import { BarChart3, List, Map, Menu, Palmtree, Plane, Wallet, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLangPrefix } from "../hooks/useLangPrefix";
import { LogoMark } from "./LogoMark";
import { LANG_OPTIONS } from "../utils/i18n";
import { INFO_PAGES } from "../utils/navigation";

interface LayoutProps {
  children: ReactNode;
  activePage?: "data-sources" | "indicators" | "ai-indicators" | "budget-categories";
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { t, i18n } = useTranslation();
  const langPrefix = useLangPrefix();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const langSwitchPath = (targetLang: string) => {
    let rest = pathname;
    if (langPrefix && rest.startsWith(langPrefix)) {
      rest = rest.slice(langPrefix.length) || "/";
    }
    const prefix = targetLang === "en" ? "" : `/${targetLang}`;
    return `${prefix}${rest}${search}`;
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    }

    if (langDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [langDropdownOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  const currentLang =
    LANG_OPTIONS.find((language) => language.code === i18n.language) ?? LANG_OPTIONS[0];

  const isInfoPage = INFO_PAGES.some((pagePath) => pathname.endsWith(pagePath));

  const activeView: "list" | "map" | "compare" | null = pathname.endsWith("/map")
    ? "map"
    : pathname.endsWith("/compare")
      ? "compare"
      : isInfoPage
        ? null
        : "list";

  const handleViewClick = (view: "list" | "map" | "compare") => {
    if (view === "list") {
      navigate(langPrefix || "/");
    } else {
      navigate(`${langPrefix}/${view}`);
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-100 bg-bg">
      <header className="sticky top-0 z-30 border-b bg-[#0D0E10] border-[#252525] h-14">
        <div className="mx-auto flex h-full w-full max-w-[1200px] items-center justify-between px-4">
          <button
            onClick={() => handleViewClick("list")}
            className="flex items-center gap-2.5 leading-none bg-transparent border-none cursor-pointer p-0 h-8 -mt-1"
          >
            <LogoMark size={32} />
            <span className="text-[20px] font-bold tracking-[2px] leading-none uppercase flex items-center h-8 -mt-1 [font-family:Oswald,_sans-serif]">
              NOMAD LENS
            </span>
          </button>

          <div className="hidden items-center gap-4 md:flex">
            <div className="flex rounded-md p-1 bg-surface-4 gap-1">
              <button
                onClick={() => handleViewClick("list")}
                className={`header-nav-item flex items-center gap-1.5 rounded px-3 py-1.5 transition-colors text-[13px] ${activeView === "list" ? "bg-accent text-white font-medium" : "bg-transparent text-muted font-normal"}`}
              >
                <List size={16} />
                {t("views.list")}
              </button>
              <button
                onClick={() => handleViewClick("map")}
                className={`header-nav-item flex items-center gap-1.5 rounded px-3 py-1.5 transition-colors text-[13px] ${activeView === "map" ? "bg-accent text-white font-medium" : "bg-transparent text-muted font-normal"}`}
              >
                <Map size={16} />
                {t("views.map")}
              </button>
              <button
                onClick={() => handleViewClick("compare")}
                className={`header-nav-item flex items-center gap-1.5 rounded px-3 py-1.5 transition-colors text-[13px] ${activeView === "compare" ? "bg-accent text-white font-medium" : "bg-transparent text-muted font-normal"}`}
              >
                <BarChart3 size={16} />
                {t("views.compare")}
              </button>
              <Link
                to={`${langPrefix}/nomad-visas`}
                className={`header-nav-item flex items-center gap-1.5 rounded px-3 py-1.5 transition-colors text-[13px] no-underline ${pathname.endsWith("/nomad-visas") ? "bg-accent text-white font-medium" : "bg-transparent text-muted font-normal"}`}
              >
                <Plane size={16} />
                {t("nav.nomadVisas")}
              </Link>
              <Link
                to={`${langPrefix}/budget-matcher`}
                className={`header-nav-item flex items-center gap-1.5 rounded px-3 py-1.5 transition-colors text-[13px] no-underline ${pathname.endsWith("/budget-matcher") ? "bg-accent text-white font-medium" : "bg-transparent text-muted font-normal"}`}
              >
                <Wallet size={16} />
                {t("nav.budgetMatcher")}
              </Link>
              <Link
                to={`${langPrefix}/tourism`}
                className={`header-nav-item flex items-center gap-1.5 rounded px-3 py-1.5 transition-colors text-[13px] no-underline ${pathname.endsWith("/tourism") ? "bg-accent text-white font-medium" : "bg-transparent text-muted font-normal"}`}
              >
                <Palmtree size={16} />
                {t("nav.tourism", "Tourism")}
              </Link>
            </div>

            <div ref={langRef} className="relative flex items-center">
              <button
                onClick={() => setLangDropdownOpen((previous) => !previous)}
                className={`inline-flex items-center justify-center bg-transparent border-none cursor-pointer text-xs font-bold tracking-[1px] leading-none min-w-8 h-8 px-1.5 ${langDropdownOpen ? "text-accent-dim" : "text-dimmer"}`}
              >
                {currentLang.code.toUpperCase()}
              </button>

              {langDropdownOpen && (
                <div className="absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 bg-[#111111] border border-[#252525] rounded-lg overflow-hidden z-50 shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
                  {LANG_OPTIONS.filter((option) => option.code !== i18n.language).map(
                    (option, index) => (
                      <Link
                        key={option.code}
                        to={langSwitchPath(option.code)}
                        onClick={() => setLangDropdownOpen(false)}
                        className={`flex items-center justify-center min-w-14 h-8 px-4 no-underline text-xs font-semibold tracking-[1px] leading-none text-muted ${index === 0 ? "" : "border-t border-[#1E1E1E]"}`}
                      >
                        {option.code.toUpperCase()}
                      </Link>
                    ),
                  )}
                </div>
              )}
            </div>

            <a
              href="https://github.com/oleksandr-zhynzher/nomad-lens"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-slate-200 text-[13px] text-muted"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
                />
              </svg>
              {t("nav.github")}
            </a>
          </div>

          <button
            className="flex items-center justify-center md:hidden w-10 h-10 text-muted"
            onClick={() => setMobileMenuOpen((previous) => !previous)}
            aria-label={t("a11y.toggleMenu", "Toggle menu")}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-14 bottom-0 z-40 px-3 pb-3 md:hidden bg-[#0D0E10]">
          <button
            type="button"
            aria-label={t("a11y.closeMenu", "Close menu")}
            className="absolute inset-0"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex max-h-full flex-col gap-1 overflow-y-auto rounded-2xl border px-4 py-4 border-[#252525] [background:linear-gradient(180deg,rgba(20,20,22,0.98)_0%,rgba(13,14,16,0.98)_100%)] shadow-[0_20px_48px_rgba(0,0,0,0.45)]">
            <p className="text-[10px] font-semibold tracking-[1.5px] uppercase text-dimmest mb-1">
              {t("views.viewLabel")}
            </p>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => handleViewClick("list")}
                className={`flex items-center justify-center gap-1.5 rounded px-3 py-2 transition-colors text-[13px] ${activeView === "list" ? "bg-accent text-white font-medium" : "bg-surface-4 text-muted font-normal"}`}
              >
                <List size={16} />
                {t("views.list")}
              </button>
              <button
                onClick={() => handleViewClick("map")}
                className={`flex items-center justify-center gap-1.5 rounded px-3 py-2 transition-colors text-[13px] ${activeView === "map" ? "bg-accent text-white font-medium" : "bg-surface-4 text-muted font-normal"}`}
              >
                <Map size={16} />
                {t("views.map")}
              </button>
              <button
                onClick={() => handleViewClick("compare")}
                className={`flex items-center justify-center gap-1.5 rounded px-3 py-2 transition-colors text-[13px] ${activeView === "compare" ? "bg-accent text-white font-medium" : "bg-surface-4 text-muted font-normal"}`}
              >
                <BarChart3 size={16} />
                {t("views.compare")}
              </button>
              <Link
                to={`${langPrefix}/nomad-visas`}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-center gap-1.5 rounded px-3 py-2 transition-colors text-[13px] no-underline ${pathname.endsWith("/nomad-visas") ? "bg-accent text-white font-medium" : "bg-surface-4 text-muted font-normal"}`}
              >
                <Plane size={16} />
                {t("nav.nomadVisas")}
              </Link>
              <Link
                to={`${langPrefix}/budget-matcher`}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-center gap-1.5 rounded px-3 py-2 transition-colors text-[13px] no-underline ${pathname.endsWith("/budget-matcher") ? "bg-accent text-white font-medium" : "bg-surface-4 text-muted font-normal"}`}
              >
                <Wallet size={16} />
                {t("nav.budgetMatcher")}
              </Link>
              <Link
                to={`${langPrefix}/tourism`}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-center gap-1.5 rounded px-3 py-2 transition-colors text-[13px] no-underline ${pathname.endsWith("/tourism") ? "bg-accent text-white font-medium" : "bg-surface-4 text-muted font-normal"}`}
              >
                <Palmtree size={16} />
                {t("nav.tourism", "Tourism")}
              </Link>
            </div>

            <div className="flex items-center gap-3 py-3 border-b border-[#1E1E1E]">
              {(["en", "ua", "ru"] as const).map((language) => (
                <Link
                  key={language}
                  to={langSwitchPath(language)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-[13px] no-underline ${i18n.language === language ? "font-bold text-accent-dim" : "font-normal text-dimmer"}`}
                >
                  {t(`langSwitcher.${language}`)}
                </Link>
              ))}
            </div>

            <a
              href="https://github.com/oleksandr-zhynzher/nomad-lens"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 py-3 text-sm text-muted no-underline"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
                />
              </svg>
              {t("nav.github")}
            </a>
          </div>
        </div>
      )}

      <main
        className={activeView === "compare" ? "" : "mx-auto w-full max-w-7xl px-4 pb-4 md:pb-6"}
      >
        {children}
      </main>

      <footer className="mt-16 border-t px-4 py-6 text-center text-xs border-border text-dim">
        {t("footer.data")}
      </footer>
    </div>
  );
}

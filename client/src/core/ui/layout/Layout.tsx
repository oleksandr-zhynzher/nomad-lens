import { type ReactNode, useEffect, useRef, useState } from "react";
import { BarChart3, List, Map, Menu, Palmtree, Plane, Wallet, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLangPrefix } from "@core/hooks";
import { LogoMark } from "./LogoMark";
import { LANG_OPTIONS } from "@core/utils";
import { INFO_PAGES } from "@core/utils";
import {
  navigateToView,
  makeClickOutsideHandler,
  computeLangSwitchPath,
  computeActiveView,
  type NavView,
} from "./layout.utils";
import {
  headerNavBtnClass,
  headerNavLinkClass,
  mobileNavBtnClass,
  mobileNavLinkClass,
} from "./layout.styles";

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
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const langSwitchPath = (targetLang: string) =>
    computeLangSwitchPath(targetLang, pathname, langPrefix, search);

  useEffect(() => {
    if (!langDropdownOpen) return;
    const handler = makeClickOutsideHandler(langRef, () => {
      setLangDropdownOpen(false);
    });
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
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
            <div className="flex gap-1 rounded-md bg-surface-4 p-1">
              <button
                onClick={() => {
                  handleViewClick("list");
                }}
                className={headerNavBtnClass(activeView === "list")}
              >
                <List size={16} />
                {t("views.list")}
              </button>
              <button
                onClick={() => {
                  handleViewClick("map");
                }}
                className={headerNavBtnClass(activeView === "map")}
              >
                <Map size={16} />
                {t("views.map")}
              </button>
              <button
                onClick={() => {
                  handleViewClick("compare");
                }}
                className={headerNavBtnClass(activeView === "compare")}
              >
                <BarChart3 size={16} />
                {t("views.compare")}
              </button>
              <Link
                to={`${langPrefix}/nomad-visas`}
                className={headerNavLinkClass(pathname.endsWith("/nomad-visas"))}
              >
                <Plane size={16} />
                {t("nav.nomadVisas")}
              </Link>
              <Link
                to={`${langPrefix}/budget-matcher`}
                className={headerNavLinkClass(pathname.endsWith("/budget-matcher"))}
              >
                <Wallet size={16} />
                {t("nav.budgetMatcher")}
              </Link>
              <Link
                to={`${langPrefix}/tourism`}
                className={headerNavLinkClass(pathname.endsWith("/tourism"))}
              >
                <Palmtree size={16} />
                {t("nav.tourism", "Tourism")}
              </Link>
            </div>

            <div ref={langRef} className="relative flex items-center">
              <button
                onClick={() => {
                  setLangDropdownOpen((previous) => !previous);
                }}
                className={`inline-flex h-8 min-w-8 cursor-pointer items-center justify-center border-none bg-transparent px-1.5 text-xs leading-none font-bold tracking-[1px] ${langDropdownOpen ? "text-accent-dim" : "text-dimmer"}`}
              >
                {currentLang.code.toUpperCase()}
              </button>

              {langDropdownOpen ? (
                <div className="absolute top-[calc(100%+6px)] left-1/2 z-50 -translate-x-1/2 overflow-hidden rounded-lg border border-[#252525] bg-[#111111] shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
                  {LANG_OPTIONS.filter((option) => option.code !== i18n.language).map(
                    (option, index) => (
                      <Link
                        key={option.code}
                        to={langSwitchPath(option.code)}
                        onClick={() => {
                          setLangDropdownOpen(false);
                        }}
                        className={`flex h-8 min-w-14 items-center justify-center px-4 text-xs leading-none font-semibold tracking-[1px] text-muted no-underline ${index === 0 ? "" : "border-t border-[#1E1E1E]"}`}
                      >
                        {option.code.toUpperCase()}
                      </Link>
                    ),
                  )}
                </div>
              ) : null}
            </div>

            <a
              href="https:/github.com/oleksandr-zhynzher/nomad-lens"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-slate-200"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                xmlns="http:/www.w3.org/2000/svg"
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

      {mobileMenuOpen ? (
        <div className="fixed inset-x-0 top-14 bottom-0 z-40 bg-[#0D0E10] px-3 pb-3 md:hidden">
          <button
            type="button"
            aria-label={t("a11y.closeMenu", "Close menu")}
            className="absolute inset-0"
            onClick={() => {
              setMobileMenuOpen(false);
            }}
          />
          <div className="relative flex max-h-full flex-col gap-1 overflow-y-auto rounded-2xl border border-[#252525] px-4 py-4 shadow-[0_20px_48px_rgba(0,0,0,0.45)] [background:linear-gradient(180deg,rgba(20,20,22,0.98)_0%,rgba(13,14,16,0.98)_100%)]">
            <p className="mb-1 text-[10px] font-semibold tracking-[1.5px] text-dimmest uppercase">
              {t("views.viewLabel")}
            </p>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  handleViewClick("list");
                }}
                className={mobileNavBtnClass(activeView === "list")}
              >
                <List size={16} />
                {t("views.list")}
              </button>
              <button
                onClick={() => {
                  handleViewClick("map");
                }}
                className={mobileNavBtnClass(activeView === "map")}
              >
                <Map size={16} />
                {t("views.map")}
              </button>
              <button
                onClick={() => {
                  handleViewClick("compare");
                }}
                className={mobileNavBtnClass(activeView === "compare")}
              >
                <BarChart3 size={16} />
                {t("views.compare")}
              </button>
              <Link
                to={`${langPrefix}/nomad-visas`}
                onClick={() => {
                  setMobileMenuOpen(false);
                }}
                className={mobileNavLinkClass(pathname.endsWith("/nomad-visas"))}
              >
                <Plane size={16} />
                {t("nav.nomadVisas")}
              </Link>
              <Link
                to={`${langPrefix}/budget-matcher`}
                onClick={() => {
                  setMobileMenuOpen(false);
                }}
                className={mobileNavLinkClass(pathname.endsWith("/budget-matcher"))}
              >
                <Wallet size={16} />
                {t("nav.budgetMatcher")}
              </Link>
              <Link
                to={`${langPrefix}/tourism`}
                onClick={() => {
                  setMobileMenuOpen(false);
                }}
                className={mobileNavLinkClass(pathname.endsWith("/tourism"))}
              >
                <Palmtree size={16} />
                {t("nav.tourism", "Tourism")}
              </Link>
            </div>

            <div className="flex items-center gap-3 border-b border-[#1E1E1E] py-3">
              {(["en", "ua", "ru"] as const).map((language) => (
                <Link
                  key={language}
                  to={langSwitchPath(language)}
                  onClick={() => {
                    setMobileMenuOpen(false);
                  }}
                  className={`text-[13px] no-underline ${i18n.language === language ? "font-bold text-accent-dim" : "font-normal text-dimmer"}`}
                >
                  {t(`langSwitcher.${language}`)}
                </Link>
              ))}
            </div>

            <a
              href="https:/github.com/oleksandr-zhynzher/nomad-lens"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 py-3 text-sm text-muted no-underline"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                xmlns="http:/www.w3.org/2000/svg"
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
      ) : null}

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

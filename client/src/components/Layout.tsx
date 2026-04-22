import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  BarChart3,
  List,
  Map,
  Menu,
  Palmtree,
  Plane,
  Wallet,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLangPrefix } from "../hooks/useLangPrefix";
import { LogoMark } from "./LogoMark";

interface LayoutProps {
  children: ReactNode;
  activePage?:
    | "data-sources"
    | "indicators"
    | "ai-indicators"
    | "budget-categories";
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

  const LANG_OPTIONS = [
    { code: "en" as const, label: "English" },
    { code: "ua" as const, label: "Українська" },
    { code: "ru" as const, label: "Русский" },
  ];

  const currentLang =
    LANG_OPTIONS.find((language) => language.code === i18n.language) ??
    LANG_OPTIONS[0];

  const INFO_PAGES = [
    "/indicators",
    "/data-sources",
    "/nomad-visas",
    "/budget-matcher",
    "/ai-indicators",
    "/budget-categories",
    "/tourism",
  ];
  const isInfoPage = INFO_PAGES.some((pagePath) => pathname.endsWith(pagePath));

  const activeView: "list" | "map" | "compare" | null = pathname.endsWith(
    "/map",
  )
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
    <div
      className="min-h-screen flex flex-col text-slate-100"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <header
        className="sticky top-0 z-30 border-b"
        style={{
          backgroundColor: "#0D0E10",
          borderColor: "#252525",
          height: "56px",
        }}
      >
        <div className="mx-auto flex h-full w-full max-w-[1200px] items-center justify-between px-4">
          <button
            onClick={() => handleViewClick("list")}
            className="flex items-center gap-2.5 leading-none"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              height: "32px",
              marginTop: "-4px",
            }}
          >
            <LogoMark size={32} />
            <span
              style={{
                fontFamily: "Oswald, sans-serif",
                fontSize: "20px",
                fontWeight: 700,
                letterSpacing: "2px",
                lineHeight: 1,
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                height: "32px",
                marginTop: "-4px",
              }}
            >
              NOMAD LENS
            </span>
          </button>

          <div className="hidden items-center gap-4 md:flex">
            <div
              className="flex rounded-md p-1"
              style={{ backgroundColor: "#2A2A2A", gap: "4px" }}
            >
              <button
                onClick={() => handleViewClick("list")}
                className="header-nav-item flex items-center gap-1.5 rounded px-3 py-1.5 transition-colors"
                data-active={activeView === "list" ? "true" : undefined}
                style={{
                  backgroundColor:
                    activeView === "list"
                      ? "var(--color-accent)"
                      : "transparent",
                  color: activeView === "list" ? "#FFFFFF" : "#9E9E9E",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  fontWeight: activeView === "list" ? 500 : 400,
                }}
              >
                <List size={16} />
                {t("views.list")}
              </button>
              <button
                onClick={() => handleViewClick("map")}
                className="header-nav-item flex items-center gap-1.5 rounded px-3 py-1.5 transition-colors"
                data-active={activeView === "map" ? "true" : undefined}
                style={{
                  backgroundColor:
                    activeView === "map"
                      ? "var(--color-accent)"
                      : "transparent",
                  color: activeView === "map" ? "#FFFFFF" : "#9E9E9E",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  fontWeight: activeView === "map" ? 500 : 400,
                }}
              >
                <Map size={16} />
                {t("views.map")}
              </button>
              <button
                onClick={() => handleViewClick("compare")}
                className="header-nav-item flex items-center gap-1.5 rounded px-3 py-1.5 transition-colors"
                data-active={activeView === "compare" ? "true" : undefined}
                style={{
                  backgroundColor:
                    activeView === "compare"
                      ? "var(--color-accent)"
                      : "transparent",
                  color: activeView === "compare" ? "#FFFFFF" : "#9E9E9E",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  fontWeight: activeView === "compare" ? 500 : 400,
                }}
              >
                <BarChart3 size={16} />
                {t("views.compare")}
              </button>
              <Link
                to={`${langPrefix}/nomad-visas`}
                className="header-nav-item flex items-center gap-1.5 rounded px-3 py-1.5 transition-colors"
                data-active={
                  pathname.endsWith("/nomad-visas") ? "true" : undefined
                }
                style={{
                  backgroundColor: pathname.endsWith("/nomad-visas")
                    ? "var(--color-accent)"
                    : "transparent",
                  color: pathname.endsWith("/nomad-visas")
                    ? "#FFFFFF"
                    : "#9E9E9E",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  fontWeight: pathname.endsWith("/nomad-visas") ? 500 : 400,
                  textDecoration: "none",
                }}
              >
                <Plane size={16} />
                {t("nav.nomadVisas")}
              </Link>
              <Link
                to={`${langPrefix}/budget-matcher`}
                className="header-nav-item flex items-center gap-1.5 rounded px-3 py-1.5 transition-colors"
                data-active={
                  pathname.endsWith("/budget-matcher") ? "true" : undefined
                }
                style={{
                  backgroundColor: pathname.endsWith("/budget-matcher")
                    ? "var(--color-accent)"
                    : "transparent",
                  color: pathname.endsWith("/budget-matcher")
                    ? "#FFFFFF"
                    : "#9E9E9E",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  fontWeight: pathname.endsWith("/budget-matcher") ? 500 : 400,
                  textDecoration: "none",
                }}
              >
                <Wallet size={16} />
                {t("nav.budgetMatcher")}
              </Link>
              <Link
                to={`${langPrefix}/tourism`}
                className="header-nav-item flex items-center gap-1.5 rounded px-3 py-1.5 transition-colors"
                data-active={pathname.endsWith("/tourism") ? "true" : undefined}
                style={{
                  backgroundColor: pathname.endsWith("/tourism")
                    ? "var(--color-accent)"
                    : "transparent",
                  color: pathname.endsWith("/tourism") ? "#FFFFFF" : "#9E9E9E",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  fontWeight: pathname.endsWith("/tourism") ? 500 : 400,
                  textDecoration: "none",
                }}
              >
                <Palmtree size={16} />
                {t("nav.tourism", "Tourism")}
              </Link>
            </div>

            <div
              ref={langRef}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <button
                onClick={() => setLangDropdownOpen((previous) => !previous)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  lineHeight: 1,
                  color: langDropdownOpen ? "#C2956A" : "#808080",
                  minWidth: "32px",
                  height: "32px",
                  padding: "0 6px",
                }}
              >
                {currentLang.code.toUpperCase()}
              </button>

              {langDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "#111111",
                    border: "1px solid #252525",
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                    zIndex: 50,
                  }}
                >
                  {LANG_OPTIONS.filter(
                    (option) => option.code !== i18n.language,
                  ).map((option, index) => (
                    <Link
                      key={option.code}
                      to={langSwitchPath(option.code)}
                      onClick={() => setLangDropdownOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: "56px",
                        height: "32px",
                        padding: "0 16px",
                        textDecoration: "none",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "12px",
                        fontWeight: 600,
                        letterSpacing: "1px",
                        lineHeight: 1,
                        color: "#9E9E9E",
                        borderTop: index === 0 ? "none" : "1px solid #1E1E1E",
                      }}
                    >
                      {option.code.toUpperCase()}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <a
              href="https://github.com/oleksandr-zhynzher/nomad-lens"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-slate-200"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                color: "#9E9E9E",
              }}
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
            className="flex items-center justify-center md:hidden"
            style={{ width: "40px", height: "40px", color: "#9E9E9E" }}
            onClick={() => setMobileMenuOpen((previous) => !previous)}
            aria-label={t("a11y.toggleMenu", "Toggle menu")}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div
          className="fixed inset-x-0 top-14 bottom-0 z-40 px-3 pb-3 md:hidden"
          style={{ backgroundColor: "#0D0E10" }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="flex max-h-full flex-col gap-1 overflow-y-auto rounded-2xl border px-4 py-4"
            style={{
              background:
                "linear-gradient(180deg, rgba(20,20,22,0.98) 0%, rgba(13,14,16,0.98) 100%)",
              borderColor: "#252525",
              boxShadow: "0 20px 48px rgba(0,0,0,0.45)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "#757575",
                marginBottom: "4px",
              }}
            >
              {t("views.viewLabel")}
            </p>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => handleViewClick("list")}
                className="flex items-center justify-center gap-1.5 rounded px-3 py-2 transition-colors"
                style={{
                  backgroundColor:
                    activeView === "list" ? "var(--color-accent)" : "#2A2A2A",
                  color: activeView === "list" ? "#FFFFFF" : "#9E9E9E",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  fontWeight: activeView === "list" ? 500 : 400,
                }}
              >
                <List size={16} />
                {t("views.list")}
              </button>
              <button
                onClick={() => handleViewClick("map")}
                className="flex items-center justify-center gap-1.5 rounded px-3 py-2 transition-colors"
                style={{
                  backgroundColor:
                    activeView === "map" ? "var(--color-accent)" : "#2A2A2A",
                  color: activeView === "map" ? "#FFFFFF" : "#9E9E9E",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  fontWeight: activeView === "map" ? 500 : 400,
                }}
              >
                <Map size={16} />
                {t("views.map")}
              </button>
              <button
                onClick={() => handleViewClick("compare")}
                className="flex items-center justify-center gap-1.5 rounded px-3 py-2 transition-colors"
                style={{
                  backgroundColor:
                    activeView === "compare"
                      ? "var(--color-accent)"
                      : "#2A2A2A",
                  color: activeView === "compare" ? "#FFFFFF" : "#9E9E9E",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  fontWeight: activeView === "compare" ? 500 : 400,
                }}
              >
                <BarChart3 size={16} />
                {t("views.compare")}
              </button>
              <Link
                to={`${langPrefix}/nomad-visas`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 rounded px-3 py-2 transition-colors"
                style={{
                  backgroundColor: pathname.endsWith("/nomad-visas")
                    ? "var(--color-accent)"
                    : "#2A2A2A",
                  color: pathname.endsWith("/nomad-visas")
                    ? "#FFFFFF"
                    : "#9E9E9E",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  fontWeight: pathname.endsWith("/nomad-visas") ? 500 : 400,
                  textDecoration: "none",
                }}
              >
                <Plane size={16} />
                {t("nav.nomadVisas")}
              </Link>
              <Link
                to={`${langPrefix}/budget-matcher`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 rounded px-3 py-2 transition-colors"
                style={{
                  backgroundColor: pathname.endsWith("/budget-matcher")
                    ? "var(--color-accent)"
                    : "#2A2A2A",
                  color: pathname.endsWith("/budget-matcher")
                    ? "#FFFFFF"
                    : "#9E9E9E",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  fontWeight: pathname.endsWith("/budget-matcher") ? 500 : 400,
                  textDecoration: "none",
                }}
              >
                <Wallet size={16} />
                {t("nav.budgetMatcher")}
              </Link>
              <Link
                to={`${langPrefix}/tourism`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 rounded px-3 py-2 transition-colors"
                style={{
                  backgroundColor: pathname.endsWith("/tourism")
                    ? "var(--color-accent)"
                    : "#2A2A2A",
                  color: pathname.endsWith("/tourism") ? "#FFFFFF" : "#9E9E9E",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  fontWeight: pathname.endsWith("/tourism") ? 500 : 400,
                  textDecoration: "none",
                }}
              >
                <Palmtree size={16} />
                {t("nav.tourism", "Tourism")}
              </Link>
            </div>

            <div
              className="flex items-center gap-3 py-3"
              style={{ borderBottom: "1px solid #1E1E1E" }}
            >
              {(["en", "ua", "ru"] as const).map((language) => (
                <Link
                  key={language}
                  to={langSwitchPath(language)}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "13px",
                    fontWeight: i18n.language === language ? 700 : 400,
                    color: i18n.language === language ? "#C2956A" : "#808080",
                    textDecoration: "none",
                  }}
                >
                  {t(`langSwitcher.${language}`)}
                </Link>
              ))}
            </div>

            <a
              href="https://github.com/oleksandr-zhynzher/nomad-lens"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 py-3"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                color: "#9E9E9E",
                textDecoration: "none",
              }}
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
        className={
          activeView === "compare"
            ? ""
            : "mx-auto w-full max-w-7xl px-4 pb-4 md:pb-6"
        }
      >
        {children}
      </main>

      <footer
        className="mt-16 border-t px-4 py-6 text-center text-xs"
        style={{ borderColor: "#333333", color: "#8A8A8A" }}
      >
        {t("footer.data")}
      </footer>
    </div>
  );
}

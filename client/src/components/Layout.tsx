import { type ReactNode, useEffect, useRef, useState } from "react";
import { BarChart3, List, Map, Menu, Plane, Wallet, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLangPrefix } from "../hooks/useLangPrefix";

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

  /** Strip current lang prefix from pathname, then prepend the target one */
  const langSwitchPath = (targetLang: string) => {
    // Remove current lang prefix (/ua or /ru) from the start of the path
    let rest = pathname;
    if (langPrefix && rest.startsWith(langPrefix)) {
      rest = rest.slice(langPrefix.length) || "/";
    }
    const prefix = targetLang === "en" ? "" : `/${targetLang}`;
    return `${prefix}${rest}${search}`;
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    }
    if (langDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [langDropdownOpen]);

  const LANG_OPTIONS = [
    { code: "en" as const, flagCode: "gb", label: "English" },
    { code: "ua" as const, flagCode: "ua", label: "Українська" },
    { code: "ru" as const, flagCode: "ru", label: "Русский" },
  ];

  const currentLang =
    LANG_OPTIONS.find((l) => l.code === i18n.language) ?? LANG_OPTIONS[0];

  const INFO_PAGES = [
    "/indicators",
    "/data-sources",
    "/nomad-visas",
    "/budget-matcher",
    "/ai-indicators",
    "/budget-categories",
  ];
  const isInfoPage = INFO_PAGES.some((p) => pathname.endsWith(p));

  const activeView: "list" | "map" | "compare" | null = pathname.endsWith(
    "/map",
  )
    ? "map"
    : pathname.endsWith("/compare")
      ? "compare"
      : isInfoPage
        ? null
        : "list";

  const showViewToggle = !isInfoPage;

  const handleViewClick = (v: "list" | "map" | "compare") => {
    if (v === "list") {
      navigate(langPrefix || "/");
    } else {
      navigate(`${langPrefix}/${v}`);
    }
    setMobileMenuOpen(false);
  };
  return (
    <div
      className="min-h-screen text-slate-100 flex flex-col"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <header
        className="border-b sticky top-0 z-30"
        style={{
          backgroundColor: "#0D0E10",
          borderColor: "#252525",
          height: "56px",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleViewClick("list")}
            className="flex items-center gap-2.5"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer compass circle */}
              <circle
                cx="16"
                cy="16"
                r="15"
                stroke="#8F5A3C"
                strokeWidth="1.5"
                fill="none"
                opacity="0.6"
              />

              {/* Compass needle - North (pointing up) */}
              <path d="M16 4 L20 16 L16 14 L12 16 Z" fill="#C2956A" />

              {/* Compass needle - South (pointing down) */}
              <path
                d="M16 28 L12 16 L16 18 L20 16 Z"
                fill="#8F5A3C"
                opacity="0.7"
              />

              {/* Center pivot point */}
              <circle cx="16" cy="16" r="2.5" fill="#C8B89A" />
              <circle cx="16" cy="16" r="1" fill="#0D0E10" />

              {/* Cardinal direction markers */}
              <line
                x1="16"
                y1="1"
                x2="16"
                y2="3"
                stroke="#C2956A"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="16"
                y1="29"
                x2="16"
                y2="31"
                stroke="#C2956A"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="1"
                y1="16"
                x2="3"
                y2="16"
                stroke="#C2956A"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="29"
                y1="16"
                x2="31"
                y2="16"
                stroke="#C2956A"
                strokeWidth="1.5"
                strokeLinecap="round"
              />

              {/* Subtle path/journey arc */}
              <path
                d="M 8 24 Q 12 20, 16 16 Q 20 12, 24 8"
                stroke="#C8B89A"
                strokeWidth="1"
                fill="none"
                opacity="0.4"
                strokeDasharray="2 2"
              />
            </svg>
            <span
              style={{
                fontFamily: "Oswald, sans-serif",
                fontSize: "20px",
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              NOMAD LENS
            </span>
          </button>

          {/* Desktop: right side nav links + view toggle + GitHub */}
          <div className="hidden md:flex items-center gap-4">
            {/* View toggle - segmented control */}
            <div
              className="flex rounded-md p-1"
              style={{ backgroundColor: "#2A2A2A", gap: "4px" }}
            >
              <button
                onClick={() => handleViewClick("list")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors"
                style={{
                  backgroundColor:
                    activeView === "list"
                      ? "var(--color-accent)"
                      : "transparent",
                  color: activeView === "list" ? "#FFFFFF" : "#999999",
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors"
                style={{
                  backgroundColor:
                    activeView === "map"
                      ? "var(--color-accent)"
                      : "transparent",
                  color: activeView === "map" ? "#FFFFFF" : "#999999",
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors"
                style={{
                  backgroundColor:
                    activeView === "compare"
                      ? "var(--color-accent)"
                      : "transparent",
                  color: activeView === "compare" ? "#FFFFFF" : "#999999",
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors"
                style={{
                  backgroundColor: pathname.endsWith("/nomad-visas")
                    ? "var(--color-accent)"
                    : "transparent",
                  color: pathname.endsWith("/nomad-visas")
                    ? "#FFFFFF"
                    : "#999999",
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors"
                style={{
                  backgroundColor: pathname.endsWith("/budget-matcher")
                    ? "var(--color-accent)"
                    : "transparent",
                  color: pathname.endsWith("/budget-matcher")
                    ? "#FFFFFF"
                    : "#999999",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  fontWeight: pathname.endsWith("/budget-matcher") ? 500 : 400,
                  textDecoration: "none",
                }}
              >
                <Wallet size={16} />
                {t("nav.budgetMatcher")}
              </Link>
            </div>

            {/* Language switcher – text button + dropdown */}
            <div style={{ position: "relative" }} ref={langRef}>
              <button
                onClick={() => setLangDropdownOpen((p) => !p)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  color: langDropdownOpen ? "#C2956A" : "#555555",
                  padding: "4px 2px",
                }}
              >
                {currentLang.code.toUpperCase()}
              </button>

              {langDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    right: 0,
                    backgroundColor: "#111111",
                    border: "1px solid #252525",
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                    zIndex: 50,
                  }}
                >
                  {LANG_OPTIONS.filter((o) => o.code !== i18n.language).map(
                    (opt, i) => (
                      <Link
                        key={opt.code}
                        to={langSwitchPath(opt.code)}
                        onClick={() => setLangDropdownOpen(false)}
                        style={{
                          display: "block",
                          padding: "8px 16px",
                          textDecoration: "none",
                          fontFamily: "Inter, sans-serif",
                          fontSize: "12px",
                          fontWeight: 600,
                          letterSpacing: "1px",
                          color: "#888888",
                          borderTop: i === 0 ? "none" : "1px solid #1E1E1E",
                        }}
                      >
                        {opt.code.toUpperCase()}
                      </Link>
                    ),
                  )}
                </div>
              )}
            </div>

            {/* GitHub link */}
            <a
              href="https://github.com/oleksandr-zhynzher/nomad-lens"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-slate-200 transition-colors"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                color: "#999999",
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

          {/* Mobile hamburger button */}
          <button
            className="md:hidden flex items-center justify-center"
            style={{ width: "40px", height: "40px", color: "#999999" }}
            onClick={() => setMobileMenuOpen((p) => !p)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-x-0 top-14 z-20"
          style={{
            backgroundColor: "#0D0E10",
            borderBottom: "1px solid #252525",
          }}
        >
          <div className="flex flex-col gap-1 px-4 py-3">
            {/* View toggle */}
            {showViewToggle && (
              <>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    color: "#444444",
                    marginBottom: "4px",
                  }}
                >
                  {t("views.viewLabel")}
                </p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    onClick={() => handleViewClick("list")}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded transition-colors"
                    style={{
                      backgroundColor:
                        activeView === "list"
                          ? "var(--color-accent)"
                          : "#2A2A2A",
                      color: activeView === "list" ? "#FFFFFF" : "#999999",
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
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded transition-colors"
                    style={{
                      backgroundColor:
                        activeView === "map"
                          ? "var(--color-accent)"
                          : "#2A2A2A",
                      color: activeView === "map" ? "#FFFFFF" : "#999999",
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
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded transition-colors"
                    style={{
                      backgroundColor:
                        activeView === "compare"
                          ? "var(--color-accent)"
                          : "#2A2A2A",
                      color: activeView === "compare" ? "#FFFFFF" : "#999999",
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
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded transition-colors"
                    style={{
                      backgroundColor: pathname.endsWith("/nomad-visas")
                        ? "var(--color-accent)"
                        : "#2A2A2A",
                      color: pathname.endsWith("/nomad-visas")
                        ? "#FFFFFF"
                        : "#999999",
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
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded transition-colors"
                    style={{
                      backgroundColor: pathname.endsWith("/budget-matcher")
                        ? "var(--color-accent)"
                        : "#2A2A2A",
                      color: pathname.endsWith("/budget-matcher")
                        ? "#FFFFFF"
                        : "#999999",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "13px",
                      fontWeight: pathname.endsWith("/budget-matcher")
                        ? 500
                        : 400,
                      textDecoration: "none",
                    }}
                  >
                    <Wallet size={16} />
                    {t("nav.budgetMatcher")}
                  </Link>
                </div>
              </>
            )}

            {/* Language switcher */}
            <div
              className="flex items-center gap-3 py-3"
              style={{ borderBottom: "1px solid #1E1E1E" }}
            >
              {(["en", "ua", "ru"] as const).map((lng) => (
                <Link
                  key={lng}
                  to={langSwitchPath(lng)}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "13px",
                    fontWeight: i18n.language === lng ? 700 : 400,
                    color: i18n.language === lng ? "#C2956A" : "#555555",
                    textDecoration: "none",
                  }}
                >
                  {t(`langSwitcher.${lng}`)}
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
                color: "#999999",
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
            : "w-full max-w-7xl mx-auto px-4 py-4 md:py-6"
        }
      >
        {children}
      </main>

      <footer
        className="border-t mt-16 py-6 text-center text-xs px-4"
        style={{ borderColor: "#333333", color: "#666666" }}
      >
        {t("footer.data")}
      </footer>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface InfoPageHeaderProps {
  activePage: "data-sources" | "indicators";
}

export function InfoPageHeader({ activePage }: InfoPageHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <header
      className="border-b sticky top-0 z-30"
      style={{ backgroundColor: "#0D0E10", borderColor: "#252525" }}
    >
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between"
        style={{ height: "56px" }}
      >
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5"
          style={{ textDecoration: "none" }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="16"
              cy="16"
              r="15"
              stroke="#8F5A3C"
              strokeWidth="1.5"
              fill="none"
              opacity="0.6"
            />
            <path d="M16 4 L20 16 L16 14 L12 16 Z" fill="#C2956A" />
            <path
              d="M16 28 L12 16 L16 18 L20 16 Z"
              fill="#8F5A3C"
              opacity="0.7"
            />
            <circle cx="16" cy="16" r="2.5" fill="#C8B89A" />
            <circle cx="16" cy="16" r="1" fill="#0D0E10" />
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
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "#FFFFFF",
            }}
          >
            NOMAD LENS
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          <nav style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <Link
              to="/indicators"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                fontWeight: activePage === "indicators" ? 600 : "normal",
                color: activePage === "indicators" ? "#C2956A" : "#666666",
                textDecoration: "none",
              }}
            >
              {t("nav.indicators")}
            </Link>
            <Link
              to="/data-sources"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                fontWeight: activePage === "data-sources" ? 600 : "normal",
                color: activePage === "data-sources" ? "#C2956A" : "#666666",
                textDecoration: "none",
              }}
            >
              {t("nav.dataSources")}
            </Link>
          </nav>
          <div className="h-6 w-px" style={{ backgroundColor: "#252525" }} />
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

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex items-center justify-center"
          style={{ width: "44px", height: "44px", color: "#CCCCCC" }}
          onClick={() => setMobileMenuOpen((o) => !o)}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div
          className="md:hidden flex flex-col gap-1 px-4 pb-3"
          style={{ backgroundColor: "#0D0E10", borderTop: "1px solid #1C1C1C" }}
        >
          <Link
            to="/indicators"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2.5"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: activePage === "indicators" ? 600 : "normal",
              color: activePage === "indicators" ? "#C2956A" : "#999999",
              textDecoration: "none",
            }}
          >
            {t("nav.indicators")}
          </Link>
          <Link
            to="/data-sources"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2.5"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: activePage === "data-sources" ? 600 : "normal",
              color: activePage === "data-sources" ? "#C2956A" : "#999999",
              textDecoration: "none",
            }}
          >
            {t("nav.dataSources")}
          </Link>
          <a
            href="https://github.com/oleksandr-zhynzher/nomad-lens"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 py-2.5"
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
      )}
    </header>
  );
}

import { Link } from "react-router-dom";

interface InfoPageHeaderProps {
  activePage: "data-sources" | "indicators";
}

export function InfoPageHeader({ activePage }: InfoPageHeaderProps) {
  return (
    <header
      style={{
        height: "56px",
        backgroundColor: "#111111",
        borderBottom: "1px solid #1E1E1E",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          textDecoration: "none",
        }}
      >
        {/* Globe mark */}
        <div
          style={{
            width: "24px",
            height: "24px",
            backgroundColor: "#8F5A3C",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </div>
        {/* Logo text */}
        <span
          style={{
            fontFamily: "Anton, sans-serif",
            fontSize: "18px",
            letterSpacing: "2px",
            color: "#FFFFFF",
          }}
        >
          NOMAD LENS
        </span>
        {/* Beta badge */}
        <span
          style={{
            backgroundColor: "#1C1C1C",
            border: "1px solid #333333",
            borderRadius: "3px",
            padding: "2px 6px",
            fontFamily: "Geist, sans-serif",
            fontSize: "9px",
            fontWeight: 600,
            letterSpacing: "1px",
            color: "#8F5A3C",
          }}
        >
          BETA
        </span>
      </Link>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Nav links */}
      <nav style={{ display: "flex", alignItems: "center", gap: "28px", marginRight: "24px" }}>
        <Link
          to="/data-sources"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            fontWeight: activePage === "data-sources" ? 600 : "normal",
            color: activePage === "data-sources" ? "#C2956A" : "#555555",
            textDecoration: "none",
          }}
        >
          Data Sources
        </Link>
        <Link
          to="/indicators"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            fontWeight: activePage === "indicators" ? 600 : "normal",
            color: activePage === "indicators" ? "#C2956A" : "#555555",
            textDecoration: "none",
          }}
        >
          Indicators
        </Link>
      </nav>

      {/* Divider */}
      <div style={{ width: "1px", height: "20px", backgroundColor: "#252525", marginRight: "0px" }} />

      {/* GitHub link */}
      <a
        href="https://github.com/oleksandr-zhynzher/nomad-lens"
        target="_blank"
        rel="noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "0 16px",
          fontFamily: "Inter, sans-serif",
          fontSize: "13px",
          color: "#666666",
          textDecoration: "none",
        }}
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="#666666" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
        GitHub
      </a>
    </header>
  );
}

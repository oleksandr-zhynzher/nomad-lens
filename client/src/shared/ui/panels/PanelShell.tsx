import type { ReactNode, RefObject } from "react";
import { useTranslation } from "react-i18next";

interface PanelShellProps {
  title: string;
  subtitle?: string;
  /** Extra content rendered in the header below the title/subtitle (e.g. a mode toggle). */
  headerExtra?: ReactNode;
  /**
   * Footer content rendered above the reset button.
   * Use this for share buttons or other contextual actions.
   */
  footerExtra?: ReactNode;
  onReset: () => void;
  mobile?: boolean;
  children: ReactNode;
  scrollRef?: RefObject<HTMLDivElement>;
  onScroll?: () => void;
}

/**
 * Shared shell for all preference/weight panels.
 *
 * Provides the outer aside, optional desktop header, scrollable body,
 * and a sticky footer with an optional action slot + reset button.
 */
export function PanelShell({
  title,
  subtitle,
  headerExtra,
  footerExtra,
  onReset,
  mobile,
  children,
  scrollRef,
  onScroll,
}: PanelShellProps) {
  const { t } = useTranslation();

  return (
    <aside
      className={`flex flex-col overflow-hidden${mobile ? " flex-1 min-h-0" : ""}`}
      style={{
        backgroundColor: "#1A1A1A",
        width: mobile ? "100%" : "340px",
        height: mobile ? undefined : "100%",
      }}
    >
      {!mobile && (
        <div
          className="flex-shrink-0"
          style={{ padding: "14px 16px", borderBottom: "1px solid #2A2A2A" }}
        >
          <h2
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "#FFFFFF",
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "10px",
                color: "#8A8A8A",
                marginTop: "6px",
                lineHeight: "1.5",
              }}
            >
              {subtitle}
            </p>
          )}
          {headerExtra}
        </div>
      )}

      <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto auto-scrollbar">
        {children}
      </div>

      <div
        className="flex-shrink-0 sticky bottom-0"
        style={{ borderTop: "1px solid #333333", backgroundColor: "#1A1A1A" }}
      >
        <div className="flex flex-col gap-2" style={{ padding: "12px 16px" }}>
          {footerExtra}
          <button
            type="button"
            onClick={onReset}
            className="button-hover-exempt weight-panel-reset-button w-full flex items-center justify-center gap-2 rounded transition-colors"
            style={{
              backgroundColor: "transparent",
              color: "var(--color-accent-dim)",
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: 500,
              height: "40px",
              border: "1px solid #333333",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            {t("weights.resetToDefaults", "Reset to defaults")}
          </button>
        </div>
      </div>
    </aside>
  );
}

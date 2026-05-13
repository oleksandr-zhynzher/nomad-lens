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
      className={`flex flex-col overflow-hidden bg-surface${mobile ? " flex-1 min-h-0 w-full" : " w-[340px] h-full"}`}
    >
      {!mobile && (
        <div className="flex-shrink-0 p-[14px_16px] border-b border-[#2A2A2A]">
          <h2 className="text-[13px] font-semibold tracking-[2px] uppercase text-white">{title}</h2>
          {subtitle && <p className="text-[10px] text-dim mt-1.5 leading-[1.5]">{subtitle}</p>}
          {headerExtra}
        </div>
      )}

      <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto auto-scrollbar">
        {children}
      </div>

      <div className="flex-shrink-0 sticky bottom-0 border-t border-border bg-surface">
        <div className="flex flex-col gap-2 px-4 py-3">
          {footerExtra}
          <button
            type="button"
            onClick={onReset}
            className="button-hover-exempt weight-panel-reset-button w-full flex items-center justify-center gap-2 rounded transition-colors bg-transparent text-accent-dim text-[13px] font-medium h-10 border border-border rounded-[6px] cursor-pointer"
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

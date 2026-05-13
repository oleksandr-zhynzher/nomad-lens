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
      className={`flex flex-col overflow-hidden bg-surface${mobile ? "min-h-0 w-full flex-1" : "h-full w-[340px]"}`}
    >
      {mobile ? null : (
        <div className="flex-shrink-0 border-b border-[#2A2A2A] p-[14px_16px]">
          <h2 className="text-[13px] font-semibold tracking-[2px] text-white uppercase">{title}</h2>
          {subtitle ? (
            <p className="mt-1.5 text-[10px] leading-[1.5] text-dim">{subtitle}</p>
          ) : null}
          {headerExtra}
        </div>
      )}

      <div ref={scrollRef} onScroll={onScroll} className="auto-scrollbar flex-1 overflow-y-auto">
        {children}
      </div>

      <div className="sticky bottom-0 flex-shrink-0 border-t border-border bg-surface">
        <div className="flex flex-col gap-2 px-4 py-3">
          {footerExtra}
          <button
            type="button"
            onClick={onReset}
            className="button-hover-exempt weight-panel-reset-button flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded rounded-[6px] border border-border bg-transparent text-[13px] font-medium text-accent-dim transition-colors"
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

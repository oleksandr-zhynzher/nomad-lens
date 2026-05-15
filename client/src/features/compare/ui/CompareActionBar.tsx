import { ArrowDownWideNarrow } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CompareActionBarProps {
  readonly showWeights: boolean;
  readonly onToggleWeights: () => void;
  readonly showSortAction: boolean;
  readonly sortFeedbackActive: boolean;
  readonly sortButtonLabel: string;
  readonly sortButtonIconClassName: string;
  readonly onSortByScore: () => void;
  readonly copied: boolean;
  readonly onShare: () => void;
  readonly actionGridClassName: string;
}

const MOBILE_VIEWPORT_MAX_WIDTH = 1024;

export function CompareActionBar({
  showWeights,
  onToggleWeights,
  showSortAction,
  sortFeedbackActive,
  sortButtonLabel,
  sortButtonIconClassName,
  onSortByScore,
  copied,
  onShare,
  actionGridClassName,
}: CompareActionBarProps) {
  const { t } = useTranslation();
  return (
    <div className="w-full sm:w-auto">
      <div className="w-full rounded-md border border-[#252525] bg-[#1A1A1A] p-1 sm:w-auto">
        <div className={`grid gap-1 sm:flex sm:w-auto ${actionGridClassName}`}>
          <button
            onClick={onToggleWeights}
            className={`flex min-w-0 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded px-3 py-2 text-center text-xs transition-colors sm:flex-initial sm:px-4 sm:py-1.5 ${showWeights && window.innerWidth > MOBILE_VIEWPORT_MAX_WIDTH ? "bg-accent font-medium text-white" : "bg-transparent font-normal text-dim"}`}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            {t("compare.parameters")}
          </button>
          {showSortAction ? (
            <button
              onClick={onSortByScore}
              className={`flex min-w-0 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded px-3 py-2 text-center text-xs leading-tight transition-all duration-150 ease-in-out sm:flex-initial sm:px-4 sm:py-1.5 ${sortFeedbackActive ? "bg-[#2A4A2A] font-medium text-[#88CC88]" : "bg-transparent font-normal text-dim"}`}
            >
              <ArrowDownWideNarrow
                size={16}
                className={`transition-transform ${sortButtonIconClassName}`}
              />
              {sortButtonLabel}
            </button>
          ) : null}
          <button
            onClick={onShare}
            className={`flex min-w-0 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded px-3 py-2 text-center text-xs transition-all duration-150 ease-in-out sm:flex-initial sm:px-4 sm:py-1.5 ${copied ? "bg-[#2A4A2A] font-medium text-[#88CC88]" : "bg-transparent font-normal text-dim"}`}
          >
            {copied ? (
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            )}
            {copied ? t("weights.linkCopied") : t("compare.share")}
          </button>
        </div>
      </div>
    </div>
  );
}

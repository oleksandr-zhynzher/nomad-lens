import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

interface BudgetShareSectionProps {
  readonly isDefault: boolean;
  readonly handleShare: () => void;
  readonly handleReset: () => void;
  readonly copied: boolean;
  readonly setCopied: Dispatch<SetStateAction<boolean>>;
}

export function BudgetShareSection({
  isDefault,
  handleShare,
  handleReset,
  copied,
  setCopied,
}: BudgetShareSectionProps) {
  const { t } = useTranslation();
  return (
    <div className="sticky bottom-0 flex-shrink-0 border-t border-border bg-[#131416]">
      <div className="flex flex-col gap-2 px-4 py-3">
        {isDefault ? null : (
          <button
            onClick={() => {
              handleShare();
              setCopied(true);
              setTimeout(() => {
                setCopied(false);
              }, 3000);
            }}
            aria-live="polite"
            className={`flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded rounded-md border text-[13px] font-medium transition-colors ${copied ? "border-[#4A8A4A] bg-[#2A4A2A] text-[#88CC88]" : "border-[#2A4A2A] bg-[#1A2A1A] text-[#6B9E6B]"}`}
          >
            {copied ? (
              <>
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {t("weights.linkCopied", "Link copied!")}
              </>
            ) : (
              <>
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
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                {t("weights.shareWeights", "Share weights")}
              </>
            )}
          </button>
        )}
        <button
          onClick={handleReset}
          className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded rounded-md border border-border bg-transparent text-[13px] font-medium text-accent-dim transition-colors"
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
  );
}

import { useState } from "react";
import { useTranslation } from "react-i18next";

interface WeightShareButtonProps {
  readonly onShare: () => void;
}

export function WeightShareButton({ onShare }: WeightShareButtonProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const shareWeights = () => {
    onShare();
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <button
      onClick={shareWeights}
      aria-live="polite"
      className={`button-hover-exempt weight-panel-share-button flex h-10 w-full items-center justify-center gap-2 rounded rounded-[6px] border text-[13px] font-medium transition-all duration-[150ms] ease-[ease] ${copied ? "border-[#4A8A4A] bg-[#2A4A2A] text-[#88CC88]" : "border-[#2A4A2A] bg-[#1A2A1A] text-[#6B9E6B]"}`}
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
          {t("weights.linkCopied")}
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
          {t("weights.shareWeights")}
        </>
      )}
    </button>
  );
}

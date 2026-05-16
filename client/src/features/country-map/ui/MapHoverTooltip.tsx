import { scoreColourClass } from "@core/utils";
import type React from "react";
import { useTranslation } from "react-i18next";

interface MapHoverTooltipProps {
  readonly name: string;
  readonly score: number | null;
  readonly x: number;
  readonly y: number;
}

export function MapHoverTooltip({ name, score, x, y }: MapHoverTooltipProps) {
  const { t } = useTranslation();
  return (
    <div
      className="pointer-events-none fixed top-[var(--tt-y)] left-[var(--tt-x)] z-50 rounded-[4px] bg-surface px-3 py-2 shadow-xl"
      style={{ "--tt-x": `${x + 12}px`, "--tt-y": `${y - 10}px` } as React.CSSProperties}
    >
      <p className="text-[13px] font-semibold text-white">{name}</p>
      {score === null ? (
        <p className="mt-0.5 text-xs text-dim">{t("map.noData")}</p>
      ) : (
        <p
          className={`mt-0.5 font-mono text-[13px] font-semibold ${scoreColourClass(score, "text")}`}
        >
          {score.toFixed(1)} <span className="font-normal text-dim">/ 100</span>
        </p>
      )}
    </div>
  );
}

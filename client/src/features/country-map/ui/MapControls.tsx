import type React from "react";
import { useTranslation } from "react-i18next";

interface MapZoomControlsProps {
  readonly zoom: number;
  readonly onZoomIn: () => void;
  readonly onZoomOut: () => void;
  readonly onToggleWeights?: () => void;
  readonly showWeights?: boolean;
}

export function MapZoomControls({
  onZoomIn,
  onZoomOut,
  onToggleWeights,
  showWeights,
}: MapZoomControlsProps) {
  const { t } = useTranslation();
  return (
    <div className="absolute top-2 left-2 z-10 flex flex-col overflow-hidden rounded-[4px] bg-surface md:top-3 md:left-3">
      <button
        onClick={onZoomIn}
        className="flex h-9 w-9 items-center justify-center border-b border-border text-lg leading-none font-bold text-muted transition-colors md:h-10 md:w-10"
        aria-label={t("a11y.zoomIn", "Zoom in")}
      >
        +
      </button>
      <button
        onClick={onZoomOut}
        className={`flex h-9 w-9 items-center justify-center text-lg leading-none font-bold text-muted transition-colors md:h-10 md:w-10 ${onToggleWeights ? "border-b border-border" : ""}`}
        aria-label={t("a11y.zoomOut", "Zoom out")}
      >
        −
      </button>
      {onToggleWeights ? (
        <button
          onClick={onToggleWeights}
          className={`hidden h-10 w-10 items-center justify-center transition-colors md:flex ${showWeights ? "text-accent-dim" : "text-[#999999]"}`}
          aria-label={t("a11y.toggleParameters", "Toggle parameters")}
        >
          <svg
            width="16"
            height="16"
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
        </button>
      ) : null}
    </div>
  );
}

interface LegendItem {
  color: string;
  label: string;
  range: string;
}

interface MapLegendProps {
  readonly items: LegendItem[];
  readonly scoreLabel: string;
}

export function MapLegend({ items, scoreLabel }: MapLegendProps) {
  return (
    <div className="absolute bottom-2 left-2 z-10 hidden rounded-[4px] bg-surface md:bottom-3 md:left-3 md:flex md:flex-col md:gap-1.5 md:px-3 md:py-2">
      <p className="mb-0.5 text-[9px] font-semibold tracking-[1.5px] text-dim uppercase">
        {scoreLabel}
      </p>
      {items.map(({ color, label, range }) => (
        <div key={label} className="flex items-center gap-2">
          <span
            className="h-3 w-3 shrink-0 rounded-[2px] bg-[var(--legend-c)]"
            style={{ "--legend-c": color } as React.CSSProperties}
          />
          <span className="font-mono text-[10px] text-tertiary">
            {label} <span className="text-dim">{range}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

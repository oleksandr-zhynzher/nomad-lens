import type { ReactNode } from "react";

interface WeightSliderRowProps {
  inputName: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  ariaLabel: string;
  /** Label node — can be plain text, a link, or anything inline. */
  label: ReactNode;
  /** Optional tooltip icon placed after the label. */
  tooltipIcon?: ReactNode;
  /** Value text shown on the right. Defaults to the numeric value. */
  displayValue?: string | number;
}

/** A labeled range slider row used throughout the weight/preference panels. */
export function WeightSliderRow({
  inputName,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  ariaLabel,
  label,
  tooltipIcon,
  displayValue,
}: WeightSliderRowProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const shown = displayValue ?? value;

  return (
    <div className="flex flex-col gap-[9px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {label}
          {tooltipIcon}
        </div>
        <span className="font-mono text-[11px] text-accent-dim">{shown}</span>
      </div>
      <input
        name={inputName}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${pct}%, #333333 ${pct}%, #333333 100%)`,
        }}
        aria-label={ariaLabel}
      />
    </div>
  );
}

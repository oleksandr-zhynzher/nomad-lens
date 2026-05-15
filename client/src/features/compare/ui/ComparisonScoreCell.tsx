import type React from "react";

interface ComparisonScoreCellProps {
  readonly value: number | null;
  readonly colour: string;
  readonly nullColour?: string;
  readonly format?: (v: number) => string;
  readonly fontSize?: string;
  readonly columnWidth: string;
}

export function ComparisonScoreCell({
  value,
  colour,
  nullColour,
  format,
  fontSize,
  columnWidth,
}: ComparisonScoreCellProps) {
  return (
    <div
      className="w-[var(--cw)] shrink-0 text-center"
      style={{ "--cw": columnWidth } as React.CSSProperties}
    >
      <span
        className={`font-mono [font-size:var(--fs)] font-semibold text-[var(--sc)]`}
        style={
          {
            "--fs": fontSize ?? "22px",
            "--sc": value == null ? (nullColour ?? "#333333") : colour,
          } as React.CSSProperties
        }
      >
        {value == null ? "—" : (format?.(value) ?? value.toFixed(1))}
      </span>
    </div>
  );
}

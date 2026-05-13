import React from "react";

interface Props {
  value: number | null;
  colour: string;
  nullColour?: string;
  format?: (v: number) => string;
  fontSize?: string;
  columnWidth: string;
}

export function ComparisonScoreCell({
  value,
  colour,
  nullColour,
  format,
  fontSize,
  columnWidth,
}: Props) {
  return (
    <div
      className="shrink-0 text-center w-[var(--cw)]"
      style={{ "--cw": columnWidth } as React.CSSProperties}
    >
      <span
        className={`font-mono font-semibold [font-size:var(--fs)] text-[var(--sc)]`}
        style={
          {
            "--fs": fontSize ?? "22px",
            "--sc": value != null ? colour : (nullColour ?? "#333333"),
          } as React.CSSProperties
        }
      >
        {value != null ? (format ? format(value) : value.toFixed(1)) : "—"}
      </span>
    </div>
  );
}

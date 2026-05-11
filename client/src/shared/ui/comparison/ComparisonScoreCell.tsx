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
    <div className="shrink-0 text-center" style={{ width: columnWidth }}>
      <span
        className="font-mono font-semibold"
        style={{
          fontSize: fontSize ?? "22px",
          color: value != null ? colour : (nullColour ?? "#333333"),
        }}
      >
        {value != null ? (format ? format(value) : value.toFixed(1)) : "—"}
      </span>
    </div>
  );
}

import { scoreColour } from "../../utils/scoring";
import { Tooltip } from "../../components/Tooltip";

interface ScoreDotProps {
  value: number | null;
  label: string;
  shape?: "circle" | "square";
}

export function ScoreDot({ value, label, shape = "circle" }: ScoreDotProps) {
  const color = scoreColour(value);
  const tooltipContent = (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}>
      <span style={{ fontSize: "11px", color: "#CCCCCC", fontFamily: "Inter, sans-serif" }}>
        {label}
      </span>
      <span
        style={{ fontSize: "11px", fontWeight: 700, fontFamily: "IBM Plex Mono, monospace", color }}
      >
        {value !== null ? value.toFixed(1) : "—"}
      </span>
    </div>
  );
  return (
    <Tooltip content={tooltipContent} side="top">
      <div
        role="img"
        aria-label={`${label}: ${value !== null ? value.toFixed(1) : "N/A"}`}
        style={{
          width: "12px",
          height: "12px",
          borderRadius: shape === "circle" ? "50%" : "2px",
          backgroundColor: color,
          cursor: "default",
        }}
      />
    </Tooltip>
  );
}

import { scoreColour } from "../../utils/scoring";
import { Tooltip } from "../../components/Tooltip";

interface ScoreDotProps {
  value: number | null;
  label: string;
  shape?: "circle" | "square";
}

/** A 12×12 coloured dot (or square) with a score tooltip. */
export function ScoreDot({ value, label, shape = "circle" }: ScoreDotProps) {
  const color = scoreColour(value);
  const tooltipContent = (
    <div style={{ padding: "4px 6px" }}>
      <span
        style={{
          fontSize: "11px",
          fontWeight: 700,
          fontFamily: "IBM Plex Mono, monospace",
          color,
        }}
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

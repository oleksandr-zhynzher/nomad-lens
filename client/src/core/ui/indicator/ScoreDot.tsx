import { Tooltip } from "@core/ui";
import { scoreColourClass } from "@core/utils";

interface ScoreDotProps {
  value: number | null;
  label: string;
  shape?: "circle" | "square";
}

export function ScoreDot({ value, label, shape = "circle" }: ScoreDotProps) {
  const tooltipContent = (
    <div className="flex items-center gap-1.5 whitespace-nowrap">
      <span className="text-[11px] text-tertiary">{label}</span>
      <span className={`font-mono text-[11px] font-bold ${scoreColourClass(value, "text")}`}>
        {value === null ? "—" : value.toFixed(1)}
      </span>
    </div>
  );
  return (
    <Tooltip content={tooltipContent} side="top">
      <div
        role="img"
        aria-label={`${label}: ${value === null ? "N/A" : value.toFixed(1)}`}
        className={`h-3 w-3 cursor-default ${shape === "circle" ? "rounded-full" : "rounded-sm"} ${scoreColourClass(value, "bg")}`}
      />
    </Tooltip>
  );
}

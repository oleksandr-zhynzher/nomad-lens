import { ScoreDot } from "./ScoreDot";

interface SparklineEntry {
  key: string;
  value: number | null;
  label: string;
  shape?: "circle" | "square";
}

interface ScoreSparklineProps {
  entries: SparklineEntry[];
}

/** A row of coloured score dots. Wraps in `hidden sm:flex gap-1 items-center`. */
export function ScoreSparkline({ entries }: ScoreSparklineProps) {
  return (
    <div className="hidden sm:flex gap-1 items-center">
      {entries.map(({ key, value, label, shape }) => (
        <ScoreDot key={key} value={value} label={label} shape={shape} />
      ))}
    </div>
  );
}

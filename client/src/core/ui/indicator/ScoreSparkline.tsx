import { ScoreDot } from "./ScoreDot";

interface SparklineEntry {
  readonly key: string;
  readonly value: number | null;
  readonly label: string;
  readonly shape?: "circle" | "square";
}

interface ScoreSparklineProps {
  readonly entries: readonly SparklineEntry[];
}

/** A row of coloured score dots. Wraps in `hidden sm:flex gap-1 items-center`. */
export function ScoreSparkline({ entries }: ScoreSparklineProps) {
  return (
    <div className="hidden items-center gap-1 sm:flex">
      {entries.map(({ key, value, label, shape }) => (
        <ScoreDot key={key} value={value} label={label} shape={shape} />
      ))}
    </div>
  );
}

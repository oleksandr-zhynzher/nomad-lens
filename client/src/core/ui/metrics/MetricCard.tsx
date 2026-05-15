import type { ReactNode } from "react";

interface MetricCardProps {
  readonly icon?: ReactNode;
  readonly label: string;
  readonly value: ReactNode;
  readonly valueClassName?: string;
  readonly variant?: "default" | "compact";
}

export function MetricCard({
  icon,
  label,
  value,
  valueClassName = "text-on-surface",
  variant = "default",
}: MetricCardProps) {
  if (variant === "compact") {
    return (
      <div className="flex flex-col gap-1 rounded bg-surface-2 p-2">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className={`font-mono text-sm font-bold ${valueClassName}`}>{value}</span>
        </div>
        <span className="text-[10px] text-dimmer">{label}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-[#1E1E1E] bg-[#111111] p-4">
      <div className="flex items-center gap-2.5">
        {icon}
        <span className={`font-mono text-xl font-bold ${valueClassName}`}>{value}</span>
      </div>
      <span className="text-[10px] text-dimmer">{label}</span>
    </div>
  );
}

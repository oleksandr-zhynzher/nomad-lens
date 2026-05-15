import type { ReactNode } from "react";

interface StatCardProps {
  readonly label: string;
  readonly value: ReactNode;
  readonly sub?: string;
  readonly valueClassName?: string;
}

export function StatCard({ label, value, sub, valueClassName }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded bg-surface-2 p-3">
      <span className="text-[11px] tracking-[1px] text-dim uppercase">{label}</span>
      <span className={`font-mono text-lg font-semibold text-on-surface ${valueClassName ?? ""}`}>
        {value}
      </span>
      {sub != null ? <span className="text-[10px] text-dimmer">{sub}</span> : null}
    </div>
  );
}

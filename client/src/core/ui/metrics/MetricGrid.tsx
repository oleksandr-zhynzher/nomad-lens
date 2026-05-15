import type { ReactNode } from "react";

interface MetricGridProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function MetricGrid({ children, className }: MetricGridProps) {
  return (
    <div
      className={`grid [grid-template-columns:repeat(auto-fill,minmax(130px,1fr))] gap-3 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

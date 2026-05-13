import type React from "react";

export const LABEL_STYLE = "text-[11px] font-semibold tracking-[0.8px] uppercase text-dimmest";
export const VALUE_MONO = "font-mono text-sm font-semibold text-white";
export const VALUE_TEXT = "text-[13px] text-tertiary";

export interface RowProps {
  readonly label: string;
  readonly children: React.ReactNode;
}

export function Row({ label, children }: RowProps) {
  return (
    <div className="grid grid-cols-[160px_1fr] items-stretch border-b border-[#1A1A1A]">
      <div className={`${LABEL_STYLE} flex shrink-0 items-center bg-[#111113] px-4 py-3.5`}>
        {label}
      </div>
      <div className="flex overflow-hidden">{children}</div>
    </div>
  );
}

export interface CellProps {
  readonly children: React.ReactNode;
  readonly count: number;
}

export function Cell({ children, count }: CellProps) {
  return (
    <div
      className="flex min-w-0 shrink-0 grow-0 items-center border-l border-[#1A1A1A] px-4 py-3.5"
      style={{ flex: `0 0 ${100 / count}%` }}
    >
      {children}
    </div>
  );
}

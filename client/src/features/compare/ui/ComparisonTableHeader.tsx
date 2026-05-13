import type React from "react";

interface ComparisonHeaderColumn {
  readonly key: string | number;
  readonly flagUrl?: string;
  readonly name: string;
  readonly maxNameWidth?: string;
}

interface Props {
  readonly ref?: React.Ref<HTMLDivElement>;
  readonly label: string;
  readonly columns: readonly ComparisonHeaderColumn[];
  readonly columnWidth: string;
  readonly gap?: string;
}

export function ComparisonTableHeader({ ref, label, columns, columnWidth, gap }: Props) {
  return (
    <div
      ref={ref}
      className="sticky top-14 z-10 overflow-x-auto bg-[#0F1114] [scrollbar-width:none] sm:top-[112px]"
    >
      <div
        className="flex items-center border-b border-[#1C1C1C] py-[14px]"
        style={
          gap !== undefined
            ? ({ "--th-gap": gap, gap: "var(--th-gap)" } as React.CSSProperties)
            : undefined
        }
      >
        <div className="w-[160px] shrink-0 md:w-[240px]">
          <span className="text-[10px] font-semibold tracking-[1.5px] text-dimmest uppercase">
            {label}
          </span>
        </div>
        {columns.map((col) => (
          <div
            key={col.key}
            className="flex w-[var(--cw)] shrink-0 items-center justify-center gap-1.5"
            style={{ "--cw": columnWidth } as React.CSSProperties}
          >
            {col.flagUrl !== undefined ? (
              <img
                src={col.flagUrl}
                alt={col.name}
                className="h-[18px] w-[18px] rounded-full object-cover"
              />
            ) : null}
            <span
              className="max-w-[var(--mnw)] truncate text-xs font-semibold text-white"
              style={{ "--mnw": col.maxNameWidth ?? "76px" } as React.CSSProperties}
            >
              {col.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

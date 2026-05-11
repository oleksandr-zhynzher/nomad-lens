interface ComparisonHeaderColumn {
  key: string | number;
  flagUrl?: string;
  name: string;
  maxNameWidth?: string;
}

interface Props {
  ref?: React.Ref<HTMLDivElement>;
  label: string;
  columns: ComparisonHeaderColumn[];
  columnWidth: string;
  gap?: string;
}

export function ComparisonTableHeader({ ref, label, columns, columnWidth, gap }: Props) {
  return (
    <div
      ref={ref}
      className="sticky z-10 top-14 sm:top-[112px] overflow-x-auto [scrollbar-width:none] bg-[#0F1114]"
    >
      <div
        className="flex items-center border-b border-[#1C1C1C] py-[14px]"
        style={{ gap: gap ?? "0" }}
      >
        <div className="w-[160px] md:w-[240px] shrink-0">
          <span className="text-[10px] font-semibold tracking-[1.5px] text-dimmest uppercase">
            {label}
          </span>
        </div>
        {columns.map((col) => (
          <div
            key={col.key}
            className="flex shrink-0 items-center justify-center gap-1.5"
            style={{ width: columnWidth }}
          >
            {col.flagUrl && (
              <img
                src={col.flagUrl}
                alt={col.name}
                className="rounded-full object-cover w-[18px] h-[18px]"
              />
            )}
            <span
              className="truncate text-xs font-semibold text-white"
              style={{ maxWidth: col.maxNameWidth ?? "76px" }}
            >
              {col.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

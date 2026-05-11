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
      className="sticky z-10 top-14 sm:top-[112px]"
      style={{ overflowX: "auto", scrollbarWidth: "none", backgroundColor: "#0F1114" }}
    >
      <div
        className="flex items-center"
        style={{ borderBottom: "1px solid #1C1C1C", padding: "14px 0", gap: gap ?? "0" }}
      >
        <div className="w-[160px] md:w-[240px] shrink-0">
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "1.5px",
              color: "#757575",
              textTransform: "uppercase",
            }}
          >
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
                className="rounded-full object-cover"
                style={{ width: "18px", height: "18px" }}
              />
            )}
            <span
              className="truncate"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
                fontWeight: 600,
                color: "#FFFFFF",
                maxWidth: col.maxNameWidth ?? "76px",
              }}
            >
              {col.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

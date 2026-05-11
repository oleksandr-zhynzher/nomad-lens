interface Props {
  label: string;
  dimmed?: boolean;
}

export function RegionPill({ label, dimmed }: Props) {
  return (
    <span
      className="px-2 py-0.5 rounded-full"
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: "10px",
        color: dimmed ? "#757575" : "#9E9E9E",
        backgroundColor: "#1C1C1C",
        border: "1px solid #2C2C2C",
      }}
    >
      {label}
    </span>
  );
}

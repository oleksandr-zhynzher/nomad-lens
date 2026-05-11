interface Props {
  label: string;
  dimmed?: boolean;
}

export function RegionPill({ label, dimmed }: Props) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] bg-surface border border-[#2C2C2C] ${dimmed ? "text-dimmest" : "text-muted"}`}
    >
      {label}
    </span>
  );
}

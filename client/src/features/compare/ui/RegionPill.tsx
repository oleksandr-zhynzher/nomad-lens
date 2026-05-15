interface RegionPillProps {
  readonly label: string;
  readonly dimmed?: boolean;
}

export function RegionPill({ label, dimmed }: RegionPillProps) {
  return (
    <span
      className={`rounded-full border border-[#2C2C2C] bg-surface px-2 py-0.5 text-[10px] ${dimmed ? "text-dimmest" : "text-muted"}`}
    >
      {label}
    </span>
  );
}

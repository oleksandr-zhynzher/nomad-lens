interface SectionHeaderProps {
  readonly title: string;
  readonly meta?: string;
}

export function SectionHeader({ title, meta }: SectionHeaderProps) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold tracking-[1.5px] text-muted uppercase">{title}</h2>
      {meta != null ? <p className="mt-1 text-xs text-dim">{meta}</p> : null}
    </div>
  );
}

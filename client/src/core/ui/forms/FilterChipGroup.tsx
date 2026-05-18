interface FilterChipItem {
  readonly id: string;
  readonly label: string;
}

interface FilterChipGroupProps {
  readonly label: string;
  readonly items: readonly FilterChipItem[];
  readonly selectedIds: ReadonlySet<string>;
  readonly onToggle: (id: string) => void;
  /** When provided, renders an "all" chip that is active when selectedIds is empty */
  readonly allChipLabel?: string;
  readonly onClearAll?: () => void;
  /** Override accent color for active chips (defaults to bg-accent text-white) */
  readonly activeClassName?: string;
  /** Override inactive chip class (defaults to bg-surface-4 text-muted) */
  readonly inactiveClassName?: string;
}

export function FilterChipGroup({
  label,
  items,
  selectedIds,
  onToggle,
  allChipLabel,
  onClearAll,
  activeClassName = "bg-accent text-white",
  inactiveClassName = "bg-surface-4 text-muted",
}: FilterChipGroupProps) {
  return (
    <div>
      <div className="mb-3 text-[13px] font-bold tracking-[2px] text-muted uppercase">{label}</div>
      <div className="flex flex-wrap gap-2">
        {allChipLabel != null && onClearAll != null ? (
          <button
            type="button"
            onClick={onClearAll}
            className={`cursor-pointer rounded-[3px] border-0 px-[18px] py-2 text-[13px] font-semibold ${selectedIds.size === 0 ? activeClassName : inactiveClassName}`}
          >
            {allChipLabel}
          </button>
        ) : null}
        {items.map((item) => {
          const active = selectedIds.has(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onToggle(item.id);
              }}
              className={`cursor-pointer rounded-[3px] border-0 px-[18px] py-2 text-[13px] font-semibold ${active ? activeClassName : inactiveClassName}`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

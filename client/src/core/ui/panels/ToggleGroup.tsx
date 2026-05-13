/** Segmented button control — choose one value from a fixed set of options. */

interface ToggleGroupProps<T extends string | number> {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  labelFn: (v: T) => string;
}

export function ToggleGroup<T extends string | number>({
  options,
  value,
  onChange,
  labelFn,
}: ToggleGroupProps<T>) {
  return (
    <div className="flex bg-surface-4 rounded-[4px] p-1 gap-1">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={String(opt)}
            type="button"
            onClick={() => onChange(opt)}
            className={`flex-1 py-[5px] rounded-[3px] border-0 cursor-pointer text-xs text-center transition-all ${active ? "font-medium bg-accent text-white" : "font-normal bg-transparent text-dim"}`}
          >
            {labelFn(opt)}
          </button>
        );
      })}
    </div>
  );
}

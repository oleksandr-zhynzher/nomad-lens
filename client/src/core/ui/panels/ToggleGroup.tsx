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
    <div className="flex gap-1 rounded-[4px] bg-surface-4 p-1">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={String(opt)}
            type="button"
            onClick={() => {
              onChange(opt);
            }}
            className={`flex-1 cursor-pointer rounded-[3px] border-0 py-[5px] text-center text-xs transition-all ${active ? "bg-accent font-medium text-white" : "bg-transparent font-normal text-dim"}`}
          >
            {labelFn(opt)}
          </button>
        );
      })}
    </div>
  );
}

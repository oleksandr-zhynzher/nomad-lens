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
    <div
      className="flex"
      style={{ backgroundColor: "#2A2A2A", borderRadius: 4, padding: 4, gap: 4 }}
    >
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={String(opt)}
            type="button"
            onClick={() => onChange(opt)}
            style={{
              flex: 1,
              padding: "5px 0",
              borderRadius: 3,
              border: "none",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              fontWeight: active ? 500 : 400,
              backgroundColor: active ? "var(--color-accent)" : "transparent",
              color: active ? "#FFFFFF" : "#8A8A8A",
              textAlign: "center",
              transition: "all 0.15s ease",
            }}
          >
            {labelFn(opt)}
          </button>
        );
      })}
    </div>
  );
}

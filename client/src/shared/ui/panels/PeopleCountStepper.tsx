/** +/− stepper for selecting a people count. */

interface PeopleCountStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function PeopleCountStepper({
  value,
  min = 1,
  max = 20,
  onChange,
}: PeopleCountStepperProps) {
  const atMin = value <= min;
  const atMax = value >= max;

  const btnStyle = (disabled: boolean) => ({
    width: 32,
    height: 32,
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: disabled ? "#222" : "#333",
    border: "none",
    borderRadius: 6,
    color: disabled ? "#555" : "#E8E9EB",
    fontSize: 16,
    fontWeight: 700,
    cursor: disabled ? ("default" as const) : ("pointer" as const),
    transition: "all 0.15s ease",
  });

  return (
    <div className="inline-flex items-center" style={{ borderRadius: 6, height: 36, gap: 4 }}>
      <button
        type="button"
        onClick={() => !atMin && onChange(value - 1)}
        disabled={atMin}
        style={btnStyle(atMin)}
      >
        −
      </button>
      <span
        style={{
          fontFamily: "IBM Plex Mono, monospace",
          fontSize: 15,
          fontWeight: 700,
          color: "#E8E9EB",
          minWidth: 24,
          textAlign: "center",
          userSelect: "none",
        }}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => !atMax && onChange(value + 1)}
        disabled={atMax}
        style={btnStyle(atMax)}
      >
        +
      </button>
    </div>
  );
}

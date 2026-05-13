/** +/− stepper for selecting a people count. */

interface PeopleCountStepperProps {
  readonly value: number;
  readonly min?: number;
  readonly max?: number;
  readonly onChange: (value: number) => void;
}

function btnClass(disabled: boolean) {
  return `w-8 h-8 flex items-center justify-center rounded-[6px] text-base font-bold transition-all ${disabled ? "bg-surface-2 text-[#555555] cursor-default" : "bg-border text-on-surface cursor-pointer"}`;
}

export function PeopleCountStepper({
  value,
  min = 1,
  max = 20,
  onChange,
}: PeopleCountStepperProps) {
  const atMin = value <= min;
  const atMax = value >= max;

  return (
    <div className="inline-flex h-9 items-center gap-1 rounded-[6px]">
      <button
        type="button"
        onClick={() => !atMin && onChange(value - 1)}
        disabled={atMin}
        className={btnClass(atMin)}
      >
        −
      </button>
      <span className="min-w-6 text-center font-mono text-[15px] font-bold text-on-surface select-none">
        {value}
      </span>
      <button
        type="button"
        onClick={() => !atMax && onChange(value + 1)}
        disabled={atMax}
        className={btnClass(atMax)}
      >
        +
      </button>
    </div>
  );
}

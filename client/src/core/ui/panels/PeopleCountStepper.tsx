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

  const btnClass = (disabled: boolean) =>
    `w-8 h-8 flex items-center justify-center rounded-[6px] text-base font-bold transition-all ${disabled ? "bg-surface-2 text-[#555555] cursor-default" : "bg-border text-on-surface cursor-pointer"}`;

  return (
    <div className="inline-flex items-center rounded-[6px] h-9 gap-1">
      <button
        type="button"
        onClick={() => !atMin && onChange(value - 1)}
        disabled={atMin}
        className={btnClass(atMin)}
      >
        −
      </button>
      <span className="font-mono text-[15px] font-bold text-on-surface min-w-6 text-center select-none">
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

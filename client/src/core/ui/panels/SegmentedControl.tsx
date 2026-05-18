import { Tooltip } from "@core/ui/Tooltip";
import type { ReactNode } from "react";

interface SegmentedOption<T extends string | number> {
  readonly value: T;
  readonly label: string;
  readonly icon?: ReactNode;
  readonly tooltip?: ReactNode;
  readonly tooltipDelay?: number;
}

interface SegmentedControlProps<T extends string | number> {
  readonly options: ReadonlyArray<SegmentedOption<T>>;
  readonly value: T;
  readonly onChange: (v: T) => void;
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="flex gap-1 rounded-[4px] bg-surface-4 p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        const button = (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => {
              onChange(opt.value);
            }}
            className={`flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[3px] border-0 px-3 py-[5px] text-xs transition-all ${active ? "bg-accent font-medium text-white" : "bg-transparent font-normal text-dim"}`}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
        if (opt.tooltip != null) {
          return (
            <div key={String(opt.value)} className="flex flex-1">
              <Tooltip
                content={opt.tooltip}
                side="top"
                triggerStyle={{ width: "100%" }}
                delay={opt.tooltipDelay ?? 300}
              >
                {button}
              </Tooltip>
            </div>
          );
        }
        return (
          <div key={String(opt.value)} className="flex flex-1">
            {button}
          </div>
        );
      })}
    </div>
  );
}

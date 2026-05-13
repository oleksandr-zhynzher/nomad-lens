import type React from "react";

interface CompareCheckboxProps {
  readonly isSelected: boolean;
  /** Background for unchecked state. Defaults to "transparent". */
  readonly uncheckedBg?: string;
}

/** Checkbox overlay shown on cards when compare mode is active. */
export function CompareCheckbox({ isSelected, uncheckedBg = "transparent" }: CompareCheckboxProps) {
  const hasBg = uncheckedBg !== "transparent";
  return (
    <div
      className={`absolute top-1/2 left-[10px] z-[2] flex w-5 -translate-y-1/2 items-center justify-center ${hasBg ? "pointer-events-none" : ""}`}
    >
      <div
        className={`flex h-4 w-4 items-center justify-center rounded-sm transition-all ${isSelected ? "border-2 border-accent bg-accent" : "border-2 border-[#404040] bg-transparent"} ${!isSelected && hasBg ? "bg-[var(--ubg)]" : ""}`}
        style={!isSelected && hasBg ? ({ "--ubg": uncheckedBg } as React.CSSProperties) : undefined}
      >
        {isSelected ? (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path
              d="M1 3.5L3.5 6L8 1"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </div>
    </div>
  );
}

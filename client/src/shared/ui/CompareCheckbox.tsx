interface CompareCheckboxProps {
  isSelected: boolean;
  /** Background for unchecked state. Defaults to "transparent". */
  uncheckedBg?: string;
}

/** Checkbox overlay shown on cards when compare mode is active. */
export function CompareCheckbox({ isSelected, uncheckedBg = "transparent" }: CompareCheckboxProps) {
  return (
    <div
      className="absolute left-[10px] top-1/2 -translate-y-1/2 z-[2] w-5 flex items-center justify-center"
      style={{ pointerEvents: uncheckedBg !== "transparent" ? "none" : undefined }}
    >
      <div
        className={`w-4 h-4 rounded-sm flex items-center justify-center transition-all ${isSelected ? "bg-accent border-2 border-accent" : "bg-transparent border-2 border-[#404040]"}`}
        style={
          isSelected
            ? undefined
            : { backgroundColor: uncheckedBg !== "transparent" ? uncheckedBg : undefined }
        }
      >
        {isSelected && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path
              d="M1 3.5L3.5 6L8 1"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </div>
  );
}

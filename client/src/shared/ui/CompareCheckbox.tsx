interface CompareCheckboxProps {
  isSelected: boolean;
  /** Background for unchecked state. Defaults to "transparent". */
  uncheckedBg?: string;
}

/** Checkbox overlay shown on cards when compare mode is active. */
export function CompareCheckbox({ isSelected, uncheckedBg = "transparent" }: CompareCheckboxProps) {
  return (
    <div
      style={{
        position: "absolute",
        left: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 2,
        width: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: uncheckedBg !== "transparent" ? "none" : undefined,
      }}
    >
      <div
        style={{
          width: "16px",
          height: "16px",
          borderRadius: "3px",
          border: `2px solid ${isSelected ? "var(--color-accent)" : "#404040"}`,
          backgroundColor: isSelected ? "var(--color-accent)" : uncheckedBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.1s ease",
        }}
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

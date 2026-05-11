import { Sliders, Scale } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "../../../components/Tooltip";
import type { WeightMode } from "../../../utils/types";

interface WeightModeToggleProps {
  weightMode: WeightMode;
  onWeightModeChange: (mode: WeightMode) => void;
}

export function WeightModeToggle({ weightMode, onWeightModeChange }: WeightModeToggleProps) {
  const { t } = useTranslation();
  return (
    <div
      className="flex"
      style={{
        marginTop: "10px",
        backgroundColor: "#2A2A2A",
        borderRadius: "4px",
        padding: "4px",
        gap: "4px",
      }}
    >
      <div style={{ flex: "1 1 0", display: "flex" }}>
        <Tooltip
          content={
            <div>
              <div style={{ marginBottom: "8px", color: "#FFFFFF", fontWeight: 600 }}>
                {t("weights.independentTitle")}
              </div>
              <div>{t("weights.independentDesc")}</div>
            </div>
          }
          side="top"
          triggerStyle={{ width: "100%" }}
          delay={300}
        >
          <button
            onClick={() => onWeightModeChange("independent")}
            className="flex items-center justify-center gap-1.5"
            style={{
              width: "100%",
              padding: "6px 12px",
              borderRadius: "3px",
              border: "none",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: weightMode === "independent" ? 500 : 400,
              backgroundColor: weightMode === "independent" ? "var(--color-accent)" : "transparent",
              color: weightMode === "independent" ? "#FFFFFF" : "#9E9E9E",
              transition: "all 0.15s ease",
            }}
          >
            <Sliders size={16} />
            {t("weights.independentMode")}
          </button>
        </Tooltip>
      </div>
      <div style={{ flex: "1 1 0", display: "flex" }}>
        <Tooltip
          content={
            <div>
              <div style={{ marginBottom: "8px", color: "#FFFFFF", fontWeight: 600 }}>
                {t("weights.balancedTitle")}
              </div>
              <div>{t("weights.balancedDesc")}</div>
            </div>
          }
          side="top"
          triggerStyle={{ width: "100%" }}
          delay={300}
        >
          <button
            onClick={() => onWeightModeChange("balanced")}
            className="flex items-center justify-center gap-1.5"
            style={{
              width: "100%",
              padding: "6px 12px",
              borderRadius: "3px",
              border: "none",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: weightMode === "balanced" ? 500 : 400,
              backgroundColor: weightMode === "balanced" ? "var(--color-accent)" : "transparent",
              color: weightMode === "balanced" ? "#FFFFFF" : "#9E9E9E",
              transition: "all 0.15s ease",
            }}
          >
            <Scale size={16} />
            {t("weights.balancedMode")}
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

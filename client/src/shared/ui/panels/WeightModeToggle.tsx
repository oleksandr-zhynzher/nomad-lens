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
    <div className="flex mt-[10px] bg-surface-4 rounded-[4px] p-1 gap-1">
      <div className="flex-1 flex">
        <Tooltip
          content={
            <div>
              <div className="mb-2 text-white font-semibold">{t("weights.independentTitle")}</div>
              <div>{t("weights.independentDesc")}</div>
            </div>
          }
          side="top"
          triggerStyle={{ width: "100%" }}
          delay={300}
        >
          <button
            onClick={() => onWeightModeChange("independent")}
            className={`w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[3px] border-0 cursor-pointer text-[13px] transition-all ${weightMode === "independent" ? "font-medium bg-accent text-white" : "font-normal bg-transparent text-muted"}`}
          >
            <Sliders size={16} />
            {t("weights.independentMode")}
          </button>
        </Tooltip>
      </div>
      <div className="flex-1 flex">
        <Tooltip
          content={
            <div>
              <div className="mb-2 text-white font-semibold">{t("weights.balancedTitle")}</div>
              <div>{t("weights.balancedDesc")}</div>
            </div>
          }
          side="top"
          triggerStyle={{ width: "100%" }}
          delay={300}
        >
          <button
            onClick={() => onWeightModeChange("balanced")}
            className={`w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[3px] border-0 cursor-pointer text-[13px] transition-all ${weightMode === "balanced" ? "font-medium bg-accent text-white" : "font-normal bg-transparent text-muted"}`}
          >
            <Scale size={16} />
            {t("weights.balancedMode")}
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

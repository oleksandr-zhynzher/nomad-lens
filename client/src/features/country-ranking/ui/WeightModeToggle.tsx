import { Sliders, Scale } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "@core/ui";
import type { WeightMode } from "@core/models";

interface WeightModeToggleProps {
  weightMode: WeightMode;
  onWeightModeChange: (mode: WeightMode) => void;
}

export function WeightModeToggle({ weightMode, onWeightModeChange }: WeightModeToggleProps) {
  const { t } = useTranslation();
  return (
    <div className="mt-[10px] flex gap-1 rounded-[4px] bg-surface-4 p-1">
      <div className="flex flex-1">
        <Tooltip
          content={
            <div>
              <div className="mb-2 font-semibold text-white">{t("weights.independentTitle")}</div>
              <div>{t("weights.independentDesc")}</div>
            </div>
          }
          side="top"
          triggerStyle={{ width: "100%" }}
          delay={300}
        >
          <button
            onClick={() => {
              onWeightModeChange("independent");
            }}
            className={`flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[3px] border-0 px-3 py-1.5 text-[13px] transition-all ${weightMode === "independent" ? "bg-accent font-medium text-white" : "bg-transparent font-normal text-muted"}`}
          >
            <Sliders size={16} />
            {t("weights.independentMode")}
          </button>
        </Tooltip>
      </div>
      <div className="flex flex-1">
        <Tooltip
          content={
            <div>
              <div className="mb-2 font-semibold text-white">{t("weights.balancedTitle")}</div>
              <div>{t("weights.balancedDesc")}</div>
            </div>
          }
          side="top"
          triggerStyle={{ width: "100%" }}
          delay={300}
        >
          <button
            onClick={() => {
              onWeightModeChange("balanced");
            }}
            className={`flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[3px] border-0 px-3 py-1.5 text-[13px] transition-all ${weightMode === "balanced" ? "bg-accent font-medium text-white" : "bg-transparent font-normal text-muted"}`}
          >
            <Scale size={16} />
            {t("weights.balancedMode")}
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

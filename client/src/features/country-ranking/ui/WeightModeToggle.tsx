import type { WeightMode } from "@core/models";
import { SegmentedControl } from "@core/ui/panels/SegmentedControl";
import { Scale, Sliders } from "lucide-react";
import { useTranslation } from "react-i18next";

interface WeightModeToggleProps {
  readonly weightMode: WeightMode;
  readonly onWeightModeChange: (mode: WeightMode) => void;
}

export function WeightModeToggle({ weightMode, onWeightModeChange }: WeightModeToggleProps) {
  const { t } = useTranslation();
  return (
    <div className="mt-[10px]">
      <SegmentedControl
        value={weightMode}
        onChange={onWeightModeChange}
        options={[
          {
            value: "independent",
            label: t("weights.independentMode"),
            icon: <Sliders size={16} />,
            tooltip: (
              <div>
                <div className="mb-2 font-semibold text-white">{t("weights.independentTitle")}</div>
                <div>{t("weights.independentDesc")}</div>
              </div>
            ),
            tooltipDelay: 300,
          },
          {
            value: "balanced",
            label: t("weights.balancedMode"),
            icon: <Scale size={16} />,
            tooltip: (
              <div>
                <div className="mb-2 font-semibold text-white">{t("weights.balancedTitle")}</div>
                <div>{t("weights.balancedDesc")}</div>
              </div>
            ),
            tooltipDelay: 300,
          },
        ]}
      />
    </div>
  );
}

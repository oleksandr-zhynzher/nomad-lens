import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import { Tooltip } from "../../../components/Tooltip";
import { WeightSliderRow } from "./WeightSliderRow";

export interface TourismWeightSliderProps {
  metricKey: string;
  value: number;
  onChange: (key: string, value: number) => void;
}

export function TourismWeightSlider({ metricKey, value, onChange }: TourismWeightSliderProps) {
  const { t } = useTranslation();
  const label = t(`tourism.metrics.${metricKey}`, metricKey);
  const desc = t(`tourism.metricDesc.${metricKey}`, "");

  return (
    <WeightSliderRow
      inputName={`${metricKey}-tourism-weight`}
      value={value}
      onChange={(v) => onChange(metricKey, v)}
      ariaLabel={t("tourismWeights.weightAriaLabel", {
        label,
        defaultValue: "{{label}} weight",
      })}
      label={<span className="text-xs font-normal text-white">{label}</span>}
      tooltipIcon={
        desc ? (
          <Tooltip
            content={
              <div>
                <div className="mb-2 text-white font-semibold">{label}</div>
                <div>{desc}</div>
              </div>
            }
            side="top"
          >
            <Info size={14} color="#FFFFFF" className="cursor-pointer shrink-0 opacity-60" />
          </Tooltip>
        ) : undefined
      }
    />
  );
}

import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import { Link } from "react-router-dom";
import type { CategoryKey, WeightMap, WeightMode } from "@core/models";
import {
  CATEGORY_DATA_SOURCES,
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  AI_CATEGORIES,
} from "@core/models";
import { weightLabel } from "@features/country-ranking/utils";
import { Tooltip } from "@core/ui";
import { WeightSliderRow } from "@core/ui/panels";

export interface WeightSliderProps {
  categoryKey: CategoryKey;
  value: number;
  onChange: (key: CategoryKey, value: number) => void;
  weights: WeightMap;
  weightMode: WeightMode;
  langPrefix: string;
}

export function WeightSlider({
  categoryKey,
  value,
  onChange,
  weights,
  weightMode,
  langPrefix,
}: WeightSliderProps) {
  const { t } = useTranslation();
  const label = t(`indicatorsPage.indicators.${categoryKey}.name`, CATEGORY_LABELS[categoryKey]);
  const wLabel = weightMode === "independent" ? `${value}` : weightLabel(categoryKey, weights);
  const description = CATEGORY_DESCRIPTIONS[categoryKey];
  const dataSource = CATEGORY_DATA_SOURCES[categoryKey];
  const isAi = AI_CATEGORIES.has(categoryKey);

  const labelNode = (
    <>
      {isAi ? (
        <Link
          to={`${langPrefix}/ai-indicators`}
          className="text-xs font-normal text-white no-underline"
        >
          {label}
        </Link>
      ) : (
        <span className="text-xs font-normal text-white">{label}</span>
      )}
      {isAi && (
        <Link to={`${langPrefix}/ai-indicators`} className="no-underline">
          <span className="text-[9px] font-semibold text-[#C084FC] bg-[rgba(192,132,252,0.12)] px-[5px] py-px rounded-[4px] tracking-[0.5px] leading-4">
            AI
          </span>
        </Link>
      )}
    </>
  );

  const tooltipIcon = (
    <Tooltip
      content={
        <div>
          <div className="mb-2 text-white font-semibold">{label}</div>
          <div className="mb-2">{description}</div>
          <div className="text-[10px] text-muted">Source: {dataSource}</div>
        </div>
      }
      side="top"
    >
      <Info size={14} color="#FFFFFF" className="cursor-pointer shrink-0 opacity-60" />
    </Tooltip>
  );

  return (
    <WeightSliderRow
      inputName={`${categoryKey}-weight`}
      value={value}
      min={0}
      max={100}
      onChange={(v) => onChange(categoryKey, v)}
      ariaLabel={`${label} weight`}
      label={labelNode}
      tooltipIcon={tooltipIcon}
      displayValue={wLabel}
    />
  );
}

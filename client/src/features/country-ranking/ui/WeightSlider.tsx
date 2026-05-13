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
  readonly categoryKey: CategoryKey;
  readonly value: number;
  readonly onChange: (key: CategoryKey, value: number) => void;
  readonly weights: WeightMap;
  readonly weightMode: WeightMode;
  readonly langPrefix: string;
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
      {isAi ? (
        <Link to={`${langPrefix}/ai-indicators`} className="no-underline">
          <span className="rounded-[4px] bg-[rgba(192,132,252,0.12)] px-[5px] py-px text-[9px] leading-4 font-semibold tracking-[0.5px] text-[#C084FC]">
            AI
          </span>
        </Link>
      ) : null}
    </>
  );

  const tooltipIcon = (
    <Tooltip
      content={
        <div>
          <div className="mb-2 font-semibold text-white">{label}</div>
          <div className="mb-2">{description}</div>
          <div className="text-[10px] text-muted">Source: {dataSource}</div>
        </div>
      }
      side="top"
    >
      <Info size={14} color="#FFFFFF" className="shrink-0 cursor-pointer opacity-60" />
    </Tooltip>
  );

  return (
    <WeightSliderRow
      inputName={`${categoryKey}-weight`}
      value={value}
      min={0}
      max={100}
      onChange={(v) => {
        onChange(categoryKey, v);
      }}
      ariaLabel={`${label} weight`}
      label={labelNode}
      tooltipIcon={tooltipIcon}
      displayValue={wLabel}
    />
  );
}

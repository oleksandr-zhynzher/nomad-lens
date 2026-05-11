import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import { Link } from "react-router-dom";
import type { CategoryKey, WeightMap, WeightMode } from "../../../utils/types";
import {
  CATEGORY_DATA_SOURCES,
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  AI_CATEGORIES,
} from "../../../utils/types";
import { weightLabel } from "../../../utils/scoring";
import { Tooltip } from "../../../components/Tooltip";
import { WeightSliderRow } from "./WeightSliderRow";

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
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "12px",
            fontWeight: 400,
            color: "#FFFFFF",
            textDecoration: "none",
          }}
        >
          {label}
        </Link>
      ) : (
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "12px",
            fontWeight: 400,
            color: "#FFFFFF",
          }}
        >
          {label}
        </span>
      )}
      {isAi && (
        <Link to={`${langPrefix}/ai-indicators`} style={{ textDecoration: "none" }}>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "9px",
              fontWeight: 600,
              color: "#C084FC",
              backgroundColor: "rgba(192, 132, 252, 0.12)",
              padding: "1px 5px",
              borderRadius: "4px",
              letterSpacing: "0.5px",
              lineHeight: "16px",
            }}
          >
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
          <div style={{ marginBottom: "8px", color: "#FFFFFF", fontWeight: 600 }}>{label}</div>
          <div style={{ marginBottom: "8px" }}>{description}</div>
          <div style={{ fontSize: "10px", color: "#9E9E9E" }}>Source: {dataSource}</div>
        </div>
      }
      side="top"
    >
      <Info size={14} color="#FFFFFF" style={{ cursor: "pointer", flexShrink: 0, opacity: 0.6 }} />
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

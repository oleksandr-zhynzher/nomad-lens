import type { CategoryKey, ClimatePreferences, WeightMap, WeightMode } from "@core/models";
import { CollapsibleSection } from "@core/ui/panels";
import type { WEIGHT_GROUPS } from "@features/country-ranking/constants";
import { ClimatePrefsSection, WeightSlider } from "@features/country-ranking/ui";
import { ExternalLink } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

type WeightGroupConfig = (typeof WEIGHT_GROUPS)[number];

interface WeightCategoryGroupProps {
  readonly group: WeightGroupConfig;
  readonly weights: WeightMap;
  readonly onChange: (key: CategoryKey, value: number) => void;
  readonly weightMode: WeightMode;
  readonly climatePrefs: ClimatePreferences;
  readonly onClimatePrefsChange: (prefs: ClimatePreferences) => void;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly langPrefix: string;
}

export function WeightCategoryGroup({
  group,
  weights,
  onChange,
  weightMode,
  climatePrefs,
  onClimatePrefsChange,
  isOpen,
  onToggle,
  langPrefix,
}: WeightCategoryGroupProps) {
  const { t } = useTranslation();

  const groupTotal = group.keys.reduce((s, k) => s + weights[k], 0);
  const badgeText =
    weightMode === "independent"
      ? `${t("weights.averageBadge")} ${Math.round(groupTotal / group.keys.length)}`
      : `${groupTotal}%`;

  const groupBadge = (
    <>
      {group.label === "AI INSIGHTS" ? (
        <Link
          to={`${langPrefix}/ai-indicators`}
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="flex shrink-0 items-center rounded-[3px] p-0.5"
          title="AI Indicators methodology"
        >
          <ExternalLink size={12} color="#C084FC" />
        </Link>
      ) : null}
      <div className="flex items-center rounded-[3px] bg-[#291608] px-2 py-[3px]">
        <span className="font-mono text-[11px] text-accent-dim">{badgeText}</span>
      </div>
    </>
  );

  return (
    <CollapsibleSection
      id={group.label}
      icon={group.icon}
      label={t(group.labelKey)}
      badge={groupBadge}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="py-1">
        {group.keys.map((key) => (
          <React.Fragment key={key}>
            <div className="px-4 py-2.5">
              <WeightSlider
                categoryKey={key}
                value={weights[key]}
                onChange={onChange}
                weights={weights}
                weightMode={weightMode}
                langPrefix={langPrefix}
              />
            </div>
            {key === "climate" ? (
              <ClimatePrefsSection
                climatePrefs={climatePrefs}
                onClimatePrefsChange={onClimatePrefsChange}
              />
            ) : null}
          </React.Fragment>
        ))}
      </div>
    </CollapsibleSection>
  );
}

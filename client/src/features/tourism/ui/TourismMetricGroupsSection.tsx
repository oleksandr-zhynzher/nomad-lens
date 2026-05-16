import { useState } from "react";
import { Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CollapsibleSection } from "@core/ui/panels";
import { TOURISM_GROUPS } from "@core/models";
import { TourismWeightSlider } from "./TourismWeightSlider";
import { TOURISM_GROUP_ICONS } from "@features/tourism/constants";
import type { TourismWeightMap } from "@features/tourism/utils";

interface TourismMetricGroupsSectionProps {
  readonly weights: TourismWeightMap;
  readonly onChange: (key: string, value: number) => void;
}

export function TourismMetricGroupsSection({ weights, onChange }: TourismMetricGroupsSectionProps) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(
    Object.fromEntries(TOURISM_GROUPS.map((g) => [g.labelKey, false])),
  );
  const [isOpen, setIsOpen] = useState(true);

  const toggleGroup = (label: string) => {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <CollapsibleSection
      id="tourism-metrics"
      icon={<Sun size={16} color="#D4A843" />}
      label={t("tourismWeights.groupLabel", "Tourism Metrics")}
      isOpen={isOpen}
      onToggle={() => {
        setIsOpen((prev) => !prev);
      }}
    >
      <div className="py-1">
        {TOURISM_GROUPS.map((group) => {
          const subAvg = Math.round(
            group.keys.reduce((s, k) => s + (weights[k] ?? 50), 0) / group.keys.length,
          );
          const groupIcon = TOURISM_GROUP_ICONS[group.labelKey] ?? (
            <Sun size={16} color="#D4A843" />
          );
          return (
            <CollapsibleSection
              key={group.labelKey}
              id={`tourism-subgroup-${group.labelKey}`}
              icon={groupIcon}
              label={t(`tourismWeights.groups.${group.labelKey}`, group.labelKey)}
              badge={
                <div className="flex items-center rounded-[3px] bg-[#291608] px-2 py-[3px]">
                  <span className="font-mono text-[11px] text-accent-dim">
                    {`${t("weights.averageBadge", "avg")} ${subAvg}`}
                  </span>
                </div>
              }
              isOpen={!collapsed[group.labelKey]}
              onToggle={() => {
                toggleGroup(group.labelKey);
              }}
            >
              {group.keys.map((key) => (
                <div key={key} className="px-4 py-2.5">
                  <TourismWeightSlider
                    metricKey={key}
                    value={weights[key] ?? 50}
                    onChange={onChange}
                  />
                </div>
              ))}
            </CollapsibleSection>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}

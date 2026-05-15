import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLangPrefix } from "@core/hooks";
import type { CategoryKey, ClimatePreferences, WeightMap, WeightMode } from "@core/models";
import { PanelShell } from "@core/ui/panels";
import { VisaStaySection } from "@features/country-ranking/ui";
import { WeightCategoryGroup } from "@features/country-ranking/ui";
import { WeightModeToggle } from "@features/country-ranking/ui";
import { WeightShareButton } from "@features/country-ranking/ui";
import { WEIGHT_GROUPS } from "@features/country-ranking/constants";

interface WeightPanelProps {
  readonly weights: WeightMap;
  readonly onChange: (key: CategoryKey, value: number) => void;
  readonly onReset: () => void;
  readonly weightsAreDefault: boolean;
  readonly onShare: () => void;
  readonly climatePrefs: ClimatePreferences;
  readonly onClimatePrefsChange: (prefs: ClimatePreferences) => void;
  readonly nomadVisaOnly: boolean;
  readonly onNomadVisaOnlyChange: (value: boolean) => void;
  readonly schengenOnly: boolean;
  readonly onSchengenOnlyChange: (value: boolean) => void;
  readonly minTouristDays: number | null;
  readonly onMinTouristDaysChange: (value: number | null) => void;
  readonly weightMode: WeightMode;
  readonly onWeightModeChange: (mode: WeightMode) => void;
  readonly mobile?: boolean;
}

export function WeightPanel({
  weights,
  onChange,
  onReset,
  weightsAreDefault,
  onShare,
  climatePrefs,
  onClimatePrefsChange,
  nomadVisaOnly,
  onNomadVisaOnlyChange,
  schengenOnly,
  onSchengenOnlyChange,
  minTouristDays,
  onMinTouristDaysChange,
  weightMode,
  onWeightModeChange,
  mobile,
}: WeightPanelProps) {
  const { t } = useTranslation();
  const langPrefix = useLangPrefix();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    Object.fromEntries([...WEIGHT_GROUPS.map((g) => g.label), "VISA & STAY"].map((l) => [l, true])),
  );
  const toggleGroup = (label: string) =>
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <PanelShell
      title={t("weights.title")}
      subtitle={t("weights.hint")}
      headerExtra={
        <WeightModeToggle weightMode={weightMode} onWeightModeChange={onWeightModeChange} />
      }
      footerExtra={weightsAreDefault ? undefined : <WeightShareButton onShare={onShare} />}
      onReset={onReset}
      mobile={mobile}
    >
      {WEIGHT_GROUPS.map((group) => (
        <WeightCategoryGroup
          key={group.label}
          group={group}
          weights={weights}
          onChange={onChange}
          weightMode={weightMode}
          climatePrefs={climatePrefs}
          onClimatePrefsChange={onClimatePrefsChange}
          isOpen={!collapsed[group.label]}
          onToggle={() => {
            toggleGroup(group.label);
          }}
          langPrefix={langPrefix}
        />
      ))}

      <VisaStaySection
        nomadVisaOnly={nomadVisaOnly}
        onNomadVisaOnlyChange={onNomadVisaOnlyChange}
        schengenOnly={schengenOnly}
        onSchengenOnlyChange={onSchengenOnlyChange}
        minTouristDays={minTouristDays}
        onMinTouristDaysChange={onMinTouristDaysChange}
        isOpen={!collapsed["VISA & STAY"]}
        onToggle={() => {
          toggleGroup("VISA & STAY");
        }}
      />
    </PanelShell>
  );
}

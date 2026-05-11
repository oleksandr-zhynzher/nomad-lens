import React, { useState } from "react";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useLangPrefix } from "../hooks/useLangPrefix";
import type { CategoryKey, ClimatePreferences, WeightMap, WeightMode } from "../utils/types";
import { PanelShell } from "../shared/ui/panels/PanelShell";
import { CollapsibleSection } from "../shared/ui/panels/CollapsibleSection";
import { WeightSlider } from "../shared/ui/panels/WeightSlider";
import { WEIGHT_GROUPS } from "../utils/weightConfig";
import { WeightModeToggle } from "../shared/ui/panels/WeightModeToggle";
import { ClimatePrefsSection } from "../shared/ui/panels/ClimatePrefsSection";
import { VisaStaySection } from "../shared/ui/panels/VisaStaySection";

interface WeightPanelProps {
  weights: WeightMap;
  onChange: (key: CategoryKey, value: number) => void;
  onReset: () => void;
  weightsAreDefault: boolean;
  onShare: () => void;
  climatePrefs: ClimatePreferences;
  onClimatePrefsChange: (prefs: ClimatePreferences) => void;
  nomadVisaOnly: boolean;
  onNomadVisaOnlyChange: (value: boolean) => void;
  schengenOnly: boolean;
  onSchengenOnlyChange: (value: boolean) => void;
  minTouristDays: number | null;
  onMinTouristDaysChange: (value: number | null) => void;
  weightMode: WeightMode;
  onWeightModeChange: (mode: WeightMode) => void;
  mobile?: boolean;
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
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    onShare();
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    Object.fromEntries([...WEIGHT_GROUPS.map((g) => g.label), "VISA & STAY"].map((l) => [l, true])),
  );

  const toggleGroup = (label: string) =>
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));

  // ── Footer extra: share button ────────────────────────────────────────────
  const shareButton = !weightsAreDefault ? (
    <button
      onClick={handleShare}
      aria-live="polite"
      className="button-hover-exempt weight-panel-share-button w-full flex items-center justify-center gap-2 rounded transition-colors"
      style={{
        backgroundColor: copied ? "#2A4A2A" : "#1A2A1A",
        color: copied ? "#88CC88" : "#6B9E6B",
        fontFamily: "Inter, sans-serif",
        fontSize: "13px",
        fontWeight: 500,
        height: "40px",
        border: `1px solid ${copied ? "#4A8A4A" : "#2A4A2A"}`,
        borderRadius: "6px",
        transition: "all 0.15s ease",
      }}
    >
      {copied ? (
        <>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {t("weights.linkCopied")}
        </>
      ) : (
        <>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          {t("weights.shareWeights")}
        </>
      )}
    </button>
  ) : undefined;

  return (
    <PanelShell
      title={t("weights.title")}
      subtitle={t("weights.hint")}
      headerExtra={
        <WeightModeToggle weightMode={weightMode} onWeightModeChange={onWeightModeChange} />
      }
      footerExtra={shareButton}
      onReset={onReset}
      mobile={mobile}
    >
      {/* ── Weight category groups ──────────────────────────────────────────── */}
      {WEIGHT_GROUPS.map((group) => {
        const groupTotal = group.keys.reduce((s, k) => s + (weights[k] ?? 0), 0);
        const badgeText =
          weightMode === "independent"
            ? `${t("weights.averageBadge")} ${Math.round(groupTotal / group.keys.length)}`
            : `${groupTotal}%`;

        const groupBadge = (
          <>
            {group.label === "AI INSIGHTS" && (
              <Link
                to={`${langPrefix}/ai-indicators`}
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "2px",
                  borderRadius: "3px",
                  flexShrink: 0,
                }}
                title="AI Indicators methodology"
              >
                <ExternalLink size={12} color="#C084FC" />
              </Link>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#291608",
                borderRadius: "3px",
                padding: "3px 8px",
              }}
            >
              <span
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "11px",
                  color: "#C2956A",
                }}
              >
                {badgeText}
              </span>
            </div>
          </>
        );

        return (
          <CollapsibleSection
            key={group.label}
            id={group.label}
            icon={group.icon}
            label={t(group.labelKey)}
            badge={groupBadge}
            isOpen={!collapsed[group.label]}
            onToggle={() => toggleGroup(group.label)}
          >
            <div style={{ paddingTop: "4px", paddingBottom: "4px" }}>
              {group.keys.map((key) => (
                <React.Fragment key={key}>
                  <div style={{ padding: "10px 16px" }}>
                    <WeightSlider
                      categoryKey={key}
                      value={weights[key]}
                      onChange={onChange}
                      weights={weights}
                      weightMode={weightMode}
                      langPrefix={langPrefix}
                    />
                  </div>
                  {key === "climate" && (
                    <ClimatePrefsSection
                      climatePrefs={climatePrefs}
                      onClimatePrefsChange={onClimatePrefsChange}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </CollapsibleSection>
        );
      })}

      {/* ── VISA & STAY section ──────────────────────────────────────────────── */}
      <VisaStaySection
        nomadVisaOnly={nomadVisaOnly}
        onNomadVisaOnlyChange={onNomadVisaOnlyChange}
        schengenOnly={schengenOnly}
        onSchengenOnlyChange={onSchengenOnlyChange}
        minTouristDays={minTouristDays}
        onMinTouristDaysChange={onMinTouristDaysChange}
        isOpen={!collapsed["VISA & STAY"]}
        onToggle={() => toggleGroup("VISA & STAY")}
      />
    </PanelShell>
  );
}

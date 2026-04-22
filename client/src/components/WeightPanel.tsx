import React, { useState } from "react";
import {
  Info,
  ChevronDown,
  Briefcase,
  HeartPulse,
  ShieldCheck,
  GraduationCap,
  Leaf,
  Globe,
  Plane,
  Sliders,
  Scale,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useLangPrefix } from "../hooks/useLangPrefix";
import type {
  CategoryKey,
  ClimatePreferences,
  SeasonType,
  WeightMap,
  WeightMode,
} from "../utils/types";
import {
  CATEGORY_DATA_SOURCES,
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  AI_CATEGORIES,
} from "../utils/types";
import { defaultWeights, weightLabel } from "../utils/scoring";
import { Tooltip } from "./Tooltip";

interface WeightSliderProps {
  categoryKey: CategoryKey;
  value: number;
  onChange: (key: CategoryKey, value: number) => void;
  weights: WeightMap;
  weightMode: WeightMode;
  langPrefix: string;
}

function WeightSlider({
  categoryKey,
  value,
  onChange,
  weights,
  weightMode,
  langPrefix,
}: WeightSliderProps) {
  const { t } = useTranslation();
  const label = t(
    `indicatorsPage.indicators.${categoryKey}.name`,
    CATEGORY_LABELS[categoryKey],
  );
  const wLabel =
    weightMode === "independent"
      ? `${value}`
      : weightLabel(categoryKey, weights);
  const description = CATEGORY_DESCRIPTIONS[categoryKey];
  const dataSource = CATEGORY_DATA_SOURCES[categoryKey];
  const isAi = AI_CATEGORIES.has(categoryKey);

  return (
    <div className="flex flex-col" style={{ gap: "9px" }}>
      <div className="flex items-center justify-between">
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
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
            <Link
              to={`${langPrefix}/ai-indicators`}
              style={{ textDecoration: "none" }}
            >
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
          <Tooltip
            content={
              <div>
                <div
                  style={{
                    marginBottom: "8px",
                    color: "#FFFFFF",
                    fontWeight: 600,
                  }}
                >
                  {label}
                </div>
                <div style={{ marginBottom: "8px" }}>{description}</div>
                <div style={{ fontSize: "10px", color: "#9E9E9E" }}>
                  Source: {dataSource}
                </div>
              </div>
            }
            side="top"
          >
            <Info
              size={14}
              color="#FFFFFF"
              style={{ cursor: "pointer", flexShrink: 0, opacity: 0.6 }}
            />
          </Tooltip>
        </div>
        <span
          style={{
            fontFamily: "IBM Plex Mono, monospace",
            fontSize: "11px",
            color: "var(--color-accent-dim)",
          }}
        >
          {wLabel}
        </span>
      </div>
      <input
        name={`${categoryKey}-weight`}
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(categoryKey, Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${value}%, #333333 ${value}%, #333333 100%)`,
        }}
        aria-label={`${label} weight`}
      />
    </div>
  );
}

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

const SEASON_ROW1: Array<{ value: SeasonType | "any"; labelKey: string }> = [
  { value: "any", labelKey: "climate.seasons.any" },
  { value: "four_seasons", labelKey: "climate.seasons.fourSeasons" },
  { value: "mild_seasons", labelKey: "climate.seasons.mild" },
];
const SEASON_ROW2: Array<{ value: SeasonType | "any"; labelKey: string }> = [
  { value: "tropical", labelKey: "climate.seasons.tropical" },
  { value: "arid", labelKey: "climate.seasons.arid" },
  { value: "polar", labelKey: "climate.seasons.polar" },
];

/** Logical groups for the weight panel. Order here = render order. */
const WEIGHT_GROUPS: Array<{
  label: string;
  labelKey: string;
  icon: React.ReactElement;
  keys: CategoryKey[];
}> = [
  {
    label: "ECONOMIC",
    labelKey: "weights.groups.economic",
    icon: <Briefcase size={16} color="#8F5A3C" />,
    keys: ["economy", "affordability", "taxFriendliness", "startupEnvironment"],
  },
  {
    label: "HEALTH & WELLBEING",
    labelKey: "weights.groups.healthWellbeing",
    icon: <HeartPulse size={16} color="#C2956A" />,
    keys: ["healthcare", "healthcareCost", "foodSecurity", "happiness"],
  },
  {
    label: "SAFETY & FREEDOM",
    labelKey: "weights.groups.safetyFreedom",
    icon: <ShieldCheck size={16} color="#6B9E6B" />,
    keys: ["safety", "personalFreedom", "socialTolerance"],
  },
  {
    label: "EDUCATION & DEVELOPMENT",
    labelKey: "weights.groups.educationDevelopment",
    icon: <GraduationCap size={16} color="#5B8FA8" />,
    keys: ["education", "humanDevelopment"],
  },
  {
    label: "ENVIRONMENT & CLIMATE",
    labelKey: "weights.groups.environmentClimate",
    icon: <Leaf size={16} color="#7A9B6B" />,
    keys: ["climate", "environment"],
  },
  {
    label: "CONNECTIVITY",
    labelKey: "weights.groups.connectivity",
    icon: <Globe size={16} color="#8B7BAD" />,
    keys: [
      "infrastructure",
      "logistics",
      "airConnectivity",
      "englishProficiency",
    ],
  },
  {
    label: "AI INSIGHTS",
    labelKey: "weights.groups.aiInsights",
    icon: <Sparkles size={16} color="#C084FC" />,
    keys: [
      "nomadCommunity",
      "visaFriendliness",
      "costEfficiency",
      "workLifeBalance",
      "digitalReadiness",
      "culturalFit",
    ],
  },
];

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
    Object.fromEntries(
      [...WEIGHT_GROUPS.map((g) => g.label), "VISA & STAY"].map((l) => [
        l,
        true,
      ]),
    ),
  );

  const toggleGroup = (label: string) =>
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <aside
      className={`flex flex-col overflow-hidden${mobile ? " flex-1 min-h-0" : ""}`}
      style={{
        backgroundColor: "#1A1A1A",
        width: mobile ? "100%" : "340px",
        height: mobile ? undefined : "100%",
      }}
    >
      {/* Fixed header (hidden in mobile bottom sheet mode) */}
      {!mobile && (
        <div
          className="flex-shrink-0"
          style={{ padding: "14px 16px", borderBottom: "1px solid #2A2A2A" }}
        >
          <h2
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "#FFFFFF",
            }}
          >
            {t("weights.title")}
          </h2>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "10px",
              color: "#8A8A8A",
              marginTop: "6px",
              lineHeight: "1.5",
            }}
          >
            {t("weights.hint")}
          </p>
          {/* Weight mode toggle */}
          <div
            className="flex"
            style={{
              marginTop: "10px",
              backgroundColor: "#2A2A2A",
              borderRadius: "4px",
              padding: "4px",
              gap: "4px",
            }}
          >
            <div style={{ flex: "1 1 0", display: "flex" }}>
              <Tooltip
                content={
                  <div>
                    <div
                      style={{
                        marginBottom: "8px",
                        color: "#FFFFFF",
                        fontWeight: 600,
                      }}
                    >
                      {t("weights.independentTitle")}
                    </div>
                    <div>{t("weights.independentDesc")}</div>
                  </div>
                }
                side="top"
                triggerStyle={{ width: "100%" }}
                delay={300}
              >
                <button
                  onClick={() => onWeightModeChange("independent")}
                  className="flex items-center justify-center gap-1.5"
                  style={{
                    width: "100%",
                    padding: "6px 12px",
                    borderRadius: "3px",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "13px",
                    fontWeight: weightMode === "independent" ? 500 : 400,
                    backgroundColor:
                      weightMode === "independent"
                        ? "var(--color-accent)"
                        : "transparent",
                    color: weightMode === "independent" ? "#FFFFFF" : "#9E9E9E",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Sliders size={16} />
                  {t("weights.independentMode")}
                </button>
              </Tooltip>
            </div>
            <div style={{ flex: "1 1 0", display: "flex" }}>
              <Tooltip
                content={
                  <div>
                    <div
                      style={{
                        marginBottom: "8px",
                        color: "#FFFFFF",
                        fontWeight: 600,
                      }}
                    >
                      {t("weights.balancedTitle")}
                    </div>
                    <div>{t("weights.balancedDesc")}</div>
                  </div>
                }
                side="top"
                triggerStyle={{ width: "100%" }}
                delay={300}
              >
                <button
                  onClick={() => onWeightModeChange("balanced")}
                  className="flex items-center justify-center gap-1.5"
                  style={{
                    width: "100%",
                    padding: "6px 12px",
                    borderRadius: "3px",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "13px",
                    fontWeight: weightMode === "balanced" ? 500 : 400,
                    backgroundColor:
                      weightMode === "balanced"
                        ? "var(--color-accent)"
                        : "transparent",
                    color: weightMode === "balanced" ? "#FFFFFF" : "#9E9E9E",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Scale size={16} />
                  {t("weights.balancedMode")}
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable sliders */}
      <div className="flex-1 overflow-y-auto">
        {WEIGHT_GROUPS.map((group) => {
          const isOpen = !collapsed[group.label];
          const groupTotal = group.keys.reduce(
            (s, k) => s + (weights[k] ?? 0),
            0,
          );
          const groupBadge =
            weightMode === "independent"
              ? `${t("weights.averageBadge")} ${Math.round(groupTotal / group.keys.length)}`
              : `${groupTotal}%`;

          return (
            <div
              key={group.label}
              style={{ borderBottom: "1px solid #242424" }}
            >
              {/* Group header */}
              <button
                className="button-hover-exempt weight-panel-group-button w-full flex items-center"
                style={{
                  height: "40px",
                  padding: "0 14px",
                  gap: "8px",
                  backgroundColor: "#1A1A1A",
                }}
                onClick={() => toggleGroup(group.label)}
              >
                {group.icon}
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    color: "#9E9E9E",
                    flex: 1,
                    textAlign: "left",
                  }}
                >
                  {t(group.labelKey)}
                </span>
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
                    {groupBadge}
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  style={{
                    color: "#808080",
                    transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
                    transition: "transform 0.15s ease",
                    flexShrink: 0,
                  }}
                />
              </button>

              {/* Sliders */}
              {isOpen && (
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
                        <div
                          className="flex flex-col"
                          style={{
                            backgroundColor: "#141414",
                            padding: "10px 20px",
                            gap: "8px",
                          }}
                        >
                          {/* Season rows — 3 equal-width buttons per row */}
                          {[SEASON_ROW1, SEASON_ROW2].map((row, ri) => (
                            <div
                              key={ri}
                              className="flex"
                              style={{ gap: "4px" }}
                            >
                              {row.map((opt) => {
                                const active =
                                  climatePrefs.seasonType === opt.value;
                                return (
                                  <button
                                    key={opt.value}
                                    onClick={() =>
                                      onClimatePrefsChange({
                                        ...climatePrefs,
                                        seasonType: opt.value,
                                      })
                                    }
                                    style={{
                                      flex: 1,
                                      padding: "5px 0",
                                      borderRadius: "3px",
                                      border: "none",
                                      cursor: "pointer",
                                      fontFamily: "Inter, sans-serif",
                                      fontSize: "10px",
                                      fontWeight: "normal",
                                      backgroundColor: active
                                        ? "#8F5A3C"
                                        : "#2A2A2A",
                                      color: active ? "#FFFFFF" : "#8A8A8A",
                                      textAlign: "center",
                                    }}
                                  >
                                    {t(opt.labelKey)}
                                  </button>
                                );
                              })}
                            </div>
                          ))}
                          {/* Temperature header */}
                          <div className="flex items-center justify-between">
                            <span
                              style={{
                                fontFamily: "Inter, sans-serif",
                                fontSize: "12px",
                                color: "#8A8A8A",
                              }}
                            >
                              {t("climate.temperatureRange")}
                            </span>
                            <span
                              style={{
                                fontFamily: "IBM Plex Mono, monospace",
                                fontSize: "12px",
                                color: "#C2956A",
                              }}
                            >
                              {climatePrefs.minTemp}°C — {climatePrefs.maxTemp}
                              °C
                            </span>
                          </div>
                          {/* Min/Max sliders */}
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                style={{
                                  fontFamily: "Inter, sans-serif",
                                  fontSize: "12px",
                                  color: "#808080",
                                  width: "32px",
                                }}
                              >
                                {t("climate.min")}
                              </span>
                              <input
                                name="climate-min-temperature"
                                type="range"
                                min={-10}
                                max={45}
                                value={climatePrefs.minTemp}
                                onChange={(e) => {
                                  const v = Number(e.target.value);
                                  onClimatePrefsChange({
                                    ...climatePrefs,
                                    minTemp: Math.min(
                                      v,
                                      climatePrefs.maxTemp - 1,
                                    ),
                                  });
                                }}
                                className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                                style={{
                                  background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${((climatePrefs.minTemp + 10) / 55) * 100}%, #333333 ${((climatePrefs.minTemp + 10) / 55) * 100}%, #333333 100%)`,
                                }}
                                aria-label={t(
                                  "a11y.minimumPreferredTemperature",
                                  "Minimum preferred temperature",
                                )}
                              />
                              <span
                                style={{
                                  fontFamily: "IBM Plex Mono, monospace",
                                  fontSize: "12px",
                                  color: "#9E9E9E",
                                  width: "36px",
                                  textAlign: "right",
                                }}
                              >
                                {climatePrefs.minTemp}°
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                style={{
                                  fontFamily: "Inter, sans-serif",
                                  fontSize: "12px",
                                  color: "#808080",
                                  width: "32px",
                                }}
                              >
                                {t("climate.max")}
                              </span>
                              <input
                                name="climate-max-temperature"
                                type="range"
                                min={-10}
                                max={45}
                                value={climatePrefs.maxTemp}
                                onChange={(e) => {
                                  const v = Number(e.target.value);
                                  onClimatePrefsChange({
                                    ...climatePrefs,
                                    maxTemp: Math.max(
                                      v,
                                      climatePrefs.minTemp + 1,
                                    ),
                                  });
                                }}
                                className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                                style={{
                                  background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${((climatePrefs.maxTemp + 10) / 55) * 100}%, #333333 ${((climatePrefs.maxTemp + 10) / 55) * 100}%, #333333 100%)`,
                                }}
                                aria-label={t(
                                  "a11y.maximumPreferredTemperature",
                                  "Maximum preferred temperature",
                                )}
                              />
                              <span
                                style={{
                                  fontFamily: "IBM Plex Mono, monospace",
                                  fontSize: "12px",
                                  color: "#9E9E9E",
                                  width: "36px",
                                  textAlign: "right",
                                }}
                              >
                                {climatePrefs.maxTemp}°
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* ── VISA & STAY section (collapsible, at bottom) ─── */}
        {(() => {
          const isOpen = !collapsed["VISA & STAY"];
          const hasActiveFilter =
            nomadVisaOnly || schengenOnly || minTouristDays !== null;
          return (
            <div style={{ borderBottom: "1px solid #242424" }}>
              <button
                className="button-hover-exempt weight-panel-group-button w-full flex items-center"
                style={{
                  height: "40px",
                  padding: "0 14px",
                  gap: "8px",
                  backgroundColor: "#1A1A1A",
                }}
                onClick={() => toggleGroup("VISA & STAY")}
              >
                <Plane size={16} color="#7A9BAD" />
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    color: "#9E9E9E",
                    flex: 1,
                    textAlign: "left",
                  }}
                >
                  {t("visa.sectionLabel")}
                </span>
                {hasActiveFilter && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "#0E1E26",
                      borderRadius: "3px",
                      padding: "3px 8px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: "11px",
                        color: "#7AADBD",
                      }}
                    >
                      ON
                    </span>
                  </div>
                )}
                <ChevronDown
                  size={14}
                  style={{
                    color: "#808080",
                    transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
                    transition: "transform 0.15s ease",
                    flexShrink: 0,
                  }}
                />
              </button>

              {isOpen && (
                <div
                  style={{
                    backgroundColor: "#141414",
                    padding: "12px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {/* Nomad Visa toggle */}
                  <div className="flex items-center justify-between">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "12px",
                          color: "#CCCCCC",
                        }}
                      >
                        {t("visa.nomadVisaOnly")}
                      </span>
                      <Tooltip
                        content={
                          <div>
                            <div
                              style={{
                                marginBottom: "8px",
                                color: "#FFFFFF",
                                fontWeight: 600,
                              }}
                            >
                              {t("visa.nomadVisaTitle")}
                            </div>
                            <div>{t("visa.nomadVisaDesc")}</div>
                          </div>
                        }
                        side="top"
                      >
                        <Info
                          size={14}
                          color="#FFFFFF"
                          style={{
                            cursor: "pointer",
                            flexShrink: 0,
                            opacity: 0.6,
                          }}
                        />
                      </Tooltip>
                    </div>
                    <button
                      onClick={() => onNomadVisaOnlyChange(!nomadVisaOnly)}
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                      style={{
                        backgroundColor: nomadVisaOnly
                          ? "var(--color-accent)"
                          : "#333333",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                        style={{
                          transform: nomadVisaOnly
                            ? "translateX(26px)"
                            : "translateX(4px)",
                        }}
                      />
                    </button>
                  </div>

                  {/* Schengen toggle */}
                  <div className="flex items-center justify-between">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "12px",
                          color: "#CCCCCC",
                        }}
                      >
                        {t("visa.schengenArea")}
                      </span>
                      <Tooltip
                        content={
                          <div>
                            <div
                              style={{
                                marginBottom: "8px",
                                color: "#FFFFFF",
                                fontWeight: 600,
                              }}
                            >
                              {t("visa.schengenTitle")}
                            </div>
                            <div>{t("visa.schengenDesc")}</div>
                          </div>
                        }
                        side="top"
                      >
                        <Info
                          size={14}
                          color="#FFFFFF"
                          style={{
                            cursor: "pointer",
                            flexShrink: 0,
                            opacity: 0.6,
                          }}
                        />
                      </Tooltip>
                    </div>
                    <button
                      onClick={() => onSchengenOnlyChange(!schengenOnly)}
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                      style={{
                        backgroundColor: schengenOnly
                          ? "var(--color-accent)"
                          : "#333333",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                        style={{
                          transform: schengenOnly
                            ? "translateX(26px)"
                            : "translateX(4px)",
                        }}
                      />
                    </button>
                  </div>

                  {/* Min Tourist Stay */}
                  <div className="flex flex-col" style={{ gap: "6px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "12px",
                          color: "#CCCCCC",
                        }}
                      >
                        {t("visa.minTouristStay")}
                      </span>
                      <Tooltip
                        content={
                          <div>
                            <div
                              style={{
                                marginBottom: "8px",
                                color: "#FFFFFF",
                                fontWeight: 600,
                              }}
                            >
                              {t("visa.touristVisaTitle")}
                            </div>
                            <div>{t("visa.touristVisaDesc")}</div>
                          </div>
                        }
                        side="top"
                      >
                        <Info
                          size={14}
                          color="#FFFFFF"
                          style={{
                            cursor: "pointer",
                            flexShrink: 0,
                            opacity: 0.6,
                          }}
                        />
                      </Tooltip>
                    </div>
                    <div className="flex" style={{ gap: "4px" }}>
                      {([null, 30, 60, 90, 180] as const).map((days) => {
                        const active = minTouristDays === days;
                        const label =
                          days === null ? t("visa.any") : `${days}+`;
                        return (
                          <button
                            key={label}
                            onClick={() => onMinTouristDaysChange(days)}
                            style={{
                              flex: 1,
                              padding: "5px 0",
                              borderRadius: "3px",
                              border: "none",
                              cursor: "pointer",
                              fontFamily: "Inter, sans-serif",
                              fontSize: "10px",
                              backgroundColor: active ? "#8F5A3C" : "#2A2A2A",
                              color: active ? "#FFFFFF" : "#8A8A8A",
                              textAlign: "center",
                            }}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Fixed footer */}
      <div
        className="flex-shrink-0 sticky bottom-0"
        style={{ borderTop: "1px solid #333333", backgroundColor: "#1A1A1A" }}
      >
        <div className="flex flex-col gap-2" style={{ padding: "12px 16px" }}>
          {!weightsAreDefault && (
            <button
              onClick={handleShare}
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
          )}
          <button
            onClick={onReset}
            className="button-hover-exempt weight-panel-reset-button w-full flex items-center justify-center gap-2 rounded transition-colors"
            style={{
              backgroundColor: "transparent",
              color: "var(--color-accent-dim)",
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: 500,
              height: "40px",
              border: "1px solid #333333",
              borderRadius: "6px",
            }}
          >
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
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            {t("weights.resetToDefaults")}
          </button>
        </div>
      </div>
    </aside>
  );
}

export { defaultWeights }; // eslint-disable-line react-refresh/only-export-components

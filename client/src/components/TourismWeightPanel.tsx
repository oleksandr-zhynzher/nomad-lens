import { useState, useRef, useEffect, useCallback } from "react";
import {
  Info,
  ChevronDown,
  Sun,
  DollarSign,
  Calendar,
  Shield,
  Mountain,
  Music,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TourismWeightMap } from "../utils/tourismScoring";
import { TOURISM_GROUPS } from "../utils/types";
import { Tooltip } from "./Tooltip";
import type {
  TourismBudgetState,
  AccommodationType,
  TourismToggles,
  TravelDates,
} from "../hooks/useTourismWeightState";

const TOURISM_GROUP_ICONS: Record<string, React.ReactElement> = {
  safetyPeople: <Shield size={16} color="#6B9E6B" />,
  sightseeingNature: <Mountain size={16} color="#5B8FA8" />,
  activitiesLifestyle: <Music size={16} color="#8B5CF6" />,
};

function TourismWeightSlider({
  metricKey,
  value,
  onChange,
}: {
  metricKey: string;
  value: number;
  onChange: (key: string, value: number) => void;
}) {
  const { t } = useTranslation();
  const label = t(`tourism.metrics.${metricKey}`, metricKey);
  const desc = t(`tourism.metricDesc.${metricKey}`, "");

  return (
    <div className="flex flex-col" style={{ gap: "9px" }}>
      <div className="flex items-center justify-between">
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
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
          {desc && (
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
                  <div>{desc}</div>
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
          )}
        </div>
        <span
          style={{
            fontFamily: "IBM Plex Mono, monospace",
            fontSize: "11px",
            color: "var(--color-accent-dim)",
          }}
        >
          {value}
        </span>
      </div>
      <input
        name={`${metricKey}-tourism-weight`}
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(metricKey, Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${value}%, #333333 ${value}%, #333333 100%)`,
        }}
        aria-label={`${label} weight`}
      />
    </div>
  );
}

interface TourismWeightPanelProps {
  weights: TourismWeightMap;
  onChange: (key: string, value: number) => void;
  onReset: () => void;
  weightsAreDefault: boolean;
  budgetState?: TourismBudgetState;
  onBudgetChange?: <K extends keyof TourismBudgetState>(
    key: K,
    value: TourismBudgetState[K],
  ) => void;
  toggles?: TourismToggles;
  onToggleFieldChange?: <K extends keyof TourismToggles>(
    key: K,
    value: TourismToggles[K],
  ) => void;
  travelDates?: TravelDates;
  onTravelDatesChange?: React.Dispatch<React.SetStateAction<TravelDates>>;
  mobile?: boolean;
}

export function TourismWeightPanel({
  weights,
  onChange,
  onReset,
  mobile,
  budgetState,
  onBudgetChange,
  toggles,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onToggleFieldChange: _onToggleFieldChange,
  travelDates,
  onTravelDatesChange,
}: TourismWeightPanelProps) {
  const { t } = useTranslation();

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    TOURISM: false,
    BUDGET: false,
    DATES: false,
    ...Object.fromEntries(TOURISM_GROUPS.map((g) => [g.labelKey, false])),
  });

  const toggleGroup = (label: string) =>
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));

  const isOpen = !collapsed["TOURISM"];

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const onScroll = useCallback(() => {
    scrollRef.current?.classList.add("scrolling");
    clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      scrollRef.current?.classList.remove("scrolling");
    }, 800);
  }, []);
  useEffect(() => () => clearTimeout(scrollTimer.current), []);

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
            {t("tourismWeights.title", "Tourism Weights")}
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
            {t(
              "tourismWeights.hint",
              "Adjust the importance of each tourism metric to personalise the ranking.",
            )}
          </p>
        </div>
      )}

      {/* Scrollable sliders */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto auto-scrollbar"
      >
        {/* ── Budget group (top) ────────────────────────────────────── */}
        {budgetState && onBudgetChange && (
          <div style={{ borderBottom: "1px solid #242424" }}>
            <button
              className="button-hover-exempt weight-panel-group-button w-full flex items-center"
              style={{
                height: "40px",
                padding: "0 14px",
                gap: "8px",
                backgroundColor: "#1A1A1A",
              }}
              onClick={() => toggleGroup("BUDGET")}
            >
              <DollarSign size={16} color="#4CAF50" />
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
                {t("tourismBudget.groupLabel", "Travel Budget")}
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#0a2910",
                  borderRadius: "3px",
                  padding: "3px 8px",
                }}
              >
                <span
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "11px",
                    color: "#4CAF50",
                  }}
                >
                  ${budgetState.dailyBudget}
                </span>
              </div>
              <ChevronDown
                size={14}
                style={{
                  color: "#808080",
                  transform: !collapsed["BUDGET"]
                    ? "rotate(0deg)"
                    : "rotate(-90deg)",
                  transition: "transform 0.15s ease",
                  flexShrink: 0,
                }}
              />
            </button>

            {!collapsed["BUDGET"] && (
              <div
                className="flex flex-col"
                style={{ padding: "12px 16px", gap: "16px" }}
              >
                {/* Daily budget slider */}
                <div>
                  <div className="flex items-end gap-2 mb-2">
                    <span
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: 24,
                        fontWeight: 700,
                        color: "#E8E9EB",
                        lineHeight: 1,
                      }}
                    >
                      ${budgetState.dailyBudget}
                    </span>
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 12,
                        color: "#808080",
                        paddingBottom: 1,
                      }}
                    >
                      {t("tourismBudget.perDay", "/day")}
                    </span>
                  </div>
                  <input
                    name="tourism-daily-budget"
                    type="range"
                    min={10}
                    max={500}
                    step={5}
                    value={budgetState.dailyBudget}
                    onChange={(e) =>
                      onBudgetChange("dailyBudget", Number(e.target.value))
                    }
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${((budgetState.dailyBudget - 10) / 490) * 100}%, #333333 ${((budgetState.dailyBudget - 10) / 490) * 100}%, #333333 100%)`,
                    }}
                    aria-label="Daily budget slider"
                  />
                  <div className="flex justify-between mt-1.5">
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 10,
                        color: "#808080",
                      }}
                    >
                      $10
                    </span>
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 10,
                        color: "#808080",
                      }}
                    >
                      $500
                    </span>
                  </div>
                </div>

                {/* Budget blend slider */}
                <div className="flex flex-col" style={{ gap: 9 }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: 12,
                          color: "#FFFFFF",
                        }}
                      >
                        {t("tourismBudget.budgetBlend", "Budget blend")}
                      </span>
                      <Tooltip
                        content={
                          <div style={{ maxWidth: 240 }}>
                            <div
                              style={{
                                marginBottom: 6,
                                color: "#FFFFFF",
                                fontWeight: 600,
                              }}
                            >
                              {t("tourismBudget.budgetBlend", "Budget blend")}
                            </div>
                            <div>
                              {t(
                                "tourismBudget.budgetBlendDesc",
                                "Controls the balance between tourism quality scores and budget affordability in the ranking.",
                              )}
                            </div>
                          </div>
                        }
                        side="bottom"
                      >
                        <Info
                          size={13}
                          color="#FFFFFF"
                          style={{
                            cursor: "pointer",
                            flexShrink: 0,
                            opacity: 0.45,
                          }}
                        />
                      </Tooltip>
                    </div>
                    <span
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: 11,
                        color: "var(--color-accent-dim)",
                      }}
                    >
                      {budgetState.budgetBlend}
                    </span>
                  </div>
                  <input
                    name="tourism-budget-blend"
                    type="range"
                    min={0}
                    max={100}
                    value={budgetState.budgetBlend}
                    onChange={(e) =>
                      onBudgetChange("budgetBlend", Number(e.target.value))
                    }
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${budgetState.budgetBlend}%, #333333 ${budgetState.budgetBlend}%, #333333 100%)`,
                    }}
                    aria-label="Budget blend"
                  />
                  <div className="flex justify-between">
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 10,
                        color: "#808080",
                      }}
                    >
                      {t("tourismBudget.affordability", "Affordability")}
                    </span>
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 10,
                        color: "#808080",
                      }}
                    >
                      {t("tourismBudget.tourismQuality", "Tourism Quality")}
                    </span>
                  </div>
                </div>

                {/* Accommodation type */}
                <div className="flex flex-col" style={{ gap: 6 }}>
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 12,
                      color: "#FFFFFF",
                    }}
                  >
                    {t("tourismBudget.accommodation", "Accommodation")}
                  </span>
                  <div
                    className="flex"
                    style={{
                      backgroundColor: "#2A2A2A",
                      borderRadius: 4,
                      padding: 4,
                      gap: 4,
                    }}
                  >
                    {(["hotel", "airbnb", "hostel"] as const).map((opt) => {
                      const isHotel = opt === "hotel";
                      const active = isHotel
                        ? budgetState.accommodation.startsWith("hotel")
                        : opt === budgetState.accommodation;
                      return (
                        <button
                          key={opt}
                          onClick={() => {
                            if (isHotel) {
                              // If already on a hotel tier, just keep it; otherwise default to hotel3
                              if (
                                !budgetState.accommodation.startsWith("hotel")
                              ) {
                                onBudgetChange(
                                  "accommodation",
                                  "hotel3" as AccommodationType,
                                );
                              }
                            } else {
                              onBudgetChange(
                                "accommodation",
                                opt as AccommodationType,
                              );
                            }
                          }}
                          style={{
                            flex: 1,
                            padding: "5px 0",
                            borderRadius: 3,
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "Inter, sans-serif",
                            fontSize: 11,
                            fontWeight: active ? 500 : 400,
                            backgroundColor: active
                              ? "var(--color-accent)"
                              : "transparent",
                            color: active ? "#FFFFFF" : "#8A8A8A",
                            textAlign: "center",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {t(
                            `tourismBudget.accomTypes.${opt}`,
                            opt.charAt(0).toUpperCase() + opt.slice(1),
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {/* Hotel star sub-selector */}
                  {budgetState.accommodation.startsWith("hotel") && (
                    <div
                      className="flex"
                      style={{
                        backgroundColor: "#222",
                        borderRadius: 4,
                        padding: 4,
                        gap: 4,
                      }}
                    >
                      {([5, 4, 3, 2, 1] as const).map((stars) => {
                        const key = `hotel${stars}` as AccommodationType;
                        const active = budgetState.accommodation === key;
                        return (
                          <button
                            key={stars}
                            onClick={() => onBudgetChange("accommodation", key)}
                            style={{
                              flex: 1,
                              padding: "5px 0",
                              borderRadius: 3,
                              border: "none",
                              cursor: "pointer",
                              fontFamily: "Inter, sans-serif",
                              fontSize: 7,
                              letterSpacing: "0.5px",
                              fontWeight: active ? 600 : 400,
                              backgroundColor: active
                                ? "#3A3A3A"
                                : "transparent",
                              color: active ? "#FFD700" : "#666",
                              textAlign: "center",
                              transition: "all 0.15s ease",
                            }}
                          >
                            {"★".repeat(stars)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* People count */}
                <div className="flex flex-col" style={{ gap: 6 }}>
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 12,
                      color: "#FFFFFF",
                    }}
                  >
                    {t("tourismBudget.travellers", "Travellers")}
                  </span>
                  <div
                    className="inline-flex items-center"
                    style={{ borderRadius: 6, height: 36, gap: 4 }}
                  >
                    <button
                      onClick={() =>
                        onBudgetChange(
                          "peopleCount",
                          Math.max(1, budgetState.peopleCount - 1),
                        )
                      }
                      disabled={budgetState.peopleCount <= 1}
                      style={{
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor:
                          budgetState.peopleCount <= 1 ? "#222" : "#333",
                        border: "none",
                        borderRadius: 6,
                        color:
                          budgetState.peopleCount <= 1 ? "#555" : "#E8E9EB",
                        fontSize: 16,
                        fontWeight: 700,
                        cursor:
                          budgetState.peopleCount <= 1 ? "default" : "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      −
                    </button>
                    <span
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#E8E9EB",
                        minWidth: 24,
                        textAlign: "center",
                        userSelect: "none",
                      }}
                    >
                      {budgetState.peopleCount}
                    </span>
                    <button
                      onClick={() =>
                        onBudgetChange(
                          "peopleCount",
                          Math.min(10, budgetState.peopleCount + 1),
                        )
                      }
                      disabled={budgetState.peopleCount >= 10}
                      style={{
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor:
                          budgetState.peopleCount >= 10 ? "#222" : "#333",
                        border: "none",
                        borderRadius: 6,
                        color:
                          budgetState.peopleCount >= 10 ? "#555" : "#E8E9EB",
                        fontSize: 16,
                        fontWeight: 700,
                        cursor:
                          budgetState.peopleCount >= 10 ? "default" : "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Dining preference */}
                <div className="flex flex-col" style={{ gap: 6 }}>
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 12,
                      color: "#FFFFFF",
                    }}
                  >
                    {t("tourismBudget.diningLabel", "Food & Dining")}
                  </span>
                  <div
                    className="flex"
                    style={{
                      backgroundColor: "#2A2A2A",
                      borderRadius: 4,
                      padding: 4,
                      gap: 4,
                    }}
                  >
                    {(["market", "casual", "restaurants"] as const).map(
                      (opt) => {
                        const active = opt === budgetState.dining;
                        return (
                          <button
                            key={opt}
                            onClick={() => onBudgetChange("dining", opt)}
                            style={{
                              flex: 1,
                              padding: "5px 0",
                              borderRadius: 3,
                              border: "none",
                              cursor: "pointer",
                              fontFamily: "Inter, sans-serif",
                              fontSize: 11,
                              fontWeight: active ? 500 : 400,
                              backgroundColor: active
                                ? "var(--color-accent)"
                                : "transparent",
                              color: active ? "#FFFFFF" : "#8A8A8A",
                              textAlign: "center",
                              transition: "all 0.15s ease",
                            }}
                          >
                            {t(
                              `tourismBudget.diningTypes.${opt}`,
                              opt.charAt(0).toUpperCase() + opt.slice(1),
                            )}
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Travel Dates group ──────────────────────────────────── */}
        {travelDates && onTravelDatesChange && (
          <div style={{ borderBottom: "1px solid #242424" }}>
            <button
              className="button-hover-exempt weight-panel-group-button w-full flex items-center"
              style={{
                height: "40px",
                padding: "0 14px",
                gap: "8px",
                backgroundColor: "#1A1A1A",
              }}
              onClick={() => toggleGroup("DATES")}
            >
              <Calendar size={16} color="#64B5F6" />
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
                {t("tourismFilters.travelDates", "Travel Dates")}
              </span>
              {travelDates.startDate && travelDates.endDate && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#0a1929",
                    borderRadius: "3px",
                    padding: "3px 8px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "IBM Plex Mono, monospace",
                      fontSize: "10px",
                      color: "#64B5F6",
                    }}
                  >
                    {new Date(
                      travelDates.startDate + "T00:00",
                    ).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                    {" → "}
                    {new Date(
                      travelDates.endDate + "T00:00",
                    ).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
              <ChevronDown
                size={14}
                style={{
                  color: "#808080",
                  transform: !collapsed["DATES"]
                    ? "rotate(0deg)"
                    : "rotate(-90deg)",
                  transition: "transform 0.15s ease",
                  flexShrink: 0,
                }}
              />
            </button>

            {!collapsed["DATES"] && (
              <div
                className="flex flex-col"
                style={{ padding: "12px 16px", gap: "8px" }}
              >
                {/* Row 1: Labels */}
                <div className="flex" style={{ gap: 8 }}>
                  <span
                    className="flex-1"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 12,
                      color: "#808080",
                    }}
                  >
                    {t("tourismFilters.from", "From")}
                  </span>
                  <span
                    className="flex-1"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 12,
                      color: "#808080",
                    }}
                  >
                    {t("tourismFilters.to", "To")}
                  </span>
                </div>
                {/* Row 2: Month+Day pickers */}
                <div className="flex" style={{ gap: 8 }}>
                  {/* From picker */}
                  {(
                    [
                      {
                        id: "start",
                        dateVal: travelDates.startDate,
                        onChange: (mm: string, dd: string) => {
                          const newStart = mm ? `2000-${mm}-${dd}` : null;
                          onTravelDatesChange((prev) => ({
                            ...prev,
                            startDate: newStart,
                            endDate:
                              newStart &&
                              prev.endDate &&
                              newStart.slice(5) > prev.endDate.slice(5)
                                ? null
                                : prev.endDate,
                          }));
                        },
                      },
                      {
                        id: "end",
                        dateVal: travelDates.endDate,
                        onChange: (mm: string, dd: string) => {
                          const newEnd = mm ? `2000-${mm}-${dd}` : null;
                          onTravelDatesChange((prev) => ({
                            ...prev,
                            endDate: newEnd,
                          }));
                        },
                      },
                    ] as const
                  ).map(({ id, dateVal, onChange }) => {
                    const curMM = dateVal ? dateVal.slice(5, 7) : "";
                    const curDD = dateVal ? dateVal.slice(8, 10) : "01";
                    const selectStyle = {
                      fontFamily: "IBM Plex Mono, monospace",
                      fontSize: "12px",
                      padding: "6px 6px",
                      borderRadius: "3px",
                      border: "1px solid #333",
                      backgroundColor: "#1A1A1C",
                      color: "#E0E0E0",
                      colorScheme: "dark" as const,
                      outline: "none",
                      cursor: "pointer",
                      appearance: "none" as const,
                      WebkitAppearance: "none" as const,
                      textAlign: "center" as const,
                    };
                    const daysInMonth = curMM
                      ? new Date(2000, parseInt(curMM), 0).getDate()
                      : 31;
                    return (
                      <div
                        key={id}
                        style={{
                          flex: 1,
                          minWidth: 0,
                          display: "flex",
                          gap: 4,
                        }}
                      >
                        <select
                          value={curMM}
                          onChange={(e) => {
                            const mm = e.target.value;
                            const maxDay = mm
                              ? new Date(2000, parseInt(mm), 0).getDate()
                              : 31;
                            const safeDD = mm
                              ? String(
                                  Math.min(parseInt(curDD), maxDay),
                                ).padStart(2, "0")
                              : "01";
                            onChange(mm, mm ? safeDD : "01");
                          }}
                          style={{ ...selectStyle, flex: 2 }}
                          aria-label={
                            id === "start" ? "Start month" : "End month"
                          }
                        >
                          <option value="">Mon</option>
                          {[
                            "Jan",
                            "Feb",
                            "Mar",
                            "Apr",
                            "May",
                            "Jun",
                            "Jul",
                            "Aug",
                            "Sep",
                            "Oct",
                            "Nov",
                            "Dec",
                          ].map((m, i) => (
                            <option
                              key={m}
                              value={String(i + 1).padStart(2, "0")}
                            >
                              {m}
                            </option>
                          ))}
                        </select>
                        <select
                          value={curMM ? parseInt(curDD).toString() : ""}
                          disabled={!curMM}
                          onChange={(e) => {
                            const dd = String(
                              parseInt(e.target.value),
                            ).padStart(2, "0");
                            onChange(curMM, dd);
                          }}
                          style={{
                            ...selectStyle,
                            flex: 1.2,
                            opacity: curMM ? 1 : 0.4,
                          }}
                          aria-label={id === "start" ? "Start day" : "End day"}
                        >
                          {Array.from(
                            { length: daysInMonth },
                            (_, i) => i + 1,
                          ).map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
                {travelDates.startDate &&
                  travelDates.endDate &&
                  toggles &&
                  toggles.requiredTags.length > 0 && (
                    <p
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "11px",
                        color: "#666",
                        margin: 0,
                      }}
                    >
                      {t(
                        "tourismFilters.seasonalHint",
                        "Rankings are adjusted for seasonal quality during your travel dates.",
                      )}
                    </p>
                  )}
              </div>
            )}
          </div>
        )}

        {/* ── Tourism Metrics group ─────────────────────────────────── */}
        <div style={{ borderBottom: "1px solid #242424" }}>
          {/* Group header */}
          <button
            className="button-hover-exempt weight-panel-group-button w-full flex items-center"
            style={{
              height: "40px",
              padding: "0 14px",
              gap: "8px",
              backgroundColor: "#1A1A1A",
            }}
            onClick={() => toggleGroup("TOURISM")}
          >
            <Sun size={16} color="#D4A843" />
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
              {t("tourismWeights.groupLabel", "Tourism Metrics")}
            </span>
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

          {/* Grouped sliders */}
          {isOpen && (
            <div style={{ paddingTop: "4px", paddingBottom: "4px" }}>
              {TOURISM_GROUPS.map((group) => {
                const subOpen = !collapsed[group.labelKey];
                const subAvg = Math.round(
                  group.keys.reduce((s, k) => s + (weights[k] ?? 50), 0) /
                    group.keys.length,
                );
                return (
                  <div key={group.labelKey}>
                    <button
                      className="button-hover-exempt weight-panel-group-button w-full flex items-center"
                      style={{
                        height: "40px",
                        padding: "0 14px",
                        gap: "8px",
                        backgroundColor: "#1A1A1A",
                      }}
                      onClick={() => toggleGroup(group.labelKey)}
                    >
                      {TOURISM_GROUP_ICONS[group.labelKey]}
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
                        {t(
                          `tourismWeights.groups.${group.labelKey}`,
                          group.labelKey,
                        )}
                      </span>
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
                          {`${t("weights.averageBadge", "avg")} ${subAvg}`}
                        </span>
                      </div>
                      <ChevronDown
                        size={14}
                        style={{
                          color: "#808080",
                          transform: subOpen
                            ? "rotate(0deg)"
                            : "rotate(-90deg)",
                          transition: "transform 0.15s ease",
                          flexShrink: 0,
                        }}
                      />
                    </button>
                    {subOpen &&
                      group.keys.map((key) => (
                        <div key={key} style={{ padding: "10px 16px" }}>
                          <TourismWeightSlider
                            metricKey={key}
                            value={weights[key] ?? 50}
                            onChange={onChange}
                          />
                        </div>
                      ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Fixed footer */}
      <div
        className="flex-shrink-0 sticky bottom-0"
        style={{ borderTop: "1px solid #333333", backgroundColor: "#1A1A1A" }}
      >
        <div className="flex flex-col gap-2" style={{ padding: "12px 16px" }}>
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
            {t("weights.resetToDefaults", "Reset to defaults")}
          </button>
        </div>
      </div>
    </aside>
  );
}

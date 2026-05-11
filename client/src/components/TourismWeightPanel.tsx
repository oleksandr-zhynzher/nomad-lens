import { useState } from "react";
import { Info, Sun, DollarSign, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import type React from "react";
import { Tooltip } from "./Tooltip";
import type { TourismWeightMap } from "../utils/tourismScoring";
import { TOURISM_GROUPS } from "../utils/types";
import type {
  TourismBudgetState,
  AccommodationType,
  TourismToggles,
  TravelDates,
} from "../hooks/useTourismWeightState";
import { PanelShell } from "../shared/ui/panels/PanelShell";
import { CollapsibleSection } from "../shared/ui/panels/CollapsibleSection";
import { TourismWeightSlider } from "../shared/ui/panels/TourismWeightSlider";
import { ToggleGroup } from "../shared/ui/panels/ToggleGroup";
import { PeopleCountStepper } from "../shared/ui/panels/PeopleCountStepper";
import { TOURISM_GROUP_ICONS } from "../utils/tourismConstants";
import { getMonthOptions } from "../utils/dateUtils";
import { useScrollIndicator } from "../hooks/useScrollIndicator";

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
  onToggleFieldChange?: <K extends keyof TourismToggles>(key: K, value: TourismToggles[K]) => void;
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
  const { t, i18n } = useTranslation();
  const monthOptions = getMonthOptions(i18n.language);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    TOURISM: false,
    BUDGET: false,
    DATES: false,
    ...Object.fromEntries(TOURISM_GROUPS.map((g) => [g.labelKey, false])),
  });

  const toggleGroup = (label: string) =>
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));

  const { scrollRef, onScroll } = useScrollIndicator();

  return (
    <PanelShell
      title={t("tourismWeights.title", "Tourism Weights")}
      subtitle={t(
        "tourismWeights.hint",
        "Adjust the importance of each tourism metric to personalise the ranking.",
      )}
      onReset={onReset}
      mobile={mobile}
      scrollRef={scrollRef as React.RefObject<HTMLDivElement>}
      onScroll={onScroll}
    >
      {/* ── Budget group ──────────────────────────────────────────── */}
      {budgetState && onBudgetChange && (
        <CollapsibleSection
          id="tourism-budget"
          icon={<DollarSign size={16} color="#4CAF50" />}
          label={t("tourismBudget.groupLabel", "Travel Budget")}
          badge={
            <div className="flex items-center bg-[#0a2910] rounded-[3px] px-2 py-[3px]">
              <span className="font-mono text-[11px] text-[#4CAF50]">
                ${budgetState.dailyBudget}
              </span>
            </div>
          }
          isOpen={!collapsed["BUDGET"]}
          onToggle={() => toggleGroup("BUDGET")}
        >
          <div className="flex flex-col px-4 py-3 gap-4">
            {/* Daily budget slider */}
            <div>
              <div className="flex items-end gap-2 mb-2">
                <span className="font-mono text-2xl font-bold text-on-surface leading-none">
                  ${budgetState.dailyBudget}
                </span>
                <span className="text-xs text-dimmer pb-px">
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
                onChange={(e) => onBudgetChange("dailyBudget", Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${((budgetState.dailyBudget - 10) / 490) * 100}%, #333333 ${((budgetState.dailyBudget - 10) / 490) * 100}%, #333333 100%)`,
                }}
                aria-label={t("tourismBudget.dailyBudgetLabel", "Daily budget")}
              />
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-dimmer">$10</span>
                <span className="text-[10px] text-dimmer">$500</span>
              </div>
            </div>

            {/* Budget blend slider */}
            <div className="flex flex-col gap-[9px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-white">
                    {t("tourismBudget.budgetBlend", "Budget blend")}
                  </span>
                  <Tooltip
                    content={
                      <div className="max-w-[240px]">
                        <div className="mb-1.5 text-white font-semibold">
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
                      className="cursor-pointer shrink-0 opacity-45"
                    />
                  </Tooltip>
                </div>
                <span className="font-mono text-[11px] text-accent-dim">
                  {budgetState.budgetBlend}
                </span>
              </div>
              <input
                name="tourism-budget-blend"
                type="range"
                min={0}
                max={100}
                value={budgetState.budgetBlend}
                onChange={(e) => onBudgetChange("budgetBlend", Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${budgetState.budgetBlend}%, #333333 ${budgetState.budgetBlend}%, #333333 100%)`,
                }}
                aria-label={t("tourismBudget.budgetBlend", "Budget blend")}
              />
              <div className="flex justify-between">
                <span className="text-[10px] text-dimmer">
                  {t("tourismBudget.affordability", "Affordability")}
                </span>
                <span className="text-[10px] text-dimmer">
                  {t("tourismBudget.tourismQuality", "Tourism Quality")}
                </span>
              </div>
            </div>

            {/* Accommodation type */}
            <div className="flex flex-col gap-[6px]">
              <span className="text-xs text-white">
                {t("tourismBudget.accommodation", "Accommodation")}
              </span>
              <div className="flex bg-surface-4 rounded-[4px] p-1 gap-1">
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
                          if (!budgetState.accommodation.startsWith("hotel")) {
                            onBudgetChange("accommodation", "hotel3" as AccommodationType);
                          }
                        } else {
                          onBudgetChange("accommodation", opt as AccommodationType);
                        }
                      }}
                      className={`flex-1 py-[5px] rounded-[3px] border-none cursor-pointer text-[11px] transition-all duration-[150ms] text-center ${active ? "bg-accent text-white font-medium" : "bg-transparent text-dim font-normal"}`}
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
                <div className="flex bg-surface-2 rounded-[4px] p-1 gap-1">
                  {([5, 4, 3, 2, 1] as const).map((stars) => {
                    const key = `hotel${stars}` as AccommodationType;
                    const active = budgetState.accommodation === key;
                    return (
                      <button
                        key={stars}
                        onClick={() => onBudgetChange("accommodation", key)}
                        className={`flex-1 py-[5px] rounded-[3px] border-none cursor-pointer text-[7px] tracking-[0.5px] transition-all duration-[150ms] text-center ${active ? "bg-border font-semibold text-[#FFD700]" : "bg-transparent font-normal text-[#666]"}`}
                      >
                        {"★".repeat(stars)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* People count */}
            <div className="flex flex-col gap-[6px]">
              <span className="text-xs text-white">
                {t("tourismBudget.travellers", "Travellers")}
              </span>
              <PeopleCountStepper
                value={budgetState.peopleCount}
                min={1}
                max={10}
                onChange={(v) => onBudgetChange("peopleCount", v)}
              />
            </div>

            {/* Dining preference */}
            <div className="flex flex-col gap-[6px]">
              <span className="text-xs text-white">
                {t("tourismBudget.diningLabel", "Food & Dining")}
              </span>
              <ToggleGroup
                options={["market", "casual", "restaurants"] as const}
                value={budgetState.dining}
                onChange={(v) => onBudgetChange("dining", v)}
                labelFn={(opt) =>
                  t(`tourismBudget.diningTypes.${opt}`, opt.charAt(0).toUpperCase() + opt.slice(1))
                }
              />
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* ── Travel Dates group ──────────────────────────────────────── */}
      {travelDates && onTravelDatesChange && (
        <CollapsibleSection
          id="tourism-dates"
          icon={<Calendar size={16} color="#64B5F6" />}
          label={t("tourismFilters.travelDates", "Travel Dates")}
          badge={
            travelDates.startDate && travelDates.endDate ? (
              <div className="flex items-center bg-[#0a1929] rounded-[3px] px-2 py-[3px]">
                <span className="font-mono text-[10px] text-[#64B5F6]">
                  {new Date(travelDates.startDate + "T00:00").toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                  {" → "}
                  {new Date(travelDates.endDate + "T00:00").toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            ) : undefined
          }
          isOpen={!collapsed["DATES"]}
          onToggle={() => toggleGroup("DATES")}
        >
          <div className="flex flex-col px-4 py-3 gap-2">
            {/* Row 1: Labels */}
            <div className="flex gap-2">
              <span className="flex-1 text-xs text-dimmer">{t("tourismFilters.from", "From")}</span>
              <span className="flex-1 text-xs text-dimmer">{t("tourismFilters.to", "To")}</span>
            </div>
            {/* Row 2: Month+Day pickers */}
            <div className="flex gap-2">
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
                          newStart && prev.endDate && newStart.slice(5) > prev.endDate.slice(5)
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
                const daysInMonth = curMM ? new Date(2000, parseInt(curMM), 0).getDate() : 31;
                return (
                  <div key={id} className="flex-1 min-w-0 flex gap-1">
                    <select
                      value={curMM}
                      onChange={(e) => {
                        const mm = e.target.value;
                        const maxDay = mm ? new Date(2000, parseInt(mm), 0).getDate() : 31;
                        const safeDD = mm
                          ? String(Math.min(parseInt(curDD), maxDay)).padStart(2, "0")
                          : "01";
                        onChange(mm, mm ? safeDD : "01");
                      }}
                      style={{ ...selectStyle, flex: 2 }}
                      aria-label={
                        id === "start"
                          ? t("tourismFilters.startMonth", "Start month")
                          : t("tourismFilters.endMonth", "End month")
                      }
                    >
                      <option value="">{t("tourismFilters.monthPlaceholder", "Month")}</option>
                      {monthOptions.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={curMM ? parseInt(curDD).toString() : ""}
                      disabled={!curMM}
                      onChange={(e) => {
                        const dd = String(parseInt(e.target.value)).padStart(2, "0");
                        onChange(curMM, dd);
                      }}
                      style={{ ...selectStyle, flex: 1.2, opacity: curMM ? 1 : 0.4 }}
                      aria-label={
                        id === "start"
                          ? t("tourismFilters.startDay", "Start day")
                          : t("tourismFilters.endDay", "End day")
                      }
                    >
                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
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
                <p className="text-[11px] text-[#666] m-0">
                  {t(
                    "tourismFilters.seasonalHint",
                    "Rankings are adjusted for seasonal quality during your travel dates.",
                  )}
                </p>
              )}
          </div>
        </CollapsibleSection>
      )}

      {/* ── Tourism Metrics group ──────────────────────────────────── */}
      <CollapsibleSection
        id="tourism-metrics"
        icon={<Sun size={16} color="#D4A843" />}
        label={t("tourismWeights.groupLabel", "Tourism Metrics")}
        isOpen={!collapsed["TOURISM"]}
        onToggle={() => toggleGroup("TOURISM")}
      >
        <div className="py-1">
          {TOURISM_GROUPS.map((group) => {
            const subAvg = Math.round(
              group.keys.reduce((s, k) => s + (weights[k] ?? 50), 0) / group.keys.length,
            );
            return (
              <CollapsibleSection
                key={group.labelKey}
                id={`tourism-subgroup-${group.labelKey}`}
                icon={TOURISM_GROUP_ICONS[group.labelKey]}
                label={t(`tourismWeights.groups.${group.labelKey}`, group.labelKey)}
                badge={
                  <div className="flex items-center bg-[#291608] rounded-[3px] px-2 py-[3px]">
                    <span className="font-mono text-[11px] text-accent-dim">
                      {`${t("weights.averageBadge", "avg")} ${subAvg}`}
                    </span>
                  </div>
                }
                isOpen={!collapsed[group.labelKey]}
                onToggle={() => toggleGroup(group.labelKey)}
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
    </PanelShell>
  );
}

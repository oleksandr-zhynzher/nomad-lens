import { useState } from "react";
import { Info, Sun, DollarSign, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import type React from "react";
import { Tooltip } from "@core/ui";
import type { TourismWeightMap } from "@features/tourism/utils";
import { TOURISM_GROUPS } from "@core/models";
import type {
  TourismBudgetState,
  AccommodationType,
  TourismToggles,
  TravelDates,
} from "@features/tourism/hooks";
import { CollapsibleSection } from "@core/ui/panels";
import { PanelShell } from "@core/ui/panels";
import { PeopleCountStepper } from "@core/ui/panels";
import { ToggleGroup } from "@core/ui/panels";
import { TourismWeightSlider } from "@features/tourism/ui";
import { TOURISM_GROUP_ICONS } from "@features/tourism/constants";
import { getMonthOptions } from "@features/tourism/utils";
import { useScrollIndicator } from "@features/tourism/hooks";

interface TourismWeightPanelProps {
  readonly weights: TourismWeightMap;
  readonly onChange: (key: string, value: number) => void;
  readonly onReset: () => void;
  readonly weightsAreDefault: boolean;
  readonly budgetState?: TourismBudgetState;
  readonly onBudgetChange?: <K extends keyof TourismBudgetState>(
    key: K,
    value: TourismBudgetState[K],
  ) => void;
  readonly toggles?: TourismToggles;
  readonly onToggleFieldChange?: <K extends keyof TourismToggles>(
    key: K,
    value: TourismToggles[K],
  ) => void;
  readonly travelDates?: TravelDates;
  readonly onTravelDatesChange?: React.Dispatch<React.SetStateAction<TravelDates>>;
  readonly mobile?: boolean;
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

  const toggleGroup = (label: string) => {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  };

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
      {budgetState && onBudgetChange ? (
        <CollapsibleSection
          id="tourism-budget"
          icon={<DollarSign size={16} color="#4CAF50" />}
          label={t("tourismBudget.groupLabel", "Travel Budget")}
          badge={
            <div className="flex items-center rounded-[3px] bg-[#0a2910] px-2 py-[3px]">
              <span className="font-mono text-[11px] text-[#4CAF50]">
                ${budgetState.dailyBudget}
              </span>
            </div>
          }
          isOpen={!collapsed.BUDGET}
          onToggle={() => {
            toggleGroup("BUDGET");
          }}
        >
          <div className="flex flex-col gap-4 px-4 py-3">
            {/* Daily budget slider */}
            <div>
              <div className="mb-2 flex items-end gap-2">
                <span className="font-mono text-2xl leading-none font-bold text-on-surface">
                  ${budgetState.dailyBudget}
                </span>
                <span className="pb-px text-xs text-dimmer">
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
                onChange={(e) => {
                  onBudgetChange("dailyBudget", Number(e.target.value));
                }}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full [background:linear-gradient(to_right,var(--color-accent)_0%,var(--color-accent)_var(--pct),#333333_var(--pct),#333333_100%)]"
                style={
                  {
                    "--pct": `${((budgetState.dailyBudget - 10) / 490) * 100}%`,
                  } as React.CSSProperties
                }
                aria-label={t("tourismBudget.dailyBudgetLabel", "Daily budget")}
              />
              <div className="mt-1.5 flex justify-between">
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
                        <div className="mb-1.5 font-semibold text-white">
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
                      className="shrink-0 cursor-pointer opacity-45"
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
                onChange={(e) => {
                  onBudgetChange("budgetBlend", Number(e.target.value));
                }}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full [background:linear-gradient(to_right,var(--color-accent)_0%,var(--color-accent)_var(--pct),#333333_var(--pct),#333333_100%)]"
                style={{ "--pct": `${budgetState.budgetBlend}%` } as React.CSSProperties}
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
              <div className="flex gap-1 rounded-[4px] bg-surface-4 p-1">
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
                            onBudgetChange("accommodation", "hotel3");
                          }
                        } else {
                          onBudgetChange("accommodation", opt as AccommodationType);
                        }
                      }}
                      className={`flex-1 cursor-pointer rounded-[3px] border-none py-[5px] text-center text-[11px] transition-all duration-[150ms] ${active ? "bg-accent font-medium text-white" : "bg-transparent font-normal text-dim"}`}
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
              {budgetState.accommodation.startsWith("hotel") ? (
                <div className="flex gap-1 rounded-[4px] bg-surface-2 p-1">
                  {([5, 4, 3, 2, 1] as const).map((stars) => {
                    const key = `hotel${stars}` as AccommodationType;
                    const active = budgetState.accommodation === key;
                    return (
                      <button
                        key={stars}
                        onClick={() => {
                          onBudgetChange("accommodation", key);
                        }}
                        className={`flex-1 cursor-pointer rounded-[3px] border-none py-[5px] text-center text-[7px] tracking-[0.5px] transition-all duration-[150ms] ${active ? "bg-border font-semibold text-[#FFD700]" : "bg-transparent font-normal text-[#666]"}`}
                      >
                        {"★".repeat(stars)}
                      </button>
                    );
                  })}
                </div>
              ) : null}
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
                onChange={(v) => {
                  onBudgetChange("peopleCount", v);
                }}
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
                onChange={(v) => {
                  onBudgetChange("dining", v);
                }}
                labelFn={(opt) =>
                  t(`tourismBudget.diningTypes.${opt}`, opt.charAt(0).toUpperCase() + opt.slice(1))
                }
              />
            </div>
          </div>
        </CollapsibleSection>
      ) : null}

      {/* ── Travel Dates group ──────────────────────────────────────── */}
      {travelDates && onTravelDatesChange ? (
        <CollapsibleSection
          id="tourism-dates"
          icon={<Calendar size={16} color="#64B5F6" />}
          label={t("tourismFilters.travelDates", "Travel Dates")}
          badge={
            travelDates.startDate != null && travelDates.endDate != null ? (
              <div className="flex items-center rounded-[3px] bg-[#0a1929] px-2 py-[3px]">
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
          isOpen={!collapsed.DATES}
          onToggle={() => {
            toggleGroup("DATES");
          }}
        >
          <div className="flex flex-col gap-2 px-4 py-3">
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
                      const newStart = mm !== "" ? `2000-${mm}-${dd}` : null;
                      onTravelDatesChange((prev) => ({
                        ...prev,
                        startDate: newStart,
                        endDate:
                          newStart !== null &&
                          prev.endDate !== null &&
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
                      const newEnd = mm !== "" ? `2000-${mm}-${dd}` : null;
                      onTravelDatesChange((prev) => ({
                        ...prev,
                        endDate: newEnd,
                      }));
                    },
                  },
                ] as const
              ).map(({ id, dateVal, onChange: onDateChange }) => {
                const curMM = dateVal !== null ? dateVal.slice(5, 7) : "";
                const curDD = dateVal !== null ? dateVal.slice(8, 10) : "01";
                const selectBaseClass =
                  "font-mono text-xs rounded-sm border border-border bg-surface text-[#e0e0e0] [color-scheme:dark] outline-none cursor-pointer appearance-none text-center px-1.5 py-1.5 min-w-0";
                const daysInMonth =
                  curMM !== "" ? new Date(2000, Number.parseInt(curMM), 0).getDate() : 31;
                return (
                  <div key={id} className="flex min-w-0 flex-1 gap-1">
                    <select
                      value={curMM}
                      onChange={(e) => {
                        const mm = e.target.value;
                        const maxDay =
                          mm !== "" ? new Date(2000, Number.parseInt(mm), 0).getDate() : 31;
                        const safeDD =
                          mm !== ""
                            ? String(Math.min(Number.parseInt(curDD), maxDay)).padStart(2, "0")
                            : "01";
                        onDateChange(mm, mm !== "" ? safeDD : "01");
                      }}
                      className={`${selectBaseClass} [flex:2]`}
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
                      value={curMM !== "" ? Number.parseInt(curDD).toString() : ""}
                      disabled={curMM === ""}
                      onChange={(e) => {
                        const dd = String(Number.parseInt(e.target.value)).padStart(2, "0");
                        onDateChange(curMM, dd);
                      }}
                      className={`${selectBaseClass} [flex:1.2] ${curMM !== "" ? "opacity-100" : "opacity-40"}`}
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
            {travelDates.startDate !== null &&
            travelDates.endDate !== null &&
            toggles !== undefined &&
            toggles.requiredTags.length > 0 ? (
              <p className="m-0 text-[11px] text-[#666]">
                {t(
                  "tourismFilters.seasonalHint",
                  "Rankings are adjusted for seasonal quality during your travel dates.",
                )}
              </p>
            ) : null}
          </div>
        </CollapsibleSection>
      ) : null}

      {/* ── Tourism Metrics group ──────────────────────────────────── */}
      <CollapsibleSection
        id="tourism-metrics"
        icon={<Sun size={16} color="#D4A843" />}
        label={t("tourismWeights.groupLabel", "Tourism Metrics")}
        isOpen={!collapsed.TOURISM}
        onToggle={() => {
          toggleGroup("TOURISM");
        }}
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
    </PanelShell>
  );
}

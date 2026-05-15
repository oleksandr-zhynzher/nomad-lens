import { useState } from "react";
import { Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import type React from "react";
import { CollapsibleSection } from "@core/ui/panels";
import type { TourismToggles, TravelDates } from "@features/tourism/hooks";
import { getMonthOptions } from "@features/tourism/utils";

type TravelDateFieldId = "start" | "end";

interface TravelDateFieldModel {
  readonly id: TravelDateFieldId;
  readonly dateVal: string | null;
  readonly setDate: (month: string, day: string) => void;
}

const TRAVEL_DATE_SELECT_BASE_CLASS =
  "font-mono text-xs rounded-sm border border-border bg-surface text-[#e0e0e0] [color-scheme:dark] outline-none cursor-pointer appearance-none text-center px-1.5 py-1.5 min-w-0";

function getDaysInMonth(month: string): number {
  if (month === "") return 31;
  return new Date(2000, Number.parseInt(month, 10), 0).getDate();
}

function normalizeDayForMonth(day: string, month: string): string {
  const parsedDay = Number.parseInt(day, 10);
  const safeDay = Number.isNaN(parsedDay) ? 1 : Math.min(parsedDay, getDaysInMonth(month));
  return String(safeDay).padStart(2, "0");
}

function buildTravelDateFieldModels(
  travelDates: TravelDates,
  onTravelDatesChange: React.Dispatch<React.SetStateAction<TravelDates>>,
): TravelDateFieldModel[] {
  return [
    {
      id: "start",
      dateVal: travelDates.startDate,
      setDate: (month: string, day: string) => {
        const nextStartDate = month !== "" ? `2000-${month}-${day}` : null;
        onTravelDatesChange((prev) => ({
          ...prev,
          startDate: nextStartDate,
          endDate:
            nextStartDate !== null &&
            prev.endDate !== null &&
            nextStartDate.slice(5) > prev.endDate.slice(5)
              ? null
              : prev.endDate,
        }));
      },
    },
    {
      id: "end",
      dateVal: travelDates.endDate,
      setDate: (month: string, day: string) => {
        const nextEndDate = month !== "" ? `2000-${month}-${day}` : null;
        onTravelDatesChange((prev) => ({
          ...prev,
          endDate: nextEndDate,
        }));
      },
    },
  ];
}

interface TourismTravelDatesSectionProps {
  readonly travelDates: TravelDates;
  readonly onTravelDatesChange: React.Dispatch<React.SetStateAction<TravelDates>>;
  readonly toggles?: TourismToggles;
}

export function TourismTravelDatesSection({
  travelDates,
  onTravelDatesChange,
  toggles,
}: TourismTravelDatesSectionProps) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const monthOptions = getMonthOptions(i18n.language);
  const travelDateFields = buildTravelDateFieldModels(travelDates, onTravelDatesChange);

  return (
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
      isOpen={isOpen}
      onToggle={() => {
        setIsOpen((prev) => !prev);
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
          {travelDateFields.map(({ id, dateVal, setDate }) => {
            const curMM = dateVal !== null ? dateVal.slice(5, 7) : "";
            const curDD = dateVal !== null ? dateVal.slice(8, 10) : "01";
            const daysInMonth = getDaysInMonth(curMM);
            return (
              <div key={id} className="flex min-w-0 flex-1 gap-1">
                <select
                  value={curMM}
                  onChange={(e) => {
                    const month = e.target.value;
                    const day = month === "" ? "01" : normalizeDayForMonth(curDD, month);
                    setDate(month, day);
                  }}
                  className={`${TRAVEL_DATE_SELECT_BASE_CLASS} [flex:2]`}
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
                    setDate(curMM, normalizeDayForMonth(e.target.value, curMM));
                  }}
                  className={`${TRAVEL_DATE_SELECT_BASE_CLASS} [flex:1.2] ${curMM !== "" ? "opacity-100" : "opacity-40"}`}
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
  );
}

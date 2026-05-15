import { useTranslation } from "react-i18next";

const TRAVEL_DATE_SELECT_BASE_CLASS =
  "font-mono text-xs rounded-sm border border-border bg-surface text-[#e0e0e0] [color-scheme:dark] outline-none cursor-pointer appearance-none text-center px-1.5 py-1.5 min-w-0";

type TravelDateFieldId = "start" | "end";

export interface TravelDateFieldModel {
  readonly id: TravelDateFieldId;
  readonly dateVal: string | null;
  readonly setDate: (month: string, day: string) => void;
}

function getDaysInMonth(month: string): number {
  if (month === "") return 31;
  return new Date(2000, Number.parseInt(month, 10), 0).getDate();
}

function normalizeDayForMonth(day: string, month: string): string {
  const parsedDay = Number.parseInt(day, 10);
  const safeDay = Number.isNaN(parsedDay) ? 1 : Math.min(parsedDay, getDaysInMonth(month));
  return String(safeDay).padStart(2, "0");
}

interface TourismDatePickerPairProps {
  readonly travelDateFields: TravelDateFieldModel[];
  readonly monthOptions: Array<{ value: string; label: string }>;
}

export function TourismDatePickerPair({
  travelDateFields,
  monthOptions,
}: TourismDatePickerPairProps) {
  const { t } = useTranslation();
  return (
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
  );
}

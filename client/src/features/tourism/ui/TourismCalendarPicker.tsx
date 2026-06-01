import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const STORAGE_YEAR = 2000;
const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function buildDayLabel(month: number, day: number, selected: boolean, inRange: boolean): string {
  const dateLabel = `${MONTH_NAMES[month]} ${day}`;
  if (selected) return `${dateLabel}, selected`;
  if (inRange) return `${dateLabel}, in selected range`;
  return dateLabel;
}

function parseStored(stored: string | null): { month: number; day: number } | null {
  if (stored === null) return null;
  return {
    month: Number.parseInt(stored.slice(5, 7), 10) - 1,
    day: Number.parseInt(stored.slice(8, 10), 10),
  };
}

function toStoredString(month: number, day: number): string {
  return `${STORAGE_YEAR}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getDaysInMonth(month: number): number {
  return new Date(2000, month + 1, 0).getDate();
}

function getFirstDayOfWeek(month: number): number {
  return new Date(2000, month, 1).getDay();
}

function compareDates(
  a: { month: number; day: number },
  b: { month: number; day: number },
): number {
  if (a.month !== b.month) return a.month < b.month ? -1 : 1;
  if (a.day !== b.day) return a.day < b.day ? -1 : 1;
  return 0;
}

interface TourismCalendarPickerProps {
  readonly startDate: string | null;
  readonly endDate: string | null;
  readonly onChange: (start: string | null, end: string | null) => void;
}

interface CalendarDayButtonProps {
  readonly day: number;
  readonly month: number;
  readonly start: { month: number; day: number } | null;
  readonly end: { month: number; day: number } | null;
  readonly today: Date;
  readonly onSelect: (month: number, day: number) => void;
}

function getDayClasses(
  month: number,
  day: number,
  start: { month: number; day: number } | null,
  end: { month: number; day: number } | null,
  today: Date,
): string {
  const d = { month, day };
  const isStart = start !== null && compareDates(d, start) === 0;
  const isEnd = end !== null && compareDates(d, end) === 0;
  const inRange =
    start !== null && end !== null && compareDates(d, start) > 0 && compareDates(d, end) < 0;
  const isToday = month === today.getMonth() && day === today.getDate();

  if (isStart || isEnd) {
    return "h-8 w-full text-[12px] cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background bg-accent text-black font-semibold rounded";
  }
  if (inRange) {
    return "h-8 w-full text-[12px] cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background bg-[#1e2b1e] text-on-surface";
  }
  if (isToday) {
    return "h-8 w-full text-[12px] cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background font-bold text-accent hover:bg-surface-3 rounded";
  }
  return "h-8 w-full text-[12px] cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background text-on-surface hover:bg-surface-3 rounded";
}

function CalendarDayButton({ day, month, start, end, today, onSelect }: CalendarDayButtonProps) {
  const d = { month, day };
  const isStart = start !== null && compareDates(d, start) === 0;
  const isEnd = end !== null && compareDates(d, end) === 0;
  const inRange =
    start !== null && end !== null && compareDates(d, start) > 0 && compareDates(d, end) < 0;

  return (
    <td>
      <button
        type="button"
        aria-current={month === today.getMonth() && day === today.getDate() ? "date" : undefined}
        aria-label={buildDayLabel(month, day, isStart || isEnd, inRange)}
        onClick={() => {
          onSelect(month, day);
        }}
        className={getDayClasses(month, day, start, end, today)}
      >
        {day}
      </button>
    </td>
  );
}

export function TourismCalendarPicker({
  startDate,
  endDate,
  onChange,
}: TourismCalendarPickerProps) {
  const { t } = useTranslation();
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(parseStored(startDate)?.month ?? today.getMonth());

  const start = parseStored(startDate);
  const end = parseStored(endDate);

  function handleDayClick(month: number, day: number) {
    const clicked = { month, day };

    if (start === null || end !== null) {
      onChange(toStoredString(month, day), null);
      return;
    }

    if (compareDates(clicked, start) < 0) {
      onChange(toStoredString(month, day), toStoredString(start.month, start.day));
    } else {
      onChange(toStoredString(start.month, start.day), toStoredString(month, day));
    }
  }

  const daysInMonth = getDaysInMonth(viewMonth);
  const firstDow = getFirstDayOfWeek(viewMonth);

  const cells: Array<number | null> = [
    ...Array.from<null>({ length: firstDow }).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: Array<Array<number | null>> = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  return (
    <div className="flex flex-col gap-2 select-none">
      <div className="mb-1 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => {
            setViewMonth((m) => (m === 0 ? 11 : m - 1));
          }}
          className="flex size-6 items-center justify-center rounded text-dimmer transition-colors hover:bg-surface-3 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Previous month"
        >
          <ChevronLeft size={14} />
        </button>
        <span
          className="text-[12px] font-semibold tracking-widest text-white uppercase"
          aria-live="polite"
        >
          {MONTH_NAMES[viewMonth]}
        </span>
        <button
          type="button"
          onClick={() => {
            setViewMonth((m) => (m === 11 ? 0 : m + 1));
          }}
          className="flex size-6 items-center justify-center rounded text-dimmer transition-colors hover:bg-surface-3 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Next month"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <table
        className="w-full border-collapse"
        aria-label={t("tourismFilters.dateRangeCalendar", "Travel date range calendar")}
      >
        <thead>
          <tr className="mb-1 grid grid-cols-7">
            {WEEK_DAYS.map((wd) => (
              <th
                key={wd}
                scope="col"
                className="pb-1 text-center text-[10px] text-dimmer uppercase"
                aria-label={wd}
              >
                {wd}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="flex flex-col gap-0.5">
          {rows.map((row, ri) => (
            <tr key={`row-${viewMonth}-${String(ri)}`} className="grid grid-cols-7">
              {row.map((day, ci) =>
                day === null ? (
                  <td key={`empty-${viewMonth}-${String(ri)}-${String(ci)}`} />
                ) : (
                  <CalendarDayButton
                    key={`${viewMonth}-${day}`}
                    day={day}
                    month={viewMonth}
                    start={start}
                    end={end}
                    today={today}
                    onSelect={handleDayClick}
                  />
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {startDate !== null || endDate !== null ? (
        <button
          type="button"
          onClick={() => {
            onChange(null, null);
          }}
          className="mt-1 w-full rounded text-center text-[11px] text-dimmer transition-colors hover:text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {t("tourismFilters.clearDates", "Clear dates")}
        </button>
      ) : null}
    </div>
  );
}

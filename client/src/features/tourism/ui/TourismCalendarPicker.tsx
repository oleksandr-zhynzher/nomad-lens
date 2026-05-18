import type { DateRange } from "react-day-picker";
import { DayPicker } from "react-day-picker";
import { useTranslation } from "react-i18next";

/** Year used internally to store month-day values year-agnostically. */
const STORAGE_YEAR = 2000;

const CURRENT_YEAR = new Date().getFullYear();

function toDisplayDate(stored: string | null): Date | undefined {
  if (stored === null) return undefined;
  const mm = Number.parseInt(stored.slice(5, 7), 10) - 1;
  const dd = Number.parseInt(stored.slice(8, 10), 10);
  return new Date(CURRENT_YEAR, mm, dd);
}

function toStoredString(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${STORAGE_YEAR}-${mm}-${dd}`;
}

interface TourismCalendarPickerProps {
  readonly startDate: string | null;
  readonly endDate: string | null;
  readonly onChange: (start: string | null, end: string | null) => void;
}

const CAL_CLASSES = {
  root: "w-full",
  months: "w-full",
  month: "w-full",
  month_caption: "flex items-center justify-between px-1 mb-2",
  caption_label: "text-[12px] font-semibold text-white uppercase tracking-widest",
  nav: "flex items-center gap-1",
  button_previous:
    "flex h-6 w-6 items-center justify-center rounded text-dimmer hover:text-white hover:bg-surface-3 transition-colors",
  button_next:
    "flex h-6 w-6 items-center justify-center rounded text-dimmer hover:text-white hover:bg-surface-3 transition-colors",
  weekdays: "grid grid-cols-7 mb-1",
  weekday: "text-center text-[10px] text-dimmer uppercase pb-1",
  weeks: "flex flex-col gap-0.5",
  week: "grid grid-cols-7",
  day: "flex items-center justify-center p-0",
  day_button:
    "h-8 w-full text-[12px] text-on-surface rounded cursor-pointer transition-colors hover:bg-surface-3 focus:outline-none",
  selected: "bg-[#1a2a1a] text-white",
  today: "font-bold text-accent",
  range_start: "rounded-l-md !bg-accent !text-black font-semibold",
  range_end: "rounded-r-md !bg-accent !text-black font-semibold",
  range_middle: "rounded-none bg-[#1e2b1e] text-on-surface",
  outside: "opacity-25",
  disabled: "opacity-20 cursor-not-allowed",
};

export function TourismCalendarPicker({
  startDate,
  endDate,
  onChange,
}: TourismCalendarPickerProps) {
  const { t } = useTranslation();

  const selected: DateRange = {
    from: toDisplayDate(startDate),
    to: toDisplayDate(endDate),
  };

  const defaultMonth = selected.from ?? new Date(CURRENT_YEAR, new Date().getMonth(), 1);

  function handleSelect(range: DateRange | undefined) {
    if (range == null) {
      onChange(null, null);
      return;
    }
    onChange(
      range.from != null ? toStoredString(range.from) : null,
      range.to != null ? toStoredString(range.to) : null,
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <DayPicker
        mode="range"
        selected={selected}
        onSelect={handleSelect}
        defaultMonth={defaultMonth}
        classNames={CAL_CLASSES}
        showOutsideDays
      />
      {startDate !== null || endDate !== null ? (
        <button
          type="button"
          onClick={() => {
            onChange(null, null);
          }}
          className="w-full text-center text-[11px] text-dimmer transition-colors hover:text-on-surface"
        >
          {t("tourismFilters.clearDates", "Clear dates")}
        </button>
      ) : null}
    </div>
  );
}

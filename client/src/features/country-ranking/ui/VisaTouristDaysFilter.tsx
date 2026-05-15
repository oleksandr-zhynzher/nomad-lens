import { useTranslation } from "react-i18next";

interface VisaTouristDaysFilterProps {
  readonly minTouristDays: number | null;
  readonly onMinTouristDaysChange: (v: number | null) => void;
}

const TOURIST_DAY_OPTIONS = [null, 30, 60, 90, 180] as const;

export function VisaTouristDaysFilter({
  minTouristDays,
  onMinTouristDaysChange,
}: VisaTouristDaysFilterProps) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-1">
      {TOURIST_DAY_OPTIONS.map((days) => {
        const active = minTouristDays === days;
        const label = days === null ? t("visa.any") : `${days}+`;
        return (
          <button
            key={label}
            onClick={() => {
              onMinTouristDaysChange(days);
            }}
            className={`flex-1 cursor-pointer rounded-[3px] border-0 py-[5px] text-center text-[10px] ${active ? "bg-accent text-white" : "bg-surface-4 text-dim"}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

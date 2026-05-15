import { useState } from "react";
import { Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import type React from "react";
import { CollapsibleSection } from "@core/ui/panels";
import type { TourismToggles, TravelDates } from "@features/tourism/hooks";
import { getMonthOptions } from "@features/tourism/utils";
import { TourismDatePickerPair } from "./TourismDatePickerPair";
import type { TravelDateFieldModel } from "./TourismDatePickerPair";

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
  const travelDateFields: TravelDateFieldModel[] = [
    {
      id: "start",
      dateVal: travelDates.startDate,
      setDate: (month, day) => {
        const next = month !== "" ? `2000-${month}-${day}` : null;
        onTravelDatesChange((p) => ({
          ...p,
          startDate: next,
          endDate:
            next === null || p.endDate === null || next.slice(5) <= p.endDate.slice(5)
              ? p.endDate
              : null,
        }));
      },
    },
    {
      id: "end",
      dateVal: travelDates.endDate,
      setDate: (month, day) => {
        onTravelDatesChange((p) => ({
          ...p,
          endDate: month !== "" ? `2000-${month}-${day}` : null,
        }));
      },
    },
  ];

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
        <div className="flex gap-2">
          <span className="flex-1 text-xs text-dimmer">{t("tourismFilters.from", "From")}</span>
          <span className="flex-1 text-xs text-dimmer">{t("tourismFilters.to", "To")}</span>
        </div>
        <TourismDatePickerPair travelDateFields={travelDateFields} monthOptions={monthOptions} />
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

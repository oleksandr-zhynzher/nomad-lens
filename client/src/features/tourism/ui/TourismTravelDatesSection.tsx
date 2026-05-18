import { CollapsibleSection } from "@core/ui/panels";
import type { TourismToggles, TravelDates } from "@features/tourism/hooks";
import { Calendar } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { TourismCalendarPicker } from "./TourismCalendarPicker";

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
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <CollapsibleSection
      id="tourism-dates"
      icon={<Calendar size={16} color="#64B5F6" />}
      label={t("tourismFilters.travelDates", "Travel Dates")}
      {...(travelDates.startDate != null &&
        travelDates.endDate != null && {
          badge: (
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
          ),
        })}
      isOpen={isOpen}
      onToggle={() => {
        setIsOpen((prev) => !prev);
      }}
    >
      <div className="px-4 py-3">
        <TourismCalendarPicker
          startDate={travelDates.startDate}
          endDate={travelDates.endDate}
          onChange={(start, end) => {
            onTravelDatesChange((p) => ({ ...p, startDate: start, endDate: end }));
          }}
        />
        {travelDates.startDate !== null &&
        travelDates.endDate !== null &&
        toggles !== undefined &&
        toggles.requiredTags.length > 0 ? (
          <p className="m-0 mt-2 text-[11px] text-[#666]">
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

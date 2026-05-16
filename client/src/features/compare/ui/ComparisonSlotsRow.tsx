import type { ClimatePreferences, CountryData, WeightMap } from "@core/models";
import type { Dispatch, RefObject, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

import { ComparisonAddButton } from "./ComparisonAddButton";
import { ComparisonSlotItem } from "./ComparisonSlotItem";

interface ComparisonSlot {
  readonly country: CountryData;
  readonly color: string;
  readonly index: number;
}

interface ComparisonSlotsRowProps {
  readonly sortedCountries: ComparisonSlot[];
  readonly weights: WeightMap;
  readonly climatePrefs: ClimatePreferences;
  readonly lang: string;
  readonly langPrefix: string;
  readonly onRemove: (index: number) => void;
  readonly addBtnRef: RefObject<HTMLDivElement | null>;
  readonly dropdownOpen: boolean;
  readonly setDropdownOpen: Dispatch<SetStateAction<boolean>>;
  readonly setDropdownPos: Dispatch<SetStateAction<{ top: number; left: number } | null>>;
}

export function ComparisonSlotsRow({
  sortedCountries,
  weights,
  climatePrefs,
  lang,
  langPrefix,
  onRemove,
  addBtnRef,
  dropdownOpen,
  setDropdownOpen,
  setDropdownPos,
}: ComparisonSlotsRowProps) {
  const { t } = useTranslation();
  return (
    <div className="relative">
      <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {sortedCountries.map((slot) => (
          <ComparisonSlotItem
            key={slot.country.code}
            country={slot.country}
            color={slot.color}
            weights={weights}
            climatePrefs={climatePrefs}
            lang={lang}
            langPrefix={langPrefix}
            onRemove={() => onRemove(slot.index)}
          />
        ))}
        <div ref={addBtnRef} className="w-[148px] shrink-0 md:w-[180px]">
          <ComparisonAddButton
            label={t("compare.addCountry")}
            onClick={() => {
              if (!dropdownOpen && addBtnRef.current) {
                const rect = addBtnRef.current.getBoundingClientRect();
                const left = Math.max(8, Math.min(rect.left, window.innerWidth - 320 - 8));
                const fitsBelow = rect.bottom + 8 + 370 <= window.innerHeight;
                setDropdownPos({ top: fitsBelow ? rect.bottom + 8 : rect.top - 370 - 8, left });
              }
              setDropdownOpen((p) => !p);
            }}
          />
        </div>
      </div>
      <div className="pointer-events-none absolute top-0 right-0 bottom-0 hidden w-12 [background:linear-gradient(to_right,transparent,#0F1114)] md:block" />
    </div>
  );
}

import type { Dispatch, RefObject, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { CountryData } from "@core/models";
import { localizeCountry, regionKey, tourismScoreColourClass } from "@core/utils";
import { computeTourismScore } from "@features/tourism/utils";
import { ComparisonAddButton } from "./ComparisonAddButton";
import { ComparisonSlotCard } from "./ComparisonSlotCard";
import { CountryPickerDropdown } from "./CountryPickerDropdown";

interface ComparisonSlot {
  readonly country: CountryData;
  readonly color: string;
  readonly index: number;
}

interface TourismComparisonSlotsProps {
  readonly sortedCountries: ComparisonSlot[];
  readonly lang: string;
  readonly langPrefix: string;
  readonly onRemove: (index: number) => void;
  readonly addBtnRef: RefObject<HTMLDivElement | null>;
  readonly dropdownOpen: boolean;
  readonly setDropdownOpen: Dispatch<SetStateAction<boolean>>;
  readonly setDropdownPos: Dispatch<SetStateAction<{ top: number; left: number } | null>>;
  readonly dropdownPos: { top: number; left: number } | null;
  readonly filteredCandidates: CountryData[];
  readonly query: string;
  readonly setQuery: Dispatch<SetStateAction<string>>;
  readonly onAdd: (code: string) => void;
}

export function TourismComparisonSlots({
  sortedCountries,
  lang,
  langPrefix,
  onRemove,
  addBtnRef,
  dropdownOpen,
  setDropdownOpen,
  setDropdownPos,
  dropdownPos,
  filteredCandidates,
  query,
  setQuery,
  onAdd,
}: TourismComparisonSlotsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <>
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {sortedCountries.map((slot) => {
            const score = computeTourismScore(slot.country);
            return (
              <div key={slot.country.code} className="w-[148px] shrink-0 md:w-[180px]">
                <ComparisonSlotCard
                  flagUrl={slot.country.flagUrl}
                  countryName={localizeCountry(slot.country, lang).name}
                  onRemove={() => {
                    onRemove(slot.index);
                  }}
                  onNavigate={async () =>
                    navigate(`${langPrefix}/country/${slot.country.code.toLowerCase()}`)
                  }
                  regionLabel={t(`regions.${regionKey(slot.country.region)}`)}
                >
                  <span
                    className={`[font-family:Oswald,_sans-serif] text-[32px] leading-none font-bold ${score == null ? "text-[#333333]" : tourismScoreColourClass(score, "text")}`}
                  >
                    {score == null ? "—" : score.toFixed(1)}
                  </span>
                </ComparisonSlotCard>
              </div>
            );
          })}
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
      <CountryPickerDropdown
        open={dropdownOpen ? dropdownPos != null : false}
        countries={filteredCandidates.map((c) => {
          const score = computeTourismScore(c);
          return {
            code: c.code,
            flagUrl: c.flagUrl,
            name: localizeCountry(c, lang).name,
            regionLabel: t(`regions.${regionKey(c.region)}`),
            trailing: (
              <span
                className={`font-mono text-[13px] font-semibold ${score == null ? "text-border" : tourismScoreColourClass(score, "text")}`}
              >
                {score == null ? "—" : score.toFixed(1)}
              </span>
            ),
          };
        })}
        query={query}
        onQueryChange={setQuery}
        onSelect={onAdd}
        position={dropdownPos ?? undefined}
        inputName="tourism-comparison-search"
        searchPlaceholder={t("compare.searchCountry")}
        emptyLabel={t("compare.noCountriesFound")}
      />
    </>
  );
}

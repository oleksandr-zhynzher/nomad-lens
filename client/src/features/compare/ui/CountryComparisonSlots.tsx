import type { Dispatch, RefObject, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plane } from "lucide-react";
import type { CountryData, WeightMap, ClimatePreferences } from "@core/models";
import { localizeCountry, regionKey, scoreColourClass } from "@core/utils";
import { applyClimate, computeScore } from "@features/country-ranking/utils";
import { Tooltip } from "@core/ui";
import { ComparisonAddButton } from "./ComparisonAddButton";
import { ComparisonSlotCard } from "./ComparisonSlotCard";
import { CountryPickerDropdown } from "./CountryPickerDropdown";

interface ComparisonSlot {
  readonly country: CountryData;
  readonly color: string;
  readonly index: number;
}

interface CountryComparisonSlotsProps {
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
  readonly dropdownPos: { top: number; left: number } | null;
  readonly filteredCandidates: CountryData[];
  readonly query: string;
  readonly setQuery: Dispatch<SetStateAction<string>>;
  readonly onAdd: (code: string) => void;
}

export function CountryComparisonSlots({
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
  dropdownPos,
  filteredCandidates,
  query,
  setQuery,
  onAdd,
}: CountryComparisonSlotsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <>
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {sortedCountries.map((slot) => {
            const score = computeScore(applyClimate(slot.country, climatePrefs), weights);
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
                  nameSuffix={
                    slot.country.hasNomadVisa ? (
                      <Tooltip
                        content={t("countryDetail.nomadVisa", "Nomad Visa Available")}
                        side="top"
                      >
                        <Link
                          to={`${langPrefix}/country/${slot.country.code.toLowerCase()}`}
                          className="inline-flex shrink-0 leading-none text-accent"
                        >
                          <Plane size={13} />
                        </Link>
                      </Tooltip>
                    ) : undefined
                  }
                >
                  <span
                    className={`[font-family:Oswald,_sans-serif] text-[32px] leading-none font-bold ${scoreColourClass(score, "text")}`}
                  >
                    {score.toFixed(1)}
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
          const score = computeScore(applyClimate(c, climatePrefs), weights);
          return {
            code: c.code,
            flagUrl: c.flagUrl,
            name: localizeCountry(c, lang).name,
            regionLabel: t(`regions.${regionKey(c.region)}`),
            trailing: (
              <span
                className={`font-mono text-[13px] font-semibold ${scoreColourClass(score, "text")}`}
              >
                {score.toFixed(1)}
              </span>
            ),
          };
        })}
        query={query}
        onQueryChange={setQuery}
        onSelect={onAdd}
        position={dropdownPos ?? undefined}
        inputName="country-comparison-search"
        searchPlaceholder={t("compare.searchCountry")}
        emptyLabel={t("compare.noCountriesFound")}
      />
    </>
  );
}

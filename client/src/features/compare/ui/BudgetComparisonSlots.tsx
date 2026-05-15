import type { Dispatch, RefObject, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import type { CountryData } from "@core/models";
import { localizeCountry, regionKey, surplusColourClass } from "@core/utils";
import type { BudgetMatch } from "@features/budget/hooks";
import { ComparisonAddButton } from "./ComparisonAddButton";
import { ComparisonSlotCard } from "./ComparisonSlotCard";
import { CountryPickerDropdown } from "./CountryPickerDropdown";

interface ComparisonSlot {
  readonly country: CountryData;
  readonly color: string;
  readonly index: number;
}

interface BudgetComparisonSlotsProps {
  readonly sortedSlots: ComparisonSlot[];
  readonly matchMap: Map<string, BudgetMatch>;
  readonly lang: string;
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

export function BudgetComparisonSlots({
  sortedSlots,
  matchMap,
  lang,
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
}: BudgetComparisonSlotsProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className="relative">
        <div className="grid grid-cols-3 gap-3 pb-2 [scrollbar-width:thin] md:flex md:items-stretch md:overflow-x-auto">
          {sortedSlots.map((slot) => {
            const match = matchMap.get(slot.country.code);
            const cost = match?.monthlyCost;
            const surplus = match == null ? null : match.surplus;
            return (
              <div key={slot.country.code} className="w-full min-w-0 md:w-[180px] md:shrink-0">
                <ComparisonSlotCard
                  flagUrl={slot.country.flagUrl}
                  countryName={localizeCountry(slot.country, lang).name}
                  onRemove={() => {
                    onRemove(slot.index);
                  }}
                  regionLabel={t(`regions.${regionKey(slot.country.region)}`)}
                >
                  <span
                    className={`[font-family:Oswald,_sans-serif] text-[28px] leading-none font-bold ${cost == null ? "text-[#555]" : "text-accent-dim"}`}
                  >
                    {cost == null ? "—" : `$${cost.toLocaleString()}`}
                  </span>
                  {surplus == null ? null : (
                    <span
                      className={`text-[11px] font-semibold ${surplusColourClass(surplus, "text")}`}
                    >
                      {surplus >= 0
                        ? `+$${surplus.toLocaleString()} left`
                        : `-$${Math.abs(surplus).toLocaleString()} over`}
                    </span>
                  )}
                </ComparisonSlotCard>
              </div>
            );
          })}
          <div ref={addBtnRef} className="w-full min-w-0 md:w-[180px] md:shrink-0">
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
          const match = matchMap.get(c.code);
          const cost = match?.monthlyCost ?? c.costOfLiving?.totalBasic;
          return {
            code: c.code,
            flagUrl: c.flagUrl,
            name: localizeCountry(c, lang).name,
            regionLabel: t(`regions.${regionKey(c.region)}`),
            trailing: (
              <span className="font-mono text-[13px] font-semibold text-accent-dim">
                {cost == null ? "—" : `$${cost.toLocaleString()}`}
              </span>
            ),
          };
        })}
        query={query}
        onQueryChange={setQuery}
        onSelect={onAdd}
        position={dropdownPos ?? undefined}
        inputName="budget-comparison-search"
        searchPlaceholder={t("compare.searchCountry")}
        emptyLabel={t("compare.noCountriesFound")}
      />
    </>
  );
}

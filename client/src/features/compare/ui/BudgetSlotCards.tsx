import type { CountryData } from "@core/models";
import { localizeCountry, regionKey, surplusColourClass } from "@core/utils";
import type { BudgetMatch } from "@features/budget/hooks";
import { useTranslation } from "react-i18next";

import { ComparisonSlotCard } from "./ComparisonSlotCard";

interface ComparisonSlot {
  readonly country: CountryData;
  readonly color: string;
  readonly index: number;
}

interface BudgetSlotCardsProps {
  readonly sortedSlots: ComparisonSlot[];
  readonly matchMap: Map<string, BudgetMatch>;
  readonly lang: string;
  readonly onRemove: (index: number) => void;
}

export function BudgetSlotCards({ sortedSlots, matchMap, lang, onRemove }: BudgetSlotCardsProps) {
  const { t } = useTranslation();
  return (
    <>
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
              removeLabel={t("compare.removeCountry", {
                country: localizeCountry(slot.country, lang).name,
                defaultValue: `Remove ${localizeCountry(slot.country, lang).name}`,
              })}
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
    </>
  );
}

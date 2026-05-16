import type { CountryData } from "@core/models";
import { CATEGORY_LABELS, VISIBLE_CATEGORY_KEYS } from "@core/models";
import { localizeCountry } from "@core/utils";
import { CATEGORY_ICONS, COMPARISON_COLUMN_WIDTH } from "@features/compare/constants";
import { scoreColour } from "@features/country-ranking/utils";
import type { RefObject } from "react";
import { useTranslation } from "react-i18next";

import { ComparisonRowShell } from "./ComparisonRowShell";
import { ComparisonScoreCell } from "./ComparisonScoreCell";
import { ComparisonTableHeader } from "./ComparisonTableHeader";

interface ComparisonSlot {
  readonly country: CountryData;
  readonly color: string;
  readonly index: number;
}

interface CountryComparisonGridProps {
  readonly sortedCountries: ComparisonSlot[];
  readonly lang: string;
  readonly headerRef: RefObject<HTMLDivElement | null>;
  readonly bodyRef: RefObject<HTMLDivElement | null>;
}

export function CountryComparisonGrid({
  sortedCountries,
  lang,
  headerRef,
  bodyRef,
}: CountryComparisonGridProps) {
  const { t } = useTranslation();
  return (
    <div className="mt-8">
      <div className="h-px bg-[#1C1C1C]" />
      <ComparisonTableHeader
        ref={headerRef}
        label={t("compare.indicatorHeader")}
        columns={sortedCountries.map((slot) => ({
          key: slot.index,
          flagUrl: slot.country.flagUrl,
          name: localizeCountry(slot.country, lang).name,
        }))}
        columnWidth={COMPARISON_COLUMN_WIDTH}
      />
      <div ref={bodyRef} className="overflow-x-auto">
        {VISIBLE_CATEGORY_KEYS.map((key) => {
          const Icon = CATEGORY_ICONS[key];
          return (
            <ComparisonRowShell
              key={key}
              icon={Icon}
              label={t(`indicatorsPage.indicators.${key}.name`, CATEGORY_LABELS[key])}
            >
              {sortedCountries.map((slot) => {
                const val = slot.country.scores[key].value ?? null;
                return (
                  <ComparisonScoreCell
                    key={slot.index}
                    value={val}
                    colour={val == null ? "#333333" : scoreColour(val)}
                    columnWidth={COMPARISON_COLUMN_WIDTH}
                  />
                );
              })}
            </ComparisonRowShell>
          );
        })}
      </div>
    </div>
  );
}

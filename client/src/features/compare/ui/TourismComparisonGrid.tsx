import type { RefObject } from "react";
import { useTranslation } from "react-i18next";
import type { CountryData } from "@core/models";
import { TOURISM_CATEGORY_KEYS } from "@core/models";
import { localizeCountry } from "@core/utils";
import { tourismScoreColour } from "@features/tourism/utils";
import {
  TOURISM_ICONS,
  TOURISM_LABELS,
  TOURISM_COMPARISON_COLUMN_WIDTH,
} from "@features/tourism/constants";
import { ComparisonRowShell } from "./ComparisonRowShell";
import { ComparisonScoreCell } from "./ComparisonScoreCell";
import { ComparisonTableHeader } from "./ComparisonTableHeader";

interface ComparisonSlot {
  readonly country: CountryData;
  readonly color: string;
  readonly index: number;
}

interface TourismComparisonGridProps {
  readonly sortedCountries: ComparisonSlot[];
  readonly lang: string;
  readonly headerRef: RefObject<HTMLDivElement | null>;
  readonly bodyRef: RefObject<HTMLDivElement | null>;
}

export function TourismComparisonGrid({
  sortedCountries,
  lang,
  headerRef,
  bodyRef,
}: TourismComparisonGridProps) {
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
        columnWidth={TOURISM_COMPARISON_COLUMN_WIDTH}
      />
      <div ref={bodyRef} className="overflow-x-auto">
        {TOURISM_CATEGORY_KEYS.map((key) => {
          const Icon = TOURISM_ICONS[key];
          return (
            <ComparisonRowShell
              key={key}
              label={t(`tourism.metrics.${key}`, TOURISM_LABELS[key] ?? key)}
              {...(Icon !== undefined && { icon: Icon })}
            >
              {sortedCountries.map((slot) => {
                const val = slot.country.scores[key].value ?? null;
                return (
                  <ComparisonScoreCell
                    key={slot.index}
                    value={val}
                    colour={val == null ? "#333333" : tourismScoreColour(val)}
                    columnWidth={TOURISM_COMPARISON_COLUMN_WIDTH}
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

import { VISIBLE_CATEGORY_KEYS } from "@core/constants";
import { CATEGORY_LABELS } from "@core/models";
import { regionKey } from "@core/utils";
import type { RegionStats } from "@features/compare/constants";
import { CATEGORY_ICONS, REGION_COLUMN_WIDTH } from "@features/compare/constants";
import { scoreColour } from "@features/country-ranking/utils";
import { TrendingUp } from "lucide-react";
import type { RefObject } from "react";
import { useTranslation } from "react-i18next";

import { ComparisonRowShell } from "./ComparisonRowShell";
import { ComparisonScoreCell } from "./ComparisonScoreCell";
import { ComparisonTableHeader } from "./ComparisonTableHeader";

interface RegionComparisonGridProps {
  readonly activeRegions: RegionStats[];
  readonly headerRef: RefObject<HTMLDivElement | null>;
  readonly bodyRef: RefObject<HTMLDivElement | null>;
}

export function RegionComparisonGrid({
  activeRegions,
  headerRef,
  bodyRef,
}: RegionComparisonGridProps) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="h-px bg-[#1C1C1C]" />
      <ComparisonTableHeader
        ref={headerRef}
        label={t("compare.indicatorHeader")}
        columns={activeRegions.map((r) => ({
          key: r.name,
          name: t(`regions.${regionKey(r.name)}`),
          maxNameWidth: "84px",
        }))}
        columnWidth={REGION_COLUMN_WIDTH}
      />
      <div ref={bodyRef} className="overflow-x-auto">
        <ComparisonRowShell
          icon={TrendingUp}
          iconColor="#9E9E9E"
          label={t("compare.overallScore")}
          labelWeight={600}
          labelColor="#AAAAAA"
          highlight={true}
        >
          {activeRegions.map((r) => (
            <ComparisonScoreCell
              key={r.name}
              value={r.overall}
              colour={scoreColour(r.overall)}
              columnWidth={REGION_COLUMN_WIDTH}
            />
          ))}
        </ComparisonRowShell>
        {VISIBLE_CATEGORY_KEYS.map((key) => {
          const Icon = CATEGORY_ICONS[key];
          return (
            <ComparisonRowShell
              key={key}
              icon={Icon}
              label={t(`indicatorsPage.indicators.${key}.name`, CATEGORY_LABELS[key])}
            >
              {activeRegions.map((r) => {
                const val = r.categories[key].avg;
                return (
                  <ComparisonScoreCell
                    key={r.name}
                    value={val}
                    colour={val == null ? "#333333" : scoreColour(val)}
                    columnWidth={REGION_COLUMN_WIDTH}
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

import { useMemo, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { TrendingUp } from "lucide-react";
import type { ClimatePreferences, CountryData, WeightMap } from "@core/models";
import { CATEGORY_LABELS } from "@core/models";
import { scoreColour } from "@features/country-ranking/utils";
import { CATEGORY_ICONS, REGION_COLUMN_WIDTH } from "@features/compare/constants";
import { useSyncScroll } from "@features/compare/hooks";
import { computeRegionStats } from "@features/compare/utils";
import { VISIBLE_CATEGORY_KEYS } from "@core/constants";
import { regionKey } from "@core/utils";
import { ComparisonRowShell } from "./ComparisonRowShell";
import { ComparisonScoreCell } from "./ComparisonScoreCell";
import { ComparisonTableHeader } from "./ComparisonTableHeader";
import { RegionCardList } from "./RegionCardList";

interface RegionComparisonProps {
  readonly countries: CountryData[];
  readonly weights: WeightMap;
  readonly climatePrefs: ClimatePreferences;
}

export function RegionComparison({ countries, weights }: RegionComparisonProps) {
  const { t } = useTranslation();
  const allRegions = useMemo(
    () => [...new Set(countries.map((c) => c.region))].sort((a, b) => a.localeCompare(b)),
    [countries],
  );
  const [enabled, setEnabled] = useState<Set<string>>(new Set<string>());
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [prevRegions, setPrevRegions] = useState<string[]>([]);

  if (allRegions !== prevRegions) {
    setPrevRegions(allRegions);
    if (allRegions.length > 0 && enabled.size === 0) setEnabled(new Set(allRegions));
  }

  useSyncScroll(headerRef, bodyRef);

  const regionStats = useMemo(
    () => computeRegionStats(countries, allRegions, weights),
    [countries, weights, allRegions],
  );

  const toggleRegion = (name: string) => {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const activeRegions = regionStats.filter((r) => enabled.has(r.name));

  return (
    <div>
      <RegionCardList regionStats={regionStats} enabled={enabled} onToggle={toggleRegion} />
      {activeRegions.length > 0 ? (
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
      ) : null}
    </div>
  );
}

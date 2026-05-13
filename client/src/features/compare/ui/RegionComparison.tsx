import { useMemo, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { TrendingUp } from "lucide-react";
import type { ClimatePreferences, CountryData, WeightMap } from "@core/models";
import { CATEGORY_LABELS } from "@core/models";
import { scoreColour } from "@features/country-ranking/utils";
import { scoreColourClass } from "@core/utils";
import { regionKey } from "@core/utils";
import { CATEGORY_ICONS } from "@features/compare/constants";
import { useSyncScroll } from "@features/compare/hooks";
import { REGION_COLUMN_WIDTH } from "@features/compare/constants";
import { computeRegionStats } from "@features/compare/utils";
import { VISIBLE_CATEGORY_KEYS } from "@core/constants";
import { ComparisonRowShell } from "./ComparisonRowShell";
import { ComparisonScoreCell } from "./ComparisonScoreCell";
import { ComparisonTableHeader } from "./ComparisonTableHeader";
import { RegionPill } from "@features/compare/ui";
import { RegionIcon } from "./RegionIcon";

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

  // React-sanctioned "derive state from props" pattern: call set during render
  // to synchronously re-render instead of the double-render from useEffect.
  if (allRegions !== prevRegions) {
    setPrevRegions(allRegions);
    if (allRegions.length > 0 && enabled.size === 0) {
      setEnabled(new Set(allRegions));
    }
  }

  // Sync horizontal scroll between sticky header and body
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
      {/* Region cards — horizontally scrollable on small screens */}
      <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {regionStats.map((r) => {
          const active = enabled.has(r.name);
          return (
            <div key={r.name} className="w-[148px] shrink-0 md:w-[180px]">
              <button
                onClick={() => {
                  toggleRegion(r.name);
                }}
                className={`flex w-full cursor-pointer flex-col items-center gap-3 rounded-lg bg-transparent p-4 transition-all ${active ? "border border-[#2E2E30] opacity-100" : "border border-[#1C1C1C] opacity-45"}`}
              >
                <RegionIcon name={r.name} active={active} color={r.color} />
                <span
                  className={`text-center text-[15px] font-semibold ${active ? "text-on-surface" : "text-dimmer"}`}
                >
                  {t(`regions.${regionKey(r.name)}`)}
                </span>

                <span
                  className={`[font-family:Oswald,_sans-serif] text-[32px] leading-none font-bold ${active ? scoreColourClass(r.overall, "text") : "text-[#757575]"}`}
                >
                  {r.overall.toFixed(1)}
                </span>

                <RegionPill label={`${r.count} countries`} dimmed={!active} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Indicator grid */}
      {activeRegions.length > 0 ? (
        <div>
          {/* Separator */}
          <div className="h-px bg-[#1C1C1C]" />

          {/* Sticky column header — own overflow wrapper, synced with body */}
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

          {/* Scrollable data rows */}
          <div ref={bodyRef} className="overflow-x-auto">
            {/* Overall row */}
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

            {/* Indicator rows */}
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

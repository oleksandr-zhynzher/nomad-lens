import type { ClimatePreferences, CountryData, WeightMap } from "@core/models";
import { useSyncScroll } from "@features/compare/hooks";
import { computeRegionStats } from "@features/compare/utils";
import { useMemo, useRef, useState } from "react";

import { RegionCardList } from "./RegionCardList";
import { RegionComparisonGrid } from "./RegionComparisonGrid";

interface RegionComparisonProps {
  readonly countries: CountryData[];
  readonly weights: WeightMap;
  readonly climatePrefs: ClimatePreferences;
}

export function RegionComparison({ countries, weights }: RegionComparisonProps) {
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
        <RegionComparisonGrid
          activeRegions={activeRegions}
          headerRef={headerRef}
          bodyRef={bodyRef}
        />
      ) : null}
    </div>
  );
}

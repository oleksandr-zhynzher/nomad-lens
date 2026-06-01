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
    () => [...new Set(countries.map((c) => c.region))].toSorted((a, b) => a.localeCompare(b)),
    [countries],
  );
  const [disabledRegions, setDisabledRegions] = useState<Set<string>>(new Set<string>());
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useSyncScroll(headerRef, bodyRef);

  const regionStats = useMemo(
    () => computeRegionStats(countries, allRegions, weights),
    [countries, weights, allRegions],
  );

  const toggleRegion = (name: string) => {
    setDisabledRegions((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const enabled = useMemo(
    () => new Set(allRegions.filter((regionName) => !disabledRegions.has(regionName))),
    [allRegions, disabledRegions],
  );
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

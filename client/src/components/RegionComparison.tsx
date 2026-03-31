import { useMemo, useState } from "react";
import type { CategoryKey, ClimatePreferences, CountryData, WeightMap } from "../utils/types";
import { CATEGORY_KEYS, CATEGORY_LABELS } from "../utils/types";
import { scoreColour } from "../utils/scoring";

interface RegionComparisonProps {
  countries: CountryData[];
  weights: WeightMap;
  climatePrefs: ClimatePreferences;
}

const REGION_COLORS: Record<string, string> = {
  Africa: "#FF6B6B",
  Americas: "#4ECDC4",
  Asia: "#FFE66D",
  Europe: "#6C5CE7",
  "Middle East": "#FD79A8",
  Oceania: "#00CEC9",
};

interface RegionStats {
  name: string;
  count: number;
  color: string;
  overall: number;
  categories: Record<CategoryKey, { avg: number | null; count: number }>;
}

export function RegionComparison({ countries, weights }: RegionComparisonProps) {
  const allRegions = useMemo(
    () => [...new Set(countries.map((c) => c.region))].sort(),
    [countries],
  );

  const [selected, setSelected] = useState<Set<string>>(() => new Set(allRegions));

  // Recompute selected when regions change (e.g. data loads)
  useMemo(() => {
    if (allRegions.length > 0 && selected.size === 0) {
      setSelected(new Set(allRegions));
    }
  }, [allRegions]);

  const regionStats = useMemo(() => {
    const grouped: Record<string, CountryData[]> = {};
    for (const c of countries) {
      if (!grouped[c.region]) grouped[c.region] = [];
      grouped[c.region].push(c);
    }

    const stats: RegionStats[] = [];
    for (const regionName of allRegions) {
      const regionCountries = grouped[regionName] || [];
      const categories = {} as RegionStats["categories"];

      for (const key of CATEGORY_KEYS) {
        const values = regionCountries
          .map((c) => c.scores[key]?.value)
          .filter((v): v is number => v !== null && v !== undefined);

        if (values.length === 0) {
          categories[key] = { avg: null, count: 0 };
        } else {
          const avg = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
          categories[key] = { avg, count: values.length };
        }
      }

      // Weighted overall using same logic as scoring.ts
      let numerator = 0;
      let denominator = 0;
      for (const key of CATEGORY_KEYS) {
        const w = weights[key];
        if (w <= 0) continue;
        const avg = categories[key].avg;
        if (avg === null) continue;
        numerator += w * avg;
        denominator += w;
      }
      const overall = denominator === 0 ? 0 : Math.round((numerator / denominator) * 10) / 10;

      stats.push({
        name: regionName,
        count: regionCountries.length,
        color: REGION_COLORS[regionName] || "#888888",
        overall,
        categories,
      });
    }

    return stats;
  }, [countries, weights, allRegions]);

  const selectedStats = regionStats.filter((r) => selected.has(r.name));

  const toggleRegion = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === allRegions.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allRegions));
    }
  };

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Region selector chips */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontFamily: "Geist, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: "#444444", marginBottom: "12px" }}>
          COMPARE REGIONS
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          <button
            onClick={toggleAll}
            style={{
              fontFamily: "Geist, sans-serif",
              fontSize: "12px",
              padding: "6px 12px",
              borderRadius: "9999px",
              backgroundColor: selected.size === allRegions.length ? "var(--color-accent)" : "#1C1C1C",
              color: selected.size === allRegions.length ? "#FFFFFF" : "#666666",
              border: selected.size === allRegions.length ? "none" : "1px solid #2C2C2C",
              cursor: "pointer",
            }}
          >
            All Regions
          </button>
          {regionStats.map((r) => (
            <button
              key={r.name}
              onClick={() => toggleRegion(r.name)}
              style={{
                fontFamily: "Geist, sans-serif",
                fontSize: "12px",
                padding: "6px 12px",
                borderRadius: "9999px",
                backgroundColor: selected.has(r.name) ? r.color + "22" : "#1C1C1C",
                color: selected.has(r.name) ? r.color : "#666666",
                border: selected.has(r.name) ? `1px solid ${r.color}55` : "1px solid #2C2C2C",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: r.color, display: "inline-block" }} />
              {r.name}
              <span style={{ color: "#555555", fontSize: "10px" }}>({r.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overall Score section */}
      <BarSection
        title="OVERALL SCORE"
        regions={selectedStats
          .map((r) => ({ name: r.name, count: r.count, color: r.color, value: r.overall }))
          .sort((a, b) => b.value - a.value)}
      />

      {/* Per-category sections */}
      {CATEGORY_KEYS.map((key) => (
        <BarSection
          key={key}
          title={CATEGORY_LABELS[key].toUpperCase()}
          regions={selectedStats
            .map((r) => ({
              name: r.name,
              count: r.count,
              color: r.color,
              value: r.categories[key].avg,
            }))
            .sort((a, b) => (b.value ?? -1) - (a.value ?? -1))}
        />
      ))}
    </div>
  );
}

interface BarRegion {
  name: string;
  count: number;
  color: string;
  value: number | null;
}

function BarSection({ title, regions }: { title: string; regions: BarRegion[] }) {
  if (regions.length === 0) return null;

  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{
        fontFamily: "Geist, sans-serif",
        fontSize: "10px",
        fontWeight: 600,
        letterSpacing: "2px",
        textTransform: "uppercase",
        color: "#555555",
        marginBottom: "10px",
      }}>
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {regions.map((r) => (
          <div key={r.name} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Region label */}
            <div style={{
              width: "120px",
              flexShrink: 0,
              fontFamily: "Geist, sans-serif",
              fontSize: "12px",
              color: r.color,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: r.color, flexShrink: 0 }} />
              {r.name}
            </div>

            {/* Bar track */}
            <div style={{
              flex: 1,
              height: "28px",
              backgroundColor: "#1E1E1E",
              borderRadius: "4px",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: r.value !== null ? `${r.value}%` : "0%",
                backgroundColor: r.color + "44",
                borderRadius: "4px",
                transition: "width 0.4s ease",
                borderRight: r.value !== null && r.value > 0 ? `2px solid ${r.color}` : "none",
              }} />
            </div>

            {/* Score value */}
            <div style={{
              width: "48px",
              textAlign: "right",
              flexShrink: 0,
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "13px",
              fontWeight: 600,
              color: r.value !== null ? scoreColour(r.value) : "#3A3A3A",
            }}>
              {r.value !== null ? r.value.toFixed(1) : "N/A"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

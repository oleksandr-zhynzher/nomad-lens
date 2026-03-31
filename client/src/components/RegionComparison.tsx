import { useMemo, useState, useEffect } from "react";
import {
  TrendingUp,
  Coins,
  Wheat,
  HeartPulse,
  GraduationCap,
  Leaf,
  CloudSun,
  Shield,
  Wifi,
  Smile,
  Users,
  Landmark,
  Languages,
  Globe,
} from "lucide-react";
import type { CategoryKey, ClimatePreferences, CountryData, WeightMap } from "../utils/types";
import { CATEGORY_KEYS, CATEGORY_LABELS } from "../utils/types";

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

const CATEGORY_ICONS: Record<CategoryKey, typeof TrendingUp> = {
  economy: TrendingUp,
  affordability: Coins,
  foodSecurity: Wheat,
  healthcare: HeartPulse,
  education: GraduationCap,
  environment: Leaf,
  climate: CloudSun,
  safety: Shield,
  infrastructure: Wifi,
  happiness: Smile,
  humanDevelopment: Users,
  governance: Landmark,
  englishProficiency: Languages,
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

  const [enabled, setEnabled] = useState<Set<string>>(new Set());

  // Pre-select all regions once data loads
  useEffect(() => {
    if (allRegions.length > 0 && enabled.size === 0) {
      setEnabled(new Set(allRegions));
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

  const toggleAll = () => {
    if (enabled.size === allRegions.length) {
      setEnabled(new Set());
    } else {
      setEnabled(new Set(allRegions));
    }
  };

  const activeRegions = regionStats.filter((r) => enabled.has(r.name));

  return (
    <div>
      {/* Region toggle chips */}
      <div style={{ marginBottom: "24px" }}>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={toggleAll}
            className="px-3 py-1.5 rounded-full transition-colors"
            style={{
              fontFamily: "Geist, sans-serif",
              fontSize: "12px",
              backgroundColor: enabled.size === allRegions.length ? "var(--color-accent)" : "#1C1C1C",
              color: enabled.size === allRegions.length ? "#FFFFFF" : "#666666",
              border: enabled.size === allRegions.length ? "none" : "1px solid #2C2C2C",
              cursor: "pointer",
            }}
          >
            All Regions
          </button>
          {regionStats.map((r) => {
            const active = enabled.has(r.name);
            return (
              <button
                key={r.name}
                onClick={() => toggleRegion(r.name)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors"
                style={{
                  fontFamily: "Geist, sans-serif",
                  fontSize: "12px",
                  backgroundColor: active ? `${r.color}22` : "#1C1C1C",
                  color: active ? r.color : "#555555",
                  border: active ? `1px solid ${r.color}55` : "1px solid #2C2C2C",
                  cursor: "pointer",
                  opacity: active ? 1 : 0.6,
                }}
              >
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: r.color, display: "inline-block" }} />
                {r.name}
                <span style={{ fontSize: "10px", color: active ? `${r.color}99` : "#444444" }}>({r.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Indicator grid */}
      {activeRegions.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: `${240 + activeRegions.length * 140}px` }}>
            {/* Separator */}
            <div style={{ height: "1px", backgroundColor: "#1C1C1C" }} />

            {/* Column header */}
            <div className="flex items-center" style={{ borderBottom: "1px solid #1C1C1C", padding: "14px 0" }}>
              <div style={{ width: "240px", flexShrink: 0 }}>
                <span style={{ fontFamily: "Geist, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "1.5px", color: "#333333", textTransform: "uppercase" }}>
                  Indicator
                </span>
              </div>
              {activeRegions.map((r) => (
                <div key={r.name} className="flex-1 flex items-center justify-center gap-1.5" style={{ minWidth: "120px" }}>
                  <Globe size={14} style={{ color: r.color }} />
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: r.color }}>
                    {r.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Overall row */}
            <div className="flex items-center" style={{ borderBottom: "1px solid #1C1C1C", padding: "16px 0", backgroundColor: "#0D0D0F" }}>
              <div className="flex items-center gap-2.5" style={{ width: "240px", flexShrink: 0 }}>
                <TrendingUp size={16} style={{ color: "#888888" }} />
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#AAAAAA" }}>
                  Overall Score
                </span>
              </div>
              {activeRegions.map((r) => (
                <div key={r.name} className="flex-1 text-center" style={{ minWidth: "120px" }}>
                  <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "22px", fontWeight: 600, color: r.color }}>
                    {r.overall.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>

            {/* Indicator rows */}
            {CATEGORY_KEYS.map((key) => {
              const Icon = CATEGORY_ICONS[key];
              return (
                <div key={key} className="flex items-center" style={{ borderBottom: "1px solid #1C1C1C", padding: "16px 0" }}>
                  <div className="flex items-center gap-2.5" style={{ width: "240px", flexShrink: 0 }}>
                    <Icon size={16} style={{ color: "#555555" }} />
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#777777" }}>
                      {CATEGORY_LABELS[key]}
                    </span>
                  </div>
                  {activeRegions.map((r) => {
                    const val = r.categories[key].avg;
                    return (
                      <div key={r.name} className="flex-1 text-center" style={{ minWidth: "120px" }}>
                        <span
                          style={{
                            fontFamily: "IBM Plex Mono, monospace",
                            fontSize: "22px",
                            fontWeight: 600,
                            color: val != null ? r.color : "#333333",
                          }}
                        >
                          {val != null ? val.toFixed(1) : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

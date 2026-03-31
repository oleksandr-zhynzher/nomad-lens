import { useMemo, useState } from "react";
import {
  CirclePlus,
  X,
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

const SLOT_COLORS = ["#8F5A3C", "#5B8FA8", "#6B9E6B", "#B07CC6", "#E07C4F", "#4EA8B0"] as const;

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

  const [selectedRegions, setSelectedRegions] = useState<(string | null)[]>([null, null, null, null, null, null]);

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

  const statsMap = useMemo(() => {
    const map: Record<string, RegionStats> = {};
    for (const r of regionStats) map[r.name] = r;
    return map;
  }, [regionStats]);

  const handleRemove = (index: number) => {
    setSelectedRegions((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const activeSlots = selectedRegions
    .map((name, i) => {
      if (!name || !statsMap[name]) return null;
      return { region: statsMap[name], color: SLOT_COLORS[i], index: i };
    })
    .filter(Boolean) as { region: RegionStats; color: string; index: number }[];

  return (
    <div>
      {/* Region selector slots */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
        {selectedRegions.map((name, i) => {
          const region = name ? statsMap[name] : null;
          const color = SLOT_COLORS[i];

          if (region) {
            return (
              <FilledRegionSlot
                key={i}
                region={region}
                color={color}
                onRemove={() => handleRemove(i)}
              />
            );
          }

          return (
            <EmptyRegionSlot
              key={i}
              color={color}
              allRegions={regionStats}
              excludedNames={selectedRegions.filter(Boolean) as string[]}
              onSelect={(r) => {
                setSelectedRegions((prev) => {
                  const next = [...prev];
                  next[i] = r;
                  return next;
                });
              }}
            />
          );
        })}
      </div>

      {/* Indicator grid */}
      {activeSlots.length > 0 && (
        <div className="mt-8">
          {/* Separator */}
          <div style={{ height: "1px", backgroundColor: "#1C1C1C", marginBottom: "0" }} />

          {/* Column header */}
          <div className="flex items-center" style={{ borderBottom: "1px solid #1C1C1C", padding: "14px 0" }}>
            <div style={{ width: "240px", flexShrink: 0 }}>
              <span style={{ fontFamily: "Geist, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "1.5px", color: "#333333", textTransform: "uppercase" }}>
                Indicator
              </span>
            </div>
            {activeSlots.map((slot) => (
              <div key={slot.index} className="flex-1 flex items-center justify-center gap-1.5">
                <div className="rounded-full" style={{ width: "8px", height: "8px", backgroundColor: slot.color }} />
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: slot.color }}>
                  {slot.region.name}
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
                {activeSlots.map((slot) => {
                  const val = slot.region.categories[key].avg;
                  return (
                    <div key={slot.index} className="flex-1 text-center">
                      <span
                        style={{
                          fontFamily: "IBM Plex Mono, monospace",
                          fontSize: "22px",
                          fontWeight: 600,
                          color: val != null ? slot.color : "#333333",
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
      )}
    </div>
  );
}

/* ─── Filled region slot ────────────────────────────────────────────────────── */

function FilledRegionSlot({
  region,
  color,
  onRemove,
}: {
  region: RegionStats;
  color: string;
  onRemove: () => void;
}) {
  return (
    <div
      className="relative rounded-lg p-5 flex flex-col items-center gap-3"
      style={{
        backgroundColor: `${color}18`,
        border: `1px solid ${color}33`,
      }}
    >
      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute top-3 right-3 flex items-center gap-1 transition-opacity hover:opacity-100"
        style={{ opacity: 0.5, color: "#999999", fontFamily: "Geist, sans-serif", fontSize: "11px" }}
      >
        <X size={14} />
      </button>

      {/* Region icon */}
      <div
        className="rounded-full flex items-center justify-center"
        style={{ width: "48px", height: "48px", backgroundColor: `${region.color}22`, border: `1px solid ${region.color}44` }}
      >
        <Globe size={24} style={{ color: region.color }} />
      </div>

      {/* Name */}
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "15px",
          fontWeight: 600,
          color: "#E8E9EB",
          textAlign: "center",
        }}
      >
        {region.name}
      </span>

      {/* Score */}
      <div className="flex items-baseline gap-1">
        <span
          style={{
            fontFamily: "Anton, sans-serif",
            fontSize: "32px",
            color,
            lineHeight: 1,
          }}
        >
          {region.overall.toFixed(1)}
        </span>
        <span
          style={{
            fontFamily: "Geist, sans-serif",
            fontSize: "12px",
            color: "#555555",
          }}
        >
          /100
        </span>
      </div>

      {/* Country count badge */}
      <span
        className="px-2 py-0.5 rounded-full"
        style={{
          fontFamily: "Geist, sans-serif",
          fontSize: "10px",
          color: "#999999",
          backgroundColor: "#1C1C1C",
          border: "1px solid #2C2C2C",
        }}
      >
        {region.count} countries
      </span>
    </div>
  );
}

/* ─── Empty region slot ─────────────────────────────────────────────────────── */

function EmptyRegionSlot({
  color,
  allRegions,
  excludedNames,
  onSelect,
}: {
  color: string;
  allRegions: RegionStats[];
  excludedNames: string[];
  onSelect: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const available = allRegions.filter((r) => !excludedNames.includes(r.name));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full rounded-lg p-5 flex flex-col items-center justify-center gap-2 transition-colors hover:border-[#3A3A3A]"
        style={{
          backgroundColor: "#141416",
          border: "1px dashed #252525",
          minHeight: "180px",
          cursor: "pointer",
        }}
      >
        <CirclePlus size={28} style={{ color: "#444444" }} />
        <span
          style={{
            fontFamily: "Geist, sans-serif",
            fontSize: "12px",
            color: "#555555",
          }}
        >
          Add Region
        </span>
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 z-20 mt-1 rounded-lg overflow-hidden"
          style={{
            backgroundColor: "#1A1A1C",
            border: "1px solid #2A2A2A",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          {available.map((r) => (
            <button
              key={r.name}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
              onClick={() => {
                onSelect(r.name);
                setOpen(false);
              }}
            >
              <div
                className="rounded-full"
                style={{ width: "10px", height: "10px", backgroundColor: r.color, flexShrink: 0 }}
              />
              <span
                className="flex-1"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  color: "#E8E9EB",
                }}
              >
                {r.name}
              </span>
              <span
                style={{
                  fontFamily: "Geist, sans-serif",
                  fontSize: "11px",
                  color: "#555555",
                }}
              >
                {r.count} countries
              </span>
              <span
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "13px",
                  fontWeight: 600,
                  color,
                }}
              >
                {r.overall.toFixed(1)}
              </span>
            </button>
          ))}
          {available.length === 0 && (
            <div
              className="px-3 py-4 text-center"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                color: "#555555",
              }}
            >
              All regions added
            </div>
          )}
        </div>
      )}
    </div>
  );
}

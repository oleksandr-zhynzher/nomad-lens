import { useMemo, useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  TrendingUp,
  Coins,
  Wheat,
  HeartPulse,
  GraduationCap,
  Leaf,
  CloudSun,
  Sun,
  Mountain,
  Tent,
  Castle,
  Lamp,
  Waves,
  Shield,
  Wifi,
  Smile,
  Users,
  Landmark,
  Languages,
  ShieldCheck,
  UserCheck,
  Truck,
  Trees,
  Heart,
  Receipt,
  Rocket,
  Plane,
  Theater,
  Stethoscope,
  UsersRound,
  Stamp,
  BadgeDollarSign,
  Coffee,
  Smartphone,
  Handshake,
} from "lucide-react";
import type {
  CategoryKey,
  ClimatePreferences,
  CountryData,
  WeightMap,
} from "../utils/types";
import { VISIBLE_CATEGORY_KEYS, CATEGORY_LABELS } from "../utils/types";
import { scoreColour } from "../utils/scoring";
import { regionKey } from "../utils/localize";

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

const REGION_ICONS: Record<string, typeof Sun> = {
  Africa: Sun,
  Americas: Mountain,
  Asia: Tent,
  Europe: Castle,
  "Middle East": Lamp,
  Oceania: Waves,
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
  digitalFreedom: ShieldCheck,
  personalFreedom: UserCheck,
  logistics: Truck,
  biodiversity: Trees,
  socialTolerance: Heart,
  taxFriendliness: Receipt,
  startupEnvironment: Rocket,
  airConnectivity: Plane,
  culturalHeritage: Theater,
  healthcareCost: Stethoscope,
  nomadCommunity: UsersRound,
  visaFriendliness: Stamp,
  costEfficiency: BadgeDollarSign,
  workLifeBalance: Coffee,
  digitalReadiness: Smartphone,
  culturalFit: Handshake,
};

interface RegionStats {
  name: string;
  count: number;
  color: string;
  overall: number;
  categories: Record<CategoryKey, { avg: number | null; count: number }>;
}

export function RegionComparison({
  countries,
  weights,
}: RegionComparisonProps) {
  const { t } = useTranslation();
  const allRegions = useMemo(
    () => [...new Set(countries.map((c) => c.region))].sort(),
    [countries],
  );

  const [enabled, setEnabled] = useState<Set<string>>(
    () => new Set(allRegions),
  );
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Pre-select all regions once data loads
  useEffect(() => {
    if (allRegions.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time init from async data
      setEnabled((prev) => (prev.size === 0 ? new Set(allRegions) : prev));
    }
  }, [allRegions]);

  // Sync horizontal scroll between sticky header and body
  useEffect(() => {
    const header = headerRef.current;
    const body = bodyRef.current;
    if (!header || !body) return;
    const onBody = () => {
      header.scrollLeft = body.scrollLeft;
    };
    const onHeader = () => {
      body.scrollLeft = header.scrollLeft;
    };
    body.addEventListener("scroll", onBody);
    header.addEventListener("scroll", onHeader);
    return () => {
      body.removeEventListener("scroll", onBody);
      header.removeEventListener("scroll", onHeader);
    };
  }, []);

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

      for (const key of VISIBLE_CATEGORY_KEYS) {
        const values = regionCountries
          .map((c) => c.scores[key]?.value)
          .filter((v): v is number => v !== null && v !== undefined);

        if (values.length === 0) {
          categories[key] = { avg: null, count: 0 };
        } else {
          const avg =
            Math.round(
              (values.reduce((a, b) => a + b, 0) / values.length) * 10,
            ) / 10;
          categories[key] = { avg, count: values.length };
        }
      }

      let numerator = 0;
      let denominator = 0;
      for (const key of VISIBLE_CATEGORY_KEYS) {
        const w = weights[key];
        if (w <= 0) continue;
        const avg = categories[key].avg;
        if (avg === null) continue;
        numerator += w * avg;
        denominator += w;
      }
      const overall =
        denominator === 0 ? 0 : Math.round((numerator / denominator) * 10) / 10;

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

  const activeRegions = regionStats.filter((r) => enabled.has(r.name));

  return (
    <div>
      {/* Region cards — fill full width */}
      <div className="flex gap-3 pb-2">
        {regionStats.map((r) => {
          const active = enabled.has(r.name);
          return (
            <div key={r.name} className="flex-1 min-w-0">
              <button
                onClick={() => toggleRegion(r.name)}
                className="w-full rounded-lg p-4 flex flex-col items-center gap-3 transition-all"
                style={{
                  backgroundColor: "transparent",
                  border: active ? "1px solid #2E2E30" : "1px solid #1C1C1C",
                  opacity: active ? 1 : 0.45,
                  cursor: "pointer",
                }}
              >
                {(() => {
                  const Icon = REGION_ICONS[r.name];
                  return Icon ? (
                    <Icon
                      size={20}
                      style={{ color: active ? r.color : "#555555" }}
                    />
                  ) : null;
                })()}
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "15px",
                    fontWeight: 600,
                    color: active ? "#E8E9EB" : "#555555",
                    textAlign: "center",
                  }}
                >
                  {t(`regions.${regionKey(r.name)}`)}
                </span>

                <span
                  style={{
                    fontFamily: "Oswald, sans-serif",
                    fontSize: "32px",
                    fontWeight: 700,
                    color: active ? scoreColour(r.overall) : "#333333",
                    lineHeight: 1,
                  }}
                >
                  {r.overall.toFixed(1)}
                </span>

                <span
                  className="px-2 py-0.5 rounded-full"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "10px",
                    color: active ? "#999999" : "#444444",
                    backgroundColor: "#1C1C1C",
                    border: "1px solid #2C2C2C",
                  }}
                >
                  {r.count} countries
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Indicator grid */}
      {activeRegions.length > 0 && (
        <div>
          {/* Separator */}
          <div style={{ height: "1px", backgroundColor: "#1C1C1C" }} />

          {/* Sticky column header — own overflow wrapper, synced with body */}
          <div
            ref={headerRef}
            className="sticky z-10"
            style={{
              top: "56px",
              overflowX: "auto",
              scrollbarWidth: "none",
              backgroundColor: "#0F1114",
            }}
          >
            <div
              className="flex items-center"
              style={{ borderBottom: "1px solid #1C1C1C", padding: "14px 0" }}
            >
              <div className="w-[160px] md:w-[240px] shrink-0">
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "1.5px",
                    color: "#333333",
                    textTransform: "uppercase",
                  }}
                >
                  {t("compare.indicatorHeader")}
                </span>
              </div>
              {activeRegions.map((r) => (
                <div
                  key={r.name}
                  className="flex-1 flex items-center justify-center"
                >
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#FFFFFF",
                    }}
                  >
                    {t(`regions.${regionKey(r.name)}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Scrollable data rows */}
          <div ref={bodyRef} style={{ overflowX: "auto" }}>
            {/* Overall row */}
            <div
              className="flex items-center"
              style={{
                borderBottom: "1px solid #1C1C1C",
                padding: "16px 0",
                backgroundColor: "#0D0D0F",
              }}
            >
              <div className="flex items-center gap-2.5 w-[160px] md:w-[240px] shrink-0">
                <TrendingUp size={16} style={{ color: "#888888" }} />
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#AAAAAA",
                  }}
                >
                  {t("compare.overallScore")}
                </span>
              </div>
              {activeRegions.map((r) => (
                <div key={r.name} className="flex-1 text-center">
                  <span
                    style={{
                      fontFamily: "IBM Plex Mono, monospace",
                      fontSize: "22px",
                      fontWeight: 600,
                      color: scoreColour(r.overall),
                    }}
                  >
                    {r.overall.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>

            {/* Indicator rows */}
            {VISIBLE_CATEGORY_KEYS.map((key) => {
              const Icon = CATEGORY_ICONS[key];
              return (
                <div
                  key={key}
                  className="flex items-center"
                  style={{
                    borderBottom: "1px solid #1C1C1C",
                    padding: "16px 0",
                  }}
                >
                  <div className="flex items-center gap-2.5 w-[160px] md:w-[240px] shrink-0">
                    <Icon size={16} style={{ color: "#555555" }} />
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "13px",
                        color: "#777777",
                      }}
                    >
                      {t(
                        `indicatorsPage.indicators.${key}.name`,
                        CATEGORY_LABELS[key],
                      )}
                    </span>
                  </div>
                  {activeRegions.map((r) => {
                    const val = r.categories[key].avg;
                    return (
                      <div key={r.name} className="flex-1 text-center">
                        <span
                          style={{
                            fontFamily: "IBM Plex Mono, monospace",
                            fontSize: "22px",
                            fontWeight: 600,
                            color: val != null ? scoreColour(val) : "#333333",
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

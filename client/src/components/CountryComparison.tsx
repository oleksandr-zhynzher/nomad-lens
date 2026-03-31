import { useRef, useState } from "react";
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
} from "lucide-react";
import type { CountryData, WeightMap, ClimatePreferences, CategoryKey } from "../utils/types";
import { CATEGORY_KEYS, CATEGORY_LABELS } from "../utils/types";
import { computeScore } from "../utils/scoring";

const SLOT_COLORS = [
  "#8F5A3C", "#5B8FA8", "#6B9E6B", "#B07CC6",
  "#E07C4F", "#4EA8B0", "#C75D8E", "#7B9E3C",
  "#D4A04A", "#6889C7", "#A66BBF", "#4CAF8B",
] as const;

function getSlotColor(index: number) {
  return SLOT_COLORS[index % SLOT_COLORS.length];
}

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

interface Props {
  countries: CountryData[];
  weights: WeightMap;
  climatePrefs: ClimatePreferences;
}

export function CountryComparison({ countries, weights }: Props) {
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [query, setQuery] = useState("");
  const addBtnRef = useRef<HTMLDivElement>(null);

  const selectedCountries = selectedCodes
    .map((code, i) => {
      const country = countries.find((c) => c.code === code);
      return country ? { country, color: getSlotColor(i), index: i } : null;
    })
    .filter(Boolean) as { country: CountryData; color: string; index: number }[];

  const handleRemove = (index: number) => {
    setSelectedCodes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAdd = (code: string) => {
    setSelectedCodes((prev) => [...prev, code]);
    setDropdownOpen(false);
    setQuery("");
  };

  const filtered = countries
    .filter(
      (c) =>
        !selectedCodes.includes(c.code) &&
        c.name.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      {/* Country selector — horizontal scroll */}
      <div
        className="flex gap-4 pb-2"
        style={{ overflowX: "auto", scrollbarWidth: "thin" }}
      >
        {selectedCountries.map((slot) => {
          const score = computeScore(slot.country, weights);
          return (
            <div key={slot.country.code} style={{ flexShrink: 0, width: "180px" }}>
              <div
                className="relative rounded-lg p-5 flex flex-col items-center gap-3"
                style={{
                  backgroundColor: `${slot.color}18`,
                  border: `1px solid ${slot.color}33`,
                }}
              >
                <button
                  onClick={() => handleRemove(slot.index)}
                  className="absolute top-3 right-3 flex items-center gap-1 transition-opacity hover:opacity-100"
                  style={{ opacity: 0.5, color: "#999999", fontFamily: "Geist, sans-serif", fontSize: "11px" }}
                >
                  <X size={14} />
                </button>

                <img
                  src={slot.country.flagUrl}
                  alt={slot.country.name}
                  className="rounded-full object-cover"
                  style={{ width: "48px", height: "48px" }}
                />

                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#E8E9EB",
                    textAlign: "center",
                  }}
                >
                  {slot.country.name}
                </span>

                <div className="flex items-baseline gap-1">
                  <span style={{ fontFamily: "Anton, sans-serif", fontSize: "32px", color: slot.color, lineHeight: 1 }}>
                    {score.toFixed(1)}
                  </span>
                  <span style={{ fontFamily: "Geist, sans-serif", fontSize: "12px", color: "#555555" }}>/100</span>
                </div>

                <div className="flex flex-wrap justify-center gap-1.5">
                  <span
                    className="px-2 py-0.5 rounded-full"
                    style={{ fontFamily: "Geist, sans-serif", fontSize: "10px", color: "#999999", backgroundColor: "#1C1C1C", border: "1px solid #2C2C2C" }}
                  >
                    {slot.country.region}
                  </span>
                  {slot.country.hasNomadVisa && (
                    <span
                      className="px-2 py-0.5 rounded-full"
                      style={{ fontFamily: "Geist, sans-serif", fontSize: "10px", color: "var(--color-accent)", backgroundColor: "rgba(143, 90, 60, 0.15)", border: "1px solid rgba(143, 90, 60, 0.3)" }}
                    >
                      Nomad Visa
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Add button */}
        <div ref={addBtnRef} style={{ flexShrink: 0, width: "180px", position: "relative" }}>
          <button
            onClick={() => setDropdownOpen((p) => !p)}
            className="w-full rounded-lg p-5 flex flex-col items-center justify-center gap-2 transition-colors hover:border-[#3A3A3A]"
            style={{
              backgroundColor: "#141416",
              border: "1px dashed #252525",
              minHeight: "180px",
              cursor: "pointer",
            }}
          >
            <CirclePlus size={28} style={{ color: "#444444" }} />
            <span style={{ fontFamily: "Geist, sans-serif", fontSize: "12px", color: "#555555" }}>
              Add Country
            </span>
          </button>

          {dropdownOpen && (
            <div
              className="absolute left-0 z-20 mt-1 rounded-lg overflow-hidden"
              style={{
                width: "280px",
                backgroundColor: "#1A1A1C",
                border: "1px solid #2A2A2A",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              }}
            >
              <input
                type="text"
                autoFocus
                placeholder="Search country…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-3 py-2.5 focus:outline-none"
                style={{
                  backgroundColor: "#141416",
                  border: "none",
                  borderBottom: "1px solid #252525",
                  color: "#FFFFFF",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                }}
              />
              <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                {filtered.map((c) => {
                  const score = computeScore(c, weights);
                  const nextColor = getSlotColor(selectedCodes.length);
                  return (
                    <button
                      key={c.code}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                      onClick={() => handleAdd(c.code)}
                    >
                      <img src={c.flagUrl} alt={c.name} className="rounded-full object-cover" style={{ width: "24px", height: "24px" }} />
                      <span className="flex-1 truncate" style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#E8E9EB" }}>
                        {c.name}
                      </span>
                      <span style={{ fontFamily: "Geist, sans-serif", fontSize: "11px", color: "#555555" }}>{c.region}</span>
                      <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "13px", fontWeight: 600, color: nextColor }}>
                        {score.toFixed(1)}
                      </span>
                    </button>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="px-3 py-4 text-center" style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#555555" }}>
                    No countries found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Indicator grid */}
      {selectedCountries.length > 0 && (
        <div className="mt-8" style={{ overflowX: "auto" }}>
          <div style={{ minWidth: `${240 + selectedCountries.length * 140}px` }}>
            {/* Separator */}
            <div style={{ height: "1px", backgroundColor: "#1C1C1C" }} />

            {/* Column header */}
            <div className="flex items-center" style={{ borderBottom: "1px solid #1C1C1C", padding: "14px 0" }}>
              <div style={{ width: "240px", flexShrink: 0 }}>
                <span style={{ fontFamily: "Geist, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "1.5px", color: "#333333", textTransform: "uppercase" }}>
                  Indicator
                </span>
              </div>
              {selectedCountries.map((slot) => (
                <div key={slot.index} className="flex-1 flex items-center justify-center gap-1.5" style={{ minWidth: "120px" }}>
                  <div className="rounded-full" style={{ width: "8px", height: "8px", backgroundColor: slot.color }} />
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: slot.color }}>
                    {slot.country.name}
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
                  {selectedCountries.map((slot) => {
                    const val = slot.country.scores[key]?.value;
                    return (
                      <div key={slot.index} className="flex-1 text-center" style={{ minWidth: "120px" }}>
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
        </div>
      )}
    </div>
  );
}

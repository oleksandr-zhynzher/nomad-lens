import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLangPrefix } from "../hooks/useLangPrefix";
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
  CountryData,
  WeightMap,
  ClimatePreferences,
  CategoryKey,
} from "../utils/types";
import { VISIBLE_CATEGORY_KEYS, CATEGORY_LABELS } from "../utils/types";
import {
  computeClimateScore,
  computeScore,
  scoreColour,
} from "../utils/scoring";
import { localizeCountry, regionKey } from "../utils/localize";
import { Tooltip } from "./Tooltip";

const SLOT_COLORS = [
  "#8F5A3C",
  "#5B8FA8",
  "#6B9E6B",
  "#B07CC6",
  "#E07C4F",
  "#4EA8B0",
  "#C75D8E",
  "#7B9E3C",
  "#D4A04A",
  "#6889C7",
  "#A66BBF",
  "#4CAF8B",
] as const;

const COMPARISON_COLUMN_WIDTH = "112px";

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

interface Props {
  countries: CountryData[];
  weights: WeightMap;
  climatePrefs: ClimatePreferences;
  selectedCodes: string[];
  onSelectedCodesChange: (codes: string[]) => void;
  sortTrigger?: number;
  onSelectionCount?: (count: number) => void;
}

function applyClimate(
  country: CountryData,
  climatePrefs: ClimatePreferences,
): CountryData {
  if (!country.climateData) return country;
  return {
    ...country,
    scores: {
      ...country.scores,
      climate: {
        ...country.scores.climate,
        value: computeClimateScore(country.climateData, climatePrefs),
      },
    },
  };
}

export function CountryComparison({
  countries,
  weights,
  climatePrefs,
  selectedCodes,
  onSelectedCodesChange,
  sortTrigger = 0,
  onSelectionCount,
}: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [query, setQuery] = useState("");
  const addBtnRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();
  const langPrefix = useLangPrefix();
  const navigate = useNavigate();
  const lang = i18n.language;

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

  const selectedCountries = selectedCodes
    .map((code, i) => {
      const country = countries.find((c) => c.code === code);
      return country ? { country, color: getSlotColor(i), index: i } : null;
    })
    .filter(Boolean) as {
    country: CountryData;
    color: string;
    index: number;
  }[];

  const handleRemove = (index: number) => {
    onSelectedCodesChange(selectedCodes.filter((_, i) => i !== index));
  };

  const handleAdd = (code: string) => {
    onSelectedCodesChange([...selectedCodes, code]);
    setDropdownOpen(false);
    setQuery("");
  };

  // Sort when parent triggers it
  useEffect(() => {
    if (sortTrigger > 0) {
      const sorted = [...selectedCodes].sort((a, b) => {
        const countryA = countries.find((c) => c.code === a);
        const countryB = countries.find((c) => c.code === b);
        if (!countryA || !countryB) return 0;
        return (
          computeScore(applyClimate(countryB, climatePrefs), weights) -
          computeScore(applyClimate(countryA, climatePrefs), weights)
        );
      });
      onSelectedCodesChange(sorted);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortTrigger]);

  // Report selection count to parent
  useEffect(() => {
    onSelectionCount?.(selectedCodes.length);
  }, [selectedCodes.length, onSelectionCount]);

  const filtered = countries
    .filter(
      (c) =>
        !selectedCodes.includes(c.code) &&
        localizeCountry(c, lang)
          .name.toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      localizeCountry(a, lang).name.localeCompare(
        localizeCountry(b, lang).name,
      ),
    );

  return (
    <div>
      {/* Country selector — horizontal scroll with fade hint */}
      <div className="relative">
        <div
          className="grid grid-cols-2 gap-3 pb-2 md:flex md:items-stretch md:overflow-x-auto"
          style={{ scrollbarWidth: "thin" }}
        >
          {selectedCountries.map((slot) => {
            const score = computeScore(
              applyClimate(slot.country, climatePrefs),
              weights,
            );
            const sColor = scoreColour(score);
            return (
              <div
                key={slot.country.code}
                className="min-w-0 w-full md:shrink-0 md:w-[180px]"
                onClick={() =>
                  navigate(
                    `${langPrefix}/country/${slot.country.code.toLowerCase()}`,
                  )
                }
                style={{ cursor: "pointer" }}
              >
                <div
                  className="relative rounded-lg p-4 flex flex-col items-center gap-3"
                  style={{
                    backgroundColor: "#1A1A1C",
                    border: "1px solid #2E2E30",
                    height: "100%",
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(slot.index);
                    }}
                    className="absolute top-3 right-3 flex items-center gap-1 transition-opacity hover:opacity-100"
                    style={{
                      opacity: 0.6,
                      color: "#FFFFFF",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "11px",
                    }}
                  >
                    <X size={14} />
                  </button>

                  <img
                    src={slot.country.flagUrl}
                    alt={localizeCountry(slot.country, lang).name}
                    className="rounded-full object-cover w-9 h-9"
                  />

                  <div className="flex items-center justify-center gap-1.5">
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "#E8E9EB",
                        textAlign: "center",
                      }}
                    >
                      {localizeCountry(slot.country, lang).name}
                    </span>
                    {slot.country.hasNomadVisa && (
                      <Tooltip
                        content={t(
                          "countryDetail.nomadVisa",
                          "Nomad Visa Available",
                        )}
                        side="top"
                      >
                        <Link
                          to={`${langPrefix}/country/${slot.country.code.toLowerCase()}`}
                          style={{
                            color: "var(--color-accent)",
                            flexShrink: 0,
                            lineHeight: 1,
                            display: "inline-flex",
                          }}
                        >
                          <Plane size={13} />
                        </Link>
                      </Tooltip>
                    )}
                  </div>

                  <span
                    className="text-[32px]"
                    style={{
                      fontFamily: "Oswald, sans-serif",
                      fontWeight: 700,
                      color: sColor,
                      lineHeight: 1,
                    }}
                  >
                    {score.toFixed(1)}
                  </span>

                  <span
                    className="px-2 py-0.5 rounded-full"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "10px",
                      color: "#9E9E9E",
                      backgroundColor: "#1C1C1C",
                      border: "1px solid #2C2C2C",
                    }}
                  >
                    {t(`regions.${regionKey(slot.country.region)}`)}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Add button */}
          <div
            ref={addBtnRef}
            className="min-w-0 w-full md:shrink-0 md:w-[180px]"
          >
            <button
              onClick={() => {
                if (!dropdownOpen && addBtnRef.current) {
                  const rect = addBtnRef.current.getBoundingClientRect();
                  const dropdownWidth = 320;
                  const dropdownMaxHeight = 370;
                  const left = Math.max(
                    8,
                    Math.min(rect.left, window.innerWidth - dropdownWidth - 8),
                  );
                  const fitsBelow =
                    rect.bottom + 8 + dropdownMaxHeight <= window.innerHeight;
                  const top = fitsBelow
                    ? rect.bottom + 8
                    : rect.top - dropdownMaxHeight - 8;
                  setDropdownPos({ top, left });
                }
                setDropdownOpen((p) => !p);
              }}
              className="flex min-h-[160px] w-full flex-col items-center justify-center gap-2 rounded-lg p-4 transition-colors hover:border-[#3A3A3A] md:min-h-[180px]"
              style={{
                backgroundColor: "#141416",
                border: "1px dashed #252525",
                cursor: "pointer",
              }}
            >
              <CirclePlus size={28} style={{ color: "#E8E9EB" }} />
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "12px",
                  color: "#E8E9EB",
                }}
              >
                {t("compare.addCountry")}
              </span>
            </button>
          </div>
        </div>
        {/* Right-edge fade — hints at horizontal scrollability on mobile */}
        <div
          className="pointer-events-none absolute top-0 right-0 bottom-0 hidden w-12 md:block"
          style={{
            background: "linear-gradient(to right, transparent, #0F1114)",
          }}
        />
      </div>

      {/* Dropdown — fixed-positioned under the Add Country card */}
      {dropdownOpen && dropdownPos && (
        <div
          className="z-50 rounded-lg overflow-hidden w-[320px]"
          style={{
            position: "fixed",
            top: dropdownPos.top,
            left: dropdownPos.left,
            backgroundColor: "#1A1A1C",
            border: "1px solid #2A2A2A",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          <input
            type="text"
            autoFocus
            placeholder={t("compare.searchCountry")}
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
              const score = computeScore(
                applyClimate(c, climatePrefs),
                weights,
              );
              return (
                <button
                  key={c.code}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                  onClick={() => handleAdd(c.code)}
                >
                  <img
                    src={c.flagUrl}
                    alt={localizeCountry(c, lang).name}
                    className="rounded-full object-cover"
                    style={{ width: "24px", height: "24px" }}
                  />
                  <span
                    className="flex-1 truncate"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "13px",
                      color: "#E8E9EB",
                    }}
                  >
                    {localizeCountry(c, lang).name}
                  </span>
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "11px",
                      color: "#808080",
                    }}
                  >
                    {t(`regions.${regionKey(c.region)}`)}
                  </span>
                  <span
                    style={{
                      fontFamily: "IBM Plex Mono, monospace",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: scoreColour(score),
                    }}
                  >
                    {score.toFixed(1)}
                  </span>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div
                className="px-3 py-4 text-center"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  color: "#808080",
                }}
              >
                {t("compare.noCountriesFound")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Indicator grid */}
      {selectedCountries.length > 0 && (
        <div className="mt-8">
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
                    color: "#757575",
                    textTransform: "uppercase",
                  }}
                >
                  {t("compare.indicatorHeader")}
                </span>
              </div>
              {selectedCountries.map((slot) => (
                <div
                  key={slot.index}
                  className="flex shrink-0 items-center justify-center gap-1.5"
                  style={{ width: COMPARISON_COLUMN_WIDTH }}
                >
                  <img
                    src={slot.country.flagUrl}
                    alt={localizeCountry(slot.country, lang).name}
                    className="rounded-full object-cover"
                    style={{ width: "18px", height: "18px" }}
                  />
                  <span
                    className="truncate"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#FFFFFF",
                      maxWidth: "76px",
                    }}
                  >
                    {localizeCountry(slot.country, lang).name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Scrollable data rows */}
          <div ref={bodyRef} style={{ overflowX: "auto" }}>
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
                    <Icon size={16} style={{ color: "#808080" }} />
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "13px",
                        color: "#8A8A8A",
                      }}
                    >
                      {t(
                        `indicatorsPage.indicators.${key}.name`,
                        CATEGORY_LABELS[key],
                      )}
                    </span>
                  </div>
                  {selectedCountries.map((slot) => {
                    const val = slot.country.scores[key]?.value;
                    return (
                      <div
                        key={slot.index}
                        className="shrink-0 text-center"
                        style={{ width: COMPARISON_COLUMN_WIDTH }}
                      >
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

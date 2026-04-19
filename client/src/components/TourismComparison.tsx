import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  CirclePlus,
  X,
  Shield,
  Theater,
  TreePine,
  Bed,
  UtensilsCrossed,
  Sun,
  Bus,
  Plane,
  Wifi,
  Smile,
} from "lucide-react";
import type { CountryData } from "../utils/types";
import { TOURISM_CATEGORY_KEYS } from "../utils/types";
import { localizeCountry, regionKey } from "../utils/localize";
import {
  computeTourismScore,
  tourismScoreColour,
} from "../utils/tourismScoring";
import { useLangPrefix } from "../hooks/useLangPrefix";

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

const TOURISM_ICONS: Record<string, typeof Shield> = {
  tourismSafety: Shield,
  culturalAttractions: Theater,
  naturalAttractions: TreePine,
  accommodationCost: Bed,
  foodAndDining: UtensilsCrossed,
  seasonalAppeal: Sun,
  transportCost: Bus,
  travelAccessibility: Plane,
  tourismInfrastructure: Wifi,
  localFriendliness: Smile,
};

const TOURISM_LABELS: Record<string, string> = {
  tourismSafety: "Tourism Safety",
  culturalAttractions: "Cultural Attractions",
  naturalAttractions: "Natural Attractions",
  accommodationCost: "Accommodation Cost",
  foodAndDining: "Food & Dining",
  seasonalAppeal: "Seasonal Appeal",
  transportCost: "Transport Cost",
  travelAccessibility: "Travel Accessibility",
  tourismInfrastructure: "Tourism Infrastructure",
  localFriendliness: "Local Friendliness",
};

interface Props {
  countries: CountryData[];
  selectedCodes: string[];
  onSelectedCodesChange: (codes: string[]) => void;
  sortTrigger?: number;
  sortDirection?: "desc" | "asc" | null;
  onSelectionCount?: (count: number) => void;
}

export function TourismComparison({
  countries,
  selectedCodes,
  onSelectedCodesChange,
  sortTrigger = 0,
  sortDirection = null,
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
    if (sortTrigger <= 0 || sortDirection == null) return;

    const sorted = [...selectedCodes].sort((a, b) => {
      const countryA = countries.find((c) => c.code === a);
      const countryB = countries.find((c) => c.code === b);
      if (!countryA || !countryB) return 0;

      const scoreA = computeTourismScore(countryA) ?? 0;
      const scoreB = computeTourismScore(countryB) ?? 0;
      const scoreDelta = scoreB - scoreA;

      return sortDirection === "desc" ? scoreDelta : -scoreDelta;
    });

    onSelectedCodesChange(sorted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortDirection, sortTrigger]);

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
          className="flex gap-3 pb-2"
          style={{ overflowX: "auto", scrollbarWidth: "thin" }}
        >
          {selectedCountries.map((slot) => {
            const score = computeTourismScore(slot.country);
            const sColor =
              score != null ? tourismScoreColour(score) : "#333333";
            return (
              <div
                key={slot.country.code}
                className="shrink-0 w-[148px] md:w-[180px]"
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
                    {score != null ? score.toFixed(1) : "—"}
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
          <div ref={addBtnRef} className="shrink-0 w-[148px] md:w-[180px]">
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
        {/* Right-edge fade */}
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
            name="tourism-comparison-search"
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
              const score = computeTourismScore(c);
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
                      color:
                        score != null ? tourismScoreColour(score) : "#333333",
                    }}
                  >
                    {score != null ? score.toFixed(1) : "—"}
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

          {/* Sticky column header */}
          <div
            ref={headerRef}
            className="sticky z-10 top-14 sm:top-[112px]"
            style={{
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
            {TOURISM_CATEGORY_KEYS.map((key) => {
              const Icon = TOURISM_ICONS[key];
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
                    {Icon && <Icon size={16} style={{ color: "#808080" }} />}
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "13px",
                        color: "#8A8A8A",
                      }}
                    >
                      {t(`tourism.metrics.${key}`, TOURISM_LABELS[key] ?? key)}
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
                            color:
                              val != null ? tourismScoreColour(val) : "#333333",
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

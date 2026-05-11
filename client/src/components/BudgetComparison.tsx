import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CirclePlus,
  X,
  House,
  ShoppingCart,
  UtensilsCrossed,
  Bus,
  Wifi,
  Laptop,
  HeartPulse,
  Wallet,
  TrendingUp,
} from "lucide-react";
import type { CountryData } from "../utils/types";
import { localizeCountry, regionKey } from "../utils/localize";
import { COST_COLORS, surplusColour } from "../utils/budgetColors";
import { getComparisonSlotColor } from "../shared/lib/comparisonColors";
import { useSyncScroll } from "../shared/hooks/useSyncScroll";
import type { BudgetMatch } from "../hooks/useBudgetMatcher";

function costColor(value: number, min: number): string {
  if (value <= min) return "#4CAF50";
  return "#FFFFFF";
}

const BREAKDOWN_ROWS: {
  key: keyof import("../hooks/useBudgetMatcher").BudgetBreakdown;
  icon: typeof House;
}[] = [
  { key: "housing", icon: House },
  { key: "groceries", icon: ShoppingCart },
  { key: "dining", icon: UtensilsCrossed },
  { key: "transport", icon: Bus },
  { key: "utilities", icon: Wifi },
  { key: "coworking", icon: Laptop },
  { key: "healthInsurance", icon: HeartPulse },
];

const BUDGET_COMPARISON_COLUMN_WIDTH = "112px";

interface Props {
  countries: CountryData[];
  matches?: BudgetMatch[];
  selectedCodes: string[];
  onSelectedCodesChange: (codes: string[]) => void;
  sortTrigger?: number;
  sortDirection?: "desc" | "asc" | null;
}

export function BudgetComparison({
  countries,
  matches = [],
  selectedCodes,
  onSelectedCodesChange,
  sortTrigger = 0,
  sortDirection = null,
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
  const lang = i18n.language;

  const matchMap = useMemo(() => new Map(matches.map((m) => [m.country.code, m])), [matches]);

  // Sync horizontal scroll
  useSyncScroll(headerRef, bodyRef);

  const selectedSlots = selectedCodes
    .map((code, i) => {
      const country = countries.find((c) => c.code === code);
      return country ? { country, color: getComparisonSlotColor(i), index: i } : null;
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

  useEffect(() => {
    if (sortTrigger <= 0 || sortDirection == null) return;

    const sortedCodes = [...selectedCodes].sort((codeA, codeB) => {
      const matchA = matchMap.get(codeA);
      const matchB = matchMap.get(codeB);

      if (!matchA && !matchB) return 0;
      if (!matchA) return sortDirection === "desc" ? 1 : -1;
      if (!matchB) return sortDirection === "desc" ? -1 : 1;

      if (matchA.monthlyCost !== matchB.monthlyCost) {
        const costDelta = matchB.monthlyCost - matchA.monthlyCost;
        return sortDirection === "desc" ? costDelta : -costDelta;
      }

      const surplusDelta = matchB.surplus - matchA.surplus;
      return sortDirection === "desc" ? surplusDelta : -surplusDelta;
    });

    if (
      sortedCodes.length === selectedCodes.length &&
      sortedCodes.every((code, index) => code === selectedCodes[index])
    ) {
      return;
    }

    onSelectedCodesChange(sortedCodes);
  }, [matchMap, onSelectedCodesChange, selectedCodes, sortDirection, sortTrigger]);

  const filtered = countries
    .filter(
      (c) =>
        c.costOfLiving &&
        !selectedCodes.includes(c.code) &&
        localizeCountry(c, lang).name.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) => localizeCountry(a, lang).name.localeCompare(localizeCountry(b, lang).name));

  // Cheapest value per row across selected countries
  const minBreakdown: Record<string, number> = {};
  const maxBreakdown: Record<string, number> = {};
  BREAKDOWN_ROWS.forEach(({ key }) => {
    const values = selectedSlots.map(
      (slot) => matchMap.get(slot.country.code)?.breakdown[key] ?? 0,
    );
    minBreakdown[key] = values.length > 0 ? Math.min(...values) : 0;
    maxBreakdown[key] = Math.max(1, ...values);
  });
  const minTotal =
    selectedSlots.length > 0
      ? Math.min(...selectedSlots.map((slot) => matchMap.get(slot.country.code)?.monthlyCost ?? 0))
      : 0;

  return (
    <div>
      {/* ── Country selector ─────────────────────────────────── */}
      <div className="relative">
        <div
          className="grid grid-cols-3 gap-3 pb-2 md:flex md:items-stretch md:overflow-x-auto"
          style={{ scrollbarWidth: "thin" }}
        >
          {selectedSlots.map((slot) => {
            const match = matchMap.get(slot.country.code);
            const cost = match?.monthlyCost;
            const surplus = match != null ? match.surplus : null;
            return (
              <div key={slot.country.code} className="min-w-0 w-full md:shrink-0 md:w-[180px]">
                <div
                  className="relative rounded-lg p-4 flex flex-col items-center gap-3"
                  style={{
                    backgroundColor: "#1A1A1C",
                    border: "1px solid #2E2E30",
                    height: "100%",
                  }}
                >
                  <button
                    onClick={() => handleRemove(slot.index)}
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

                  <span
                    className="text-[28px]"
                    style={{
                      fontFamily: "Oswald, sans-serif",
                      fontWeight: 700,
                      color: cost != null ? "#C2956A" : "#555",
                      lineHeight: 1,
                    }}
                  >
                    {cost != null ? `$${cost.toLocaleString()}` : "—"}
                  </span>

                  {surplus != null && (
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: surplusColour(surplus),
                      }}
                    >
                      {surplus >= 0
                        ? `+$${surplus.toLocaleString()} left`
                        : `-$${Math.abs(surplus).toLocaleString()} over`}
                    </span>
                  )}

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
          <div ref={addBtnRef} className="min-w-0 w-full md:shrink-0 md:w-[180px]">
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
                  const fitsBelow = rect.bottom + 8 + dropdownMaxHeight <= window.innerHeight;
                  const top = fitsBelow ? rect.bottom + 8 : rect.top - dropdownMaxHeight - 8;
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

      {/* Dropdown */}
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
            name="budget-comparison-search"
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
              const match = matchMap.get(c.code);
              const cost = match?.monthlyCost ?? c.costOfLiving?.totalBasic;
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
                      color: "#C2956A",
                    }}
                  >
                    {cost != null ? `$${cost.toLocaleString()}` : "—"}
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

      {/* Data grid */}
      {selectedSlots.length > 0 && (
        <div className="mt-8">
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
                  {t("compare.indicatorHeader", "Category")}
                </span>
              </div>
              {selectedSlots.map((slot) => (
                <div
                  key={slot.index}
                  className="flex shrink-0 items-center justify-center gap-1.5"
                  style={{ width: BUDGET_COMPARISON_COLUMN_WIDTH }}
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

          {/* Scrollable rows */}
          <div ref={bodyRef} style={{ overflowX: "auto" }}>
            {/* Monthly total row */}
            <div
              className="flex items-center"
              style={{ borderBottom: "1px solid #1C1C1C", padding: "16px 0" }}
            >
              <div className="flex items-center gap-2.5 w-[160px] md:w-[240px] shrink-0">
                <Wallet size={16} style={{ color: "#C2956A", flexShrink: 0 }} />
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "13px",
                    color: "#8A8A8A",
                  }}
                >
                  {t("budget.totalMonthly", "Monthly Total")}
                </span>
              </div>
              {selectedSlots.map((slot) => {
                const val = matchMap.get(slot.country.code)?.monthlyCost;
                return (
                  <div
                    key={slot.index}
                    className="shrink-0 text-center"
                    style={{ width: BUDGET_COMPARISON_COLUMN_WIDTH }}
                  >
                    <span
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: "22px",
                        fontWeight: 600,
                        color: val != null ? costColor(val, minTotal) : "#333333",
                      }}
                    >
                      {val != null ? `$${val.toLocaleString()}` : "—"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Surplus row */}
            <div
              className="flex items-center"
              style={{ borderBottom: "1px solid #1C1C1C", padding: "16px 0" }}
            >
              <div className="flex items-center gap-2.5 w-[160px] md:w-[240px] shrink-0">
                <TrendingUp size={16} style={{ color: "#4CAF50", flexShrink: 0 }} />
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "13px",
                    color: "#8A8A8A",
                  }}
                >
                  {t("budget.surplus", "Surplus")}
                </span>
              </div>
              {selectedSlots.map((slot) => {
                const match = matchMap.get(slot.country.code);
                const val = match?.surplus;
                return (
                  <div
                    key={slot.index}
                    className="shrink-0 text-center"
                    style={{ width: BUDGET_COMPARISON_COLUMN_WIDTH }}
                  >
                    <span
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: "22px",
                        fontWeight: 600,
                        color: val != null ? surplusColour(val) : "#333333",
                      }}
                    >
                      {val != null
                        ? val >= 0
                          ? `+$${val.toLocaleString()}`
                          : `-$${Math.abs(val).toLocaleString()}`
                        : "—"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Breakdown rows */}
            {BREAKDOWN_ROWS.map(({ key, icon: Icon }) => {
              const dotColor = COST_COLORS[key] ?? "#888";
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
                    <Icon size={16} style={{ color: dotColor }} />
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "13px",
                        color: "#8A8A8A",
                      }}
                    >
                      {t(`budget.categories.${key}`, key)}
                    </span>
                  </div>
                  {selectedSlots.map((slot) => {
                    const val = matchMap.get(slot.country.code)?.breakdown[key];
                    return (
                      <div
                        key={slot.index}
                        className="shrink-0 text-center"
                        style={{ width: BUDGET_COMPARISON_COLUMN_WIDTH }}
                      >
                        <span
                          style={{
                            fontFamily: "IBM Plex Mono, monospace",
                            fontSize: "22px",
                            fontWeight: 600,
                            color: val != null ? costColor(val, minBreakdown[key]) : "#333333",
                          }}
                        >
                          {val != null ? `$${val.toLocaleString()}` : "—"}
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

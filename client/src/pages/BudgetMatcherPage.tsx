import { useState, useRef } from "react";
import {
  House,
  ShoppingCart,
  UtensilsCrossed,
  Bus,
  Wifi,
  Laptop,
  HeartPulse,
  ChevronDown,
  Sliders,
  UserRound,
  SlidersHorizontal,
  X,
  Info,
  Search,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useLangPrefix } from "../hooks/useLangPrefix";
import { Tooltip } from "../components/Tooltip";
import { BudgetCountryCard } from "../components/BudgetCountryCard";
import { useCountries } from "../hooks/useCountries";
import { useBudgetState } from "../hooks/useBudgetState";
import type { BudgetCategoryWeights } from "../hooks/useBudgetState";
import { useBudgetMatcher } from "../hooks/useBudgetMatcher";
import { COST_COLORS } from "../utils/budgetColors";
import { localizeCountry } from "../utils/localize";

const BUDGET_CATEGORIES: {
  key: keyof BudgetCategoryWeights;
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

/* ── Shared toggle component ────────────────────────── */
function ToggleGroup<T extends string | number>({
  options,
  value,
  onChange,
  labelFn,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  labelFn: (v: T) => string;
}) {
  return (
    <div
      className="flex"
      style={{
        backgroundColor: "#2A2A2A",
        borderRadius: 4,
        padding: 4,
        gap: 4,
      }}
    >
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={String(opt)}
            onClick={() => onChange(opt)}
            style={{
              flex: 1,
              padding: "5px 0",
              borderRadius: 3,
              border: "none",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              fontWeight: active ? 500 : 400,
              backgroundColor: active ? "var(--color-accent)" : "transparent",
              color: active ? "#FFFFFF" : "#666666",
              textAlign: "center",
              transition: "all 0.15s ease",
            }}
          >
            {labelFn(opt)}
          </button>
        );
      })}
    </div>
  );
}

export function BudgetMatcherPage() {
  const { t, i18n } = useTranslation();
  const langPrefix = useLangPrefix();
  const { countries, loading } = useCountries();
  const bs = useBudgetState();
  const [mobileParamsOpen, setMobileParamsOpen] = useState(false);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const matches = useBudgetMatcher(
    countries,
    bs.budget,
    bs.housing,
    bs.bedrooms,
    bs.peopleCount,
    bs.categoryWeights,
    bs.qualityBlend,
  );

  const query = search.trim().toLowerCase();
  const filteredMatches = query
    ? matches.filter((m) =>
        localizeCountry(m.country, i18n.language)
          .name.toLowerCase()
          .includes(query),
      )
    : matches;

  const budgetPct = ((bs.budget - 300) / 9700) * 100;

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    lifestyle: false,
    categories: false,
  });
  const [copied, setCopied] = useState(false);
  const toggle = (key: string) =>
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  /* ── Sidebar content (shared between desktop & mobile) ── */
  const sidebarContent = (
    <>
      {/* ── Budget slider (always visible) ────────────────── */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #242424",
        }}
      >
        <div className="flex items-end gap-2 mb-3">
          <span
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: 28,
              fontWeight: 700,
              color: "#E8E9EB",
              lineHeight: 1,
            }}
          >
            ${bs.budget.toLocaleString()}
          </span>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              color: "#555555",
              paddingBottom: 2,
            }}
          >
            {t("budget.perMonth", "/month")}
          </span>
        </div>

        <input
          type="range"
          min={300}
          max={10000}
          step={50}
          value={bs.budget}
          onChange={(e) => bs.setBudget(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${budgetPct}%, #333333 ${budgetPct}%, #333333 100%)`,
          }}
          aria-label="Budget slider"
        />

        <div className="flex justify-between mt-1.5">
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 10,
              color: "#555555",
            }}
          >
            $300
          </span>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 10,
              color: "#555555",
            }}
          >
            $10,000
          </span>
        </div>
      </div>

      {/* ── QUALITY BLEND (top level) ─────────────────────── */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #242424" }}>
        <div className="flex flex-col" style={{ gap: 9 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  color: "#FFFFFF",
                }}
              >
                {t("budget.qualityBlend", "Quality blend")}
              </span>
              <Tooltip
                content={
                  <div style={{ maxWidth: 240 }}>
                    <div
                      style={{
                        marginBottom: 6,
                        color: "#FFFFFF",
                        fontWeight: 600,
                      }}
                    >
                      {t("budget.qualityBlend", "Quality blend")}
                    </div>
                    <div>
                      {t(
                        "budget.qualityBlendTooltip",
                        "Controls the balance between pure cost-of-living affordability and overall country quality (safety, healthcare, internet, infrastructure). At 0% only price matters; at 100% only quality matters.",
                      )}
                    </div>
                  </div>
                }
                side="bottom"
              >
                <Info
                  size={13}
                  color="#FFFFFF"
                  style={{ cursor: "pointer", flexShrink: 0, opacity: 0.45 }}
                />
              </Tooltip>
            </div>
            <span
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: 11,
                color: "var(--color-accent-dim)",
              }}
            >
              {bs.qualityBlend}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={bs.qualityBlend}
            onChange={(e) => bs.setQualityBlend(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${bs.qualityBlend}%, #333333 ${bs.qualityBlend}%, #333333 100%)`,
            }}
            aria-label="Quality blend"
          />
          <div className="flex justify-between">
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 10,
                color: "#555555",
              }}
            >
              {t("budget.pureAffordability", "Pure Affordability")}
            </span>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 10,
                color: "#555555",
              }}
            >
              {t("budget.qualityFocus", "Country Quality")}
            </span>
          </div>
        </div>
      </div>

      {/* ── LIFESTYLE PROFILE (collapsible) ───────────────── */}
      <div style={{ borderBottom: "1px solid #242424" }}>
        <button
          className="w-full flex items-center"
          style={{
            height: 40,
            padding: "0 14px",
            gap: 8,
            backgroundColor: "transparent",
          }}
          onClick={() => toggle("lifestyle")}
        >
          <UserRound size={16} color="#C2956A" />
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: "#888888",
              flex: 1,
              textAlign: "left",
            }}
          >
            {t("budget.lifestyleProfile", "LIFESTYLE PROFILE")}
          </span>
          <ChevronDown
            size={14}
            style={{
              color: "#555555",
              transform: !collapsed.lifestyle
                ? "rotate(0deg)"
                : "rotate(-90deg)",
              transition: "transform 0.15s ease",
              flexShrink: 0,
            }}
          />
        </button>

        {!collapsed.lifestyle && (
          <div
            style={{
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* Apartment size */}
            <div className="flex flex-col" style={{ gap: 6 }}>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  color: "#FFFFFF",
                }}
              >
                {t("budget.bedrooms.label")}
              </span>
              <ToggleGroup
                options={[1, 2, 3] as const}
                value={bs.bedrooms}
                onChange={bs.setBedrooms}
                labelFn={(v) => t(`budget.bedrooms.${v}`, `${v} BR`)}
              />
            </div>

            {/* Housing preference — city vs region, applies to all bedroom counts */}
            <div className="flex flex-col" style={{ gap: 6 }}>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  color: "#FFFFFF",
                }}
              >
                {t("budget.housing.label", "Location")}
              </span>
              <ToggleGroup
                options={["majorCity", "smallerCity"] as const}
                value={bs.housing}
                onChange={bs.setHousing}
                labelFn={(v) =>
                  t(
                    `budget.housing.${v}`,
                    v === "majorCity" ? "Major City" : "Region / Smaller City",
                  )
                }
              />
            </div>

            {/* People count */}
            <div className="flex flex-col" style={{ gap: 6 }}>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  color: "#FFFFFF",
                }}
              >
                {t("budget.people.label", "People")}
              </span>
              <div
                className="inline-flex items-center"
                style={{
                  borderRadius: 6,
                  height: 36,
                  gap: 4,
                }}
              >
                <button
                  onClick={() =>
                    bs.setPeopleCount(Math.max(1, bs.peopleCount - 1))
                  }
                  disabled={bs.peopleCount <= 1}
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: bs.peopleCount <= 1 ? "#222" : "#333",
                    border: "none",
                    borderRadius: 6,
                    color: bs.peopleCount <= 1 ? "#555" : "#E8E9EB",
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: bs.peopleCount <= 1 ? "default" : "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  −
                </button>
                <span
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#E8E9EB",
                    minWidth: 24,
                    textAlign: "center",
                    userSelect: "none",
                  }}
                >
                  {bs.peopleCount}
                </span>
                <button
                  onClick={() =>
                    bs.setPeopleCount(Math.min(20, bs.peopleCount + 1))
                  }
                  disabled={bs.peopleCount >= 20}
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: bs.peopleCount >= 20 ? "#222" : "#333",
                    border: "none",
                    borderRadius: 6,
                    color: bs.peopleCount >= 20 ? "#555" : "#E8E9EB",
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: bs.peopleCount >= 20 ? "default" : "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── CATEGORY WEIGHTS (collapsible) ────────────────── */}
      <div style={{ borderBottom: "1px solid #242424" }}>
        <button
          className="w-full flex items-center"
          style={{
            height: 40,
            padding: "0 14px",
            gap: 8,
            backgroundColor: "transparent",
          }}
          onClick={() => toggle("categories")}
        >
          <Sliders size={16} color="#C2956A" />
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: "#888888",
              flex: 1,
              textAlign: "left",
            }}
          >
            {t("budget.categoryWeights", "CATEGORY WEIGHTS")}
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#291608",
              borderRadius: 3,
              padding: "3px 8px",
            }}
          >
            <span
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: 11,
                color: "#C2956A",
              }}
            >
              Avg{" "}
              {Math.round(
                Object.values(bs.categoryWeights).reduce((a, b) => a + b, 0) /
                  BUDGET_CATEGORIES.length,
              )}
            </span>
          </div>
          <ChevronDown
            size={14}
            style={{
              color: "#555555",
              transform: !collapsed.categories
                ? "rotate(0deg)"
                : "rotate(-90deg)",
              transition: "transform 0.15s ease",
              flexShrink: 0,
            }}
          />
        </button>

        {!collapsed.categories && (
          <div style={{ paddingTop: 4, paddingBottom: 4 }}>
            {BUDGET_CATEGORIES.map(({ key, icon: Icon }) => (
              <div key={key} style={{ padding: "10px 16px" }}>
                <div className="flex flex-col" style={{ gap: 9 }}>
                  <div className="flex items-center justify-between">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Icon size={14} color="#888888" />
                      <Link
                        to={`${langPrefix}/budget-categories`}
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: 12,
                          fontWeight: 400,
                          color: "#FFFFFF",
                          textDecoration: "none",
                        }}
                      >
                        {t(`budget.categories.${key}`)}
                      </Link>
                    </div>
                    <span
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: 11,
                        color: "var(--color-accent-dim)",
                      }}
                    >
                      {bs.categoryWeights[key]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={bs.categoryWeights[key]}
                    onChange={(e) =>
                      bs.handleCategoryWeight(key, Number(e.target.value))
                    }
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${bs.categoryWeights[key]}%, #333333 ${bs.categoryWeights[key]}%, #333333 100%)`,
                    }}
                    aria-label={`${key} weight`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Share & Reset buttons ─────────────────────────── */}
      <div
        className="flex-shrink-0 sticky bottom-0"
        style={{ borderTop: "1px solid #333333", backgroundColor: "#131416" }}
      >
        <div className="flex flex-col gap-2" style={{ padding: "12px 16px" }}>
          {!bs.isDefault && (
            <button
              onClick={() => {
                bs.handleShare();
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
              }}
              className="w-full flex items-center justify-center gap-2 rounded transition-colors"
              style={{
                backgroundColor: copied ? "#2A4A2A" : "#1A2A1A",
                color: copied ? "#88CC88" : "#6B9E6B",
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                height: "40px",
                border: `1px solid ${copied ? "#4A8A4A" : "#2A4A2A"}`,
                borderRadius: "6px",
                transition: "all 0.15s ease",
                cursor: "pointer",
              }}
            >
              {copied ? (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {t("weights.linkCopied", "Link copied!")}
                </>
              ) : (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                  {t("weights.shareWeights", "Share weights")}
                </>
              )}
            </button>
          )}
          <button
            onClick={bs.handleReset}
            className="w-full flex items-center justify-center gap-2 rounded transition-colors"
            style={{
              backgroundColor: "transparent",
              color: "var(--color-accent-dim)",
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: 500,
              height: "40px",
              border: "1px solid #333333",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            {t("weights.resetToDefaults", "Reset to defaults")}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <Layout>
      <div className="flex">
        {/* ── Left sidebar (hidden on mobile) ─────────────── */}
        <aside
          className="hidden md:block sticky top-14 self-start overflow-y-auto"
          style={{
            width: "340px",
            height: "calc(100vh - 56px)",
            backgroundColor: "#131416",
            borderRight: "1px solid #1E1E22",
            flexShrink: 0,
          }}
        >
          {sidebarContent}
        </aside>

        {/* ── Mobile parameters bottom sheet ──────────────── */}
        {mobileParamsOpen && (
          <div
            className="md:hidden fixed inset-0 z-50 flex flex-col"
            onClick={() => setMobileParamsOpen(false)}
          >
            <div
              className="flex-1"
              style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            />
            <div
              className="relative flex flex-col"
              style={{
                height: "85vh",
                backgroundColor: "#1A1A1A",
                borderTopLeftRadius: "12px",
                borderTopRightRadius: "12px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div
                  style={{
                    width: "36px",
                    height: "4px",
                    borderRadius: "2px",
                    backgroundColor: "#444444",
                  }}
                />
              </div>
              {/* Close button */}
              <div className="flex items-center justify-between px-4 pb-2 shrink-0">
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    color: "#999999",
                  }}
                >
                  {t("budget.eyebrow", "BUDGET MATCHER")}
                </span>
                <button
                  onClick={() => setMobileParamsOpen(false)}
                  className="flex items-center justify-center"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "4px",
                    backgroundColor: "#333333",
                    color: "#999999",
                    border: "none",
                    cursor: "pointer",
                  }}
                  aria-label="Close parameters"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{sidebarContent}</div>
            </div>
          </div>
        )}

        {/* ── Mobile FAB ──────────────────────────────────── */}
        <button
          className="md:hidden fixed z-40 flex items-center gap-2 shadow-lg"
          style={{
            bottom: "24px",
            right: "16px",
            height: "48px",
            paddingLeft: "16px",
            paddingRight: "18px",
            borderRadius: "24px",
            backgroundColor: "var(--color-accent)",
            color: "#FFFFFF",
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
          onClick={() => setMobileParamsOpen(true)}
          aria-label="Open parameters"
        >
          <SlidersHorizontal size={18} />
          {t("mobileSheet.parameters", "Parameters")}
        </button>

        {/* ── Right content area ──────────────────────────── */}
        <main className="flex-1 min-w-0" style={{ backgroundColor: "#0F1114" }}>
          <div className="px-4 md:px-6">
            {/* ── Hero section (matching list page) ─────────── */}
            <div
              className="relative mb-6 md:mb-6 rounded-lg overflow-hidden"
              style={{
                background: "#0A0D12",
                backgroundImage: "url('/hero-map.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.85) 100%)",
                }}
              />

              <div
                className="relative flex flex-col justify-end px-4 py-4 md:px-12 md:py-12"
                style={{ minHeight: "160px" }}
              >
                {/* Eyebrow with dots (list page style) */}
                <div className="flex items-center gap-2 mb-2 md:mb-3">
                  {t("budget.eyebrow", "BUDGET MATCHER")
                    .split("·")
                    .map((word, i) => (
                      <span
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            width: "4px",
                            height: "4px",
                            borderRadius: "50%",
                            backgroundColor: "var(--color-accent-dim)",
                            flexShrink: 0,
                            display: "inline-block",
                          }}
                        />
                        <span
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "11px",
                            fontWeight: 500,
                            letterSpacing: "2.5px",
                            textTransform: "uppercase",
                            color: "var(--color-accent-dim)",
                            lineHeight: 1,
                          }}
                        >
                          {word.trim()}
                        </span>
                      </span>
                    ))}
                </div>
                {/* H1 — responsive font (list page style) */}
                <h1
                  className="text-3xl md:text-6xl"
                  style={{
                    fontFamily: "Oswald, sans-serif",
                    fontWeight: 700,
                    lineHeight: "0.95",
                    color: "#FFFFFF",
                    marginBottom: "8px",
                  }}
                >
                  {t("budget.eyebrow", "BUDGET MATCHER")}
                </h1>
                {/* Tagline */}
                <p
                  className="hidden md:block"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "15px",
                    color: "#777777",
                    maxWidth: "580px",
                    marginBottom: "20px",
                  }}
                >
                  {t(
                    "budget.subtitle",
                    "Enter your monthly budget and discover which countries offer the best lifestyle for your money",
                  )}
                </p>
                {/* Copper rule */}
                <div
                  className="hidden md:block"
                  style={{
                    width: "128px",
                    height: "2px",
                    backgroundColor: "var(--color-accent)",
                    marginBottom: "16px",
                  }}
                />
                {/* Stats row */}
                <div className="flex items-center gap-4 md:gap-6">
                  <div>
                    <div
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "var(--color-accent-dim)",
                        lineHeight: "1",
                      }}
                    >
                      {matches.length || "—"}
                    </div>
                    <div
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "10px",
                        color: "#444444",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        marginTop: "4px",
                      }}
                    >
                      {t("budget.matchedCountries")}
                    </div>
                  </div>
                  <div
                    className="w-px h-6 md:h-8"
                    style={{ backgroundColor: "#333333" }}
                  />
                  <div>
                    <div
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "var(--color-accent-dim)",
                        lineHeight: "1",
                      }}
                    >
                      ${bs.budget.toLocaleString()}
                    </div>
                    <div
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "10px",
                        color: "#444444",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        marginTop: "4px",
                      }}
                    >
                      {t("budget.perMonth", "/ MONTH")}
                    </div>
                  </div>
                  <div
                    className="w-px h-6 md:h-8"
                    style={{ backgroundColor: "#333333" }}
                  />
                  <Link
                    to={`${langPrefix}/budget-categories`}
                    style={{ textDecoration: "none" }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: "IBM Plex Mono, monospace",
                          fontSize: "18px",
                          fontWeight: 600,
                          color: "var(--color-accent-dim)",
                          lineHeight: "1",
                        }}
                      >
                        {BUDGET_CATEGORIES.length}
                      </div>
                      <div
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "10px",
                          color: "#444444",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          marginTop: "4px",
                        }}
                      >
                        {t("budget.categories.title")}
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* ── Sentinel + sticky search bar ──────────────── */}
            <div ref={sentinelRef} style={{ height: 0 }} />
            <div
              className="sticky z-20 -mx-4 px-4 md:-mx-6 md:px-6 py-3"
              style={{
                top: "56px",
                backgroundColor: "#0F1114",
                borderBottom: "1px solid #1a1a1a",
              }}
            >
              {/* Search input */}
              <div className="relative mb-3">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  size={16}
                  style={{ color: "#555555", pointerEvents: "none" }}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t("search.placeholder", "Search countries…")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 rounded-md focus:outline-none"
                  style={{
                    backgroundColor: "#161616",
                    border: "1px solid #1E1E22",
                    color: "#FFFFFF",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "14px",
                  }}
                />
                {search.length > 0 && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "3px",
                      border: "none",
                      cursor: "pointer",
                      backgroundColor: "#2A2A2A",
                      color: "#CCCCCC",
                    }}
                    aria-label="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Color legend — always visible below search */}
              <Link
                to={`${langPrefix}/budget-categories`}
                className="flex flex-wrap gap-x-4 gap-y-1 px-0.5"
                style={{ textDecoration: "none" }}
              >
                {BUDGET_CATEGORIES.map(({ key }) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: COST_COLORS[key] ?? "#555",
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "11px",
                        color: "#666666",
                      }}
                    >
                      {t(`budget.categories.${key}`)}
                    </span>
                  </div>
                ))}
              </Link>
            </div>

            {/* ── Results ───────────────────────────────────── */}
            {loading ? (
              <div className="flex flex-col gap-2 mt-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-14 animate-pulse"
                    style={{
                      backgroundColor: "#1A1A1A",
                      borderTop: "1px solid #333333",
                    }}
                  />
                ))}
              </div>
            ) : matches.length === 0 ? (
              <p
                className="text-center py-20"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 14,
                  color: "#666666",
                }}
              >
                {t("budget.noResults", "No countries with cost data available")}
              </p>
            ) : (
              <div className="flex flex-col">
                <p
                  className="text-xs text-right pr-1 my-4"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    color: "#666666",
                  }}
                >
                  {t("countryList.count", { count: filteredMatches.length })}
                </p>
                {filteredMatches.length === 0 ? (
                  <p
                    className="text-center py-20"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 14,
                      color: "#666666",
                    }}
                  >
                    {t("countryList.noResults")}
                  </p>
                ) : (
                  filteredMatches.map((m, i) => (
                    <BudgetCountryCard
                      key={m.country.code}
                      match={m}
                      budget={bs.budget}
                      rank={i + 1}
                      expanded={expandedCode === m.country.code}
                      onToggle={() =>
                        setExpandedCode((prev) =>
                          prev === m.country.code ? null : m.country.code,
                        )
                      }
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
}

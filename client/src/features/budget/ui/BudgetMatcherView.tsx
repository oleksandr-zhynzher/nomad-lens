import { useRef, useState } from "react";
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
  GitCompare,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@core/ui/layout";
import { MobileSheet } from "@core/ui";
import { useLangPrefix } from "@core/hooks";
import { Tooltip } from "@core/ui";
import { BudgetCountryCard } from "@features/budget/ui";
import { useCountries } from "@core/hooks";
import { useBudgetMatcher } from "@features/budget/hooks";
import { useBudgetState, type BudgetCategoryWeights } from "@features/budget/hooks";
import { COST_COLORS } from "@features/budget/constants";
import { localizeCountry } from "@core/utils";

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
    <div className="flex bg-surface-4 rounded p-1 gap-1">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={String(opt)}
            onClick={() => onChange(opt)}
            className={`flex-1 px-0 py-[5px] rounded-[3px] border-0 cursor-pointer text-center text-xs transition-all duration-150 ${active ? "bg-accent text-white font-medium" : "bg-transparent text-dim font-normal"}`}
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
  const navigate = useNavigate();
  const { countries, loading } = useCountries();
  const bs = useBudgetState();
  const [mobileParamsOpen, setMobileParamsOpen] = useState(false);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Compare mode
  const [compareMode, setCompareMode] = useState(false);
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());

  const toggleSelect = (code: string) =>
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  const exitCompareMode = () => {
    setCompareMode(false);
    setSelectedCodes(new Set());
  };

  const handleCompare = () => {
    if (selectedCodes.size < 2) return;
    navigate(`${langPrefix}/compare?m=budget&c=${Array.from(selectedCodes).join(",")}`);
  };

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
        localizeCountry(m.country, i18n.language).name.toLowerCase().includes(query),
      )
    : matches;

  const budgetPct = ((bs.budget - 300) / 9700) * 100;

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    lifestyle: false,
    categories: false,
  });
  const [copied, setCopied] = useState(false);
  const toggle = (key: string) => setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  /* ── Sidebar content (shared between desktop & mobile) ── */
  const sidebarContent = (
    <>
      {/* ── Budget slider (always visible) ────────────────── */}
      <div className="p-4 border-b border-[#242424]">
        <div className="flex items-end gap-2 mb-3">
          <span className="font-mono text-[28px] font-bold text-on-surface leading-none">
            ${bs.budget.toLocaleString()}
          </span>
          <span className="text-xs text-dimmer pb-0.5">{t("budget.perMonth", "/month")}</span>
        </div>

        <input
          name="budget-amount"
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
          aria-label={t("a11y.budgetSlider", "Budget slider")}
        />

        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-dimmer">$300</span>
          <span className="text-[10px] text-dimmer">$10,000</span>
        </div>
      </div>

      {/* ── QUALITY BLEND (top level) ─────────────────────── */}
      <div className="px-4 py-3 border-b border-[#242424]">
        <div className="flex flex-col gap-[9px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-white">
                {t("budget.qualityBlend", "Quality blend")}
              </span>
              <Tooltip
                content={
                  <div className="max-w-[240px]">
                    <div className="mb-1.5 text-white font-semibold">
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
                  className="cursor-pointer shrink-0 opacity-[0.45]"
                />
              </Tooltip>
            </div>
            <span className="font-mono text-[11px] text-accent-dim">{bs.qualityBlend}</span>
          </div>
          <input
            name="budget-quality-blend"
            type="range"
            min={0}
            max={100}
            value={bs.qualityBlend}
            onChange={(e) => bs.setQualityBlend(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${bs.qualityBlend}%, #333333 ${bs.qualityBlend}%, #333333 100%)`,
            }}
            aria-label={t("a11y.qualityBlend", "Quality blend")}
          />
          <div className="flex justify-between">
            <span className="text-[10px] text-dimmer">
              {t("budget.pureAffordability", "Pure Affordability")}
            </span>
            <span className="text-[10px] text-dimmer">
              {t("budget.qualityFocus", "Country Quality")}
            </span>
          </div>
        </div>
      </div>

      {/* ── LIFESTYLE PROFILE (collapsible) ───────────────── */}
      <div className="border-b border-[#242424]">
        <button
          className="w-full flex items-center h-10 px-3.5 gap-2 bg-transparent"
          onClick={() => toggle("lifestyle")}
        >
          <UserRound size={16} color="#C2956A" />
          <span className="text-[10px] font-semibold tracking-[1.5px] uppercase text-muted flex-1 text-left"></span>
          <ChevronDown
            size={14}
            className={`text-dimmer shrink-0 transition-transform duration-150 ${!collapsed.lifestyle ? "rotate-0" : "-rotate-90"}`}
          />
        </button>

        {!collapsed.lifestyle && (
          <div className="px-4 py-3 flex flex-col gap-3.5">
            {/* Apartment size */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-white">{t("budget.bedrooms.label")}</span>
              <ToggleGroup
                options={[1, 2, 3] as const}
                value={bs.bedrooms}
                onChange={bs.setBedrooms}
                labelFn={(v) => t(`budget.bedrooms.${v}`, `${v} BR`)}
              />
            </div>

            {/* Housing preference — city vs region, applies to all bedroom counts */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-white">{t("budget.housing.label", "Location")}</span>
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
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-white">{t("budget.people.label", "People")}</span>
              <div className="inline-flex items-center rounded-md h-9 gap-1">
                <button
                  onClick={() => bs.setPeopleCount(Math.max(1, bs.peopleCount - 1))}
                  disabled={bs.peopleCount <= 1}
                  className={`w-8 h-8 flex items-center justify-center border-0 rounded-md text-base font-bold cursor-${bs.peopleCount <= 1 ? "default" : "pointer"} transition-all duration-150 ${bs.peopleCount <= 1 ? "bg-surface-2 text-[#555]" : "bg-border text-on-surface"}`}
                >
                  −
                </button>
                <span className="font-mono text-[15px] font-bold text-on-surface min-w-6 text-center select-none">
                  {bs.peopleCount}
                </span>
                <button
                  onClick={() => bs.setPeopleCount(Math.min(20, bs.peopleCount + 1))}
                  disabled={bs.peopleCount >= 20}
                  className={`w-8 h-8 flex items-center justify-center border-0 rounded-md text-base font-bold cursor-${bs.peopleCount >= 20 ? "default" : "pointer"} transition-all duration-150 ${bs.peopleCount >= 20 ? "bg-surface-2 text-[#555]" : "bg-border text-on-surface"}`}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── CATEGORY WEIGHTS (collapsible) ────────────────── */}
      <div className="border-b border-[#242424]">
        <button
          className="w-full flex items-center h-10 px-3.5 gap-2 bg-transparent"
          onClick={() => toggle("categories")}
        >
          <Sliders size={16} color="#C2956A" />
          <span className="text-[10px] font-semibold tracking-[1.5px] uppercase text-muted flex-1 text-left">
            {t("budget.categoryWeights", "CATEGORY WEIGHTS")}
          </span>
          <ChevronDown
            size={14}
            className={`text-dimmer shrink-0 transition-transform duration-150 ${!collapsed.categories ? "rotate-0" : "-rotate-90"}`}
          />
        </button>

        {!collapsed.categories && (
          <div className="pt-0.5 pb-0.5">
            {BUDGET_CATEGORIES.map(({ key, icon: Icon }) => (
              <div key={key} className="px-4 py-2.5">
                <div className="flex flex-col gap-[9px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Icon size={14} color="#9E9E9E" />
                      <Link
                        to={`${langPrefix}/budget-categories`}
                        className="text-xs font-normal text-white no-underline"
                      >
                        {t(`budget.categories.${key}`)}
                      </Link>
                    </div>
                    <span className="font-mono text-[11px] text-accent-dim">
                      {bs.categoryWeights[key]}
                    </span>
                  </div>
                  <input
                    name={`${key}-budget-weight`}
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={bs.categoryWeights[key]}
                    onChange={(e) => bs.handleCategoryWeight(key, Number(e.target.value))}
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
      <div className="flex-shrink-0 sticky bottom-0 border-t border-border bg-[#131416]">
        <div className="flex flex-col gap-2 px-4 py-3">
          {!bs.isDefault && (
            <button
              onClick={() => {
                bs.handleShare();
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
              }}
              aria-live="polite"
              className={`w-full flex items-center justify-center gap-2 rounded transition-colors h-10 rounded-md text-[13px] font-medium border cursor-pointer ${copied ? "bg-[#2A4A2A] text-[#88CC88] border-[#4A8A4A]" : "bg-[#1A2A1A] text-[#6B9E6B] border-[#2A4A2A]"}`}
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
            className="w-full flex items-center justify-center gap-2 rounded transition-colors h-10 rounded-md text-[13px] font-medium bg-transparent text-accent-dim border border-border cursor-pointer"
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
        <aside className="hidden md:block sticky top-14 self-start overflow-y-auto w-[340px] h-[calc(100vh-56px)] bg-[#131416] border-r border-[#1E1E22] shrink-0">
          {sidebarContent}
        </aside>

        <MobileSheet
          open={mobileParamsOpen}
          title={t("budget.eyebrow", "BUDGET MATCHER")}
          closeLabel={t("a11y.closeParameters", "Close parameters")}
          onClose={() => setMobileParamsOpen(false)}
        >
          <div className="flex-1 overflow-y-auto">{sidebarContent}</div>
        </MobileSheet>

        {/* ── Mobile FAB ──────────────────────────────────── */}
        <button
          className="md:hidden fixed z-40 flex items-center gap-2 shadow-lg h-12 pl-4 pr-[18px] rounded-full bg-accent text-white text-sm font-semibold border-0 cursor-pointer right-4"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)" }}
          onClick={() => setMobileParamsOpen(true)}
          aria-label={t("a11y.openParameters", "Open parameters")}
        >
          <SlidersHorizontal size={18} />
          {t("mobileSheet.parameters", "Parameters")}
        </button>

        {/* ── Right content area ──────────────────────────── */}
        <main className="flex-1 min-w-0 pb-28 md:pb-0 bg-bg">
          <div className="px-4 md:px-6">
            {/* ── Hero section (matching list page) ─────────── */}
            <div
              className="relative -mx-4 mb-6 overflow-hidden md:mx-0 md:mb-6 md:rounded-lg"
              style={{
                background: "#0A0A0F",
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

              <div className="relative flex flex-col justify-end px-4 py-4 md:px-12 md:py-12 min-h-[160px]">
                {/* H1 — responsive font (list page style) */}
                <h1 className="text-3xl md:text-6xl font-semibold leading-[0.95] text-white mb-2 font-display">
                  {t("budget.eyebrow", "BUDGET MATCHER")}
                </h1>
                {/* Tagline */}
                <p className="hidden md:block text-[15px] text-dim max-w-[580px] mb-5">
                  {t(
                    "budget.subtitle",
                    "Enter your monthly budget and discover which countries offer the best lifestyle for your money",
                  )}
                </p>
                {/* Copper rule */}
                <div className="hidden md:block w-32 h-0.5 bg-accent mb-4" />
                {/* Stats row */}
                <div className="hero-stats-row hero-banner-stats">
                  <div className="min-w-0">
                    <div className="font-mono text-lg font-semibold text-accent-dim leading-none">
                      {matches.length || "—"}
                    </div>
                    <div className="text-[10px] text-dimmest uppercase tracking-[1px] mt-1">
                      {t("budget.stats.matchedCountries", {
                        count: matches.length,
                      })}
                    </div>
                  </div>
                  <div className="hero-stat-divider" />
                  <div className="min-w-0">
                    <div className="font-mono text-lg font-semibold text-accent-dim leading-none">
                      ${bs.budget.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-dimmest uppercase tracking-[1px] mt-1">
                      {t("budget.perMonth", "/ MONTH")}
                    </div>
                  </div>
                  <div className="hero-stat-divider" />
                  <Link to={`${langPrefix}/budget-categories`} className="min-w-0 no-underline">
                    <div>
                      <div className="font-mono text-lg font-semibold text-accent-dim leading-none">
                        {BUDGET_CATEGORIES.length}
                      </div>
                      <div className="text-[10px] text-dimmest uppercase tracking-[1px] mt-1">
                        {t("budget.stats.categories", {
                          count: BUDGET_CATEGORIES.length,
                        })}
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* ── Sentinel + sticky search bar ──────────────── */}
            <div ref={sentinelRef} className="h-0" />
            <div className="sticky top-14 z-20 -mx-4 px-4 md:-mx-6 md:px-6 py-3 bg-bg border-b border-surface">
              {/* Search + compare row */}
              <div className="mb-1 flex flex-col gap-2 sm:flex-row sm:items-center">
                {/* Search input */}
                <div className="relative flex-1 min-w-0">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-dim pointer-events-none"
                    size={16}
                  />
                  <input
                    ref={searchInputRef}
                    name="budget-country-search"
                    type="text"
                    placeholder={t("search.placeholder", "Search countries…")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 rounded-md focus:outline-none bg-[#161616] border border-surface text-white text-sm"
                  />
                  {search.length > 0 && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-[22px] h-[22px] rounded-[3px] border-0 cursor-pointer bg-surface-4 text-tertiary"
                      aria-label={t("a11y.clearSearch", "Clear search")}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Compare buttons */}
                {compareMode ? (
                  <div className="flex w-full items-center justify-end gap-2 shrink-0 sm:w-auto">
                    <button
                      onClick={handleCompare}
                      disabled={selectedCodes.size < 2}
                      className={`flex flex-1 items-center justify-center sm:flex-none gap-1.5 h-10 px-3.5 rounded-md text-[13px] font-semibold whitespace-nowrap transition-all cursor-${selectedCodes.size < 2 ? "default" : "pointer"} ${selectedCodes.size < 2 ? "bg-[#161616] text-accent-dim border border-accent-dim" : "bg-accent text-white border-0"}`}
                    >
                      <GitCompare size={15} />
                      {t("nomadVisasPage.compareSelected", "Compare")}
                      {selectedCodes.size > 0 && (
                        <span
                          className={`rounded-[10px] px-[7px] py-px text-xs ${selectedCodes.size < 2 ? "bg-[rgba(194,149,106,0.2)]" : "bg-[rgba(255,255,255,0.25)]"}`}
                        >
                          {selectedCodes.size}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={exitCompareMode}
                      className="flex items-center justify-center w-10 h-10 rounded-md border border-surface-4 cursor-pointer bg-[#161616] text-[#8A8A8A]"
                      aria-label={t("a11y.exitCompareMode", "Exit compare mode")}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setCompareMode(true)}
                    className="w-full flex items-center justify-center sm:w-auto gap-1.5 h-10 px-3.5 rounded-md border border-surface-4 cursor-pointer bg-[#161616] text-muted text-[13px] font-medium whitespace-nowrap shrink-0"
                  >
                    <GitCompare size={15} />
                    {t("nomadVisasPage.compareMode", "Compare")}
                  </button>
                )}
              </div>

              {/* Helper text — full width, below search+buttons row */}
              {compareMode && (
                <p className="mb-2 text-xs text-dim">
                  {t(
                    "compare.helperText",
                    "Choose countries using the checkboxes in the list, then click Compare to open the comparison view.",
                  )}
                </p>
              )}

              {/* Color legend — always visible below search */}
              <Link
                to={`${langPrefix}/budget-categories`}
                className="flex flex-wrap gap-x-4 gap-y-1 px-0.5 no-underline"
              >
                {BUDGET_CATEGORIES.map(({ key }) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full shrink-0 bg-[var(--c)]"
                      style={{ "--c": COST_COLORS[key] ?? "#555" } as React.CSSProperties}
                    />
                    <span className="text-[11px] text-dim">{t(`budget.categories.${key}`)}</span>
                  </div>
                ))}
              </Link>
            </div>

            {/* ── Results ───────────────────────────────────── */}
            {loading ? (
              <div className="flex flex-col gap-2 mt-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-14 animate-pulse bg-surface border-t border-border" />
                ))}
              </div>
            ) : matches.length === 0 ? (
              <p className="text-center py-20 text-sm text-dim">
                {t("budget.noResults", "No countries with cost data available")}
              </p>
            ) : (
              <div className="flex flex-col">
                <div className="flex items-center justify-between px-1 my-4 text-xs">
                  <span className="text-muted">
                    {t("countryList.clickHint", "Click on a country to view details")}
                  </span>
                  <span className="text-dim">
                    {t("countryList.count", { count: filteredMatches.length })}
                  </span>
                </div>
                {filteredMatches.length === 0 ? (
                  <p className="text-center py-20 text-sm text-dim">{t("countryList.noResults")}</p>
                ) : (
                  filteredMatches.map((m, i) => {
                    const isSelected = selectedCodes.has(m.country.code);
                    return (
                      <div
                        key={m.country.code}
                        onClick={compareMode ? () => toggleSelect(m.country.code) : undefined}
                        onKeyDown={
                          compareMode
                            ? (event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault();
                                  toggleSelect(m.country.code);
                                }
                              }
                            : undefined
                        }
                        role={compareMode ? "button" : undefined}
                        tabIndex={compareMode ? 0 : undefined}
                        className={compareMode ? "cursor-pointer" : ""}
                      >
                        <BudgetCountryCard
                          match={m}
                          budget={bs.budget}
                          rank={i + 1}
                          expanded={!compareMode && expandedCode === m.country.code}
                          onToggle={
                            compareMode
                              ? undefined
                              : () =>
                                  setExpandedCode((prev) =>
                                    prev === m.country.code ? null : m.country.code,
                                  )
                          }
                          compareMode={compareMode}
                          isSelected={isSelected}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
}

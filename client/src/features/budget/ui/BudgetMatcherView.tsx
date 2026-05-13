import { useRef, useState, type Dispatch, type SetStateAction } from "react";
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
import { useBudgetMatcher, type BudgetMatch } from "@features/budget/hooks";
import { useBudgetState, type BudgetCategoryWeights } from "@features/budget/hooks";
import { COST_COLORS } from "@features/budget/constants";
import { localizeCountry } from "@core/utils";

const SKELETON_KEYS = ["sk0", "sk1", "sk2", "sk3", "sk4", "sk5", "sk6", "sk7"] as const;

const BUDGET_CATEGORIES: Array<{
  readonly key: keyof BudgetCategoryWeights;
  readonly icon: typeof House;
}> = [
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
  readonly options: readonly T[];
  readonly value: T;
  readonly onChange: (v: T) => void;
  readonly labelFn: (v: T) => string;
}) {
  return (
    <div className="flex gap-1 rounded bg-surface-4 p-1">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={String(opt)}
            onClick={() => {
              onChange(opt);
            }}
            className={`flex-1 cursor-pointer rounded-[3px] border-0 px-0 py-[5px] text-center text-xs transition-all duration-150 ${active ? "bg-accent font-medium text-white" : "bg-transparent font-normal text-dim"}`}
          >
            {labelFn(opt)}
          </button>
        );
      })}
    </div>
  );
}

type BudgetState = ReturnType<typeof useBudgetState>;

interface BudgetSidebarProps {
  readonly bs: BudgetState;
  readonly langPrefix: string;
  readonly collapsed: Record<string, boolean>;
  readonly toggle: (key: string) => void;
  readonly budgetPct: number;
  readonly copied: boolean;
  readonly setCopied: Dispatch<SetStateAction<boolean>>;
}

function BudgetSidebar({
  bs,
  langPrefix,
  collapsed,
  toggle,
  budgetPct,
  copied,
  setCopied,
}: BudgetSidebarProps) {
  const { t } = useTranslation();
  return (
    <>
      {/* ── Budget slider (always visible) ────────────────── */}
      <div className="border-b border-[#242424] p-4">
        <div className="mb-3 flex items-end gap-2">
          <span className="font-mono text-[28px] leading-none font-bold text-on-surface">
            ${bs.budget.toLocaleString()}
          </span>
          <span className="pb-0.5 text-xs text-dimmer">{t("budget.perMonth", "/month")}</span>
        </div>

        <input
          name="budget-amount"
          type="range"
          min={300}
          max={10_000}
          step={50}
          value={bs.budget}
          onChange={(e) => {
            bs.setBudget(Number(e.target.value));
          }}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
          style={{
            background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${budgetPct}%, #333333 ${budgetPct}%, #333333 100%)`,
          }}
          aria-label={t("a11y.budgetSlider", "Budget slider")}
        />

        <div className="mt-1.5 flex justify-between">
          <span className="text-[10px] text-dimmer">$300</span>
          <span className="text-[10px] text-dimmer">$10,000</span>
        </div>
      </div>

      {/* ── QUALITY BLEND (top level) ─────────────────────── */}
      <div className="border-b border-[#242424] px-4 py-3">
        <div className="flex flex-col gap-[9px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-white">
                {t("budget.qualityBlend", "Quality blend")}
              </span>
              <Tooltip
                content={
                  <div className="max-w-[240px]">
                    <div className="mb-1.5 font-semibold text-white">
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
                  className="shrink-0 cursor-pointer opacity-[0.45]"
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
            onChange={(e) => {
              bs.setQualityBlend(Number(e.target.value));
            }}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
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
          className="flex h-10 w-full items-center gap-2 bg-transparent px-3.5"
          onClick={() => {
            toggle("lifestyle");
          }}
        >
          <UserRound size={16} color="#C2956A" />
          <span className="flex-1 text-left text-[10px] font-semibold tracking-[1.5px] text-muted uppercase" />
          <ChevronDown
            size={14}
            className={`shrink-0 text-dimmer transition-transform duration-150 ${collapsed.lifestyle ? "-rotate-90" : "rotate-0"}`}
          />
        </button>

        {collapsed.lifestyle ? null : (
          <div className="flex flex-col gap-3.5 px-4 py-3">
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
              <div className="inline-flex h-9 items-center gap-1 rounded-md">
                <button
                  onClick={() => {
                    bs.setPeopleCount(Math.max(1, bs.peopleCount - 1));
                  }}
                  disabled={bs.peopleCount <= 1}
                  className={`flex h-8 w-8 items-center justify-center rounded-md border-0 text-base font-bold cursor-${bs.peopleCount <= 1 ? "default" : "pointer"} transition-all duration-150 ${bs.peopleCount <= 1 ? "bg-surface-2 text-[#555]" : "bg-border text-on-surface"}`}
                >
                  −
                </button>
                <span className="min-w-6 text-center font-mono text-[15px] font-bold text-on-surface select-none">
                  {bs.peopleCount}
                </span>
                <button
                  onClick={() => {
                    bs.setPeopleCount(Math.min(20, bs.peopleCount + 1));
                  }}
                  disabled={bs.peopleCount >= 20}
                  className={`flex h-8 w-8 items-center justify-center rounded-md border-0 text-base font-bold cursor-${bs.peopleCount >= 20 ? "default" : "pointer"} transition-all duration-150 ${bs.peopleCount >= 20 ? "bg-surface-2 text-[#555]" : "bg-border text-on-surface"}`}
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
          className="flex h-10 w-full items-center gap-2 bg-transparent px-3.5"
          onClick={() => {
            toggle("categories");
          }}
        >
          <Sliders size={16} color="#C2956A" />
          <span className="flex-1 text-left text-[10px] font-semibold tracking-[1.5px] text-muted uppercase">
            {t("budget.categoryWeights", "CATEGORY WEIGHTS")}
          </span>
          <ChevronDown
            size={14}
            className={`shrink-0 text-dimmer transition-transform duration-150 ${collapsed.categories ? "-rotate-90" : "rotate-0"}`}
          />
        </button>

        {collapsed.categories ? null : (
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
                    onChange={(e) => {
                      bs.handleCategoryWeight(key, Number(e.target.value));
                    }}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
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
      <div className="sticky bottom-0 flex-shrink-0 border-t border-border bg-[#131416]">
        <div className="flex flex-col gap-2 px-4 py-3">
          {bs.isDefault ? null : (
            <button
              onClick={() => {
                bs.handleShare();
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                }, 3000);
              }}
              aria-live="polite"
              className={`flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded rounded-md border text-[13px] font-medium transition-colors ${copied ? "border-[#4A8A4A] bg-[#2A4A2A] text-[#88CC88]" : "border-[#2A4A2A] bg-[#1A2A1A] text-[#6B9E6B]"}`}
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
            className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded rounded-md border border-border bg-transparent text-[13px] font-medium text-accent-dim transition-colors"
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
}

interface BudgetRowItemProps {
  readonly match: BudgetMatch;
  readonly rank: number;
  readonly compareMode: boolean;
  readonly isSelected: boolean;
  readonly expandedCode: string | null;
  readonly toggleSelect: (code: string) => void;
  readonly setExpandedCode: Dispatch<SetStateAction<string | null>>;
  readonly budget: number;
}

function BudgetRowItem({
  match,
  rank,
  compareMode,
  isSelected,
  expandedCode,
  toggleSelect,
  setExpandedCode,
  budget,
}: BudgetRowItemProps) {
  return (
    <div
      key={match.country.code}
      onClick={
        compareMode
          ? () => {
              toggleSelect(match.country.code);
            }
          : undefined
      }
      onKeyDown={
        compareMode
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleSelect(match.country.code);
              }
            }
          : undefined
      }
      role={compareMode ? "button" : undefined}
      tabIndex={compareMode ? 0 : undefined}
      className={compareMode ? "cursor-pointer" : ""}
    >
      <BudgetCountryCard
        match={match}
        budget={budget}
        rank={rank}
        expanded={compareMode ? undefined : expandedCode === match.country.code}
        onToggle={
          compareMode
            ? undefined
            : () => {
                setExpandedCode((prev) =>
                  prev === match.country.code ? null : match.country.code,
                );
              }
        }
        compareMode={compareMode}
        isSelected={isSelected}
      />
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

  const toggleSelect = (code: string) => {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const exitCompareMode = () => {
    setCompareMode(false);
    setSelectedCodes(new Set());
  };

  const handleCompare = () => {
    if (selectedCodes.size < 2) return;
    void navigate(`${langPrefix}/compare?m=budget&c=${[...selectedCodes].join(",")}`);
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
  const filteredMatches =
    query !== ""
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
  const toggle = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  /* ── Sidebar content (shared between desktop & mobile) ── */
  const sidebarContent = (
    <BudgetSidebar
      bs={bs}
      langPrefix={langPrefix}
      collapsed={collapsed}
      toggle={toggle}
      budgetPct={budgetPct}
      copied={copied}
      setCopied={setCopied}
    />
  );

  return (
    <Layout>
      <div className="flex">
        {/* ── Left sidebar (hidden on mobile) ─────────────── */}
        <aside className="sticky top-14 hidden h-[calc(100vh-56px)] w-[340px] shrink-0 self-start overflow-y-auto border-r border-[#1E1E22] bg-[#131416] md:block">
          {sidebarContent}
        </aside>

        <MobileSheet
          open={mobileParamsOpen}
          title={t("budget.eyebrow", "BUDGET MATCHER")}
          closeLabel={t("a11y.closeParameters", "Close parameters")}
          onClose={() => {
            setMobileParamsOpen(false);
          }}
        >
          <div className="flex-1 overflow-y-auto">{sidebarContent}</div>
        </MobileSheet>

        {/* ── Mobile FAB ──────────────────────────────────── */}
        <button
          className="fixed right-4 z-40 flex h-12 cursor-pointer items-center gap-2 rounded-full border-0 bg-accent pr-[18px] pl-4 text-sm font-semibold text-white shadow-lg md:hidden"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)" }}
          onClick={() => {
            setMobileParamsOpen(true);
          }}
          aria-label={t("a11y.openParameters", "Open parameters")}
        >
          <SlidersHorizontal size={18} />
          {t("mobileSheet.parameters", "Parameters")}
        </button>

        {/* ── Right content area ──────────────────────────── */}
        <main className="min-w-0 flex-1 bg-bg pb-28 md:pb-0">
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

              <div className="relative flex min-h-[160px] flex-col justify-end px-4 py-4 md:px-12 md:py-12">
                {/* H1 — responsive font (list page style) */}
                <h1 className="mb-2 font-display text-3xl leading-[0.95] font-semibold text-white md:text-6xl">
                  {t("budget.eyebrow", "BUDGET MATCHER")}
                </h1>
                {/* Tagline */}
                <p className="mb-5 hidden max-w-[580px] text-[15px] text-dim md:block">
                  {t(
                    "budget.subtitle",
                    "Enter your monthly budget and discover which countries offer the best lifestyle for your money",
                  )}
                </p>
                {/* Copper rule */}
                <div className="mb-4 hidden h-0.5 w-32 bg-accent md:block" />
                {/* Stats row */}
                <div className="hero-stats-row hero-banner-stats">
                  <div className="min-w-0">
                    <div className="font-mono text-lg leading-none font-semibold text-accent-dim">
                      {matches.length > 0 ? matches.length : "—"}
                    </div>
                    <div className="mt-1 text-[10px] tracking-[1px] text-dimmest uppercase">
                      {t("budget.stats.matchedCountries", {
                        count: matches.length,
                      })}
                    </div>
                  </div>
                  <div className="hero-stat-divider" />
                  <div className="min-w-0">
                    <div className="font-mono text-lg leading-none font-semibold text-accent-dim">
                      ${bs.budget.toLocaleString()}
                    </div>
                    <div className="mt-1 text-[10px] tracking-[1px] text-dimmest uppercase">
                      {t("budget.perMonth", "/ MONTH")}
                    </div>
                  </div>
                  <div className="hero-stat-divider" />
                  <Link to={`${langPrefix}/budget-categories`} className="min-w-0 no-underline">
                    <div>
                      <div className="font-mono text-lg leading-none font-semibold text-accent-dim">
                        {BUDGET_CATEGORIES.length}
                      </div>
                      <div className="mt-1 text-[10px] tracking-[1px] text-dimmest uppercase">
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
            <div className="sticky top-14 z-20 -mx-4 border-b border-surface bg-bg px-4 py-3 md:-mx-6 md:px-6">
              {/* Search + compare row */}
              <div className="mb-1 flex flex-col gap-2 sm:flex-row sm:items-center">
                {/* Search input */}
                <div className="relative min-w-0 flex-1">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-dim"
                    size={16}
                  />
                  <input
                    ref={searchInputRef}
                    name="budget-country-search"
                    type="text"
                    placeholder={t("search.placeholder", "Search countries…")}
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                    }}
                    className="w-full rounded-md border border-surface bg-[#161616] py-2.5 pr-9 pl-9 text-sm text-white focus:outline-none"
                  />
                  {search.length > 0 ? (
                    <button
                      onClick={() => {
                        setSearch("");
                      }}
                      className="absolute top-1/2 right-3 flex h-[22px] w-[22px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-[3px] border-0 bg-surface-4 text-tertiary"
                      aria-label={t("a11y.clearSearch", "Clear search")}
                    >
                      <X size={13} />
                    </button>
                  ) : null}
                </div>

                {/* Compare buttons */}
                {compareMode ? (
                  <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto">
                    <button
                      onClick={handleCompare}
                      disabled={selectedCodes.size < 2}
                      className={`flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md px-3.5 text-[13px] font-semibold whitespace-nowrap transition-all sm:flex-none cursor-${selectedCodes.size < 2 ? "default" : "pointer"} ${selectedCodes.size < 2 ? "border border-accent-dim bg-[#161616] text-accent-dim" : "border-0 bg-accent text-white"}`}
                    >
                      <GitCompare size={15} />
                      {t("nomadVisasPage.compareSelected", "Compare")}
                      {selectedCodes.size > 0 ? (
                        <span
                          className={`rounded-[10px] px-[7px] py-px text-xs ${selectedCodes.size < 2 ? "bg-[rgba(194,149,106,0.2)]" : "bg-[rgba(255,255,255,0.25)]"}`}
                        >
                          {selectedCodes.size}
                        </span>
                      ) : null}
                    </button>
                    <button
                      onClick={exitCompareMode}
                      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-surface-4 bg-[#161616] text-[#8A8A8A]"
                      aria-label={t("a11y.exitCompareMode", "Exit compare mode")}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setCompareMode(true);
                    }}
                    className="flex h-10 w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-surface-4 bg-[#161616] px-3.5 text-[13px] font-medium whitespace-nowrap text-muted sm:w-auto"
                  >
                    <GitCompare size={15} />
                    {t("nomadVisasPage.compareMode", "Compare")}
                  </button>
                )}
              </div>

              {/* Helper text — full width, below search+buttons row */}
              {compareMode ? (
                <p className="mb-2 text-xs text-dim">
                  {t(
                    "compare.helperText",
                    "Choose countries using the checkboxes in the list, then click Compare to open the comparison view.",
                  )}
                </p>
              ) : null}

              {/* Color legend — always visible below search */}
              <Link
                to={`${langPrefix}/budget-categories`}
                className="flex flex-wrap gap-x-4 gap-y-1 px-0.5 no-underline"
              >
                {BUDGET_CATEGORIES.map(({ key }) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div
                      className="h-2 w-2 shrink-0 rounded-full bg-[var(--c)]"
                      style={{ "--c": COST_COLORS[key] } as React.CSSProperties}
                    />
                    <span className="text-[11px] text-dim">{t(`budget.categories.${key}`)}</span>
                  </div>
                ))}
              </Link>
            </div>

            {/* ── Results ───────────────────────────────────── */}
            {loading ? (
              <div className="mt-4 flex flex-col gap-2">
                {SKELETON_KEYS.map((sk) => (
                  <div key={sk} className="h-14 animate-pulse border-t border-border bg-surface" />
                ))}
              </div>
            ) : matches.length === 0 ? (
              <p className="py-20 text-center text-sm text-dim">
                {t("budget.noResults", "No countries with cost data available")}
              </p>
            ) : (
              <div className="flex flex-col">
                <div className="my-4 flex items-center justify-between px-1 text-xs">
                  <span className="text-muted">
                    {t("countryList.clickHint", "Click on a country to view details")}
                  </span>
                  <span className="text-dim">
                    {t("countryList.count", { count: filteredMatches.length })}
                  </span>
                </div>
                {filteredMatches.length === 0 ? (
                  <p className="py-20 text-center text-sm text-dim">{t("countryList.noResults")}</p>
                ) : (
                  filteredMatches.map((m, i) => (
                    <BudgetRowItem
                      key={m.country.code}
                      match={m}
                      rank={i + 1}
                      compareMode={compareMode}
                      isSelected={selectedCodes.has(m.country.code)}
                      expandedCode={expandedCode}
                      toggleSelect={toggleSelect}
                      setExpandedCode={setExpandedCode}
                      budget={bs.budget}
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

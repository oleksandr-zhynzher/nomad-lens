import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import { SlidersHorizontal, X, Search, GitCompare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@core/ui/layout";
import { MobileSheet } from "@core/ui";
import { useLangPrefix } from "@core/hooks";
import { BudgetCountryCard } from "@features/budget/ui";
import { useCountries } from "@core/hooks";
import { useBudgetMatcher, type BudgetMatch } from "@features/budget/hooks";
import { useBudgetState } from "@features/budget/hooks";
import { SKELETON_KEYS, BUDGET_CATEGORIES, COST_COLORS } from "@features/budget/constants";
import { localizeCountry } from "@core/utils";
import { BudgetSidebar } from "./BudgetSidebar";

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

import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@core/ui/layout";
import { ResponsiveSidePanelLayout } from "@core/ui/layout";
import { SearchInput, CompareModeActions, EmptyState, LoadingRows } from "@core/ui";
import { useLangPrefix } from "@core/hooks";
import { BudgetCountryCard } from "@features/budget/ui";
import { useCountries } from "@core/hooks";
import { useBudgetMatcher, type BudgetMatch } from "@features/budget/hooks";
import { useBudgetState } from "@features/budget/hooks";
import { BUDGET_CATEGORIES, COST_COLORS } from "@features/budget/constants";
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

function toggleCodeInSet(prev: Set<string>, code: string): Set<string> {
  const next = new Set(prev);
  if (next.has(code)) next.delete(code);
  else next.add(code);
  return next;
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
    setSelectedCodes((prev) => toggleCodeInSet(prev, code));
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

  let resultsContent: React.ReactNode;
  if (loading) {
    resultsContent = (
      <div className="mt-4">
        <LoadingRows count={8} />
      </div>
    );
  } else if (matches.length === 0) {
    resultsContent = (
      <EmptyState message={t("budget.noResults", "No countries with cost data available")} />
    );
  } else {
    resultsContent = (
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
    );
  }

  return (
    <Layout>
      <ResponsiveSidePanelLayout
        sidebar={sidebarContent}
        mobileSheet={{
          open: mobileParamsOpen,
          title: t("budget.eyebrow", "BUDGET MATCHER"),
          closeLabel: t("a11y.closeParameters", "Close parameters"),
          onClose: () => {
            setMobileParamsOpen(false);
          },
          children: sidebarContent,
        }}
        mobileFab={{
          label: t("mobileSheet.parameters", "Parameters"),
          ariaLabel: t("a11y.openParameters", "Open parameters"),
          icon: <SlidersHorizontal size={18} aria-hidden />,
          onClick: () => {
            setMobileParamsOpen(true);
          },
        }}
      >
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
                background: "linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.85) 100%)",
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
              <SearchInput
                name="budget-country-search"
                value={search}
                onValueChange={setSearch}
                placeholder={t("search.placeholder", "Search countries…")}
                clearLabel={t("a11y.clearSearch", "Clear search")}
                inputRef={searchInputRef}
              />

              {/* Compare buttons */}
              <CompareModeActions
                active={compareMode}
                selectedCount={selectedCodes.size}
                enterLabel={t("compare.compareMode", "Compare")}
                compareLabel={t("nomadVisasPage.compareSelected", "Compare")}
                exitLabel={t("a11y.exitCompareMode", "Exit compare mode")}
                helperText={
                  compareMode
                    ? t(
                        "compare.helperText",
                        "Choose countries using the checkboxes in the list, then click Compare to open the comparison view.",
                      )
                    : undefined
                }
                onEnter={() => {
                  setCompareMode(true);
                }}
                onExit={exitCompareMode}
                onCompare={handleCompare}
              />
            </div>

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
          {resultsContent}
        </div>
      </ResponsiveSidePanelLayout>
    </Layout>
  );
}

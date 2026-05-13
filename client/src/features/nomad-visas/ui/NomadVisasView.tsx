import { useMemo, useState, useRef, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ChevronsUpDown,
  GitCompare,
  X,
} from "lucide-react";
import { Layout } from "@core/ui/layout";
import { PageHeroBanner } from "@core/ui/page-hero";
import { useBudgetMatcher } from "@features/budget/hooks";
import { useBudgetState } from "@features/budget/hooks";
import { useCountries } from "@core/hooks";
import { useLangPrefix } from "@core/hooks";
import { useWeightState } from "@features/country-ranking/hooks";
import { localizeCountry } from "@core/utils";
import { computeClimateScore, computeScore } from "@features/country-ranking/utils";
import { scoreColourClass } from "@core/utils";
import type { ClimatePreferences, CountryData, WeightMap } from "@core/models";

const TAX_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  exempt: { bg: "#1A4A2A", text: "#44CC66" },
  standard: { bg: "#2A2A3A", text: "#8888CC" },
  special: { bg: "#4A3A1A", text: "#DDAA44" },
};

type SortField =
  | "country"
  | "overallScore"
  | "monthlyBudget"
  | "duration"
  | "cost"
  | "income"
  | "tax";
type SortDirection = "asc" | "desc";

function applyClimate(country: CountryData, climatePrefs: ClimatePreferences): CountryData {
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

function computeOverallScore(country: CountryData, weights: WeightMap) {
  return computeScore(country, weights);
}

function SortIcon({
  field,
  sortField,
  sortDirection,
}: {
  field: SortField;
  sortField: SortField;
  sortDirection: SortDirection;
}) {
  if (sortField !== field) {
    return <ChevronsUpDown size={14} className="ml-1 inline opacity-30" />;
  }
  return sortDirection === "asc" ? (
    <ChevronUp size={14} className="ml-1 inline" />
  ) : (
    <ChevronDown size={14} className="ml-1 inline" />
  );
}

export function NomadVisasPage() {
  const { t, i18n } = useTranslation();
  const { countries, loading } = useCountries();
  const langPrefix = useLangPrefix();
  const navigate = useNavigate();
  const ws = useWeightState();
  const bs = useBudgetState();
  const budgetMatches = useBudgetMatcher(
    countries,
    bs.budget,
    bs.housing,
    bs.bedrooms,
    bs.peopleCount,
    bs.categoryWeights,
    bs.qualityBlend,
  );
  const lang = i18n.language;
  const [searchParams] = useSearchParams();
  const highlightCode = searchParams.get("country")?.toUpperCase() ?? null;

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("country");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const budgetMatchByCode = useMemo(
    () => new Map(budgetMatches.map((match) => [match.country.code, match])),
    [budgetMatches],
  );

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
    void navigate(`${langPrefix}/compare?m=nomadVisas&c=${[...selectedCodes].join(",")}`);
  };

  // Sticky search bar — measure its height so thead sticks just below it
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [theadTop, setTheadTop] = useState(136); // 56 nav + ~80 search bar

  useEffect(() => {
    const el = searchBarRef.current;
    if (!el) return;
    const update = () => {
      setTheadTop(56 + el.offsetHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, []);

  // Two-table sticky header: sync horizontal scroll from body to header
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);

  const syncHeaderScroll = () => {
    if (headerScrollRef.current && bodyScrollRef.current) {
      headerScrollRef.current.scrollLeft = bodyScrollRef.current.scrollLeft;
    }
  };

  // All countries with nomad visas (for stats)
  const allVisaCountries = useMemo(
    () =>
      countries.filter(
        (
          c,
        ): c is CountryData & {
          nomadVisa: NonNullable<CountryData["nomadVisa"]>;
        } => !!c.nomadVisa,
      ),
    [countries],
  );

  // Filtered countries (for table display)
  const visaCountries = useMemo(() => {
    const trimmedQuery = searchQuery.trim();
    return allVisaCountries.filter(
      (c) =>
        trimmedQuery === "" ||
        localizeCountry(c, lang).name.toLowerCase().includes(trimmedQuery.toLowerCase()),
    );
  }, [allVisaCountries, searchQuery, lang]);

  const sortedCountries = useMemo(() => {
    const sorted = visaCountries.map((country) => {
      const climateAdjustedCountry = applyClimate(country, ws.climatePrefs);
      return {
        country,
        overallScore: computeOverallScore(climateAdjustedCountry, ws.weights),
        monthlyBudget: budgetMatchByCode.get(country.code)?.monthlyCost ?? null,
      };
    });

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "country":
          comparison = localizeCountry(a.country, lang).name.localeCompare(
            localizeCountry(b.country, lang).name,
          );
          break;
        case "overallScore":
          comparison = a.overallScore - b.overallScore;
          break;
        case "monthlyBudget":
          comparison =
            a.monthlyBudget == null && b.monthlyBudget == null
              ? 0
              : a.monthlyBudget == null
                ? 1
                : b.monthlyBudget == null
                  ? -1
                  : a.monthlyBudget - b.monthlyBudget;
          break;
        case "duration":
          comparison = a.country.nomadVisa.duration.initial - b.country.nomadVisa.duration.initial;
          break;
        case "cost":
          comparison = a.country.nomadVisa.cost.amount - b.country.nomadVisa.cost.amount;
          break;
        case "income": {
          const aIncome =
            a.country.nomadVisa.incomeRequirement.monthly ??
            a.country.nomadVisa.incomeRequirement.annual ??
            0;
          const bIncome =
            b.country.nomadVisa.incomeRequirement.monthly ??
            b.country.nomadVisa.incomeRequirement.annual ??
            0;
          comparison = aIncome - bIncome;
          break;
        }
        case "tax":
          comparison = a.country.nomadVisa.tax.status.localeCompare(b.country.nomadVisa.tax.status);
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [
    budgetMatchByCode,
    lang,
    sortField,
    sortDirection,
    visaCountries,
    ws.climatePrefs,
    ws.weights,
  ]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const tableMinWidth = compareMode ? "1170px" : "1122px";

  return (
    <Layout>
      <PageHeroBanner
        backgroundImage="/hero-map.png"
        eyebrow={t("nomadVisasPage.eyebrow", "TRAVEL & WORK")}
        title={t("nav.nomadVisas")}
        subtitle={t(
          "nomadVisasPage.subtitle",
          "Compare digital nomad visa programs across {{count}} countries",
          { count: allVisaCountries.length },
        )}
      >
        {!loading && allVisaCountries.length > 0 ? (
          <div className="hero-stats-row hero-banner-stats">
            <div className="min-w-0">
              <div className="font-mono text-lg leading-none font-semibold text-accent-dim">
                {allVisaCountries.length}
              </div>
              <div className="mt-1 text-[10px] tracking-[1px] text-dimmest uppercase">
                {t("nomadVisasPage.stats.countries", {
                  count: allVisaCountries.length,
                })}
              </div>
            </div>
            <div className="hero-stat-divider" />
            <div className="min-w-0">
              <div className="font-mono text-lg leading-none font-semibold text-accent-dim">
                {allVisaCountries.filter((c) => c.nomadVisa.tax.status === "exempt").length}
              </div>
              <div className="mt-1 text-[10px] tracking-[1px] text-dimmest uppercase">
                {t("nomadVisasPage.stats.taxExempt", {
                  count: allVisaCountries.filter((c) => c.nomadVisa.tax.status === "exempt").length,
                })}
              </div>
            </div>
            <div className="hero-stat-divider" />
            <div className="min-w-0">
              <div className="font-mono text-lg leading-none font-semibold text-accent-dim">
                {allVisaCountries.filter((c) => c.nomadVisa.cost.amount === 0).length}
              </div>
              <div className="mt-1 text-[10px] tracking-[1px] text-dimmest uppercase">
                {t("nomadVisasPage.stats.freeVisas", {
                  count: allVisaCountries.filter((c) => c.nomadVisa.cost.amount === 0).length,
                })}
              </div>
            </div>
          </div>
        ) : null}
      </PageHeroBanner>

      {/* Sentinel for sticky detection (not needed for logic here, reserved) */}
      <div className="h-0" />

      {/* Sticky search + compare bar */}
      <div ref={searchBarRef} className="sticky top-14 z-20 bg-bg py-3">
        <div className="mx-auto max-w-[1200px] px-4">
          {/* Row 1: search + compare buttons */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* Search input */}
            <div className="relative min-w-0 flex-1">
              <Search
                size={16}
                color="#808080"
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
              />
              <input
                name="visa-country-search"
                type="text"
                placeholder={t("nomadVisasPage.search", "Search countries...")}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                className={`h-10 w-full rounded-md border border-surface bg-[#161616] pl-9 text-sm text-white outline-none ${searchQuery ? "pr-9" : "pr-3"}`}
              />
              {searchQuery ? (
                <button
                  onClick={() => {
                    setSearchQuery("");
                  }}
                  className="absolute top-1/2 right-2.5 flex h-[22px] w-[22px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-[3px] border-0 bg-surface-4 text-tertiary"
                  aria-label={t("a11y.clearSearch", "Clear search")}
                >
                  <X size={12} />
                </button>
              ) : null}
            </div>

            {/* Compare mode buttons */}
            {compareMode ? (
              <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto">
                {/* Compare CTA */}
                <button
                  onClick={handleCompare}
                  disabled={selectedCodes.size < 2}
                  className={`flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md px-3.5 text-[13px] font-semibold whitespace-nowrap transition-all sm:flex-none cursor-${selectedCodes.size < 2 ? "default" : "pointer"} ${selectedCodes.size < 2 ? "border border-accent-dim bg-transparent text-accent-dim" : "border-0 bg-accent text-white"}`}
                >
                  <GitCompare size={15} />
                  {t("nomadVisasPage.compareSelected", "Compare")}
                  {selectedCodes.size > 0 ? (
                    <span
                      className={`rounded-[10px] px-[7px] py-px text-xs ${selectedCodes.size < 2 ? "bg-[rgba(143,90,60,0.2)]" : "bg-[rgba(255,255,255,0.25)]"}`}
                    >
                      {selectedCodes.size}
                    </span>
                  ) : null}
                </button>
                {/* Exit compare mode */}
                <button
                  onClick={exitCompareMode}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-surface-4 bg-transparent text-dim"
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
                className="flex h-10 w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-surface-4 bg-transparent px-3.5 text-[13px] font-medium whitespace-nowrap text-muted sm:w-auto"
              >
                <GitCompare size={15} />
                {t("nomadVisasPage.compareMode", "Compare")}
              </button>
            )}
          </div>

          {/* Row 2: helper text below the entire search+buttons row */}
          {compareMode ? (
            <p className="mt-1.5 text-xs text-dim">
              {t(
                "compare.helperText",
                "Choose countries using the checkboxes in the list, then click Compare to open the comparison view.",
              )}
            </p>
          ) : null}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-16 text-center text-dim">{t("loading", "Loading…")}</div>
      ) : sortedCountries.length === 0 ? (
        <div className="px-4 py-16 text-center text-dim">
          {t("nomadVisasPage.noResults", "No countries found")}
        </div>
      ) : (
        <div className="mx-auto box-content w-full max-w-[1200px] px-4 pb-12">
          {/* Shared colgroup definition */}
          {(() => {
            const colgroup = (
              <colgroup>
                {compareMode ? <col className="w-12" /> : null}
                <col className="w-[200px]" />
                <col className="w-[160px]" />
                <col className="w-[110px]" />
                <col className="w-[130px]" />
                <col className="w-[90px]" />
                <col className="w-[110px]" />
                <col className="w-[150px]" />
                <col className="w-[130px]" />
                <col className="w-[52px]" />
              </colgroup>
            );

            return (
              <>
                {/* Sticky header table — hidden scrollbar, synced via JS */}
                <div
                  ref={headerScrollRef}
                  className="no-scrollbar sticky top-[var(--thead-top)] z-10 overflow-x-scroll bg-bg"
                  style={{ "--thead-top": `${theadTop}px` } as React.CSSProperties}
                >
                  <table
                    className="w-full min-w-[var(--tmin-w)] table-fixed border-separate border-spacing-0"
                    style={{ "--tmin-w": tableMinWidth } as React.CSSProperties}
                  >
                    {colgroup}
                    <thead>
                      <tr className="border-b-2 border-border">
                        {compareMode ? <th className="bg-bg px-3 py-4" /> : null}
                        <th
                          onClick={() => {
                            handleSort("country");
                          }}
                          className="cursor-pointer bg-bg px-3 py-4 text-left text-[11px] font-semibold tracking-[1px] whitespace-nowrap text-muted uppercase select-none"
                        >
                          {t("nomadVisasPage.table.country", "Country")}{" "}
                          <SortIcon
                            field="country"
                            sortField={sortField}
                            sortDirection={sortDirection}
                          />
                        </th>
                        <th className="bg-bg px-3 py-4 text-left text-[11px] font-semibold tracking-[1px] whitespace-nowrap text-muted uppercase">
                          {t("nomadVisasPage.table.visaName", "Visa Name")}
                        </th>
                        <th
                          onClick={() => {
                            handleSort("overallScore");
                          }}
                          className="cursor-pointer bg-bg px-3 py-4 text-right text-[11px] font-semibold tracking-[1px] whitespace-nowrap text-muted uppercase select-none"
                        >
                          {t("nomadVisasPage.table.overallScore", "Overall Score")}{" "}
                          <SortIcon
                            field="overallScore"
                            sortField={sortField}
                            sortDirection={sortDirection}
                          />
                        </th>
                        <th
                          onClick={() => {
                            handleSort("monthlyBudget");
                          }}
                          className="cursor-pointer bg-bg px-3 py-4 text-right text-[11px] font-semibold tracking-[1px] whitespace-nowrap text-muted uppercase select-none"
                        >
                          {t("nomadVisasPage.table.monthlyBudget", "Monthly Budget")}{" "}
                          <SortIcon
                            field="monthlyBudget"
                            sortField={sortField}
                            sortDirection={sortDirection}
                          />
                        </th>
                        <th
                          onClick={() => {
                            handleSort("duration");
                          }}
                          className="cursor-pointer bg-bg px-3 py-4 text-left text-[11px] font-semibold tracking-[1px] whitespace-nowrap text-muted uppercase select-none"
                        >
                          {t("nomadVisasPage.table.duration", "Duration")}{" "}
                          <SortIcon
                            field="duration"
                            sortField={sortField}
                            sortDirection={sortDirection}
                          />
                        </th>
                        <th
                          onClick={() => {
                            handleSort("cost");
                          }}
                          className="cursor-pointer bg-bg px-3 py-4 text-right text-[11px] font-semibold tracking-[1px] whitespace-nowrap text-muted uppercase select-none"
                        >
                          {t("nomadVisasPage.table.cost", "Cost")}{" "}
                          <SortIcon
                            field="cost"
                            sortField={sortField}
                            sortDirection={sortDirection}
                          />
                        </th>
                        <th
                          onClick={() => {
                            handleSort("income");
                          }}
                          className="cursor-pointer bg-bg px-3 py-4 text-right text-[11px] font-semibold tracking-[1px] whitespace-nowrap text-muted uppercase select-none"
                        >
                          {t("nomadVisasPage.table.income", "Income Req.")}{" "}
                          <SortIcon
                            field="income"
                            sortField={sortField}
                            sortDirection={sortDirection}
                          />
                        </th>
                        <th
                          onClick={() => {
                            handleSort("tax");
                          }}
                          className="cursor-pointer bg-bg px-3 py-4 text-center text-[11px] font-semibold tracking-[1px] whitespace-nowrap text-muted uppercase select-none"
                        >
                          {t("nomadVisasPage.table.tax", "Tax Status")}{" "}
                          <SortIcon
                            field="tax"
                            sortField={sortField}
                            sortDirection={sortDirection}
                          />
                        </th>
                        <th className="bg-bg px-3 py-4" />
                      </tr>
                    </thead>
                  </table>
                </div>

                {/* Scrollable body table */}
                <div ref={bodyScrollRef} className="overflow-x-auto" onScroll={syncHeaderScroll}>
                  <table
                    className="w-full min-w-[var(--tmin-w)] table-fixed border-separate border-spacing-0"
                    style={{ "--tmin-w": tableMinWidth } as React.CSSProperties}
                  >
                    {colgroup}
                    <tbody>
                      {sortedCountries.map(({ country, overallScore, monthlyBudget }) => {
                        const visa = country.nomadVisa;
                        const taxColors =
                          TAX_STATUS_COLORS[visa.tax.status] ?? TAX_STATUS_COLORS.standard;
                        const isHighlighted = highlightCode === country.code;
                        const isSelected = selectedCodes.has(country.code);

                        return (
                          <tr
                            key={country.code}
                            data-country-code={country.code.toLowerCase()}
                            className={`cursor-pointer border-b border-[#1E1E1E] transition-colors ${isSelected ? "bg-[#1A2A1A]" : isHighlighted ? "bg-[#1A1208]" : "bg-transparent"}`}
                            onClick={() => {
                              if (compareMode) {
                                toggleSelect(country.code);
                              } else {
                                void navigate(
                                  `${langPrefix}/country/${country.code.toLowerCase()}`,
                                );
                              }
                            }}
                            onMouseEnter={(e) => {
                              if (!isHighlighted && !isSelected) {
                                e.currentTarget.style.backgroundColor = "#232326";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isHighlighted && !isSelected) {
                                e.currentTarget.style.backgroundColor = "transparent";
                              }
                            }}
                          >
                            {/* Checkbox — compare mode only */}
                            {compareMode ? (
                              <td
                                className="py-4 pr-1 pl-3"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSelect(country.code);
                                }}
                              >
                                <div
                                  aria-label={`Select ${localizeCountry(country, lang).name}`}
                                  className={`pointer-events-none flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] transition-all ${isSelected ? "border-2 border-accent bg-accent" : "border-2 border-[#404040] bg-transparent"}`}
                                >
                                  {isSelected ? (
                                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                                      <path
                                        d="M1 3.5L3.5 6L8 1"
                                        stroke="white"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  ) : null}
                                </div>
                              </td>
                            ) : null}

                            {/* Country */}
                            <td className="px-3 py-4">
                              <Link
                                to={`${langPrefix}/country/${country.code.toLowerCase()}`}
                                className="flex items-center gap-2.5 no-underline"
                                onClick={(e) => {
                                  if (compareMode) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleSelect(country.code);
                                  }
                                }}
                              >
                                <img
                                  src={country.flagUrl}
                                  alt={t("a11y.flagAlt", "{{country}} flag", {
                                    country: localizeCountry(country, lang).name,
                                  })}
                                  className="h-[19px] w-7 shrink-0 rounded-[3px] object-cover"
                                  loading="lazy"
                                />
                                <span className="text-sm font-medium text-white">
                                  {localizeCountry(country, lang).name}
                                </span>
                              </Link>
                            </td>

                            {/* Visa Name */}
                            <td className="px-3 py-4">
                              <span className="text-[13px] text-tertiary">{visa.visaName}</span>
                            </td>

                            {/* Overall score */}
                            <td className="px-3 py-4 text-right">
                              <span
                                className={`font-mono text-sm font-semibold ${scoreColourClass(overallScore, "text")}`}
                              >
                                {overallScore.toFixed(1)}
                              </span>
                            </td>

                            {/* Monthly budget */}
                            <td className="px-3 py-4 text-right">
                              <span
                                className={`font-mono text-sm font-semibold ${monthlyBudget != null && monthlyBudget <= bs.budget ? "text-[#44CC66]" : monthlyBudget == null ? "text-dimmest" : "text-white"}`}
                              >
                                {monthlyBudget == null ? "—" : `$${monthlyBudget.toLocaleString()}`}
                              </span>
                            </td>

                            {/* Duration */}
                            <td className="px-3 py-4">
                              <span className="font-mono text-sm font-semibold text-white">
                                {visa.duration.initial}
                              </span>
                              <span className="ml-[3px] text-xs text-dim">
                                {t("countryPage.visa.mo")}
                              </span>
                              {visa.duration.maxExtension > 0 ? (
                                <span className="ml-1 text-[11px] text-dimmer">
                                  +{visa.duration.maxExtension}
                                </span>
                              ) : null}
                            </td>

                            {/* Cost */}
                            <td className="px-3 py-4 text-right">
                              <span
                                className={`font-mono text-sm font-semibold ${visa.cost.amount === 0 ? "text-[#44CC66]" : "text-white"}`}
                              >
                                {visa.cost.amount === 0
                                  ? t("countryPage.visa.free", "Free")
                                  : `${visa.cost.currency} ${visa.cost.amount.toLocaleString()}`}
                              </span>
                            </td>

                            {/* Income */}
                            <td className="px-3 py-4 text-right">
                              {visa.incomeRequirement.monthly ? (
                                <>
                                  <span className="font-mono text-sm font-semibold text-white">
                                    {visa.incomeRequirement.currency}{" "}
                                    {visa.incomeRequirement.monthly.toLocaleString()}
                                  </span>
                                  <span className="ml-0.5 text-xs text-dim">
                                    /{t("countryPage.visa.mo")}
                                  </span>
                                </>
                              ) : visa.incomeRequirement.annual ? (
                                <>
                                  <span className="font-mono text-[13px] font-semibold text-white">
                                    {visa.incomeRequirement.currency}{" "}
                                    {visa.incomeRequirement.annual.toLocaleString()}
                                  </span>
                                  <span className="ml-0.5 text-xs text-dim">
                                    /{t("countryPage.visa.yr")}
                                  </span>
                                </>
                              ) : (
                                <span className="font-mono text-[13px] font-semibold text-[#44CC66]">
                                  {t("countryPage.visa.noMinimum", "None")}
                                </span>
                              )}
                            </td>

                            {/* Tax */}
                            <td className="px-3 py-4 text-center">
                              <span
                                className="inline-flex items-center rounded-full bg-[var(--tax-bg)] px-2 py-1 font-mono text-[11px] font-semibold whitespace-nowrap text-[var(--tax-text)]"
                                style={
                                  {
                                    "--tax-bg": taxColors.bg,
                                    "--tax-text": taxColors.text,
                                  } as React.CSSProperties
                                }
                              >
                                {visa.tax.status === "exempt"
                                  ? t("countryPage.taxExemptLabel")
                                  : visa.tax.status === "special"
                                    ? t("countryPage.specialTaxLabel")
                                    : t("countryPage.standardTaxLabel")}
                              </span>
                            </td>

                            {/* Link */}
                            <td className="px-3 py-4 text-center">
                              <a
                                href={visa.officialUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                className="inline-flex text-accent"
                              >
                                <ExternalLink size={16} />
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </Layout>
  );
}

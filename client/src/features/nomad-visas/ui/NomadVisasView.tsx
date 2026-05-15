import { useMemo, useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, GitCompare, X } from "lucide-react";
import { Layout } from "@core/ui/layout";
import { PageHeroBanner } from "@core/ui/page-hero";
import { LoadingRows } from "@core/ui/states";
import { EmptyState } from "@core/ui/states";
import { useBudgetMatcher } from "@features/budget/hooks";
import { useBudgetState } from "@features/budget/hooks";
import { useCountries } from "@core/hooks";
import { useLangPrefix } from "@core/hooks";
import { useWeightState } from "@features/country-ranking/hooks";
import { localizeCountry } from "@core/utils";
import type { CountryData } from "@core/models";
import type { SortField, SortDirection } from "./nomad-visas.types";
import { applyClimate, computeOverallScore, compareVisaRows } from "./nomad-visas.utils";
import { NomadVisaHeroStats } from "./NomadVisaHeroStats";
import { NomadVisaTableHeader } from "./NomadVisaTableHeader";
import { NomadVisaTableRow } from "./NomadVisaTableRow";

function toggleCodeInSet(prev: Set<string>, code: string): Set<string> {
  const next = new Set(prev);
  if (next.has(code)) next.delete(code);
  else next.add(code);
  return next;
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
    setSelectedCodes((prev) => toggleCodeInSet(prev, code));
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
      const cmp = compareVisaRows(a, b, sortField, lang);
      return sortDirection === "asc" ? cmp : -cmp;
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

  const taxExemptCount = useMemo(
    () => allVisaCountries.filter((c) => c.nomadVisa.tax.status === "exempt").length,
    [allVisaCountries],
  );
  const freeVisaCount = useMemo(
    () => allVisaCountries.filter((c) => c.nomadVisa.cost.amount === 0).length,
    [allVisaCountries],
  );
  const tableMinWidth = compareMode ? "1170px" : "1122px";
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

  if (loading) {
    return (
      <Layout>
        <LoadingRows count={8} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto box-content w-full max-w-[1200px] px-4 pb-12">
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
          <NomadVisaHeroStats
            totalCountries={allVisaCountries.length}
            taxExemptCount={taxExemptCount}
            freeVisaCount={freeVisaCount}
          />
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
                  className={`h-10 w-full rounded-md border border-surface bg-[#161616] pl-9 text-sm text-white outline-none ${searchQuery !== "" ? "pr-9" : "pr-3"}`}
                />
                {searchQuery !== "" ? (
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
        <div className="mx-auto box-content w-full max-w-[1200px] px-4 pb-12">
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
              <NomadVisaTableHeader
                sortField={sortField}
                sortDirection={sortDirection}
                compareMode={compareMode}
                onSort={handleSort}
              />
            </table>
          </div>

          {/* Scrollable body table */}
          <div ref={bodyScrollRef} className="overflow-x-auto" onScroll={syncHeaderScroll}>
            {sortedCountries.length === 0 ? (
              <EmptyState message={t("nomadVisasPage.noResults", "No countries found")} />
            ) : (
              <table
                className="w-full min-w-[var(--tmin-w)] table-fixed border-separate border-spacing-0"
                style={{ "--tmin-w": tableMinWidth } as React.CSSProperties}
              >
                {colgroup}
                <tbody>
                  {sortedCountries.map(({ country, overallScore, monthlyBudget }) => (
                    <NomadVisaTableRow
                      key={country.code}
                      country={country}
                      overallScore={overallScore}
                      monthlyBudget={monthlyBudget}
                      budget={bs.budget}
                      compareMode={compareMode}
                      isSelected={selectedCodes.has(country.code)}
                      isHighlighted={highlightCode === country.code}
                      onRowClick={(code) => {
                        if (compareMode) {
                          toggleSelect(code);
                        } else {
                          void navigate(`${langPrefix}/country/${code.toLowerCase()}`);
                        }
                      }}
                      onToggleSelect={toggleSelect}
                      langPrefix={langPrefix}
                      lang={lang}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

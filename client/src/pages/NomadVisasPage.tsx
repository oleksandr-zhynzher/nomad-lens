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
import { Layout } from "../components/Layout";
import { PageHeroBanner } from "../components/PageHeroBanner";
import { useBudgetMatcher } from "../hooks/useBudgetMatcher";
import { useBudgetState } from "../hooks/useBudgetState";
import { useCountries } from "../hooks/useCountries";
import { useLangPrefix } from "../hooks/useLangPrefix";
import { useWeightState } from "../hooks/useWeightState";
import { localizeCountry } from "../utils/localize";
import {
  computeClimateScore,
  computeScore,
  scoreColour,
} from "../utils/scoring";
import type {
  ClimatePreferences,
  CountryData,
  WeightMap,
} from "../utils/types";

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
    return (
      <ChevronsUpDown
        size={14}
        style={{ display: "inline", marginLeft: "4px", opacity: 0.3 }}
      />
    );
  }
  return sortDirection === "asc" ? (
    <ChevronUp size={14} style={{ display: "inline", marginLeft: "4px" }} />
  ) : (
    <ChevronDown size={14} style={{ display: "inline", marginLeft: "4px" }} />
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
    navigate(
      `${langPrefix}/compare?m=nomadVisas&c=${Array.from(selectedCodes).join(",")}`,
    );
  };

  // Sticky search bar — measure its height so thead sticks just below it
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [theadTop, setTheadTop] = useState(136); // 56 nav + ~80 search bar

  useEffect(() => {
    const el = searchBarRef.current;
    if (!el) return;
    const update = () => setTheadTop(56 + el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
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
        localizeCountry(c, lang)
          .name.toLowerCase()
          .includes(trimmedQuery.toLowerCase()),
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
          comparison =
            a.country.nomadVisa.duration.initial -
            b.country.nomadVisa.duration.initial;
          break;
        case "cost":
          comparison =
            a.country.nomadVisa.cost.amount - b.country.nomadVisa.cost.amount;
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
          comparison = a.country.nomadVisa.tax.status.localeCompare(
            b.country.nomadVisa.tax.status,
          );
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
        {!loading && allVisaCountries.length > 0 && (
          <div className="hero-stats-row hero-banner-stats">
            <div className="min-w-0">
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "var(--color-accent-dim)",
                  lineHeight: "1",
                }}
              >
                {allVisaCountries.length}
              </div>
              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "10px",
                  color: "#757575",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginTop: "4px",
                }}
              >
                {t("nomadVisasPage.stats.countries", {
                  count: allVisaCountries.length,
                })}
              </div>
            </div>
            <div className="hero-stat-divider" />
            <div className="min-w-0">
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "var(--color-accent-dim)",
                  lineHeight: "1",
                }}
              >
                {
                  allVisaCountries.filter(
                    (c) => c.nomadVisa.tax.status === "exempt",
                  ).length
                }
              </div>
              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "10px",
                  color: "#757575",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginTop: "4px",
                }}
              >
                {t("nomadVisasPage.stats.taxExempt", {
                  count: allVisaCountries.filter(
                    (c) => c.nomadVisa.tax.status === "exempt",
                  ).length,
                })}
              </div>
            </div>
            <div className="hero-stat-divider" />
            <div className="min-w-0">
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "var(--color-accent-dim)",
                  lineHeight: "1",
                }}
              >
                {
                  allVisaCountries.filter((c) => c.nomadVisa.cost.amount === 0)
                    .length
                }
              </div>
              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "10px",
                  color: "#757575",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginTop: "4px",
                }}
              >
                {t("nomadVisasPage.stats.freeVisas", {
                  count: allVisaCountries.filter(
                    (c) => c.nomadVisa.cost.amount === 0,
                  ).length,
                })}
              </div>
            </div>
          </div>
        )}
      </PageHeroBanner>

      {/* Sentinel for sticky detection (not needed for logic here, reserved) */}
      <div style={{ height: 0 }} />

      {/* Sticky search + compare bar */}
      <div
        ref={searchBarRef}
        style={{
          position: "sticky",
          top: "56px",
          zIndex: 20,
          backgroundColor: "var(--color-bg)",
          padding: "12px 0",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 16px",
          }}
        >
          {/* Row 1: search + compare buttons */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* Search input */}
            <div className="relative flex-1 min-w-0">
              <Search
                size={16}
                color="#808080"
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
              <input
                name="visa-country-search"
                type="text"
                placeholder={t("nomadVisasPage.search", "Search countries...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  height: "40px",
                  paddingLeft: "36px",
                  paddingRight: searchQuery ? "36px" : "12px",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  color: "#FFFFFF",
                  backgroundColor: "#161616",
                  border: "1px solid #1E1E22",
                  borderRadius: "6px",
                  outline: "none",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "22px",
                    height: "22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "3px",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: "#2A2A2A",
                    color: "#CCCCCC",
                  }}
                  aria-label={t("a11y.clearSearch", "Clear search")}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Compare mode buttons */}
            {compareMode ? (
              <div
                className="flex w-full items-center justify-end gap-2 shrink-0 sm:w-auto"
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {/* Compare CTA */}
                <button
                  onClick={handleCompare}
                  disabled={selectedCodes.size < 2}
                  className="flex-1 justify-center sm:flex-none"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    height: "40px",
                    paddingLeft: "14px",
                    paddingRight: "14px",
                    borderRadius: "6px",
                    border:
                      selectedCodes.size < 2
                        ? "1px solid var(--color-accent-dim)"
                        : "none",
                    cursor: selectedCodes.size < 2 ? "default" : "pointer",
                    backgroundColor:
                      selectedCodes.size < 2
                        ? "transparent"
                        : "var(--color-accent)",
                    color:
                      selectedCodes.size < 2
                        ? "var(--color-accent-dim)"
                        : "#FFFFFF",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    transition: "all 0.15s ease",
                  }}
                >
                  <GitCompare size={15} />
                  {t("nomadVisasPage.compareSelected", "Compare")}
                  {selectedCodes.size > 0 && (
                    <span
                      style={{
                        backgroundColor:
                          selectedCodes.size < 2
                            ? "rgba(143,90,60,0.2)"
                            : "rgba(255,255,255,0.25)",
                        borderRadius: "10px",
                        padding: "1px 7px",
                        fontSize: "12px",
                      }}
                    >
                      {selectedCodes.size}
                    </span>
                  )}
                </button>
                {/* Exit compare mode */}
                <button
                  onClick={exitCompareMode}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "40px",
                    height: "40px",
                    borderRadius: "6px",
                    border: "1px solid #2A2A2A",
                    cursor: "pointer",
                    backgroundColor: "transparent",
                    color: "#8A8A8A",
                  }}
                  aria-label={t("a11y.exitCompareMode", "Exit compare mode")}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCompareMode(true)}
                className="w-full justify-center sm:w-auto"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  height: "40px",
                  paddingLeft: "14px",
                  paddingRight: "14px",
                  borderRadius: "6px",
                  border: "1px solid #2A2A2A",
                  cursor: "pointer",
                  backgroundColor: "transparent",
                  color: "#9E9E9E",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                <GitCompare size={15} />
                {t("nomadVisasPage.compareMode", "Compare")}
              </button>
            )}
          </div>

          {/* Row 2: helper text below the entire search+buttons row */}
          {compareMode && (
            <p
              style={{
                margin: "6px 0 0",
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
                color: "#8A8A8A",
              }}
            >
              {t(
                "compare.helperText",
                "Choose countries using the checkboxes in the list, then click Compare to open the comparison view.",
              )}
            </p>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "64px 0",
            color: "#8A8A8A",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {t("loading", "Loading…")}
        </div>
      ) : sortedCountries.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "64px 16px",
            color: "#8A8A8A",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {t("nomadVisasPage.noResults", "No countries found")}
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            padding: "0 16px 48px",
            maxWidth: "1200px",
            margin: "0 auto",
            boxSizing: "border-box",
          }}
        >
          {/* Shared colgroup definition */}
          {(() => {
            const colgroup = (
              <colgroup>
                {compareMode && <col style={{ width: "48px" }} />}
                <col style={{ width: "200px" }} />
                <col style={{ width: "160px" }} />
                <col style={{ width: "110px" }} />
                <col style={{ width: "130px" }} />
                <col style={{ width: "90px" }} />
                <col style={{ width: "110px" }} />
                <col style={{ width: "150px" }} />
                <col style={{ width: "130px" }} />
                <col style={{ width: "52px" }} />
              </colgroup>
            );

            return (
              <>
                {/* Sticky header table — hidden scrollbar, synced via JS */}
                <div
                  ref={headerScrollRef}
                  className="no-scrollbar"
                  style={{
                    position: "sticky",
                    top: `${theadTop}px`,
                    zIndex: 10,
                    backgroundColor: "var(--color-bg)",
                    overflowX: "scroll",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      minWidth: tableMinWidth,
                      tableLayout: "fixed",
                      borderCollapse: "separate",
                      borderSpacing: 0,
                    }}
                  >
                    {colgroup}
                    <thead>
                      <tr style={{ borderBottom: "2px solid #333333" }}>
                        {compareMode && (
                          <th
                            style={{
                              padding: "16px 4px 16px 12px",
                              backgroundColor: "var(--color-bg)",
                            }}
                          />
                        )}
                        <th
                          onClick={() => handleSort("country")}
                          style={{
                            padding: "16px 12px",
                            textAlign: "left",
                            fontFamily: "Inter, sans-serif",
                            fontSize: "11px",
                            fontWeight: 600,
                            letterSpacing: "1px",
                            textTransform: "uppercase",
                            color: "#9E9E9E",
                            cursor: "pointer",
                            userSelect: "none",
                            backgroundColor: "var(--color-bg)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {t("nomadVisasPage.table.country", "Country")}{" "}
                          <SortIcon
                            field="country"
                            sortField={sortField}
                            sortDirection={sortDirection}
                          />
                        </th>
                        <th
                          style={{
                            padding: "16px 12px",
                            textAlign: "left",
                            fontFamily: "Inter, sans-serif",
                            fontSize: "11px",
                            fontWeight: 600,
                            letterSpacing: "1px",
                            textTransform: "uppercase",
                            color: "#9E9E9E",
                            backgroundColor: "var(--color-bg)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {t("nomadVisasPage.table.visaName", "Visa Name")}
                        </th>
                        <th
                          onClick={() => handleSort("overallScore")}
                          style={{
                            padding: "16px 12px",
                            textAlign: "right",
                            fontFamily: "Inter, sans-serif",
                            fontSize: "11px",
                            fontWeight: 600,
                            letterSpacing: "1px",
                            textTransform: "uppercase",
                            color: "#9E9E9E",
                            cursor: "pointer",
                            userSelect: "none",
                            backgroundColor: "var(--color-bg)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {t(
                            "nomadVisasPage.table.overallScore",
                            "Overall Score",
                          )}{" "}
                          <SortIcon
                            field="overallScore"
                            sortField={sortField}
                            sortDirection={sortDirection}
                          />
                        </th>
                        <th
                          onClick={() => handleSort("monthlyBudget")}
                          style={{
                            padding: "16px 12px",
                            textAlign: "right",
                            fontFamily: "Inter, sans-serif",
                            fontSize: "11px",
                            fontWeight: 600,
                            letterSpacing: "1px",
                            textTransform: "uppercase",
                            color: "#9E9E9E",
                            cursor: "pointer",
                            userSelect: "none",
                            backgroundColor: "var(--color-bg)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {t(
                            "nomadVisasPage.table.monthlyBudget",
                            "Monthly Budget",
                          )}{" "}
                          <SortIcon
                            field="monthlyBudget"
                            sortField={sortField}
                            sortDirection={sortDirection}
                          />
                        </th>
                        <th
                          onClick={() => handleSort("duration")}
                          style={{
                            padding: "16px 12px",
                            textAlign: "left",
                            fontFamily: "Inter, sans-serif",
                            fontSize: "11px",
                            fontWeight: 600,
                            letterSpacing: "1px",
                            textTransform: "uppercase",
                            color: "#9E9E9E",
                            cursor: "pointer",
                            userSelect: "none",
                            backgroundColor: "var(--color-bg)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {t("nomadVisasPage.table.duration", "Duration")}{" "}
                          <SortIcon
                            field="duration"
                            sortField={sortField}
                            sortDirection={sortDirection}
                          />
                        </th>
                        <th
                          onClick={() => handleSort("cost")}
                          style={{
                            padding: "16px 12px",
                            textAlign: "right",
                            fontFamily: "Inter, sans-serif",
                            fontSize: "11px",
                            fontWeight: 600,
                            letterSpacing: "1px",
                            textTransform: "uppercase",
                            color: "#9E9E9E",
                            cursor: "pointer",
                            userSelect: "none",
                            backgroundColor: "var(--color-bg)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {t("nomadVisasPage.table.cost", "Cost")}{" "}
                          <SortIcon
                            field="cost"
                            sortField={sortField}
                            sortDirection={sortDirection}
                          />
                        </th>
                        <th
                          onClick={() => handleSort("income")}
                          style={{
                            padding: "16px 12px",
                            textAlign: "right",
                            fontFamily: "Inter, sans-serif",
                            fontSize: "11px",
                            fontWeight: 600,
                            letterSpacing: "1px",
                            textTransform: "uppercase",
                            color: "#9E9E9E",
                            cursor: "pointer",
                            userSelect: "none",
                            backgroundColor: "var(--color-bg)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {t("nomadVisasPage.table.income", "Income Req.")}{" "}
                          <SortIcon
                            field="income"
                            sortField={sortField}
                            sortDirection={sortDirection}
                          />
                        </th>
                        <th
                          onClick={() => handleSort("tax")}
                          style={{
                            padding: "16px 12px",
                            textAlign: "center",
                            fontFamily: "Inter, sans-serif",
                            fontSize: "11px",
                            fontWeight: 600,
                            letterSpacing: "1px",
                            textTransform: "uppercase",
                            color: "#9E9E9E",
                            cursor: "pointer",
                            userSelect: "none",
                            backgroundColor: "var(--color-bg)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {t("nomadVisasPage.table.tax", "Tax Status")}{" "}
                          <SortIcon
                            field="tax"
                            sortField={sortField}
                            sortDirection={sortDirection}
                          />
                        </th>
                        <th
                          style={{
                            padding: "16px 12px",
                            backgroundColor: "var(--color-bg)",
                          }}
                        />
                      </tr>
                    </thead>
                  </table>
                </div>

                {/* Scrollable body table */}
                <div
                  ref={bodyScrollRef}
                  style={{ overflowX: "auto" }}
                  onScroll={syncHeaderScroll}
                >
                  <table
                    style={{
                      width: "100%",
                      minWidth: tableMinWidth,
                      tableLayout: "fixed",
                      borderCollapse: "separate",
                      borderSpacing: 0,
                    }}
                  >
                    {colgroup}
                    <tbody>
                      {sortedCountries.map(
                        ({ country, overallScore, monthlyBudget }) => {
                          const visa = country.nomadVisa;
                          const taxColors =
                            TAX_STATUS_COLORS[visa.tax.status] ??
                            TAX_STATUS_COLORS.standard;
                          const isHighlighted = highlightCode === country.code;
                          const isSelected = selectedCodes.has(country.code);

                          return (
                            <tr
                              key={country.code}
                              data-country-code={country.code.toLowerCase()}
                              style={{
                                borderBottom: "1px solid #1E1E1E",
                                backgroundColor: isSelected
                                  ? "#1A2A1A"
                                  : isHighlighted
                                    ? "#1A1208"
                                    : "transparent",
                                transition: "background-color 0.15s",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                if (compareMode) {
                                  toggleSelect(country.code);
                                } else {
                                  navigate(
                                    `${langPrefix}/country/${country.code.toLowerCase()}`,
                                  );
                                }
                              }}
                              onMouseEnter={(e) => {
                                if (!isHighlighted && !isSelected) {
                                  e.currentTarget.style.backgroundColor =
                                    "#232326";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isHighlighted && !isSelected) {
                                  e.currentTarget.style.backgroundColor =
                                    "transparent";
                                }
                              }}
                            >
                              {/* Checkbox — compare mode only */}
                              {compareMode && (
                                <td
                                  style={{
                                    padding: "16px 4px 16px 12px",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSelect(country.code);
                                  }}
                                >
                                  <div
                                    aria-label={`Select ${localizeCountry(country, lang).name}`}
                                    style={{
                                      width: "16px",
                                      height: "16px",
                                      borderRadius: "3px",
                                      border: `2px solid ${isSelected ? "var(--color-accent)" : "#404040"}`,
                                      backgroundColor: isSelected
                                        ? "var(--color-accent)"
                                        : "transparent",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      flexShrink: 0,
                                      transition: "all 0.1s ease",
                                      pointerEvents: "none",
                                    }}
                                  >
                                    {isSelected && (
                                      <svg
                                        width="9"
                                        height="7"
                                        viewBox="0 0 9 7"
                                        fill="none"
                                      >
                                        <path
                                          d="M1 3.5L3.5 6L8 1"
                                          stroke="white"
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                </td>
                              )}

                              {/* Country */}
                              <td style={{ padding: "16px 12px" }}>
                                <Link
                                  to={`${langPrefix}/country/${country.code.toLowerCase()}`}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    textDecoration: "none",
                                  }}
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
                                      country: localizeCountry(country, lang)
                                        .name,
                                    })}
                                    style={{
                                      width: "28px",
                                      height: "19px",
                                      borderRadius: "3px",
                                      objectFit: "cover",
                                      flexShrink: 0,
                                    }}
                                    loading="lazy"
                                  />
                                  <span
                                    style={{
                                      fontFamily: "Inter, sans-serif",
                                      fontSize: "14px",
                                      fontWeight: 500,
                                      color: "#FFFFFF",
                                    }}
                                  >
                                    {localizeCountry(country, lang).name}
                                  </span>
                                </Link>
                              </td>

                              {/* Visa Name */}
                              <td style={{ padding: "16px 12px" }}>
                                <span
                                  style={{
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "13px",
                                    color: "#CCCCCC",
                                  }}
                                >
                                  {visa.visaName}
                                </span>
                              </td>

                              {/* Overall score */}
                              <td
                                style={{
                                  padding: "16px 12px",
                                  textAlign: "right",
                                }}
                              >
                                <span
                                  style={{
                                    fontFamily: "IBM Plex Mono, monospace",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    color: scoreColour(overallScore),
                                  }}
                                >
                                  {overallScore.toFixed(1)}
                                </span>
                              </td>

                              {/* Monthly budget */}
                              <td
                                style={{
                                  padding: "16px 12px",
                                  textAlign: "right",
                                }}
                              >
                                <span
                                  style={{
                                    fontFamily: "IBM Plex Mono, monospace",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    color:
                                      monthlyBudget != null &&
                                      monthlyBudget <= bs.budget
                                        ? "#44CC66"
                                        : monthlyBudget != null
                                          ? "#FFFFFF"
                                          : "#757575",
                                  }}
                                >
                                  {monthlyBudget != null
                                    ? `$${monthlyBudget.toLocaleString()}`
                                    : "—"}
                                </span>
                              </td>

                              {/* Duration */}
                              <td style={{ padding: "16px 12px" }}>
                                <span
                                  style={{
                                    fontFamily: "IBM Plex Mono, monospace",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    color: "#FFFFFF",
                                  }}
                                >
                                  {visa.duration.initial}
                                </span>
                                <span
                                  style={{
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "12px",
                                    color: "#8A8A8A",
                                    marginLeft: "3px",
                                  }}
                                >
                                  {t("countryPage.visa.mo")}
                                </span>
                                {visa.duration.maxExtension > 0 && (
                                  <span
                                    style={{
                                      fontFamily: "Inter, sans-serif",
                                      fontSize: "11px",
                                      color: "#808080",
                                      marginLeft: "4px",
                                    }}
                                  >
                                    +{visa.duration.maxExtension}
                                  </span>
                                )}
                              </td>

                              {/* Cost */}
                              <td
                                style={{
                                  padding: "16px 12px",
                                  textAlign: "right",
                                }}
                              >
                                <span
                                  style={{
                                    fontFamily: "IBM Plex Mono, monospace",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    color:
                                      visa.cost.amount === 0
                                        ? "#44CC66"
                                        : "#FFFFFF",
                                  }}
                                >
                                  {visa.cost.amount === 0
                                    ? t("countryPage.visa.free", "Free")
                                    : `${visa.cost.currency} ${visa.cost.amount.toLocaleString()}`}
                                </span>
                              </td>

                              {/* Income */}
                              <td
                                style={{
                                  padding: "16px 12px",
                                  textAlign: "right",
                                }}
                              >
                                {visa.incomeRequirement.monthly ? (
                                  <>
                                    <span
                                      style={{
                                        fontFamily: "IBM Plex Mono, monospace",
                                        fontSize: "14px",
                                        fontWeight: 600,
                                        color: "#FFFFFF",
                                      }}
                                    >
                                      {visa.incomeRequirement.currency}{" "}
                                      {visa.incomeRequirement.monthly.toLocaleString()}
                                    </span>
                                    <span
                                      style={{
                                        fontFamily: "Inter, sans-serif",
                                        fontSize: "12px",
                                        color: "#8A8A8A",
                                        marginLeft: "2px",
                                      }}
                                    >
                                      /{t("countryPage.visa.mo")}
                                    </span>
                                  </>
                                ) : visa.incomeRequirement.annual ? (
                                  <>
                                    <span
                                      style={{
                                        fontFamily: "IBM Plex Mono, monospace",
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        color: "#FFFFFF",
                                      }}
                                    >
                                      {visa.incomeRequirement.currency}{" "}
                                      {visa.incomeRequirement.annual.toLocaleString()}
                                    </span>
                                    <span
                                      style={{
                                        fontFamily: "Inter, sans-serif",
                                        fontSize: "12px",
                                        color: "#8A8A8A",
                                        marginLeft: "2px",
                                      }}
                                    >
                                      /{t("countryPage.visa.yr")}
                                    </span>
                                  </>
                                ) : (
                                  <span
                                    style={{
                                      fontFamily: "IBM Plex Mono, monospace",
                                      fontSize: "13px",
                                      fontWeight: 600,
                                      color: "#44CC66",
                                    }}
                                  >
                                    {t("countryPage.visa.noMinimum", "None")}
                                  </span>
                                )}
                              </td>

                              {/* Tax */}
                              <td
                                style={{
                                  padding: "16px 12px",
                                  textAlign: "center",
                                }}
                              >
                                <span
                                  className="inline-flex items-center px-2 py-1 rounded-full"
                                  style={{
                                    fontFamily: "IBM Plex Mono, monospace",
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    backgroundColor: taxColors.bg,
                                    color: taxColors.text,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {visa.tax.status === "exempt"
                                    ? t("countryPage.taxExemptLabel")
                                    : visa.tax.status === "special"
                                      ? t("countryPage.specialTaxLabel")
                                      : t("countryPage.standardTaxLabel")}
                                </span>
                              </td>

                              {/* Link */}
                              <td
                                style={{
                                  padding: "16px 12px",
                                  textAlign: "center",
                                }}
                              >
                                <a
                                  href={visa.officialUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    color: "var(--color-accent)",
                                    display: "inline-flex",
                                  }}
                                >
                                  <ExternalLink size={16} />
                                </a>
                              </td>
                            </tr>
                          );
                        },
                      )}
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

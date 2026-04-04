import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ChevronsUpDown,
} from "lucide-react";
import { Layout } from "../components/Layout";
import { HeroSection } from "../components/HeroSection";
import { useCountries } from "../hooks/useCountries";
import { useLangPrefix } from "../hooks/useLangPrefix";
import { localizeCountry } from "../utils/localize";
import type { CountryData } from "../utils/types";

const TAX_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  exempt: { bg: "#1A4A2A", text: "#44CC66" },
  standard: { bg: "#2A2A3A", text: "#8888CC" },
  special: { bg: "#4A3A1A", text: "#DDAA44" },
};

type SortField = "country" | "duration" | "cost" | "income" | "tax";
type SortDirection = "asc" | "desc";

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
  const lang = i18n.language;
  const [searchParams] = useSearchParams();
  const highlightCode = searchParams.get("country")?.toUpperCase() ?? null;

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("country");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

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
    const sorted = [...visaCountries];
    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "country":
          comparison = localizeCountry(a, lang).name.localeCompare(
            localizeCountry(b, lang).name,
          );
          break;
        case "duration":
          comparison =
            a.nomadVisa.duration.initial - b.nomadVisa.duration.initial;
          break;
        case "cost":
          comparison = a.nomadVisa.cost.amount - b.nomadVisa.cost.amount;
          break;
        case "income": {
          const aIncome =
            a.nomadVisa.incomeRequirement.monthly ??
            a.nomadVisa.incomeRequirement.annual ??
            0;
          const bIncome =
            b.nomadVisa.incomeRequirement.monthly ??
            b.nomadVisa.incomeRequirement.annual ??
            0;
          comparison = aIncome - bIncome;
          break;
        }
        case "tax":
          comparison = a.nomadVisa.tax.status.localeCompare(
            b.nomadVisa.tax.status,
          );
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [visaCountries, sortField, sortDirection, lang]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <HeroSection
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
                {allVisaCountries.length}
              </div>
              <div
                style={{
                  fontFamily: "Geist, sans-serif",
                  fontSize: "10px",
                  color: "#444444",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginTop: "4px",
                }}
              >
                {t("nomadVisasPage.countries", "Countries")}
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
                {
                  allVisaCountries.filter(
                    (c) => c.nomadVisa.tax.status === "exempt",
                  ).length
                }
              </div>
              <div
                style={{
                  fontFamily: "Geist, sans-serif",
                  fontSize: "10px",
                  color: "#444444",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginTop: "4px",
                }}
              >
                {t("nomadVisasPage.taxExempt", "Tax Exempt")}
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
                {
                  allVisaCountries.filter((c) => c.nomadVisa.cost.amount === 0)
                    .length
                }
              </div>
              <div
                style={{
                  fontFamily: "Geist, sans-serif",
                  fontSize: "10px",
                  color: "#444444",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginTop: "4px",
                }}
              >
                {t("nomadVisasPage.freeVisas", "Free Visas")}
              </div>
            </div>
          </div>
        )}
      </HeroSection>

      {/* Search */}
      <div
        style={{
          backgroundColor: "#0D0D0F",
          padding: "16px 16px",
          borderBottom: "1px solid #141414",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              size={18}
              color="#666666"
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder={t("nomadVisasPage.search", "Search countries...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                height: "48px",
                paddingLeft: "42px",
                paddingRight: "14px",
                fontFamily: "Geist, sans-serif",
                fontSize: "14px",
                color: "#FFFFFF",
                backgroundColor: "#1A1A1A",
                border: "1px solid #252525",
                borderRadius: "6px",
                outline: "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "64px 0",
            color: "#666666",
            fontFamily: "Geist, sans-serif",
          }}
        >
          {t("loading", "Loading…")}
        </div>
      ) : sortedCountries.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "64px 16px",
            color: "#666666",
            fontFamily: "Geist, sans-serif",
          }}
        >
          {t("nomadVisasPage.noResults", "No countries found")}
        </div>
      ) : (
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 16px 48px",
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
              marginTop: "60px",
            }}
          >
            <thead
              style={{
                position: "sticky",
                top: "56px",
                zIndex: 10,
                backgroundColor: "var(--color-bg)",
              }}
            >
              <tr style={{ borderBottom: "2px solid #333333" }}>
                <th
                  onClick={() => handleSort("country")}
                  style={{
                    padding: "16px 12px",
                    textAlign: "left",
                    fontFamily: "Geist, sans-serif",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: "#999999",
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
                    fontFamily: "Geist, sans-serif",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: "#999999",
                    backgroundColor: "var(--color-bg)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t("nomadVisasPage.table.visaName", "Visa Name")}
                </th>
                <th
                  onClick={() => handleSort("duration")}
                  style={{
                    padding: "16px 12px",
                    textAlign: "left",
                    fontFamily: "Geist, sans-serif",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: "#999999",
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
                    fontFamily: "Geist, sans-serif",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: "#999999",
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
                    fontFamily: "Geist, sans-serif",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: "#999999",
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
                    fontFamily: "Geist, sans-serif",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: "#999999",
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
                    width: "60px",
                    backgroundColor: "var(--color-bg)",
                  }}
                ></th>
              </tr>
            </thead>
            <tbody>
              {sortedCountries.map((country) => {
                const visa = country.nomadVisa;
                const taxColors =
                  TAX_STATUS_COLORS[visa.tax.status] ??
                  TAX_STATUS_COLORS.standard;
                const isHighlighted = highlightCode === country.code;

                return (
                  <tr
                    key={country.code}
                    data-country-code={country.code.toLowerCase()}
                    style={{
                      borderBottom: "1px solid #1E1E1E",
                      backgroundColor: isHighlighted
                        ? "#1A1208"
                        : "transparent",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isHighlighted) {
                        e.currentTarget.style.backgroundColor = "#1A1A1A";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isHighlighted) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
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
                      >
                        <img
                          src={country.flagUrl}
                          alt={`${localizeCountry(country, lang).name} flag`}
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
                            fontFamily: "Geist, sans-serif",
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
                          fontFamily: "Geist, sans-serif",
                          fontSize: "13px",
                          color: "#CCCCCC",
                        }}
                      >
                        {visa.visaName}
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
                          fontFamily: "Geist, sans-serif",
                          fontSize: "12px",
                          color: "#666666",
                          marginLeft: "3px",
                        }}
                      >
                        {t("countryPage.visa.mo")}
                      </span>
                      {visa.duration.maxExtension > 0 && (
                        <span
                          style={{
                            fontFamily: "Geist, sans-serif",
                            fontSize: "11px",
                            color: "#555555",
                            marginLeft: "4px",
                          }}
                        >
                          +{visa.duration.maxExtension}
                        </span>
                      )}
                    </td>

                    {/* Cost */}
                    <td style={{ padding: "16px 12px", textAlign: "right" }}>
                      <span
                        style={{
                          fontFamily: "IBM Plex Mono, monospace",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: visa.cost.amount === 0 ? "#44CC66" : "#FFFFFF",
                        }}
                      >
                        {visa.cost.amount === 0
                          ? t("countryPage.visa.free", "Free")
                          : `${visa.cost.currency} ${visa.cost.amount.toLocaleString()}`}
                      </span>
                    </td>

                    {/* Income */}
                    <td style={{ padding: "16px 12px", textAlign: "right" }}>
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
                              fontFamily: "Geist, sans-serif",
                              fontSize: "12px",
                              color: "#666666",
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
                              fontFamily: "Geist, sans-serif",
                              fontSize: "12px",
                              color: "#666666",
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
                    <td style={{ padding: "16px 12px", textAlign: "center" }}>
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
                    <td style={{ padding: "16px 12px", textAlign: "center" }}>
                      <a
                        href={visa.officialUrl}
                        target="_blank"
                        rel="noreferrer"
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
              })}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ExternalLink, ArrowLeft } from "lucide-react";
import { Layout } from "../components/Layout";
import { useCountries } from "../hooks/useCountries";
import { useLangPrefix } from "../hooks/useLangPrefix";
import { localizeCountry } from "../utils/localize";
import type { CountryData, NomadVisaDetails } from "../utils/types";

const TAX_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  exempt: { bg: "#1A4A2A", text: "#44CC66" },
  standard: { bg: "#2A2A3A", text: "#8888CC" },
  special: { bg: "#4A3A1A", text: "#DDAA44" },
};

type VisaCountry = CountryData & { nomadVisa: NomadVisaDetails };

const LABEL_STYLE = {
  fontFamily: "Inter, sans-serif",
  fontSize: "11px",
  fontWeight: 600 as const,
  letterSpacing: "0.8px",
  textTransform: "uppercase" as const,
  color: "#757575",
};

const VALUE_MONO = {
  fontFamily: "IBM Plex Mono, monospace",
  fontSize: "14px",
  fontWeight: 600 as const,
  color: "#FFFFFF",
};

const VALUE_TEXT = {
  fontFamily: "Inter, sans-serif",
  fontSize: "13px",
  color: "#CCCCCC",
};

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "160px 1fr",
        gap: "0",
        borderBottom: "1px solid #1A1A1A",
        alignItems: "stretch",
      }}
    >
      <div
        style={{
          ...LABEL_STYLE,
          padding: "14px 16px",
          backgroundColor: "#111113",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", overflow: "hidden" }}>{children}</div>
    </div>
  );
}

function Cell({
  children,
  count,
}: {
  children: React.ReactNode;
  count: number;
}) {
  return (
    <div
      style={{
        flex: `0 0 ${100 / count}%`,
        padding: "14px 16px",
        borderLeft: "1px solid #1A1A1A",
        display: "flex",
        alignItems: "center",
        minWidth: 0,
      }}
    >
      {children}
    </div>
  );
}

export function NomadVisaComparePage() {
  const { t, i18n } = useTranslation();
  const { countries, loading } = useCountries();
  const [searchParams] = useSearchParams();
  const langPrefix = useLangPrefix();
  const lang = i18n.language;

  const codes = useMemo(
    () =>
      (searchParams.get("c") ?? "").toUpperCase().split(",").filter(Boolean),
    [searchParams],
  );

  const selected = useMemo<VisaCountry[]>(() => {
    return codes
      .map((code) => countries.find((c) => c.code === code))
      .filter((c): c is VisaCountry => !!c && !!c.nomadVisa);
  }, [countries, codes]);

  const count = selected.length;

  return (
    <Layout>
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "32px 16px 64px",
        }}
      >
        {/* Back link */}
        <Link
          to={`${langPrefix}/nomad-visas`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            color: "#8A8A8A",
            textDecoration: "none",
            marginBottom: "24px",
          }}
        >
          <ArrowLeft size={14} />
          {t("nomadVisasPage.backToVisas", "Back to Nomad Visas")}
        </Link>

        <h1
          style={{
            fontFamily: "Oswald, sans-serif",
            fontSize: "28px",
            fontWeight: 700,
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "#FFFFFF",
            marginBottom: "32px",
          }}
        >
          {t("nomadVisasPage.compareTitle", "Nomad Visa Comparison")}
        </h1>

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
        ) : count === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "64px 16px",
              color: "#8A8A8A",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {t(
              "nomadVisasPage.noCountriesSelected",
              "No countries selected. Go back and pick at least 2.",
            )}
          </div>
        ) : (
          <div
            style={{
              border: "1px solid #1E1E1E",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {/* Country header row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "160px 1fr",
                backgroundColor: "#111113",
                borderBottom: "2px solid #2A2A2A",
              }}
            >
              <div style={{ padding: "16px" }} />
              <div style={{ display: "flex" }}>
                {selected.map((c) => {
                  const loc = localizeCountry(c, lang);
                  return (
                    <div
                      key={c.code}
                      style={{
                        flex: `0 0 ${100 / count}%`,
                        padding: "16px",
                        borderLeft: "1px solid #1E1E1E",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        minWidth: 0,
                      }}
                    >
                      <img
                        src={c.flagUrl}
                        alt={loc.name}
                        style={{
                          width: "28px",
                          height: "19px",
                          borderRadius: "3px",
                          objectFit: "cover",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "15px",
                          fontWeight: 600,
                          color: "#FFFFFF",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {loc.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visa name */}
            <Row label={t("nomadVisasPage.table.visaName", "Visa Name")}>
              {selected.map((c) => (
                <Cell key={c.code} count={count}>
                  <span style={VALUE_TEXT}>{c.nomadVisa.visaName}</span>
                </Cell>
              ))}
            </Row>

            {/* Duration */}
            <Row label={t("nomadVisasPage.table.duration", "Duration")}>
              {selected.map((c) => (
                <Cell key={c.code} count={count}>
                  <span style={VALUE_MONO}>{c.nomadVisa.duration.initial}</span>
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
                  {c.nomadVisa.duration.maxExtension > 0 && (
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "11px",
                        color: "#808080",
                        marginLeft: "6px",
                      }}
                    >
                      +{c.nomadVisa.duration.maxExtension}{" "}
                      {t("countryPage.visa.mo")} ext.
                    </span>
                  )}
                </Cell>
              ))}
            </Row>

            {/* Cost */}
            <Row label={t("nomadVisasPage.table.cost", "Cost")}>
              {selected.map((c) => (
                <Cell key={c.code} count={count}>
                  <span
                    style={{
                      ...VALUE_MONO,
                      color:
                        c.nomadVisa.cost.amount === 0 ? "#44CC66" : "#FFFFFF",
                    }}
                  >
                    {c.nomadVisa.cost.amount === 0
                      ? t("countryPage.visa.free", "Free")
                      : `${c.nomadVisa.cost.currency} ${c.nomadVisa.cost.amount.toLocaleString()}`}
                  </span>
                </Cell>
              ))}
            </Row>

            {/* Income requirement */}
            <Row label={t("nomadVisasPage.table.income", "Income Req.")}>
              {selected.map((c) => {
                const inc = c.nomadVisa.incomeRequirement;
                return (
                  <Cell key={c.code} count={count}>
                    {inc.monthly ? (
                      <>
                        <span style={VALUE_MONO}>
                          {inc.currency} {inc.monthly.toLocaleString()}
                        </span>
                        <span
                          style={{
                            ...VALUE_TEXT,
                            color: "#8A8A8A",
                            marginLeft: "3px",
                          }}
                        >
                          /{t("countryPage.visa.mo")}
                        </span>
                      </>
                    ) : inc.annual ? (
                      <>
                        <span style={VALUE_MONO}>
                          {inc.currency} {inc.annual.toLocaleString()}
                        </span>
                        <span
                          style={{
                            ...VALUE_TEXT,
                            color: "#8A8A8A",
                            marginLeft: "3px",
                          }}
                        >
                          /{t("countryPage.visa.yr")}
                        </span>
                      </>
                    ) : (
                      <span style={{ ...VALUE_MONO, color: "#44CC66" }}>
                        {t("countryPage.visa.noMinimum", "None")}
                      </span>
                    )}
                  </Cell>
                );
              })}
            </Row>

            {/* Tax status */}
            <Row label={t("nomadVisasPage.table.tax", "Tax Status")}>
              {selected.map((c) => {
                const taxColors =
                  TAX_STATUS_COLORS[c.nomadVisa.tax.status] ??
                  TAX_STATUS_COLORS.standard;
                return (
                  <Cell key={c.code} count={count}>
                    <span
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: "11px",
                        fontWeight: 600,
                        backgroundColor: taxColors.bg,
                        color: taxColors.text,
                        borderRadius: "12px",
                        padding: "3px 10px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.nomadVisa.tax.status === "exempt"
                        ? t("countryPage.taxExemptLabel")
                        : c.nomadVisa.tax.status === "special"
                          ? t("countryPage.specialTaxLabel")
                          : t("countryPage.standardTaxLabel")}
                    </span>
                  </Cell>
                );
              })}
            </Row>

            {/* Tax rate */}
            <Row label={t("nomadVisaComparePage.taxRate", "Tax Rate")}>
              {selected.map((c) => (
                <Cell key={c.code} count={count}>
                  <span style={VALUE_MONO}>
                    {c.nomadVisa.tax.rate != null
                      ? `${c.nomadVisa.tax.rate}%`
                      : "—"}
                  </span>
                </Cell>
              ))}
            </Row>

            {/* Renewable */}
            <Row label={t("nomadVisaComparePage.renewable", "Renewable")}>
              {selected.map((c) => (
                <Cell key={c.code} count={count}>
                  <span
                    style={{
                      ...VALUE_TEXT,
                      color: c.nomadVisa.duration.renewable
                        ? "#44CC66"
                        : "#CC4444",
                    }}
                  >
                    {c.nomadVisa.duration.renewable
                      ? t("common.yes", "Yes")
                      : t("common.no", "No")}
                  </span>
                </Cell>
              ))}
            </Row>

            {/* Online application */}
            <Row
              label={t("nomadVisaComparePage.onlineApp", "Online Application")}
            >
              {selected.map((c) => (
                <Cell key={c.code} count={count}>
                  <span
                    style={{
                      ...VALUE_TEXT,
                      color: c.nomadVisa.applicationProcess.online
                        ? "#44CC66"
                        : "#CC4444",
                    }}
                  >
                    {c.nomadVisa.applicationProcess.online
                      ? t("common.yes", "Yes")
                      : t("common.no", "No")}
                  </span>
                </Cell>
              ))}
            </Row>

            {/* Processing time */}
            <Row
              label={t(
                "nomadVisaComparePage.processingTime",
                "Processing Time",
              )}
            >
              {selected.map((c) => (
                <Cell key={c.code} count={count}>
                  <span style={VALUE_TEXT}>
                    {c.nomadVisa.applicationProcess.processingTime || "—"}
                  </span>
                </Cell>
              ))}
            </Row>

            {/* Official link */}
            <Row
              label={t("nomadVisaComparePage.officialLink", "Official Link")}
            >
              {selected.map((c) => (
                <Cell key={c.code} count={count}>
                  <a
                    href={c.nomadVisa.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "12px",
                      color: "var(--color-accent-dim)",
                      textDecoration: "none",
                    }}
                  >
                    <ExternalLink size={13} />
                    {t("nomadVisaComparePage.viewPage", "Official page")}
                  </a>
                </Cell>
              ))}
            </Row>
          </div>
        )}
      </div>
    </Layout>
  );
}

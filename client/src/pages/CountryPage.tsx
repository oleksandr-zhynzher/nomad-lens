import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ExternalLink,
  Clock,
  DollarSign,
  TrendingUp,
  Shield,
  FileText,
  CheckCircle2,
  Globe,
  Calendar,
  Briefcase,
  Plane,
} from "lucide-react";
import { useCountries } from "../hooks/useCountries";
import { useWeightState } from "../hooks/useWeightState";
import { useScoring } from "../hooks/useScoring";
import { useLangPrefix } from "../hooks/useLangPrefix";
import { ScoreBreakdown } from "../components/ScoreBreakdown";
import { scoreColour } from "../utils/scoring";
import type {
  NomadVisaDetails,
  SeasonType,
  ClimatePreferences,
} from "../utils/types";

const DEFAULT_CLIMATE: ClimatePreferences = {
  seasonType: "any",
  minTemp: -10,
  maxTemp: 45,
};

const SEASON_BADGE: Record<
  SeasonType,
  { label: string; bg: string; text: string }
> = {
  four_seasons: { label: "Four Seasons", bg: "#8F5A3C", text: "#FFFFFF" },
  mild_seasons: { label: "Mild Seasons", bg: "#1A3A5C", text: "#60A5FA" },
  tropical: { label: "Tropical", bg: "#1A4A2A", text: "#44CC66" },
  arid: { label: "Arid", bg: "#4A3A1A", text: "#AA7733" },
  polar: { label: "Polar", bg: "#2A2A2A", text: "#999999" },
};

const TAX_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  exempt: { bg: "#1A4A2A", text: "#44CC66" },
  standard: { bg: "#2A2A3A", text: "#8888CC" },
  special: { bg: "#4A3A1A", text: "#DDAA44" },
};

function VisaSection({ visa }: { visa: NomadVisaDetails }) {
  const { t } = useTranslation();
  const taxColors =
    TAX_STATUS_COLORS[visa.tax.status] ?? TAX_STATUS_COLORS.standard;

  return (
    <section style={{ marginTop: "32px" }}>
      {/* Visa Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1A1A1A 0%, #2A1F1A 100%)",
          borderRadius: "12px",
          border: "1px solid #333333",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "var(--color-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Globe size={20} color="#FFFFFF" />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: "Anton, sans-serif",
                  fontSize: "24px",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  lineHeight: 1.2,
                }}
              >
                {visa.visaName}
              </h2>
              <p
                style={{
                  fontFamily: "Geist, sans-serif",
                  fontSize: "12px",
                  color: "#888888",
                  marginTop: "2px",
                }}
              >
                {t("countryPage.visa.lastUpdated")}: {visa.lastUpdated}
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            {/* Duration */}
            <div
              style={{
                backgroundColor: "#111111",
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "8px",
                }}
              >
                <Clock size={14} color="#888888" />
                <span
                  style={{
                    fontFamily: "Geist, sans-serif",
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "1.2px",
                    textTransform: "uppercase",
                    color: "#666666",
                  }}
                >
                  {t("countryPage.visa.duration")}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "22px",
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
                  color: "#888888",
                  marginLeft: "4px",
                }}
              >
                {t("countryPage.visa.months")}
              </span>
              {visa.duration.maxExtension > 0 && (
                <p
                  style={{
                    fontFamily: "Geist, sans-serif",
                    fontSize: "11px",
                    color: "#666666",
                    marginTop: "4px",
                  }}
                >
                  +{visa.duration.maxExtension}{" "}
                  {t("countryPage.visa.extension")}
                </p>
              )}
              {visa.duration.renewable && (
                <p
                  style={{
                    fontFamily: "Geist, sans-serif",
                    fontSize: "11px",
                    color: "#44CC66",
                    marginTop: "2px",
                  }}
                >
                  ✓ {t("countryPage.visa.renewable")}
                </p>
              )}
            </div>

            {/* Cost */}
            <div
              style={{
                backgroundColor: "#111111",
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "8px",
                }}
              >
                <DollarSign size={14} color="#888888" />
                <span
                  style={{
                    fontFamily: "Geist, sans-serif",
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "1.2px",
                    textTransform: "uppercase",
                    color: "#666666",
                  }}
                >
                  {t("countryPage.visa.cost")}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "22px",
                  fontWeight: 600,
                  color: visa.cost.amount === 0 ? "#44CC66" : "#FFFFFF",
                }}
              >
                {visa.cost.amount === 0
                  ? t("countryPage.visa.free")
                  : `${visa.cost.currency} ${visa.cost.amount.toLocaleString()}`}
              </span>
              {visa.cost.notes && (
                <p
                  style={{
                    fontFamily: "Geist, sans-serif",
                    fontSize: "11px",
                    color: "#666666",
                    marginTop: "4px",
                  }}
                >
                  {visa.cost.notes}
                </p>
              )}
            </div>

            {/* Income */}
            <div
              style={{
                backgroundColor: "#111111",
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "8px",
                }}
              >
                <TrendingUp size={14} color="#888888" />
                <span
                  style={{
                    fontFamily: "Geist, sans-serif",
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "1.2px",
                    textTransform: "uppercase",
                    color: "#666666",
                  }}
                >
                  {t("countryPage.visa.income")}
                </span>
              </div>
              {visa.incomeRequirement.monthly ? (
                <>
                  <span
                    style={{
                      fontFamily: "IBM Plex Mono, monospace",
                      fontSize: "22px",
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
                      color: "#888888",
                      marginLeft: "4px",
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
                      fontSize: "22px",
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
                      color: "#888888",
                      marginLeft: "4px",
                    }}
                  >
                    /{t("countryPage.visa.yr")}
                  </span>
                </>
              ) : (
                <span
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#44CC66",
                  }}
                >
                  {t("countryPage.visa.noMinimum")}
                </span>
              )}
              {visa.incomeRequirement.notes && (
                <p
                  style={{
                    fontFamily: "Geist, sans-serif",
                    fontSize: "11px",
                    color: "#666666",
                    marginTop: "4px",
                  }}
                >
                  {visa.incomeRequirement.notes}
                </p>
              )}
            </div>

            {/* Tax */}
            <div
              style={{
                backgroundColor: "#111111",
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "8px",
                }}
              >
                <Shield size={14} color="#888888" />
                <span
                  style={{
                    fontFamily: "Geist, sans-serif",
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "1.2px",
                    textTransform: "uppercase",
                    color: "#666666",
                  }}
                >
                  {t("countryPage.visa.tax")}
                </span>
              </div>
              <span
                className="inline-flex items-center px-2 py-1 rounded-full"
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "13px",
                  fontWeight: 600,
                  backgroundColor: taxColors.bg,
                  color: taxColors.text,
                }}
              >
                {visa.tax.status === "exempt"
                  ? t("countryPage.visa.taxExempt")
                  : visa.tax.rate != null
                    ? `${visa.tax.rate}%`
                    : t("countryPage.visa.taxSpecial")}
              </span>
              {visa.tax.notes && (
                <p
                  style={{
                    fontFamily: "Geist, sans-serif",
                    fontSize: "11px",
                    color: "#666666",
                    marginTop: "4px",
                  }}
                >
                  {visa.tax.notes}
                </p>
              )}
            </div>
          </div>

          {/* Official Link */}
          <a
            href={visa.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--color-accent)",
              textDecoration: "none",
            }}
          >
            {t("countryPage.visa.officialWebsite")} <ExternalLink size={14} />
          </a>
        </div>

        {/* Benefits */}
        <div style={{ padding: "24px", borderTop: "1px solid #2A2A2A" }}>
          <h3
            style={{
              fontFamily: "Geist, sans-serif",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "#666666",
              marginBottom: "12px",
            }}
          >
            {t("countryPage.visa.benefits")}
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {visa.benefits.map((b, i) => (
              <span
                key={i}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  backgroundColor: "#1A1A1A",
                  border: "1px solid #2A2A2A",
                  fontFamily: "Geist, sans-serif",
                  fontSize: "12px",
                  color: "#CCCCCC",
                }}
              >
                <CheckCircle2 size={12} color="#44CC66" />
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Eligibility */}
        <div style={{ padding: "24px", borderTop: "1px solid #2A2A2A" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <Briefcase size={14} color="#888888" />
            <h3
              style={{
                fontFamily: "Geist, sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "#666666",
              }}
            >
              {t("countryPage.visa.eligibility")}
            </h3>
          </div>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {visa.eligibility.requirements.map((req, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  fontFamily: "Geist, sans-serif",
                  fontSize: "13px",
                  color: "#BBBBBB",
                  lineHeight: 1.5,
                }}
              >
                <span
                  style={{
                    color: "var(--color-accent)",
                    marginTop: "2px",
                    flexShrink: 0,
                  }}
                >
                  •
                </span>
                {req}
              </li>
            ))}
          </ul>
        </div>

        {/* Application Process */}
        <div style={{ padding: "24px", borderTop: "1px solid #2A2A2A" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <FileText size={14} color="#888888" />
            <h3
              style={{
                fontFamily: "Geist, sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "#666666",
              }}
            >
              {t("countryPage.visa.applicationProcess")}
            </h3>
          </div>
          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Calendar size={14} color="#888888" />
              <span
                style={{
                  fontFamily: "Geist, sans-serif",
                  fontSize: "13px",
                  color: "#BBBBBB",
                }}
              >
                {visa.applicationProcess.processingTime}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Globe size={14} color="#888888" />
              <span
                style={{
                  fontFamily: "Geist, sans-serif",
                  fontSize: "13px",
                  color: "#BBBBBB",
                }}
              >
                {visa.applicationProcess.online
                  ? t("countryPage.visa.onlineApplication")
                  : t("countryPage.visa.inPersonApplication")}
              </span>
            </div>
          </div>

          <h4
            style={{
              fontFamily: "Geist, sans-serif",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "#555555",
              marginBottom: "8px",
            }}
          >
            {t("countryPage.visa.requiredDocuments")}
          </h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {visa.applicationProcess.documents.map((doc, i) => (
              <span
                key={i}
                style={{
                  padding: "4px 10px",
                  borderRadius: "4px",
                  backgroundColor: "#1E1E1E",
                  fontFamily: "Geist, sans-serif",
                  fontSize: "12px",
                  color: "#999999",
                }}
              >
                {doc}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function CountryPage() {
  const { code } = useParams<{ code: string }>();
  const { t } = useTranslation();
  const langPrefix = useLangPrefix();
  const { countries, loading, error } = useCountries();
  const { weights } = useWeightState();

  const ranked = useScoring(
    countries,
    weights,
    new Set(),
    false,
    false,
    null,
    DEFAULT_CLIMATE,
  );

  const match = useMemo(() => {
    if (!code) return null;
    return (
      ranked.find((r) => r.country.code.toLowerCase() === code.toLowerCase()) ??
      null
    );
  }, [ranked, code]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0D0E10",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: "Geist, sans-serif",
            fontSize: "14px",
            color: "#666666",
          }}
        >
          {t("countryList.loading", "Loading…")}
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0D0E10",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
        }}
      >
        <p
          style={{
            fontFamily: "Geist, sans-serif",
            fontSize: "16px",
            color: "#999999",
          }}
        >
          {error ?? t("countryPage.notFound", "Country not found")}
        </p>
        <Link
          to={`${langPrefix}/`}
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--color-accent)",
            textDecoration: "none",
          }}
        >
          ← {t("countryPage.backToList", "Back to list")}
        </Link>
      </div>
    );
  }

  const { country: c, finalScore, rank } = match;
  const visa = c.nomadVisa;
  const seasonBadge = c.climateData
    ? SEASON_BADGE[c.climateData.seasonType]
    : null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D0E10" }}>
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          backgroundColor: "#0D0E10",
          borderBottom: "1px solid #252525",
        }}
      >
        <div
          className="max-w-4xl mx-auto px-4 sm:px-6"
          style={{
            height: "56px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <Link
            to={`${langPrefix}/`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "Geist, sans-serif",
              fontSize: "13px",
              color: "#888888",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={16} />
            {t("countryPage.backToList", "Back to list")}
          </Link>
        </div>
      </header>

      <main
        className="max-w-4xl mx-auto px-4 sm:px-6 pb-16"
        style={{ paddingTop: "32px" }}
      >
        {/* Country Hero */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "20px",
            marginBottom: "24px",
          }}
        >
          <img
            src={c.flagUrl}
            alt={`${c.name} flag`}
            style={{
              width: "64px",
              height: "44px",
              borderRadius: "6px",
              objectFit: "cover",
              border: "1px solid #333333",
              marginTop: "4px",
            }}
          />
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontFamily: "Anton, sans-serif",
                fontSize: "36px",
                fontWeight: 400,
                color: "#FFFFFF",
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              {c.name}
            </h1>
            <p
              style={{
                fontFamily: "Geist, sans-serif",
                fontSize: "14px",
                color: "#888888",
                marginTop: "4px",
              }}
            >
              {c.region} · {c.capital} · {(c.population / 1_000_000).toFixed(1)}
              M
            </p>
          </div>
        </div>

        {/* Score + Rank Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            backgroundColor: "#141416",
            borderRadius: "10px",
            border: "1px solid #1E1E20",
            overflow: "hidden",
            marginBottom: "8px",
          }}
        >
          <div style={{ flex: 1, padding: "20px 24px" }}>
            <span
              style={{
                fontFamily: "Geist, sans-serif",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "#666666",
              }}
            >
              {t("countryDetail.rank")}
            </span>
            <div
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "32px",
                fontWeight: 600,
                color: "var(--color-accent)",
                lineHeight: 1,
                marginTop: "4px",
              }}
            >
              #{rank}
            </div>
          </div>
          <div style={{ width: "1px", backgroundColor: "#2A2A2A" }} />
          <div style={{ flex: 1, padding: "20px 24px" }}>
            <span
              style={{
                fontFamily: "Geist, sans-serif",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "#666666",
              }}
            >
              {t("countryDetail.compositeScore")}
            </span>
            <div
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "32px",
                fontWeight: 600,
                color: scoreColour(finalScore),
                lineHeight: 1,
                marginTop: "4px",
              }}
            >
              {finalScore.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "32px",
          }}
        >
          {c.hasNomadVisa && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 12px",
                borderRadius: "20px",
                backgroundColor: "var(--color-accent)",
                fontFamily: "Geist, sans-serif",
                fontSize: "12px",
                fontWeight: 500,
                color: "#FFFFFF",
              }}
            >
              <Plane size={13} /> {t("countryDetail.nomadVisa")}
            </span>
          )}
          {c.isSchengen && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "4px 12px",
                borderRadius: "20px",
                backgroundColor: "#1A3A5C",
                fontFamily: "Geist, sans-serif",
                fontSize: "12px",
                fontWeight: 500,
                color: "#60A5FA",
              }}
            >
              {t("countryPage.schengen", "Schengen Area")}
            </span>
          )}
          {c.touristVisaDays != null && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "4px 12px",
                borderRadius: "20px",
                backgroundColor: "#2A2A2A",
                fontFamily: "Geist, sans-serif",
                fontSize: "12px",
                fontWeight: 500,
                color: "#AAAAAA",
              }}
            >
              {c.touristVisaDays}{" "}
              {t("countryPage.touristDays", "days tourist visa")}
            </span>
          )}
          {seasonBadge && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "4px 12px",
                borderRadius: "20px",
                backgroundColor: seasonBadge.bg,
                fontFamily: "Geist, sans-serif",
                fontSize: "12px",
                fontWeight: 500,
                color: seasonBadge.text,
              }}
            >
              {seasonBadge.label}
            </span>
          )}
        </div>

        {/* Nomad Visa Section — THE SHOWCASE */}
        {visa && <VisaSection visa={visa} />}

        {/* Score Breakdown */}
        <section style={{ marginTop: "32px" }}>
          <h2
            style={{
              fontFamily: "Geist, sans-serif",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "#666666",
              marginBottom: "16px",
            }}
          >
            {t("countryDetail.scoreBreakdown")}
          </h2>
          <div
            style={{
              backgroundColor: "#141416",
              borderRadius: "10px",
              border: "1px solid #1E1E20",
              padding: "20px 24px",
            }}
          >
            <ScoreBreakdown country={c} />
          </div>
        </section>
      </main>
    </div>
  );
}

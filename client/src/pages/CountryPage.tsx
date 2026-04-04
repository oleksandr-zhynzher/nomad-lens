import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import {
  Activity,
  ArrowLeft,
  BookOpen,
  Briefcase,
  Building,
  Building2,
  Calendar,
  Check,
  CloudSun,
  CreditCard,
  Droplets,
  ExternalLink,
  FileText,
  Globe,
  Heart,
  Key,
  Leaf,
  MapPin,
  MessageCircle,
  Plane,
  RefreshCw,
  Rocket,
  Shield,
  Smile,
  Snowflake,
  Sun,
  Tag,
  Thermometer,
  Timer,
  TrendingUp,
  Truck,
  User,
  Users,
  Utensils,
  Wifi,
} from "lucide-react";
import { useCountries } from "../hooks/useCountries";
import { useWeightState } from "../hooks/useWeightState";
import { useScoring } from "../hooks/useScoring";
import { useLangPrefix } from "../hooks/useLangPrefix";
import { useTranslation } from "react-i18next";
import type { NomadVisaDetails, NomadVisaLocalization } from "../utils/types";
import {
  VISIBLE_CATEGORY_KEYS,
  CATEGORY_LABELS,
  type CategoryKey,
  type ClimatePreferences,
} from "../utils/types";
import { useLocalizedCountry, regionKey } from "../utils/localize";

type LucideIcon = React.ComponentType<{
  size?: number;
  color?: string;
  className?: string;
}>;

const DEFAULT_CLIMATE: ClimatePreferences = {
  seasonType: "any",
  minTemp: -10,
  maxTemp: 45,
};

type SeasonLabelKey =
  | "four_seasons"
  | "mild_seasons"
  | "tropical"
  | "arid"
  | "polar";

interface CategoryStyleEntry {
  icon: LucideIcon;
  color: string;
  iconBg: string;
}

const CATEGORY_STYLE: Record<CategoryKey, CategoryStyleEntry> = {
  economy: { icon: TrendingUp, color: "#7A9B6B", iconBg: "#0F1F0F" },
  affordability: { icon: Tag, color: "#C2956A", iconBg: "#211408" },
  foodSecurity: { icon: Utensils, color: "#7A9B6B", iconBg: "#0F1F0F" },
  healthcare: { icon: Activity, color: "#7A9B6B", iconBg: "#0F1F0F" },
  education: { icon: BookOpen, color: "#7A9B6B", iconBg: "#0F1F0F" },
  environment: { icon: Leaf, color: "#C2956A", iconBg: "#211408" },
  climate: { icon: Thermometer, color: "#C2956A", iconBg: "#211408" },
  safety: { icon: Shield, color: "#7A9B6B", iconBg: "#0F1F0F" },
  infrastructure: { icon: Wifi, color: "#7A9B6B", iconBg: "#0F1F0F" },
  happiness: { icon: Smile, color: "#C2956A", iconBg: "#211408" },
  humanDevelopment: { icon: Users, color: "#7A9B6B", iconBg: "#0F1F0F" },
  governance: { icon: Building2, color: "#7A9B6B", iconBg: "#0F1F0F" },
  englishProficiency: {
    icon: MessageCircle,
    color: "#C2956A",
    iconBg: "#211408",
  },
  digitalFreedom: { icon: Globe, color: "#7A9B6B", iconBg: "#0F1F0F" },
  personalFreedom: { icon: Key, color: "#7A9B6B", iconBg: "#0F1F0F" },
  logistics: { icon: Truck, color: "#7A9B6B", iconBg: "#0F1F0F" },
  biodiversity: { icon: Leaf, color: "#7A9B6B", iconBg: "#0F1F0F" },
  socialTolerance: { icon: Heart, color: "#7A9B6B", iconBg: "#0F1F0F" },
  taxFriendliness: { icon: Tag, color: "#8F5A3C", iconBg: "#2A1208" },
  startupEnvironment: { icon: Rocket, color: "#7A9B6B", iconBg: "#0F1F0F" },
  airConnectivity: { icon: Plane, color: "#7A9B6B", iconBg: "#0F1F0F" },
  culturalHeritage: { icon: Globe, color: "#C2956A", iconBg: "#211408" },
  healthcareCost: { icon: Activity, color: "#C2956A", iconBg: "#211408" },
};

const CARD_LABELS: Partial<Record<CategoryKey, string>> = {
  infrastructure: "Internet",
  humanDevelopment: "Human Dev",
  englishProficiency: "English Prof",
  startupEnvironment: "Startup Env",
};

function getScoreBadgeKey(value: number | null): string {
  if (value === null) return "N/A";
  if (value >= 85) return "excellent";
  if (value >= 70) return "good";
  if (value >= 55) return "fair";
  return "weak";
}

export function CountryPage() {
  const { t, i18n: i18nInstance } = useTranslation();
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const langPrefix = useLangPrefix();
  const { countries, loading, error } = useCountries();
  const { weights } = useWeightState();

  // Helper: pick the localised string array/value for the active language,
  // falling back to the English default when a translation is missing.
  function localize<T>(
    defaultValue: T,
    visa: NomadVisaDetails,
    pick: (loc: NomadVisaLocalization) => T | undefined,
  ): T {
    const lang = i18nInstance.language as "ru" | "ua" | string;
    if (lang === "ru" || lang === "ua") {
      const loc = visa.i18n?.[lang as "ru" | "ua"];
      if (loc) {
        const translated = pick(loc);
        if (translated !== undefined) return translated;
      }
    }
    return defaultValue;
  }

  const ranked = useScoring(
    countries,
    weights,
    new Set(),
    false,
    false,
    null,
    DEFAULT_CLIMATE,
  );

  const { c, rank, finalScore } = useMemo(() => {
    const entry = ranked.find(
      (r) => r.country.code.toLowerCase() === code?.toLowerCase(),
    );
    if (!entry) return { c: null, rank: null, finalScore: null };
    return { c: entry.country, rank: entry.rank, finalScore: entry.finalScore };
  }, [ranked, code]);

  const visa = c?.nomadVisa ?? null;
  const locC = useLocalizedCountry(c);

  if (loading) {
    return (
      <Layout>
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "Geist, sans-serif",
              fontSize: "14px",
              color: "#666666",
            }}
          >
            {t("loading")}
          </span>
        </div>
      </Layout>
    );
  }

  if (error || !c) {
    return (
      <Layout>
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <span
            style={{
              fontFamily: "Geist, sans-serif",
              fontSize: "14px",
              color: "#999999",
            }}
          >
            {error ?? t("countryPage.notFound")}
          </span>
          <Link
            to={`${langPrefix}/`}
            style={{
              fontFamily: "Geist, sans-serif",
              fontSize: "13px",
              color: "#C2956A",
              textDecoration: "none",
            }}
          >
            {t("countryPage.backToCountries")}
          </Link>
        </div>
      </Layout>
    );
  }

  const seasonLabel = c.climateData
    ? t(
        `countryPage.seasonLabels.${c.climateData.seasonType as SeasonLabelKey}`,
      )
    : null;

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  };

  return (
    <Layout>
      <div style={{ backgroundColor: "#0D0D0F", minHeight: "100vh" }}>
        {/* ── heroBanner ── */}
        <div
          style={{
            minHeight: "280px",
            position: "relative",
            overflow: "hidden",
            backgroundColor: "#0A0D12",
            backgroundImage: "url('/hero-map.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(13,13,15,0.92) 70%, #0D0D0F 100%)",
            }}
          />

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            style={{
              position: "absolute",
              top: "20px",
              left: "32px",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(17,17,17,0.75)",
              border: "1px solid #2A2A2A",
              borderRadius: "8px",
              padding: "7px 14px",
              cursor: "pointer",
              color: "#AAAAAA",
              fontFamily: "Geist, sans-serif",
              fontSize: "13px",
              backdropFilter: "blur(8px)",
            }}
          >
            <ArrowLeft size={15} color="#AAAAAA" />
            {t("countryPage.back")}
          </button>

          {/* Bottom content: flag + name + badges */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: "32px 64px",
              gap: "16px",
            }}
          >
            {/* Flag + name row */}
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <div
                style={{
                  width: "100px",
                  height: "67px",
                  borderRadius: "6px",
                  overflow: "hidden",
                  flexShrink: 0,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                }}
              >
                <img
                  src={c.flagUrl}
                  alt={`${locC.name} flag`}
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <span
                  style={{
                    fontFamily: "Geist, sans-serif",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "2px",
                    color: "#8F5A3C",
                    textTransform: "uppercase",
                  }}
                >
                  {t("countryPage.countryDetailLabel")}
                </span>
                <h1
                  style={{
                    fontFamily: "Anton, sans-serif",
                    fontSize: "64px",
                    fontWeight: 400,
                    color: "#E8E9EB",
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {locC.name}
                </h1>
              </div>
              <div style={{ flex: 1 }} />
              <div
                style={{
                  backgroundColor: "rgba(26,26,26,0.8)",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  alignSelf: "flex-end",
                }}
              >
                <span
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "14px",
                    color: "#555555",
                  }}
                >
                  {c.code}
                </span>
              </div>
            </div>

            {/* Badges row */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {c.hasNomadVisa && (
                <div
                  style={{
                    backgroundColor: "rgba(26,26,10,0.85)",
                    border: "1px solid #2A2810",
                    borderRadius: "20px",
                    padding: "6px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <Plane size={13} color="#8F5A3C" />
                  <span
                    style={{
                      fontFamily: "Geist, sans-serif",
                      fontSize: "12px",
                      color: "#C2956A",
                    }}
                  >
                    {t("countryPage.nomadVisaBadge")}
                  </span>
                </div>
              )}
              {c.isSchengen && (
                <div
                  style={{
                    backgroundColor: "rgba(10,18,24,0.85)",
                    border: "1px solid #0A2030",
                    borderRadius: "20px",
                    padding: "6px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <Globe size={13} color="#5B8FA8" />
                  <span
                    style={{
                      fontFamily: "Geist, sans-serif",
                      fontSize: "12px",
                      color: "#7BACC8",
                    }}
                  >
                    {t("countryPage.schengen")}
                  </span>
                </div>
              )}
              {c.touristVisaDays != null && (
                <div
                  style={{
                    backgroundColor: "rgba(26,20,16,0.85)",
                    border: "1px solid #2A2010",
                    borderRadius: "20px",
                    padding: "6px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <Calendar size={13} color="#C2956A" />
                  <span
                    style={{
                      fontFamily: "Geist, sans-serif",
                      fontSize: "12px",
                      color: "#C2956A",
                    }}
                  >
                    {t("countryPage.touristVisaBadge", {
                      days: c.touristVisaDays,
                    })}
                  </span>
                </div>
              )}
              {c.climateData && (
                <div
                  style={{
                    backgroundColor: "rgba(16,22,16,0.85)",
                    border: "1px solid #142014",
                    borderRadius: "20px",
                    padding: "6px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <CloudSun size={13} color="#7A9B6B" />
                  <span
                    style={{
                      fontFamily: "Geist, sans-serif",
                      fontSize: "12px",
                      color: "#7A9B6B",
                    }}
                  >
                    {seasonLabel}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── statsRow ── */}
        <div
          style={{
            backgroundColor: "#0D0D0F",
            padding: "24px 64px",
            gap: "16px",
            display: "flex",
          }}
        >
          <div
            style={{
              backgroundColor: "#111111",
              borderRadius: "10px",
              border: "1px solid #1E1E1E",
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              flex: 1,
            }}
          >
            <TrendingUp size={16} color="#8F5A3C" />
            <div
              style={{ display: "flex", alignItems: "baseline", gap: "10px" }}
            >
              {finalScore != null && (
                <span
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "28px",
                    fontWeight: 700,
                    color: "#C2956A",
                  }}
                >
                  {finalScore.toFixed(1)}
                </span>
              )}
              <span
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#555555",
                }}
              >
                #{rank}
              </span>
            </div>
            <span
              style={{
                fontFamily: "Geist, sans-serif",
                fontSize: "10px",
                color: "#555555",
              }}
            >
              {t("countryPage.globalRankScore")}
            </span>
          </div>
          <div
            style={{
              backgroundColor: "#111111",
              borderRadius: "10px",
              border: "1px solid #1E1E1E",
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              flex: 1,
            }}
          >
            <Users size={16} color="#5B8FA8" />
            <span
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "28px",
                fontWeight: 700,
                color: "#E8E9EB",
              }}
            >
              {(c.population / 1_000_000).toFixed(1)}M
            </span>
            <span
              style={{
                fontFamily: "Geist, sans-serif",
                fontSize: "10px",
                color: "#555555",
              }}
            >
              {t("countryPage.population")}
            </span>
          </div>
          <div
            style={{
              backgroundColor: "#111111",
              borderRadius: "10px",
              border: "1px solid #1E1E1E",
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              flex: 1,
            }}
          >
            <Building size={16} color="#7A9B6B" />
            <span
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "20px",
                fontWeight: 700,
                color: "#E8E9EB",
              }}
            >
              {locC.capital}
            </span>
            <span
              style={{
                fontFamily: "Geist, sans-serif",
                fontSize: "10px",
                color: "#555555",
              }}
            >
              {t("countryPage.capital")}
            </span>
          </div>
          <div
            style={{
              backgroundColor: "#111111",
              borderRadius: "10px",
              border: "1px solid #1E1E1E",
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              flex: 1,
            }}
          >
            <MapPin size={16} color="#C2956A" />
            <span
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "20px",
                fontWeight: 700,
                color: "#E8E9EB",
              }}
            >
              {t(`regions.${regionKey(c.region)}`)}
            </span>
            <span
              style={{
                fontFamily: "Geist, sans-serif",
                fontSize: "10px",
                color: "#555555",
              }}
            >
              {t("countryPage.region")}
            </span>
          </div>
        </div>

        {/* ── visa-section ── */}
        {visa && (
          <div
            style={{
              backgroundColor: "#0D0D0F",
              padding: "48px 64px",
              gap: "32px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <h2
                style={{
                  fontFamily: "Anton, sans-serif",
                  fontSize: "32px",
                  fontWeight: 400,
                  color: "#E8E9EB",
                  margin: 0,
                }}
              >
                {t("countryPage.nomadVisaSection")}
              </h2>
              <div style={{ flex: 1 }} />
              <div
                style={{
                  backgroundColor: "#1A1A0A",
                  borderRadius: "20px",
                  padding: "6px 16px",
                }}
              >
                <span
                  style={{
                    fontFamily: "Geist, sans-serif",
                    fontSize: "12px",
                    color: "#C2956A",
                  }}
                >
                  {visa.visaName}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "Geist, sans-serif",
                  fontSize: "10px",
                  color: "#444444",
                }}
              >
                {t("countryPage.updated", { date: visa.lastUpdated })}
              </span>
            </div>

            <div style={{ display: "flex", gap: "24px" }}>
              {/* Left column – 440px */}
              <div
                style={{
                  width: "440px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  flexShrink: 0,
                }}
              >
                {/* Duration & Cost */}
                <div
                  style={{
                    backgroundColor: "#111111",
                    borderRadius: "12px",
                    border: "1px solid #1E1E1E",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Geist, sans-serif",
                      fontSize: "10px",
                      color: "#555555",
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                    }}
                  >
                    {t("countryPage.durationCost")}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <Calendar size={16} color="#8F5A3C" />
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        color: "#E8E9EB",
                      }}
                    >
                      {t("countryPage.monthsInitial", {
                        count: visa.duration.initial,
                      })}
                    </span>
                    <div style={{ flex: 1 }} />
                    {visa.duration.maxExtension > 0 && (
                      <span
                        style={{
                          fontFamily: "Geist, sans-serif",
                          fontSize: "11px",
                          color: "#C2956A",
                        }}
                      >
                        {t("countryPage.moExtension", {
                          count: visa.duration.maxExtension,
                        })}
                      </span>
                    )}
                  </div>
                  {visa.duration.renewable && (
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <RefreshCw size={16} color="#6B9E6B" />
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "14px",
                          color: "#6B9E6B",
                        }}
                      >
                        {t("countryPage.renewable")}
                      </span>
                    </div>
                  )}
                  <div style={{ height: "1px", backgroundColor: "#1E1E1E" }} />
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <CreditCard size={16} color="#8F5A3C" />
                    <span
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: "22px",
                        fontWeight: 700,
                        color: visa.cost.amount === 0 ? "#44CC66" : "#E8E9EB",
                      }}
                    >
                      {visa.cost.amount === 0
                        ? t("countryPage.free")
                        : `${visa.cost.currency} ${visa.cost.amount.toLocaleString()}`}
                    </span>
                    <span
                      style={{
                        fontFamily: "Geist, sans-serif",
                        fontSize: "11px",
                        color: "#666666",
                      }}
                    >
                      {t("countryPage.applicationFee")}
                    </span>
                  </div>
                  <div
                    style={{
                      backgroundColor: "#0A0A0A",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Geist, sans-serif",
                        fontSize: "9px",
                        color: "#444444",
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                      }}
                    >
                      {t("countryPage.incomeRequirement")}
                    </span>
                    {visa.incomeRequirement.monthly != null ? (
                      <>
                        <span
                          style={{
                            fontFamily: "IBM Plex Mono, monospace",
                            fontSize: "18px",
                            fontWeight: 700,
                            color: "#C2956A",
                          }}
                        >
                          {visa.incomeRequirement.currency}{" "}
                          {visa.incomeRequirement.monthly.toLocaleString()}{" "}
                          {t("countryPage.perMonth")}
                        </span>
                        <span
                          style={{
                            fontFamily: "Geist, sans-serif",
                            fontSize: "11px",
                            color: "#666666",
                          }}
                        >
                          {visa.incomeRequirement.currency}{" "}
                          {(
                            visa.incomeRequirement.monthly * 12
                          ).toLocaleString()}{" "}
                          {t("countryPage.perYear")}
                        </span>
                      </>
                    ) : visa.incomeRequirement.annual != null ? (
                      <span
                        style={{
                          fontFamily: "IBM Plex Mono, monospace",
                          fontSize: "18px",
                          fontWeight: 700,
                          color: "#C2956A",
                        }}
                      >
                        {visa.incomeRequirement.currency}{" "}
                        {visa.incomeRequirement.annual.toLocaleString()}{" "}
                        {t("countryPage.perYear")}
                      </span>
                    ) : (
                      <span
                        style={{
                          fontFamily: "IBM Plex Mono, monospace",
                          fontSize: "18px",
                          fontWeight: 700,
                          color: "#44CC66",
                        }}
                      >
                        {t("countryPage.visa.noMinimum")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Taxation */}
                <div
                  style={{
                    backgroundColor: "#111111",
                    borderRadius: "12px",
                    border: "1px solid #1E1E1E",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Geist, sans-serif",
                      fontSize: "10px",
                      color: "#555555",
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                    }}
                  >
                    {t("countryPage.taxation")}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      gap: "4px",
                      alignItems: "center",
                      backgroundColor:
                        visa.tax.status === "exempt"
                          ? "#0A2010"
                          : visa.tax.status === "special"
                            ? "#1A0A1A"
                            : "#1A1A0A",
                      borderRadius: "8px",
                      padding: "10px 16px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Geist, sans-serif",
                        fontSize: "13px",
                        fontWeight: 600,
                        color:
                          visa.tax.status === "exempt"
                            ? "#44CC66"
                            : visa.tax.status === "special"
                              ? "#9B8FB4"
                              : "#C2956A",
                      }}
                    >
                      {visa.tax.status === "exempt"
                        ? t("countryPage.taxExemptLabel")
                        : visa.tax.status === "special"
                          ? t("countryPage.specialTaxLabel")
                          : t("countryPage.standardTaxLabel")}
                    </span>
                    {visa.tax.rate != null && visa.tax.status !== "exempt" && (
                      <span
                        style={{
                          fontFamily: "IBM Plex Mono, monospace",
                          fontSize: "13px",
                          color: "#666666",
                        }}
                      >
                        {" · "}
                        {visa.tax.rate}%
                      </span>
                    )}
                  </div>
                  {visa.tax.notes && (
                    <p
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "12px",
                        color: "#555555",
                        margin: 0,
                      }}
                    >
                      {localize(visa.tax.notes, visa, (l) => l.tax?.notes)}
                    </p>
                  )}
                </div>

                {/* Eligibility */}
                <div
                  style={{
                    backgroundColor: "#111111",
                    borderRadius: "12px",
                    border: "1px solid #1E1E1E",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Geist, sans-serif",
                      fontSize: "10px",
                      color: "#555555",
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                    }}
                  >
                    {t("countryPage.eligibilitySection")}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <User size={14} color="#555555" />
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "13px",
                        color: "#777777",
                      }}
                    >
                      {t("countryPage.minimumAge", {
                        age: visa.eligibility.minAge,
                      })}
                    </span>
                  </div>
                  {localize(
                    visa.eligibility.requirements,
                    visa,
                    (l) => l.eligibility?.requirements,
                  ).map((req, i) => (
                    <div
                      key={i}
                      style={{ display: "flex", gap: "8px", paddingTop: "4px" }}
                    >
                      <Check
                        size={13}
                        color="#6B9E6B"
                        style={
                          {
                            flexShrink: 0,
                            marginTop: "2px",
                          } as React.CSSProperties
                        }
                      />
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "12px",
                          color: "#888888",
                          flex: 1,
                        }}
                      >
                        {req}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right column – flex fill */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  minWidth: 0,
                }}
              >
                {/* Visa Benefits */}
                <div
                  style={{
                    backgroundColor: "#111111",
                    borderRadius: "12px",
                    border: "1px solid #1E1E1E",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Geist, sans-serif",
                      fontSize: "10px",
                      color: "#555555",
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                    }}
                  >
                    {t("countryPage.visaBenefits")}
                  </span>
                  {localize(visa.benefits, visa, (l) => l.benefits).map(
                    (benefit, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                          backgroundColor: "#0A0A0A",
                          borderRadius: "8px",
                          padding: "10px 12px",
                        }}
                      >
                        <Briefcase size={16} color="#8F5A3C" />
                        <span
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "13px",
                            color: "#CCCCCC",
                          }}
                        >
                          {benefit}
                        </span>
                      </div>
                    ),
                  )}
                </div>

                {/* Application Process */}
                <div
                  style={{
                    backgroundColor: "#111111",
                    borderRadius: "12px",
                    border: "1px solid #1E1E1E",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Geist, sans-serif",
                      fontSize: "10px",
                      color: "#555555",
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                    }}
                  >
                    {t("countryPage.applicationProcessSection")}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <Building2 size={16} color="#C2956A" />
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        color: "#E8E9EB",
                      }}
                    >
                      {visa.applicationProcess.online
                        ? t("countryPage.onlineApplication")
                        : t("countryPage.inPersonApplication")}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <Timer size={16} color="#8F5A3C" />
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "13px",
                        color: "#888888",
                      }}
                    >
                      {t("countryPage.processing", {
                        time: localize(
                          visa.applicationProcess.processingTime,
                          visa,
                          (l) => l.applicationProcess?.processingTime,
                        ),
                      })}
                    </span>
                  </div>
                  <div style={{ height: "1px", backgroundColor: "#1E1E1E" }} />
                  <span
                    style={{
                      fontFamily: "Geist, sans-serif",
                      fontSize: "9px",
                      color: "#444444",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                    }}
                  >
                    {t("countryPage.requiredDocsSection")}
                  </span>
                  {localize(
                    visa.applicationProcess.documents,
                    visa,
                    (l) => l.applicationProcess?.documents,
                  ).map((doc, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <FileText size={13} color="#555555" />
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "12px",
                          color: "#777777",
                        }}
                      >
                        {doc}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Official Link */}
                <a
                  href={visa.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: "#1A1410",
                    borderRadius: "12px",
                    border: "1px solid #2A2018",
                    display: "flex",
                    gap: "12px",
                    padding: "20px",
                    alignItems: "center",
                    textDecoration: "none",
                  }}
                >
                  <ExternalLink size={18} color="#8F5A3C" />
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      color: "#C2956A",
                    }}
                  >
                    {t("countryPage.officialVisaWebsite")}
                  </span>
                  <div style={{ flex: 1 }} />
                  <span
                    style={{
                      fontFamily: "Geist, sans-serif",
                      fontSize: "11px",
                      color: "#555555",
                    }}
                  >
                    {getHostname(visa.officialUrl)}
                  </span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ── scores-section + climate ── */}
        <div
          style={{
            backgroundColor: "#0D0D0F",
            padding: "48px 64px",
            gap: "32px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <h2
              style={{
                fontFamily: "Anton, sans-serif",
                fontSize: "32px",
                fontWeight: 400,
                color: "#E8E9EB",
                margin: 0,
              }}
            >
              {t("countryPage.performanceBreakdown")}
            </h2>
            <span
              style={{
                flex: 1,
                textAlign: "right",
                fontFamily: "Geist, sans-serif",
                fontSize: "12px",
                color: "#444444",
              }}
            >
              {t("countryPage.categoriesSubtitle", {
                count: VISIBLE_CATEGORY_KEYS.length,
                name: locC.name,
              })}
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
            }}
          >
            {VISIBLE_CATEGORY_KEYS.map((key) => {
              const catStyle = CATEGORY_STYLE[key];
              const IconComp = catStyle.icon;
              const scoreValue = c.scores[key]?.value ?? null;
              const label = CARD_LABELS[key]
                ? t(`countryPage.cardLabels.${key}`, CARD_LABELS[key])
                : t(
                    `indicatorsPage.indicators.${key}.name`,
                    CATEGORY_LABELS[key],
                  );
              const badgeKey = getScoreBadgeKey(scoreValue);
              const badge =
                badgeKey === "N/A"
                  ? "N/A"
                  : t(`countryPage.scoreBadge.${badgeKey}`).toUpperCase();
              return (
                <div
                  key={key}
                  style={{
                    backgroundColor: "#111111",
                    borderRadius: "12px",
                    border: "1px solid #1E1E1E",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        backgroundColor: catStyle.iconBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <IconComp size={16} color={catStyle.color} />
                    </div>
                    <span
                      style={{
                        fontFamily: "Geist, sans-serif",
                        fontSize: "11px",
                        color: "#777777",
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label}
                    </span>
                    <div
                      style={{
                        backgroundColor: catStyle.iconBg,
                        borderRadius: "4px",
                        padding: "3px 8px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Geist, sans-serif",
                          fontSize: "9px",
                          color: catStyle.color,
                          letterSpacing: "1.5px",
                        }}
                      >
                        {badge}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      alignItems: "flex-end",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: "40px",
                        fontWeight: 700,
                        color: catStyle.color,
                        lineHeight: 1,
                      }}
                    >
                      {scoreValue !== null ? Math.round(scoreValue) : "–"}
                    </span>
                    <span
                      style={{
                        fontFamily: "Geist, sans-serif",
                        fontSize: "14px",
                        color: "#444444",
                        paddingBottom: "4px",
                      }}
                    >
                      /100
                    </span>
                  </div>

                  <div
                    style={{
                      height: "6px",
                      backgroundColor: "#1E1E1E",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${scoreValue ?? 0}%`,
                        backgroundColor: catStyle.color,
                        height: "6px",
                        borderRadius: "3px",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Climate Data ── */}
          {c.climateData && (
            <>
              <div style={{ height: "1px", backgroundColor: "#1E1E1E" }} />
              <div
                style={{
                  backgroundColor: "#0A0A0A",
                  padding: "48px 64px",
                  gap: "24px",
                  display: "flex",
                  flexDirection: "column",
                  margin: "0 -64px",
                }}
              >
                <div
                  style={{ display: "flex", gap: "12px", alignItems: "center" }}
                >
                  <Thermometer size={20} color="#5B8FA8" />
                  <h2
                    style={{
                      fontFamily: "Anton, sans-serif",
                      fontSize: "32px",
                      fontWeight: 400,
                      color: "#E8E9EB",
                      margin: 0,
                    }}
                  >
                    {t("countryPage.climateDataSection")}
                  </h2>
                  <span
                    style={{
                      flex: 1,
                      textAlign: "right",
                      fontFamily: "Geist, sans-serif",
                      fontSize: "12px",
                      color: "#444444",
                    }}
                  >
                    {seasonLabel} · {t("countryPage.annualAverages")}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "16px" }}>
                  <div
                    style={{
                      backgroundColor: "#111111",
                      borderRadius: "10px",
                      border: "1px solid #1E1E1E",
                      padding: "20px",
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <Thermometer size={16} color="#5B8FA8" />
                    <span
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: "28px",
                        fontWeight: 700,
                        color: "#E8E9EB",
                      }}
                    >
                      {c.climateData.annualMeanTemp.toFixed(1)}°C
                    </span>
                    <span
                      style={{
                        fontFamily: "Geist, sans-serif",
                        fontSize: "10px",
                        color: "#555555",
                      }}
                    >
                      {t("countryPage.annualMeanTemp")}
                    </span>
                  </div>
                  <div
                    style={{
                      backgroundColor: "#111111",
                      borderRadius: "10px",
                      border: "1px solid #1E1E1E",
                      padding: "20px",
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <Droplets size={16} color="#5B8FA8" />
                    <span
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: "28px",
                        fontWeight: 700,
                        color: "#E8E9EB",
                      }}
                    >
                      {Math.round(c.climateData.annualPrecipitation)}mm
                    </span>
                    <span
                      style={{
                        fontFamily: "Geist, sans-serif",
                        fontSize: "10px",
                        color: "#555555",
                      }}
                    >
                      {t("countryPage.annualPrecipitation")}
                    </span>
                  </div>
                  <div
                    style={{
                      backgroundColor: "#111111",
                      borderRadius: "10px",
                      border: "1px solid #1E1E1E",
                      padding: "20px",
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <Sun size={16} color="#C2956A" />
                    <span
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: "28px",
                        fontWeight: 700,
                        color: "#C2956A",
                      }}
                    >
                      {c.climateData.hottestMonth.toFixed(1)}°C
                    </span>
                    <span
                      style={{
                        fontFamily: "Geist, sans-serif",
                        fontSize: "10px",
                        color: "#555555",
                      }}
                    >
                      {t("countryPage.hottestMonth")}
                    </span>
                  </div>
                  <div
                    style={{
                      backgroundColor: "#111111",
                      borderRadius: "10px",
                      border: "1px solid #1E1E1E",
                      padding: "20px",
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <Snowflake size={16} color="#7BACC8" />
                    <span
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: "28px",
                        fontWeight: 700,
                        color: "#7BACC8",
                      }}
                    >
                      {c.climateData.coldestMonth.toFixed(1)}°C
                    </span>
                    <span
                      style={{
                        fontFamily: "Geist, sans-serif",
                        fontSize: "10px",
                        color: "#555555",
                      }}
                    >
                      {t("countryPage.coldestMonth")}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

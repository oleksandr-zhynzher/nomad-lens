import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { ScoreBreakdown } from "../components/ScoreBreakdown";
import {
  ArrowLeft,
  Briefcase,
  Building,
  Building2,
  Bus,
  Calendar,
  Check,
  CloudSun,
  CreditCard,
  Droplets,
  ExternalLink,
  FileText,
  Globe,
  Heart,
  Home,
  Laptop,
  MapPin,
  Plane,
  RefreshCw,
  ShoppingCart,
  Snowflake,
  Sun,
  Thermometer,
  Timer,
  TrendingUp,
  User,
  Users,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import { useCountries } from "../hooks/useCountries";
import { useWeightState } from "../hooks/useWeightState";
import { useScoring } from "../hooks/useScoring";
import { useLangPrefix } from "../hooks/useLangPrefix";
import { useTranslation } from "react-i18next";
import type { NomadVisaDetails, NomadVisaLocalization } from "../utils/types";
import { CATEGORY_LABELS, TOURISM_GROUPS, VISIBLE_CATEGORY_KEYS } from "../utils/types";
import { useLocalizedCountry, regionKey } from "../utils/localize";
import { computeTourismScore, tourismScoreColour } from "../utils/tourismScoring";
import { TOURISM_COLORS } from "../utils/tourismColors";

type SeasonLabelKey = "four_seasons" | "mild_seasons" | "tropical" | "arid" | "polar";

export function CountryPage() {
  const { t, i18n: i18nInstance } = useTranslation();
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const langPrefix = useLangPrefix();
  const { countries, loading, error } = useCountries();
  const { weights, climatePrefs } = useWeightState();

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

  const ranked = useScoring(countries, weights, new Set(), false, false, null, climatePrefs);

  const { c, rank, finalScore } = useMemo(() => {
    const entry = ranked.find((r) => r.country.code.toLowerCase() === code?.toLowerCase());
    if (!entry) return { c: null, rank: null, finalScore: null };
    return { c: entry.country, rank: entry.rank, finalScore: entry.finalScore };
  }, [ranked, code]);

  const visa = c?.nomadVisa ?? null;
  const locC = useLocalizedCountry(c);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <span className="text-sm text-dim">{t("loading")}</span>
        </div>
      </Layout>
    );
  }

  if (error || !c) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center flex-col gap-4">
          <span className="text-sm text-on-surface">{error ?? t("countryPage.notFound")}</span>
          <Link to={`${langPrefix}/`} className="text-[13px] text-[#C2956A] no-underline">
            {t("countryPage.backToCountries")}
          </Link>
        </div>
      </Layout>
    );
  }

  const seasonLabel = c.climateData
    ? t(`countryPage.seasonLabels.${c.climateData.seasonType as SeasonLabelKey}`)
    : null;

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  };

  const tourismScore = computeTourismScore(c);
  const tourismGroups = TOURISM_GROUPS.map((group) => ({
    labelKey: group.labelKey,
    metrics: group.keys
      .map((key) => ({ key, value: c.scores[key]?.value ?? null }))
      .filter(
        (metric): metric is { key: (typeof group.keys)[number]; value: number } =>
          metric.value != null,
      ),
  })).filter((group) => group.metrics.length > 0);
  const tourismMetricCount = tourismGroups.reduce(
    (count, group) => count + group.metrics.length,
    0,
  );
  const tourismTags = Array.from(new Set(c.tourismTags ?? [])).sort(
    (left, right) => (c.tourismTagScores?.[right] ?? 0) - (c.tourismTagScores?.[left] ?? 0),
  );

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.state?.idx > 0) {
      navigate(-1);
      return;
    }

    navigate(`${langPrefix}/`, { replace: true });
  };

  return (
    <Layout>
      <div className="bg-bg min-h-screen">
        {/* ── heroBanner ── */}
        <div
          className="min-h-[280px] relative overflow-hidden"
          style={{
            backgroundColor: "#0A0D12",
            backgroundImage: "url('/hero-map.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(13,13,15,0.92) 70%, #0D0D0F 100%)",
            }}
          />

          {/* Back button */}
          <button
            onClick={handleBack}
            className="absolute top-5 z-10 left-4 md:left-8 flex items-center gap-1.5 bg-[rgba(17,17,17,0.75)] border border-[#2A2A2A] rounded-lg py-[7px] px-[14px] cursor-pointer text-[#AAAAAA] text-[13px] backdrop-blur-[8px]"
          >
            <ArrowLeft size={15} color="#AAAAAA" />
            {t("countryPage.back")}
          </button>

          {/* Bottom content: flag + name + badges */}
          <div className="absolute inset-0 flex flex-col justify-end gap-4 px-4 pb-6 md:px-16 md:pb-8">
            {/* Flag + name row */}
            <div className="flex items-center gap-3 md:gap-6 flex-wrap">
              <div className="w-16 h-11 md:w-[100px] md:h-[67px] rounded-[6px] overflow-hidden shrink-0 shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
                <img
                  src={c.flagUrl}
                  alt={t("a11y.flagAlt", "{{country}} flag", {
                    country: locC.name,
                  })}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold tracking-[2px] text-[#8F5A3C] uppercase">
                  {t("countryPage.countryDetailLabel")}
                </span>
                <h1
                  className="text-2xl md:text-4xl font-bold text-[#E8E9EB] m-0 leading-none"
                  style={{ fontFamily: "Oswald, sans-serif" }}
                >
                  {locC.name}
                </h1>
              </div>
              <div className="hidden md:block flex-1" />
              <div className="hidden md:block bg-[rgba(26,26,26,0.8)] rounded-[6px] px-3 py-1.5 self-end">
                <span className="font-mono text-sm text-[#808080]">{c.code}</span>
              </div>
            </div>

            {/* Badges row */}
            <div className="flex gap-2.5 flex-wrap">
              {c.hasNomadVisa && (
                <div className="bg-[rgba(26,26,10,0.85)] border border-[#2A2810] rounded-[20px] py-1.5 px-[14px] flex items-center gap-1.5 backdrop-blur-[4px]">
                  <Plane size={13} color="#8F5A3C" />
                  <span className="text-xs text-[#C2956A]">{t("countryPage.nomadVisaBadge")}</span>
                </div>
              )}
              {c.isSchengen && (
                <div className="bg-[rgba(10,18,24,0.85)] border border-[#0A2030] rounded-[20px] py-1.5 px-[14px] flex items-center gap-1.5 backdrop-blur-[4px]">
                  <Globe size={13} color="#5B8FA8" />
                  <span className="text-xs text-[#7BACC8]">{t("countryPage.schengen")}</span>
                </div>
              )}
              {c.touristVisaDays != null && (
                <div className="bg-[rgba(26,20,16,0.85)] border border-[#2A2010] rounded-[20px] py-1.5 px-[14px] flex items-center gap-1.5 backdrop-blur-[4px]">
                  <Calendar size={13} color="#C2956A" />
                  <span className="text-xs text-[#C2956A]">
                    {t("countryPage.touristVisaBadge", {
                      count: c.touristVisaDays,
                    })}
                  </span>
                </div>
              )}
              {c.climateData && (
                <div className="bg-[rgba(16,22,16,0.85)] border border-[#142014] rounded-[20px] py-1.5 px-[14px] flex items-center gap-1.5 backdrop-blur-[4px]">
                  <CloudSun size={13} color="#7A9B6B" />
                  <span className="text-xs text-[#7A9B6B]">{seasonLabel}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── statsRow ── */}
        <div className="bg-bg py-6 grid grid-cols-2 gap-3 md:flex md:items-center">
          <div className="bg-[#111111] rounded-lg border border-[#1E1E1E] py-[14px] px-[18px] flex items-center justify-center gap-2.5 flex-1">
            <TrendingUp size={14} color="#8F5A3C" />
            <div className="flex items-baseline gap-2">
              {finalScore != null && (
                <span className="font-mono text-[22px] font-bold text-[#C2956A]">
                  {finalScore.toFixed(1)}
                </span>
              )}
              <span className="font-mono text-xs text-[#808080]">#{rank}</span>
            </div>
          </div>
          <div className="bg-[#111111] rounded-lg border border-[#1E1E1E] py-[14px] px-[18px] flex items-center justify-center gap-2.5 flex-1">
            <Users size={14} color="#5B8FA8" />
            <span className="font-mono text-[22px] font-bold text-[#E8E9EB]">
              {(c.population / 1_000_000).toFixed(1)}M
            </span>
          </div>
          <div className="bg-[#111111] rounded-lg border border-[#1E1E1E] py-[14px] px-[18px] flex items-center justify-center gap-2.5 flex-1">
            <Building size={14} color="#7A9B6B" />
            <span className="font-mono text-[18px] font-bold text-[#E8E9EB]">{locC.capital}</span>
          </div>
          <div className="bg-[#111111] rounded-lg border border-[#1E1E1E] py-[14px] px-[18px] flex items-center justify-center gap-2.5 flex-1">
            <MapPin size={14} color="#C2956A" />
            <span className="font-mono text-[18px] font-bold text-[#E8E9EB]">
              {t(`regions.${regionKey(c.region)}`)}
            </span>
          </div>
        </div>

        {/* ── visa-section ── */}
        {visa && (
          <div className="bg-bg py-8 gap-8 flex flex-col">
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <h2
                className="font-bold text-[#E8E9EB] m-0"
                style={{ fontFamily: "Oswald, sans-serif" }}
              >
                {t("countryPage.nomadVisaSection")}
              </h2>
              <div className="flex-1" />
              <div className="bg-[#1A1A0A] rounded-[20px] px-4 py-1.5">
                <span className="text-xs text-[#C2956A]">{visa.visaName}</span>
              </div>
              <span className="text-[10px] text-dimmer">
                {t("countryPage.updated", { date: visa.lastUpdated })}
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-5 md:gap-6">
              {/* Left column – 440px */}
              <div className="w-full md:w-[440px] md:flex-shrink-0 flex flex-col gap-5">
                {/* Duration & Cost */}
                <div className="bg-[#111111] rounded-xl border border-[#1E1E1E] p-6 flex flex-col gap-4">
                  <span className="text-[10px] text-[#808080] tracking-[1.5px] uppercase">
                    {t("countryPage.durationCost")}
                  </span>
                  <div className="flex gap-2 items-center">
                    <Calendar size={16} color="#8F5A3C" />
                    <span className="text-sm text-[#E8E9EB]">
                      {t("countryPage.monthsInitial", {
                        count: visa.duration.initial,
                      })}
                    </span>
                    <div className="flex-1" />
                    {visa.duration.maxExtension > 0 && (
                      <span className="text-[11px] text-[#C2956A]">
                        {t("countryPage.moExtension", {
                          count: visa.duration.maxExtension,
                        })}
                      </span>
                    )}
                  </div>
                  {visa.duration.renewable && (
                    <div className="flex gap-2 items-center">
                      <RefreshCw size={16} color="#6B9E6B" />
                      <span className="text-sm text-[#6B9E6B]">{t("countryPage.renewable")}</span>
                    </div>
                  )}
                  <div className="h-px bg-[#1E1E1E]" />
                  <div className="flex gap-2 items-center">
                    <CreditCard size={16} color="#8F5A3C" />
                    <span
                      className={`font-mono text-[22px] font-bold ${visa.cost.amount === 0 ? "text-[#44CC66]" : "text-[#E8E9EB]"}`}
                    >
                      {visa.cost.amount === 0
                        ? t("countryPage.free")
                        : `${visa.cost.currency} ${visa.cost.amount.toLocaleString()}`}
                    </span>
                    <span className="text-[11px] text-dim">{t("countryPage.applicationFee")}</span>
                  </div>
                  <div className="bg-bg rounded-lg px-4 py-3 flex flex-col gap-1">
                    <span className="text-[9px] text-dimmer tracking-[1px] uppercase">
                      {t("countryPage.incomeRequirement")}
                    </span>
                    {visa.incomeRequirement.monthly != null ? (
                      <>
                        <span className="font-mono text-[18px] font-bold text-[#C2956A]">
                          {visa.incomeRequirement.currency}{" "}
                          {visa.incomeRequirement.monthly.toLocaleString()}{" "}
                          {t("countryPage.perMonth")}
                        </span>
                        <span className="text-[11px] text-dim">
                          {visa.incomeRequirement.currency}{" "}
                          {(visa.incomeRequirement.monthly * 12).toLocaleString()}{" "}
                          {t("countryPage.perYear")}
                        </span>
                      </>
                    ) : visa.incomeRequirement.annual != null ? (
                      <span className="font-mono text-[18px] font-bold text-[#C2956A]">
                        {visa.incomeRequirement.currency}{" "}
                        {visa.incomeRequirement.annual.toLocaleString()} {t("countryPage.perYear")}
                      </span>
                    ) : (
                      <span className="font-mono text-[18px] font-bold text-[#44CC66]">
                        {t("countryPage.visa.noMinimum")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Taxation */}
                <div className="bg-[#111111] rounded-xl border border-[#1E1E1E] p-6 flex flex-col gap-4">
                  <span className="text-[10px] text-[#808080] tracking-[1.5px] uppercase">
                    {t("countryPage.taxation")}
                  </span>
                  <div
                    className={`flex gap-1 items-center rounded-lg px-4 py-2.5 ${
                      visa.tax.status === "exempt"
                        ? "bg-[#0A2010]"
                        : visa.tax.status === "special"
                          ? "bg-[#1A0A1A]"
                          : "bg-[#1A1A0A]"
                    }`}
                  >
                    <span
                      className={`text-[13px] font-semibold ${
                        visa.tax.status === "exempt"
                          ? "text-[#44CC66]"
                          : visa.tax.status === "special"
                            ? "text-[#9B8FB4]"
                            : "text-[#C2956A]"
                      }`}
                    >
                      {visa.tax.status === "exempt"
                        ? t("countryPage.taxExemptLabel")
                        : visa.tax.status === "special"
                          ? t("countryPage.specialTaxLabel")
                          : t("countryPage.standardTaxLabel")}
                    </span>
                    {visa.tax.rate != null && visa.tax.status !== "exempt" && (
                      <span className="font-mono text-[13px] text-dim">
                        {" · "}
                        {visa.tax.rate}%
                      </span>
                    )}
                  </div>
                  {visa.tax.notes && (
                    <p className="text-xs text-[#808080] m-0">
                      {localize(visa.tax.notes, visa, (l) => l.tax?.notes)}
                    </p>
                  )}
                </div>

                {/* Eligibility */}
                <div className="bg-[#111111] rounded-xl border border-[#1E1E1E] p-6 flex flex-col gap-3">
                  <span className="text-[10px] text-[#808080] tracking-[1.5px] uppercase">
                    {t("countryPage.eligibilitySection")}
                  </span>
                  <div className="flex gap-2 items-center">
                    <User size={14} color="#808080" />
                    <span className="text-[13px] text-dim">
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
                    <div key={i} className="flex gap-2 pt-1">
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
                      <span className="text-xs text-on-surface flex-1">{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right column – flex fill */}
              <div className="flex-1 flex flex-col gap-5 min-w-0">
                {/* Visa Benefits */}
                <div className="bg-[#111111] rounded-xl border border-[#1E1E1E] p-6 flex flex-col gap-3">
                  <span className="text-[10px] text-[#808080] tracking-[1.5px] uppercase">
                    {t("countryPage.visaBenefits")}
                  </span>
                  {localize(visa.benefits, visa, (l) => l.benefits).map((benefit, i) => (
                    <div key={i} className="flex gap-2.5 items-center bg-bg rounded-lg px-3 py-2.5">
                      <Briefcase size={16} color="#8F5A3C" />
                      <span className="text-[13px] text-muted">{benefit}</span>
                    </div>
                  ))}
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
                      fontFamily: "Inter, sans-serif",
                      fontSize: "10px",
                      color: "#808080",
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
                        color: "#9E9E9E",
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
                      fontFamily: "Inter, sans-serif",
                      fontSize: "9px",
                      color: "#757575",
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
                      <FileText size={13} color="#808080" />
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "12px",
                          color: "#8A8A8A",
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
                      fontFamily: "Inter, sans-serif",
                      fontSize: "11px",
                      color: "#808080",
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
            backgroundColor: "var(--color-bg)",
            paddingTop: "32px",
            paddingBottom: "32px",
            gap: "32px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <h2
              style={{
                fontFamily: "Oswald, sans-serif",
                fontWeight: 700,
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
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
                color: "#757575",
              }}
            >
              {t("countryPage.categoriesSubtitle", {
                count: VISIBLE_CATEGORY_KEYS.length,
                name: locC.name,
              })}
            </span>
          </div>

          <ScoreBreakdown country={c} columns={4} />

          {tourismMetricCount > 0 && (
            <>
              <div style={{ height: "1px", backgroundColor: "#1E1E1E" }} />
              <div
                style={{
                  backgroundColor: "var(--color-bg)",
                  paddingTop: "32px",
                  paddingBottom: "32px",
                  gap: "24px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div className="flex flex-col md:flex-row gap-3 md:items-center">
                  <h2
                    style={{
                      fontFamily: "Oswald, sans-serif",
                      fontWeight: 700,
                      color: "#E8E9EB",
                      margin: 0,
                    }}
                  >
                    {t("nav.tourism", "Tourism")}
                  </h2>
                  <span
                    style={{
                      flex: 1,
                      textAlign: "right",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "12px",
                      color: "#757575",
                    }}
                  >
                    {t("indicatorsPage.tourismIndicatorsLabel", {
                      count: tourismMetricCount,
                    })}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "10px",
                          color: "#808080",
                          letterSpacing: "1.5px",
                          textTransform: "uppercase",
                        }}
                      >
                        {t("countryDetail.tourismScores", "Tourism Score")}
                      </span>
                      <span
                        style={{
                          fontFamily: "IBM Plex Mono, monospace",
                          fontSize: "12px",
                          color: "#666666",
                        }}
                      >
                        {tourismMetricCount}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: "10px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Oswald, sans-serif",
                          fontSize: "42px",
                          fontWeight: 700,
                          lineHeight: 1,
                          color:
                            tourismScore != null ? tourismScoreColour(tourismScore) : "#757575",
                        }}
                      >
                        {tourismScore != null ? tourismScore.toFixed(1) : "—"}
                      </span>
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "12px",
                          color: "#8A8A8A",
                        }}
                      >
                        {t("tourismWeights.metricsLabel", "Tourism Metrics")}
                      </span>
                    </div>

                    <p
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "12px",
                        color: "#8A8A8A",
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {tourismScore != null
                        ? t(
                            "countryPage.tourismProfileSubtitle",
                            "{{name}}'s tourism profile across safety, sightseeing, and activities.",
                            { name: locC.name },
                          )
                        : t(
                            "countryPage.tourismProfileUnavailable",
                            "Tourism indicators are not available for this country yet.",
                          )}
                    </p>

                    {tourismTags.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "10px",
                            color: "#808080",
                            letterSpacing: "1.5px",
                            textTransform: "uppercase",
                          }}
                        >
                          {t("tourismFilters.activityTags", "Activities")}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {tourismTags.map((tag) => (
                            <span
                              key={tag}
                              style={{
                                fontFamily: "Inter, sans-serif",
                                fontSize: "11px",
                                fontWeight: 600,
                                padding: "6px 10px",
                                borderRadius: "999px",
                                backgroundColor: "#1A1A1C",
                                border: "1px solid #252525",
                                color: "#CFCFCF",
                              }}
                            >
                              {t(`tourismTags.${tag}`, tag)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {tourismGroups.map((group) => (
                    <div
                      key={group.labelKey}
                      style={{
                        backgroundColor: "#111111",
                        borderRadius: "12px",
                        border: "1px solid #1E1E1E",
                        padding: "24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "10px",
                          color: "#808080",
                          letterSpacing: "1.5px",
                          textTransform: "uppercase",
                        }}
                      >
                        {t(`tourismWeights.groups.${group.labelKey}`, group.labelKey)}
                      </div>

                      <div className="flex flex-col gap-3">
                        {group.metrics.map((metric) => (
                          <div key={metric.key} className="flex flex-col gap-2">
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "8px",
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: "Inter, sans-serif",
                                  fontSize: "12px",
                                  color: "#CFCFCF",
                                }}
                              >
                                {t(`tourism.metrics.${metric.key}`, CATEGORY_LABELS[metric.key])}
                              </span>
                              <span
                                style={{
                                  fontFamily: "IBM Plex Mono, monospace",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  color: "#E8E9EB",
                                  flexShrink: 0,
                                }}
                              >
                                {metric.value.toFixed(0)}
                              </span>
                            </div>

                            <div
                              style={{
                                height: "8px",
                                borderRadius: "999px",
                                backgroundColor: "#232323",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  width: `${metric.value}%`,
                                  height: "100%",
                                  borderRadius: "999px",
                                  backgroundColor: TOURISM_COLORS[metric.key] ?? "#8F5A3C",
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Cost of Living ── */}
          {c.costOfLiving && (
            <>
              <div style={{ height: "1px", backgroundColor: "#1E1E1E" }} />
              <div
                style={{
                  backgroundColor: "var(--color-bg)",
                  paddingTop: "32px",
                  paddingBottom: "32px",
                  gap: "24px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div className="flex flex-col md:flex-row gap-3 md:items-center">
                  <h2
                    style={{
                      fontFamily: "Oswald, sans-serif",
                      fontWeight: 700,
                      color: "#E8E9EB",
                      margin: 0,
                    }}
                  >
                    {t("countryPage.costOfLivingSection", "Cost of Living")}
                  </h2>
                  <span
                    style={{
                      flex: 1,
                      textAlign: "right",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "12px",
                      color: "#757575",
                    }}
                  >
                    {t("countryPage.costOfLivingSubtitle", "USD / month · single nomad")}
                  </span>
                </div>

                {/* Summary row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {c.costOfLiving.totalBasic !== null && (
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
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <TrendingUp size={16} color="#44CC66" />
                        <span
                          style={{
                            fontFamily: "IBM Plex Mono, monospace",
                            fontSize: "28px",
                            fontWeight: 700,
                            color: "#44CC66",
                          }}
                        >
                          ${c.costOfLiving.totalBasic.toLocaleString()}
                        </span>
                      </div>
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "10px",
                          color: "#808080",
                        }}
                      >
                        {t("countryPage.colTotalBasic", "Basic Budget")}
                      </span>
                    </div>
                  )}
                  {c.costOfLiving.totalComfortable !== null && (
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
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <TrendingUp size={16} color="#5B8FA8" />
                        <span
                          style={{
                            fontFamily: "IBM Plex Mono, monospace",
                            fontSize: "28px",
                            fontWeight: 700,
                            color: "#5B8FA8",
                          }}
                        >
                          ${c.costOfLiving.totalComfortable.toLocaleString()}
                        </span>
                      </div>
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "10px",
                          color: "#808080",
                        }}
                      >
                        {t("countryPage.colTotalComfortable", "Comfortable Budget")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Breakdown grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(
                    [
                      {
                        key: "rentMajorCity" as const,
                        icon: <Building2 size={14} color="#C2956A" />,
                        label: t("countryPage.colRentMajorCity", "Rent · Major City"),
                      },
                      {
                        key: "rentSmallerCity" as const,
                        icon: <Home size={14} color="#C2956A" />,
                        label: t("countryPage.colRentSmallerCity", "Rent · Smaller City"),
                      },
                      {
                        key: "rent2br" as const,
                        icon: <Building2 size={14} color="#A87A5A" />,
                        label: t("countryPage.colRent2br", "Rent · 2 Bedroom"),
                      },
                      {
                        key: "rent3br" as const,
                        icon: <Building2 size={14} color="#8F5A3C" />,
                        label: t("countryPage.colRent3br", "Rent · 3 Bedroom"),
                      },
                      {
                        key: "groceries" as const,
                        icon: <ShoppingCart size={14} color="#6BAF7A" />,
                        label: t("countryPage.colGroceries", "Groceries"),
                      },
                      {
                        key: "dining" as const,
                        icon: <UtensilsCrossed size={14} color="#D4A05A" />,
                        label: t("countryPage.colDining", "Dining Out"),
                      },
                      {
                        key: "transport" as const,
                        icon: <Bus size={14} color="#7BACC8" />,
                        label: t("countryPage.colTransport", "Transport"),
                      },
                      {
                        key: "utilities" as const,
                        icon: <Zap size={14} color="#DDAA44" />,
                        label: t("countryPage.colUtilities", "Utilities & Internet"),
                      },
                      {
                        key: "coworking" as const,
                        icon: <Laptop size={14} color="#8888CC" />,
                        label: t("countryPage.colCoworking", "Coworking"),
                      },
                      {
                        key: "healthInsurance" as const,
                        icon: <Heart size={14} color="#CC6666" />,
                        label: t("countryPage.colHealthInsurance", "Health Insurance"),
                      },
                    ] as const
                  ).map(({ key, icon, label }) => {
                    const val = c.costOfLiving![key];
                    if (val === null || val === undefined) return null;
                    return (
                      <div
                        key={key}
                        style={{
                          backgroundColor: "#111111",
                          borderRadius: "8px",
                          border: "1px solid #1E1E1E",
                          padding: "16px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          {icon}
                          <span
                            style={{
                              fontFamily: "IBM Plex Mono, monospace",
                              fontSize: "20px",
                              fontWeight: 700,
                              color: "#E8E9EB",
                            }}
                          >
                            ${val.toLocaleString()}
                          </span>
                        </div>
                        <span
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "10px",
                            color: "#808080",
                          }}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ── Climate Data ── */}
          {c.climateData && (
            <>
              <div style={{ height: "1px", backgroundColor: "#1E1E1E" }} />
              <div
                style={{
                  backgroundColor: "var(--color-bg)",
                  paddingTop: "32px",
                  paddingBottom: "32px",
                  gap: "24px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div className="flex flex-col md:flex-row gap-3 md:items-center">
                  <h2
                    style={{
                      fontFamily: "Oswald, sans-serif",
                      fontWeight: 700,
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
                      fontFamily: "Inter, sans-serif",
                      fontSize: "12px",
                      color: "#757575",
                    }}
                  >
                    {seasonLabel} · {t("countryPage.annualAverages")}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div
                    style={{
                      backgroundColor: "#111111",
                      borderRadius: "10px",
                      border: "1px solid #1E1E1E",
                      padding: "20px",
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
                        fontFamily: "Inter, sans-serif",
                        fontSize: "10px",
                        color: "#808080",
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
                        fontFamily: "Inter, sans-serif",
                        fontSize: "10px",
                        color: "#808080",
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
                        fontFamily: "Inter, sans-serif",
                        fontSize: "10px",
                        color: "#808080",
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
                        fontFamily: "Inter, sans-serif",
                        fontSize: "10px",
                        color: "#808080",
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

import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Layout } from "@core/ui/layout";
import { ScoreBreakdown } from "@features/country-ranking/ui";
import {
  ArrowLeft,
  Briefcase,
  Building,
  Building2,
  Bus,
  Calendar,
  Check,
  CreditCard,
  Droplets,
  ExternalLink,
  FileText,
  Heart,
  Home,
  Laptop,
  MapPin,
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
import { useCountries } from "@core/hooks";
import { useScoring } from "@features/country-ranking/hooks";
import { useWeightState } from "@features/country-ranking/hooks";
import { useLangPrefix } from "@core/hooks";
import { useTranslation } from "react-i18next";
import type { NomadVisaDetails } from "@core/models";
import { CATEGORY_LABELS, TOURISM_GROUPS, VISIBLE_CATEGORY_KEYS } from "@core/models";
import { useLocalizedCountry, regionKey } from "@core/utils";
import { computeTourismScore } from "@features/tourism/utils";
import { tourismScoreColourClass } from "@core/utils";
import { TOURISM_COLORS } from "@features/tourism/constants";
import { CountryBadges } from "./CountryBadges";
import {
  getHostname,
  localizeVisa,
  taxStatusBgClass,
  taxStatusTextClass,
  taxStatusLabelKey,
} from "./country-profile.utils";

interface CountryVisaSectionProps {
  readonly visa: NomadVisaDetails;
}

function CountryVisaSection({ visa }: CountryVisaSectionProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  return (
    <div className="flex flex-col gap-8 bg-bg py-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <h2 className="m-0 font-display font-bold text-[#E8E9EB]">
          {t("countryPage.nomadVisaSection")}
        </h2>
        <div className="flex-1" />
        <div className="rounded-[20px] bg-[#1A1A0A] px-4 py-1.5">
          <span className="text-xs text-[#C2956A]">{visa.visaName}</span>
        </div>
        <span className="text-[10px] text-dimmer">
          {t("countryPage.updated", { date: visa.lastUpdated })}
        </span>
      </div>

      <div className="flex flex-col gap-5 md:flex-row md:gap-6">
        {/* Left column – 440px */}
        <div className="flex w-full flex-col gap-5 md:w-[440px] md:flex-shrink-0">
          {/* Duration & Cost */}
          <div className="flex flex-col gap-4 rounded-xl border border-[#1E1E1E] bg-[#111111] p-6">
            <span className="text-[10px] tracking-[1.5px] text-[#808080] uppercase">
              {t("countryPage.durationCost")}
            </span>
            <div className="flex items-center gap-2">
              <Calendar size={16} color="#8F5A3C" />
              <span className="text-sm text-[#E8E9EB]">
                {t("countryPage.monthsInitial", { count: visa.duration.initial })}
              </span>
              <div className="flex-1" />
              {visa.duration.maxExtension > 0 ? (
                <span className="text-[11px] text-[#C2956A]">
                  {t("countryPage.moExtension", { count: visa.duration.maxExtension })}
                </span>
              ) : null}
            </div>
            {visa.duration.renewable ? (
              <div className="flex items-center gap-2">
                <RefreshCw size={16} color="#6B9E6B" />
                <span className="text-sm text-[#6B9E6B]">{t("countryPage.renewable")}</span>
              </div>
            ) : null}
            <div className="h-px bg-[#1E1E1E]" />
            <div className="flex items-center gap-2">
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
            <div className="flex flex-col gap-1 rounded-lg bg-bg px-4 py-3">
              <span className="text-[9px] tracking-[1px] text-dimmer uppercase">
                {t("countryPage.incomeRequirement")}
              </span>
              {visa.incomeRequirement.monthly == null ? (
                visa.incomeRequirement.annual == null ? (
                  <span className="font-mono text-[18px] font-bold text-[#44CC66]">
                    {t("countryPage.visa.noMinimum")}
                  </span>
                ) : (
                  <span className="font-mono text-[18px] font-bold text-[#C2956A]">
                    {visa.incomeRequirement.currency}{" "}
                    {visa.incomeRequirement.annual.toLocaleString()} {t("countryPage.perYear")}
                  </span>
                )
              ) : (
                <>
                  <span className="font-mono text-[18px] font-bold text-[#C2956A]">
                    {visa.incomeRequirement.currency}{" "}
                    {visa.incomeRequirement.monthly.toLocaleString()} {t("countryPage.perMonth")}
                  </span>
                  <span className="text-[11px] text-dim">
                    {visa.incomeRequirement.currency}{" "}
                    {(visa.incomeRequirement.monthly * 12).toLocaleString()}{" "}
                    {t("countryPage.perYear")}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Taxation */}
          <div className="flex flex-col gap-4 rounded-xl border border-[#1E1E1E] bg-[#111111] p-6">
            <span className="text-[10px] tracking-[1.5px] text-[#808080] uppercase">
              {t("countryPage.taxation")}
            </span>
            <div
              className={`flex items-center gap-1 rounded-lg px-4 py-2.5 ${taxStatusBgClass(visa.tax.status)}`}
            >
              <span className={`text-[13px] font-semibold ${taxStatusTextClass(visa.tax.status)}`}>
                {t(taxStatusLabelKey(visa.tax.status))}
              </span>
              {visa.tax.rate != null && visa.tax.status !== "exempt" ? (
                <span className="font-mono text-[13px] text-dim">
                  {" · "}
                  {visa.tax.rate}%
                </span>
              ) : null}
            </div>
            {visa.tax.notes !== "" ? (
              <p className="m-0 text-xs text-[#808080]">
                {localizeVisa(visa.tax.notes, visa, (l) => l.tax?.notes, lang)}
              </p>
            ) : null}
          </div>

          {/* Eligibility */}
          <div className="flex flex-col gap-3 rounded-xl border border-[#1E1E1E] bg-[#111111] p-6">
            <span className="text-[10px] tracking-[1.5px] text-[#808080] uppercase">
              {t("countryPage.eligibilitySection")}
            </span>
            <div className="flex items-center gap-2">
              <User size={14} color="#808080" />
              <span className="text-[13px] text-dim">
                {t("countryPage.minimumAge", { age: visa.eligibility.minAge })}
              </span>
            </div>
            {localizeVisa(
              visa.eligibility.requirements,
              visa,
              (l) => l.eligibility?.requirements,
              lang,
            ).map((req) => (
              <div key={req} className="flex gap-2 pt-1">
                <Check size={13} color="#6B9E6B" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span className="flex-1 text-xs text-on-surface">{req}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column – flex fill */}
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {/* Visa Benefits */}
          <div className="flex flex-col gap-3 rounded-xl border border-[#1E1E1E] bg-[#111111] p-6">
            <span className="text-[10px] tracking-[1.5px] text-[#808080] uppercase">
              {t("countryPage.visaBenefits")}
            </span>
            {localizeVisa(visa.benefits, visa, (l) => l.benefits, lang).map((benefit) => (
              <div key={benefit} className="flex items-center gap-2.5 rounded-lg bg-bg px-3 py-2.5">
                <Briefcase size={16} color="#8F5A3C" />
                <span className="text-[13px] text-muted">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Application Process */}
          <div className="flex flex-col gap-4 rounded-xl border border-[#1E1E1E] bg-[#111111] p-6">
            <span className="text-[10px] tracking-[1.5px] text-[#808080] uppercase">
              {t("countryPage.applicationProcessSection")}
            </span>
            <div className="flex items-center gap-2">
              <Building2 size={16} color="#C2956A" />
              <span className="text-sm text-[#E8E9EB]">
                {visa.applicationProcess.online
                  ? t("countryPage.onlineApplication")
                  : t("countryPage.inPersonApplication")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Timer size={16} color="#8F5A3C" />
              <span className="text-[13px] text-on-surface">
                {t("countryPage.processing", {
                  time: localizeVisa(
                    visa.applicationProcess.processingTime,
                    visa,
                    (l) => l.applicationProcess?.processingTime,
                    lang,
                  ),
                })}
              </span>
            </div>
            <div className="h-px bg-[#1E1E1E]" />
            <span className="text-[9px] tracking-[1px] text-dimmer uppercase">
              {t("countryPage.requiredDocsSection")}
            </span>
            {localizeVisa(
              visa.applicationProcess.documents,
              visa,
              (l) => l.applicationProcess?.documents,
              lang,
            ).map((doc) => (
              <div key={doc} className="flex items-center gap-2">
                <FileText size={13} color="#808080" />
                <span className="text-xs text-dim">{doc}</span>
              </div>
            ))}
          </div>

          {/* Official Link */}
          <a
            href={visa.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-[#2A2018] bg-[#1A1410] p-5 no-underline"
          >
            <ExternalLink size={18} color="#8F5A3C" />
            <span className="text-sm text-[#C2956A]">{t("countryPage.officialVisaWebsite")}</span>
            <div className="flex-1" />
            <span className="text-[11px] text-[#808080]">{getHostname(visa.officialUrl)}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export function CountryPage() {
  const { t } = useTranslation();
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const langPrefix = useLangPrefix();
  const { countries, loading, error } = useCountries();
  const { weights, climatePrefs } = useWeightState();

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
        <div className="flex min-h-[60vh] items-center justify-center">
          <span className="text-sm text-dim">{t("loading")}</span>
        </div>
      </Layout>
    );
  }

  if (error != null || c == null) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <span className="text-sm text-on-surface">{error ?? t("countryPage.notFound")}</span>
          <Link to={`${langPrefix}/`} className="text-[13px] text-[#C2956A] no-underline">
            {t("countryPage.backToCountries")}
          </Link>
        </div>
      </Layout>
    );
  }

  const seasonLabel = c.climateData
    ? t(`countryPage.seasonLabels.${c.climateData.seasonType}`)
    : null;

  const tourismScore = computeTourismScore(c);
  const tourismGroups = TOURISM_GROUPS.map((group) => ({
    labelKey: group.labelKey,
    metrics: group.keys
      .map((key) => ({ key, value: c.scores[key].value }))
      .filter(
        (metric): metric is { key: (typeof group.keys)[number]; value: number } =>
          metric.value != null,
      ),
  })).filter((group) => group.metrics.length > 0);
  const tourismMetricCount = tourismGroups.reduce(
    (count, group) => count + group.metrics.length,
    0,
  );
  const tourismTags = [...new Set(c.tourismTags)].sort(
    (left, right) => (c.tourismTagScores?.[right] ?? 0) - (c.tourismTagScores?.[left] ?? 0),
  );

  const handleBack = () => {
    const histState = globalThis.history.state as { idx?: number } | null;
    const histIdx = histState?.idx;
    if (histIdx != null && histIdx > 0) {
      void navigate(-1);
      return;
    }

    void navigate(`${langPrefix}/`, { replace: true });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-bg">
        {/* ── heroBanner ── */}
        <div
          className="relative min-h-[280px] overflow-hidden"
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
            className="absolute top-5 left-4 z-10 flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#2A2A2A] bg-[rgba(17,17,17,0.75)] px-[14px] py-[7px] text-[13px] text-[#AAAAAA] backdrop-blur-[8px] md:left-8"
          >
            <ArrowLeft size={15} color="#AAAAAA" />
            {t("countryPage.back")}
          </button>

          {/* Bottom content: flag + name + badges */}
          <div className="absolute inset-0 flex flex-col justify-end gap-4 px-4 pb-6 md:px-16 md:pb-8">
            {/* Flag + name row */}
            <div className="flex flex-wrap items-center gap-3 md:gap-6">
              <div className="h-11 w-16 shrink-0 overflow-hidden rounded-[6px] shadow-[0_4px_16px_rgba(0,0,0,0.5)] md:h-[67px] md:w-[100px]">
                <img
                  src={c.flagUrl}
                  alt={t("a11y.flagAlt", "{{country}} flag", {
                    country: locC.name,
                  })}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold tracking-[2px] text-[#8F5A3C] uppercase">
                  {t("countryPage.countryDetailLabel")}
                </span>
                <h1 className="m-0 font-display text-2xl leading-none font-bold text-[#E8E9EB] md:text-4xl">
                  {locC.name}
                </h1>
              </div>
              <div className="hidden flex-1 md:block" />
              <div className="hidden self-end rounded-[6px] bg-[rgba(26,26,26,0.8)] px-3 py-1.5 md:block">
                <span className="font-mono text-sm text-[#808080]">{c.code}</span>
              </div>
            </div>

            {/* Badges row */}
            <CountryBadges
              hasNomadVisa={c.hasNomadVisa}
              isSchengen={c.isSchengen}
              touristVisaDays={c.touristVisaDays ?? null}
              seasonLabel={seasonLabel}
            />
          </div>
        </div>

        {/* ── statsRow ── */}
        <div className="grid grid-cols-2 gap-3 bg-bg py-6 md:flex md:items-center">
          <div className="flex flex-1 items-center justify-center gap-2.5 rounded-lg border border-[#1E1E1E] bg-[#111111] px-[18px] py-[14px]">
            <TrendingUp size={14} color="#8F5A3C" />
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[22px] font-bold text-[#C2956A]">
                {finalScore.toFixed(1)}
              </span>
              <span className="font-mono text-xs text-[#808080]">#{rank}</span>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-center gap-2.5 rounded-lg border border-[#1E1E1E] bg-[#111111] px-[18px] py-[14px]">
            <Users size={14} color="#5B8FA8" />
            <span className="font-mono text-[22px] font-bold text-[#E8E9EB]">
              {(c.population / 1_000_000).toFixed(1)}M
            </span>
          </div>
          <div className="flex flex-1 items-center justify-center gap-2.5 rounded-lg border border-[#1E1E1E] bg-[#111111] px-[18px] py-[14px]">
            <Building size={14} color="#7A9B6B" />
            <span className="font-mono text-[18px] font-bold text-[#E8E9EB]">{locC.capital}</span>
          </div>
          <div className="flex flex-1 items-center justify-center gap-2.5 rounded-lg border border-[#1E1E1E] bg-[#111111] px-[18px] py-[14px]">
            <MapPin size={14} color="#C2956A" />
            <span className="font-mono text-[18px] font-bold text-[#E8E9EB]">
              {t(`regions.${regionKey(c.region)}`)}
            </span>
          </div>
        </div>

        {/* ── visa-section ── */}
        {visa != null ? <CountryVisaSection visa={visa} /> : null}

        {/* ── scores-section + climate ── */}
        <div className="flex flex-col gap-8 bg-bg py-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <h2 className="m-0 font-display font-bold text-[#E8E9EB]">
              {t("countryPage.performanceBreakdown")}
            </h2>
            <span className="flex-1 text-right text-xs text-dimmer">
              {t("countryPage.categoriesSubtitle", {
                count: VISIBLE_CATEGORY_KEYS.length,
                name: locC.name,
              })}
            </span>
          </div>

          <ScoreBreakdown country={c} columns={4} />

          {tourismMetricCount > 0 ? (
            <>
              <div className="h-px bg-[#1E1E1E]" />
              <div className="flex flex-col gap-6 bg-bg py-8">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <h2 className="m-0 font-display font-bold text-[#E8E9EB]">
                    {t("nav.tourism", "Tourism")}
                  </h2>
                  <span className="flex-1 text-right text-xs text-dimmer">
                    {t("indicatorsPage.tourismIndicatorsLabel", {
                      count: tourismMetricCount,
                    })}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="flex flex-col gap-4 rounded-xl border border-[#1E1E1E] bg-[#111111] p-6">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] tracking-[1.5px] text-[#808080] uppercase">
                        {t("countryDetail.tourismScores", "Tourism Score")}
                      </span>
                      <span className="font-mono text-xs text-[#666666]">{tourismMetricCount}</span>
                    </div>

                    <div className="flex items-baseline gap-2.5">
                      <span
                        className={`font-display text-[42px] leading-none font-bold ${tourismScore == null ? "text-dimmer" : tourismScoreColourClass(tourismScore, "text")}`}
                      >
                        {tourismScore == null ? "—" : tourismScore.toFixed(1)}
                      </span>
                      <span className="text-xs text-dim">
                        {t("tourismWeights.metricsLabel", "Tourism Metrics")}
                      </span>
                    </div>

                    <p className="m-0 text-xs leading-relaxed text-dim">
                      {tourismScore == null
                        ? t(
                            "countryPage.tourismProfileUnavailable",
                            "Tourism indicators are not available for this country yet.",
                          )
                        : t(
                            "countryPage.tourismProfileSubtitle",
                            "{{name}}'s tourism profile across safety, sightseeing, and activities.",
                            { name: locC.name },
                          )}
                    </p>

                    {tourismTags.length > 0 ? (
                      <div className="flex flex-col gap-2.5">
                        <span className="text-[10px] tracking-[1.5px] text-[#808080] uppercase">
                          {t("tourismFilters.activityTags", "Activities")}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {tourismTags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-[#252525] bg-[#1A1A1C] px-2.5 py-1.5 text-[11px] font-semibold text-[#CFCFCF]"
                            >
                              {t(`tourismTags.${tag}`, tag)}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {tourismGroups.map((group) => (
                    <div
                      key={group.labelKey}
                      className="flex flex-col gap-[14px] rounded-xl border border-[#1E1E1E] bg-[#111111] p-6"
                    >
                      <div className="text-[10px] tracking-[1.5px] text-[#808080] uppercase">
                        {t(`tourismWeights.groups.${group.labelKey}`, group.labelKey)}
                      </div>

                      <div className="flex flex-col gap-3">
                        {group.metrics.map((metric) => (
                          <div key={metric.key} className="flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-[#CFCFCF]">
                                {t(`tourism.metrics.${metric.key}`, CATEGORY_LABELS[metric.key])}
                              </span>
                              <span className="shrink-0 font-mono text-xs font-bold text-[#E8E9EB]">
                                {metric.value.toFixed(0)}
                              </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-[#232323]">
                              <div
                                style={
                                  {
                                    "--w": `${metric.value}%`,
                                    "--c": TOURISM_COLORS[metric.key] ?? "#8F5A3C",
                                  } as React.CSSProperties
                                }
                                className="h-full w-[var(--w)] rounded-full bg-[var(--c)]"
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
          ) : null}

          {/* ── Cost of Living ── */}
          {c.costOfLiving ? (
            <>
              <div className="h-px bg-[#1E1E1E]" />
              <div className="flex flex-col gap-6 bg-bg py-8">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <h2 className="m-0 font-display font-bold text-[#E8E9EB]">
                    {t("countryPage.costOfLivingSection", "Cost of Living")}
                  </h2>
                  <span className="flex-1 text-right text-xs text-dimmer">
                    {t("countryPage.costOfLivingSubtitle", "USD / month · single nomad")}
                  </span>
                </div>

                {/* Summary row */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {c.costOfLiving.totalBasic === null ? null : (
                    <div className="flex flex-1 flex-col gap-2 rounded-[10px] border border-[#1E1E1E] bg-[#111111] p-5">
                      <div className="flex items-center gap-3">
                        <TrendingUp size={16} color="#44CC66" />
                        <span className="font-mono text-[28px] font-bold text-[#44CC66]">
                          ${c.costOfLiving.totalBasic.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#808080]">
                        {t("countryPage.colTotalBasic", "Basic Budget")}
                      </span>
                    </div>
                  )}
                  {c.costOfLiving.totalComfortable === null ? null : (
                    <div className="flex flex-1 flex-col gap-2 rounded-[10px] border border-[#1E1E1E] bg-[#111111] p-5">
                      <div className="flex items-center gap-3">
                        <TrendingUp size={16} color="#5B8FA8" />
                        <span className="font-mono text-[28px] font-bold text-[#5B8FA8]">
                          ${c.costOfLiving.totalComfortable.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#808080]">
                        {t("countryPage.colTotalComfortable", "Comfortable Budget")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Breakdown grid */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
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
                    const val = c.costOfLiving?.[key] ?? null;
                    if (val == null) return null;
                    return (
                      <div
                        key={key}
                        className="flex flex-col gap-1.5 rounded-lg border border-[#1E1E1E] bg-[#111111] p-4"
                      >
                        <div className="flex items-center gap-2.5">
                          {icon}
                          <span className="font-mono text-[20px] font-bold text-[#E8E9EB]">
                            ${val.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#808080]">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : null}

          {/* ── Climate Data ── */}
          {c.climateData ? (
            <>
              <div className="h-px bg-[#1E1E1E]" />
              <div className="flex flex-col gap-6 bg-bg py-8">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <h2 className="m-0 font-display font-bold text-[#E8E9EB]">
                    {t("countryPage.climateDataSection")}
                  </h2>
                  <span className="flex-1 text-right text-xs text-dimmer">
                    {seasonLabel} · {t("countryPage.annualAverages")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="flex flex-col gap-2 rounded-[10px] border border-[#1E1E1E] bg-[#111111] p-5">
                    <Thermometer size={16} color="#5B8FA8" />
                    <span className="font-mono text-[28px] font-bold text-[#E8E9EB]">
                      {c.climateData.annualMeanTemp.toFixed(1)}°C
                    </span>
                    <span className="text-[10px] text-[#808080]">
                      {t("countryPage.annualMeanTemp")}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 rounded-[10px] border border-[#1E1E1E] bg-[#111111] p-5">
                    <Droplets size={16} color="#5B8FA8" />
                    <span className="font-mono text-[28px] font-bold text-[#E8E9EB]">
                      {Math.round(c.climateData.annualPrecipitation)}mm
                    </span>
                    <span className="text-[10px] text-[#808080]">
                      {t("countryPage.annualPrecipitation")}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 rounded-[10px] border border-[#1E1E1E] bg-[#111111] p-5">
                    <Sun size={16} color="#C2956A" />
                    <span className="font-mono text-[28px] font-bold text-[#C2956A]">
                      {c.climateData.hottestMonth.toFixed(1)}°C
                    </span>
                    <span className="text-[10px] text-[#808080]">
                      {t("countryPage.hottestMonth")}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 rounded-[10px] border border-[#1E1E1E] bg-[#111111] p-5">
                    <Snowflake size={16} color="#7BACC8" />
                    <span className="font-mono text-[28px] font-bold text-[#7BACC8]">
                      {c.climateData.coldestMonth.toFixed(1)}°C
                    </span>
                    <span className="text-[10px] text-[#808080]">
                      {t("countryPage.coldestMonth")}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </Layout>
  );
}

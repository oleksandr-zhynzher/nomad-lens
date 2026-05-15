import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Layout } from "@core/ui/layout";
import { ArrowLeft, Building, MapPin, TrendingUp, Users } from "lucide-react";
import { useCountries } from "@core/hooks";
import { useScoring } from "@features/country-ranking/hooks";
import { useWeightState } from "@features/country-ranking/hooks";
import { useLangPrefix } from "@core/hooks";
import { useTranslation } from "react-i18next";
import { useLocalizedCountry, regionKey } from "@core/utils";
import { CountryBadges } from "./CountryBadges";
import { CountryVisaSection } from "./CountryVisaSection";
import { CountryPerformanceSection } from "./CountryPerformanceSection";
import { CountryCostOfLivingSection } from "./CountryCostOfLivingSection";
import { CountryClimateSection } from "./CountryClimateSection";

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

        {/* ── scores + tourism + cost-of-living + climate ── */}
        <div className="flex flex-col gap-8 bg-bg py-8">
          <CountryPerformanceSection country={c} />
          <CountryCostOfLivingSection country={c} />
          <CountryClimateSection country={c} />
        </div>
      </div>
    </Layout>
  );
}

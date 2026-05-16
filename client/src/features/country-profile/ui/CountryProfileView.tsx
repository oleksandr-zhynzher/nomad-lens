import { useCountries, useLangPrefix } from "@core/hooks";
import { Layout } from "@core/ui/layout";
import { useLocalizedCountry } from "@core/utils";
import { useScoring, useWeightState } from "@features/country-ranking/hooks";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";

import { CountryClimateSection } from "./CountryClimateSection";
import { CountryCostOfLivingSection } from "./CountryCostOfLivingSection";
import { CountryHeroBanner } from "./CountryHeroBanner";
import { CountryPerformanceSection } from "./CountryPerformanceSection";
import { CountryStatsRow } from "./CountryStatsRow";
import { CountryVisaSection } from "./CountryVisaSection";

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
    if (histState?.idx != null && histState.idx > 0) {
      void navigate(-1);
      return;
    }
    void navigate(`${langPrefix}/`, { replace: true });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-bg">
        <CountryHeroBanner
          flagUrl={c.flagUrl}
          name={locC.name}
          code={c.code}
          onBack={handleBack}
          hasNomadVisa={c.hasNomadVisa}
          isSchengen={c.isSchengen}
          touristVisaDays={c.touristVisaDays ?? null}
          seasonLabel={seasonLabel}
        />
        <CountryStatsRow
          finalScore={finalScore}
          rank={rank}
          population={c.population}
          capital={locC.capital}
          region={c.region}
        />
        {visa != null ? <CountryVisaSection visa={visa} /> : null}
        <div className="flex flex-col gap-8 bg-bg py-8">
          <CountryPerformanceSection country={c} />
          <CountryCostOfLivingSection country={c} />
          <CountryClimateSection country={c} />
        </div>
      </div>
    </Layout>
  );
}

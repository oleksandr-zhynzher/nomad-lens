import { TOURISM_CATEGORY_KEYS } from "@core/models";
import { HeroStat, HeroStatDivider, HeroStats, PageHeroBanner } from "@core/ui/page-hero";
import { useTranslation } from "react-i18next";

interface TourismHeroSectionProps {
  readonly countriesCount: number;
}

export function TourismHeroSection({ countriesCount }: TourismHeroSectionProps) {
  const { t } = useTranslation();
  return (
    <PageHeroBanner
      backgroundImage="/hero-map.png"
      eyebrow={`${t("tourism.eyebrow", "EXPLORE")} · ${t("nav.tourism", "TOURISM")}`}
      title={t("tourism.title", "TOURISM EXPLORER")}
      subtitle={t("tourism.subtitle")}
    >
      <HeroStats>
        <HeroStat
          value={countriesCount}
          label={t("hero.stats.countries", { count: countriesCount })}
        />
        <HeroStatDivider />
        <HeroStat
          value={TOURISM_CATEGORY_KEYS.length}
          label={t("tourismWeights.metricsLabel", "Tourism Metrics")}
        />
      </HeroStats>
    </PageHeroBanner>
  );
}

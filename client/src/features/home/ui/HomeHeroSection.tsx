import { AI_CATEGORY_KEYS, DISPLAYED_CORE_CATEGORY_KEYS } from "@core/models";
import { HeroStat, HeroStatDivider, HeroStats, PageHeroBanner } from "@core/ui/page-hero";
import { DATA_SOURCE_KEYS } from "@features/data-sources/constants";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface HomeHeroSectionProps {
  readonly countriesCount: number;
  readonly langPrefix: string;
}

export function HomeHeroSection({ countriesCount, langPrefix }: HomeHeroSectionProps) {
  const { t } = useTranslation();
  return (
    <PageHeroBanner
      backgroundImage="/hero-map.png"
      eyebrow={t("hero.eyebrow")}
      title={t("hero.title")}
      subtitle={t("hero.tagline")}
    >
      <HeroStats>
        <HeroStat
          value={countriesCount}
          label={t("hero.stats.countries", { count: countriesCount })}
        />
        <HeroStatDivider />
        <HeroStat
          as={Link}
          to={`${langPrefix}/indicators`}
          value={DISPLAYED_CORE_CATEGORY_KEYS.length}
          label={t("hero.stats.indicators", { count: DISPLAYED_CORE_CATEGORY_KEYS.length })}
        />
        <HeroStatDivider />
        <HeroStat
          as={Link}
          to={`${langPrefix}/data-sources`}
          value={DATA_SOURCE_KEYS.flat().length}
          label={t("hero.stats.dataSources", { count: DATA_SOURCE_KEYS.flat().length })}
        />
        <HeroStatDivider />
        <HeroStat
          as={Link}
          to={`${langPrefix}/ai-indicators`}
          value={AI_CATEGORY_KEYS.length}
          label={t("hero.stats.aiIndicators", { count: AI_CATEGORY_KEYS.length })}
        />
      </HeroStats>
    </PageHeroBanner>
  );
}

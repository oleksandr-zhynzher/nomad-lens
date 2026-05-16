import { AI_CATEGORY_KEYS, DISPLAYED_CORE_CATEGORY_KEYS } from "@core/models";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface CompareHeroStatsProps {
  readonly countriesCount: number;
  readonly nomadVisaCountryCount: number;
  readonly langPrefix: string;
}

export function CompareHeroStats({
  countriesCount,
  nomadVisaCountryCount,
  langPrefix,
}: CompareHeroStatsProps) {
  const { t } = useTranslation();
  const coreIndicatorCount = DISPLAYED_CORE_CATEGORY_KEYS.length;
  const aiIndicatorCount = AI_CATEGORY_KEYS.length;
  return (
    <div className="hero-stats-row hero-banner-stats">
      <div className="min-w-0">
        <div className="font-mono text-[18px] leading-none font-semibold text-accent-dim">
          {countriesCount}
        </div>
        <div className="mt-1 text-[10px] tracking-[1px] text-dimmer uppercase">
          {t("hero.stats.countries", { count: countriesCount })}
        </div>
      </div>
      <div className="hero-stat-divider" />
      <Link to={`${langPrefix}/nomad-visas`} className="min-w-0 no-underline">
        <div>
          <div className="font-mono text-[18px] leading-none font-semibold text-accent-dim">
            {nomadVisaCountryCount}
          </div>
          <div className="mt-1 text-[10px] tracking-[1px] text-dimmer uppercase">
            {t("compare.nomadVisaCountries", { count: nomadVisaCountryCount })}
          </div>
        </div>
      </Link>
      <div className="hero-stat-divider" />
      <Link to={`${langPrefix}/indicators`} className="min-w-0 no-underline">
        <div>
          <div className="font-mono text-[18px] leading-none font-semibold text-accent-dim">
            {coreIndicatorCount}
          </div>
          <div className="mt-1 text-[10px] tracking-[1px] text-dimmer uppercase">
            {t("hero.stats.indicators", { count: coreIndicatorCount })}
          </div>
        </div>
      </Link>
      <div className="hero-stat-divider" />
      <Link to={`${langPrefix}/ai-indicators`} className="min-w-0 no-underline">
        <div>
          <div className="font-mono text-[18px] leading-none font-semibold text-accent-dim">
            {aiIndicatorCount}
          </div>
          <div className="mt-1 text-[10px] tracking-[1px] text-dimmer uppercase">
            {t("hero.stats.aiIndicators", { count: aiIndicatorCount })}
          </div>
        </div>
      </Link>
    </div>
  );
}

import { useTranslation } from "react-i18next";

interface NomadVisaHeroStatsProps {
  readonly totalCountries: number;
  readonly taxExemptCount: number;
  readonly freeVisaCount: number;
}

export function NomadVisaHeroStats({
  totalCountries,
  taxExemptCount,
  freeVisaCount,
}: NomadVisaHeroStatsProps) {
  const { t } = useTranslation();

  return (
    <div className="hero-stats-row hero-banner-stats">
      <div className="min-w-0">
        <div className="font-mono text-lg leading-none font-semibold text-accent-dim">
          {totalCountries}
        </div>
        <div className="mt-1 text-[10px] tracking-[1px] text-dimmest uppercase">
          {t("nomadVisasPage.stats.countries", { count: totalCountries })}
        </div>
      </div>
      <div className="hero-stat-divider" />
      <div className="min-w-0">
        <div className="font-mono text-lg leading-none font-semibold text-accent-dim">
          {taxExemptCount}
        </div>
        <div className="mt-1 text-[10px] tracking-[1px] text-dimmest uppercase">
          {t("nomadVisasPage.stats.taxExempt", { count: taxExemptCount })}
        </div>
      </div>
      <div className="hero-stat-divider" />
      <div className="min-w-0">
        <div className="font-mono text-lg leading-none font-semibold text-accent-dim">
          {freeVisaCount}
        </div>
        <div className="mt-1 text-[10px] tracking-[1px] text-dimmest uppercase">
          {t("nomadVisasPage.stats.freeVisas", { count: freeVisaCount })}
        </div>
      </div>
    </div>
  );
}

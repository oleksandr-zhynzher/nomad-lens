import { useTranslation } from "react-i18next";
import { TOURISM_CATEGORY_KEYS } from "@core/models";

interface TourismHeroSectionProps {
  readonly countriesCount: number;
}

export function TourismHeroSection({ countriesCount }: TourismHeroSectionProps) {
  const { t } = useTranslation();
  return (
    <div
      className="relative -mx-4 mb-6 overflow-hidden md:mx-0 md:mb-6 md:rounded-lg"
      style={{
        background: "#0A0A0F",
        backgroundImage: `url('/hero-map.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.85) 100%)",
        }}
      />
      <div className="relative flex min-h-[160px] flex-col justify-end px-4 py-4 md:px-12 md:py-12">
        <div className="mb-2 flex items-center gap-2 md:mb-3">
          <span className="flex items-center gap-2">
            <span className="inline-block h-1 w-1 shrink-0 rounded-full bg-accent-dim" />
            <span className="text-[11px] leading-none font-medium tracking-[2.5px] text-accent-dim uppercase">
              {t("tourism.eyebrow", "EXPLORE")}
            </span>
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-1 w-1 shrink-0 rounded-full bg-accent-dim" />
            <span className="text-[11px] leading-none font-medium tracking-[2.5px] text-accent-dim uppercase">
              {t("nav.tourism", "TOURISM")}
            </span>
          </span>
        </div>
        <h1 className="mb-2 font-display text-3xl leading-[0.95] font-semibold text-white md:text-6xl">
          {t("tourism.title", "TOURISM EXPLORER")}
        </h1>
        <p className="mb-5 hidden max-w-[580px] text-[15px] text-dim md:block">
          {t("tourism.subtitle")}
        </p>
        <div className="mb-4 hidden h-0.5 w-32 bg-accent md:block" />
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
          <div className="min-w-0">
            <div className="font-mono text-[18px] leading-none font-semibold text-accent-dim">
              {TOURISM_CATEGORY_KEYS.length}
            </div>
            <div className="mt-1 text-[10px] tracking-[1px] text-dimmer uppercase">
              {t("tourismWeights.metricsLabel", "Tourism Metrics")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

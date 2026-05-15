import { useTranslation } from "react-i18next";
import { PageHeroBanner } from "@core/ui/page-hero";
import { NomadVisaHeroStats } from "./NomadVisaHeroStats";

interface NomadVisaPageBannerProps {
  readonly count: number;
  readonly taxExemptCount: number;
  readonly freeVisaCount: number;
}

export function NomadVisaPageBanner({
  count,
  taxExemptCount,
  freeVisaCount,
}: NomadVisaPageBannerProps) {
  const { t } = useTranslation();
  return (
    <div className="mx-auto box-content w-full max-w-[1200px] px-4 pb-12">
      <PageHeroBanner
        backgroundImage="/hero-map.png"
        eyebrow={t("nomadVisasPage.eyebrow", "TRAVEL & WORK")}
        title={t("nav.nomadVisas")}
        subtitle={t(
          "nomadVisasPage.subtitle",
          "Compare digital nomad visa programs across {{count}} countries",
          { count },
        )}
      >
        <NomadVisaHeroStats
          totalCountries={count}
          taxExemptCount={taxExemptCount}
          freeVisaCount={freeVisaCount}
        />
      </PageHeroBanner>
      <div className="h-0" />
    </div>
  );
}

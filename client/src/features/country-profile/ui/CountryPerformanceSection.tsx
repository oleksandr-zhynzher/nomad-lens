import type { CountryData } from "@core/models";
import { VISIBLE_CATEGORY_KEYS } from "@core/models";
import { ScoreBreakdown } from "@core/ui/indicator";
import { useLocalizedCountry } from "@core/utils";
import { useTranslation } from "react-i18next";

import { CountryTourismSection } from "./CountryTourismSection";

interface CountryPerformanceSectionProps {
  readonly country: CountryData;
}

export function CountryPerformanceSection({ country }: CountryPerformanceSectionProps) {
  const { t } = useTranslation();
  const locC = useLocalizedCountry(country);

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <h2 className="m-0 font-display font-semibold text-[#E8E9EB]">
          {t("countryPage.performanceBreakdown")}
        </h2>
        <span className="flex-1 text-right text-xs text-dimmer">
          {t("countryPage.categoriesSubtitle", {
            count: VISIBLE_CATEGORY_KEYS.length,
            name: locC.name,
          })}
        </span>
      </div>
      <ScoreBreakdown country={country} columns={4} />
      <CountryTourismSection country={country} />
    </>
  );
}

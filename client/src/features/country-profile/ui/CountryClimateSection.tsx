import { useTranslation } from "react-i18next";
import { Droplets, Snowflake, Sun, Thermometer } from "lucide-react";
import type { CountryData } from "@core/models";

interface CountryClimateSectionProps {
  readonly country: CountryData;
}

export function CountryClimateSection({ country }: CountryClimateSectionProps) {
  const { t } = useTranslation();

  if (!country.climateData) return null;

  const seasonLabel = t(`countryPage.seasonLabels.${country.climateData.seasonType}`);

  return (
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
              {country.climateData.annualMeanTemp.toFixed(1)}°C
            </span>
            <span className="text-[10px] text-[#808080]">{t("countryPage.annualMeanTemp")}</span>
          </div>
          <div className="flex flex-col gap-2 rounded-[10px] border border-[#1E1E1E] bg-[#111111] p-5">
            <Droplets size={16} color="#5B8FA8" />
            <span className="font-mono text-[28px] font-bold text-[#E8E9EB]">
              {Math.round(country.climateData.annualPrecipitation)}mm
            </span>
            <span className="text-[10px] text-[#808080]">
              {t("countryPage.annualPrecipitation")}
            </span>
          </div>
          <div className="flex flex-col gap-2 rounded-[10px] border border-[#1E1E1E] bg-[#111111] p-5">
            <Sun size={16} color="#C2956A" />
            <span className="font-mono text-[28px] font-bold text-[#C2956A]">
              {country.climateData.hottestMonth.toFixed(1)}°C
            </span>
            <span className="text-[10px] text-[#808080]">{t("countryPage.hottestMonth")}</span>
          </div>
          <div className="flex flex-col gap-2 rounded-[10px] border border-[#1E1E1E] bg-[#111111] p-5">
            <Snowflake size={16} color="#7BACC8" />
            <span className="font-mono text-[28px] font-bold text-[#7BACC8]">
              {country.climateData.coldestMonth.toFixed(1)}°C
            </span>
            <span className="text-[10px] text-[#808080]">{t("countryPage.coldestMonth")}</span>
          </div>
        </div>
      </div>
    </>
  );
}

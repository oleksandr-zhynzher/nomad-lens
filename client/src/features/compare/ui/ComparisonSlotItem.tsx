import type { ClimatePreferences, CountryData, WeightMap } from "@core/models";
import { Tooltip } from "@core/ui";
import { localizeCountry, regionKey, scoreColourClass } from "@core/utils";
import { applyClimate, computeScore } from "@features/country-ranking/utils";
import { Plane } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ComparisonSlotCard } from "./ComparisonSlotCard";

interface ComparisonSlotItemProps {
  readonly country: CountryData;
  readonly color: string;
  readonly weights: WeightMap;
  readonly climatePrefs: ClimatePreferences;
  readonly lang: string;
  readonly langPrefix: string;
  readonly onRemove: () => void;
}

export function ComparisonSlotItem({
  country,
  weights,
  climatePrefs,
  lang,
  langPrefix,
  onRemove,
}: ComparisonSlotItemProps) {
  const { t } = useTranslation();
  const score = computeScore(applyClimate(country, climatePrefs), weights);
  const countryName = localizeCountry(country, lang).name;
  const countryPath = `${langPrefix}/country/${country.code.toLowerCase()}`;
  return (
    <div className="w-[148px] shrink-0 md:w-[180px]">
      <ComparisonSlotCard
        flagUrl={country.flagUrl}
        countryName={countryName}
        onRemove={onRemove}
        removeLabel={t("compare.removeCountry", {
          country: countryName,
          defaultValue: `Remove ${countryName}`,
        })}
        to={countryPath}
        regionLabel={t(`regions.${regionKey(country.region)}`)}
        nameSuffix={
          country.hasNomadVisa ? (
            <Tooltip content={t("countryDetail.nomadVisa", "Nomad Visa Available")} side="top">
              <span className="inline-flex shrink-0 leading-none text-accent">
                <Plane size={13} aria-hidden="true" />
              </span>
            </Tooltip>
          ) : undefined
        }
      >
        <span
          className={`[font-family:Oswald,_sans-serif] text-[32px] leading-none font-bold ${scoreColourClass(score, "text")}`}
        >
          {score.toFixed(1)}
        </span>
      </ComparisonSlotCard>
    </div>
  );
}

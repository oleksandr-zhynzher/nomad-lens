import { TOURISM_INDICATOR_ICONS } from "@features/indicator-catalog/constants";
import { Palmtree } from "lucide-react";
import { useTranslation } from "react-i18next";

import { IndicatorCard } from "./IndicatorCard";

export function IndicatorsTourismSection() {
  const { t } = useTranslation();
  return (
    <div className="mt-4">
      <div className="mb-4 flex items-center gap-2 border-b border-[#1E1E20] pb-3">
        <Palmtree size={14} color="#6B9E6B" />
        <span className="text-[11px] font-semibold tracking-[1.5px] text-[#6B9E6B] uppercase">
          {t("indicatorsPage.tourismSection", "Tourism Indicators")}
        </span>
        <span className="text-[11px] text-[#606060]">
          {t("indicatorsPage.tourismSectionNote", "— standalone metrics on the Tourism page")}
        </span>
      </div>
      <div className="flex flex-col gap-4">
        {TOURISM_INDICATOR_ICONS.map((row) => (
          <div
            key={row.map(([, k]) => k).join("-")}
            className="flex w-full flex-col gap-4 md:flex-row md:gap-5"
          >
            {row.map(([Icon, key]) => (
              <IndicatorCard
                key={key}
                Icon={Icon}
                name={t(`indicatorsPage.indicators.${key}.name`)}
                description={t(`indicatorsPage.indicators.${key}.description`)}
                source={t(`indicatorsPage.indicators.${key}.source`)}
                weight={t(`indicatorsPage.indicators.${key}.weight`)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

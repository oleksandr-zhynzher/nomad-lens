import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AI_INDICATOR_ICONS } from "@features/indicator-catalog/constants";
import { IndicatorCard } from "./IndicatorCard";

export function IndicatorsAiSection() {
  const { t } = useTranslation();
  return (
    <div className="mt-4">
      <div className="mb-4 flex items-center gap-2 border-b border-[#1E1E20] pb-3">
        <Sparkles size={14} color="#C084FC" />
        <span className="text-[11px] font-semibold tracking-[1.5px] text-[#C084FC] uppercase">
          {t("indicatorsPage.aiSection", "AI-Powered Indicators")}
        </span>
        <span className="text-[11px] text-[#606060]">
          {t("indicatorsPage.aiSectionNote", "— off by default, enable in the weight panel")}
        </span>
      </div>
      <div className="flex flex-col gap-4">
        {AI_INDICATOR_ICONS.map((row) => (
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

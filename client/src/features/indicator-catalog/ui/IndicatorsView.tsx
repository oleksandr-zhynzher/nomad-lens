import { Sparkles, Palmtree } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@core/ui/layout";
import { HeroSection } from "@core/ui/page-hero";
import {
  AI_CATEGORY_KEYS,
  DISPLAYED_CORE_CATEGORY_KEYS,
  TOURISM_CATEGORY_KEYS,
} from "@core/models";
import {
  INDICATOR_ICONS,
  AI_INDICATOR_ICONS,
  TOURISM_INDICATOR_ICONS,
} from "@features/indicator-catalog/constants";
import { IndicatorCard } from "./IndicatorCard";

export function IndicatorsPage() {
  const { t } = useTranslation();
  const coreIndicatorCount = DISPLAYED_CORE_CATEGORY_KEYS.length;
  const aiIndicatorCount = AI_CATEGORY_KEYS.length;
  const tourismIndicatorCount = TOURISM_CATEGORY_KEYS.length;
  const coreIndicatorsLabel = t("indicatorsPage.coreIndicatorsLabel", {
    count: coreIndicatorCount,
  });
  const aiIndicatorsLabel = t("indicatorsPage.aiIndicatorsLabel", {
    count: aiIndicatorCount,
  });
  const tourismIndicatorsLabel = t("indicatorsPage.tourismIndicatorsLabel", {
    count: tourismIndicatorCount,
  });

  return (
    <Layout activePage="indicators">
      <HeroSection
        backgroundImage="/hero-map.png"
        eyebrow={t("indicatorsPage.eyebrow")}
        title={t("indicatorsPage.title")}
        subtitle={t("indicatorsPage.subtitle", {
          coreIndicatorsLabel,
          aiIndicatorsLabel,
          tourismIndicatorsLabel,
        })}
      />

      {/* Content zone */}
      <div className="flex flex-col gap-4 bg-[#0D0D0F] px-4 py-6 md:px-12 md:py-8">
        {INDICATOR_ICONS.map((row) => (
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

        {/* AI indicators section */}
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

        {/* Tourism indicators section */}
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
      </div>
    </Layout>
  );
}

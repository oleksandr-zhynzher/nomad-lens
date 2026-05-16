import { AI_CATEGORY_KEYS } from "@core/models";
import { Layout } from "@core/ui/layout";
import { HeroSection } from "@core/ui/page-hero";
import { AI_INDICATOR_ROWS } from "@features/indicator-catalog/constants";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { AiIndicatorCard } from "./AiIndicatorCard";

export function AiIndicatorsPage() {
  const { t } = useTranslation();
  const aiIndicatorCount = AI_CATEGORY_KEYS.length;

  return (
    <Layout activePage="ai-indicators">
      <HeroSection
        backgroundImage="/hero-map.png"
        eyebrow={t("aiIndicatorsPage.eyebrow")}
        title={t("aiIndicatorsPage.title")}
        subtitle={t("aiIndicatorsPage.subtitle", { count: aiIndicatorCount })}
      />

      {/* Content zone */}
      <div className="flex flex-col gap-4 bg-[#0D0D0F] px-4 py-6 md:px-12 md:py-8">
        {/* Disclaimer banner */}
        <div className="flex items-start gap-3 rounded-lg border border-[rgba(192,132,252,0.2)] bg-[rgba(192,132,252,0.06)] px-5 py-4">
          <AlertTriangle size={18} color="#C084FC" className="mt-0.5 shrink-0" />
          <div className="text-[13px] leading-[1.6] text-[#9E9E9E]">
            {t("aiIndicatorsPage.disclaimer", { count: aiIndicatorCount })}
          </div>
        </div>

        {/* Indicator cards */}
        {AI_INDICATOR_ROWS.map((row) => (
          <div
            key={row.map(([, k]) => k).join("-")}
            className="flex w-full flex-col gap-4 md:flex-row md:gap-5"
          >
            {row.map(([Icon, key]) => {
              const subIndicators = t(`aiIndicatorsPage.indicators.${key}.subIndicators`, {
                returnObjects: true,
              }) as string[];
              return (
                <AiIndicatorCard
                  key={key}
                  Icon={Icon}
                  name={t(`aiIndicatorsPage.indicators.${key}.name`)}
                  description={t(`aiIndicatorsPage.indicators.${key}.description`)}
                  source={t(`aiIndicatorsPage.indicators.${key}.source`)}
                  subIndicators={Array.isArray(subIndicators) ? subIndicators : []}
                />
              );
            })}
          </div>
        ))}
      </div>
    </Layout>
  );
}

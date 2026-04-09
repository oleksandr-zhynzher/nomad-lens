import {
  Users,
  Globe,
  Wallet,
  Smile,
  Wifi,
  Heart,
  AlertTriangle,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "../components/Layout";
import { HeroSection } from "../components/HeroSection";
import { AI_CATEGORY_KEYS } from "../utils/types";

type IconType = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

interface AiIndicatorCardProps {
  Icon: IconType;
  name: string;
  description: string;
  source: string;
  subIndicators: string[];
}

function AiIndicatorCard({
  Icon,
  name,
  description,
  source,
  subIndicators,
}: AiIndicatorCardProps) {
  return (
    <div className="flex flex-1 flex-col gap-3.5 rounded-md border border-[#1E1E20] bg-[#141416] p-6">
      {/* Header row: icon + title + AI badge */}
      <div className="flex items-center gap-3">
        <Icon size={20} color="#C084FC" />
        <span className="text-base font-bold text-[#E8E9EB]">{name}</span>
        <span className="rounded-[4px] bg-[rgba(192,132,252,0.12)] px-[5px] py-px text-[9px] leading-4 font-semibold tracking-[0.5px] text-[#C084FC]">
          AI
        </span>
      </div>

      {/* Description */}
      <div className="text-[13px] leading-[1.6] text-[#8A8A8A]">
        {description}
      </div>

      {/* Sub-indicators */}
      {subIndicators.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.5px] text-[#808080]">
            Sub-indicators
          </span>
          <div className="flex flex-wrap gap-1.5">
            {subIndicators.map((sub) => (
              <span
                key={sub}
                className="rounded-[4px] border border-[rgba(192,132,252,0.15)] bg-[rgba(192,132,252,0.06)] px-2 py-0.5 text-[10px] text-[#C084FC]"
              >
                {sub}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer: source badge */}
      <div className="mt-auto flex items-center gap-2">
        <span className="rounded-[4px] border border-[#252525] bg-[#1A1A1A] px-2 py-[3px] text-[10px] text-[#C084FC]">
          {source}
        </span>
        <span className="text-[11px] text-[#3A3A3A]">
          AI metric — off by default
        </span>
      </div>
    </div>
  );
}

const AI_INDICATOR_ROWS: Array<Array<[IconType, string]>> = [
  [
    [Users, "nomadCommunity"],
    [Globe, "visaFriendliness"],
  ],
  [
    [Wallet, "costEfficiency"],
    [Smile, "workLifeBalance"],
  ],
  [
    [Wifi, "digitalReadiness"],
    [Heart, "culturalFit"],
  ],
];

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
          <AlertTriangle
            size={18}
            color="#C084FC"
            className="mt-0.5 shrink-0"
          />
          <div className="text-[13px] leading-[1.6] text-[#9E9E9E]">
            {t("aiIndicatorsPage.disclaimer", { count: aiIndicatorCount })}
          </div>
        </div>

        {/* Indicator cards */}
        {AI_INDICATOR_ROWS.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="flex flex-col md:flex-row gap-4 md:gap-5 w-full"
          >
            {row.map(([Icon, key]) => {
              const subIndicators: string[] =
                (t(`aiIndicatorsPage.indicators.${key}.subIndicators`, {
                  returnObjects: true,
                }) as string[]) ?? [];
              return (
                <AiIndicatorCard
                  key={key}
                  Icon={Icon}
                  name={t(`aiIndicatorsPage.indicators.${key}.name`)}
                  description={t(
                    `aiIndicatorsPage.indicators.${key}.description`,
                  )}
                  source={t(`aiIndicatorsPage.indicators.${key}.source`)}
                  subIndicators={
                    Array.isArray(subIndicators) ? subIndicators : []
                  }
                />
              );
            })}
          </div>
        ))}
      </div>
    </Layout>
  );
}

import {
  TrendingUp,
  Wallet,
  Wheat,
  HeartPulse,
  GraduationCap,
  Leaf,
  CloudSun,
  ShieldCheck,
  Wifi,
  Smile,
  Users,
  Scale,
  MessageCircle,
  Globe,
  UserCheck,
  Truck,
  TreePine,
  Heart,
  Receipt,
  Briefcase,
  Plane,
  Stethoscope,
  Sparkles,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "../components/Layout";
import { HeroSection } from "../components/HeroSection";
import { AI_CATEGORY_KEYS, DISPLAYED_CORE_CATEGORY_KEYS } from "../utils/types";

interface IndicatorCardProps {
  Icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;
  name: string;
  description: string;
  source: string;
  weight: string;
}

function IndicatorCard({
  Icon,
  name,
  description,
  source,
  weight,
}: IndicatorCardProps) {
  return (
    <div className="flex flex-1 flex-col gap-3.5 rounded-md border border-[#1E1E20] bg-[#141416] p-6">
      {/* Header row: icon + title */}
      <div className="flex items-center gap-3">
        <Icon size={20} color="#8F5A3C" />
        <span className="text-base font-bold text-[#E8E9EB]">{name}</span>
      </div>

      {/* Description */}
      <div className="text-[13px] leading-[1.6] text-[#8A8A8A]">
        {description}
      </div>

      {/* Footer row: source badge + weight */}
      <div className="mt-auto flex items-center gap-2">
        <span className="rounded-[4px] border border-[#252525] bg-[#1A1A1A] px-2 py-[3px] text-[10px] text-[#8F5A3C]">
          {source}
        </span>
        <span className="text-[11px] text-[#3A3A3A]">{weight}</span>
      </div>
    </div>
  );
}

type IconType = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

/** Rows of [Icon, translationKey] pairs — strings come from i18n */
const INDICATOR_ICONS: Array<Array<[IconType, string]>> = [
  [
    [TrendingUp, "economy"],
    [Wallet, "affordability"],
  ],
  [
    [Wheat, "foodSecurity"],
    [HeartPulse, "healthcare"],
  ],
  [
    [GraduationCap, "education"],
    [Leaf, "environment"],
  ],
  [
    [CloudSun, "climate"],
    [ShieldCheck, "safety"],
  ],
  [
    [Wifi, "infrastructure"],
    [Smile, "happiness"],
  ],
  [
    [Users, "humanDevelopment"],
    [Scale, "governance"],
  ],
  [
    [MessageCircle, "englishProficiency"],
    [Globe, "digitalFreedom"],
  ],
  [
    [UserCheck, "personalFreedom"],
    [Truck, "logistics"],
  ],
  [
    [TreePine, "biodiversity"],
    [Heart, "socialTolerance"],
  ],
  [
    [Receipt, "taxFriendliness"],
    [Briefcase, "startupEnvironment"],
  ],
  [
    [Plane, "airConnectivity"],
    [Stethoscope, "healthcareCost"],
  ],
];

const AI_INDICATOR_ICONS: Array<Array<[IconType, string]>> = [
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

export function IndicatorsPage() {
  const { t } = useTranslation();
  const coreIndicatorCount = DISPLAYED_CORE_CATEGORY_KEYS.length;
  const aiIndicatorCount = AI_CATEGORY_KEYS.length;

  return (
    <Layout activePage="indicators">
      <HeroSection
        backgroundImage="/hero-map.png"
        eyebrow={t("indicatorsPage.eyebrow")}
        title={t("indicatorsPage.title")}
        subtitle={t("indicatorsPage.subtitle", {
          coreCount: coreIndicatorCount,
          aiCount: aiIndicatorCount,
        })}
      />

      {/* Content zone */}
      <div className="flex flex-col gap-4 bg-[#0D0D0F] px-4 py-6 md:px-12 md:py-8">
        {INDICATOR_ICONS.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="flex flex-col md:flex-row gap-4 md:gap-5 w-full"
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
            <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#C084FC]">
              {t("indicatorsPage.aiSection", "AI-Powered Indicators")}
            </span>
            <span className="text-[11px] text-[#606060]">
              {t(
                "indicatorsPage.aiSectionNote",
                "— off by default, enable in the weight panel",
              )}
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {AI_INDICATOR_ICONS.map((row, rowIdx) => (
              <div
                key={rowIdx}
                className="flex flex-col md:flex-row gap-4 md:gap-5 w-full"
              >
                {row.map(([Icon, key]) => (
                  <IndicatorCard
                    key={key}
                    Icon={Icon}
                    name={t(`indicatorsPage.indicators.${key}.name`)}
                    description={t(
                      `indicatorsPage.indicators.${key}.description`,
                    )}
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

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
    <div
      style={{
        flex: 1,
        backgroundColor: "#141416",
        borderRadius: "6px",
        border: "1px solid #1E1E20",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      {/* Header row: icon + title */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Icon size={20} color="#8F5A3C" />
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "16px",
            fontWeight: 700,
            color: "#E8E9EB",
          }}
        >
          {name}
        </span>
      </div>

      {/* Description */}
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "13px",
          color: "#8A8A8A",
          lineHeight: 1.6,
        }}
      >
        {description}
      </div>

      {/* Footer row: source badge + weight */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginTop: "auto",
        }}
      >
        <span
          style={{
            backgroundColor: "#1A1A1A",
            border: "1px solid #252525",
            borderRadius: "4px",
            padding: "3px 8px",
            fontFamily: "Inter, sans-serif",
            fontSize: "10px",
            color: "#8F5A3C",
          }}
        >
          {source}
        </span>
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "11px",
            color: "#3A3A3A",
          }}
        >
          {weight}
        </span>
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
      >
        <div className="flex items-center gap-4 md:gap-6">
          <div>
            <div
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "18px",
                fontWeight: 600,
                color: "var(--color-accent-dim)",
                lineHeight: "1",
              }}
            >
              {coreIndicatorCount}
            </div>
            <div
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "10px",
                color: "#757575",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginTop: "4px",
              }}
            >
              {t("hero.indicators")}
            </div>
          </div>
          <div
            className="w-px h-6 md:h-8"
            style={{ backgroundColor: "#333333" }}
          />
          <div>
            <div
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "18px",
                fontWeight: 600,
                color: "var(--color-accent-dim)",
                lineHeight: "1",
              }}
            >
              {aiIndicatorCount}
            </div>
            <div
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "10px",
                color: "#757575",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginTop: "4px",
              }}
            >
              {t("hero.aiIndicators")}
            </div>
          </div>
        </div>
      </HeroSection>

      {/* Content zone */}
      <div
        className="px-4 py-6 md:px-12 md:py-8"
        style={{
          backgroundColor: "#0D0D0F",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
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
        <div style={{ marginTop: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
              paddingBottom: "12px",
              borderBottom: "1px solid #1E1E20",
            }}
          >
            <Sparkles size={14} color="#C084FC" />
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "#C084FC",
              }}
            >
              {t("indicatorsPage.aiSection", "AI-Powered Indicators")}
            </span>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "11px",
                color: "#606060",
              }}
            >
              {t(
                "indicatorsPage.aiSectionNote",
                "— off by default, enable in the weight panel",
              )}
            </span>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
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

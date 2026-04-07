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
      {/* Header row: icon + title + AI badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Icon size={20} color="#C084FC" />
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
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "9px",
            fontWeight: 600,
            color: "#C084FC",
            backgroundColor: "rgba(192, 132, 252, 0.12)",
            padding: "1px 5px",
            borderRadius: "4px",
            letterSpacing: "0.5px",
            lineHeight: "16px",
          }}
        >
          AI
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

      {/* Sub-indicators */}
      {subIndicators.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "10px",
              color: "#808080",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Sub-indicators
          </span>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
            }}
          >
            {subIndicators.map((sub) => (
              <span
                key={sub}
                style={{
                  backgroundColor: "rgba(192, 132, 252, 0.06)",
                  border: "1px solid rgba(192, 132, 252, 0.15)",
                  borderRadius: "4px",
                  padding: "2px 8px",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "10px",
                  color: "#C084FC",
                }}
              >
                {sub}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer: source badge */}
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
            color: "#C084FC",
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

  return (
    <Layout activePage="ai-indicators">
      <HeroSection
        backgroundImage="/hero-map.png"
        eyebrow={t("aiIndicatorsPage.eyebrow")}
        title={t("aiIndicatorsPage.title")}
        subtitle={t("aiIndicatorsPage.subtitle")}
      />

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
        {/* Disclaimer banner */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            backgroundColor: "rgba(192, 132, 252, 0.06)",
            border: "1px solid rgba(192, 132, 252, 0.2)",
            borderRadius: "8px",
            padding: "16px 20px",
          }}
        >
          <AlertTriangle
            size={18}
            color="#C084FC"
            style={{ flexShrink: 0, marginTop: "2px" }}
          />
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              color: "#9E9E9E",
              lineHeight: 1.6,
            }}
          >
            {t("aiIndicatorsPage.disclaimer")}
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

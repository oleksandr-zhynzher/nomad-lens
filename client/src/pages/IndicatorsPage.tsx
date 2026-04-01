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
  Landmark,
  Stethoscope,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { Layout } from "../components/Layout";
import { HeroSection } from "../components/HeroSection";

interface IndicatorCardProps {
  Icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;
  name: string;
  description: string;
  source: string;
  weight: string;
}

function IndicatorCard({ Icon, name, description, source, weight }: IndicatorCardProps) {
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
          color: "#666666",
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
            fontFamily: "Geist, sans-serif",
            fontSize: "10px",
            color: "#8F5A3C",
          }}
        >
          {source}
        </span>
        <span
          style={{
            fontFamily: "Geist, sans-serif",
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

// Transparent placeholder to fill last row when odd card count
function CardPlaceholder() {
  return <div style={{ flex: 1 }} />;
}

type IndicatorRow = (IndicatorCardProps | null)[];

const INDICATORS: IndicatorRow[] = [
  [
    {
      Icon: TrendingUp,
      name: "Economy",
      description:
        "GDP per capita, income inequality, employment rates, and economic stability. Higher scores reflect stronger, more resilient economies with broad-based prosperity.",
      source: "World Bank",
      weight: "Default weight 10%",
    },
    {
      Icon: Wallet,
      name: "Affordability",
      description:
        "Cost of living relative to local income. Covers housing, groceries, transport, and daily expenses using Numbeo and World Bank purchasing power data.",
      source: "Numbeo · World Bank",
      weight: "Default weight 10%",
    },
  ],
  [
    {
      Icon: Wheat,
      name: "Food Security",
      description:
        "Access to sufficient, safe, and nutritious food. FAO data tracks prevalence of undernourishment, food price stability, and agricultural production capacity.",
      source: "FAO",
      weight: "Default weight 7%",
    },
    {
      Icon: HeartPulse,
      name: "Healthcare",
      description:
        "Quality and accessibility of healthcare systems. WHO data covers life expectancy, hospital beds per capita, physician density, and health expenditure.",
      source: "WHO",
      weight: "Default weight 8%",
    },
  ],
  [
    {
      Icon: GraduationCap,
      name: "Education",
      description:
        "Literacy rates, school enrollment, and quality of education institutions. UNESCO tracks years of schooling, tertiary enrollment, and educational attainment.",
      source: "UNESCO · World Bank",
      weight: "Default weight 7%",
    },
    {
      Icon: Leaf,
      name: "Environment",
      description:
        "Air quality, water purity, biodiversity, and ecological sustainability. Yale's Environmental Performance Index scores countries across 32 indicators in 11 categories.",
      source: "Yale EPI",
      weight: "Default weight 7%",
    },
  ],
  [
    {
      Icon: CloudSun,
      name: "Climate",
      description:
        "Temperature comfort, seasonal variation, and climate vulnerability. ND-GAIN measures a country's exposure to climate-related risks and its readiness to adapt.",
      source: "ND-GAIN",
      weight: "Default weight 7%",
    },
    {
      Icon: ShieldCheck,
      name: "Safety",
      description:
        "Personal safety, crime rates, and political stability. The Global Peace Index from the Institute for Economics & Peace ranks 163 nations across 23 indicators.",
      source: "IEP / Vision of Humanity",
      weight: "Default weight 8%",
    },
  ],
  [
    {
      Icon: Wifi,
      name: "Internet & Infrastructure",
      description:
        "Broadband speed, mobile connectivity, digital infrastructure, and access. ITU and Speedtest data track fixed broadband penetration and median download speeds.",
      source: "ITU · Speedtest",
      weight: "Default weight 9%",
    },
    {
      Icon: Smile,
      name: "Happiness",
      description:
        "Subjective wellbeing, life satisfaction, and social support. The World Happiness Report surveys 150,000+ people annually across six key life dimensions.",
      source: "World Happiness Report",
      weight: "Default weight 7%",
    },
  ],
  [
    {
      Icon: Users,
      name: "Human Development",
      description:
        "UNDP's Human Development Index — a composite of life expectancy, education, and gross national income per capita, measuring long-run progress.",
      source: "UNDP HDI",
      weight: "Default weight 8%",
    },
    {
      Icon: Scale,
      name: "Governance",
      description:
        "Rule of law, transparency, and government effectiveness. The World Bank's Worldwide Governance Indicators aggregate 30+ data sources on institutional quality.",
      source: "World Bank WGI",
      weight: "Default weight 8%",
    },
  ],
  [
    {
      Icon: MessageCircle,
      name: "English Proficiency",
      description:
        "English language fluency measured by the EF English Proficiency Index — the world's largest ranking based on tests taken by 2.2 million adults in 113 countries.",
      source: "EF EPI",
      weight: "Default weight 4%",
    },
    {
      Icon: Globe,
      name: "Digital Freedom",
      description:
        "Internet freedom measured by Freedom House's Freedom on the Net report — covering censorship, surveillance, content restrictions, and access to VPNs.",
      source: "Freedom House",
      weight: "Default weight 4%",
    },
  ],
  [
    {
      Icon: UserCheck,
      name: "Personal Freedom",
      description:
        "CATO Institute's Human Freedom Index personal sub-index — freedom of movement, expression, association, religion, and personal autonomy.",
      source: "CATO HFI",
      weight: "Default weight 4%",
    },
    {
      Icon: Truck,
      name: "Logistics & Transport",
      description:
        "World Bank Logistics Performance Index — customs efficiency, infrastructure quality, timeliness, and international shipping capability.",
      source: "World Bank LPI",
      weight: "Default weight 4%",
    },
  ],
  [
    {
      Icon: TreePine,
      name: "Biodiversity & Nature",
      description:
        "Protected land area and forest coverage from World Bank data — access to natural parks, green spaces, and outdoor activities for nomads.",
      source: "World Bank",
      weight: "Default weight 4%",
    },
    {
      Icon: Heart,
      name: "Social Tolerance",
      description:
        "LGBTQ+ rights composite score — marriage equality, civil unions, anti-discrimination protections, and legal status from ILGA and Equaldex databases.",
      source: "ILGA · Equaldex",
      weight: "Default weight 4%",
    },
  ],
  [
    {
      Icon: Receipt,
      name: "Tax Friendliness",
      description:
        "Heritage Foundation Tax Burden score combined with tax revenue as % of GDP — lighter-tax countries score higher, relevant for nomad tax planning.",
      source: "Heritage Foundation · World Bank",
      weight: "Default weight 4%",
    },
    {
      Icon: Briefcase,
      name: "Startup Environment",
      description:
        "Heritage Foundation Business Freedom score — ease of starting, operating, and closing a business. Covers regulatory burden and licensing requirements.",
      source: "Heritage Foundation",
      weight: "Default weight 4%",
    },
  ],
  [
    {
      Icon: Plane,
      name: "Air Connectivity",
      description:
        "Air passengers carried (World Bank) and number of countries reachable via direct flights (OpenFlights) — route connectivity for frequent-flying digital nomads.",
      source: "World Bank · OpenFlights",
      weight: "Default weight 4%",
    },
    {
      Icon: Landmark,
      name: "Cultural Heritage",
      description:
        "UNESCO World Heritage Sites count — cultural richness, historical significance, and tourism appeal for nomads seeking cultural experiences.",
      source: "UNESCO",
      weight: "Default weight 4%",
    },
  ],
  [
    {
      Icon: Stethoscope,
      name: "Healthcare Cost",
      description:
        "Out-of-pocket health expenditure as percentage of total health spending — lower out-of-pocket costs mean more accessible and affordable healthcare.",
      source: "World Bank",
      weight: "Default weight 4%",
    },
    null,
  ],
];

export function IndicatorsPage() {
  return (
    <Layout activePage="indicators">
      <HeroSection
        backgroundImage="/hero-map.png"
        eyebrow="REFERENCE"
        title="INDICATORS"
        subtitle="How each score is calculated — data sources, methodology, and weighting."
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
        {INDICATORS.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="flex flex-col md:flex-row gap-4 md:gap-5 w-full"
          >
            {row.map((card, cardIdx) =>
              card ? (
                <IndicatorCard key={card.name} {...card} />
              ) : (
                <CardPlaceholder key={`ph-${cardIdx}`} />
              ),
            )}
          </div>
        ))}
      </div>
    </Layout>
  );
}

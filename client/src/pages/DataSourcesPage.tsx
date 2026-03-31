import { InfoPageHeader } from "../components/InfoPageHeader";
import { HeroSection } from "../components/HeroSection";

interface DataSourceCardProps {
  name: string;
  category: string;
  description: string;
  tags: string[];
}

function DataSourceCard({ name, category, description, tags }: DataSourceCardProps) {
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
        gap: "12px",
      }}
    >
      {/* Title */}
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "16px",
          fontWeight: 600,
          color: "#E8E9EB",
        }}
      >
        {name}
      </div>

      {/* Category badge */}
      <div
        style={{
          display: "inline-flex",
          alignSelf: "flex-start",
          backgroundColor: "#1A1A1A",
          border: "1px solid #252525",
          borderRadius: "4px",
          padding: "3px 8px",
          fontFamily: "Geist, sans-serif",
          fontSize: "10px",
          fontWeight: "normal" as const,
          letterSpacing: "1px",
          color: "#555555",
        }}
      >
        {category}
      </div>

      {/* Description */}
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "13px",
          color: "#666666",
          lineHeight: 1.5,
        }}
      >
        {description}
      </div>

      {/* Footer row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginTop: "auto",
        }}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            style={{
              backgroundColor: "#1D1008",
              border: "1px solid #4A2C1A",
              borderRadius: "3px",
              padding: "2px 6px",
              fontFamily: "Geist, sans-serif",
              fontSize: "10px",
              color: "#C2956A",
            }}
          >
            {tag}
          </span>
        ))}
        <div style={{ flex: 1 }} />
        <span
          style={{
            fontFamily: "Geist, sans-serif",
            fontSize: "11px",
            color: "#444444",
          }}
        >
          Updated annually
        </span>
      </div>
    </div>
  );
}

const DATA_SOURCES: DataSourceCardProps[][] = [
  [
    {
      name: "World Bank",
      category: "MULTILATERAL",
      description: "Comprehensive development data covering 200+ countries",
      tags: ["Economy", "Governance", "Education"],
    },
    {
      name: "WHO",
      category: "UN AGENCY",
      description: "Global health statistics and epidemiological data",
      tags: ["Healthcare", "Food Security"],
    },
  ],
  [
    {
      name: "UNDP",
      category: "UN AGENCY",
      description: "Human Development Index combining health, education, and income",
      tags: ["Human Development"],
    },
    {
      name: "ITU",
      category: "UN AGENCY",
      description: "Global ICT statistics and connectivity data",
      tags: ["Internet", "Infrastructure"],
    },
  ],
  [
    {
      name: "Yale EPI",
      category: "ACADEMIC",
      description: "Environmental Performance Index measuring 180 countries",
      tags: ["Environment"],
    },
    {
      name: "IEP / Vision of Humanity",
      category: "NGO",
      description: "Global Peace Index measuring societal safety and security",
      tags: ["Safety"],
    },
  ],
  [
    {
      name: "World Happiness Report",
      category: "ACADEMIC",
      description: "Annual survey-based wellbeing and life satisfaction scores",
      tags: ["Happiness"],
    },
    {
      name: "EF Education First",
      category: "PRIVATE",
      description: "World's largest ranking of English skills by country",
      tags: ["English Proficiency"],
    },
  ],
  [
    {
      name: "FAO",
      category: "UN AGENCY",
      description: "Food and Agriculture Organization nutritional and security data",
      tags: ["Food Security"],
    },
    {
      name: "ND-GAIN",
      category: "ACADEMIC",
      description: "Notre Dame climate vulnerability and readiness index",
      tags: ["Climate"],
    },
  ],
];

export function DataSourcesPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D0D0F" }}>
      <InfoPageHeader activePage="data-sources" />
      <HeroSection
        backgroundImage="/images/generated-1774980841973.png"
        eyebrow="REFERENCE"
        title="DATA SOURCES"
        subtitle="Transparent methodology — every score is traceable to its origin."
      />

      {/* Content zone */}
      <div
        style={{
          backgroundColor: "#0D0D0F",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          padding: "32px 48px",
        }}
      >
        {DATA_SOURCES.map((row, rowIdx) => (
          <div
            key={rowIdx}
            style={{
              display: "flex",
              gap: "16px",
              width: "100%",
            }}
          >
            {row.map((card) => (
              <DataSourceCard key={card.name} {...card} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

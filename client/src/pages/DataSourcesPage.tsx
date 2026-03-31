const BADGE_STYLES: Record<string, { bg: string; color: string }> = {
  MULTILATERAL: { bg: "#1C1A0E", color: "#C2956A" },
  "UN AGENCY":  { bg: "#0E1A1A", color: "#6ABFC2" },
  ACADEMIC:     { bg: "#0E1018", color: "#7B9FD4" },
  NGO:          { bg: "#1A0E0E", color: "#C27B7B" },
  PRIVATE:      { bg: "#150E1A", color: "#A87BD4" },
};

interface Source {
  name: string;
  type: keyof typeof BADGE_STYLES;
  description: string;
  tags: string[];
}

const SOURCES: Source[] = [
  {
    name: "World Bank",
    type: "MULTILATERAL",
    description: "Comprehensive development data covering 200+ countries",
    tags: ["Economy", "Governance", "Education"],
  },
  {
    name: "WHO",
    type: "UN AGENCY",
    description: "Global health statistics and epidemiological data",
    tags: ["Healthcare", "Food Security"],
  },
  {
    name: "UNDP",
    type: "UN AGENCY",
    description: "Human Development Index combining health, education, and income",
    tags: ["Human Development"],
  },
  {
    name: "ITU",
    type: "UN AGENCY",
    description: "Global ICT statistics and connectivity data",
    tags: ["Internet", "Infrastructure"],
  },
  {
    name: "Yale EPI",
    type: "ACADEMIC",
    description: "Environmental Performance Index measuring 180 countries",
    tags: ["Environment"],
  },
  {
    name: "IEP / Vision of Humanity",
    type: "NGO",
    description: "Global Peace Index measuring societal safety and security",
    tags: ["Safety"],
  },
  {
    name: "World Happiness Report",
    type: "ACADEMIC",
    description: "Annual survey-based wellbeing and life satisfaction scores",
    tags: ["Happiness"],
  },
  {
    name: "EF Education First",
    type: "PRIVATE",
    description: "World's largest ranking of English skills by country",
    tags: ["English Proficiency"],
  },
  {
    name: "FAO",
    type: "UN AGENCY",
    description: "Food and Agriculture Organization nutritional and security data",
    tags: ["Food Security"],
  },
  {
    name: "ND-GAIN",
    type: "ACADEMIC",
    description: "Notre Dame climate vulnerability and readiness index",
    tags: ["Climate"],
  },
];

const TAG_BG = "#1C1C1C";
const TAG_COLOR = "#888888";
const TAG_BORDER = "1px solid #2A2A2A";

function SourceCard({ source }: { source: Source }) {
  const badge = BADGE_STYLES[source.type];
  return (
    <div
      style={{
        backgroundColor: "#161A1D",
        border: "1px solid #1E1E1E",
        borderRadius: "8px",
        padding: "24px",
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {/* Name */}
      <div
        style={{
          fontFamily: "Geist, sans-serif",
          fontSize: "16px",
          fontWeight: 600,
          color: "#FFFFFF",
        }}
      >
        {source.name}
      </div>

      {/* Type badge */}
      <div style={{ display: "flex" }}>
        <span
          style={{
            fontFamily: "Geist, sans-serif",
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "1px",
            textTransform: "uppercase",
            backgroundColor: badge.bg,
            color: badge.color,
            borderRadius: "3px",
            padding: "2px 8px",
          }}
        >
          {source.type}
        </span>
      </div>

      {/* Description */}
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "13px",
          color: "#AAAAAA",
          lineHeight: "1.5",
          margin: 0,
          flex: 1,
        }}
      >
        {source.description}
      </p>

      {/* Tags + updated label */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {source.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontFamily: "Geist, sans-serif",
                fontSize: "11px",
                backgroundColor: TAG_BG,
                color: TAG_COLOR,
                border: TAG_BORDER,
                borderRadius: "3px",
                padding: "2px 8px",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        <span
          style={{
            fontFamily: "Geist, sans-serif",
            fontSize: "11px",
            color: "#555555",
            whiteSpace: "nowrap",
          }}
        >
          Updated annually
        </span>
      </div>
    </div>
  );
}

export function DataSourcesPage() {
  const rows: [Source, Source | null][] = [];
  for (let i = 0; i < SOURCES.length; i += 2) {
    rows.push([SOURCES[i], SOURCES[i + 1] ?? null]);
  }

  return (
    <div style={{ backgroundColor: "#0D0D0F", minHeight: "calc(100vh - 56px)" }}>
      {/* Hero */}
      <div
        style={{
          position: "relative",
          height: "180px",
          overflow: "hidden",
          backgroundColor: "#0F1114",
        }}
      >
        {/* Background image */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('/images/generated-1774980841973.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(13,13,15,0.3) 0%, #0D0D0F 100%)",
          }}
        />
        {/* Hero text */}
        <div
          style={{
            position: "relative",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 48px",
            gap: "10px",
          }}
        >
          <span
            style={{
              fontFamily: "Geist, sans-serif",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "var(--color-accent-dim)",
            }}
          >
            REFERENCE
          </span>
          <h1
            style={{
              fontFamily: "Anton, sans-serif",
              fontSize: "64px",
              fontWeight: 400,
              lineHeight: "0.95",
              color: "#FFFFFF",
              margin: 0,
            }}
          >
            DATA SOURCES
          </h1>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              color: "#888888",
              margin: 0,
            }}
          >
            Transparent methodology — every score is traceable to its origin.
          </p>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          padding: "32px 48px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {rows.map((row, i) => (
          <div
            key={i}
            style={{ display: "flex", gap: "16px" }}
          >
            <SourceCard source={row[0]} />
            {row[1] ? <SourceCard source={row[1]} /> : <div style={{ flex: 1 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

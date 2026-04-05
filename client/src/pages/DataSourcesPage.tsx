import { useTranslation } from "react-i18next";
import { Layout } from "../components/Layout";
import { HeroSection } from "../components/HeroSection";

interface DataSourceCardProps {
  name: string;
  category: string;
  description: string;
  tags: string[];
}

function DataSourceCard({
  name,
  category,
  description,
  tags,
}: DataSourceCardProps) {
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
          fontFamily: "Inter, sans-serif",
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
              fontFamily: "Inter, sans-serif",
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
            fontFamily: "Inter, sans-serif",
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

/** Rows of translation keys — names/categories/etc. come from i18n */
const DATA_SOURCE_KEYS: string[][] = [
  ["worldBank", "who"],
  ["undp", "itu"],
  ["yaleEpi", "iep"],
  ["worldHappiness", "ef"],
  ["fao", "ndGain"],
];

export function DataSourcesPage() {
  const { t } = useTranslation();
  return (
    <Layout activePage="data-sources">
      <HeroSection
        backgroundImage="/hero-map.png"
        eyebrow={t("dataSourcesPage.eyebrow")}
        title={t("dataSourcesPage.title")}
        subtitle={t("dataSourcesPage.subtitle")}
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
        {DATA_SOURCE_KEYS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex flex-col md:flex-row gap-4 w-full">
            {row.map((key) => (
              <DataSourceCard
                key={key}
                name={t(`dataSourcesPage.sources.${key}.name`)}
                category={t(`dataSourcesPage.sources.${key}.category`)}
                description={t(`dataSourcesPage.sources.${key}.description`)}
                tags={
                  t(`dataSourcesPage.sources.${key}.tags`, {
                    returnObjects: true,
                  }) as string[]
                }
              />
            ))}
          </div>
        ))}
      </div>
    </Layout>
  );
}

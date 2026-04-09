import { useTranslation } from "react-i18next";
import { Layout } from "../components/Layout";
import { HeroSection } from "../components/HeroSection";
import { DATA_SOURCE_KEYS } from "../utils/dataSources";

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
    <div className="flex flex-1 flex-col gap-3 rounded-md border border-[#1E1E20] bg-[#141416] p-6">
      {/* Title */}
      <div className="text-base font-semibold text-[#E8E9EB]">{name}</div>

      {/* Category badge */}
      <div className="inline-flex self-start rounded-[4px] border border-[#252525] bg-[#1A1A1A] px-2 py-[3px] text-[10px] font-normal tracking-[1px] text-[#808080]">
        {category}
      </div>

      {/* Description */}
      <div className="text-[13px] leading-[1.5] text-[#8A8A8A]">
        {description}
      </div>

      {/* Footer row */}
      <div className="mt-auto flex items-center gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-[3px] border border-[#4A2C1A] bg-[#1D1008] px-1.5 py-0.5 text-[10px] text-[#C2956A]"
          >
            {tag}
          </span>
        ))}
        <div className="flex-1" />
        <span className="text-[11px] text-[#757575]">Updated annually</span>
      </div>
    </div>
  );
}

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
      <div className="flex flex-col gap-4 bg-[#0D0D0F] px-4 py-6 md:px-12 md:py-8">
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

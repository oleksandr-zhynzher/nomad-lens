import {
  House,
  ShoppingCart,
  UtensilsCrossed,
  Bus,
  Zap,
  Laptop,
  HeartPulse,
  AlertTriangle,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "../components/Layout";
import { HeroSection } from "../components/HeroSection";
import { COST_COLORS } from "../utils/budgetColors";

type IconType = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

const CATEGORY_COLORS = COST_COLORS;

interface BudgetCategoryCardProps {
  Icon: IconType;
  name: string;
  description: string;
  source: string;
  methodology: string;
  color: string;
}

function BudgetCategoryCard({
  Icon,
  name,
  description,
  source,
  methodology,
  color,
}: BudgetCategoryCardProps) {
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
        <Icon size={20} color={color} />
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

      {/* Methodology */}
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "12px",
          color: "#555555",
          lineHeight: 1.5,
          borderLeft: `2px solid ${color}`,
          paddingLeft: "10px",
        }}
      >
        {methodology}
      </div>

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
            color,
          }}
        >
          {source}
        </span>
      </div>
    </div>
  );
}

const CATEGORY_ROWS: Array<Array<[IconType, string]>> = [
  [
    [House, "housing"],
    [ShoppingCart, "groceries"],
  ],
  [
    [UtensilsCrossed, "dining"],
    [Bus, "transport"],
  ],
  [
    [Zap, "utilities"],
    [Laptop, "coworking"],
  ],
  [[HeartPulse, "healthInsurance"]],
];

export function BudgetCategoriesPage() {
  const { t } = useTranslation();

  return (
    <Layout activePage="budget-categories">
      <HeroSection
        backgroundImage="/hero-map.png"
        eyebrow={t("budgetCategoriesPage.eyebrow")}
        title={t("budgetCategoriesPage.title")}
        subtitle={t("budgetCategoriesPage.subtitle")}
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
              color: "#999999",
              lineHeight: 1.6,
            }}
          >
            {t("budgetCategoriesPage.disclaimer")}
          </div>
        </div>

        {/* Category cards */}
        {CATEGORY_ROWS.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="flex flex-col md:flex-row gap-4 md:gap-5 w-full"
          >
            {row.map(([Icon, key]) => (
              <BudgetCategoryCard
                key={key}
                Icon={Icon}
                name={t(`budgetCategoriesPage.categories.${key}.name`)}
                description={t(
                  `budgetCategoriesPage.categories.${key}.description`,
                )}
                source={t(`budgetCategoriesPage.categories.${key}.source`)}
                methodology={t(
                  `budgetCategoriesPage.categories.${key}.methodology`,
                )}
                color={CATEGORY_COLORS[key] ?? "#555"}
              />
            ))}
          </div>
        ))}
      </div>
    </Layout>
  );
}

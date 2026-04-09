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
  accentBorderClassName: string;
  accentTextClassName: string;
}

function BudgetCategoryCard({
  Icon,
  name,
  description,
  source,
  methodology,
  color,
  accentBorderClassName,
  accentTextClassName,
}: BudgetCategoryCardProps) {
  return (
    <div className="flex flex-1 flex-col gap-3.5 rounded-md border border-[#1E1E20] bg-[#141416] p-6">
      {/* Header row: icon + title */}
      <div className="flex items-center gap-3">
        <Icon size={20} color={color} />
        <span className="text-base font-bold text-[#E8E9EB]">{name}</span>
      </div>

      {/* Description */}
      <div className="text-[13px] leading-[1.6] text-[#8A8A8A]">
        {description}
      </div>

      {/* Methodology */}
      <div
        className={`border-l-2 pl-2.5 text-xs leading-[1.5] text-[#808080] ${accentBorderClassName}`}
      >
        {methodology}
      </div>

      {/* Footer: source badge */}
      <div className="mt-auto flex items-center gap-2">
        <span
          className={`rounded-[4px] border border-[#252525] bg-[#1A1A1A] px-2 py-[3px] text-[10px] ${accentTextClassName}`}
        >
          {source}
        </span>
      </div>
    </div>
  );
}

const CATEGORY_ACCENT_CLASSES: Record<
  string,
  { border: string; text: string }
> = {
  housing: { border: "border-[#8F5A3C]", text: "text-[#8F5A3C]" },
  groceries: { border: "border-[#6B9E6B]", text: "text-[#6B9E6B]" },
  dining: { border: "border-[#C2956A]", text: "text-[#C2956A]" },
  transport: { border: "border-[#5B8FA8]", text: "text-[#5B8FA8]" },
  utilities: { border: "border-[#7A9B6B]", text: "text-[#7A9B6B]" },
  coworking: { border: "border-[#8B7BAD]", text: "text-[#8B7BAD]" },
  healthInsurance: { border: "border-[#C07A9B]", text: "text-[#C07A9B]" },
};

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
      <div className="flex flex-col gap-4 bg-[#0D0D0F] px-4 py-6 md:px-12 md:py-8">
        {/* Disclaimer banner */}
        <div className="flex items-start gap-3 rounded-lg border border-[rgba(192,132,252,0.2)] bg-[rgba(192,132,252,0.06)] px-5 py-4">
          <AlertTriangle
            size={18}
            color="#C084FC"
            className="mt-0.5 shrink-0"
          />
          <div className="text-[13px] leading-[1.6] text-[#9E9E9E]">
            {t("budgetCategoriesPage.disclaimer")}
          </div>
        </div>

        {/* Category cards */}
        {CATEGORY_ROWS.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="flex flex-col md:flex-row gap-4 md:gap-5 w-full"
          >
            {row.map(([Icon, key]) => {
              const accentClasses = CATEGORY_ACCENT_CLASSES[key] ?? {
                border: "border-[#555555]",
                text: "text-[#555555]",
              };
              return (
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
                  accentBorderClassName={accentClasses.border}
                  accentTextClassName={accentClasses.text}
                />
              );
            })}
          </div>
        ))}
      </div>
    </Layout>
  );
}

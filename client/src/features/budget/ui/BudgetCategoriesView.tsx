import { Layout } from "@core/ui/layout";
import { HeroSection } from "@core/ui/page-hero";
import { COST_COLORS } from "@features/budget/constants";
import {
  CATEGORY_ACCENT_CLASSES,
  CATEGORY_ROWS,
} from "@features/budget/constants/budget-categories.constants";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { BudgetCategoryCard } from "./BudgetCategoryCard";

const CATEGORY_COLORS = COST_COLORS;

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
          <AlertTriangle size={18} color="#C084FC" className="mt-0.5 shrink-0" />
          <div className="text-[13px] leading-[1.6] text-[#9E9E9E]">
            {t("budgetCategoriesPage.disclaimer")}
          </div>
        </div>

        {/* Category cards */}
        {CATEGORY_ROWS.map((row) => (
          <div
            key={row.map(([, k]) => k).join("-")}
            className="flex w-full flex-col gap-4 md:flex-row md:gap-5"
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
                  description={t(`budgetCategoriesPage.categories.${key}.description`)}
                  source={t(`budgetCategoriesPage.categories.${key}.source`)}
                  methodology={t(`budgetCategoriesPage.categories.${key}.methodology`)}
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

import { HeroStat, HeroStatDivider, HeroStats, PageHeroBanner } from "@core/ui/page-hero";
import { BUDGET_CATEGORIES } from "@features/budget/constants";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface BudgetHeroSectionProps {
  readonly matchesCount: number;
  readonly budget: number;
  readonly langPrefix: string;
}

export function BudgetHeroSection({ matchesCount, budget, langPrefix }: BudgetHeroSectionProps) {
  const { t } = useTranslation();
  return (
    <PageHeroBanner
      backgroundImage="/hero-map.png"
      eyebrow=""
      title={t("budget.eyebrow", "BUDGET MATCHER")}
      subtitle={t(
        "budget.subtitle",
        "Enter your monthly budget and discover which countries offer the best lifestyle for your money",
      )}
    >
      <HeroStats>
        <HeroStat
          value={matchesCount > 0 ? matchesCount : "—"}
          label={t("budget.stats.matchedCountries", { count: matchesCount })}
        />
        <HeroStatDivider />
        <HeroStat value={`$${budget.toLocaleString()}`} label={t("budget.perMonth", "/ MONTH")} />
        <HeroStatDivider />
        <HeroStat
          as={Link}
          to={`${langPrefix}/budget-categories`}
          value={BUDGET_CATEGORIES.length}
          label={t("budget.stats.categories", { count: BUDGET_CATEGORIES.length })}
        />
      </HeroStats>
    </PageHeroBanner>
  );
}

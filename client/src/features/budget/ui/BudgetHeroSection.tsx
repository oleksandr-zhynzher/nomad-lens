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
    <div
      className="relative -mx-4 mb-6 overflow-hidden md:mx-0 md:mb-6 md:rounded-lg"
      style={{
        background: "#0A0A0F",
        backgroundImage: "url('/hero-map.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.85) 100%)",
        }}
      />
      <div className="relative flex min-h-[160px] flex-col justify-end px-4 py-4 md:px-12 md:py-12">
        <h1 className="mb-2 font-display text-3xl leading-[0.95] font-semibold text-white md:text-6xl">
          {t("budget.eyebrow", "BUDGET MATCHER")}
        </h1>
        <p className="mb-5 hidden max-w-[580px] text-[15px] text-dim md:block">
          {t(
            "budget.subtitle",
            "Enter your monthly budget and discover which countries offer the best lifestyle for your money",
          )}
        </p>
        <div className="mb-4 hidden h-0.5 w-32 bg-accent md:block" />
        <div className="hero-stats-row hero-banner-stats">
          <div className="min-w-0">
            <div className="font-mono text-lg leading-none font-semibold text-accent-dim">
              {matchesCount > 0 ? matchesCount : "—"}
            </div>
            <div className="mt-1 text-[10px] tracking-[1px] text-dimmest uppercase">
              {t("budget.stats.matchedCountries", { count: matchesCount })}
            </div>
          </div>
          <div className="hero-stat-divider" />
          <div className="min-w-0">
            <div className="font-mono text-lg leading-none font-semibold text-accent-dim">
              ${budget.toLocaleString()}
            </div>
            <div className="mt-1 text-[10px] tracking-[1px] text-dimmest uppercase">
              {t("budget.perMonth", "/ MONTH")}
            </div>
          </div>
          <div className="hero-stat-divider" />
          <Link to={`${langPrefix}/budget-categories`} className="min-w-0 no-underline">
            <div>
              <div className="font-mono text-lg leading-none font-semibold text-accent-dim">
                {BUDGET_CATEGORIES.length}
              </div>
              <div className="mt-1 text-[10px] tracking-[1px] text-dimmest uppercase">
                {t("budget.stats.categories", { count: BUDGET_CATEGORIES.length })}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

import { TOURISM_COST_COLORS } from "@features/budget/constants";
import type { TourismBudgetMatch } from "@features/tourism/utils";
import { Compass, House, ShoppingCart } from "lucide-react";
import type React from "react";
import { useTranslation } from "react-i18next";

import { TourismSurplusCard, TourismTotalCard } from "./TourismBudgetSummaryCards";

const CARD_META = {
  accommodation: { icon: <House size={17} color="#C88B56" />, accent: "#C88B56" },
  food: { icon: <ShoppingCart size={17} color="#7EA66E" />, accent: "#7EA66E" },
  activities: { icon: <Compass size={17} color="#5F92B8" />, accent: "#5F92B8" },
} satisfies Record<string, { icon: React.ReactNode; accent: string }>;

interface TourismBudgetBreakdownGridProps {
  readonly budgetMatch: TourismBudgetMatch;
}

export function TourismBudgetBreakdownGrid({ budgetMatch }: TourismBudgetBreakdownGridProps) {
  const { t } = useTranslation();
  const totalDaily = budgetMatch.dailyCost;
  const rows = (["accommodation", "food", "activities"] as const).map((cat) => ({
    cat,
    amount: budgetMatch.breakdown[cat],
    color: TOURISM_COST_COLORS[cat] ?? "#666666",
    width:
      totalDaily > 0
        ? Math.max(8, Math.min(100, (budgetMatch.breakdown[cat] / totalDaily) * 100))
        : 0,
  }));

  return (
    <div className="mt-4 rounded-[10px] border border-[#2A2D33] p-[14px] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] [background:linear-gradient(180deg,rgba(18,19,22,0.96)_0%,rgba(11,12,14,0.98)_100%)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[10px] font-bold tracking-[1.7px] text-[#A6ADB8] uppercase">
          {t("tourismBudget.costBreakdown", "Daily Cost Breakdown")}
        </div>
        <span className="inline-flex h-5 items-center rounded-full border border-[#343A44] bg-[#171A1F] px-2 font-mono text-[11px] font-semibold text-[#D8DEE9]">
          ${totalDaily}/d
        </span>
      </div>
      <div className="grid grid-cols-2 gap-[10px] md:grid-cols-5">
        {rows.map(({ cat, amount, color, width }) => {
          const meta = CARD_META[cat];
          return (
            <div
              key={cat}
              className="flex min-h-[102px] flex-col justify-between rounded-[10px] border border-[#2B313A] bg-[#0C0F13] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="inline-flex size-7 items-center justify-center rounded-[8px] border border-[var(--acc-b)] bg-[#161A20]"
                  style={{ "--acc-b": `${meta.accent}44` } as React.CSSProperties}
                >
                  {meta.icon}
                </span>
                <span className="font-mono text-[17px] leading-none font-bold text-[#ECEFF4]">
                  ${amount}
                </span>
              </div>
              <div className="mt-2 text-[10px] font-semibold tracking-[0.8px] text-[#8E96A3] uppercase">
                {t(`tourismBudget.categories.${cat}`, cat.charAt(0).toUpperCase() + cat.slice(1))}
              </div>
              <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-[#232A33]">
                <div
                  className="h-full w-[var(--bw)] rounded-full bg-[var(--bc)]"
                  style={{ "--bw": `${width}%`, "--bc": color } as React.CSSProperties}
                />
              </div>
            </div>
          );
        })}
        <TourismTotalCard totalDaily={totalDaily} />
        <TourismSurplusCard surplus={budgetMatch.surplus} />
      </div>
    </div>
  );
}

import type React from "react";
import { House, ShoppingCart, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLangPrefix } from "@core/hooks";
import { TourismBreakdownChart } from "./TourismBreakdownChart";
import { TOURISM_COST_COLORS } from "@features/budget/constants";
import type { TourismBudgetMatch } from "@features/tourism/utils";
import type { CountryData } from "@core/models";

interface TourismCountryCardDetailProps {
  country: CountryData;
  budgetMatch?: TourismBudgetMatch;
  borderColor: string;
}

export function TourismCountryCardDetail({
  country,
  budgetMatch,
  borderColor,
}: TourismCountryCardDetailProps) {
  const { t } = useTranslation();
  const langPrefix = useLangPrefix();

  return (
    <div
      className="border-t border-[var(--bt-c)] bg-[#111113] px-4 py-4"
      style={{ "--bt-c": borderColor } as React.CSSProperties}
    >
      <TourismBreakdownChart country={country} />

      {/* Budget breakdown */}
      {budgetMatch
        ? (() => {
            const totalDaily = budgetMatch.dailyCost;
            const rows = (["accommodation", "food", "activities"] as const).map((cat) => {
              const amount = budgetMatch.breakdown[cat];
              return {
                cat,
                amount,
                color: TOURISM_COST_COLORS[cat] ?? "#666666",
                width: totalDaily > 0 ? Math.max(8, Math.min(100, (amount / totalDaily) * 100)) : 0,
              };
            });

            const cardMeta: Record<
              (typeof rows)[number]["cat"],
              { icon: React.ReactNode; accent: string }
            > = {
              accommodation: { icon: <House size={17} color="#C88B56" />, accent: "#C88B56" },
              food: { icon: <ShoppingCart size={17} color="#7EA66E" />, accent: "#7EA66E" },
              activities: { icon: <Compass size={17} color="#5F92B8" />, accent: "#5F92B8" },
            };

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
                    const meta = cardMeta[cat];
                    return (
                      <div
                        key={cat}
                        className="flex min-h-[102px] flex-col justify-between rounded-[10px] border border-[#2B313A] bg-[#0C0F13] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] border border-[var(--acc-b)] bg-[#161A20]"
                            style={{ "--acc-b": `${meta.accent}44` } as React.CSSProperties}
                          >
                            {meta.icon}
                          </span>
                          <span className="font-mono text-[17px] leading-none font-bold text-[#ECEFF4]">
                            ${amount}
                          </span>
                        </div>
                        <div className="mt-2 text-[10px] font-semibold tracking-[0.8px] text-[#8E96A3] uppercase">
                          {t(
                            `tourismBudget.categories.${cat}`,
                            cat.charAt(0).toUpperCase() + cat.slice(1),
                          )}
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

                  {/* Total card */}
                  <div className="flex min-h-[102px] flex-col justify-between rounded-[10px] border border-[#2B313A] bg-[#0C0F13] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] border border-[#3C4F3F] bg-[#161A20] font-mono text-xs font-bold text-[#58C26D]">
                        Σ
                      </span>
                      <span className="font-mono text-[17px] leading-none font-bold text-[#58C26D]">
                        ${totalDaily}
                      </span>
                    </div>
                    <div className="mt-2 text-[10px] font-semibold tracking-[0.8px] text-[#8E96A3] uppercase">
                      {t("tourismBudget.total", "Total")}
                    </div>
                    <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-[#232A33]">
                      <div className="h-full w-full rounded-full bg-[#58C26D]" />
                    </div>
                  </div>

                  {/* Surplus card */}
                  <div
                    className={`flex min-h-[102px] flex-col justify-between rounded-[10px] bg-[#0C0F13] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] ${budgetMatch.surplus >= 0 ? "border border-[#2D6E3A]" : "border border-[#6C3A2D]"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-[8px] font-mono text-xs font-bold ${budgetMatch.surplus >= 0 ? "border border-[#2D6E3A] bg-[#17301D] text-[#58C26D]" : "border border-[#6C3A2D] bg-[#321A16] text-[#FF7A59]"}`}
                      >
                        {budgetMatch.surplus >= 0 ? "+" : "-"}
                      </span>
                      <span
                        className={`font-mono text-[17px] leading-none font-bold ${budgetMatch.surplus >= 0 ? "text-[#58C26D]" : "text-[#FF7A59]"}`}
                      >
                        {budgetMatch.surplus >= 0 ? "+" : "-"}${Math.abs(budgetMatch.surplus)}
                      </span>
                    </div>
                    <div className="mt-2 text-[10px] font-semibold tracking-[0.8px] text-[#8E96A3] uppercase">
                      {t("tourismBudget.surplus", "surplus")}
                    </div>
                    <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-[#232A33]">
                      <div
                        className={`h-full w-full rounded-full ${budgetMatch.surplus >= 0 ? "bg-[#58C26D]" : "bg-[#FF7A59]"}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
        : null}

      <Link
        to={`${langPrefix}/country/${country.code.toLowerCase()}`}
        className="interactive-cta-link mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-[#3A404B] text-sm font-semibold tracking-[0.2px] text-[#D7AE82] no-underline transition-colors [background:linear-gradient(180deg,rgba(28,31,36,0.95)_0%,rgba(20,22,26,0.98)_100%)]"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {t("tourism.viewCountry", "View Profile")} →
      </Link>
    </div>
  );
}

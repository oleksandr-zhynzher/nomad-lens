import React from "react";
import { House, ShoppingCart, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLangPrefix } from "../../hooks/useLangPrefix";
import { TourismBreakdownChart } from "../../components/TourismBreakdownChart";
import { TOURISM_COST_COLORS } from "../../utils/budgetColors";
import type { TourismBudgetMatch } from "../../utils/tourismScoring";
import type { CountryData } from "../../utils/types";

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
    <div className="px-4 py-4 bg-[#111113]" style={{ borderTop: `1px solid ${borderColor}` }}>
      <TourismBreakdownChart country={country} />

      {/* Budget breakdown */}
      {budgetMatch &&
        (() => {
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
            <div
              className="mt-4 p-[14px] rounded-[10px] border border-[#2A2D33] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(18,19,22,0.96) 0%, rgba(11,12,14,0.98) 100%)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] font-bold tracking-[1.7px] uppercase text-[#A6ADB8]">
                  {t("tourismBudget.costBreakdown", "Daily Cost Breakdown")}
                </div>
                <span className="inline-flex items-center h-5 px-2 rounded-full border border-[#343A44] bg-[#171A1F] font-mono text-[11px] font-semibold text-[#D8DEE9]">
                  ${totalDaily}/d
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-[10px]">
                {rows.map(({ cat, amount, color, width }) => {
                  const meta = cardMeta[cat];
                  return (
                    <div
                      key={cat}
                      className="bg-[#0C0F13] border border-[#2B313A] rounded-[10px] p-3 min-h-[102px] flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="inline-flex items-center justify-center w-7 h-7 rounded-[8px] bg-[#161A20]"
                          style={{ border: `1px solid ${meta.accent}44` }}
                        >
                          {meta.icon}
                        </span>
                        <span className="font-mono text-[17px] leading-none font-bold text-[#ECEFF4]">
                          ${amount}
                        </span>
                      </div>
                      <div className="text-[10px] font-semibold tracking-[0.8px] uppercase text-[#8E96A3] mt-2">
                        {t(
                          `tourismBudget.categories.${cat}`,
                          cat.charAt(0).toUpperCase() + cat.slice(1),
                        )}
                      </div>
                      <div className="mt-2 h-[5px] rounded-full bg-[#232A33] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${width}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Total card */}
                <div className="bg-[#0C0F13] border border-[#2B313A] rounded-[10px] p-3 min-h-[102px] flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-[8px] bg-[#161A20] border border-[#3C4F3F] text-[#58C26D] font-mono text-xs font-bold">
                      Σ
                    </span>
                    <span className="font-mono text-[17px] leading-none font-bold text-[#58C26D]">
                      ${totalDaily}
                    </span>
                  </div>
                  <div className="text-[10px] font-semibold tracking-[0.8px] uppercase text-[#8E96A3] mt-2">
                    {t("tourismBudget.total", "Total")}
                  </div>
                  <div className="mt-2 h-[5px] rounded-full bg-[#232A33] overflow-hidden">
                    <div className="w-full h-full rounded-full bg-[#58C26D]" />
                  </div>
                </div>

                {/* Surplus card */}
                <div
                  className={`bg-[#0C0F13] rounded-[10px] p-3 min-h-[102px] flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] ${budgetMatch.surplus >= 0 ? "border border-[#2D6E3A]" : "border border-[#6C3A2D]"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-[8px] font-mono text-xs font-bold ${budgetMatch.surplus >= 0 ? "bg-[#17301D] border border-[#2D6E3A] text-[#58C26D]" : "bg-[#321A16] border border-[#6C3A2D] text-[#FF7A59]"}`}
                    >
                      {budgetMatch.surplus >= 0 ? "+" : "-"}
                    </span>
                    <span
                      className={`font-mono text-[17px] leading-none font-bold ${budgetMatch.surplus >= 0 ? "text-[#58C26D]" : "text-[#FF7A59]"}`}
                    >
                      {budgetMatch.surplus >= 0 ? "+" : "-"}${Math.abs(budgetMatch.surplus)}
                    </span>
                  </div>
                  <div className="text-[10px] font-semibold tracking-[0.8px] uppercase text-[#8E96A3] mt-2">
                    {t("tourismBudget.surplus", "surplus")}
                  </div>
                  <div className="mt-2 h-[5px] rounded-full bg-[#232A33] overflow-hidden">
                    <div
                      className={`w-full h-full rounded-full ${budgetMatch.surplus >= 0 ? "bg-[#58C26D]" : "bg-[#FF7A59]"}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      <Link
        to={`${langPrefix}/country/${country.code.toLowerCase()}`}
        className="interactive-cta-link w-full flex items-center justify-center gap-2 transition-colors h-11 border border-[#3A404B] rounded-[8px] text-sm font-semibold tracking-[0.2px] text-[#D7AE82] no-underline mt-4"
        style={{
          background: "linear-gradient(180deg, rgba(28,31,36,0.95) 0%, rgba(20,22,26,0.98) 100%)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {t("tourism.viewCountry", "View Profile")} →
      </Link>
    </div>
  );
}

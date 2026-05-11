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
    <div
      className="px-4 py-4"
      style={{ borderTop: `1px solid ${borderColor}`, backgroundColor: "#111113" }}
    >
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
              style={{
                marginTop: "16px",
                padding: "14px",
                background:
                  "linear-gradient(180deg, rgba(18,19,22,0.96) 0%, rgba(11,12,14,0.98) 100%)",
                borderRadius: "10px",
                border: "1px solid #2A2D33",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: "12px" }}>
                <div
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "1.7px",
                    textTransform: "uppercase",
                    color: "#A6ADB8",
                  }}
                >
                  {t("tourismBudget.costBreakdown", "Daily Cost Breakdown")}
                </div>
                <span
                  className="inline-flex items-center"
                  style={{
                    height: "20px",
                    padding: "0 8px",
                    borderRadius: "999px",
                    border: "1px solid #343A44",
                    backgroundColor: "#171A1F",
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#D8DEE9",
                  }}
                >
                  ${totalDaily}/d
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5" style={{ gap: "10px" }}>
                {rows.map(({ cat, amount, color, width }) => {
                  const meta = cardMeta[cat];
                  return (
                    <div
                      key={cat}
                      style={{
                        backgroundColor: "#0C0F13",
                        border: "1px solid #2B313A",
                        borderRadius: "10px",
                        padding: "12px",
                        minHeight: "102px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="inline-flex items-center justify-center"
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "8px",
                            backgroundColor: "#161A20",
                            border: `1px solid ${meta.accent}44`,
                          }}
                        >
                          {meta.icon}
                        </span>
                        <span
                          style={{
                            fontFamily: "IBM Plex Mono, monospace",
                            fontSize: "17px",
                            lineHeight: 1,
                            fontWeight: 700,
                            color: "#ECEFF4",
                          }}
                        >
                          ${amount}
                        </span>
                      </div>
                      <div
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "10px",
                          fontWeight: 600,
                          letterSpacing: "0.8px",
                          textTransform: "uppercase",
                          color: "#8E96A3",
                          marginTop: "8px",
                        }}
                      >
                        {t(
                          `tourismBudget.categories.${cat}`,
                          cat.charAt(0).toUpperCase() + cat.slice(1),
                        )}
                      </div>
                      <div
                        style={{
                          marginTop: "8px",
                          height: "5px",
                          borderRadius: "999px",
                          backgroundColor: "#232A33",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${width}%`,
                            height: "100%",
                            borderRadius: "999px",
                            backgroundColor: color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Total card */}
                <div
                  style={{
                    backgroundColor: "#0C0F13",
                    border: "1px solid #2B313A",
                    borderRadius: "10px",
                    padding: "12px",
                    minHeight: "102px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="inline-flex items-center justify-center"
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "8px",
                        backgroundColor: "#161A20",
                        border: "1px solid #3C4F3F",
                        color: "#58C26D",
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      Σ
                    </span>
                    <span
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: "17px",
                        lineHeight: 1,
                        fontWeight: 700,
                        color: "#58C26D",
                      }}
                    >
                      ${totalDaily}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "10px",
                      fontWeight: 600,
                      letterSpacing: "0.8px",
                      textTransform: "uppercase",
                      color: "#8E96A3",
                      marginTop: "8px",
                    }}
                  >
                    {t("tourismBudget.total", "Total")}
                  </div>
                  <div
                    style={{
                      marginTop: "8px",
                      height: "5px",
                      borderRadius: "999px",
                      backgroundColor: "#232A33",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "999px",
                        backgroundColor: "#58C26D",
                      }}
                    />
                  </div>
                </div>

                {/* Surplus card */}
                <div
                  style={{
                    backgroundColor: "#0C0F13",
                    border: `1px solid ${budgetMatch.surplus >= 0 ? "#2D6E3A" : "#6C3A2D"}`,
                    borderRadius: "10px",
                    padding: "12px",
                    minHeight: "102px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="inline-flex items-center justify-center"
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "8px",
                        backgroundColor: budgetMatch.surplus >= 0 ? "#17301D" : "#321A16",
                        border: `1px solid ${budgetMatch.surplus >= 0 ? "#2D6E3A" : "#6C3A2D"}`,
                        color: budgetMatch.surplus >= 0 ? "#58C26D" : "#FF7A59",
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      {budgetMatch.surplus >= 0 ? "+" : "-"}
                    </span>
                    <span
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: "17px",
                        lineHeight: 1,
                        fontWeight: 700,
                        color: budgetMatch.surplus >= 0 ? "#58C26D" : "#FF7A59",
                      }}
                    >
                      {budgetMatch.surplus >= 0 ? "+" : "-"}${Math.abs(budgetMatch.surplus)}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "10px",
                      fontWeight: 600,
                      letterSpacing: "0.8px",
                      textTransform: "uppercase",
                      color: "#8E96A3",
                      marginTop: "8px",
                    }}
                  >
                    {t("tourismBudget.surplus", "surplus")}
                  </div>
                  <div
                    style={{
                      marginTop: "8px",
                      height: "5px",
                      borderRadius: "999px",
                      backgroundColor: "#232A33",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "999px",
                        backgroundColor: budgetMatch.surplus >= 0 ? "#58C26D" : "#FF7A59",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      <Link
        to={`${langPrefix}/country/${country.code.toLowerCase()}`}
        className="interactive-cta-link w-full flex items-center justify-center gap-2 transition-colors"
        style={{
          display: "flex",
          height: "44px",
          background: "linear-gradient(180deg, rgba(28,31,36,0.95) 0%, rgba(20,22,26,0.98) 100%)",
          border: "1px solid #3A404B",
          borderRadius: "8px",
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
          fontWeight: 600,
          letterSpacing: "0.2px",
          color: "#D7AE82",
          textDecoration: "none",
          marginTop: "16px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {t("tourism.viewCountry", "View Profile")} →
      </Link>
    </div>
  );
}

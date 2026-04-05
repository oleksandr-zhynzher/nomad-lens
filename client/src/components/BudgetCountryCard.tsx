import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLangPrefix } from "../hooks/useLangPrefix";
import { useLocalizedCountry, regionKey } from "../utils/localize";
import type { BudgetMatch } from "../hooks/useBudgetMatcher";
import { BudgetBreakdownChart } from "./BudgetBreakdownChart";

function scoreColor(score: number): string {
  if (score >= 70) return "#4CAF50";
  if (score >= 50) return "#8BC34A";
  if (score >= 30) return "#FFC107";
  return "#FF5722";
}

function surplusColor(surplus: number): string {
  if (surplus > 200) return "#4CAF50";
  if (surplus >= 0) return "#8BC34A";
  if (surplus >= -200) return "#FFC107";
  return "#FF5722";
}

interface Props {
  match: BudgetMatch;
  budget: number;
  rank: number;
}

export function BudgetCountryCard({ match, budget, rank }: Props) {
  const { country, comfortScore, monthlyCost, surplus, breakdown } = match;
  const { t } = useTranslation();
  const langPrefix = useLangPrefix();
  const locC = useLocalizedCountry(country);

  const isEven = rank % 2 === 0;

  return (
    <Link
      to={`${langPrefix}/country/${country.code.toLowerCase()}`}
      className="block transition-colors"
      style={{
        backgroundColor: isEven ? "#1A1A1C" : "#161618",
        borderBottom: "1px solid #222",
        textDecoration: "none",
        padding: "12px 16px",
      }}
    >
      <div className="flex items-center gap-3">
        {/* Rank */}
        <span
          style={{
            fontFamily: "IBM Plex Mono, monospace",
            fontWeight: 700,
            color: "var(--color-accent)",
            width: "28px",
            textAlign: "center",
            flexShrink: 0,
            fontSize: "16px",
          }}
        >
          {rank}
        </span>

        {/* Flag */}
        <img
          src={country.flagUrl}
          alt=""
          style={{
            width: "24px",
            height: "16px",
            borderRadius: "2px",
            objectFit: "cover",
          }}
          loading="lazy"
        />

        {/* Name + region */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <p
            className="truncate"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              color: "#FFFFFF",
              margin: 0,
            }}
          >
            {locC.name}
          </p>
          <span
            className="hidden sm:inline shrink-0"
            style={{
              fontFamily: "Geist, sans-serif",
              fontSize: "11px",
              color: "#555555",
            }}
          >
            {t(`regions.${regionKey(country.region)}`)}
          </span>
        </div>

        {/* Cost + surplus */}
        <div
          className="hidden sm:flex flex-col items-end"
          style={{ flexShrink: 0 }}
        >
          <span
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "13px",
              color: "#CCCCCC",
            }}
          >
            ${monthlyCost.toLocaleString()}
          </span>
          <span
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "11px",
              color: surplusColor(surplus),
            }}
          >
            {surplus >= 0 ? "+" : ""}${surplus.toLocaleString()}
          </span>
        </div>

        {/* Comfort score */}
        <div style={{ flexShrink: 0, width: "48px", textAlign: "right" }}>
          <span
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "18px",
              fontWeight: 700,
              color: scoreColor(comfortScore),
            }}
          >
            {comfortScore.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Breakdown bar */}
      <div style={{ marginTop: "8px", marginLeft: "60px" }}>
        <BudgetBreakdownChart
          breakdown={breakdown}
          budget={budget}
          monthlyCost={monthlyCost}
        />
      </div>
    </Link>
  );
}

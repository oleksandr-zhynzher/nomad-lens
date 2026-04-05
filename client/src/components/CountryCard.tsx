import { ChevronRight, Plane, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLangPrefix } from "../hooks/useLangPrefix";
import type { RankedCountry } from "../utils/types";
import { VISIBLE_CATEGORY_KEYS } from "../utils/types";
import { scoreColour } from "../utils/scoring";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { Tooltip } from "./Tooltip";
import { CATEGORY_LABELS } from "../utils/types";
import { useLocalizedCountry, regionKey } from "../utils/localize";

interface CountryCardProps {
  ranked: RankedCountry;
  highlighted?: boolean;
  index: number;
  expanded?: boolean;
  onToggle?: () => void;
}

export function CountryCard({
  ranked,
  highlighted = false,
  index,
  expanded = false,
  onToggle,
}: CountryCardProps) {
  const { country, finalScore, rank } = ranked;
  const { t } = useTranslation();
  const langPrefix = useLangPrefix();
  const locC = useLocalizedCountry(country);

  // Alternating backgrounds
  const isEven = index % 2 === 0;
  const bgColor = isEven ? "#1A1A1C" : "#161618";
  const hoverBg = isEven ? "#252528" : "#202022";
  const borderColor = isEven ? "#252527" : "#1F1F21";

  return (
    <div
      data-country-code={country.code}
      className={`country-row overflow-hidden transition-colors duration-150`}
      style={{
        backgroundColor: bgColor,
        borderTop: `1px solid ${highlighted ? "var(--color-accent)" : borderColor}`,
        ["--row-hover-bg" as string]: hoverBg,
        ...(highlighted && {
          outline: `2px solid var(--color-accent)`,
          outlineOffset: "-1px",
        }),
      }}
    >
      {/* Main row */}
      <button
        className="w-full flex items-center gap-2 md:gap-4 px-3 md:px-4 py-2.5 md:py-3 transition-all text-left cursor-pointer"
        style={{
          minHeight: "56px",
          backgroundColor: "transparent",
          border: "none",
        }}
        onClick={onToggle}
        aria-expanded={expanded}
      >
        {/* Rank */}
        <span
          className="text-base md:text-lg"
          style={{
            fontFamily: "IBM Plex Mono, monospace",
            fontWeight: 700,
            color: "var(--color-accent)",
            width: "28px",
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          {rank}
        </span>

        {/* Flag */}
        <img
          src={country.flagUrl}
          alt={`${locC.name} flag`}
          className="object-cover shrink-0"
          style={{ width: "24px", height: "16px", borderRadius: "2px" }}
          loading="lazy"
        />

        {/* Name + region + visa icon */}
        <div className="flex-1 min-w-0 flex items-center gap-2 min-w-0">
          <p
            className="truncate"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              color: "#FFFFFF",
            }}
          >
            {locC.name}
          </p>
          <span
            className="hidden sm:inline shrink-0"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "11px",
              color: "#555555",
            }}
          >
            {t(`regions.${regionKey(country.region)}`)}
          </span>
          {country.hasNomadVisa && (
            <Tooltip content="Nomad Visa Available" side="top">
              <Link
                to={`${langPrefix}/country/${country.code.toLowerCase()}`}
                className="shrink-0 inline-flex items-center justify-center"
                style={{ color: "var(--color-accent)", lineHeight: 1 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Plane size={13} />
              </Link>
            </Tooltip>
          )}
        </div>

        {/* Sparkline dots */}
        <div className="hidden sm:flex gap-1 items-center">
          {VISIBLE_CATEGORY_KEYS.map((key) => {
            const val = country.scores[key]?.value ?? null;
            const label = t(
              `indicatorsPage.indicators.${key}.name`,
              CATEGORY_LABELS[key],
            );
            const tooltipContent = (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    color: "#CCCCCC",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    fontFamily: "IBM Plex Mono, monospace",
                    color: dotColour(val),
                  }}
                >
                  {val !== null ? val.toFixed(1) : "—"}
                </span>
              </div>
            );
            return (
              <Tooltip key={key} content={tooltipContent} side="top">
                <div
                  className="rounded-full cursor-default"
                  style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: dotColour(val),
                  }}
                />
              </Tooltip>
            );
          })}
        </div>

        {/* Final score */}
        <div className="shrink-0">
          <span
            className="text-lg md:text-xl"
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontWeight: 700,
              color: scoreColour(finalScore),
            }}
          >
            {finalScore.toFixed(1)}
          </span>
        </div>

        {/* Chevron */}
        <ChevronRight
          size={20}
          style={{
            color: "#333333",
            transition: "transform 0.2s",
            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
          }}
          className="shrink-0"
        />
      </button>

      {/* Expanded breakdown */}
      {expanded && (
        <div
          className="px-4 py-4"
          style={{
            borderTop: `1px solid ${borderColor}`,
            backgroundColor: "#111113",
          }}
        >
          <ScoreBreakdown country={country} />
          <Link
            to={`${langPrefix}/country/${country.code.toLowerCase()}`}
            className="w-full flex items-center justify-center gap-2 transition-colors"
            style={{
              display: "flex",
              height: "40px",
              backgroundColor: "transparent",
              border: "1px solid #333333",
              borderRadius: "6px",
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--color-accent-dim)",
              textDecoration: "none",
              marginTop: "16px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <User size={14} />
            {t("countryPage.viewProfile", "View Country Details")}
          </Link>
        </div>
      )}
    </div>
  );
}

function dotColour(value: number | null): string {
  if (value === null) return "#3A3A3A";
  if (value >= 75) return "#4CAF50";
  if (value >= 60) return "#8BC34A";
  if (value >= 50) return "#FFC107";
  return "#FF5722";
}

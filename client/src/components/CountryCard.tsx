import { ChevronRight, Plane } from "lucide-react";
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
import { ViewCountryButton } from "../shared/ui/ViewCountryButton";
import { CompareCheckbox } from "../shared/ui/CompareCheckbox";

interface CountryCardProps {
  ranked: RankedCountry;
  highlighted?: boolean;
  index: number;
  expanded?: boolean;
  onToggle?: () => void;
  compareMode?: boolean;
  selected?: boolean;
  onSelectToggle?: () => void;
}

export function CountryCard({
  ranked,
  highlighted = false,
  index,
  expanded = false,
  onToggle,
  compareMode = false,
  selected = false,
  onSelectToggle,
}: CountryCardProps) {
  const { country, finalScore, rank } = ranked;
  const { t } = useTranslation();
  const langPrefix = useLangPrefix();
  const locC = useLocalizedCountry(country);

  // Alternating backgrounds
  const isEven = index % 2 === 0;
  const bgColor = selected ? "#1A2A1A" : isEven ? "#1A1A1C" : "#161618";
  const hoverBg = isEven ? "#232326" : "#202023";
  const borderColor = isEven ? "#252527" : "#1F1F21";

  return (
    <div
      data-country-code={country.code}
      data-selected={selected ? "true" : undefined}
      className="country-row overflow-hidden transition-colors duration-150"
      style={{
        backgroundColor: bgColor,
        borderTop: `1px solid ${highlighted ? "var(--color-accent)" : borderColor}`,
        ["--row-hover-bg" as string]: hoverBg,
        position: "relative",
        paddingLeft: compareMode ? "38px" : 0,
        ...(highlighted && {
          outline: `2px solid var(--color-accent)`,
          outlineOffset: "-1px",
        }),
      }}
    >
      {compareMode && <CompareCheckbox isSelected={!!selected} />}

      {/* Main row */}
      <button
        className="w-full flex items-center gap-2 md:gap-4 px-3 md:px-4 py-2.5 md:py-3 transition-all text-left cursor-pointer"
        style={{
          minHeight: "56px",
          backgroundColor: "transparent",
          border: "none",
          position: "relative",
          zIndex: compareMode ? 0 : 1,
        }}
        onClick={compareMode ? onSelectToggle : onToggle}
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
          alt={t("a11y.flagAlt", "{{country}} flag", { country: locC.name })}
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
              color: "#808080",
            }}
          >
            {t(`regions.${regionKey(country.region)}`)}
          </span>
          {country.hasNomadVisa && (
            <Tooltip content={t("a11y.nomadVisaAvailable", "Nomad Visa Available")} side="top">
              <Link
                to={`${langPrefix}/country/${country.code.toLowerCase()}`}
                className="shrink-0 inline-flex items-center justify-center"
                style={{ color: "var(--color-accent)", lineHeight: 1 }}
                onClick={(e) => {
                  if (compareMode) {
                    e.preventDefault();
                    e.stopPropagation();
                    onSelectToggle?.();
                  } else {
                    e.stopPropagation();
                  }
                }}
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
            const label = t(`indicatorsPage.indicators.${key}.name`, CATEGORY_LABELS[key]);
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
                    color: scoreColour(val),
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
                  role="img"
                  aria-label={`${label}: ${val !== null ? val.toFixed(1) : "N/A"}`}
                  style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: scoreColour(val),
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
            color: "#757575",
            transition: "transform 0.2s",
            transform: compareMode ? "rotate(0deg)" : expanded ? "rotate(90deg)" : "rotate(0deg)",
            opacity: compareMode ? 0.35 : 1,
          }}
          className="shrink-0"
        />
      </button>

      {/* Expanded breakdown */}
      {expanded && !compareMode && (
        <div
          className="px-4 py-4"
          style={{
            borderTop: `1px solid ${borderColor}`,
            backgroundColor: "#111113",
          }}
        >
          <ScoreBreakdown country={country} />
          <ViewCountryButton to={`${langPrefix}/country/${country.code.toLowerCase()}`} />
        </div>
      )}
    </div>
  );
}

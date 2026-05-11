import { ChevronRight, Plane } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLangPrefix } from "../hooks/useLangPrefix";
import type { RankedCountry } from "../utils/types";
import { VISIBLE_CATEGORY_KEYS } from "../utils/types";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { Tooltip } from "./Tooltip";
import { CATEGORY_LABELS } from "../utils/types";
import { ViewCountryButton } from "../shared/ui/ViewCountryButton";
import { CompareCheckbox } from "../shared/ui/CompareCheckbox";
import { getRowStyles } from "../utils/rowStyles";
import { CountryNameCell } from "../shared/ui/CountryNameCell";
import { ScoreSparkline } from "../shared/ui/ScoreSparkline";
import { scoreColourClass } from "../utils/colorClasses";

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

  // Alternating backgrounds
  const { bgColor, hoverBg, borderColor } = getRowStyles(index, selected);

  return (
    <div
      data-country-code={country.code}
      data-selected={selected ? "true" : undefined}
      className={`country-row overflow-hidden transition-colors duration-150 relative ${compareMode ? "pl-[38px]" : "pl-0"}`}
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
      {compareMode && <CompareCheckbox isSelected={!!selected} />}

      {/* Main row */}
      <button
        className={`w-full flex items-center gap-2 md:gap-4 px-3 md:px-4 py-2.5 md:py-3 transition-all text-left cursor-pointer min-h-14 bg-transparent border-none relative ${compareMode ? "z-0" : "z-[1]"}`}
        onClick={compareMode ? onSelectToggle : onToggle}
        aria-expanded={expanded}
      >
        {/* Rank */}
        <span className="text-base md:text-lg font-mono font-bold text-accent w-7 text-center shrink-0">
          {rank}
        </span>

        {/* Flag + Name + region + visa icon */}
        <CountryNameCell
          country={country}
          badge={
            country.hasNomadVisa ? (
              <Tooltip content={t("a11y.nomadVisaAvailable", "Nomad Visa Available")} side="top">
                <Link
                  to={`${langPrefix}/country/${country.code.toLowerCase()}`}
                  className="shrink-0 inline-flex items-center justify-center text-accent"
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
            ) : undefined
          }
        />

        {/* Sparkline dots */}
        <ScoreSparkline
          entries={VISIBLE_CATEGORY_KEYS.map((key) => ({
            key,
            value: country.scores[key]?.value ?? null,
            label: t(`indicatorsPage.indicators.${key}.name`, CATEGORY_LABELS[key]),
          }))}
        />

        {/* Final score */}
        <div className="shrink-0">
          <span
            className={`text-lg md:text-xl font-mono font-bold ${scoreColourClass(finalScore, "text")}`}
          >
            {finalScore.toFixed(1)}
          </span>
        </div>

        {/* Chevron */}
        <ChevronRight
          size={20}
          className="shrink-0 text-dimmest transition-transform duration-200"
          style={{
            transform: compareMode ? "rotate(0deg)" : expanded ? "rotate(90deg)" : "rotate(0deg)",
            opacity: compareMode ? 0.35 : 1,
          }}
        />
      </button>

      {/* Expanded breakdown */}
      {expanded && !compareMode && (
        <div className="px-4 py-4 bg-[#111113]" style={{ borderTop: `1px solid ${borderColor}` }}>
          <ScoreBreakdown country={country} />
          <ViewCountryButton to={`${langPrefix}/country/${country.code.toLowerCase()}`} />
        </div>
      )}
    </div>
  );
}

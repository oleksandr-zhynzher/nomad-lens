import { ChevronRight, Plane } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLangPrefix } from "@core/hooks";
import type { RankedCountry, WeightMap } from "@core/models";
import { WEIGHT_GROUPS } from "@features/country-ranking/constants/weight-config.constants";

/** Panel-controllable category keys only — tourism/hidden categories excluded. */
const PANEL_KEYS = WEIGHT_GROUPS.flatMap((g) => g.keys);
import { ScoreBreakdown } from "./ScoreBreakdown";
import { Tooltip } from "@core/ui";
import { CATEGORY_LABELS } from "@core/models";
import { ViewCountryButton } from "@core/ui/country";
import { CompareCheckbox } from "@features/compare/ui";
import { getRowStyles } from "@core/utils";
import { CountryNameCell } from "@core/ui/country";
import { ScoreSparkline } from "@core/ui/indicator";
import { scoreColourClass } from "@core/utils";

interface CountryCardProps {
  ranked: RankedCountry;
  highlighted?: boolean;
  index: number;
  expanded?: boolean;
  onToggle?: () => void;
  compareMode?: boolean;
  selected?: boolean;
  onSelectToggle?: () => void;
  /** Only show sparkline dots for categories with a non-zero weight. */
  weights?: WeightMap;
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
  weights,
}: CountryCardProps) {
  const { country, finalScore, rank } = ranked;
  const { t } = useTranslation();
  const langPrefix = useLangPrefix();

  // Alternating backgrounds
  const { bgColor, hoverBg, borderColor } = getRowStyles(index, selected);

  const sparklineKeys = weights ? PANEL_KEYS.filter((k) => (weights[k] ?? 0) > 0) : PANEL_KEYS;

  return (
    <div
      data-country-code={country.code}
      data-selected={selected ? "true" : undefined}
      className={`country-row overflow-hidden transition-colors duration-150 relative ${compareMode ? "pl-[38px]" : "pl-0"} bg-[var(--row-bg)] border-t border-[var(--row-bt)] ${highlighted ? "outline outline-2 outline-[var(--color-accent)] outline-offset-[-1px]" : ""}`}
      style={
        {
          "--row-bg": bgColor,
          "--row-hover-bg": hoverBg,
          "--row-bt": highlighted ? "var(--color-accent)" : borderColor,
        } as React.CSSProperties
      }
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
          entries={sparklineKeys.map((key) => ({
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
          className={`shrink-0 text-dimmest transition-transform duration-200 ${!compareMode && expanded ? "rotate-90" : "rotate-0"} ${compareMode ? "opacity-[0.35]" : "opacity-100"}`}
        />
      </button>

      {/* Expanded breakdown */}
      {expanded && !compareMode && (
        <div
          className="px-4 py-4 bg-[#111113] border-t border-[var(--exp-bc)]"
          style={{ "--exp-bc": borderColor } as React.CSSProperties}
        >
          <ScoreBreakdown country={country} />
          <ViewCountryButton to={`${langPrefix}/country/${country.code.toLowerCase()}`} />
        </div>
      )}
    </div>
  );
}

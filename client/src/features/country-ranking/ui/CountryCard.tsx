import { ChevronRight, Plane } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLangPrefix } from "@core/hooks";
import type { RankedCountry, WeightMap } from "@core/models";
import { WEIGHT_GROUPS } from "@features/country-ranking/constants/weight-config.constants";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { Tooltip } from "@core/ui";
import { CATEGORY_LABELS } from "@core/models";
import { ViewCountryButton } from "@core/ui/country";
import { CompareCheckbox } from "@features/compare/ui";
import { getRowStyles } from "@core/utils";
import { CountryNameCell } from "@core/ui/country";
import { ScoreSparkline } from "@core/ui/indicator";
import { scoreColourClass } from "@core/utils";

const PANEL_KEYS = WEIGHT_GROUPS.flatMap((g) => g.keys);

interface CountryCardProps {
  readonly ranked: RankedCountry;
  readonly highlighted?: boolean;
  readonly index: number;
  readonly expanded?: boolean;
  readonly onToggle?: () => void;
  readonly compareMode?: boolean;
  readonly selected?: boolean;
  readonly onSelectToggle?: () => void;
  /** Only show sparkline dots for categories with a non-zero weight. */
  readonly weights?: WeightMap;
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

  const sparklineKeys =
    weights !== undefined ? PANEL_KEYS.filter((k) => weights[k] > 0) : PANEL_KEYS;

  return (
    <div
      data-country-code={country.code}
      data-selected={selected ? "true" : undefined}
      className={`country-row relative overflow-hidden transition-colors duration-150 ${compareMode ? "pl-[38px]" : "pl-0"} border-t border-[var(--row-bt)] bg-[var(--row-bg)] ${highlighted ? "outline outline-2 outline-offset-[-1px] outline-[var(--color-accent)]" : ""}`}
      style={
        {
          "--row-bg": bgColor,
          "--row-hover-bg": hoverBg,
          "--row-bt": highlighted ? "var(--color-accent)" : borderColor,
        } as React.CSSProperties
      }
    >
      {compareMode ? <CompareCheckbox isSelected={selected} /> : null}

      {/* Main row */}
      <button
        className={`relative flex min-h-14 w-full cursor-pointer items-center gap-2 border-none bg-transparent px-3 py-2.5 text-left transition-all md:gap-4 md:px-4 md:py-3 ${compareMode ? "z-0" : "z-[1]"}`}
        onClick={compareMode ? onSelectToggle : onToggle}
        aria-expanded={expanded}
      >
        {/* Rank */}
        <span className="w-7 shrink-0 text-center font-mono text-base font-bold text-accent md:text-lg">
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
                  className="inline-flex shrink-0 items-center justify-center text-accent"
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
            value: country.scores[key].value ?? null,
            label: t(`indicatorsPage.indicators.${key}.name`, CATEGORY_LABELS[key]),
          }))}
        />

        {/* Final score */}
        <div className="shrink-0">
          <span
            className={`font-mono text-lg font-bold md:text-xl ${scoreColourClass(finalScore, "text")}`}
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
      {expanded && !compareMode ? (
        <div
          className="border-t border-[var(--exp-bc)] bg-[#111113] px-4 py-4"
          style={{ "--exp-bc": borderColor } as React.CSSProperties}
        >
          <ScoreBreakdown country={country} />
          <ViewCountryButton to={`${langPrefix}/country/${country.code.toLowerCase()}`} />
        </div>
      ) : null}
    </div>
  );
}

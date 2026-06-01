import type { CountryData, WeightMap } from "@core/models";
import { CATEGORY_LABELS } from "@core/models";
import { Tooltip } from "@core/ui";
import { CountryNameCell } from "@core/ui/country";
import { ScoreSparkline } from "@core/ui/indicator";
import { scoreColourClass } from "@core/utils";
import { PANEL_KEYS } from "@features/country-ranking/constants/weight-config.constants";
import { ChevronRight, Plane } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface CountryCardMainButtonProps {
  readonly rank: number;
  readonly country: CountryData;
  readonly finalScore: number;
  readonly expanded: boolean;
  readonly compareMode: boolean;
  readonly weights?: WeightMap;
  readonly langPrefix: string;
  readonly onToggle?: () => void;
  readonly onSelectToggle?: () => void;
}

export function CountryCardMainButton({
  rank,
  country,
  finalScore,
  expanded,
  compareMode,
  weights,
  langPrefix,
  onToggle,
  onSelectToggle,
}: CountryCardMainButtonProps) {
  const { t } = useTranslation();
  const sparklineKeys =
    weights !== undefined ? PANEL_KEYS.filter((k) => weights[k] > 0) : PANEL_KEYS;

  return (
    <button
      type="button"
      className={`relative flex min-h-14 w-full cursor-pointer items-center gap-2 border-none bg-transparent px-3 py-2.5 text-left transition-all md:gap-4 md:px-4 md:py-3 ${compareMode ? "z-0" : "z-[1]"}`}
      onClick={compareMode ? onSelectToggle : onToggle}
      aria-expanded={expanded}
    >
      <span className="w-7 shrink-0 text-center font-mono text-base font-bold text-accent md:text-lg">
        {rank}
      </span>
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
      <ScoreSparkline
        entries={sparklineKeys.map((key) => ({
          key,
          value: country.scores[key].value ?? null,
          label: t(`indicatorsPage.indicators.${key}.name`, CATEGORY_LABELS[key]),
        }))}
      />
      <div className="shrink-0">
        <span
          className={`font-mono text-lg font-bold md:text-xl ${scoreColourClass(finalScore, "text")}`}
        >
          {finalScore.toFixed(1)}
        </span>
      </div>
      <ChevronRight
        size={20}
        className={`shrink-0 text-dimmest transition-transform duration-200 ${!compareMode && expanded ? "rotate-90" : "rotate-0"} ${compareMode ? "opacity-[0.35]" : "opacity-100"}`}
      />
    </button>
  );
}

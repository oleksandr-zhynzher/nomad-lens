import { useLangPrefix } from "@core/hooks";
import type { RankedCountry, WeightMap } from "@core/models";
import { ViewCountryButton } from "@core/ui/country";
import { getRowStyles } from "@core/utils";
import { CompareCheckbox } from "@features/compare/ui";
import type React from "react";

import { CountryCardMainButton } from "./CountryCardMainButton";
import { ScoreBreakdown } from "./ScoreBreakdown";

interface CountryCardProps {
  readonly ranked: RankedCountry;
  readonly highlighted?: boolean;
  readonly index: number;
  readonly expanded?: boolean;
  readonly onToggle?: () => void;
  readonly compareMode?: boolean;
  readonly selected?: boolean;
  readonly onSelectToggle?: () => void;
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
  const langPrefix = useLangPrefix();
  const { bgColor, hoverBg, borderColor } = getRowStyles(index, selected);

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
      <CountryCardMainButton
        rank={rank}
        country={country}
        finalScore={finalScore}
        expanded={expanded}
        compareMode={compareMode}
        langPrefix={langPrefix}
        {...(weights !== undefined && { weights })}
        {...(onToggle !== undefined && { onToggle })}
        {...(onSelectToggle !== undefined && { onSelectToggle })}
      />
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

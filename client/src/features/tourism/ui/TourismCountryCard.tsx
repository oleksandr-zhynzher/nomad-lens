import { CompareCheckbox } from "@core/ui/selection";
import { getRowStyles } from "@core/utils";
import type { TravelDates } from "@features/tourism/hooks";
import type { TourismRanked } from "@features/tourism/utils";
import type React from "react";
import { useTranslation } from "react-i18next";

import { TourismCountryCardDetail } from "./TourismCountryCardDetail";
import { TourismCountryCardInner } from "./TourismCountryCardInner";

const EMPTY_SELECTED_TAGS: readonly string[] = [];

interface TourismCountryCardProps {
  readonly ranked: TourismRanked;
  readonly index: number;
  readonly highlighted?: boolean;
  readonly expanded?: boolean;
  readonly onToggle?: () => void;
  readonly onSelect?: () => void;
  readonly compareMode?: boolean;
  readonly isSelected?: boolean;
  readonly selectedTags?: readonly string[];
  readonly travelDates?: TravelDates;
}

export function TourismCountryCard({
  ranked,
  index,
  highlighted = false,
  expanded = false,
  onToggle,
  onSelect,
  compareMode = false,
  isSelected = false,
  selectedTags = EMPTY_SELECTED_TAGS,
  travelDates,
}: TourismCountryCardProps) {
  const { country } = ranked;
  const { t } = useTranslation();
  const { bgColor: rowBg, hoverBg, borderColor } = getRowStyles(index, isSelected);

  return (
    <div
      data-country-code={country.code}
      data-selected={isSelected ? "true" : undefined}
      className={`country-row relative overflow-hidden transition-colors duration-150 ${compareMode ? "pl-[38px]" : "pl-0"} border-t border-[var(--row-bt)] bg-[var(--row-bg)] ${highlighted ? "outline outline-2 -outline-offset-1 outline-[var(--color-accent)]" : ""}`}
      style={
        {
          "--row-bg": rowBg,
          "--row-bt": highlighted ? "var(--color-accent)" : borderColor,
          "--row-hover-bg": hoverBg,
        } as React.CSSProperties
      }
    >
      {compareMode ? <CompareCheckbox isSelected={isSelected} uncheckedBg={rowBg} /> : null}

      <button
        type="button"
        className={`flex min-h-14 w-full cursor-pointer flex-col border-none bg-transparent text-left transition-colors ${compareMode ? "pr-4 pl-[38px]" : "px-4"} py-3`}
        onClick={compareMode ? onSelect : onToggle}
        aria-expanded={expanded}
        aria-label={t("a11y.toggleCountryRow", "Toggle {{name}}", { name: country.name })}
      >
        <TourismCountryCardInner
          ranked={ranked}
          expanded={expanded}
          compareMode={compareMode}
          selectedTags={selectedTags}
          {...(travelDates !== undefined && { travelDates })}
        />
      </button>

      {expanded && !compareMode ? (
        <TourismCountryCardDetail
          country={country}
          borderColor={borderColor}
          {...(ranked.budgetMatch !== undefined && { budgetMatch: ranked.budgetMatch })}
        />
      ) : null}
    </div>
  );
}

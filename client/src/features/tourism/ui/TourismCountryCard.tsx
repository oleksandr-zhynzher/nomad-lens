import type React from "react";
import { useTranslation } from "react-i18next";
import type { TourismRanked } from "@features/tourism/utils";
import type { TravelDates } from "@features/tourism/hooks";
import { CompareCheckbox } from "@features/compare/ui";
import { getRowStyles } from "@core/utils";
import { TourismCountryCardInner } from "./TourismCountryCardInner";
import { TourismCountryCardDetail } from "./TourismCountryCardDetail";

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
  selectedTags = [],
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
          travelDates={travelDates}
        />
      </button>

      {expanded && !compareMode ? (
        <TourismCountryCardDetail
          country={country}
          budgetMatch={ranked.budgetMatch}
          borderColor={borderColor}
        />
      ) : null}
    </div>
  );
}

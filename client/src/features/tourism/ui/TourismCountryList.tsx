import { useTranslation } from "react-i18next";
import { EmptyState, LoadingRows } from "@core/ui";
import { TourismCountryCard } from "./TourismCountryCard";
import type { useTourismScoring, useTourismWeightState } from "@features/tourism/hooks";

type TourismRankedCountry = ReturnType<typeof useTourismScoring>[number];

interface TourismCountryListProps {
  readonly loading: boolean;
  readonly displayedRanked: TourismRankedCountry[];
  readonly compareMode: boolean;
  readonly expandedCode: string | null;
  readonly setExpandedCode: (code: string | null) => void;
  readonly selectedCodes: Set<string>;
  readonly toggleSelect: (code: string) => void;
  readonly ws: ReturnType<typeof useTourismWeightState>;
  readonly activeHighlight: string | null;
}

export function TourismCountryList({
  loading,
  displayedRanked,
  compareMode,
  expandedCode,
  setExpandedCode,
  selectedCodes,
  toggleSelect,
  ws,
  activeHighlight,
}: TourismCountryListProps) {
  const { t } = useTranslation();
  if (loading) {
    return <LoadingRows count={8} rowClassName="h-14 border-t border-[#333333] bg-[#1A1A1A]" />;
  }
  if (displayedRanked.length === 0) {
    return <EmptyState message={t("tourism.noResults", "No countries match your filters.")} />;
  }
  return (
    <>
      {displayedRanked.map((r, i) => (
        <TourismCountryCard
          key={r.country.code}
          ranked={r}
          index={i}
          highlighted={r.country.code === activeHighlight}
          expanded={compareMode ? false : expandedCode === r.country.code}
          compareMode={compareMode}
          isSelected={selectedCodes.has(r.country.code)}
          onSelect={() => {
            toggleSelect(r.country.code);
          }}
          selectedTags={ws.toggles.requiredTags}
          travelDates={ws.travelDates}
          {...(!compareMode && {
            onToggle: () => {
              setExpandedCode(expandedCode === r.country.code ? null : r.country.code);
            },
          })}
        />
      ))}
    </>
  );
}

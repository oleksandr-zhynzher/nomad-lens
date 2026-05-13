import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { CountryData } from "@core/models";
import { TOURISM_CATEGORY_KEYS } from "@core/models";
import { localizeCountry, regionKey } from "@core/utils";
import { computeTourismScore, tourismScoreColour } from "@features/tourism/utils";
import { tourismScoreColourClass } from "@core/utils";
import { useLangPrefix } from "@core/hooks";
import { useSyncScroll } from "@features/compare/hooks";
import { useComparisonSelection } from "@features/compare/hooks";
import { ComparisonAddButton } from "./ComparisonAddButton";
import { ComparisonRowShell } from "./ComparisonRowShell";
import { ComparisonScoreCell } from "./ComparisonScoreCell";
import { ComparisonSlotCard } from "./ComparisonSlotCard";
import { ComparisonTableHeader } from "./ComparisonTableHeader";
import { CountryPickerDropdown } from "./CountryPickerDropdown";
import {
  TOURISM_ICONS,
  TOURISM_LABELS,
  TOURISM_COMPARISON_COLUMN_WIDTH,
} from "@features/tourism/constants";

interface Props {
  readonly countries: CountryData[];
  readonly selectedCodes: string[];
  readonly onSelectedCodesChange: (codes: string[]) => void;
  readonly sortTrigger?: number;
  readonly sortDirection?: "desc" | "asc" | null;
  readonly onSelectionCount?: (count: number) => void;
}

export function TourismComparison({
  countries,
  selectedCodes,
  onSelectedCodesChange,
  sortTrigger = 0,
  sortDirection = null,
  onSelectionCount,
}: Props) {
  const { t, i18n } = useTranslation();
  const langPrefix = useLangPrefix();
  const navigate = useNavigate();
  const lang = i18n.language;

  const {
    selectedSlots: selectedCountries,
    handleAdd,
    handleRemove,
    filteredCandidates: filtered,
    dropdownOpen,
    setDropdownOpen,
    dropdownPos,
    setDropdownPos,
    query,
    setQuery,
    addBtnRef,
    headerRef,
    bodyRef,
  } = useComparisonSelection({
    allCandidates: countries,
    selectedCodes,
    onSelectedCodesChange,
    lang,
    onSelectionCount,
  });

  // Sync horizontal scroll between sticky header and body
  useSyncScroll(headerRef, bodyRef);

  // Sort when parent triggers it
  useEffect(() => {
    if (sortTrigger <= 0 || sortDirection == null) return;

    const sorted = [...selectedCodes].sort((a, b) => {
      const countryA = countries.find((c) => c.code === a);
      const countryB = countries.find((c) => c.code === b);
      if (!countryA || !countryB) return 0;

      const scoreA = computeTourismScore(countryA) ?? 0;
      const scoreB = computeTourismScore(countryB) ?? 0;
      const scoreDelta = scoreB - scoreA;

      return sortDirection === "desc" ? scoreDelta : -scoreDelta;
    });

    if (
      sorted.length === selectedCodes.length &&
      sorted.every((code, index) => code === selectedCodes[index])
    ) {
      return;
    }

    onSelectedCodesChange(sorted);
  }, [countries, onSelectedCodesChange, selectedCodes, sortDirection, sortTrigger]);

  return (
    <div>
      {/* Country selector — horizontal scroll with fade hint */}
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {selectedCountries.map((slot) => {
            const score = computeTourismScore(slot.country);
            return (
              <div key={slot.country.code} className="w-[148px] shrink-0 md:w-[180px]">
                <ComparisonSlotCard
                  flagUrl={slot.country.flagUrl}
                  countryName={localizeCountry(slot.country, lang).name}
                  onRemove={() => {
                    handleRemove(slot.index);
                  }}
                  onNavigate={async () =>
                    navigate(`${langPrefix}/country/${slot.country.code.toLowerCase()}`)
                  }
                  regionLabel={t(`regions.${regionKey(slot.country.region)}`)}
                >
                  <span
                    className={`[font-family:Oswald,_sans-serif] text-[32px] leading-none font-bold ${score == null ? "text-[#333333]" : tourismScoreColourClass(score, "text")}`}
                  >
                    {score == null ? "—" : score.toFixed(1)}
                  </span>
                </ComparisonSlotCard>
              </div>
            );
          })}

          {/* Add button */}
          <div ref={addBtnRef} className="w-[148px] shrink-0 md:w-[180px]">
            <ComparisonAddButton
              label={t("compare.addCountry")}
              onClick={() => {
                if (!dropdownOpen && addBtnRef.current) {
                  const rect = addBtnRef.current.getBoundingClientRect();
                  const dropdownWidth = 320;
                  const dropdownMaxHeight = 370;
                  const left = Math.max(
                    8,
                    Math.min(rect.left, window.innerWidth - dropdownWidth - 8),
                  );
                  const fitsBelow = rect.bottom + 8 + dropdownMaxHeight <= window.innerHeight;
                  const top = fitsBelow ? rect.bottom + 8 : rect.top - dropdownMaxHeight - 8;
                  setDropdownPos({ top, left });
                }
                setDropdownOpen((p) => !p);
              }}
            />
          </div>
        </div>
        {/* Right-edge fade */}
        <div className="pointer-events-none absolute top-0 right-0 bottom-0 hidden w-12 [background:linear-gradient(to_right,transparent,#0F1114)] md:block" />
      </div>

      {/* Dropdown — fixed-positioned under the Add Country card */}
      <CountryPickerDropdown
        open={dropdownOpen ? dropdownPos != null : false}
        countries={filtered.map((c) => {
          const score = computeTourismScore(c);
          return {
            code: c.code,
            flagUrl: c.flagUrl,
            name: localizeCountry(c, lang).name,
            regionLabel: t(`regions.${regionKey(c.region)}`),
            trailing: (
              <span
                className={`font-mono text-[13px] font-semibold ${score == null ? "text-border" : tourismScoreColourClass(score, "text")}`}
              >
                {score == null ? "—" : score.toFixed(1)}
              </span>
            ),
          };
        })}
        query={query}
        onQueryChange={setQuery}
        onSelect={handleAdd}
        position={dropdownPos ?? undefined}
        inputName="tourism-comparison-search"
        searchPlaceholder={t("compare.searchCountry")}
        emptyLabel={t("compare.noCountriesFound")}
      />

      {/* Indicator grid */}
      {selectedCountries.length > 0 ? (
        <div className="mt-8">
          {/* Separator */}
          <div className="h-px bg-[#1C1C1C]" />

          {/* Sticky column header */}
          <ComparisonTableHeader
            ref={headerRef}
            label={t("compare.indicatorHeader")}
            columns={selectedCountries.map((slot) => ({
              key: slot.index,
              flagUrl: slot.country.flagUrl,
              name: localizeCountry(slot.country, lang).name,
            }))}
            columnWidth={TOURISM_COMPARISON_COLUMN_WIDTH}
          />

          {/* Scrollable data rows */}
          <div ref={bodyRef} className="overflow-x-auto">
            {TOURISM_CATEGORY_KEYS.map((key) => {
              const Icon = TOURISM_ICONS[key];
              return (
                <ComparisonRowShell
                  key={key}
                  icon={Icon}
                  label={t(`tourism.metrics.${key}`, TOURISM_LABELS[key] ?? key)}
                >
                  {selectedCountries.map((slot) => {
                    const val = slot.country.scores[key].value ?? null;
                    return (
                      <ComparisonScoreCell
                        key={slot.index}
                        value={val}
                        colour={val == null ? "#333333" : tourismScoreColour(val)}
                        columnWidth={TOURISM_COMPARISON_COLUMN_WIDTH}
                      />
                    );
                  })}
                </ComparisonRowShell>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLangPrefix } from "@core/hooks";
import { Plane } from "lucide-react";
import type { CountryData, WeightMap, ClimatePreferences } from "@core/models";
import { VISIBLE_CATEGORY_KEYS, CATEGORY_LABELS } from "@core/models";
import { applyClimate, computeScore, scoreColour } from "@features/country-ranking/utils";
import { scoreColourClass } from "@core/utils";
import { localizeCountry, regionKey } from "@core/utils";
import { Tooltip } from "@core/ui";
import { CATEGORY_ICONS } from "@features/compare/constants";
import { useSyncScroll } from "@features/compare/hooks";
import { useComparisonSelection } from "@features/compare/hooks";
import { ComparisonAddButton } from "./ComparisonAddButton";
import { ComparisonRowShell } from "./ComparisonRowShell";
import { ComparisonScoreCell } from "./ComparisonScoreCell";
import { ComparisonSlotCard } from "./ComparisonSlotCard";
import { ComparisonTableHeader } from "./ComparisonTableHeader";
import { CountryPickerDropdown } from "./CountryPickerDropdown";

import { COMPARISON_COLUMN_WIDTH } from "@features/compare/constants";

interface CountryComparisonProps {
  readonly countries: CountryData[];
  readonly weights: WeightMap;
  readonly climatePrefs: ClimatePreferences;
  readonly selectedCodes: string[];
  readonly onSelectedCodesChange: (codes: string[]) => void;
  readonly sortDirection?: "desc" | "asc" | null;
  readonly onSelectionCount?: (count: number) => void;
}

export function CountryComparison({
  countries,
  weights,
  climatePrefs,
  selectedCodes,
  onSelectedCodesChange,
  sortDirection = null,
  onSelectionCount,
}: CountryComparisonProps) {
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

  const sortedCountries = useMemo(() => {
    if (sortDirection == null) return selectedCountries;
    return [...selectedCountries].sort((slotA, slotB) => {
      const scoreA = computeScore(applyClimate(slotA.country, climatePrefs), weights);
      const scoreB = computeScore(applyClimate(slotB.country, climatePrefs), weights);
      const scoreDelta = scoreB - scoreA;
      return sortDirection === "desc" ? scoreDelta : -scoreDelta;
    });
  }, [selectedCountries, sortDirection, climatePrefs, weights]);

  return (
    <div>
      {/* Country selector — horizontal scroll with fade hint */}
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {sortedCountries.map((slot) => {
            const score = computeScore(applyClimate(slot.country, climatePrefs), weights);
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
                  nameSuffix={
                    slot.country.hasNomadVisa ? (
                      <Tooltip
                        content={t("countryDetail.nomadVisa", "Nomad Visa Available")}
                        side="top"
                      >
                        <Link
                          to={`${langPrefix}/country/${slot.country.code.toLowerCase()}`}
                          className="inline-flex shrink-0 leading-none text-accent"
                        >
                          <Plane size={13} />
                        </Link>
                      </Tooltip>
                    ) : undefined
                  }
                >
                  <span
                    className={`[font-family:Oswald,_sans-serif] text-[32px] leading-none font-bold ${scoreColourClass(score, "text")}`}
                  >
                    {score.toFixed(1)}
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
        {/* Right-edge fade — hints at horizontal scrollability on mobile */}
        <div className="pointer-events-none absolute top-0 right-0 bottom-0 hidden w-12 [background:linear-gradient(to_right,transparent,#0F1114)] md:block" />
      </div>

      {/* Dropdown — fixed-positioned under the Add Country card */}
      <CountryPickerDropdown
        open={dropdownOpen ? dropdownPos != null : false}
        countries={filtered.map((c) => {
          const score = computeScore(applyClimate(c, climatePrefs), weights);
          return {
            code: c.code,
            flagUrl: c.flagUrl,
            name: localizeCountry(c, lang).name,
            regionLabel: t(`regions.${regionKey(c.region)}`),
            trailing: (
              <span
                className={`font-mono text-[13px] font-semibold ${scoreColourClass(score, "text")}`}
              >
                {score.toFixed(1)}
              </span>
            ),
          };
        })}
        query={query}
        onQueryChange={setQuery}
        onSelect={handleAdd}
        position={dropdownPos ?? undefined}
        inputName="country-comparison-search"
        searchPlaceholder={t("compare.searchCountry")}
        emptyLabel={t("compare.noCountriesFound")}
      />

      {/* Indicator grid */}
      {selectedCountries.length > 0 ? (
        <div className="mt-8">
          {/* Separator */}
          <div className="h-px bg-[#1C1C1C]" />

          {/* Sticky column header — own overflow wrapper, synced with body */}
          <ComparisonTableHeader
            ref={headerRef}
            label={t("compare.indicatorHeader")}
            columns={sortedCountries.map((slot) => ({
              key: slot.index,
              flagUrl: slot.country.flagUrl,
              name: localizeCountry(slot.country, lang).name,
            }))}
            columnWidth={COMPARISON_COLUMN_WIDTH}
          />

          {/* Scrollable data rows */}
          <div ref={bodyRef} className="overflow-x-auto">
            {/* Indicator rows */}
            {VISIBLE_CATEGORY_KEYS.map((key) => {
              const Icon = CATEGORY_ICONS[key];
              return (
                <ComparisonRowShell
                  key={key}
                  icon={Icon}
                  label={t(`indicatorsPage.indicators.${key}.name`, CATEGORY_LABELS[key])}
                >
                  {sortedCountries.map((slot) => {
                    const val = slot.country.scores[key].value ?? null;
                    return (
                      <ComparisonScoreCell
                        key={slot.index}
                        value={val}
                        colour={val == null ? "#333333" : scoreColour(val)}
                        columnWidth={COMPARISON_COLUMN_WIDTH}
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

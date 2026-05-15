import { useTranslation } from "react-i18next";
import { useLangPrefix } from "@core/hooks";
import type { BudgetMatch } from "@features/budget/hooks";
import { localizeCountry } from "@core/utils";
import type { ClimatePreferences, CountryData, WeightMap } from "@core/models";
import { useSyncScroll, useComparisonSelection } from "@features/compare/hooks";
import { ComparisonRowShell } from "./ComparisonRowShell";
import { ComparisonTableHeader } from "./ComparisonTableHeader";
import { VisaCell } from "./VisaCellComponents";
import {
  VISA_FIELDS,
  VISA_COMPARISON_COLUMN_WIDTH,
  VISA_COMPARISON_COLUMN_GAP,
} from "@core/constants";
import type { SelectedSlot } from "@features/compare/utils";
import type { CSSProperties } from "react";
import { NomadVisaComparisonSlots } from "./NomadVisaComparisonSlots";

interface NomadVisaComparisonProps {
  readonly countries: CountryData[];
  readonly weights: WeightMap;
  readonly climatePrefs: ClimatePreferences;
  readonly budgetMatches: BudgetMatch[];
  readonly selectedCodes: string[];
  readonly onSelectedCodesChange: (codes: string[]) => void;
}

export function NomadVisaComparison({
  countries,
  weights,
  climatePrefs,
  budgetMatches,
  selectedCodes,
  onSelectedCodesChange,
}: NomadVisaComparisonProps) {
  const { t, i18n } = useTranslation();
  const langPrefix = useLangPrefix();
  const lang = i18n.language;
  const budgetMatchByCode = new Map(budgetMatches.map((match) => [match.country.code, match]));
  const visaCountries = countries.filter((c) => c.nomadVisa != null);

  const {
    selectedSlots,
    handleAdd,
    handleRemove,
    filteredCandidates: filtered,
    dropdownOpen,
    setDropdownOpen,
    query,
    setQuery,
    headerRef,
    bodyRef,
  } = useComparisonSelection({
    allCandidates: visaCountries,
    selectedCodes,
    onSelectedCodesChange,
    lang,
  });

  useSyncScroll(headerRef, bodyRef);

  const selectedCountries = selectedSlots.filter(
    (s) => s.country.nomadVisa != null,
  ) as SelectedSlot[];

  return (
    <div>
      <NomadVisaComparisonSlots
        selectedCountries={selectedCountries}
        filteredCandidates={filtered}
        lang={lang}
        langPrefix={langPrefix}
        onRemove={handleRemove}
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
        query={query}
        setQuery={setQuery}
        onAdd={handleAdd}
      />
      {selectedCountries.length > 0 ? (
        <div className="mt-8">
          <div className="h-px bg-[#1C1C1C]" />
          <ComparisonTableHeader
            ref={headerRef}
            label={t("compare.visaDetail", "Visa Detail")}
            columns={selectedCountries.map((slot) => ({
              key: slot.index,
              flagUrl: slot.country.flagUrl,
              name: localizeCountry(slot.country, lang).name,
              maxNameWidth: "150px",
            }))}
            columnWidth={VISA_COMPARISON_COLUMN_WIDTH}
            gap={VISA_COMPARISON_COLUMN_GAP}
          />
          <div ref={bodyRef} className="overflow-x-auto">
            {VISA_FIELDS.map(({ key, icon: Icon }) => (
              <ComparisonRowShell
                key={key}
                icon={Icon}
                label={t(`compare.visaFields.${key}`)}
                gap={VISA_COMPARISON_COLUMN_GAP}
              >
                {selectedCountries.map((slot) => (
                  <div
                    key={slot.index}
                    className="flex w-[var(--vcw)] shrink-0 items-center justify-center"
                    style={{ "--vcw": VISA_COMPARISON_COLUMN_WIDTH } as CSSProperties}
                  >
                    <VisaCell
                      slot={slot}
                      field={key}
                      weights={weights}
                      climatePrefs={climatePrefs}
                      budgetMatchByCode={budgetMatchByCode}
                      lang={lang}
                    />
                  </div>
                ))}
              </ComparisonRowShell>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

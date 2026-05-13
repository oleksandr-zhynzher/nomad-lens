import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLangPrefix } from "@core/hooks";
import type { BudgetMatch } from "@features/budget/hooks";
import { Plane } from "lucide-react";
import { localizeCountry, regionKey } from "@core/utils";
import type { ClimatePreferences, CountryData, WeightMap } from "@core/models";
import { useSyncScroll } from "@features/compare/hooks";
import { useComparisonSelection } from "@features/compare/hooks";
import { ComparisonAddButton } from "./ComparisonAddButton";
import { ComparisonRowShell } from "./ComparisonRowShell";
import { ComparisonSlotCard } from "./ComparisonSlotCard";
import { ComparisonTableHeader } from "./ComparisonTableHeader";
import { CountryPickerDropdown } from "./CountryPickerDropdown";
import { VisaCell } from "./VisaCellComponents";
import {
  VISA_FIELDS,
  VISA_COMPARISON_COLUMN_WIDTH,
  VISA_COMPARISON_COLUMN_GAP,
} from "@core/constants";
import type { SelectedSlot } from "@features/compare/utils";

interface Props {
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
}: Props) {
  const { t, i18n } = useTranslation();
  const langPrefix = useLangPrefix();
  const navigate = useNavigate();
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

  // Sync horizontal scroll between sticky header and body
  useSyncScroll(headerRef, bodyRef);

  const selectedCountries = selectedSlots.filter(
    (s) => s.country.nomadVisa != null,
  ) as SelectedSlot[];

  return (
    <div>
      {/* Country selector — horizontal scroll */}
      <div className="grid grid-cols-3 gap-3 pb-2 [scrollbar-width:thin] md:flex md:items-stretch md:overflow-x-auto">
        {selectedCountries.map((slot) => (
          <div key={slot.country.code} className="w-full min-w-0 md:w-[180px] md:shrink-0">
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
              nameSuffix={<Plane size={13} className="shrink-0 text-accent" />}
            >
              <span className="text-center text-[11px] leading-[1.3] text-muted">
                {slot.country.nomadVisa.visaName}
              </span>
            </ComparisonSlotCard>
          </div>
        ))}

        {/* Add button */}
        <div className="w-full min-w-0 md:w-[180px] md:shrink-0">
          <ComparisonAddButton
            label={t("compare.addCountry")}
            onClick={() => {
              setDropdownOpen((p) => !p);
            }}
          />
        </div>
      </div>

      {/* Dropdown */}
      <CountryPickerDropdown
        open={dropdownOpen}
        countries={filtered.map((c) => ({
          code: c.code,
          flagUrl: c.flagUrl,
          name: localizeCountry(c, lang).name,
          regionLabel: t(`regions.${regionKey(c.region)}`),
          trailing: <Plane size={14} className="text-accent" />,
        }))}
        query={query}
        onQueryChange={setQuery}
        onSelect={handleAdd}
        inputName="visa-comparison-search"
        searchPlaceholder={t("compare.searchCountry")}
        emptyLabel={t("compare.noCountriesFound")}
      />

      {/* Visa comparison grid */}
      {selectedCountries.length > 0 ? (
        <div className="mt-8">
          <div className="h-px bg-[#1C1C1C]" />

          {/* Sticky header */}
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

          {/* Data rows */}
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
                    style={{ "--vcw": VISA_COMPARISON_COLUMN_WIDTH } as React.CSSProperties}
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

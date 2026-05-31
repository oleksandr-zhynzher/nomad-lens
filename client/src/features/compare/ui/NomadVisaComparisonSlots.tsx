import type { CountryData } from "@core/models";
import { localizeCountry, regionKey } from "@core/utils";
import type { SelectedSlot } from "@features/compare/utils";
import { Plane } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ComparisonAddButton } from "./ComparisonAddButton";
import { ComparisonSlotCard } from "./ComparisonSlotCard";
import { CountryPickerDropdown } from "./CountryPickerDropdown";

interface NomadVisaComparisonSlotsProps {
  readonly selectedCountries: SelectedSlot[];
  readonly filteredCandidates: CountryData[];
  readonly lang: string;
  readonly langPrefix: string;
  readonly onRemove: (index: number) => void;
  readonly dropdownOpen: boolean;
  readonly setDropdownOpen: Dispatch<SetStateAction<boolean>>;
  readonly query: string;
  readonly setQuery: Dispatch<SetStateAction<string>>;
  readonly onAdd: (code: string) => void;
}

export function NomadVisaComparisonSlots({
  selectedCountries,
  filteredCandidates,
  lang,
  langPrefix,
  onRemove,
  dropdownOpen,
  setDropdownOpen,
  query,
  setQuery,
  onAdd,
}: NomadVisaComparisonSlotsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <>
      <div className="grid [scrollbar-width:thin] grid-cols-3 gap-3 pb-2 md:flex md:items-stretch md:overflow-x-auto">
        {selectedCountries.map((slot) => (
          <div key={slot.country.code} className="w-full min-w-0 md:w-[180px] md:shrink-0">
            <ComparisonSlotCard
              flagUrl={slot.country.flagUrl}
              countryName={localizeCountry(slot.country, lang).name}
              onRemove={() => {
                onRemove(slot.index);
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
        <div className="w-full min-w-0 md:w-[180px] md:shrink-0">
          <ComparisonAddButton
            label={t("compare.addCountry")}
            onClick={() => {
              setDropdownOpen((p) => !p);
            }}
          />
        </div>
      </div>
      <CountryPickerDropdown
        open={dropdownOpen}
        countries={filteredCandidates.map((c) => ({
          code: c.code,
          flagUrl: c.flagUrl,
          name: localizeCountry(c, lang).name,
          regionLabel: t(`regions.${regionKey(c.region)}`),
          trailing: <Plane size={14} className="text-accent" />,
        }))}
        query={query}
        onQueryChange={setQuery}
        onSelect={onAdd}
        inputName="visa-comparison-search"
        searchPlaceholder={t("compare.searchCountry")}
        emptyLabel={t("compare.noCountriesFound")}
      />
    </>
  );
}

import type { CSSProperties, RefObject } from "react";
import { useTranslation } from "react-i18next";
import type { WeightMap, ClimatePreferences } from "@core/models";
import { localizeCountry } from "@core/utils";
import type { BudgetMatch } from "@features/budget/hooks";
import {
  VISA_FIELDS,
  VISA_COMPARISON_COLUMN_WIDTH,
  VISA_COMPARISON_COLUMN_GAP,
} from "@core/constants";
import type { SelectedSlot } from "@features/compare/utils";
import { ComparisonRowShell } from "./ComparisonRowShell";
import { ComparisonTableHeader } from "./ComparisonTableHeader";
import { VisaCell } from "./VisaCell";

interface NomadVisaComparisonGridProps {
  readonly selectedCountries: SelectedSlot[];
  readonly weights: WeightMap;
  readonly climatePrefs: ClimatePreferences;
  readonly budgetMatchByCode: Map<string, BudgetMatch>;
  readonly lang: string;
  readonly headerRef: RefObject<HTMLDivElement | null>;
  readonly bodyRef: RefObject<HTMLDivElement | null>;
}

export function NomadVisaComparisonGrid({
  selectedCountries,
  weights,
  climatePrefs,
  budgetMatchByCode,
  lang,
  headerRef,
  bodyRef,
}: NomadVisaComparisonGridProps) {
  const { t } = useTranslation();
  return (
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
  );
}

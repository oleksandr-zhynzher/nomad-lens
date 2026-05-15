import { UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CollapsibleSection, PeopleCountStepper, ToggleGroup } from "@core/ui/panels";
import type { Bedrooms, HousingPreference } from "@features/budget/models";
import { BUDGET_BEDROOM_OPTIONS, BUDGET_HOUSING_OPTIONS } from "@features/budget/constants";

interface BudgetLifestyleSectionProps {
  readonly bedrooms: Bedrooms;
  readonly setBedrooms: (value: Bedrooms) => void;
  readonly housing: HousingPreference;
  readonly setHousing: (value: HousingPreference) => void;
  readonly peopleCount: number;
  readonly setPeopleCount: (value: number) => void;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
}

export function BudgetLifestyleSection({
  bedrooms,
  setBedrooms,
  housing,
  setHousing,
  peopleCount,
  setPeopleCount,
  isOpen,
  onToggle,
}: BudgetLifestyleSectionProps) {
  const { t } = useTranslation();
  return (
    <CollapsibleSection
      id="budget-lifestyle"
      icon={<UserRound size={16} color="#C2956A" />}
      label={t("budget.lifestyleProfile", "LIFESTYLE PROFILE")}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="flex flex-col gap-[14px] px-4 py-3">
        <div className="flex flex-col gap-[6px]">
          <span className="text-xs text-white">{t("budget.bedrooms.label")}</span>
          <ToggleGroup
            options={BUDGET_BEDROOM_OPTIONS}
            value={bedrooms}
            onChange={setBedrooms}
            labelFn={(v) => t(`budget.bedrooms.${v}`, `${v} BR`)}
          />
        </div>

        <div className="flex flex-col gap-[6px]">
          <span className="text-xs text-white">{t("budget.housing.label", "Location")}</span>
          <ToggleGroup
            options={BUDGET_HOUSING_OPTIONS}
            value={housing}
            onChange={setHousing}
            labelFn={(v) =>
              t(`budget.housing.${v}`, v === "majorCity" ? "Major City" : "Smaller City")
            }
          />
        </div>

        <div className="flex flex-col gap-[6px]">
          <span className="text-xs text-white">{t("budget.people.label", "People")}</span>
          <PeopleCountStepper value={peopleCount} min={1} max={20} onChange={setPeopleCount} />
        </div>
      </div>
    </CollapsibleSection>
  );
}

import { ChevronDown, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ToggleGroup } from "@core/ui/panels";
import type { Bedrooms, HousingPreference } from "@features/budget/models";
import { BUDGET_BEDROOM_OPTIONS, BUDGET_HOUSING_OPTIONS } from "@features/budget/constants";

interface BudgetPersonSectionProps {
  readonly bedrooms: Bedrooms;
  readonly setBedrooms: (value: Bedrooms) => void;
  readonly housing: HousingPreference;
  readonly setHousing: (value: HousingPreference) => void;
  readonly peopleCount: number;
  readonly setPeopleCount: (value: number) => void;
  readonly collapsed: Record<string, boolean>;
  readonly toggle: (key: string) => void;
}

export function BudgetPersonSection({
  bedrooms,
  setBedrooms,
  housing,
  setHousing,
  peopleCount,
  setPeopleCount,
  collapsed,
  toggle,
}: BudgetPersonSectionProps) {
  const { t } = useTranslation();
  return (
    <div className="border-b border-[#242424]">
      <button
        className="flex h-10 w-full items-center gap-2 bg-transparent px-3.5"
        onClick={() => {
          toggle("lifestyle");
        }}
      >
        <UserRound size={16} color="#C2956A" />
        <span className="flex-1 text-left text-[10px] font-semibold tracking-[1.5px] text-muted uppercase" />
        <ChevronDown
          size={14}
          className={`shrink-0 text-dimmer transition-transform duration-150 ${collapsed["lifestyle"] ? "-rotate-90" : "rotate-0"}`}
        />
      </button>

      {collapsed["lifestyle"] ? null : (
        <div className="flex flex-col gap-3.5 px-4 py-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-white">{t("budget.bedrooms.label")}</span>
            <ToggleGroup
              options={BUDGET_BEDROOM_OPTIONS}
              value={bedrooms}
              onChange={setBedrooms}
              labelFn={(v) => t(`budget.bedrooms.${v}`, `${v} BR`)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-white">{t("budget.housing.label", "Location")}</span>
            <ToggleGroup
              options={BUDGET_HOUSING_OPTIONS}
              value={housing}
              onChange={setHousing}
              labelFn={(v) =>
                t(`budget.housing.${v}`, v === "majorCity" ? "Major City" : "Region / Smaller City")
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-white">{t("budget.people.label", "People")}</span>
            <div className="inline-flex h-9 items-center gap-1 rounded-md">
              <button
                onClick={() => {
                  setPeopleCount(Math.max(1, peopleCount - 1));
                }}
                disabled={peopleCount <= 1}
                className={`flex h-8 w-8 items-center justify-center rounded-md border-0 text-base font-bold cursor-${peopleCount <= 1 ? "default" : "pointer"} transition-all duration-150 ${peopleCount <= 1 ? "bg-surface-2 text-[#555]" : "bg-border text-on-surface"}`}
              >
                −
              </button>
              <span className="min-w-6 text-center font-mono text-[15px] font-bold text-on-surface select-none">
                {peopleCount}
              </span>
              <button
                onClick={() => {
                  setPeopleCount(Math.min(20, peopleCount + 1));
                }}
                disabled={peopleCount >= 20}
                className={`flex h-8 w-8 items-center justify-center rounded-md border-0 text-base font-bold cursor-${peopleCount >= 20 ? "default" : "pointer"} transition-all duration-150 ${peopleCount >= 20 ? "bg-surface-2 text-[#555]" : "bg-border text-on-surface"}`}
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

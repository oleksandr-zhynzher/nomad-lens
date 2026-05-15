import { useTranslation } from "react-i18next";
import { PeopleCountStepper, ToggleGroup } from "@core/ui/panels";
import type { TourismBudgetState, AccommodationType } from "@features/tourism/hooks";

interface TourismBudgetPreferencesProps {
  readonly budgetState: TourismBudgetState;
  readonly onBudgetChange: <K extends keyof TourismBudgetState>(
    key: K,
    value: TourismBudgetState[K],
  ) => void;
}

export function TourismBudgetPreferences({
  budgetState,
  onBudgetChange,
}: TourismBudgetPreferencesProps) {
  const { t } = useTranslation();
  return (
    <>
      {/* Accommodation type */}
      <div className="flex flex-col gap-[6px]">
        <span className="text-xs text-white">
          {t("tourismBudget.accommodation", "Accommodation")}
        </span>
        <div className="flex gap-1 rounded-[4px] bg-surface-4 p-1">
          {(["hotel", "airbnb", "hostel"] as const).map((opt) => {
            const isHotel = opt === "hotel";
            const active = isHotel
              ? budgetState.accommodation.startsWith("hotel")
              : opt === budgetState.accommodation;
            return (
              <button
                key={opt}
                onClick={() => {
                  if (isHotel) {
                    if (!budgetState.accommodation.startsWith("hotel")) {
                      onBudgetChange("accommodation", "hotel3");
                    }
                  } else {
                    onBudgetChange("accommodation", opt as AccommodationType);
                  }
                }}
                className={`flex-1 cursor-pointer rounded-[3px] border-none py-[5px] text-center text-[11px] transition-all duration-[150ms] ${active ? "bg-accent font-medium text-white" : "bg-transparent font-normal text-dim"}`}
              >
                {t(`tourismBudget.accomTypes.${opt}`, opt.charAt(0).toUpperCase() + opt.slice(1))}
              </button>
            );
          })}
        </div>
        {budgetState.accommodation.startsWith("hotel") ? (
          <div className="flex gap-1 rounded-[4px] bg-surface-2 p-1">
            {([5, 4, 3, 2, 1] as const).map((stars) => {
              const key = `hotel${stars}` as AccommodationType;
              const active = budgetState.accommodation === key;
              return (
                <button
                  key={stars}
                  onClick={() => {
                    onBudgetChange("accommodation", key);
                  }}
                  className={`flex-1 cursor-pointer rounded-[3px] border-none py-[5px] text-center text-[7px] tracking-[0.5px] transition-all duration-[150ms] ${active ? "bg-border font-semibold text-[#FFD700]" : "bg-transparent font-normal text-[#666]"}`}
                >
                  {"★".repeat(stars)}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      {/* People count */}
      <div className="flex flex-col gap-[6px]">
        <span className="text-xs text-white">{t("tourismBudget.travellers", "Travellers")}</span>
        <PeopleCountStepper
          value={budgetState.peopleCount}
          min={1}
          max={10}
          onChange={(v) => {
            onBudgetChange("peopleCount", v);
          }}
        />
      </div>
      {/* Dining preference */}
      <div className="flex flex-col gap-[6px]">
        <span className="text-xs text-white">
          {t("tourismBudget.diningLabel", "Food & Dining")}
        </span>
        <ToggleGroup
          options={["market", "casual", "restaurants"] as const}
          value={budgetState.dining}
          onChange={(v) => {
            onBudgetChange("dining", v);
          }}
          labelFn={(opt) =>
            t(`tourismBudget.diningTypes.${opt}`, opt.charAt(0).toUpperCase() + opt.slice(1))
          }
        />
      </div>
    </>
  );
}

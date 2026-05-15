import { useState } from "react";
import { DollarSign, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import type React from "react";
import { Tooltip } from "@core/ui";
import { CollapsibleSection, PeopleCountStepper, ToggleGroup } from "@core/ui/panels";
import type { TourismBudgetState, AccommodationType } from "@features/tourism/hooks";

interface TourismBudgetSectionProps {
  readonly budgetState: TourismBudgetState;
  readonly onBudgetChange: <K extends keyof TourismBudgetState>(
    key: K,
    value: TourismBudgetState[K],
  ) => void;
}

export function TourismBudgetSection({ budgetState, onBudgetChange }: TourismBudgetSectionProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <CollapsibleSection
      id="tourism-budget"
      icon={<DollarSign size={16} color="#4CAF50" />}
      label={t("tourismBudget.groupLabel", "Travel Budget")}
      badge={
        <div className="flex items-center rounded-[3px] bg-[#0a2910] px-2 py-[3px]">
          <span className="font-mono text-[11px] text-[#4CAF50]">${budgetState.dailyBudget}</span>
        </div>
      }
      isOpen={isOpen}
      onToggle={() => {
        setIsOpen((prev) => !prev);
      }}
    >
      <div className="flex flex-col gap-4 px-4 py-3">
        {/* Daily budget slider */}
        <div>
          <div className="mb-2 flex items-end gap-2">
            <span className="font-mono text-2xl leading-none font-bold text-on-surface">
              ${budgetState.dailyBudget}
            </span>
            <span className="pb-px text-xs text-dimmer">{t("tourismBudget.perDay", "/day")}</span>
          </div>
          <input
            name="tourism-daily-budget"
            type="range"
            min={10}
            max={500}
            step={5}
            value={budgetState.dailyBudget}
            onChange={(e) => {
              onBudgetChange("dailyBudget", Number(e.target.value));
            }}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full [background:linear-gradient(to_right,var(--color-accent)_0%,var(--color-accent)_var(--pct),#333333_var(--pct),#333333_100%)]"
            style={
              { "--pct": `${((budgetState.dailyBudget - 10) / 490) * 100}%` } as React.CSSProperties
            }
            aria-label={t("tourismBudget.dailyBudgetLabel", "Daily budget")}
          />
          <div className="mt-1.5 flex justify-between">
            <span className="text-[10px] text-dimmer">$10</span>
            <span className="text-[10px] text-dimmer">$500</span>
          </div>
        </div>

        {/* Budget blend slider */}
        <div className="flex flex-col gap-[9px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-white">
                {t("tourismBudget.budgetBlend", "Budget blend")}
              </span>
              <Tooltip
                content={
                  <div className="max-w-[240px]">
                    <div className="mb-1.5 font-semibold text-white">
                      {t("tourismBudget.budgetBlend", "Budget blend")}
                    </div>
                    <div>
                      {t(
                        "tourismBudget.budgetBlendDesc",
                        "Controls the balance between tourism quality scores and budget affordability in the ranking.",
                      )}
                    </div>
                  </div>
                }
                side="bottom"
              >
                <Info size={13} color="#FFFFFF" className="shrink-0 cursor-pointer opacity-45" />
              </Tooltip>
            </div>
            <span className="font-mono text-[11px] text-accent-dim">{budgetState.budgetBlend}</span>
          </div>
          <input
            name="tourism-budget-blend"
            type="range"
            min={0}
            max={100}
            value={budgetState.budgetBlend}
            onChange={(e) => {
              onBudgetChange("budgetBlend", Number(e.target.value));
            }}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full [background:linear-gradient(to_right,var(--color-accent)_0%,var(--color-accent)_var(--pct),#333333_var(--pct),#333333_100%)]"
            style={{ "--pct": `${budgetState.budgetBlend}%` } as React.CSSProperties}
            aria-label={t("tourismBudget.budgetBlend", "Budget blend")}
          />
          <div className="flex justify-between">
            <span className="text-[10px] text-dimmer">
              {t("tourismBudget.affordability", "Affordability")}
            </span>
            <span className="text-[10px] text-dimmer">
              {t("tourismBudget.tourismQuality", "Tourism Quality")}
            </span>
          </div>
        </div>

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
          {/* Hotel star sub-selector */}
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
      </div>
    </CollapsibleSection>
  );
}

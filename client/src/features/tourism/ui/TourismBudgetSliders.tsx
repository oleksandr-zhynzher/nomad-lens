import { Tooltip } from "@core/ui";
import type { TourismBudgetState } from "@features/tourism/hooks";
import { Info } from "lucide-react";
import type React from "react";
import { useTranslation } from "react-i18next";

interface TourismBudgetSlidersProps {
  readonly budgetState: TourismBudgetState;
  readonly onBudgetChange: <K extends keyof TourismBudgetState>(
    key: K,
    value: TourismBudgetState[K],
  ) => void;
}

export function TourismBudgetSliders({ budgetState, onBudgetChange }: TourismBudgetSlidersProps) {
  const { t } = useTranslation();
  return (
    <>
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
    </>
  );
}

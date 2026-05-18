import { CollapsibleSection } from "@core/ui/panels";
import { DollarSign } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface BudgetAmountSectionProps {
  readonly budget: number;
  readonly setBudget: (value: number) => void;
  readonly budgetPct: number;
}

export function BudgetAmountSection({ budget, setBudget, budgetPct }: BudgetAmountSectionProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <CollapsibleSection
      id="budget-amount"
      icon={<DollarSign size={16} className="text-accent" />}
      label={t("budget.budgetLabel", "Monthly Budget")}
      badge={
        <div className="flex items-center rounded-[3px] bg-[#2a1f00] px-2 py-[3px]">
          <span className="font-mono text-[11px] text-accent">${budget.toLocaleString()}</span>
        </div>
      }
      isOpen={isOpen}
      onToggle={() => {
        setIsOpen((prev) => !prev);
      }}
    >
      <div className="px-4 py-3">
        <div className="mb-3 flex items-end gap-2">
          <span className="font-mono text-[28px] leading-none font-bold text-on-surface">
            ${budget.toLocaleString()}
          </span>
          <span className="pb-0.5 text-xs text-dimmer">{t("budget.perMonth", "/month")}</span>
        </div>

        <input
          name="budget-amount"
          type="range"
          min={300}
          max={10_000}
          step={50}
          value={budget}
          onChange={(e) => {
            setBudget(Number(e.target.value));
          }}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
          style={{
            background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${budgetPct}%, #333333 ${budgetPct}%, #333333 100%)`,
          }}
          aria-label={t("a11y.budgetSlider", "Budget slider")}
        />

        <div className="mt-1.5 flex justify-between">
          <span className="text-[10px] text-dimmer">$300</span>
          <span className="text-[10px] text-dimmer">$10,000</span>
        </div>
      </div>
    </CollapsibleSection>
  );
}

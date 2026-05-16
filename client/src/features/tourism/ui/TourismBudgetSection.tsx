import { CollapsibleSection } from "@core/ui/panels";
import type { TourismBudgetState } from "@features/tourism/hooks";
import { DollarSign } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { TourismBudgetPreferences } from "./TourismBudgetPreferences";
import { TourismBudgetSliders } from "./TourismBudgetSliders";

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
        <TourismBudgetSliders budgetState={budgetState} onBudgetChange={onBudgetChange} />
        <TourismBudgetPreferences budgetState={budgetState} onBudgetChange={onBudgetChange} />
      </div>
    </CollapsibleSection>
  );
}

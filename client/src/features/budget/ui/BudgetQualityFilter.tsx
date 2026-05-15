import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "@core/ui";
import { WeightSliderRow } from "@core/ui/panels";

interface BudgetQualityFilterProps {
  readonly qualityBlend: number;
  readonly setQualityBlend: (value: number) => void;
}

export function BudgetQualityFilter({ qualityBlend, setQualityBlend }: BudgetQualityFilterProps) {
  const { t } = useTranslation();
  return (
    <div className="border-b border-[#242424] px-4 py-3">
      <WeightSliderRow
        inputName="compare-budget-quality-blend"
        value={qualityBlend}
        onChange={setQualityBlend}
        ariaLabel={t("a11y.qualityBlend", "Quality blend")}
        label={
          <span className="text-xs text-white">{t("budget.qualityBlend", "Quality blend")}</span>
        }
        tooltipIcon={
          <Tooltip
            content={
              <div className="max-w-[240px]">
                <div className="mb-1.5 font-semibold text-white">
                  {t("budget.qualityBlend", "Quality blend")}
                </div>
                <div>
                  {t(
                    "budget.qualityBlendTooltip",
                    "Controls the balance between pure cost-of-living affordability and overall country quality.",
                  )}
                </div>
              </div>
            }
            side="bottom"
          >
            <Info size={13} color="#FFFFFF" className="shrink-0 cursor-pointer opacity-45" />
          </Tooltip>
        }
      />
      <div className="mt-1.5 flex justify-between">
        <span className="text-[10px] text-dimmer">
          {t("budget.pureAffordability", "Pure Affordability")}
        </span>
        <span className="text-[10px] text-dimmer">
          {t("budget.qualityFocus", "Country Quality")}
        </span>
      </div>
    </div>
  );
}

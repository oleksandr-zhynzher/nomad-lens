import { Tooltip } from "@core/ui";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BudgetQualitySectionProps {
  readonly qualityBlend: number;
  readonly setQualityBlend: (value: number) => void;
}

export function BudgetQualitySection({ qualityBlend, setQualityBlend }: BudgetQualitySectionProps) {
  const { t } = useTranslation();
  return (
    <div className="border-b border-[#242424] px-4 py-3">
      <div className="flex flex-col gap-[9px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-white">{t("budget.qualityBlend", "Quality blend")}</span>
            <Tooltip
              content={
                <div className="max-w-[240px]">
                  <div className="mb-1.5 font-semibold text-white">
                    {t("budget.qualityBlend", "Quality blend")}
                  </div>
                  <div>
                    {t(
                      "budget.qualityBlendTooltip",
                      "Controls the balance between pure cost-of-living affordability and overall country quality (safety, healthcare, internet, infrastructure). At 0% only price matters; at 100% only quality matters.",
                    )}
                  </div>
                </div>
              }
              side="bottom"
            >
              <Info size={13} color="#FFFFFF" className="shrink-0 cursor-pointer opacity-[0.45]" />
            </Tooltip>
          </div>
          <span className="font-mono text-[11px] text-accent-dim">{qualityBlend}</span>
        </div>
        <input
          name="budget-quality-blend"
          type="range"
          min={0}
          max={100}
          value={qualityBlend}
          onChange={(e) => {
            setQualityBlend(Number(e.target.value));
          }}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
          style={{
            background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${qualityBlend}%, #333333 ${qualityBlend}%, #333333 100%)`,
          }}
          aria-label={t("a11y.qualityBlend", "Quality blend")}
        />
        <div className="flex justify-between">
          <span className="text-[10px] text-dimmer">
            {t("budget.pureAffordability", "Pure Affordability")}
          </span>
          <span className="text-[10px] text-dimmer">
            {t("budget.qualityFocus", "Country Quality")}
          </span>
        </div>
      </div>
    </div>
  );
}

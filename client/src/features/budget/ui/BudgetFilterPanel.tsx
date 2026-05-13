import { useState } from "react";
import { Sliders, UserRound, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Tooltip } from "@core/ui";
import { useLangPrefix } from "@core/hooks";
import type { useBudgetState } from "@features/budget/hooks";
import { CollapsibleSection } from "@core/ui/panels";
import { PeopleCountStepper } from "@core/ui/panels";
import { ToggleGroup } from "@core/ui/panels";
import { WeightSliderRow } from "@core/ui/panels";
import { BUDGET_CATEGORY_KEYS } from "@features/budget/constants";

type BudgetStateReturn = ReturnType<typeof useBudgetState>;

interface Props {
  bs: BudgetStateReturn;
}

export function BudgetFilterPanel({ bs }: Props) {
  const { t } = useTranslation();
  const langPrefix = useLangPrefix();
  const [open, setOpen] = useState({ lifestyle: true, categories: true });
  const toggle = (key: keyof typeof open) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  const budgetPct = ((bs.budget - 300) / 9700) * 100;

  const avgCategoryWeight = Math.round(
    Object.values(bs.categoryWeights).reduce((a, b) => a + b, 0) / BUDGET_CATEGORY_KEYS.length,
  );

  return (
    <div className="bg-[#131416] border border-[#1E1E22] rounded-[8px] overflow-hidden">
      {/* Budget slider */}
      <div className="p-4 border-b border-[#242424]">
        <div className="flex items-end gap-2 mb-3">
          <span className="font-mono text-[28px] font-semibold text-on-surface leading-none">
            ${bs.budget.toLocaleString()}
          </span>
          <span className="text-xs text-dimmer pb-0.5">{t("budget.perMonth", "/month")}</span>
        </div>
        <input
          name="compare-budget-amount"
          type="range"
          min={300}
          max={10000}
          step={50}
          value={bs.budget}
          onChange={(e) => bs.setBudget(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer [background:linear-gradient(to_right,var(--color-accent)_0%,var(--color-accent)_var(--pct),#333333_var(--pct),#333333_100%)]"
          style={{ "--pct": `${budgetPct}%` } as React.CSSProperties}
          aria-label={t("a11y.budgetSlider", "Budget slider")}
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-dimmer">$300</span>
          <span className="text-[10px] text-dimmer">$10,000</span>
        </div>
      </div>

      {/* Quality blend */}
      <div className="px-4 py-3 border-b border-[#242424]">
        <WeightSliderRow
          inputName="compare-budget-quality-blend"
          value={bs.qualityBlend}
          onChange={bs.setQualityBlend}
          ariaLabel={t("a11y.qualityBlend", "Quality blend")}
          label={
            <span className="text-xs text-white">{t("budget.qualityBlend", "Quality blend")}</span>
          }
          tooltipIcon={
            <Tooltip
              content={
                <div className="max-w-[240px]">
                  <div className="mb-1.5 text-white font-semibold">
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
              <Info size={13} color="#FFFFFF" className="cursor-pointer shrink-0 opacity-45" />
            </Tooltip>
          }
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-dimmer">
            {t("budget.pureAffordability", "Pure Affordability")}
          </span>
          <span className="text-[10px] text-dimmer">
            {t("budget.qualityFocus", "Country Quality")}
          </span>
        </div>
      </div>

      {/* Lifestyle profile */}
      <CollapsibleSection
        id="budget-lifestyle"
        icon={<UserRound size={16} color="#C2956A" />}
        label={t("budget.lifestyleProfile", "LIFESTYLE PROFILE")}
        isOpen={open.lifestyle}
        onToggle={() => toggle("lifestyle")}
      >
        <div className="flex flex-col px-4 py-3 gap-[14px]">
          <div className="flex flex-col gap-[6px]">
            <span className="text-xs text-white">{t("budget.bedrooms.label")}</span>
            <ToggleGroup
              options={[1, 2, 3] as const}
              value={bs.bedrooms}
              onChange={bs.setBedrooms}
              labelFn={(v) => t(`budget.bedrooms.${v}`, `${v} BR`)}
            />
          </div>

          <div className="flex flex-col gap-[6px]">
            <span className="text-xs text-white">{t("budget.housing.label", "Location")}</span>
            <ToggleGroup
              options={["majorCity", "smallerCity"] as const}
              value={bs.housing}
              onChange={bs.setHousing}
              labelFn={(v) =>
                t(`budget.housing.${v}`, v === "majorCity" ? "Major City" : "Smaller City")
              }
            />
          </div>

          <div className="flex flex-col gap-[6px]">
            <span className="text-xs text-white">{t("budget.people.label", "People")}</span>
            <PeopleCountStepper
              value={bs.peopleCount}
              min={1}
              max={20}
              onChange={bs.setPeopleCount}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Category weights */}
      <CollapsibleSection
        id="budget-categories"
        icon={<Sliders size={16} color="#C2956A" />}
        label={t("budget.categoryWeights", "CATEGORY WEIGHTS")}
        badge={
          <div className="flex items-center bg-[#291608] rounded-[3px] px-2 py-[3px]">
            <span className="font-mono text-[11px] text-accent-dim">
              {t("weights.averageBadge")} {avgCategoryWeight}
            </span>
          </div>
        }
        isOpen={open.categories}
        onToggle={() => toggle("categories")}
      >
        <div className="py-1">
          {BUDGET_CATEGORY_KEYS.map((key) => (
            <div key={key} className="px-4 py-2.5">
              <WeightSliderRow
                inputName={`${key}-compare-budget-weight`}
                value={bs.categoryWeights[key]}
                onChange={(v) => bs.handleCategoryWeight(key, v)}
                ariaLabel={t(`budget.categories.${key}`, key)}
                label={
                  <Link
                    to={`${langPrefix}/budget-categories`}
                    className="text-xs text-white no-underline"
                  >
                    {t(`budget.categories.${key}`, key)}
                  </Link>
                }
              />
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Reset */}
      <div className="px-4 py-3">
        <button
          type="button"
          onClick={bs.handleReset}
          className="w-full flex items-center justify-center gap-2 rounded bg-transparent text-accent-dim text-[13px] font-medium h-10 border border-border rounded-[6px] cursor-pointer"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          {t("weights.resetToDefaults", "Reset to defaults")}
        </button>
      </div>
    </div>
  );
}

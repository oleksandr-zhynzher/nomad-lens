import { useState } from "react";
import { Sliders, UserRound, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Tooltip } from "./Tooltip";
import { useLangPrefix } from "../hooks/useLangPrefix";
import type { useBudgetState } from "../hooks/useBudgetState";
import { CollapsibleSection } from "../shared/ui/panels/CollapsibleSection";
import { WeightSliderRow } from "../shared/ui/panels/WeightSliderRow";
import { ToggleGroup } from "../shared/ui/panels/ToggleGroup";
import { PeopleCountStepper } from "../shared/ui/panels/PeopleCountStepper";
import { BUDGET_CATEGORY_KEYS } from "../utils/budgetConstants";

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
    <div
      style={{
        backgroundColor: "#131416",
        border: "1px solid #1E1E22",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      {/* Budget slider */}
      <div style={{ padding: "16px", borderBottom: "1px solid #242424" }}>
        <div className="flex items-end gap-2 mb-3">
          <span
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: 28,
              fontWeight: 600,
              color: "#E8E9EB",
              lineHeight: 1,
            }}
          >
            ${bs.budget.toLocaleString()}
          </span>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              color: "#808080",
              paddingBottom: 2,
            }}
          >
            {t("budget.perMonth", "/month")}
          </span>
        </div>
        <input
          name="compare-budget-amount"
          type="range"
          min={300}
          max={10000}
          step={50}
          value={bs.budget}
          onChange={(e) => bs.setBudget(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${budgetPct}%, #333333 ${budgetPct}%, #333333 100%)`,
          }}
          aria-label={t("a11y.budgetSlider", "Budget slider")}
        />
        <div className="flex justify-between mt-1.5">
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: "#808080" }}>
            $300
          </span>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: "#808080" }}>
            $10,000
          </span>
        </div>
      </div>

      {/* Quality blend */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #242424" }}>
        <WeightSliderRow
          inputName="compare-budget-quality-blend"
          value={bs.qualityBlend}
          onChange={bs.setQualityBlend}
          ariaLabel={t("a11y.qualityBlend", "Quality blend")}
          label={
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#FFFFFF" }}>
              {t("budget.qualityBlend", "Quality blend")}
            </span>
          }
          tooltipIcon={
            <Tooltip
              content={
                <div style={{ maxWidth: 240 }}>
                  <div style={{ marginBottom: 6, color: "#FFFFFF", fontWeight: 600 }}>
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
              <Info
                size={13}
                color="#FFFFFF"
                style={{ cursor: "pointer", flexShrink: 0, opacity: 0.45 }}
              />
            </Tooltip>
          }
        />
        <div className="flex justify-between mt-1.5">
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: "#808080" }}>
            {t("budget.pureAffordability", "Pure Affordability")}
          </span>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: "#808080" }}>
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
        <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="flex flex-col" style={{ gap: 6 }}>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#FFFFFF" }}>
              {t("budget.bedrooms.label")}
            </span>
            <ToggleGroup
              options={[1, 2, 3] as const}
              value={bs.bedrooms}
              onChange={bs.setBedrooms}
              labelFn={(v) => t(`budget.bedrooms.${v}`, `${v} BR`)}
            />
          </div>

          <div className="flex flex-col" style={{ gap: 6 }}>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#FFFFFF" }}>
              {t("budget.housing.label", "Location")}
            </span>
            <ToggleGroup
              options={["majorCity", "smallerCity"] as const}
              value={bs.housing}
              onChange={bs.setHousing}
              labelFn={(v) =>
                t(`budget.housing.${v}`, v === "majorCity" ? "Major City" : "Smaller City")
              }
            />
          </div>

          <div className="flex flex-col" style={{ gap: 6 }}>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#FFFFFF" }}>
              {t("budget.people.label", "People")}
            </span>
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#291608",
              borderRadius: 3,
              padding: "3px 8px",
            }}
          >
            <span
              style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "#C2956A" }}
            >
              {t("weights.averageBadge")} {avgCategoryWeight}
            </span>
          </div>
        }
        isOpen={open.categories}
        onToggle={() => toggle("categories")}
      >
        <div style={{ paddingTop: 4, paddingBottom: 4 }}>
          {BUDGET_CATEGORY_KEYS.map((key) => (
            <div key={key} style={{ padding: "10px 16px" }}>
              <WeightSliderRow
                inputName={`${key}-compare-budget-weight`}
                value={bs.categoryWeights[key]}
                onChange={(v) => bs.handleCategoryWeight(key, v)}
                ariaLabel={t(`budget.categories.${key}`, key)}
                label={
                  <Link
                    to={`${langPrefix}/budget-categories`}
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 12,
                      color: "#FFFFFF",
                      textDecoration: "none",
                    }}
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
      <div style={{ padding: "12px 16px" }}>
        <button
          type="button"
          onClick={bs.handleReset}
          className="w-full flex items-center justify-center gap-2 rounded"
          style={{
            backgroundColor: "transparent",
            color: "var(--color-accent-dim)",
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            fontWeight: 500,
            height: "40px",
            border: "1px solid #333333",
            borderRadius: "6px",
            cursor: "pointer",
          }}
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

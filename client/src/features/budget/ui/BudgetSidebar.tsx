import type { Dispatch, SetStateAction } from "react";
import { ChevronDown, Sliders, UserRound, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ToggleGroup } from "@core/ui/panels";
import { Tooltip } from "@core/ui";
import { BUDGET_CATEGORIES } from "@features/budget/constants";
import type { BudgetState } from "@features/budget/types/budget.types";

export interface BudgetSidebarProps {
  readonly bs: BudgetState;
  readonly langPrefix: string;
  readonly collapsed: Record<string, boolean>;
  readonly toggle: (key: string) => void;
  readonly budgetPct: number;
  readonly copied: boolean;
  readonly setCopied: Dispatch<SetStateAction<boolean>>;
}

export function BudgetSidebar({
  bs,
  langPrefix,
  collapsed,
  toggle,
  budgetPct,
  copied,
  setCopied,
}: BudgetSidebarProps) {
  const { t } = useTranslation();
  return (
    <>
      {/* ── Budget slider (always visible) ────────────────── */}
      <div className="border-b border-[#242424] p-4">
        <div className="mb-3 flex items-end gap-2">
          <span className="font-mono text-[28px] leading-none font-bold text-on-surface">
            ${bs.budget.toLocaleString()}
          </span>
          <span className="pb-0.5 text-xs text-dimmer">{t("budget.perMonth", "/month")}</span>
        </div>

        <input
          name="budget-amount"
          type="range"
          min={300}
          max={10_000}
          step={50}
          value={bs.budget}
          onChange={(e) => {
            bs.setBudget(Number(e.target.value));
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

      {/* ── QUALITY BLEND (top level) ─────────────────────── */}
      <div className="border-b border-[#242424] px-4 py-3">
        <div className="flex flex-col gap-[9px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-white">
                {t("budget.qualityBlend", "Quality blend")}
              </span>
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
                <Info
                  size={13}
                  color="#FFFFFF"
                  className="shrink-0 cursor-pointer opacity-[0.45]"
                />
              </Tooltip>
            </div>
            <span className="font-mono text-[11px] text-accent-dim">{bs.qualityBlend}</span>
          </div>
          <input
            name="budget-quality-blend"
            type="range"
            min={0}
            max={100}
            value={bs.qualityBlend}
            onChange={(e) => {
              bs.setQualityBlend(Number(e.target.value));
            }}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
            style={{
              background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${bs.qualityBlend}%, #333333 ${bs.qualityBlend}%, #333333 100%)`,
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

      {/* ── LIFESTYLE PROFILE (collapsible) ───────────────── */}
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
            className={`shrink-0 text-dimmer transition-transform duration-150 ${collapsed.lifestyle ? "-rotate-90" : "rotate-0"}`}
          />
        </button>

        {collapsed.lifestyle ? null : (
          <div className="flex flex-col gap-3.5 px-4 py-3">
            {/* Apartment size */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-white">{t("budget.bedrooms.label")}</span>
              <ToggleGroup
                options={[1, 2, 3] as const}
                value={bs.bedrooms}
                onChange={bs.setBedrooms}
                labelFn={(v) => t(`budget.bedrooms.${v}`, `${v} BR`)}
              />
            </div>

            {/* Housing preference — city vs region, applies to all bedroom counts */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-white">{t("budget.housing.label", "Location")}</span>
              <ToggleGroup
                options={["majorCity", "smallerCity"] as const}
                value={bs.housing}
                onChange={bs.setHousing}
                labelFn={(v) =>
                  t(
                    `budget.housing.${v}`,
                    v === "majorCity" ? "Major City" : "Region / Smaller City",
                  )
                }
              />
            </div>

            {/* People count */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-white">{t("budget.people.label", "People")}</span>
              <div className="inline-flex h-9 items-center gap-1 rounded-md">
                <button
                  onClick={() => {
                    bs.setPeopleCount(Math.max(1, bs.peopleCount - 1));
                  }}
                  disabled={bs.peopleCount <= 1}
                  className={`flex h-8 w-8 items-center justify-center rounded-md border-0 text-base font-bold cursor-${bs.peopleCount <= 1 ? "default" : "pointer"} transition-all duration-150 ${bs.peopleCount <= 1 ? "bg-surface-2 text-[#555]" : "bg-border text-on-surface"}`}
                >
                  −
                </button>
                <span className="min-w-6 text-center font-mono text-[15px] font-bold text-on-surface select-none">
                  {bs.peopleCount}
                </span>
                <button
                  onClick={() => {
                    bs.setPeopleCount(Math.min(20, bs.peopleCount + 1));
                  }}
                  disabled={bs.peopleCount >= 20}
                  className={`flex h-8 w-8 items-center justify-center rounded-md border-0 text-base font-bold cursor-${bs.peopleCount >= 20 ? "default" : "pointer"} transition-all duration-150 ${bs.peopleCount >= 20 ? "bg-surface-2 text-[#555]" : "bg-border text-on-surface"}`}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── CATEGORY WEIGHTS (collapsible) ────────────────── */}
      <div className="border-b border-[#242424]">
        <button
          className="flex h-10 w-full items-center gap-2 bg-transparent px-3.5"
          onClick={() => {
            toggle("categories");
          }}
        >
          <Sliders size={16} color="#C2956A" />
          <span className="flex-1 text-left text-[10px] font-semibold tracking-[1.5px] text-muted uppercase">
            {t("budget.categoryWeights", "CATEGORY WEIGHTS")}
          </span>
          <ChevronDown
            size={14}
            className={`shrink-0 text-dimmer transition-transform duration-150 ${collapsed.categories ? "-rotate-90" : "rotate-0"}`}
          />
        </button>

        {collapsed.categories ? null : (
          <div className="pt-0.5 pb-0.5">
            {BUDGET_CATEGORIES.map(({ key, icon: Icon }) => (
              <div key={key} className="px-4 py-2.5">
                <div className="flex flex-col gap-[9px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Icon size={14} color="#9E9E9E" />
                      <Link
                        to={`${langPrefix}/budget-categories`}
                        className="text-xs font-normal text-white no-underline"
                      >
                        {t(`budget.categories.${key}`)}
                      </Link>
                    </div>
                    <span className="font-mono text-[11px] text-accent-dim">
                      {bs.categoryWeights[key]}
                    </span>
                  </div>
                  <input
                    name={`${key}-budget-weight`}
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={bs.categoryWeights[key]}
                    onChange={(e) => {
                      bs.handleCategoryWeight(key, Number(e.target.value));
                    }}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
                    style={{
                      background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${bs.categoryWeights[key]}%, #333333 ${bs.categoryWeights[key]}%, #333333 100%)`,
                    }}
                    aria-label={`${key} weight`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Share & Reset buttons ─────────────────────────── */}
      <div className="sticky bottom-0 flex-shrink-0 border-t border-border bg-[#131416]">
        <div className="flex flex-col gap-2 px-4 py-3">
          {bs.isDefault ? null : (
            <button
              onClick={() => {
                bs.handleShare();
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                }, 3000);
              }}
              aria-live="polite"
              className={`flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded rounded-md border text-[13px] font-medium transition-colors ${copied ? "border-[#4A8A4A] bg-[#2A4A2A] text-[#88CC88]" : "border-[#2A4A2A] bg-[#1A2A1A] text-[#6B9E6B]"}`}
            >
              {copied ? (
                <>
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
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {t("weights.linkCopied", "Link copied!")}
                </>
              ) : (
                <>
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
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                  {t("weights.shareWeights", "Share weights")}
                </>
              )}
            </button>
          )}
          <button
            onClick={bs.handleReset}
            className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded rounded-md border border-border bg-transparent text-[13px] font-medium text-accent-dim transition-colors"
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
    </>
  );
}

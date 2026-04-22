import { useState } from "react";
import { ChevronDown, Sliders, UserRound, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Tooltip } from "./Tooltip";
import { useLangPrefix } from "../hooks/useLangPrefix";
import type { useBudgetState } from "../hooks/useBudgetState";

type BudgetStateReturn = ReturnType<typeof useBudgetState>;

const BUDGET_CATEGORY_KEYS = [
  "housing",
  "groceries",
  "dining",
  "transport",
  "utilities",
  "coworking",
  "healthInsurance",
] as const;

function ToggleGroup<T extends string | number>({
  options,
  value,
  onChange,
  labelFn,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  labelFn: (v: T) => string;
}) {
  return (
    <div
      className="flex"
      style={{
        backgroundColor: "#2A2A2A",
        borderRadius: 4,
        padding: 4,
        gap: 4,
      }}
    >
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={String(opt)}
            onClick={() => onChange(opt)}
            style={{
              flex: 1,
              padding: "5px 0",
              borderRadius: 3,
              border: "none",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              fontWeight: active ? 500 : 400,
              backgroundColor: active ? "var(--color-accent)" : "transparent",
              color: active ? "#FFFFFF" : "#8A8A8A",
              textAlign: "center",
              transition: "all 0.15s ease",
            }}
          >
            {labelFn(opt)}
          </button>
        );
      })}
    </div>
  );
}

interface Props {
  bs: BudgetStateReturn;
}

export function BudgetFilterPanel({ bs }: Props) {
  const { t } = useTranslation();
  const langPrefix = useLangPrefix();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    lifestyle: false,
    categories: false,
  });
  const toggle = (key: string) =>
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  const budgetPct = ((bs.budget - 300) / 9700) * 100;

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
              fontWeight: 700,
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
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 10,
              color: "#808080",
            }}
          >
            $300
          </span>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 10,
              color: "#808080",
            }}
          >
            $10,000
          </span>
        </div>
      </div>

      {/* Quality blend */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #242424" }}>
        <div className="flex flex-col" style={{ gap: 9 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  color: "#FFFFFF",
                }}
              >
                {t("budget.qualityBlend", "Quality blend")}
              </span>
              <Tooltip
                content={
                  <div style={{ maxWidth: 240 }}>
                    <div
                      style={{
                        marginBottom: 6,
                        color: "#FFFFFF",
                        fontWeight: 600,
                      }}
                    >
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
            </div>
            <span
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: 11,
                color: "var(--color-accent-dim)",
              }}
            >
              {bs.qualityBlend}
            </span>
          </div>
          <input
            name="compare-budget-quality-blend"
            type="range"
            min={0}
            max={100}
            value={bs.qualityBlend}
            onChange={(e) => bs.setQualityBlend(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${bs.qualityBlend}%, #333333 ${bs.qualityBlend}%, #333333 100%)`,
            }}
            aria-label={t("a11y.qualityBlend", "Quality blend")}
          />
          <div className="flex justify-between">
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 10,
                color: "#808080",
              }}
            >
              {t("budget.pureAffordability", "Pure Affordability")}
            </span>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 10,
                color: "#808080",
              }}
            >
              {t("budget.qualityFocus", "Country Quality")}
            </span>
          </div>
        </div>
      </div>

      {/* Lifestyle profile (collapsible) */}
      <div style={{ borderBottom: "1px solid #242424" }}>
        <button
          className="w-full flex items-center"
          style={{
            height: 40,
            padding: "0 14px",
            gap: 8,
            backgroundColor: "transparent",
          }}
          onClick={() => toggle("lifestyle")}
        >
          <UserRound size={16} color="#C2956A" />
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: "#9E9E9E",
              flex: 1,
              textAlign: "left",
            }}
          >
            {t("budget.lifestyleProfile", "LIFESTYLE PROFILE")}
          </span>
          <ChevronDown
            size={14}
            style={{
              color: "#808080",
              transform: !collapsed.lifestyle
                ? "rotate(0deg)"
                : "rotate(-90deg)",
              transition: "transform 0.15s ease",
              flexShrink: 0,
            }}
          />
        </button>

        {!collapsed.lifestyle && (
          <div
            style={{
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div className="flex flex-col" style={{ gap: 6 }}>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  color: "#FFFFFF",
                }}
              >
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
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  color: "#FFFFFF",
                }}
              >
                {t("budget.housing.label", "Location")}
              </span>
              <ToggleGroup
                options={["majorCity", "smallerCity"] as const}
                value={bs.housing}
                onChange={bs.setHousing}
                labelFn={(v) =>
                  t(
                    `budget.housing.${v}`,
                    v === "majorCity" ? "Major City" : "Smaller City",
                  )
                }
              />
            </div>

            <div className="flex flex-col" style={{ gap: 6 }}>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  color: "#FFFFFF",
                }}
              >
                {t("budget.people.label", "People")}
              </span>
              <div
                className="inline-flex items-center"
                style={{ borderRadius: 6, height: 36, gap: 4 }}
              >
                <button
                  onClick={() =>
                    bs.setPeopleCount(Math.max(1, bs.peopleCount - 1))
                  }
                  disabled={bs.peopleCount <= 1}
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: bs.peopleCount <= 1 ? "#222" : "#333",
                    border: "none",
                    borderRadius: 6,
                    color: bs.peopleCount <= 1 ? "#555" : "#E8E9EB",
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: bs.peopleCount <= 1 ? "default" : "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  −
                </button>
                <span
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#E8E9EB",
                    minWidth: 24,
                    textAlign: "center",
                    userSelect: "none",
                  }}
                >
                  {bs.peopleCount}
                </span>
                <button
                  onClick={() =>
                    bs.setPeopleCount(Math.min(20, bs.peopleCount + 1))
                  }
                  disabled={bs.peopleCount >= 20}
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: bs.peopleCount >= 20 ? "#222" : "#333",
                    border: "none",
                    borderRadius: 6,
                    color: bs.peopleCount >= 20 ? "#555" : "#E8E9EB",
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: bs.peopleCount >= 20 ? "default" : "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category weights (collapsible) */}
      <div style={{ borderBottom: "1px solid #242424" }}>
        <button
          className="w-full flex items-center"
          style={{
            height: 40,
            padding: "0 14px",
            gap: 8,
            backgroundColor: "transparent",
          }}
          onClick={() => toggle("categories")}
        >
          <Sliders size={16} color="#C2956A" />
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: "#9E9E9E",
              flex: 1,
              textAlign: "left",
            }}
          >
            {t("budget.categoryWeights", "CATEGORY WEIGHTS")}
          </span>
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
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: 11,
                color: "#C2956A",
              }}
            >
              {t("weights.averageBadge")}{" "}
              {Math.round(
                Object.values(bs.categoryWeights).reduce((a, b) => a + b, 0) /
                  BUDGET_CATEGORY_KEYS.length,
              )}
            </span>
          </div>
          <ChevronDown
            size={14}
            style={{
              color: "#808080",
              transform: !collapsed.categories
                ? "rotate(0deg)"
                : "rotate(-90deg)",
              transition: "transform 0.15s ease",
              flexShrink: 0,
            }}
          />
        </button>

        {!collapsed.categories && (
          <div style={{ paddingTop: 4, paddingBottom: 4 }}>
            {BUDGET_CATEGORY_KEYS.map((key) => (
              <div key={key} style={{ padding: "10px 16px" }}>
                <div className="flex flex-col" style={{ gap: 9 }}>
                  <div className="flex items-center justify-between">
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
                    <span
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: 11,
                        color: "var(--color-accent-dim)",
                      }}
                    >
                      {bs.categoryWeights[key]}
                    </span>
                  </div>
                  <input
                    name={`${key}-compare-budget-weight`}
                    type="range"
                    min={0}
                    max={100}
                    value={bs.categoryWeights[key]}
                    onChange={(e) =>
                      bs.handleCategoryWeight(key, Number(e.target.value))
                    }
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${bs.categoryWeights[key]}%, #333333 ${bs.categoryWeights[key]}%, #333333 100%)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reset */}
      <div style={{ padding: "12px 16px" }}>
        <button
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

import { useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "../components/Layout";
import { HeroSection } from "../components/HeroSection";
import { BudgetCountryCard } from "../components/BudgetCountryCard";
import { useCountries } from "../hooks/useCountries";
import { useBudgetState } from "../hooks/useBudgetState";
import type { BudgetCategoryWeights } from "../hooks/useBudgetState";
import { useBudgetMatcher } from "../hooks/useBudgetMatcher";

const BUDGET_CATEGORIES: {
  key: keyof BudgetCategoryWeights;
  color: string;
}[] = [
  { key: "housing", color: "#8F5A3C" },
  { key: "groceries", color: "#6B9E6B" },
  { key: "dining", color: "#C2956A" },
  { key: "transport", color: "#5B8FA8" },
  { key: "utilities", color: "#7A9B6B" },
  { key: "coworking", color: "#8B7BAD" },
  { key: "healthInsurance", color: "#C07A9B" },
];

export function BudgetMatcherPage() {
  const { t } = useTranslation();
  const { countries, loading } = useCountries();
  const bs = useBudgetState();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const matches = useBudgetMatcher(
    countries,
    bs.budget,
    bs.housing,
    bs.categoryWeights,
    bs.qualityBlend,
  );

  return (
    <Layout>
      <HeroSection
        backgroundImage="/images/hero-budget.webp"
        eyebrow={t("budget.eyebrow", "BUDGET MATCHER")}
        title={t("budget.title", "FIND YOUR BUDGET FIT")}
        subtitle={t(
          "budget.subtitle",
          "Enter your monthly budget and discover which countries offer the best lifestyle for your money",
        )}
      />

      <main
        className="mx-auto"
        style={{ maxWidth: "960px", padding: "24px 16px" }}
      >
        {/* ── Budget Input ───────────────────────────────────── */}
        <div
          style={{
            backgroundColor: "#1A1A1C",
            borderRadius: "8px",
            padding: "20px 24px",
            marginBottom: "16px",
          }}
        >
          <label
            style={{
              fontFamily: "Geist, sans-serif",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "#888888",
              display: "block",
              marginBottom: "12px",
            }}
          >
            {t("budget.budgetLabel", "Monthly Budget")}
          </label>

          <div className="flex items-center gap-4">
            <span
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "32px",
                fontWeight: 700,
                color: "var(--color-accent)",
              }}
            >
              $
            </span>
            <input
              type="number"
              min={300}
              max={15000}
              step={50}
              value={bs.budget}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v >= 0 && v <= 99999) bs.setBudget(v);
              }}
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "32px",
                fontWeight: 700,
                color: "#FFFFFF",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: "2px solid #333",
                outline: "none",
                width: "160px",
                textAlign: "left",
              }}
            />
            <span
              style={{
                fontFamily: "Geist, sans-serif",
                fontSize: "13px",
                color: "#555",
              }}
            >
              {t("budget.perMonth", "/ month")}
            </span>
          </div>

          <input
            type="range"
            min={300}
            max={10000}
            step={50}
            value={bs.budget}
            onChange={(e) => bs.setBudget(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              marginTop: "16px",
              background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${((bs.budget - 300) / 9700) * 100}%, #333333 ${((bs.budget - 300) / 9700) * 100}%, #333333 100%)`,
            }}
            aria-label="Budget slider"
          />

          {/* Housing toggle */}
          <div
            className="flex items-center gap-3"
            style={{ marginTop: "16px" }}
          >
            <span
              style={{
                fontFamily: "Geist, sans-serif",
                fontSize: "12px",
                color: "#888",
              }}
            >
              {t("budget.housing.label", "Housing")}:
            </span>
            <div
              className="flex"
              style={{
                backgroundColor: "#2A2A2A",
                borderRadius: "4px",
                padding: "3px",
                gap: "3px",
              }}
            >
              {(["center", "outside"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => bs.setHousing(opt)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: "3px",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "Geist, sans-serif",
                    fontSize: "12px",
                    backgroundColor:
                      bs.housing === opt
                        ? "var(--color-accent)"
                        : "transparent",
                    color: bs.housing === opt ? "#FFFFFF" : "#666",
                    transition: "all 0.15s ease",
                  }}
                >
                  {t(
                    `budget.housing.${opt}`,
                    opt === "center" ? "City Center" : "Outside Center",
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Collapsible Settings ───────────────────────────── */}
        <div
          style={{
            backgroundColor: "#1A1A1C",
            borderRadius: "8px",
            marginBottom: "16px",
            overflow: "hidden",
          }}
        >
          <button
            className="w-full flex items-center justify-between"
            style={{
              padding: "14px 20px",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => setSettingsOpen((p) => !p)}
          >
            <span
              style={{
                fontFamily: "Geist, sans-serif",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#888888",
              }}
            >
              {t("budget.settings", "Settings")}
            </span>
            <ChevronDown
              size={16}
              style={{
                color: "#555",
                transform: settingsOpen ? "rotate(0deg)" : "rotate(-90deg)",
                transition: "transform 0.15s ease",
              }}
            />
          </button>

          {settingsOpen && (
            <div
              style={{
                padding: "0 20px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {/* Quality blend */}
              <div className="flex flex-col" style={{ gap: "8px" }}>
                <div className="flex items-center justify-between">
                  <span
                    style={{
                      fontFamily: "Geist, sans-serif",
                      fontSize: "12px",
                      color: "#CCCCCC",
                    }}
                  >
                    {t("budget.qualityBlend", "Quality Blend")}
                  </span>
                  <span
                    style={{
                      fontFamily: "IBM Plex Mono, monospace",
                      fontSize: "11px",
                      color: "var(--color-accent-dim)",
                    }}
                  >
                    {bs.qualityBlend}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      fontFamily: "Geist, sans-serif",
                      fontSize: "10px",
                      color: "#555",
                      flexShrink: 0,
                    }}
                  >
                    {t("budget.pureAffordability", "Afford.")}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={bs.qualityBlend}
                    onChange={(e) => bs.setQualityBlend(Number(e.target.value))}
                    className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${bs.qualityBlend}%, #333333 ${bs.qualityBlend}%, #333333 100%)`,
                    }}
                    aria-label="Quality blend"
                  />
                  <span
                    style={{
                      fontFamily: "Geist, sans-serif",
                      fontSize: "10px",
                      color: "#555",
                      flexShrink: 0,
                    }}
                  >
                    {t("budget.qualityFocus", "Quality")}
                  </span>
                </div>
              </div>

              {/* Category weight sliders */}
              <div className="flex flex-col" style={{ gap: "12px" }}>
                <span
                  style={{
                    fontFamily: "Geist, sans-serif",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    color: "#666",
                  }}
                >
                  {t("budget.categoryWeights", "Category Weights")}
                </span>
                {BUDGET_CATEGORIES.map(({ key, color }) => (
                  <div
                    key={key}
                    className="flex flex-col"
                    style={{ gap: "6px" }}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: color,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "12px",
                            color: "#FFFFFF",
                          }}
                        >
                          {t(`budget.categories.${key}`)}
                        </span>
                      </div>
                      <span
                        style={{
                          fontFamily: "IBM Plex Mono, monospace",
                          fontSize: "11px",
                          color: "var(--color-accent-dim)",
                        }}
                      >
                        {bs.categoryWeights[key]}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={bs.categoryWeights[key]}
                      onChange={(e) =>
                        bs.handleCategoryWeight(key, Number(e.target.value))
                      }
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${color} 0%, ${color} ${bs.categoryWeights[key]}%, #333333 ${bs.categoryWeights[key]}%, #333333 100%)`,
                      }}
                      aria-label={`${key} weight`}
                    />
                  </div>
                ))}
              </div>

              {/* Reset */}
              <button
                onClick={bs.handleReset}
                className="flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid #333",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "12px",
                  color: "var(--color-accent-dim)",
                }}
              >
                <RotateCcw size={14} />
                {t("budget.reset", "Reset")}
              </button>
            </div>
          )}
        </div>

        {/* ── Results ─────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: "12px" }}
        >
          <span
            style={{
              fontFamily: "Geist, sans-serif",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "#888888",
            }}
          >
            {t("budget.results", "Results")}
          </span>
          <span
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "12px",
              color: "#555",
            }}
          >
            {loading
              ? "..."
              : t("budget.countriesFound", "{{count}} countries", {
                  count: matches.length,
                })}
          </span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3" style={{ marginBottom: "12px" }}>
          {BUDGET_CATEGORIES.map(({ key, color }) => (
            <div key={key} className="flex items-center gap-1">
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "2px",
                  backgroundColor: color,
                }}
              />
              <span
                style={{
                  fontFamily: "Geist, sans-serif",
                  fontSize: "10px",
                  color: "#666",
                }}
              >
                {t(`budget.categories.${key}`)}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-1">
            <div
              style={{
                width: "8px",
                height: "2px",
                backgroundColor: "#FFFFFF",
                opacity: 0.7,
              }}
            />
            <span
              style={{
                fontFamily: "Geist, sans-serif",
                fontSize: "10px",
                color: "#666",
              }}
            >
              {t("budget.budgetLine", "Budget")}
            </span>
          </div>
        </div>

        <div
          style={{
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid #222",
          }}
        >
          {loading ? (
            <div
              className="flex items-center justify-center"
              style={{
                height: "200px",
                color: "#555",
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
              }}
            >
              {t("budget.loading", "Loading...")}
            </div>
          ) : matches.length === 0 ? (
            <div
              className="flex items-center justify-center"
              style={{
                height: "200px",
                color: "#555",
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
              }}
            >
              {t("budget.noResults", "No countries with cost data available")}
            </div>
          ) : (
            matches.map((m, i) => (
              <BudgetCountryCard
                key={m.country.code}
                match={m}
                budget={bs.budget}
                rank={i + 1}
              />
            ))
          )}
        </div>
      </main>
    </Layout>
  );
}

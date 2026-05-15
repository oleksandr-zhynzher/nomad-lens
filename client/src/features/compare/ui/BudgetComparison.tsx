import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Wallet, TrendingUp } from "lucide-react";
import type { CountryData } from "@core/models";
import { localizeCountry, regionKey } from "@core/utils";
import { COST_COLORS, surplusColour } from "@features/budget/constants";
import { surplusColourClass } from "@core/utils";
import { useSyncScroll } from "@features/compare/hooks";
import { useComparisonSelection } from "@features/compare/hooks";
import { ComparisonAddButton } from "./ComparisonAddButton";
import { ComparisonRowShell } from "./ComparisonRowShell";
import { ComparisonScoreCell } from "./ComparisonScoreCell";
import { ComparisonSlotCard } from "./ComparisonSlotCard";
import { ComparisonTableHeader } from "./ComparisonTableHeader";
import { CountryPickerDropdown } from "./CountryPickerDropdown";
import type { BudgetMatch } from "@features/budget/hooks";
import { BREAKDOWN_ROWS, BUDGET_COMPARISON_COLUMN_WIDTH } from "@features/budget/constants";
import { costColor } from "@features/budget/utils";

interface BudgetComparisonProps {
  readonly countries: CountryData[];
  readonly matches?: BudgetMatch[];
  readonly selectedCodes: string[];
  readonly onSelectedCodesChange: (codes: string[]) => void;
  readonly sortDirection?: "desc" | "asc" | null;
}

export function BudgetComparison({
  countries,
  matches = [],
  selectedCodes,
  onSelectedCodesChange,
  sortDirection = null,
}: BudgetComparisonProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const matchMap = useMemo(() => new Map(matches.map((m) => [m.country.code, m])), [matches]);

  const {
    selectedSlots,
    handleAdd,
    handleRemove,
    filteredCandidates: hookFiltered,
    dropdownOpen,
    setDropdownOpen,
    dropdownPos,
    setDropdownPos,
    query,
    setQuery,
    addBtnRef,
    headerRef,
    bodyRef,
  } = useComparisonSelection({
    allCandidates: countries,
    selectedCodes,
    onSelectedCodesChange,
    lang,
  });

  // Sync horizontal scroll
  useSyncScroll(headerRef, bodyRef);

  const filtered = hookFiltered.filter((c) => !!c.costOfLiving);

  const sortedSlots = useMemo(() => {
    if (sortDirection == null) return selectedSlots;
    return [...selectedSlots].sort((slotA, slotB) => {
      const matchA = matchMap.get(slotA.country.code);
      const matchB = matchMap.get(slotB.country.code);
      if (!matchA && !matchB) return 0;
      if (!matchA) return sortDirection === "desc" ? 1 : -1;
      if (!matchB) return sortDirection === "desc" ? -1 : 1;
      if (matchA.monthlyCost !== matchB.monthlyCost) {
        const costDelta = matchB.monthlyCost - matchA.monthlyCost;
        return sortDirection === "desc" ? costDelta : -costDelta;
      }
      const surplusDelta = matchB.surplus - matchA.surplus;
      return sortDirection === "desc" ? surplusDelta : -surplusDelta;
    });
  }, [selectedSlots, sortDirection, matchMap]);

  // Cheapest value per row across selected countries
  const minBreakdown: Record<string, number> = {};
  const maxBreakdown: Record<string, number> = {};
  for (const { key } of BREAKDOWN_ROWS) {
    const values = selectedSlots.map(
      (slot) => matchMap.get(slot.country.code)?.breakdown[key] ?? 0,
    );
    minBreakdown[key] = values.length > 0 ? Math.min(...values) : 0;
    maxBreakdown[key] = Math.max(1, ...values);
  }
  const minTotal =
    selectedSlots.length > 0
      ? Math.min(...selectedSlots.map((slot) => matchMap.get(slot.country.code)?.monthlyCost ?? 0))
      : 0;

  return (
    <div>
      {/* ── Country selector ─────────────────────────────────── */}
      <div className="relative">
        <div className="grid grid-cols-3 gap-3 pb-2 [scrollbar-width:thin] md:flex md:items-stretch md:overflow-x-auto">
          {sortedSlots.map((slot) => {
            const match = matchMap.get(slot.country.code);
            const cost = match?.monthlyCost;
            const surplus = match == null ? null : match.surplus;
            return (
              <div key={slot.country.code} className="w-full min-w-0 md:w-[180px] md:shrink-0">
                <ComparisonSlotCard
                  flagUrl={slot.country.flagUrl}
                  countryName={localizeCountry(slot.country, lang).name}
                  onRemove={() => {
                    handleRemove(slot.index);
                  }}
                  regionLabel={t(`regions.${regionKey(slot.country.region)}`)}
                >
                  <span
                    className={`[font-family:Oswald,_sans-serif] text-[28px] leading-none font-bold ${cost == null ? "text-[#555]" : "text-accent-dim"}`}
                  >
                    {cost == null ? "—" : `$${cost.toLocaleString()}`}
                  </span>

                  {surplus == null ? null : (
                    <span
                      className={`text-[11px] font-semibold ${surplusColourClass(surplus, "text")}`}
                    >
                      {surplus >= 0
                        ? `+$${surplus.toLocaleString()} left`
                        : `-$${Math.abs(surplus).toLocaleString()} over`}
                    </span>
                  )}
                </ComparisonSlotCard>
              </div>
            );
          })}

          {/* Add button */}
          <div ref={addBtnRef} className="w-full min-w-0 md:w-[180px] md:shrink-0">
            <ComparisonAddButton
              label={t("compare.addCountry")}
              onClick={() => {
                if (!dropdownOpen && addBtnRef.current) {
                  const rect = addBtnRef.current.getBoundingClientRect();
                  const dropdownWidth = 320;
                  const dropdownMaxHeight = 370;
                  const left = Math.max(
                    8,
                    Math.min(rect.left, window.innerWidth - dropdownWidth - 8),
                  );
                  const fitsBelow = rect.bottom + 8 + dropdownMaxHeight <= window.innerHeight;
                  const top = fitsBelow ? rect.bottom + 8 : rect.top - dropdownMaxHeight - 8;
                  setDropdownPos({ top, left });
                }
                setDropdownOpen((p) => !p);
              }}
            />
          </div>
        </div>

        {/* Right-edge fade */}
        <div className="pointer-events-none absolute top-0 right-0 bottom-0 hidden w-12 [background:linear-gradient(to_right,transparent,#0F1114)] md:block" />
      </div>

      {/* Dropdown */}
      <CountryPickerDropdown
        open={dropdownOpen ? dropdownPos != null : false}
        countries={filtered.map((c) => {
          const match = matchMap.get(c.code);
          const cost = match?.monthlyCost ?? c.costOfLiving?.totalBasic;
          return {
            code: c.code,
            flagUrl: c.flagUrl,
            name: localizeCountry(c, lang).name,
            regionLabel: t(`regions.${regionKey(c.region)}`),
            trailing: (
              <span className="font-mono text-[13px] font-semibold text-accent-dim">
                {cost == null ? "—" : `$${cost.toLocaleString()}`}
              </span>
            ),
          };
        })}
        query={query}
        onQueryChange={setQuery}
        onSelect={handleAdd}
        position={dropdownPos ?? undefined}
        inputName="budget-comparison-search"
        searchPlaceholder={t("compare.searchCountry")}
        emptyLabel={t("compare.noCountriesFound")}
      />

      {/* Data grid */}
      {selectedSlots.length > 0 ? (
        <div className="mt-8">
          <div className="h-px bg-[#1C1C1C]" />

          {/* Sticky column header */}
          <ComparisonTableHeader
            ref={headerRef}
            label={t("compare.indicatorHeader", "Category")}
            columns={sortedSlots.map((slot) => ({
              key: slot.index,
              flagUrl: slot.country.flagUrl,
              name: localizeCountry(slot.country, lang).name,
            }))}
            columnWidth={BUDGET_COMPARISON_COLUMN_WIDTH}
          />

          {/* Scrollable rows */}
          <div ref={bodyRef} className="overflow-x-auto">
            {/* Monthly total row */}
            <ComparisonRowShell
              icon={Wallet}
              iconColor="#C2956A"
              label={t("budget.totalMonthly", "Monthly Total")}
            >
              {sortedSlots.map((slot) => {
                const val = matchMap.get(slot.country.code)?.monthlyCost ?? null;
                return (
                  <ComparisonScoreCell
                    key={slot.index}
                    value={val}
                    colour={val == null ? "#333333" : costColor(val, minTotal)}
                    format={(v) => `$${v.toLocaleString()}`}
                    columnWidth={BUDGET_COMPARISON_COLUMN_WIDTH}
                  />
                );
              })}
            </ComparisonRowShell>

            {/* Surplus row */}
            <ComparisonRowShell
              icon={TrendingUp}
              iconColor="#4CAF50"
              label={t("budget.surplus", "Surplus")}
            >
              {sortedSlots.map((slot) => {
                const match = matchMap.get(slot.country.code);
                const val = match === undefined ? null : match.surplus;
                return (
                  <ComparisonScoreCell
                    key={slot.index}
                    value={val}
                    colour={val == null ? "#333333" : surplusColour(val)}
                    format={(v) =>
                      v >= 0 ? `+$${v.toLocaleString()}` : `-$${Math.abs(v).toLocaleString()}`
                    }
                    columnWidth={BUDGET_COMPARISON_COLUMN_WIDTH}
                  />
                );
              })}
            </ComparisonRowShell>

            {/* Breakdown rows */}
            {BREAKDOWN_ROWS.map(({ key, icon: Icon }) => {
              const dotColor = COST_COLORS[key] ?? "#888";
              return (
                <ComparisonRowShell
                  key={key}
                  icon={Icon}
                  iconColor={dotColor}
                  label={t(`budget.categories.${key}`, key)}
                >
                  {sortedSlots.map((slot) => {
                    const val = matchMap.get(slot.country.code)?.breakdown[key] ?? null;
                    return (
                      <ComparisonScoreCell
                        key={slot.index}
                        value={val}
                        colour={val == null ? "#333333" : costColor(val, minBreakdown[key])}
                        format={(v) => `$${v.toLocaleString()}`}
                        columnWidth={BUDGET_COMPARISON_COLUMN_WIDTH}
                      />
                    );
                  })}
                </ComparisonRowShell>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

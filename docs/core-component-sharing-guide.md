# Core Component Sharing Guide

This review covers large React components in `client/src` and identifies the strongest opportunities to split route-sized files into smaller components, promote repeated UI into `client/src/core`, and keep feature logic in the owning feature.

## Executive summary

The biggest reuse wins are not from moving whole screens into `core`. The correct direction is to move domain-neutral UI shells, controls, and accessibility primitives into `core`, then keep feature-specific data preparation, labels, scoring, matching, routing modes, and table schemas in the owning feature.

Highest-impact extractions:

1. Shared page hero stats (`core/ui/page-hero`).
2. Responsive page layout with desktop side panel, mobile sheet, and mobile FAB (`core/ui/layout` and `core/ui/actions`).
3. Search and compare-mode toolbar (`core/ui/search`, `core/ui/compare`).
4. Country result row shell and compare checkbox (`core/ui/country`, `core/ui/selection`).
5. Metric cards, metric grids, section headers, score bars (`core/ui/metrics`, `core/ui/sections`).
6. Move cross-feature country indicator display primitives out of `features/country-ranking`.

## Repository rules to preserve

Based on `client/ARCHITECTURE.md` and `client/README.md`:

- `core` is for code reused across multiple features or app-wide primitives.
- Feature state, scoring, matching, URL formats, and domain labels stay in `features/<feature>`.
- Use role folders: `ui`, `hooks`, `utils`, `constants`, `models`, `store`, `api`.
- Do not create another nested `ui` folder inside an existing `ui` folder.
- Avoid broad barrels; prefer direct imports or small stable public APIs.
- Prefer composition and explicit variants over boolean-prop-heavy components.
- Core UI primitives should own accessibility details, not each caller.

## Current largest components

| Lines | File                                                 | Main issue                                                                                                   |
| ----: | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
|   751 | `features/country-profile/ui/CountryProfileView.tsx` | Route, hero, visa, tourism, cost, climate, stats, and cross-feature imports in one file.                     |
|   671 | `features/nomad-visas/ui/NomadVisasView.tsx`         | Search, compare mode, sticky table, sorting, rows, and navigation in one file.                               |
|   581 | `features/home/ui/HomeView.tsx`                      | Ranking orchestration, keyboard search navigation, compare mode, sidebar/mobile panel, and hero in one file. |
|   496 | `features/tourism/ui/TourismWeightPanel.tsx`         | Many control groups, date fields, budget controls, and tourism metric controls in one panel.                 |
|   426 | `features/tourism/ui/TourismExplorerView.tsx`        | Same page shell pattern as Home/Budget with feature-specific filters.                                        |
|   423 | `features/budget/ui/BudgetMatcherView.tsx`           | Same page shell pattern as Home/Tourism with feature-specific filters.                                       |
|   422 | `features/compare/ui/CompareView.tsx`                | Compare orchestration, mode switcher, action toolbar, parameters panel, and workspace layout.                |
|   338 | `features/budget/ui/BudgetSidebar.tsx`               | Older panel implementation duplicates existing core panel primitives.                                        |
|   329 | `core/ui/layout/Layout.tsx`                          | App shell combines header nav, language menu, mobile menu, and layout concerns.                              |

## Core promotion decision matrix

| Candidate                                                                       | Move to core? | Reason                                                                           |
| ------------------------------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------- |
| Visual shell reused by 2+ features                                              | Yes           | Examples: page hero, toolbar, panel layout, metric card.                         |
| Accessibility interaction reused by 2+ features                                 | Yes           | Examples: modal sheet, compare checkbox, search clear button, segmented control. |
| Country-domain presentation shared by country ranking, tourism, budget, profile | Usually yes   | Examples: `CountryNameCell`, result-row shell, score breakdown.                  |
| Feature scoring/matching algorithm                                              | No            | Keep in feature hooks/utils unless genuinely app-wide.                           |
| Feature route URL shape                                                         | No            | URL params belong to owning route/feature.                                       |
| Feature table columns                                                           | Usually no    | Keep schema local until another feature uses same table primitive.               |
| One-off section only used by one page                                           | No            | Split locally first; promote later if reused.                                    |

## Recommended target `core` structure

```txt
client/src/core/ui/
  actions/
    MobileFabButton.tsx
    IconActionButton.tsx
  badges/
    Pill.tsx
    StatusPill.tsx
  charts/
    StackedProgressBar.tsx
    TargetMarker.tsx
  compare/
    CompareModeActions.tsx
  country/
    CountryNameCell.tsx
    CountryResultRow.tsx
    CountryResultRank.tsx
    CountryResultChevron.tsx
    ViewCountryButton.tsx
  forms/
    RangeField.tsx
    SearchInput.tsx
    SegmentedControl.tsx
  layout/
    Layout.tsx
    ResponsiveSidePanelLayout.tsx
  metrics/
    MetricBar.tsx
    MetricCard.tsx
    MetricGrid.tsx
    StatCard.tsx
  page-hero/
    PageHeroBanner.tsx
    HeroStats.tsx
    HeroStat.tsx
  panels/
    CollapsibleSection.tsx
    PanelShell.tsx
    PeopleCountStepper.tsx
    ToggleGroup.tsx
    WeightSliderRow.tsx
  sections/
    SectionHeader.tsx
  selection/
    CompareCheckbox.tsx
  states/
    EmptyState.tsx
    LoadingRows.tsx
  table/
    SortableHeaderCell.tsx
```

Only add a folder when at least one component in it is introduced. Avoid empty role folders.

## P0 extraction opportunities

### 1. Page hero and hero stats

Current evidence:

- `HomeView.tsx` has an inline hero block and stat row.
- `BudgetMatcherView.tsx` has a similar inline hero block and stat row.
- `TourismExplorerView.tsx` has a similar inline hero block and stat row.
- `NomadVisasView.tsx` and `CompareView.tsx` already use `PageHeroBanner`.
- `PageHeroBanner` and `HeroSection` accept `eyebrow` but currently need review to ensure the prop is rendered consistently.

Target:

```txt
core/ui/page-hero/PageHeroBanner.tsx
core/ui/page-hero/HeroStats.tsx
core/ui/page-hero/HeroStat.tsx
```

Suggested API:

```tsx
<PageHeroBanner
  backgroundImage="/hero-map.png"
  eyebrow={t("compare.eyebrow")}
  title={compareTitle}
  subtitle={compareSubtitle}
>
  <HeroStats>
    <HeroStat value={countries.length} label={t("hero.stats.countries", { count })} />
    <HeroStat
      as={Link}
      to={`${langPrefix}/indicators`}
      value={coreIndicatorCount}
      label={t("hero.stats.indicators", { count: coreIndicatorCount })}
    />
  </HeroStats>
</PageHeroBanner>
```

What belongs in core:

- Background image layout.
- Gradient overlay.
- Eyebrow/title/subtitle typography.
- Stat row layout and divider behavior.
- Optional link wrapper support for stat items.

What stays in features:

- Which stats appear.
- Stat values and labels.
- Routes for linked stats.

Migration:

1. Fix `PageHeroBanner`/`HeroSection` to render `eyebrow`.
2. Add `HeroStats` and `HeroStat`.
3. Migrate Compare/Nomad Visa first because they already use `PageHeroBanner`.
4. Replace inline hero blocks in Home/Budget/Tourism.

### 2. Responsive page shell: desktop side panel + mobile sheet + FAB

Current evidence:

- `HomeView.tsx`, `BudgetMatcherView.tsx`, and `TourismExplorerView.tsx` all use a desktop sticky side panel, `MobileSheet`, and a mobile floating button.
- `CompareView.tsx` has a related mobile parameter sheet and optional desktop parameter panel.
- `MobileSheet` is already a good core primitive with dialog behavior, Escape handling, focus trap, and scroll lock.

Target:

```txt
core/ui/layout/ResponsiveSidePanelLayout.tsx
core/ui/actions/MobileFabButton.tsx
```

Suggested API:

```tsx
<ResponsiveSidePanelLayout
  sidebar={panel}
  mobileSheet={{
    open: mobileParamsOpen,
    title: t("mobileSheet.parameters"),
    closeLabel: t("a11y.closeParameters"),
    onClose: () => setMobileParamsOpen(false),
    children: panel,
  }}
  mobileFab={{
    label: t("mobileSheet.parameters"),
    ariaLabel: t("a11y.openParameters"),
    icon: <SlidersHorizontal size={18} aria-hidden />,
    onClick: () => setMobileParamsOpen(true),
  }}
>
  {main}
</ResponsiveSidePanelLayout>
```

What belongs in core:

- Desktop sidebar placement.
- Mobile sheet wiring.
- Safe-area bottom FAB positioning.
- Shared breakpoints and spacing.

What stays in features:

- Weight panel contents.
- Feature search/list/body.
- State for `mobileParamsOpen`.

Migration:

1. Add `MobileFabButton`.
2. Add `ResponsiveSidePanelLayout` with slots.
3. Migrate Home, Budget, Tourism.
4. Evaluate Compare separately because it has extra desktop panel sizing behavior.

### 3. Search input, list toolbar, and compare-mode actions

Current evidence:

- Home, Budget, Tourism, and Nomad Visas all have search input + clear button + compare mode action cluster.
- They duplicate disabled compare CTA logic, selected-count badge, exit compare button, and helper text.
- Search clear buttons and focus styles are easy to regress when duplicated.

Target:

```txt
core/ui/forms/SearchInput.tsx
core/ui/search/ListToolbar.tsx
core/ui/compare/CompareModeActions.tsx
```

Suggested API:

```tsx
<ListToolbar stickyTopClassName="top-14">
  <SearchInput
    name="country-search"
    value={search}
    onValueChange={setSearch}
    placeholder={t("search.placeholder")}
    clearLabel={t("a11y.clearSearch")}
  />

  <CompareModeActions
    active={compareMode}
    selectedCount={selectedCodes.size}
    minCount={2}
    enterLabel={t("compare.compareMode")}
    compareLabel={t("compare.compareSelected")}
    exitLabel={t("a11y.exitCompareMode")}
    helperText={t("compare.helperText")}
    onEnter={() => setCompareMode(true)}
    onExit={exitCompareMode}
    onCompare={handleCompare}
  />
</ListToolbar>
```

What belongs in core:

- Search field layout, icon, clear button, labels, focus-visible styles.
- Compare action rendering and disabled state.
- Selected-count badge.
- Helper text layout.

What stays in features:

- Search algorithm and filtered data.
- Highlight mode controls.
- Extra toolbar content such as region filters, activity tags, and budget category legend.

Composition note:

Avoid boolean props like `showHighlightControls`, `showActivityTags`, `isBudget`. Use slots:

```tsx
<ListToolbar beforeActions={searchControls} after={featureFilterChips}>
  ...
</ListToolbar>
```

### 4. Country result row shell

Current evidence:

- `CountryCard.tsx`, `BudgetCountryCard.tsx`, and `TourismCountryCard.tsx` share a nearly identical row shape: selected background, optional compare checkbox, rank, `CountryNameCell`, middle metrics, score/value, chevron, optional expanded area.
- `CompareCheckbox` is in `features/compare/ui` but is imported by multiple non-compare features, which makes it a core selection primitive.
- `getRowStyles` and `CountryNameCell` are already in core.

Target:

```txt
core/ui/country/CountryResultRow.tsx
core/ui/country/CountryResultRank.tsx
core/ui/country/CountryResultChevron.tsx
core/ui/selection/CompareCheckbox.tsx
```

Suggested compound API:

```tsx
<CountryResultRow
  code={country.code}
  index={index}
  selected={isSelected}
  highlighted={highlighted}
  compareMode={compareMode}
  expanded={expanded}
  onAction={compareMode ? onSelect : onToggle}
>
  <CountryResultRow.Main>
    <CountryResultRank>{rank}</CountryResultRank>
    <CountryNameCell country={country} />
    <CountryResultRow.Content>{featureMiddle}</CountryResultRow.Content>
    <CountryResultRow.Score className={scoreClass}>{score}</CountryResultRow.Score>
    <CountryResultChevron expanded={expanded} disabled={compareMode} />
  </CountryResultRow.Main>

  <CountryResultRow.Below>{featureBudgetBar}</CountryResultRow.Below>
  <CountryResultRow.Expanded>{featureDetails}</CountryResultRow.Expanded>
</CountryResultRow>
```

What belongs in core:

- Row container and CSS variable contract.
- Selection/highlight data attributes.
- Compare checkbox.
- Rank/chevron layout.
- Keyboard and ARIA behavior for selectable rows.

What stays in features:

- Budget bar, tourism tag dots, score sparkline inputs.
- Expanded detail panels.
- Feature-specific score color selection.

Migration:

1. Move `CompareCheckbox` to `core/ui/selection`.
2. Add row shell with slots.
3. Migrate `CountryCard`.
4. Migrate `BudgetCountryCard`.
5. Migrate `TourismCountryCard`.

### 5. Metric cards, metric grids, and section headers

Current evidence:

- `CountryProfileView.tsx` repeats stat cards, cost cards, climate cards, tourism metric cards, and section headers.
- `ScoreBreakdown.tsx`, `TourismBreakdownChart.tsx`, and `NomadVisaDetails.tsx` use similar metric-card and bar patterns.
- `CountryProfileView.tsx` imports `ScoreBreakdown` from `features/country-ranking/ui`, which should become core because it is used by multiple features/pages.

Target:

```txt
core/ui/sections/SectionHeader.tsx
core/ui/metrics/MetricGrid.tsx
core/ui/metrics/MetricCard.tsx
core/ui/metrics/MetricBar.tsx
core/ui/metrics/StatCard.tsx
core/ui/indicator/ScoreBreakdown.tsx
```

Suggested API:

```tsx
<SectionHeader
  title={t("countryPage.performanceBreakdown")}
  meta={t("countryPage.categoriesSubtitle", { count, name })}
/>

<MetricGrid columns={{ base: 2, md: 4 }}>
  <MetricCard
    icon={<Thermometer size={16} aria-hidden />}
    label={t("countryPage.annualMeanTemp")}
    value={`${temp.toFixed(1)}C`}
    valueClassName="text-[#E8E9EB]"
  />
</MetricGrid>
```

What belongs in core:

- Generic section header layout.
- Card layout.
- Grid responsive layout.
- Bar/progress visual.

What stays in features:

- Metric definitions.
- Formatting, units, labels, icons, and colors.
- Domain calculations.

### 6. Budget sidebar should use existing panel primitives

Current evidence:

- `BudgetFilterPanel.tsx` already uses `PanelShell`-style primitives (`CollapsibleSection`, `ToggleGroup`, `PeopleCountStepper`, `WeightSliderRow`).
- `BudgetSidebar.tsx` duplicates older custom collapsible headers, steppers, sliders, and footer actions.

Target:

Keep `BudgetSidebar` in `features/budget/ui`, but rewrite it using:

```txt
core/ui/panels/PanelShell.tsx
core/ui/panels/CollapsibleSection.tsx
core/ui/panels/WeightSliderRow.tsx
core/ui/panels/PeopleCountStepper.tsx
core/ui/panels/ToggleGroup.tsx
```

What belongs in core:

- Generic panel shell and controls.

What stays in feature:

- Budget labels, budget range, share/copy behavior, category weight mapping.

Priority:

- High. This is low risk because the core pieces already exist.

## P1 extraction opportunities

### 7. Split `CountryProfileView.tsx`

Current issues:

- The route file is the largest component.
- It owns country lookup, not-found/loading states, hero, stats, visa, performance, tourism, cost, and climate sections.
- It imports from country-ranking and tourism features for display utilities, creating feature-to-feature coupling.
- It still contains inline metric definitions for cost-of-living cards.

Feature-local split:

```txt
features/country-profile/ui/CountryProfileView.tsx
features/country-profile/ui/CountryProfileHero.tsx
features/country-profile/ui/CountryProfileStats.tsx
features/country-profile/ui/CountryVisaSection.tsx
features/country-profile/ui/CountryPerformanceSection.tsx
features/country-profile/ui/CountryTourismSection.tsx
features/country-profile/ui/CountryCostOfLivingSection.tsx
features/country-profile/ui/CountryClimateSection.tsx
```

Feature-local utilities/constants:

```txt
features/country-profile/constants/country-profile-metrics.constants.ts
features/country-profile/utils/country-profile-view-model.utils.ts
```

Promote to core:

- `ScoreBreakdown` to `core/ui/indicator/ScoreBreakdown.tsx`.
- Generic `MetricCard`, `MetricGrid`, `SectionHeader`.
- Consider moving pure tourism score calculation to `core/utils` only if country profile is intended to display tourism score as app-wide country data.

Resulting route shape:

```tsx
export function CountryPage() {
  const viewModel = useCountryProfileViewModel(code);

  if (viewModel.status === "loading") return <CountryProfileLoading />;
  if (viewModel.status === "error") return <CountryProfileError {...viewModel} />;

  return (
    <Layout>
      <CountryProfileHero country={viewModel.country} onBack={viewModel.onBack} />
      <CountryProfileStats stats={viewModel.stats} />
      <CountryVisaSection visa={viewModel.visa} />
      <CountryPerformanceSection country={viewModel.country} />
      <CountryTourismSection model={viewModel.tourism} />
      <CountryCostOfLivingSection model={viewModel.costOfLiving} />
      <CountryClimateSection model={viewModel.climate} />
    </Layout>
  );
}
```

### 8. Split `NomadVisasView.tsx`

Current issues:

- Search, compare mode, stats, sorting, sticky header measurement, table header, table body, row interactions, and navigation are in one file.
- The sticky table pattern is feature-specific for now, but rows/header should be local components.

Feature-local split:

```txt
features/nomad-visas/ui/NomadVisasView.tsx
features/nomad-visas/ui/NomadVisaHeroStats.tsx
features/nomad-visas/ui/NomadVisaToolbar.tsx
features/nomad-visas/ui/NomadVisaTable.tsx
features/nomad-visas/ui/NomadVisaTableHeader.tsx
features/nomad-visas/ui/NomadVisaTableRow.tsx
features/nomad-visas/ui/NomadVisaIncomeCell.tsx
features/nomad-visas/ui/NomadVisaTaxCell.tsx
```

Potential core extraction:

```txt
core/ui/table/SortableHeaderCell.tsx
```

Only promote table primitives after another table uses the same sticky sort header pattern.

Suggested API:

```tsx
<NomadVisaTable
  rows={sortedCountries}
  compareMode={compareMode}
  selectedCodes={selectedCodes}
  highlightCode={highlightCode}
  sort={{ field: sortField, direction: sortDirection, onSort: handleSort }}
  onToggleSelect={toggleSelect}
  onOpenCountry={openCountry}
/>
```

### 9. Split `HomeView.tsx`

Current issues:

- It owns ranking data, search filtering, keyboard navigation, highlight URL handling, compare mode, responsive side panel, hero, and list rendering.
- Much of the layout overlaps with Budget and Tourism.

Feature-local split:

```txt
features/home/ui/HomeView.tsx
features/home/ui/HomeHero.tsx
features/home/ui/HomeToolbar.tsx
features/home/ui/HomeCountryResults.tsx
features/home/hooks/useCountrySearchNavigation.ts
features/home/hooks/useHighlightParam.ts
```

Promote to core:

- `ResponsiveSidePanelLayout`.
- `SearchInput`.
- `CompareModeActions`.
- `HeroStats`/`HeroStat`.
- Country row shell after migrating rows.

Keep in feature:

- Search/highlight behavior and keyboard navigation until Budget/Tourism reuse the same hook.
- Weight-panel state.

If search navigation becomes shared between Home and Tourism, move a generic hook to:

```txt
core/hooks/useKeyboardListNavigation.ts
```

### 10. Split `TourismExplorerView.tsx`

Current issues:

- Similar to Home but with tourism-specific filters, tag chips, travel dates, budget state, and selected tags.

Feature-local split:

```txt
features/tourism/ui/TourismExplorerView.tsx
features/tourism/ui/TourismHero.tsx
features/tourism/ui/TourismToolbar.tsx
features/tourism/ui/TourismTagFilterBar.tsx
features/tourism/ui/TourismCountryResults.tsx
```

Promote to core:

- Shared page shell.
- Shared toolbar/search/compare actions.
- Loading/empty list states.

Keep in feature:

- Activity tag filtering.
- Travel dates and seasonality.
- Tourism scoring.

### 11. Split `BudgetMatcherView.tsx`

Current issues:

- Similar page shell to Home/Tourism plus budget sidebar, category legend, compare mode, and country list.

Feature-local split:

```txt
features/budget/ui/BudgetMatcherView.tsx
features/budget/ui/BudgetMatcherHero.tsx
features/budget/ui/BudgetMatcherToolbar.tsx
features/budget/ui/BudgetCategoryLegend.tsx
features/budget/ui/BudgetMatcherResults.tsx
```

Promote to core:

- Shared page shell.
- Shared toolbar/search/compare actions.
- Loading rows / empty state.

Keep in feature:

- Budget matching.
- Category legend content.
- Budget-specific row middle/expanded details.

### 12. Split `TourismWeightPanel.tsx`

Current issues:

- One panel owns budget controls, accommodation controls, date pickers, metrics group sliders, collapsible state, and scroll indicator.

Feature-local split:

```txt
features/tourism/ui/TourismWeightPanel.tsx
features/tourism/ui/TourismBudgetSection.tsx
features/tourism/ui/TourismAccommodationControl.tsx
features/tourism/ui/TourismTravelDatesSection.tsx
features/tourism/ui/TourismMetricGroupsSection.tsx
features/tourism/ui/TourismDateSelectPair.tsx
```

Promote to core:

- `RangeField`.
- `SegmentedControl`.
- Possibly `MonthDayPicker` if another feature needs month/day controls.

Keep in feature:

- Tourism travel-date meaning.
- Hotel star accommodation mapping.
- Tourism group labels and metric keys.

### 13. Split `CompareView.tsx`

Current issues:

- It owns mode switching, action toolbar, share/sort feedback, mobile parameter panel, desktop parameter panel sizing, and comparison panel rendering.

Feature-local split:

```txt
features/compare/ui/CompareView.tsx
features/compare/ui/CompareHeroStats.tsx
features/compare/ui/CompareModeSwitcher.tsx
features/compare/ui/CompareActionToolbar.tsx
features/compare/ui/CompareParametersSheet.tsx
features/compare/ui/CompareWorkspaceLayout.tsx
```

Promote to core:

- `SegmentedControl`.
- `IconActionButton`.
- Maybe `ResponsiveSidePanelLayout` if Compare can fit the same contract.

Keep in feature:

- Compare mode options.
- Compare URL params.
- Sort/share behavior.
- `ComparePanel`.

## P2 extraction opportunities

### 14. Compare workspace compound component

Current evidence:

- `CountryComparison`, `BudgetComparison`, `TourismComparison`, and `NomadVisaComparison` repeat selected country slot strip, add button, dropdown, sticky header/body scroll sync, row shells, and comparison cells.

Keep this feature-owned:

```txt
features/compare/ui/ComparisonWorkspace.tsx
features/compare/ui/ComparisonSlotStrip.tsx
features/compare/ui/ComparisonDataGrid.tsx
```

Suggested API:

```tsx
<ComparisonWorkspace
  candidates={countries}
  selectedCodes={selectedCodes}
  onSelectedCodesChange={onSelectedCodesChange}
  getCandidateEnabled={(country) => country.costOfLiving != null}
  renderSlot={(slot) => <BudgetSlot slot={slot} />}
>
  <ComparisonDataGrid rows={rows} renderCell={renderBudgetCell} />
</ComparisonWorkspace>
```

Do not move this to core yet. It is shared inside the compare feature, not across multiple features.

### 15. Stacked progress/budget bars

Current evidence:

- Budget and tourism budget bars both show stacked segments and budget/target markers.

Target:

```txt
core/ui/charts/StackedProgressBar.tsx
core/ui/charts/TargetMarker.tsx
```

Suggested API:

```tsx
<StackedProgressBar
  segments={[
    { key: "housing", value: 900, color: "#8F5A3C", label: t("budget.categories.housing") },
  ]}
  max={budget}
  marker={{ value: monthlyCost, label: t("budget.monthlyCost") }}
/>
```

Keep segment creation in features.

### 16. Empty/loading states

Current evidence:

- Budget, Tourism, CountryList, and Nomad Visas all render loading rows or empty centered text.

Target:

```txt
core/ui/states/LoadingRows.tsx
core/ui/states/EmptyState.tsx
```

Suggested API:

```tsx
<LoadingRows count={8} rowClassName="h-14 border-t border-border bg-surface" />
<EmptyState message={t("countryList.noResults")} />
```

### 17. Pill/badge primitives

Current evidence:

- Country badges, region pills, tourism tags, tax pills, visa status labels, and hero stat link chips share rounded badge styling.

Target:

```txt
core/ui/badges/Pill.tsx
core/ui/badges/StatusPill.tsx
core/ui/country/RegionPill.tsx
```

Keep tax status mapping in `core/constants` because `TAX_STATUS_COLORS` is already core-level and reused.

### 18. Range field and segmented control

Current evidence:

- Raw range inputs with progress backgrounds exist in Budget, Tourism, and Weight panels.
- Mode toggles and accommodation/hotel-star toggles repeat segmented-button patterns.

Target:

```txt
core/ui/forms/RangeField.tsx
core/ui/forms/SegmentedControl.tsx
```

Suggested `RangeField` API:

```tsx
<RangeField
  name="tourism-daily-budget"
  label={t("tourismBudget.dailyBudgetLabel")}
  value={budgetState.dailyBudget}
  min={10}
  max={500}
  step={5}
  displayValue={`$${budgetState.dailyBudget}`}
  minLabel="$10"
  maxLabel="$500"
  onValueChange={(value) => onBudgetChange("dailyBudget", value)}
/>
```

Suggested `SegmentedControl` API:

```tsx
<SegmentedControl
  ariaLabel={t("compare.mode")}
  value={compareMode}
  onValueChange={setCompareMode}
  options={[
    { value: "countries", label: t("compare.countries"), icon: <Flag size={14} /> },
    { value: "regions", label: t("compare.regions"), icon: <Globe size={14} /> },
  ]}
/>
```

## Existing code that should move or be reviewed

| Current file                                     | Proposed target                            | Why                                                                |
| ------------------------------------------------ | ------------------------------------------ | ------------------------------------------------------------------ |
| `features/compare/ui/CompareCheckbox.tsx`        | `core/ui/selection/CompareCheckbox.tsx`    | Used outside compare feature by country, budget, and tourism rows. |
| `features/country-ranking/ui/ScoreBreakdown.tsx` | `core/ui/indicator/ScoreBreakdown.tsx`     | Used by country profile and country detail; not ranking-only UI.   |
| `features/compare/ui/RegionPill.tsx`             | `core/ui/country/RegionPill.tsx` if reused | Region display is not compare-specific.                            |
| `features/budget/ui/BudgetSidebar.tsx` internals | Use `core/ui/panels/*`                     | Duplicates existing core panel primitives.                         |
| Inline hero blocks in Home/Budget/Tourism        | `core/ui/page-hero/*`                      | Already partially solved by `PageHeroBanner`.                      |
| Inline stat/metric cards in CountryProfile       | `core/ui/metrics/*`                        | Repeated visual pattern with feature-owned values.                 |

## What should not move to core

| Code                                              | Keep in feature                            | Reason                                                              |
| ------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------- |
| `useScoring`, `useWeightState`                    | `features/country-ranking`                 | Ranking preferences and scoring are feature/domain state.           |
| `useBudgetMatcher`, budget preference store       | `features/budget`                          | Budget matching is feature-specific.                                |
| `useTourismScoring`, tourism travel dates/toggles | `features/tourism`                         | Tourism ranking is feature-specific.                                |
| Compare URL parsing and mode state                | `features/compare`                         | Route-specific URL ownership.                                       |
| Nomad visa sort fields and table schema           | `features/nomad-visas`                     | Visa table-specific unless another table adopts the same primitive. |
| Country profile content sections                  | `features/country-profile`                 | Page-specific composition; only primitives should move to core.     |
| Budget/tourism category constants                 | Feature or core models depending on domain | Do not import feature constants from core UI.                       |

## Composition rules for the new shared components

### Prefer slots over boolean props

Avoid:

```tsx
<CountryRow isBudget showSparkline showBudgetBar compareMode />
```

Prefer:

```tsx
<CountryResultRow compareMode={compareMode}>
  <CountryResultRow.Content>{featureSpecificContent}</CountryResultRow.Content>
  <CountryResultRow.Below>{budgetBar}</CountryResultRow.Below>
</CountryResultRow>
```

### Use explicit variants when variants are finite

Good candidates:

- `MetricCard` with `variant="default" | "summary" | "compact"`.
- `MobileFabButton` with `tone="accent" | "neutral"`.
- `StatusPill` with `tone="success" | "warning" | "danger" | "neutral"`.

Avoid adding many booleans such as `compact`, `highlighted`, `muted`, `large`, `withBorder`, `withIcon` unless they compose into a clear variant.

### Keep i18n outside core primitives

Core primitives should generally receive `label`, `ariaLabel`, `children`, or rendered nodes. They should not call `t()` unless the text is truly global and primitive-owned, such as a reset label in `PanelShell`.

### Keep feature data mapping outside core

Core should not know:

- Budget category keys.
- Tourism metric keys.
- Nomad visa table columns.
- Compare route modes.

Core can know:

- How to render a row, card, section, toolbar, modal, range field, or segmented control.

## Suggested migration roadmap

### Phase 1: Low-risk core primitives

1. Fix `PageHeroBanner` eyebrow rendering.
2. Add `HeroStats` and `HeroStat`.
3. Add `MobileFabButton`.
4. Move `CompareCheckbox` to `core/ui/selection`.
5. Add `EmptyState` and `LoadingRows`.

Expected wins:

- Immediate duplication reduction.
- Better a11y ownership.
- Very low behavior risk.

### Phase 2: Shared page shell and toolbar

1. Add `ResponsiveSidePanelLayout`.
2. Add `SearchInput`.
3. Add `CompareModeActions`.
4. Add `ListToolbar`.
5. Migrate Home, Budget, Tourism, Nomad Visas one by one.

Expected wins:

- Route files shrink significantly.
- Search/compare UI becomes consistent.
- Mobile sheet behavior remains centralized.

### Phase 3: Country row and metrics primitives

1. Add `CountryResultRow`.
2. Migrate `CountryCard`, `BudgetCountryCard`, `TourismCountryCard`.
3. Add `MetricGrid`, `MetricCard`, `MetricBar`, `StatCard`, `SectionHeader`.
4. Split `CountryProfileView` into feature sections.
5. Move `ScoreBreakdown` to core.

Expected wins:

- Biggest maintainability improvement.
- Feature-to-feature UI imports reduced.
- Easier future list/card design changes.

### Phase 4: Feature-owned deeper refactors

1. Split `NomadVisasView` into toolbar/table/row cells.
2. Split `CompareView` into mode switcher/action toolbar/workspace layout.
3. Create compare-owned `ComparisonWorkspace`.
4. Split `TourismWeightPanel` into smaller sections.

Expected wins:

- Less route-level complexity.
- Compare and visa screens become easier to modify independently.

## Detailed checklist by component

### `CountryProfileView.tsx`

Split locally:

- `CountryProfileHero`
- `CountryProfileStats`
- `CountryVisaSection`
- `CountryPerformanceSection`
- `CountryTourismSection`
- `CountryCostOfLivingSection`
- `CountryClimateSection`

Move/reuse from core:

- `SectionHeader`
- `MetricGrid`
- `MetricCard`
- `StatCard`
- `ScoreBreakdown`

Remove from route:

- Inline cost metric array.
- Inline climate metric cards.
- Tourism group card rendering.
- Feature-to-feature UI imports where possible.

### `NomadVisasView.tsx`

Split locally:

- `NomadVisaHeroStats`
- `NomadVisaToolbar`
- `NomadVisaTable`
- `NomadVisaTableHeader`
- `NomadVisaTableRow`
- `NomadVisaIncomeCell`
- `NomadVisaTaxCell`

Move/reuse from core:

- `PageHeroBanner` + `HeroStats`.
- `SearchInput`.
- `CompareModeActions`.
- `SortableHeaderCell` if it becomes shared.

Accessibility items:

- External official URL icon link needs an accessible label.
- Visual compare checkbox should become semantic through the row shell or core selection primitive.

### `HomeView.tsx`

Split locally:

- `HomeHero`
- `HomeToolbar`
- `HomeCountryResults`
- `useCountrySearchNavigation`
- `useHighlightParam`

Move/reuse from core:

- `ResponsiveSidePanelLayout`.
- `SearchInput`.
- `CompareModeActions`.
- `HeroStats`.
- `CountryResultRow` after row migration.

### `BudgetMatcherView.tsx`

Split locally:

- `BudgetMatcherHero`
- `BudgetMatcherToolbar`
- `BudgetCategoryLegend`
- `BudgetMatcherResults`

Move/reuse from core:

- `ResponsiveSidePanelLayout`.
- `SearchInput`.
- `CompareModeActions`.
- `LoadingRows`.
- `EmptyState`.
- `CountryResultRow`.

### `TourismExplorerView.tsx`

Split locally:

- `TourismHero`
- `TourismToolbar`
- `TourismTagFilterBar`
- `TourismCountryResults`

Move/reuse from core:

- `ResponsiveSidePanelLayout`.
- `SearchInput`.
- `CompareModeActions`.
- `LoadingRows`.
- `EmptyState`.
- `CountryResultRow`.

### `TourismWeightPanel.tsx`

Split locally:

- `TourismBudgetSection`
- `TourismAccommodationControl`
- `TourismTravelDatesSection`
- `TourismMetricGroupsSection`
- `TourismDateSelectPair`

Move/reuse from core:

- `RangeField`.
- `SegmentedControl`.
- Existing `PanelShell`, `CollapsibleSection`, `PeopleCountStepper`.

### `CompareView.tsx`

Split locally:

- `CompareHeroStats`
- `CompareModeSwitcher`
- `CompareActionToolbar`
- `CompareParametersSheet`
- `CompareWorkspaceLayout`

Move/reuse from core:

- `HeroStats`.
- `SegmentedControl`.
- `IconActionButton`.
- Possibly `ResponsiveSidePanelLayout`.

Keep in compare:

- `ComparePanel`.
- URL mode parsing.
- Sort/share actions.

### `Layout.tsx`

Split within core:

```txt
core/ui/layout/AppHeader.tsx
core/ui/layout/DesktopNav.tsx
core/ui/layout/MobileNav.tsx
core/ui/layout/LanguageMenu.tsx
core/ui/layout/GitHubLink.tsx
```

Keep in core:

- App-wide nav and language behavior.

Potential core hooks:

```txt
core/hooks/useClickOutside.ts
core/hooks/useBodyScrollLock.ts
```

`useBodyScrollLock` already exists, so `Layout` should use it instead of directly mutating `document.body.style.overflow`.

## API design examples

### `HeroStat`

```tsx
interface HeroStatProps {
  readonly value: React.ReactNode;
  readonly label: React.ReactNode;
  readonly to?: string;
}
```

If `to` exists, render a `Link`; otherwise render a `div`. Keep `HeroStats` responsible for dividers so callers do not duplicate divider markup.

### `SearchInput`

```tsx
interface SearchInputProps {
  readonly name: string;
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly placeholder: string;
  readonly clearLabel: string;
  readonly inputRef?: React.Ref<HTMLInputElement>;
}
```

Core responsibilities:

- Clear button.
- `aria-label`.
- Focus-visible styling.
- Padding changes when clear button is visible.

### `CompareModeActions`

```tsx
interface CompareModeActionsProps {
  readonly active: boolean;
  readonly selectedCount: number;
  readonly minCount?: number;
  readonly enterLabel: string;
  readonly compareLabel: string;
  readonly exitLabel: string;
  readonly helperText?: string;
  readonly onEnter: () => void;
  readonly onExit: () => void;
  readonly onCompare: () => void;
}
```

### `MetricCard`

```tsx
interface MetricCardProps {
  readonly icon?: React.ReactNode;
  readonly label: React.ReactNode;
  readonly value: React.ReactNode;
  readonly detail?: React.ReactNode;
  readonly valueClassName?: string;
  readonly children?: React.ReactNode;
}
```

### `CountryResultRow`

Use compound slots to avoid feature booleans:

```tsx
<CountryResultRow selected={selected} highlighted={highlighted} compareMode={compareMode}>
  <CountryResultRow.Main onClick={...}>
    ...
  </CountryResultRow.Main>
  <CountryResultRow.Below>{...}</CountryResultRow.Below>
  <CountryResultRow.Expanded>{...}</CountryResultRow.Expanded>
</CountryResultRow>
```

## Testing and validation guide

After each migration slice:

```bash
npm run lint -w client
npm run build -w client
```

Before merging larger architecture changes, run client-level quality:

```bash
cd client
npm run test
npm run doctor:ci
```

Manual checks:

- Desktop and mobile Home, Budget, Tourism, Nomad Visas, Compare, Country Profile routes.
- Mobile sheet open/close, Escape, outside click, focus trap.
- Search clear buttons and focus rings.
- Compare mode selection, disabled/enabled compare CTA, selected count.
- Row expand vs select behavior.
- Country profile sections with and without optional data.
- Nomad visa table sorting and official link accessibility.

## Recommended first PR sequence

1. PR 1: `PageHeroBanner`, `HeroStats`, `HeroStat`; migrate Compare and Nomad Visas only.
2. PR 2: migrate Home/Budget/Tourism heroes.
3. PR 3: move `CompareCheckbox` to `core/ui/selection`; update row imports.
4. PR 4: introduce `SearchInput` and `CompareModeActions`; migrate one route at a time.
5. PR 5: add `ResponsiveSidePanelLayout`; migrate Home/Budget/Tourism.
6. PR 6: add metric primitives and split `CountryProfileView`.
7. PR 7: add `CountryResultRow`; migrate Country/Budget/Tourism cards.
8. PR 8: split Nomad Visa table locally.
9. PR 9: split Compare workspace locally.

This order keeps behavior changes small and makes each PR easy to review.

# Nomad Lens Client Architecture Concept

This document defines the target React architecture for `client/`. It is intentionally pragmatic: use Zustand for shared app/domain state, keep route state in the URL, keep local UI state local, and split large components by responsibility instead of introducing abstractions for their own sake.

## Current architecture problems to correct

- Route and feature files are too large: `CountryPage.tsx` is 1869 lines, `BudgetMatcherPage.tsx` is 1301, `NomadVisasPage.tsx` is 1218, `WeightPanel.tsx` is 1062, `TourismWeightPanel.tsx` is 1056, `App.tsx` is 1043.
- Data ownership is duplicated: `useCountries()` is called by many routes, so loading/error/cache behavior is route-local instead of app-owned.
- Feature state is scattered across hooks, URL params, localStorage, and route components.
- Repeated UI behavior exists in multiple files, especially mobile sheets, focus trapping, scroll locking, search navigation, compare selection, and share URL generation.
- Component APIs rely on boolean modes (`compareMode`, `mobile`, `selected`, `expanded`) instead of explicit variants or composition.
- Domain logic and UI rendering are mixed in route components and large panels.
- Route imports are eager, so all screens are pulled into the initial bundle.

## Decision

Use a feature-oriented architecture with a small `app/` shell, reusable `shared/` primitives, typed `entities/`, isolated `features/`, and thin `pages/`. Zustand owns shared client state and persisted preferences; URL params own shareable route state; pure utilities own scoring, filtering, sorting, and formatting. Components should be small, typed, accessible, localization-safe, and composed from primitives instead of controlled by boolean mode combinations.

## Target folder structure

```text
client/src/
  app/
    AppProviders.tsx
    router.tsx
    routes.tsx
    store/
      createStore.ts
      storage.ts
      selectors.ts

  shared/
    api/
      http.ts
      nomadLensApi.ts
    assets/
      countries-110m.json
    hooks/
      useFocusTrap.ts
      useBodyScrollLock.ts
      useClipboard.ts
      useKeyboardNavigation.ts
      useMediaQuery.ts
    i18n/
      index.ts
    lib/
      assertNever.ts
      clamp.ts
      format.ts
      urlSearch.ts
    ui/
      Button.tsx
      IconButton.tsx
      LinkButton.tsx
      MobileSheet.tsx
      Modal.tsx
      SegmentedControl.tsx
      SliderField.tsx
      Tooltip.tsx
      EmptyState.tsx
      ErrorState.tsx
      LoadingState.tsx

  entities/
    country/
      model/
        country.types.ts
        country.selectors.ts
        country.store.ts
      api/
        country.api.ts
      ui/
        CountryFlag.tsx
        CountryScore.tsx
        CountryMetricDots.tsx
        CountryRowBase.tsx
        ExpandableCountryRow.tsx
        SelectableCountryRow.tsx
    indicator/
      model/
        indicator.types.ts
        indicator.constants.ts
      ui/
        IndicatorCard.tsx
        ScoreBreakdown.tsx
    visa/
      model/
        visa.types.ts
        visa.selectors.ts
      ui/
        VisaBadge.tsx
        VisaDetails.tsx

  features/
    rankingPreferences/
      model/
        rankingPreferences.store.ts
        rankingPreferences.types.ts
        rankingPreferences.storage.ts
        rankingScoring.ts
      ui/
        RankingPreferencesPanel.tsx
        WeightGroup.tsx
        WeightSlider.tsx
        WeightModeToggle.tsx
        ClimatePreferences.tsx
        VisaStayFilters.tsx
    countryRanking/
      model/
        useRankedCountries.ts
        countrySearch.ts
        rankingFilters.ts
      ui/
        CountryRankingList.tsx
        CountryRankingToolbar.tsx
        CountrySearchBox.tsx
    compare/
      model/
        compareUrlState.ts
        useCompareSelection.ts
      ui/
        CompareModeTabs.tsx
        CompareActions.tsx
        CountryComparisonTable.tsx
        RegionComparisonTable.tsx
    budget/
      model/
        budget.store.ts
        budget.types.ts
        budgetMatcher.ts
        budgetUrlState.ts
      ui/
        BudgetPreferencesPanel.tsx
        BudgetLifestyleSection.tsx
        BudgetCategoryWeights.tsx
        BudgetResultCard.tsx
        BudgetComparisonTable.tsx
    tourism/
      model/
        tourism.store.ts
        tourism.types.ts
        tourismScoring.ts
        tourismUrlState.ts
      ui/
        TourismPreferencesPanel.tsx
        TourismResultCard.tsx
        TourismComparisonTable.tsx
        TourismBudgetSection.tsx
        TourismTravelDatesSection.tsx
    map/
      model/
        mapSelectors.ts
      ui/
        WorldMap.tsx
        MapLegend.tsx
        MapControls.tsx
        MapTooltip.tsx
        CountryMapPanel.tsx

  pages/
    home/
      HomePage.tsx
      HomeHero.tsx
      HomeMobileActions.tsx
    map/
      MapPage.tsx
    compare/
      ComparePage.tsx
    country/
      CountryPage.tsx
      CountryHero.tsx
      CountryVisaSection.tsx
      CountryCostSection.tsx
      CountryTourismSection.tsx
    budgetMatcher/
      BudgetMatcherPage.tsx
    tourism/
      TourismPage.tsx
    nomadVisas/
      NomadVisasPage.tsx
    info/
      IndicatorsPage.tsx
      AiIndicatorsPage.tsx
      DataSourcesPage.tsx
      BudgetCategoriesPage.tsx
```

## State ownership

| State kind            | Source of truth                       | Examples                                                                            | Rule                                                                        |
| --------------------- | ------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Server/app data       | Zustand `country.store.ts`            | countries, load status, load error, refresh action                                  | Shared once, deduplicated, selector-based reads                             |
| Persisted preferences | Zustand persisted slices              | ranking weights, climate prefs, budget prefs, tourism prefs                         | Versioned storage schema with sanitizers                                    |
| Shareable route state | URL query params                      | compare mode, selected country codes, highlighted code, filters that must deep-link | Parse/serialize in `*UrlState.ts`; no ad hoc URL mutation in JSX            |
| Ephemeral UI state    | Local component state or feature hook | open sheet, hover tooltip, expanded row, copied state                               | Keep local unless multiple distant siblings need it                         |
| Derived data          | Selectors/hooks/utilities             | ranked countries, filtered matches, budget matches, tourism ranking                 | Derive during render with memoized selectors; do not persist derived values |

## Zustand store design

Install `zustand` and use separate stores instead of one broad global store. Each store exposes narrow selectors and actions.

```text
entities/country/model/country.store.ts
  useCountryStore(selector)
  loadCountries()
  refreshCountries()
  selectCountries
  selectCountryByCode
  selectCountryLoadState

features/rankingPreferences/model/rankingPreferences.store.ts
  weights
  weightMode
  filters
  climatePrefs
  setWeight()
  setWeightMode()
  setFilter()
  resetRankingPreferences()

features/budget/model/budget.store.ts
  budget
  housing
  peopleCount
  bedrooms
  categoryWeights
  qualityBlend
  setBudgetField()
  setBudgetCategoryWeight()
  resetBudgetPreferences()

features/tourism/model/tourism.store.ts
  weights
  selectedRegions
  toggles
  budgetState
  travelDates
  setTourismWeight()
  setTourismToggle()
  setTravelDates()
  resetTourismPreferences()
```

Store rules:

- Do not pass an entire store object to components. Components subscribe to the smallest primitive selectors they need.
- Do not put route-only UI state in Zustand just because Zustand exists.
- Do not store derived rankings or filtered arrays. Store inputs, derive outputs.
- Persisted stores must have a version, migration function, and sanitizer for corrupt storage.
- Async country loading must deduplicate in-flight requests and expose explicit states: `idle`, `loading`, `success`, `error`.
- Store actions should be domain-named: `setClimatePreference`, not `setState`.

## Component boundaries

### Pages

Pages coordinate route-level concerns only:

- read route params/query params
- connect stores/selectors
- choose which feature components render
- provide page-level loading/error/empty states

Pages should not:

- contain large JSX trees
- implement focus traps or global keyboard listeners directly
- compute scoring/filtering inline
- define reusable subcomponents inline

### Features

Feature folders own a workflow:

- ranking preferences
- country ranking/search
- compare
- budget matcher
- tourism
- map

Feature components can know feature-specific types and stores. They should not know route paths unless they are explicitly navigation components.

### Entities

Entity folders own reusable domain presentation:

- country rows, flags, scores, metric dots
- indicator cards and score breakdowns
- visa badges/details

Entity components should be reusable across features and avoid feature state.

### Shared UI

Shared UI primitives are generic and accessible:

- `Button`, `IconButton`, `MobileSheet`, `SegmentedControl`, `SliderField`, `Tooltip`
- no domain imports
- no app store imports
- no i18n keys unless the primitive owns a generic accessible label

## Routing and bundle strategy

- Move route definitions to `app/router.tsx`.
- Lazy-load all route pages with `React.lazy()`.
- Use one shared route fallback with accessible loading copy.
- Keep heavy map code in the map route chunk.
- Preload likely next routes on intent, such as hover/focus on navigation links, only after basic lazy routing is stable.

## Data loading strategy

- `country.api.ts` owns `api.getCountries()`.
- `country.store.ts` owns the shared cache and in-flight request.
- Static local data remains supported when `VITE_API_URL` is empty.
- Errors must be surfaced through an explicit error state, not hidden behind empty arrays.
- Country selectors provide indexed lookups by code and region to avoid repeated array scans in route components.

## Accessibility and UI primitives

Create shared primitives before splitting every screen:

- `MobileSheet` owns `role="dialog"`, `aria-modal`, Escape close, focus trap, body scroll lock, overlay close, focus restoration, and safe-area padding.
- `IconButton` requires an `aria-label`.
- `SliderField` always renders a visible or screen-reader label, `name`, min/max/step/value text, and optional help text.
- `SegmentedControl` uses button semantics, visible focus states, and explicit selected state.
- `Tooltip` must support keyboard focus and not be the only place important information exists.

## File size and responsibility budgets

These are guidelines, not hard lint rules:

- Page files: target under 150 lines.
- Feature components: target under 250 lines.
- Shared UI primitives: target under 200 lines.
- Pure utilities/selectors: target under 250 lines.
- If a file needs more, split by responsibility, not by arbitrary line count.

## Naming rules

- Stores: `*.store.ts`
- Store selectors: `selectThing`
- URL state helpers: `*UrlState.ts`
- Pure domain logic: nouns or verbs without React naming, e.g. `budgetMatcher.ts`, `rankingFilters.ts`
- Hooks: only for React state/effects/subscriptions, e.g. `useCompareSelection.ts`
- Components: explicit role names, e.g. `BudgetPreferencesPanel`, not `BudgetPanel2`

## Testing strategy

Prioritize unit tests before big visual refactors:

- store migrations and storage sanitizers
- URL parse/serialize helpers
- scoring, filtering, sorting, and matching utilities
- selectors that index countries and compute derived lists
- shared accessibility primitives where behavior is non-trivial, especially `MobileSheet`

## Non-goals

- Do not rewrite every screen at once.
- Do not move all UI state into Zustand.
- Do not introduce a design-system package.
- Do not introduce factories or config-driven rendering until repeated concrete use cases justify them.
- Do not change visible behavior during architecture migration unless a task explicitly says so.

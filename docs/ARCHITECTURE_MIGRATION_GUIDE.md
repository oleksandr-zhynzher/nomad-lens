# Client Architecture Migration Guide

This guide breaks the architecture migration into atomic, validated tasks. Each task should be a small PR or commit-sized change. Do not start by rewriting screens; first create safe seams, then move state and UI gradually.

## Validation commands

Run the relevant commands after each task:

```bash
cd client
npm run lint
npm run test
npm run build
```

For architecture-sensitive changes, also run:

```bash
cd client
npm run doctor:ci
```

## Phase 0: Baseline and safety rails

### Task 0.1 — Capture current baseline

- **Goal:** Know whether the repo is already passing before refactoring.
- **Change:** Run `npm run lint`, `npm run test`, `npm run build`, and `npm run doctor:ci` without code changes.
- **Validation:** Record which commands pass or fail before migration. Do not fix unrelated failures in this task.

### Task 0.2 — Add Zustand

- **Goal:** Add the only new state dependency required by the target architecture.
- **Change:** Run `npm install zustand` in `client/`.
- **Validation:** `npm run build`.

### Task 0.3 — Add target folder skeleton

- **Goal:** Create folders without moving behavior yet.
- **Change:** Add empty or minimal files only where TypeScript requires exports: `app/`, `shared/`, `entities/`, `features/`, and nested folders from `ARCHITECTURE_CONCEPT.md`.
- **Validation:** `npm run lint` and `npm run build`.

## Phase 1: Shared primitives and reusable hooks

### Task 1.1 — Extract body scroll lock

- **Goal:** Remove duplicated `document.body.style.overflow` logic.
- **Change:** Add `shared/hooks/useBodyScrollLock.ts`.
- **Acceptance:** Existing mobile sheets still prevent background scroll.
- **Validation:** `npm run lint`, `npm run build`.

### Task 1.2 — Extract focus trap

- **Goal:** Centralize Tab/Escape/focus restoration behavior.
- **Change:** Add `shared/hooks/useFocusTrap.ts` with refs and callbacks; do not change visual UI yet.
- **Acceptance:** Hook supports Escape close, first/last focus loop, and previous focus restoration.
- **Validation:** Add focused unit tests if test utilities exist; otherwise `npm run lint`, `npm run build`.

### Task 1.3 — Create `MobileSheet`

- **Goal:** Replace four duplicated bottom-sheet implementations with one accessible primitive.
- **Change:** Add `shared/ui/MobileSheet.tsx` using `useBodyScrollLock` and `useFocusTrap`.
- **Acceptance:** Requires `title`, `onClose`, and `children`; owns overlay, close button, `role="dialog"`, `aria-modal`, safe-area padding, and focus behavior.
- **Validation:** `npm run lint`, `npm run build`.

### Task 1.4 — Migrate the home/list mobile sheet

- **Goal:** Prove `MobileSheet` works on one screen.
- **Change:** Replace the mobile sheet in `App.tsx` with `MobileSheet`.
- **Acceptance:** No behavior change for open/close, Escape, Tab loop, and parameter rendering.
- **Validation:** `npm run lint`, `npm run build`.

### Task 1.5 — Migrate remaining mobile sheets

- **Goal:** Remove duplicated bottom-sheet infrastructure.
- **Change:** Replace sheet code in `ComparePage.tsx`, `BudgetMatcherPage.tsx`, and `TourismPage.tsx`.
- **Acceptance:** All four screens use the same `MobileSheet`; page files only pass content.
- **Validation:** `npm run lint`, `npm run build`, `npm run doctor:ci`.

### Task 1.6 — Add common form primitives

- **Goal:** Stop repeating slider/toggle markup.
- **Change:** Add `shared/ui/SliderField.tsx`, `shared/ui/SegmentedControl.tsx`, `shared/ui/IconButton.tsx`, and `shared/ui/Button.tsx`.
- **Acceptance:** Primitives enforce labels, names, visible focus states, and no `transition: all`.
- **Validation:** `npm run lint`, `npm run build`.

## Phase 2: App shell, routing, and bundles

### Task 2.1 — Move router config into `app/router.tsx`

- **Goal:** Make routing a single app-shell concern.
- **Change:** Move route definitions out of `main.tsx`; keep behavior identical.
- **Acceptance:** `main.tsx` only mounts providers/router.
- **Validation:** `npm run lint`, `npm run build`.

### Task 2.2 — Lazy-load route pages

- **Goal:** Reduce initial bundle size.
- **Change:** Replace eager page imports with `React.lazy()` route imports and one shared loading fallback.
- **Acceptance:** Each route page builds as a separate chunk where Vite supports it.
- **Validation:** `npm run build`; inspect build output for separated route chunks.

### Task 2.3 — Move `Layout` into app/shared boundaries

- **Goal:** Separate app navigation from route content.
- **Change:** Move navigation shell to `app/AppShell.tsx` or `shared/layout/AppShell.tsx`; split header navigation, language switcher, and mobile menu.
- **Acceptance:** `Layout.tsx` is no longer a 500+ line mixed-responsibility component.
- **Validation:** `npm run lint`, `npm run build`.

## Phase 3: Country data store

### Task 3.1 — Move country API to entity API

- **Goal:** Put data access next to the country entity.
- **Change:** Move `services/api.ts` country loading into `entities/country/api/country.api.ts`; keep `getHealth()` in shared API or a health API file.
- **Acceptance:** Existing `useCountries()` still works through the new API.
- **Validation:** `npm run lint`, `npm run build`.

### Task 3.2 — Create `country.store.ts`

- **Goal:** Make country data app-owned and deduplicated.
- **Change:** Add Zustand store with `countries`, `status`, `error`, `loadCountries`, `refreshCountries`, and in-flight request deduplication.
- **Acceptance:** Multiple callers do not start multiple `/api/countries` requests.
- **Validation:** Unit test the dedupe behavior if practical; otherwise `npm run test`, `npm run build`.

### Task 3.3 — Add country selectors

- **Goal:** Avoid repeated scans and ad hoc lookups.
- **Change:** Add `selectCountries`, `selectCountryByCode`, `selectCountriesByRegion`, `selectCountryLoadState`, and derived indexes.
- **Acceptance:** Selectors return stable derived values where possible.
- **Validation:** Add tests for code normalization and missing-country behavior; run `npm run test`.

### Task 3.4 — Replace `useCountries()` route usage

- **Goal:** Remove duplicated country loading lifecycle.
- **Change:** Update pages to read country data from Zustand selectors. Keep a compatibility `useCountries()` wrapper only if migration needs it temporarily.
- **Acceptance:** Routes do not own separate country fetch state.
- **Validation:** `npm run lint`, `npm run test`, `npm run build`.

## Phase 4: Persisted preference stores

### Task 4.1 — Create versioned storage helpers

- **Goal:** Make localStorage safe and testable.
- **Change:** Add `app/store/storage.ts` or `shared/lib/storage.ts` with JSON parse, versioning, migration, and sanitization helpers.
- **Acceptance:** Corrupt storage returns an explicit fallback and does not silently poison state.
- **Validation:** Unit tests for valid, missing, corrupt, and old-version storage.

### Task 4.2 — Migrate ranking preferences to Zustand

- **Goal:** Replace `useWeightState()` with a store-backed model.
- **Change:** Add `features/rankingPreferences/model/rankingPreferences.store.ts`, types, and storage migration.
- **Acceptance:** Weight mode, weights, filters, and climate preferences persist with the same visible behavior.
- **Validation:** Unit tests for defaults, reset, storage migration, and `redistributeWeights`; `npm run build`.

### Task 4.3 — Migrate budget preferences to Zustand

- **Goal:** Replace `useBudgetState()` prop bag with a typed store.
- **Change:** Add `features/budget/model/budget.store.ts` and move budget storage/validation into model files.
- **Acceptance:** Budget matcher keeps current defaults, limits, share behavior, and reset behavior.
- **Validation:** Unit tests for parsing, clamping, reset, and category weights.

### Task 4.4 — Migrate tourism preferences to Zustand

- **Goal:** Replace `useTourismWeightState()` with a typed, versioned store.
- **Change:** Add `features/tourism/model/tourism.store.ts`, storage schema, and migration from existing localStorage keys.
- **Acceptance:** Existing users keep tourism preferences after migration.
- **Validation:** Unit tests for migration from old keys and reset behavior.

### Task 4.5 — Remove broad store prop bags

- **Goal:** Stop passing objects like `bs` through UI trees.
- **Change:** Components subscribe to narrow selectors or receive explicit primitive props.
- **Acceptance:** No component receives an entire preference store object as a prop.
- **Validation:** `npm run lint`, `npm run doctor:ci`, `npm run build`.

## Phase 5: Pure domain models

### Task 5.1 — Move ranking scoring into feature model

- **Goal:** Keep scoring pure and feature-owned.
- **Change:** Move `utils/scoring.ts` into `features/rankingPreferences/model/rankingScoring.ts` or `features/countryRanking/model/rankingScoring.ts`.
- **Acceptance:** No JSX file implements scoring or weight redistribution.
- **Validation:** Preserve/add tests for score calculation, missing data penalty, defaults, and redistribution.

### Task 5.2 — Extract country search and keyboard navigation

- **Goal:** Remove global search/navigation logic from `App.tsx` and `TourismPage.tsx`.
- **Change:** Add `features/countryRanking/model/countrySearch.ts` and `shared/hooks/useKeyboardNavigation.ts`.
- **Acceptance:** Filtering, highlight navigation, and Enter expansion stay unchanged.
- **Validation:** Unit tests for search matching; `npm run build`.

### Task 5.3 — Extract compare URL state

- **Goal:** Make shareable compare state explicit.
- **Change:** Add `features/compare/model/compareUrlState.ts` for mode and country code parsing/serialization.
- **Acceptance:** `ComparePage` no longer manually mutates query params in multiple handlers.
- **Validation:** Unit tests for empty, invalid, duplicate, and normalized country codes.

### Task 5.4 — Extract budget matcher domain logic

- **Goal:** Move cost calculation out of hooks.
- **Change:** Move pure budget cost/scoring from `useBudgetMatcher.ts` into `features/budget/model/budgetMatcher.ts`.
- **Acceptance:** Hook, if retained, only connects inputs to pure model logic.
- **Validation:** Unit tests for housing, people scaling, missing data, and sorted scores.

### Task 5.5 — Extract tourism scoring domain logic

- **Goal:** Remove tourism model dependency on hook types.
- **Change:** Move tourism state types from `useTourismWeightState.ts` into `features/tourism/model/tourism.types.ts`; make `tourismScoring.ts` import model types, not hooks.
- **Acceptance:** Pure tourism scoring has no React imports or hook imports.
- **Validation:** Unit tests for weighted score, tag seasonality, budget match, and invalid dates.

## Phase 6: Component decomposition by feature

### Task 6.1 — Split `WeightPanel`

- **Goal:** Reduce `WeightPanel.tsx` from a 1000+ line component into focused parts.
- **Change:** Create `RankingPreferencesPanel`, `WeightGroup`, `WeightSlider`, `WeightModeToggle`, `ClimatePreferences`, and `VisaStayFilters`.
- **Acceptance:** Each file has one reason to change; panel composes sections.
- **Validation:** `npm run lint`, `npm run build`.

### Task 6.2 — Split `TourismWeightPanel`

- **Goal:** Match the ranking preferences structure for tourism.
- **Change:** Create `TourismPreferencesPanel`, `TourismWeightGroup`, `TourismBudgetSection`, `TourismActivitySection`, `TourismTravelDatesSection`.
- **Acceptance:** Tourism preferences can be used by `TourismPage` and compare mode without mode flags.
- **Validation:** `npm run lint`, `npm run build`.

### Task 6.3 — Replace country row boolean modes

- **Goal:** Make row behavior explicit.
- **Change:** Create `CountryRowBase`, `ExpandableCountryRow`, and `SelectableCountryRow`.
- **Acceptance:** `compareMode`, `selected`, and `expanded` no longer coexist as hidden modes in one row component.
- **Validation:** `npm run lint`, `npm run build`.

### Task 6.4 — Split `CountryPage`

- **Goal:** Turn the 1800+ line route into a coordinator.
- **Change:** Extract `CountryHero`, `CountryScoreSection`, `CountryVisaSection`, `CountryCostSection`, `CountryClimateSection`, `CountryTourismSection`, and small reusable rows/cards.
- **Acceptance:** `CountryPage.tsx` mostly reads params/selectors and composes sections.
- **Validation:** `npm run lint`, `npm run build`.

### Task 6.5 — Split `BudgetMatcherPage`

- **Goal:** Separate filtering, actions, results, and mobile presentation.
- **Change:** Extract `BudgetMatcherToolbar`, `BudgetResultsList`, `BudgetCompareActions`, and reuse `BudgetPreferencesPanel`.
- **Acceptance:** No inline sidebar content block inside the page.
- **Validation:** `npm run lint`, `npm run build`.

### Task 6.6 — Split `TourismPage`

- **Goal:** Separate tourism preferences, toolbar, result list, and compare actions.
- **Change:** Extract `TourismToolbar`, `TourismResultsList`, `TourismCompareActions`, and reuse `TourismPreferencesPanel`.
- **Acceptance:** Search/highlight logic is in model hooks, not page JSX.
- **Validation:** `npm run lint`, `npm run build`.

### Task 6.7 — Split `ComparePage`

- **Goal:** Make compare modes independent feature surfaces.
- **Change:** Extract `CompareModeTabs`, `CompareHeroStats`, `CompareParametersPanel`, `CompareActions`, and per-mode panels.
- **Acceptance:** Adding a compare mode does not require editing one massive switch in the page.
- **Validation:** `npm run lint`, `npm run build`.

### Task 6.8 — Split map UI

- **Goal:** Keep `WorldMap` focused on rendering the map.
- **Change:** Extract `MapControls`, `MapLegend`, `MapTooltip`, and `CountryMapPanel`.
- **Acceptance:** `WorldMap` owns map interaction state only.
- **Validation:** `npm run lint`, `npm run build`.

## Phase 7: URL state, sharing, and clipboard

### Task 7.1 — Add URL state helpers

- **Goal:** Stop manual query param construction scattered across hooks/pages.
- **Change:** Add `shared/lib/urlSearch.ts` and feature-specific `*UrlState.ts`.
- **Acceptance:** Parse and serialize functions are pure and tested.
- **Validation:** Unit tests for all query schemas.

### Task 7.2 — Add `useClipboard`

- **Goal:** Centralize clipboard success/failure behavior.
- **Change:** Add `shared/hooks/useClipboard.ts` and replace direct `navigator.clipboard` calls.
- **Acceptance:** Share buttons expose success feedback via `aria-live="polite"` and handle copy failure explicitly.
- **Validation:** `npm run lint`, `npm run build`.

### Task 7.3 — Make share URLs feature-owned

- **Goal:** Keep URL schemas close to feature models.
- **Change:** Move ranking, budget, tourism, and compare share URL construction into feature URL state helpers.
- **Acceptance:** Stores do not directly touch `window.location`.
- **Validation:** Unit tests for generated URLs.

## Phase 8: Performance cleanup

### Task 8.1 — Use local map topology

- **Goal:** Remove runtime CDN dependency for map geography.
- **Change:** Import `countries-110m.json` from local data/assets and pass it to `Geographies`.
- **Acceptance:** Map works offline after app assets load.
- **Validation:** `npm run build`; manually open map route.

### Task 8.2 — Add list rendering strategy

- **Goal:** Avoid rendering too many rows during search/filter states.
- **Change:** Keep pagination or add `content-visibility: auto`; only consider virtualization if actual row counts grow enough to justify it.
- **Acceptance:** Search mode no longer blindly renders large lists if data grows.
- **Validation:** `npm run doctor:ci`, `npm run build`.

### Task 8.3 — Stabilize expensive derived selectors

- **Goal:** Prevent broad rerenders from store changes.
- **Change:** Use primitive Zustand selectors and memoized derived hooks for ranking, budget matches, and tourism matches.
- **Acceptance:** Changing a budget slider does not rerender unrelated ranking preference sections.
- **Validation:** `npm run doctor:ci`; use React DevTools profiler if available.

## Phase 9: Cleanup and enforcement

### Task 9.1 — Delete compatibility hooks

- **Goal:** Remove old architecture seams after migration.
- **Change:** Delete or shrink `useCountries`, `useWeightState`, `useBudgetState`, and `useTourismWeightState` once all consumers are migrated.
- **Acceptance:** No old hook imports remain.
- **Validation:** `npm run lint`, `npm run build`.

### Task 9.2 — Remove legacy component files

- **Goal:** Avoid duplicate architecture paths.
- **Change:** Delete replaced monoliths or turn them into small re-export compatibility files only during one migration step.
- **Acceptance:** No 800+ line React component/page files remain except generated/static data declarations.
- **Validation:** Run line-count check and `npm run build`.

### Task 9.3 — Add architecture guardrails to docs

- **Goal:** Make the new structure durable.
- **Change:** Update `client/README.md` with folder ownership rules, state ownership rules, and validation commands.
- **Acceptance:** New contributors can tell where code belongs without reading the migration history.
- **Validation:** Documentation review only.

## Final acceptance checklist

- Route pages are lazy-loaded.
- Country data is loaded once and shared through a typed Zustand store.
- Ranking, budget, and tourism preferences are Zustand stores with versioned persistence.
- Shareable state is represented in URL helpers, not ad hoc page code.
- Mobile sheet behavior exists in one accessible primitive.
- `WeightPanel`, `TourismWeightPanel`, `CountryPage`, `BudgetMatcherPage`, `TourismPage`, and `ComparePage` are split into feature components.
- Boolean mode components are replaced with explicit variants or composition.
- Pure scoring/filtering/matching logic has unit coverage.
- `npm run lint`, `npm run test`, `npm run build`, and `npm run doctor:ci` pass.

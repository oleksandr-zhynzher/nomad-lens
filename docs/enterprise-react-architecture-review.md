# Nomad Lens Client — Enterprise React Architecture Review

**Scope:** `/client` (React 19 + Vite + TypeScript + Zustand + React Router 7)  
**Review date:** 2026-05-31  
**Reviewer perspective:** Staff Frontend Architect / OSS maintainer / FAANG-level gate  
**Method:** Full-tree static analysis of ~365 TS/TSX files, architecture docs cross-check, CI/tooling audit, targeted deep reads of routing, state, API, hooks, and cross-feature dependency graph.

---

## Executive Summary

Nomad Lens has **clear architectural intent** and **above-average TypeScript discipline** for a product codebase. The migration away from monolithic page files succeeded: routes are lazy-loaded, route-level components are small, and `core/` largely stays feature-agnostic. ESLint is configured at a level most production teams never reach (strict TypeScript, jsx-a11y strict, boundaries plugin, security/no-secrets).

That said, the implementation **does not meet enterprise-grade claims** in several structural areas that will hurt a large team over time:

1. **Feature-layer cyclic dependencies** (`compare` ↔ `country-ranking` ↔ `nomad-visas`) violate the documented dependency model and create refactor fragility.
2. **State management is inconsistent** — budget prefs use a versioned Zustand store; ranking/tourism prefs use ad-hoc `useState` + multiple `useEffect` localStorage writes; compare orchestrates foreign feature hooks directly.
3. **Documentation and code diverge materially** (`ARCHITECTURE.md` forbids barrels; repo has ~59; `@app/*` alias documented but absent; `ARCHITECTURE_CONCEPT.md` targets never landed).
4. **Testing is critically underpowered** for a data-heavy, URL-state-heavy SPA (4 Vitest files, zero component/integration tests in client despite strict ESLint testing-library rules).
5. **No resilience shell** — no React Error Boundaries, no global loading/error provider, no runtime validation of API payloads.

**Verdict:** Suitable for a **small team shipping a focused product**, not yet suitable as an **open-source reference implementation** or **multi-team platform** without structural hardening.

---

## Final Score

| Category                  | Score (0–100) | Rationale (one line)                                                   |
| ------------------------- | ------------: | ---------------------------------------------------------------------- |
| **Architecture**          |        **64** | Good layering intent; cycles, hub coupling, doc drift                  |
| **React Quality**         |        **61** | Modern stack; effect/ref anti-patterns, DOM coupling, no boundaries    |
| **SOLID Compliance**      |        **54** | God hooks, concrete cross-feature deps, hook-shaped prop contracts     |
| **Maintainability**       |        **58** | Strict lint/TS helps; cycles and inconsistent state hurt onboarding    |
| **Scalability**           |        **55** | Compare hub + in-memory country fan-out won't scale feature growth     |
| **Performance**           |        **60** | Route splitting good; list/map bundle and re-render risks remain       |
| **Type Safety**           |        **74** | Excellent compiler flags; hook-return prop typing is a smell           |
| **Testing**               |        **38** | CI gates exist; client test surface is negligible                      |
| **Security**              |        **59** | Low XSS exposure; fetch trust, no schema validation, no boundaries     |
| **Open Source Readiness** |        **56** | Contributing/CI present; README drift, weak test/docs for contributors |

### Overall Final Score: **58 / 100**

### Estimated Engineering Level: **Senior** (lower half)

Not Middle — the toolchain and slice structure exceed typical mid-level work.  
Not Staff — cyclic feature graph, state fragmentation, and test gap block Staff bar for production-at-scale / OSS reference status.

---

## 1. Architecture Review

### What works

| Pattern                            | Evidence                                                                                          |
| ---------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Feature-sliced layout**          | `src/app`, `src/core`, `src/features/<feature>/{ui,hooks,utils,constants,models,store}`           |
| **Dependency direction (core)**    | `core/` does not import from `features/` (verified)                                               |
| **Lazy routing**                   | `AppRouter.tsx` — 13 `React.lazy()` routes with `Suspense`                                        |
| **Domain-neutral core**            | Models, API helpers, shared UI primitives in `core/`                                              |
| **Boundary enforcement (partial)** | `eslint-plugin-boundaries` blocks core→features and deep cross-feature `@features/*/*/**` imports |

### Critical failures

#### CRITICAL — Feature dependency cycles

| Cycle  | Path                                                                                                                                |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| 2-node | `country-ranking` → `nomad-visas/ui` (`CountryDetailPanel.tsx`) ↔ `nomad-visas` → `country-ranking/hooks` + `country-ranking/utils` |
| 3-node | `compare` → `country-ranking` → `nomad-visas` → `compare/utils` (`NomadVisaCompareView.tsx`)                                        |

**Risks:** Non-deterministic module init, brittle refactors, impossible feature extraction, bundler circular chunk warnings at scale.

**Recommendation:** Extract shared visa presentation + ranking types to `core/ui/visa` or a thin `entities/` layer. Compare should depend on **interfaces**, not foreign hooks.

#### HIGH — `compare` is a composition god-feature

`useCompareView.ts` (208 lines) imports budget, country-ranking, and tourism hooks, owns URL params, panel height DOM sync, mobile sheet state, and sort UX.

**Long-term impact:** Every new compare mode requires editing the hub hook and increases cycle risk.

**Recommendation:** Split into `useCompareUrlState`, `useCompareModeRegistry` (strategy map), and mode-specific sub-hooks loaded per route segment.

#### HIGH — Documentation vs implementation drift

| Document                       | Claim                                                 | Reality                                                            |
| ------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------ |
| `docs/ARCHITECTURE.md`         | Avoid broad `index.ts` barrels                        | ~59 barrel files; feature roots re-export entire slices            |
| `docs/ARCHITECTURE.md`         | `@app/*` alias                                        | Not in `tsconfig.app.json`                                         |
| `docs/ARCHITECTURE.md`         | `core → app` allowed                                  | Typo or wrong — core never imports app (correct behavior)          |
| `docs/ARCHITECTURE_CONCEPT.md` | `pages/`, `entities/`, Zustand ranking/tourism stores | Not implemented                                                    |
| `README.md`                    | React 18 + Headless UI                                | Client uses **React 19**; Headless UI not in `client/package.json` |

**Risks:** Contributors follow docs and introduce wrong patterns; code review lacks single source of truth.

#### MEDIUM — Intra-feature barrel self-import

`compare-url-state.utils.ts` imports from `@features/compare/utils` (the barrel that re-exports itself).

**File:** `client/src/features/compare/utils/compare-url-state.utils.ts:1-5`

**Risks:** Latent circular module graph; breaks if export order changes.

**Fix:** Import from `./url-search.utils` and `./country-code-selection.utils` directly.

#### MEDIUM — No application shell / providers

`main.tsx` mounts `AppRouter` only — no `ErrorBoundary`, no layout provider, no query cache, no telemetry.

**Risks:** White-screen failures; inconsistent error UX per feature.

### Architecture pattern assessment

| Pattern                | Adopted?                                                | Grade |
| ---------------------- | ------------------------------------------------------- | ----- |
| Clean Architecture     | Partial (core/features split, no domain/use-case layer) | C+    |
| Feature-Sliced Design  | Partial (slices exist; shared entities missing)         | B−    |
| Hexagonal Architecture | No ports/adapters for API or storage                    | D     |
| Atomic Design          | Not systematically applied (primitives in `core/ui`)    | C     |
| Modular monolith       | Yes, with coupling defects                              | B−    |

---

## 2. React Best Practices Review

### Strengths

- React 19 + `StrictMode` in `main.tsx`
- Route-level code splitting via `lazy()`
- No `dangerouslySetInnerHTML` in codebase
- Components generally **under 200 lines** (largest UI: `TourismCalendarPicker.tsx` ~190 lines)
- Sensible use of `useMemo` / `useCallback` in scoring and compare paths (~25 files)

### Violations

#### HIGH — Ref-sync via excessive `useEffect` (`useHomeSearch.ts`)

**File:** `client/src/features/home/hooks/useHomeSearch.ts`

~13 `useEffect` blocks exist primarily to mirror state into refs for a keydown listener.

**Why wrong:** This is a known anti-pattern; refs should be updated during render (`ref.current = value`) or encapsulated in one `useLatestRef` helper with a single listener effect.

**Risks:** Hard to reason about ordering; unnecessary commit phases; harder testing.

#### HIGH — Imperative DOM queries from hooks

**Files:** `useHomeSearch.ts`, `useTourismSearch.ts`, `useHomePageState.ts`

Uses `document.querySelector('[data-country-code="..."]')` for scroll-into-view.

**Risks:** Breaks SSR/RSC paths; fragile if markup changes; not colocated with list virtualization refs.

**Fix:** Pass `ref` map from list component or use `scrollIntoView` via callback refs.

#### HIGH — No Error Boundaries

Grep: zero `ErrorBoundary` / `componentDidCatch` in client.

**Risks:** Any render throw in a feature route kills the entire app tree.

#### MEDIUM — `useCompareView` mixes concerns

Single hook owns: URL parsing, budget matching, weight panels, clipboard, resize listeners, mobile params sheet.

**Violates:** SRP, testability, React concurrent safety (large effect surface).

#### MEDIUM — Portal usage without guaranteed focus management audit

`CountryDetailPanel.tsx` uses `createPortal` for mobile sheet; focus trap exists in `core/hooks/useFocusTrap.ts` but not verified on all overlays.

#### LOW — Default export naming mismatch

`HomeView.tsx` default export function named `App()` while router treats it as home page — onboarding friction.

### Memoization

Memo usage is **sparse but not systematically wrong**. No evidence of blanket `React.memo` abuse. Larger risk is **unnecessary re-renders from fat hook return objects** passed deep into compare/tourism trees without stable references.

---

## 3. SOLID Principles Review

### Single Responsibility Principle — **Fail (multiple sites)**

| Module                                 | Violation                                              |
| -------------------------------------- | ------------------------------------------------------ |
| `useCompareView.ts`                    | URL + 3 foreign domains + layout DOM + clipboard       |
| `useTourismWeightState.ts` (260 lines) | State + persistence + sanitization + derived defaults  |
| `budget.store.ts` (250 lines)          | Store + sanitizers + re-exports of constants/types     |
| `tourism-scoring.utils.ts` (446 lines) | Scoring engine + weight logic + tourism-specific rules |

**Long-term impact:** Changes to budget prefs force compare hook retests; tourism weight migration requires touching hook internals.

### Open/Closed Principle — **Fail**

Adding a compare mode requires editing `COMPARE_MODES`, `useCompareView`, router-adjacent utils, and multiple UI branches — no plugin/registry abstraction.

### Liskov Substitution Principle — **Partial fail**

UI props typed as `typeof useBudgetState` / `typeof useWeightState` (`budget/types/budget.types.ts`, compare components).

**Risk:** Hook signature changes silently break component contracts; cannot mock/substitute in tests cleanly.

**Fix:** Explicit `BudgetStateViewModel` / `WeightStateViewModel` interfaces.

### Interface Segregation Principle — **Fail**

Fat hook returns (e.g. `useCompareView`, `useNomadVisasState`) force consumers to depend on entire surface.

### Dependency Inversion Principle — **Fail**

Features depend on **concrete** hooks from other features (`@features/budget/hooks`, `@features/country-ranking/hooks`) instead of core abstractions or injected services.

---

## 4. GRASP Principles Review

| Principle                | Assessment                                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| **Information Expert**   | Scoring utils correctly own ranking math; ** violated** when compare hook owns budget/tourism orchestration |
| **Creator**              | Country store correctly creates fetch lifecycle; budget store correctly owns preference creation            |
| **Controller**           | `useCompareView` is an overloaded controller — should delegate to mode strategies                           |
| **Low Coupling**         | **Poor** across compare/ranking/nomad-visas triangle                                                        |
| **High Cohesion**        | **Good** within individual utils; **poor** in orchestration hooks                                           |
| **Polymorphism**         | Compare modes are string switches, not polymorphic strategies                                               |
| **Pure Fabrication**     | `createAppStore`, URL utils — appropriate                                                                   |
| **Indirection**          | Selectors in `country.selectors.ts` — good; missing for other domains                                       |
| **Protected Variations** | URL schema changes will ripple across compare + nomad visa URL utils                                        |

---

## 5. State Management Review

### Inventory

| State              | Mechanism                                    | Persistence  | Grade  |
| ------------------ | -------------------------------------------- | ------------ | ------ |
| Countries cache    | Zustand (`country.store.ts`) + deduped fetch | Session      | **A−** |
| Budget preferences | Zustand (`budget.store.ts`) + versioned JSON | localStorage | **A−** |
| Ranking weights    | `useWeightState` + 3× `useEffect`            | localStorage | **C**  |
| Tourism weights    | `useTourismWeightState` + 5× `useEffect`     | localStorage | **C−** |
| Compare UI         | Local `useState` + URL (`useSearchParams`)   | URL          | **B**  |
| Nomad visa table   | `useNomadVisasState`                         | URL + local  | **B−** |

### Issues

#### HIGH — Inconsistent persistence architecture

Budget uses versioned storage utilities + Zustand; ranking/tourism duplicate persistence logic in hooks.

**Risks:** Migration bugs, divergent sanitization, untestable side effects.

**Recommendation:** Promote `useWeightState` / `useTourismWeightState` to Zustand stores mirroring `budget.store.ts` pattern (as `ARCHITECTURE_CONCEPT.md` already specifies).

#### MEDIUM — No server-state library

No TanStack Query / SWR. Acceptable for static `countries.json`, ** inadequate** if API becomes live/partial.

**Risks:** Manual cache invalidation, no stale-while-revalidate, no retry/backoff in `http.ts`.

#### MEDIUM — Derived state recomputed broadly

`useBudgetMatcher`, `useScoring`, tourism scoring recompute on full country arrays per hook consumer.

**Risks:** CPU cost grows with feature count × country count (216 countries today — fine; not fine with live filtering).

#### LOW — Module-level mutable `inFlightCountriesRequest`

`country.store.ts:16` — works for dedup but is hidden global mutable state outside Zustand.

---

## 6. Component Communication Review

### Patterns observed

| Pattern                        | Usage                         | Verdict                                            |
| ------------------------------ | ----------------------------- | -------------------------------------------------- |
| Props down                     | Primary for presentational UI | Good                                               |
| Callbacks up                   | Panel close, selection        | Good                                               |
| URL as shared state            | Compare, nomad visas          | Good for shareable links                           |
| Cross-feature hook composition | Compare, home, nomad visas    | **Fragile**                                        |
| Context                        | **None**                      | OK today; may need bounded contexts for theme/a11y |

### Fragile patterns

1. **Compare imports foreign feature hooks** — implicit contract that budget/tourism/ranking APIs stay stable.
2. **`CountryDetailPanel` embeds `NomadVisaDetails` from nomad-visas feature** — ranking UI coupled to visa UI module.
3. **Hook return objects as prop types** — tight coupling between hook implementation and component API.

### Recommendation

Introduce **core view-model interfaces** and **feature-facing public APIs** (narrow exports from `features/<x>/public.ts`), enforce via ESLint boundaries on `@features/*/*/**` (already partially done).

---

## 7. TypeScript Review

### Strengths (best area of the codebase)

`tsconfig.app.json` enables:

- `strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`
- `noPropertyAccessFromIndexSignature`, `verbatimModuleSyntax`
- ESLint: `strictTypeChecked`, `no-explicit-any`, full `no-unsafe-*` suite

**Zero `any` in TS/TSX** (verified).

### Weaknesses

| Issue                                | Severity | Location                                                            |
| ------------------------------------ | -------- | ------------------------------------------------------------------- |
| Hook return types as component props | Medium   | `budget/types/budget.types.ts`, compare UI                          |
| Duplicate `SearchMode` type          | Low      | `home/models/search.models.ts` vs `tourism/models/search.models.ts` |
| `getJson<T>` trusts JSON shape       | High     | `core/api/http.ts` — no runtime schema (zod/valibot)                |
| Incomplete models barrel             | Low      | `core/models/index.ts` re-exports only `country.models`             |
| Global `window.__NOMAD_LENS_DATA__`  | Medium   | `country.api.ts` — untyped injection path for prod embed            |

### Refactoring safety

Types are **strong for internal refactors within a feature**, but **weak at feature boundaries** due to cyclic imports and hook-coupled props.

---

## 8. Performance Review

### Strengths

- Route-level lazy loading (13 routes)
- Pure scoring/utils functions (testable, memo-friendly)
- Country fetch deduplication

### Risks

| Risk                                               | Severity | Detail                                                                |
| -------------------------------------------------- | -------- | --------------------------------------------------------------------- |
| Full country array in memory on every route        | Medium   | 216 countries × rich nested objects — OK now                          |
| `react-simple-maps` + TopoJSON bundle              | Medium   | Map route pulls heavy geo deps; only partially isolated by lazy route |
| No list virtualization                             | Medium   | Home/tourism/nomad visa tables render full lists                      |
| `useCountries()` mounted on 8+ entry points        | Low      | Store dedupes fetch; still redundant subscriptions                    |
| Compare hook recomputes matchers on any dep change | Medium   | Budget + tourism weights together                                     |
| No Suspense boundaries below route level           | Low      | Feature data loads block entire route fallback only                   |

### Bundle / loading

`vite.config.ts` has no manual chunk strategy beyond lazy routes. Consider splitting `react-simple-maps`, `topojson-client`, and large feature utils into dedicated chunks.

---

## 9. Testing Review

### Current state

| Layer         | Coverage                                                                          |
| ------------- | --------------------------------------------------------------------------------- |
| Unit (Vitest) | **4 files** in `client/tests/`: scoring, compare URL, budget prefs, storage       |
| Component     | **None** (`@testing-library/react` not in client deps; ESLint rules reference it) |
| Integration   | **None** in client                                                                |
| E2E           | Playwright at monorepo root (`test:e2e` on main CI)                               |

### Critical gaps

- **No tests** for Zustand stores (`country.store`, `budget.store`)
- **No tests** for hooks with localStorage side effects (`useWeightState`, `useTourismWeightState`)
- **No tests** for compare orchestration (`useCompareView`)
- **No a11y regression tests** despite jsx-a11y strict ESLint

### CI quality

`quality:pr` runs format, strict lint, typecheck, unit tests, build — **strong gate**.  
Client unit tests are **too thin** to catch architectural regressions.

**Flaky risk:** E2E only on main push; PRs lack E2E blocking.

---

## 10. Security & Stability Review

| Area                    | Finding                                                                                | Severity |
| ----------------------- | -------------------------------------------------------------------------------------- | -------- |
| XSS                     | No `dangerouslySetInnerHTML`                                                           | Low risk |
| HTML injection via i18n | Strings from static JSON — low risk if translations stay trusted                       | Low      |
| Secrets in client       | `eslint-plugin-no-secrets` enabled                                                     | Good     |
| Env handling            | `VITE_API_URL` only; no secrets in client bundle observed                              | Good     |
| Fetch trust             | `response.json() as T` — no runtime validation                                         | **High** |
| Error resilience        | No Error Boundaries                                                                    | **High** |
| Retry / offline         | Fetch fails hard; country store sets error string only                                 | Medium   |
| Global injection        | `window.__NOMAD_LENS_DATA__` — supply-chain / template injection if server compromised | Medium   |
| Dependency hygiene      | React 19, modern router; `prop-types` still pulled for `react-simple-maps`             | Low      |

---

## 11. Open Source & Enterprise Standards

### Positive signals

- Conventional Commits + commitlint in CI
- Comprehensive ESLint (unicorn, sonarjs, boundaries, security, promise)
- Architecture docs exist (`ARCHITECTURE.md`, migration guides)
- React Doctor informational CI job
- Monorepo quality scripts (`quality:pr`, `quality:main`)

### Deficiencies for OSS reference grade

| Gap                                                                  | Impact                           |
| -------------------------------------------------------------------- | -------------------------------- |
| README tech stack outdated (React 18, Headless UI)                   | Contributor confusion            |
| Architecture docs contradict code (barrels, aliases, planned stores) | Trust erosion                    |
| No `CONTRIBUTING.md` architecture onboarding checklist               | Slow PR review                   |
| Client test surface negligible                                       | Regressions slip through         |
| No public API / feature boundary guide beyond partial ESLint         | Cross-feature coupling continues |
| `@app/*` documented but missing                                      | Broken mental model              |

---

## Detailed Findings

### Critical

#### C-1 — Feature dependency cycles

- **Severity:** Critical
- **Files:**
  - `client/src/features/country-ranking/ui/CountryDetailPanel.tsx`
  - `client/src/features/nomad-visas/hooks/useNomadVisasState.ts`
  - `client/src/features/nomad-visas/ui/NomadVisaCompareView.tsx`
  - `client/src/features/compare/hooks/useCompareView.ts`
- **Explanation:** Bidirectional imports between ranking, nomad-visas, and compare.
- **Risks:** Refactor paralysis, bundler cycles, unpredictable HMR.
- **Long-term:** Cannot extract features into packages or micro-frontends.
- **Fix:** Move shared visa UI + ranking DTOs to `core/`; compare depends on core interfaces; ban feature↔feature UI imports via ESLint (currently only deep path banned, not all cross-feature).

---

#### C-2 — No Error Boundaries

- **Severity:** Critical
- **Files:** `client/src/app/main.tsx`, all feature routes
- **Explanation:** Uncaught render errors crash entire SPA.
- **Risks:** Production white screen; no graceful degradation.
- **Fix:** Add `AppErrorBoundary` at router level + route-level boundaries for map/compare.

---

### High

#### H-1 — Compare orchestration god hook

- **Severity:** High
- **File:** `client/src/features/compare/hooks/useCompareView.ts`
- **Fix:** Strategy registry per compare mode; split URL state; colocate mode hooks under `compare/modes/`.

#### H-2 — State persistence fragmentation

- **Severity:** High
- **Files:** `useWeightState.ts`, `useTourismWeightState.ts` vs `budget.store.ts`
- **Fix:** Unified Zustand + versioned persist middleware pattern.

#### H-3 — API responses without runtime validation

- **Severity:** High
- **Files:** `client/src/core/api/http.ts`, `country.api.ts`
- **Fix:** Add zod/valibot schemas for `CountryData[]`; fail closed in store.

#### H-4 — Documentation drift undermines governance

- **Severity:** High
- **Files:** `docs/ARCHITECTURE.md`, `README.md`, `docs/ARCHITECTURE_CONCEPT.md`
- **Fix:** Single architecture ADR synced to CI lint rules; delete or mark unimplemented concept doc sections.

#### H-5 — Testing gap vs CI strictness mismatch

- **Severity:** High
- **Files:** `client/tests/*` (4 files), root `package.json` vitest
- **Fix:** Minimum coverage gates for stores, URL utils, hooks; add Testing Library to client devDeps.

---

### Medium

#### M-1 — Barrel export policy ignored

- **Severity:** Medium
- **Files:** ~59 `index.ts` barrels, e.g. `features/compare/index.ts`, `core/ui/index.ts`
- **Fix:** Collapse to explicit public entry points; enable `boundaries` on barrel re-export depth.

#### M-2 — `useHomeSearch` ref-sync effect explosion

- **Severity:** Medium
- **File:** `client/src/features/home/hooks/useHomeSearch.ts`
- **Fix:** `useLatestRef` helper; single keyboard listener effect.

#### M-3 — DOM `querySelector` scroll coupling

- **Severity:** Medium
- **Files:** `useHomeSearch.ts`, `useTourismSearch.ts`
- **Fix:** Ref-based scroll API from list parent.

#### M-4 — Hook return types as component contracts

- **Severity:** Medium
- **Files:** `budget/types/budget.types.ts`, compare components
- **Fix:** Explicit view-model interfaces.

#### M-5 — Compare utils barrel self-import

- **Severity:** Medium
- **File:** `compare-url-state.utils.ts:1-5`
- **Fix:** Direct sibling imports.

#### M-6 — No route-level data prefetch / shared loader

- **Severity:** Medium
- **Files:** `useCountries.ts` called from 8+ features
- **Fix:** Router loader or single bootstrap in layout once countries required.

#### M-7 — Map/geo bundle weight

- **Severity:** Medium
- **Files:** `country-map` feature, `react-simple-maps`
- **Fix:** Dynamic import topojson; preload on hover only.

---

### Low

#### L-1 — Duplicate `SearchMode` type

- **Files:** `home/models/search.models.ts`, `tourism/models/search.models.ts`
- **Fix:** Move to `core/models`.

#### L-2 — `HomeView` default export named `App`

- **File:** `client/src/features/home/ui/HomeView.tsx`
- **Fix:** Rename to `HomeView`.

#### L-3 — Single eslint-disable for unused vars

- **File:** `TourismWeightPanel.tsx:40`
- **Fix:** Remove dead code instead of suppressing.

#### L-4 — Module-level fetch promise cache outside store

- **File:** `country.store.ts:16`
- **Fix:** Move into store middleware or private module with tests.

---

## Architecture Improvement Plan

### P0 — Quick wins (1–2 sprints)

1. **Break compare ↔ ranking ↔ nomad-visas cycle** — extract `NomadVisaDetails` presentation to `core/ui/visa`; ranking panel imports core only.
2. **Add `AppErrorBoundary` + route error UI** at `AppRouter` level.
3. **Fix compare barrel self-import** — direct file imports in `compare-url-state.utils.ts`.
4. **Sync docs** — update README (React 19), remove `@app/*` or add alias, mark barrel policy as enforced or delete rule.
5. **Add runtime schema** for `CountryData` at API boundary.

### P1 — Structural (1–2 quarters)

1. **Migrate `useWeightState` / `useTourismWeightState` to Zustand** with versioned persist (mirror budget store).
2. **Refactor `useCompareView`** into mode strategy modules + slim coordinator.
3. **Introduce feature public APIs** (`features/<x>/public.ts`) — ESLint allow cross-feature only from `public.ts`.
4. **Expand test pyramid** — stores, URL state, hook persistence, 5–10 RTL smoke tests for critical routes.
5. **Replace hook-return prop types** with explicit interfaces.

### P2 — Long-term scaling

1. **Optional TanStack Query** when API live data expands beyond static JSON.
2. **Virtualized lists** for home/tourism/nomad tables.
3. **Route loaders / React Router data APIs** for countries bootstrap.
4. **Feature package extraction** (ranking engine, visa comparison) once cycles removed.
5. **ADR process** — architecture decisions recorded; CI check that `ARCHITECTURE.md` links match eslint boundary config.

---

## Strict Closing Assessment

Nomad Lens client code shows **Senior-level tooling choices and partial feature-sliced maturity**, but **fails Staff/Principal bar** on:

- **Module graph hygiene** (cycles)
- **State consistency**
- **Test depth proportional to complexity**
- **Operational resilience** (error boundaries, validated IO)
- **Documentation truthfulness**

Treat current architecture as **"good product codebase, not yet platform-grade."**  
Ship features today — **do not** advertise this as an enterprise reference implementation until P0/P1 items close.

---

_Generated by enterprise architecture review — 2026-05-31_

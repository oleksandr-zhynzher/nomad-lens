# Nomad Lens Full Regression Test Scenarios

Date: 2026-04-09

Document type: Manual regression checklist

Primary goal: cover the full product during a complete regression sweep, including common flows, edge cases, corner cases, and data-driven failure behavior.

## Scope

This checklist covers:

- Client routes and navigation
- Language-prefixed routing for English, Ukrainian, and Russian
- Ranking, comparison, map, nomad visa, and budget workflows
- Shared state carried in localStorage, query params, and share links
- Backend runtime routes and client data fallback behavior
- Data quality cases that can change what users see in the UI

This checklist does not cover:

- AWS/CDK deployment validation
- Load or performance testing
- Security penetration testing beyond basic runtime sanity
- Third-party provider uptime except where a failure is visible in the app

## Source Of Truth Notes

- Actual client routes come from the router implementation, not from older design briefs.
- The live budget route is `/budget-matcher`, not `/budget`.
- Supported language prefixes are `/ua` and `/ru`; English is the default route with no language prefix.
- Invalid language prefixes should redirect to `/`.

## Execution Guidance

- Run the checklist with browser devtools open and watch both console and network tabs.
- Clear localStorage before scenarios that require a fresh session.
- Re-run critical scenarios in English, Ukrainian, and Russian where localization can affect content or layout.
- Use a real mobile device or an external Playwright runner for true narrow mobile validation. The integrated browser used in earlier QA was effectively fixed around tablet width.
- When a scenario mentions a data bucket instead of a hardcoded country, choose a current example from the active dataset at execution time.

## Recommended Test Data Buckets

Prepare at least one example for each bucket before executing the full pack:

- A country with a nomad visa
- A country without a nomad visa
- A Schengen country
- A non-Schengen country
- A country with translated visa content in Ukrainian or Russian
- A country where visa fields fall back to English
- Two valid countries for compare mode
- Two valid nomad-visa countries for dedicated visa compare
- One invalid country code such as `ZZ`
- One duplicate compare input such as `DE,DE`
- One mixed-case compare input such as `de, Es`
- One country that is excluded from budget results because of missing cost data, if present in the dataset
- One country with sparse or null score fields, if present in the dataset

## Severity Legend

- `P0`: release-blocking if failed
- `P1`: high severity, should be fixed before release if reproducible
- `P2`: medium severity, can be triaged if isolated and non-blocking

## Test Case Format

Each case includes:

- Priority
- Type: Common, Edge, Corner, Failure, or Regression
- Preconditions
- Steps
- Expected result

## 1. Smoke Regression Pack

### SMK-001 Home Route Smoke

- Priority: `P0`
- Type: `Common`
- Preconditions: app is running with usable country data
- Steps:
  1. Open `/`.
  2. Wait for the first meaningful paint and data load.
- Expected result:
  1. Header, hero, search area, weight panel, and country list render.
  2. No blank screen, uncaught runtime exception, or broken layout appears.
  3. The country count and hero stats populate with real values.

### SMK-002 Localized Home Route Smoke

- Priority: `P0`
- Type: `Common`
- Preconditions: app is running
- Steps:
  1. Open `/ua/`.
  2. Open `/ru/`.
- Expected result:
  1. Both routes load without redirects or runtime errors.
  2. Navigation and page copy appear in the requested language.
  3. No untranslated raw keys are visible in the primary UI shell.

### SMK-003 Map Route Smoke

- Priority: `P0`
- Type: `Common`
- Preconditions: app is running
- Steps:
  1. Open `/map`.
- Expected result:
  1. World map renders.
  2. Header remains usable.
  3. No console or page errors are emitted.

### SMK-004 Compare Route Smoke

- Priority: `P0`
- Type: `Common`
- Preconditions: app is running
- Steps:
  1. Open `/compare`.
  2. Open `/compare?c=<two-valid-country-codes>`.
- Expected result:
  1. The empty compare state loads correctly when no countries are provided.
  2. The comparison layout loads correctly when valid countries are provided.
  3. No duplicate-column or routing errors appear.

### SMK-005 Country Detail Smoke

- Priority: `P0`
- Type: `Common`
- Preconditions: choose one valid country code
- Steps:
  1. Open `/country/<valid-country-code>`.
- Expected result:
  1. Country hero, score summary, and detail sections render.
  2. No page crash occurs while loading or after data resolves.

### SMK-006 Invalid Country Route Smoke

- Priority: `P0`
- Type: `Edge`
- Preconditions: app is running
- Steps:
  1. Open `/country/zz`.
- Expected result:
  1. A safe not-found or fallback state appears.
  2. A path back to the main country list is available.
  3. No runtime exception is thrown.

### SMK-007 Nomad Visas Route Smoke

- Priority: `P0`
- Type: `Common`
- Preconditions: app is running
- Steps:
  1. Open `/nomad-visas`.
- Expected result:
  1. Hero stats and visa table render.
  2. Sorting/search controls are visible.
  3. No page errors appear.

### SMK-008 Dedicated Nomad Visa Compare Smoke

- Priority: `P0`
- Type: `Common`
- Preconditions: choose two valid countries with nomad visas
- Steps:
  1. Open `/nomad-visas/compare`.
  2. Open `/nomad-visas/compare?c=<two-valid-visa-country-codes>`.
- Expected result:
  1. The empty guidance state appears when no valid selection exists.
  2. The side-by-side comparison layout appears when two valid countries exist.
  3. No duplicate-key or sanitization errors appear.

### SMK-009 Budget Matcher Smoke

- Priority: `P0`
- Type: `Common`
- Preconditions: app is running
- Steps:
  1. Open `/budget-matcher`.
- Expected result:
  1. Budget filters, hero, and result cards render.
  2. Results are data-driven, not empty by default unless the dataset is empty.
  3. No runtime error or layout collapse appears.

### SMK-010 Static Information Routes Smoke

- Priority: `P0`
- Type: `Common`
- Preconditions: app is running
- Steps:
  1. Open `/data-sources`.
  2. Open `/indicators`.
  3. Open `/ai-indicators`.
  4. Open `/budget-categories`.
- Expected result:
  1. Every route loads without a blank page.
  2. Hero sections and cards render correctly.
  3. No translation-key leakage or layout break occurs.

### SMK-011 Health Endpoint Smoke

- Priority: `P0`
- Type: `Common`
- Preconditions: backend is running
- Steps:
  1. Call `GET /api/health`.
- Expected result:
  1. Response status is `200`.
  2. JSON contains `status: ok` and a timestamp.

### SMK-012 Countries Endpoint Smoke

- Priority: `P0`
- Type: `Common`
- Preconditions: backend is running
- Steps:
  1. Call `GET /api/countries`.
- Expected result:
  1. Response status is `200`.
  2. JSON returns a non-empty country array.
  3. The payload is parseable by the client with no schema-breaking fields missing.

## 2. Routing, Layout, And Shell

### NAV-001 Header Navigation Works Across Major Views

- Priority: `P0`
- Type: `Common`
- Preconditions: desktop viewport
- Steps:
  1. Use the header to move between list, map, compare, nomad visas, and budget matcher.
- Expected result:
  1. Every destination route loads correctly.
  2. Language prefix is preserved when already on `/ua` or `/ru`.
  3. Header stays interactive after each transition.

### NAV-002 Active Navigation State Is Correct

- Priority: `P1`
- Type: `Common`
- Preconditions: desktop viewport
- Steps:
  1. Open each major route from the header.
  2. Observe active-state styling in the navigation.
- Expected result:
  1. The active button or link matches the current route.
  2. Info pages do not incorrectly mark list, map, or compare as active.

### NAV-003 Logo Navigation Returns To The List Route

- Priority: `P1`
- Type: `Common`
- Preconditions: any route other than list
- Steps:
  1. Click the logo mark or wordmark.
- Expected result:
  1. The app navigates to the home list route for the active language.
  2. No stale modal, overlay, or broken focus state remains.

### NAV-004 Mobile Menu Opens, Closes, And Restores Scroll

- Priority: `P1`
- Type: `Edge`
- Preconditions: true mobile or narrow viewport test environment
- Steps:
  1. Open the mobile menu.
  2. Close it with the close icon.
  3. Re-open it and navigate to another route.
- Expected result:
  1. The menu opens above page content.
  2. Background scrolling is locked while the menu is open.
  3. Body scroll is restored after close or navigation.

### NAV-005 Language Dropdown Opens And Closes Correctly

- Priority: `P1`
- Type: `Common`
- Preconditions: desktop viewport
- Steps:
  1. Open the language dropdown.
  2. Click outside the dropdown.
  3. Open it again and select another language.
- Expected result:
  1. Dropdown visibility toggles correctly.
  2. Outside click closes it.
  3. Switching language does not leave the dropdown stuck open.

### NAV-006 Language Switch Preserves Path And Query

- Priority: `P0`
- Type: `Edge`
- Preconditions: open a route with query params, for example compare or budget matcher
- Steps:
  1. Open a route such as `/compare?m=budget&c=DE,ES` or `/budget-matcher?budget=3750&quality=65`.
  2. Switch between English, Ukrainian, and Russian.
- Expected result:
  1. The language prefix changes.
  2. The path and query params are preserved.
  3. The resulting route stays valid and renders the same logical state.

### NAV-007 Invalid Language Segment Redirects Safely

- Priority: `P0`
- Type: `Edge`
- Preconditions: app is running
- Steps:
  1. Open `/de/`, `/xx/map`, and another unsupported language path.
- Expected result:
  1. The app redirects to `/`.
  2. No infinite redirect loop occurs.
  3. No broken translation state persists after the redirect.

### NAV-008 Browser Back And Forward Preserve History State

- Priority: `P1`
- Type: `Common`
- Preconditions: navigate across at least three pages with query changes
- Steps:
  1. Move across list, compare, budget, and country detail pages.
  2. Use browser back and forward.
- Expected result:
  1. The correct route and query state are restored.
  2. The app does not strand the user on a blank or inconsistent page.

## 3. Home Ranking, Search, Filters, And Compare

### HOME-001 Loading State Resolves Into Ranked Results

- Priority: `P0`
- Type: `Common`
- Preconditions: clear cache or use a fresh session
- Steps:
  1. Open `/`.
  2. Observe the page before and after data load.
- Expected result:
  1. The page shows a valid loading path.
  2. Ranked countries appear after data load.
  3. The page does not flicker into an error state when data succeeds.

### HOME-002 Error State And Retry Recovery

- Priority: `P0`
- Type: `Failure`
- Preconditions: force `useCountries` to fail by blocking the configured data source in the chosen environment
- Steps:
  1. Open `/` while the data source is unavailable.
  2. Trigger the retry action after restoring the data source.
- Expected result:
  1. A safe error state appears.
  2. The page does not hard crash.
  3. Retry reloads the country list successfully once the data source is healthy.

### HOME-003 Search Filter By Localized Country Name

- Priority: `P0`
- Type: `Common`
- Preconditions: dataset loaded
- Steps:
  1. Search for a known country name in English.
  2. Repeat in Ukrainian and Russian for localized names.
- Expected result:
  1. Matching countries remain visible.
  2. Non-matching countries are filtered out in filter mode.
  3. Search is evaluated against the localized display name.

### HOME-004 Search Filter By ISO Code And Input Normalization

- Priority: `P1`
- Type: `Edge`
- Preconditions: dataset loaded
- Steps:
  1. Search with uppercase, lowercase, and trimmed ISO codes.
  2. Search with leading and trailing whitespace.
- Expected result:
  1. Matching countries are found regardless of input case.
  2. Whitespace does not prevent a valid match.

### HOME-005 No-Result Search State

- Priority: `P1`
- Type: `Edge`
- Preconditions: dataset loaded
- Steps:
  1. Search for a string that cannot match any country name or code.
- Expected result:
  1. The page renders a clear no-result state.
  2. No stale cards remain visible.
  3. Clearing the query restores normal results.

### HOME-006 Highlight Search Mode Navigation

- Priority: `P1`
- Type: `Common`
- Preconditions: search returns multiple matches
- Steps:
  1. Switch search mode to highlight.
  2. Use next and previous controls.
- Expected result:
  1. The active match changes cyclically.
  2. The current match scrolls into view.
  3. Only one active highlight is shown at a time.

### HOME-007 Keyboard Navigation Without Search

- Priority: `P1`
- Type: `Edge`
- Preconditions: no active search query
- Steps:
  1. Use `ArrowDown` and `ArrowUp`.
  2. Continue beyond the first and last visible items.
- Expected result:
  1. Navigation cycles through the full ranked list.
  2. Wrapping behavior works at both ends.
  3. The page scroll follows the active item.

### HOME-008 Enter Key Expands Or Collapses The Active Card

- Priority: `P1`
- Type: `Edge`
- Preconditions: a card is highlighted by keyboard or highlight mode
- Steps:
  1. Press `Enter` once.
  2. Press `Enter` again.
- Expected result:
  1. The target card expands on first press.
  2. The same card collapses on second press.
  3. No unrelated cards are toggled.

### HOME-009 Compare Mode Selection Workflow

- Priority: `P0`
- Type: `Common`
- Preconditions: dataset loaded
- Steps:
  1. Enter compare mode.
  2. Select multiple countries.
  3. Deselect one country.
  4. Exit compare mode.
- Expected result:
  1. Selection state is visible and accurate.
  2. Deselecting removes only the chosen country.
  3. Exiting compare mode clears the selection set.

### HOME-010 Compare CTA Requires Two Or More Countries

- Priority: `P0`
- Type: `Edge`
- Preconditions: compare mode is active
- Steps:
  1. Select zero countries.
  2. Select one country.
  3. Select two or more countries and continue.
- Expected result:
  1. Compare navigation is blocked until at least two countries are selected.
  2. Once valid, the route opens `/compare?c=...` with the selected codes.

### HOME-011 Weight Changes Affect Ranking

- Priority: `P0`
- Type: `Common`
- Preconditions: dataset loaded
- Steps:
  1. Change one or more category weights.
  2. Observe ranking order and displayed scores.
  3. Reset to defaults.
- Expected result:
  1. Ranking changes when weight changes are meaningful.
  2. Reset restores the default score model.
  3. No `NaN`, broken labels, or stale sort order appears.

### HOME-012 Weight Mode Change And Redistribution Rules

- Priority: `P1`
- Type: `Corner`
- Preconditions: dataset loaded
- Steps:
  1. Switch between independent and non-independent weight mode.
  2. Change a category weight in each mode.
- Expected result:
  1. Independent mode allows direct per-category changes.
  2. Redistribution mode updates the model according to app rules.
  3. Reset returns the correct defaults for the active mode.

### HOME-013 Filter Combinations

- Priority: `P0`
- Type: `Common`
- Preconditions: dataset loaded
- Steps:
  1. Test each filter alone: region, nomad visa only, Schengen only, minimum tourist days, climate preferences.
  2. Test a combined filter set.
  3. Clear filters.
- Expected result:
  1. Each filter narrows or reranks results according to the underlying data.
  2. Combined filters do not create invalid UI states.
  3. Clearing filters restores the broader dataset.

### HOME-014 Share Link Reproduces Current Home State

- Priority: `P0`
- Type: `Common`
- Preconditions: weights or filters differ from defaults
- Steps:
  1. Use the share action.
  2. Open the copied URL in a fresh tab.
- Expected result:
  1. The copied link includes current weights and filters.
  2. The opened route reproduces the same state.
  3. Query params are normalized and readable.

### HOME-015 localStorage Persistence And Corruption Recovery

- Priority: `P0`
- Type: `Failure`
- Preconditions: access to browser storage
- Steps:
  1. Change weights and filters, then reload.
  2. Corrupt the relevant storage values manually.
  3. Reload again.
- Expected result:
  1. Valid state persists across reload.
  2. Corrupt state falls back safely to defaults.
  3. The app does not crash because of invalid localStorage payloads.

### HOME-016 Highlight Query From Map Navigation

- Priority: `P1`
- Type: `Regression`
- Preconditions: choose a valid country reachable from the map
- Steps:
  1. Open the list route with `?highlight=<country-code>`.
- Expected result:
  1. The matching card scrolls into view.
  2. Temporary highlight styling appears.
  3. The `highlight` query param is removed from the URL after consumption.

### HOME-017 Sticky Search Bar And Mobile Parameter Sheet

- Priority: `P1`
- Type: `Edge`
- Preconditions: true mobile or narrow viewport plus enough list content to scroll
- Steps:
  1. Scroll the page until the sticky state is active.
  2. Open the mobile parameters sheet.
  3. Close it via overlay, close button, and `Escape`.
  4. Use `Tab` and `Shift+Tab` inside the sheet.
- Expected result:
  1. The sticky bar remains positioned correctly below the header.
  2. The sheet traps focus while open.
  3. Closing the sheet restores body scrolling and focus behavior.

## 4. Map View

### MAP-001 Map Rendering And Basic Interaction

- Priority: `P0`
- Type: `Common`
- Preconditions: dataset loaded
- Steps:
  1. Open `/map`.
  2. Observe the rendered map before interacting.
- Expected result:
  1. The map renders without missing base layers that break usability.
  2. No page errors occur while the map initializes.

### MAP-002 Country Click Navigates Back To The Ranked List

- Priority: `P0`
- Type: `Common`
- Preconditions: choose a visible clickable country shape
- Steps:
  1. Click a country on the map.
- Expected result:
  1. The app navigates to the list route for the active language.
  2. The resulting route includes `?highlight=<country-code>`.
  3. The target country is highlighted in the list after navigation.

### MAP-003 Weight Panel Toggle On Map

- Priority: `P1`
- Type: `Common`
- Preconditions: desktop or large tablet viewport
- Steps:
  1. Toggle the map weight panel on and off.
  2. Change one or more weights or filters while it is open.
- Expected result:
  1. The panel appears and disappears without layout corruption.
  2. Map-driven scoring responds to the changed criteria.

### MAP-004 Non-Matching Or Non-Interactive Areas Do Not Crash

- Priority: `P1`
- Type: `Edge`
- Preconditions: map is loaded
- Steps:
  1. Click ocean or blank regions if possible.
  2. Click a tiny country multiple times.
- Expected result:
  1. Non-country clicks do not crash the page.
  2. Repeated clicks do not create duplicate navigation events or console noise.

### MAP-005 Localized Map Route

- Priority: `P1`
- Type: `Common`
- Preconditions: app is running
- Steps:
  1. Open `/ua/map` and `/ru/map`.
- Expected result:
  1. The route loads in the correct language shell.
  2. Clicking a country navigates back to the localized list route.

## 5. Compare Page

### CMP-001 Empty Compare State

- Priority: `P0`
- Type: `Common`
- Preconditions: none
- Steps:
  1. Open `/compare` with no `c` query param.
- Expected result:
  1. The page renders an instructional or empty state.
  2. The user is not presented with broken comparison columns.

### CMP-002 Compare Query Sanitization

- Priority: `P0`
- Type: `Regression`
- Preconditions: choose valid and invalid country code combinations
- Steps:
  1. Open `/compare?c=de, ES ,DE,ZZ`.
- Expected result:
  1. Codes are trimmed, uppercased, deduplicated, and validated.
  2. The URL is normalized after load.
  3. Only valid unique countries render.

### CMP-003 Countries Mode With Valid Selection

- Priority: `P0`
- Type: `Common`
- Preconditions: at least two valid countries selected
- Steps:
  1. Open `/compare?c=<two-or-more-valid-codes>`.
- Expected result:
  1. Side-by-side country columns render.
  2. Indicator values align under the correct headings.
  3. No duplicate columns appear.

### CMP-004 Sort By Score Toggle

- Priority: `P1`
- Type: `Common`
- Preconditions: valid country comparison loaded
- Steps:
  1. Use the sort action repeatedly.
- Expected result:
  1. Sort direction toggles between descending and ascending.
  2. Visible feedback reflects the change.
  3. Sorting does not drop or duplicate columns.

### CMP-005 Mode Switching Updates URL And Page State

- Priority: `P0`
- Type: `Common`
- Preconditions: compare page loaded
- Steps:
  1. Switch among Countries, Regions, Nomad Visas, and Budget modes.
- Expected result:
  1. The `m` query param updates correctly.
  2. Page title, subtitle, and content switch to the matching mode.
  3. Returning to Countries mode removes the `m` param.

### CMP-006 Regions Mode

- Priority: `P1`
- Type: `Common`
- Preconditions: countries dataset loaded
- Steps:
  1. Switch to Regions mode.
  2. Apply restrictive filters.
- Expected result:
  1. Countries are grouped under their regions.
  2. Group rendering remains stable even when some groups become empty or small.

### CMP-007 Nomad Visas Mode

- Priority: `P1`
- Type: `Edge`
- Preconditions: compare page with countries selected
- Steps:
  1. Switch to Nomad Visas mode.
  2. Test with a mix of countries with and without nomad visas.
- Expected result:
  1. Visa comparison content loads only for eligible countries.
  2. Supporting filters and budget panel content render correctly.
  3. The page does not break when some selected countries have no visa data.

### CMP-008 Budget Mode

- Priority: `P1`
- Type: `Common`
- Preconditions: compare page with at least two valid countries
- Steps:
  1. Switch to Budget mode.
  2. Adjust budget parameters.
- Expected result:
  1. Budget comparison columns update using current budget state.
  2. Monthly totals and breakdowns remain aligned to the right countries.

### CMP-009 Selection Changes Update The Query String

- Priority: `P1`
- Type: `Edge`
- Preconditions: compare page loaded with selected countries
- Steps:
  1. Remove all selected countries.
  2. Add them back using supported UI entry points.
- Expected result:
  1. `c` is removed when the selection becomes empty.
  2. Re-adding countries writes a normalized `c` param.

### CMP-010 Compare Share Link Reproduces Full Compare State

- Priority: `P0`
- Type: `Common`
- Preconditions: non-default compare state with mode, weights, and selection
- Steps:
  1. Use the compare share action.
  2. Open the copied URL in a fresh tab.
- Expected result:
  1. The shared URL includes selection, mode, and relevant state.
  2. The opened page matches the source page state.

### CMP-011 Compare Page Parameter Panels On Desktop And Mobile

- Priority: `P1`
- Type: `Edge`
- Preconditions: budget mode and non-budget mode tested separately
- Steps:
  1. Open parameters on mobile.
  2. Use the desktop sticky panel.
- Expected result:
  1. Panels do not overlap core comparison content unexpectedly.
  2. Open and close behavior does not trap the user in an unusable state.

## 6. Country Detail Page

### COUNTRY-001 Valid Country Detail Rendering

- Priority: `P0`
- Type: `Common`
- Preconditions: choose a valid country code
- Steps:
  1. Open `/country/<valid-country-code>`.
- Expected result:
  1. Hero, flag, localized name, region, code, rank, and score render.
  2. Score breakdown section is visible.
  3. No incomplete skeleton remains after load.

### COUNTRY-002 Invalid Country Fallback

- Priority: `P0`
- Type: `Edge`
- Preconditions: none
- Steps:
  1. Open `/country/zz`.
- Expected result:
  1. Not-found or safe fallback content appears.
  2. A link back to the country list exists.

### COUNTRY-003 Back Button Behavior

- Priority: `P1`
- Type: `Common`
- Preconditions: navigate from at least two different entry pages to a country detail page
- Steps:
  1. Use the in-page back button.
- Expected result:
  1. The user returns to the previous history entry.
  2. The originating page state is preserved when possible.

### COUNTRY-004 Score Breakdown Reflects Active Weight State

- Priority: `P1`
- Type: `Corner`
- Preconditions: compare country detail with default and changed weights/climate preferences
- Steps:
  1. Adjust weights or climate preferences.
  2. Re-open the same country detail page.
- Expected result:
  1. Rank and final score update according to active state.
  2. The breakdown remains internally consistent.

### COUNTRY-005 Nomad Visa Section For Eligible Countries

- Priority: `P1`
- Type: `Common`
- Preconditions: choose a country with `nomadVisa`
- Steps:
  1. Open the eligible country's detail page.
- Expected result:
  1. Visa name, duration, income, tax, requirements, benefits, documents, and official URL render.
  2. The section does not omit key fields silently.

### COUNTRY-006 Countries Without Nomad Visas

- Priority: `P1`
- Type: `Edge`
- Preconditions: choose a country without `nomadVisa`
- Steps:
  1. Open the country detail page.
- Expected result:
  1. Visa-only content is hidden or absent cleanly.
  2. The rest of the page remains complete.

### COUNTRY-007 Visa Localization Fallback

- Priority: `P1`
- Type: `Failure`
- Preconditions: choose a country where some visa translations are missing in `ua` or `ru`
- Steps:
  1. Open the country detail route in Ukrainian.
  2. Repeat in Russian if applicable.
- Expected result:
  1. Missing localized visa fields fall back to English.
  2. Blank values or raw translation keys are not shown.

### COUNTRY-008 External Link And Hostname Formatting

- Priority: `P2`
- Type: `Edge`
- Preconditions: choose a country with visa official URL data
- Steps:
  1. Inspect the displayed hostname or external link text.
  2. Test a malformed URL record if one exists in data fixtures.
- Expected result:
  1. Valid URLs display readable hostnames.
  2. Malformed URLs do not crash the page.

## 7. Nomad Visas List Page

### VISA-001 Visa Page Initial Rendering

- Priority: `P0`
- Type: `Common`
- Preconditions: dataset loaded
- Steps:
  1. Open `/nomad-visas`.
- Expected result:
  1. Hero stats and visa table render.
  2. Search and sort controls are visible.

### VISA-002 Search By Localized Country Name

- Priority: `P1`
- Type: `Common`
- Preconditions: dataset loaded
- Steps:
  1. Search by a known visa country in the current language.
  2. Clear the query.
- Expected result:
  1. Matching rows remain.
  2. Clearing the query restores the full table.

### VISA-003 No-Result Search State

- Priority: `P1`
- Type: `Regression`
- Preconditions: dataset loaded
- Steps:
  1. Search for a string that matches no visa country.
- Expected result:
  1. A clean no-result state appears.
  2. No stale rows remain visible.

### VISA-004 Sorting Across All Supported Columns

- Priority: `P1`
- Type: `Common`
- Preconditions: visa table loaded
- Steps:
  1. Sort by country, overall score, monthly budget, duration, cost, income, and tax.
  2. Toggle each column twice.
- Expected result:
  1. Sort direction flips correctly.
  2. Null monthly budget entries sort after valid numbers.
  3. The table remains stable with no row duplication.

### VISA-005 Highlight Query Support

- Priority: `P2`
- Type: `Edge`
- Preconditions: choose a valid visa country code
- Steps:
  1. Open `/nomad-visas?country=<valid-code>`.
- Expected result:
  1. The target row is visibly emphasized.
  2. Highlighting does not break sorting or searching.

### VISA-006 Compare Mode Workflow

- Priority: `P0`
- Type: `Common`
- Preconditions: visa page loaded
- Steps:
  1. Enter compare mode.
  2. Select and deselect rows.
  3. Exit compare mode.
- Expected result:
  1. Selection state is accurate.
  2. Exiting compare mode clears the selection set.

### VISA-007 Compare CTA Minimum Selection Rule

- Priority: `P0`
- Type: `Edge`
- Preconditions: compare mode active
- Steps:
  1. Attempt compare with zero and one selected countries.
  2. Attempt compare with two countries.
- Expected result:
  1. Compare navigation is blocked until at least two countries are selected.
  2. With two countries, navigation goes to the compare experience using the active language prefix.

### VISA-008 Country Detail And External Link Flow

- Priority: `P1`
- Type: `Common`
- Preconditions: visa table loaded
- Steps:
  1. Open a country detail page from a visa row.
  2. Open the official visa link.
- Expected result:
  1. Internal route navigation works.
  2. External links open safely without breaking the app state.

### VISA-009 Sticky Table Header And Horizontal Scroll Sync

- Priority: `P2`
- Type: `Edge`
- Preconditions: narrow viewport or content wider than viewport
- Steps:
  1. Scroll vertically and horizontally in the visa table.
- Expected result:
  1. Header remains aligned with the body columns.
  2. Sticky positioning does not cover data incorrectly.

## 8. Dedicated Nomad Visa Compare Page

### VCOMP-001 Empty Compare State

- Priority: `P0`
- Type: `Common`
- Preconditions: none
- Steps:
  1. Open `/nomad-visas/compare` with no `c` query param.
- Expected result:
  1. The page instructs the user to pick at least two countries.
  2. No broken table shell renders.

### VCOMP-002 Fewer Than Two Valid Countries

- Priority: `P0`
- Type: `Regression`
- Preconditions: none
- Steps:
  1. Open `/nomad-visas/compare?c=DE`.
  2. Open `/nomad-visas/compare?c=ZZ,DE`.
  3. Open `/nomad-visas/compare?c=DE,DE`.
- Expected result:
  1. All three cases stay in the empty guidance state.
  2. The page never renders a single-country comparison column.

### VCOMP-003 Compare Query Normalization

- Priority: `P0`
- Type: `Regression`
- Preconditions: choose valid visa-country codes
- Steps:
  1. Open `/nomad-visas/compare?c=de, ES ,DE,ZZ`.
- Expected result:
  1. Codes are normalized to unique valid uppercase values.
  2. The URL is rewritten into normalized form.

### VCOMP-004 Valid Multi-Country Comparison

- Priority: `P0`
- Type: `Common`
- Preconditions: choose at least two valid nomad-visa countries
- Steps:
  1. Open `/nomad-visas/compare?c=<valid-code-1>,<valid-code-2>`.
- Expected result:
  1. Comparison rows render for visa name, duration, cost, income, tax, benefits, and related fields.
  2. Columns stay aligned across all rows.

### VCOMP-005 Visual Integrity Of Tax Status And Long Content

- Priority: `P2`
- Type: `Edge`
- Preconditions: choose countries with different tax statuses and long text fields
- Steps:
  1. Compare countries with `exempt`, `standard`, and `special` tax categories.
  2. Inspect long requirement or note fields.
- Expected result:
  1. Tax status colors remain distinct and legible.
  2. Long content wraps or truncates without breaking the layout.

### VCOMP-006 Back Link Behavior

- Priority: `P2`
- Type: `Common`
- Preconditions: dedicated visa compare page loaded
- Steps:
  1. Use the back link.
- Expected result:
  1. The user returns to the visa list route in the active language.

## 9. Budget Matcher

### BUD-001 Budget Matcher Initial Rendering

- Priority: `P0`
- Type: `Common`
- Preconditions: dataset loaded
- Steps:
  1. Open `/budget-matcher`.
- Expected result:
  1. Default budget state is shown.
  2. Result cards are populated when the data set supports them.
  3. No layout collapse occurs while data loads.

### BUD-002 URL State Overrides Stored State On First Load

- Priority: `P0`
- Type: `Corner`
- Preconditions: pre-populate localStorage with non-default budget state
- Steps:
  1. Open `/budget-matcher` with explicit query params such as `budget`, `housing`, `bedrooms`, `people`, `quality`, and `cw`.
- Expected result:
  1. Query param state wins on initial load.
  2. Unsupported or invalid values are clamped or ignored safely.

### BUD-003 Budget Slider Boundaries

- Priority: `P0`
- Type: `Edge`
- Preconditions: budget matcher loaded
- Steps:
  1. Move the slider to the minimum and maximum values.
  2. Try to set values outside the allowed range through the URL.
- Expected result:
  1. UI respects the range `300` to `10000`.
  2. URL or storage values outside the range are clamped.

### BUD-004 Quality Blend Extremes

- Priority: `P1`
- Type: `Corner`
- Preconditions: budget matcher loaded
- Steps:
  1. Set quality blend to `0`.
  2. Set quality blend to `100`.
  3. Compare with a midpoint.
- Expected result:
  1. Ranking changes according to the cost-versus-quality balance.
  2. The UI remains stable across all three states.

### BUD-005 Bedrooms And Location Controls

- Priority: `P1`
- Type: `Common`
- Preconditions: budget matcher loaded
- Steps:
  1. Switch bedrooms among `1`, `2`, and `3`.
  2. Switch location between `majorCity` and `smallerCity` for each bedroom count.
- Expected result:
  1. Results update after each change.
  2. The location toggle remains available for all bedroom counts in the current implementation.
  3. No outdated design-brief assumption blocks the control.

### BUD-006 People Count Limits

- Priority: `P1`
- Type: `Edge`
- Preconditions: budget matcher loaded
- Steps:
  1. Reduce people count to the minimum.
  2. Increase it to the maximum.
  3. Attempt values outside the supported range through URL or storage.
- Expected result:
  1. UI enforces `1` to `20`.
  2. The minus button disables at the minimum.
  3. The plus button disables at the maximum.

### BUD-007 Category Weight Boundaries

- Priority: `P0`
- Type: `Common`
- Preconditions: budget matcher loaded
- Steps:
  1. Set each category to `0`, a middle value, and `100`.
  2. Observe total cost and ranking changes.
- Expected result:
  1. Weight values clamp to `0` through `100`.
  2. A weight of `0` effectively removes that category from the total cost contribution.
  3. Totals never display `NaN`, `Infinity`, or negative artifacts.

### BUD-008 Search And No-Result Behavior

- Priority: `P1`
- Type: `Common`
- Preconditions: budget matcher loaded
- Steps:
  1. Search by a localized country name.
  2. Search for a guaranteed-miss query.
  3. Clear the search.
- Expected result:
  1. Matching cards are filtered correctly.
  2. The empty-state copy is clear.
  3. Clearing the search restores the full match list.

### BUD-009 Expand And Collapse Result Cards

- Priority: `P2`
- Type: `Common`
- Preconditions: result cards loaded
- Steps:
  1. Expand a result card.
  2. Collapse it.
  3. Switch to another card.
- Expected result:
  1. Breakdown charts and detailed values render correctly.
  2. Expanding one card does not corrupt the rest of the list.

### BUD-010 Compare Mode Workflow

- Priority: `P0`
- Type: `Common`
- Preconditions: budget matcher loaded
- Steps:
  1. Enter compare mode.
  2. Select zero, one, and two countries.
  3. Exit compare mode.
- Expected result:
  1. Compare navigation is blocked until two countries are selected.
  2. Valid selection opens `/compare?m=budget&c=...`.
  3. Exiting compare mode clears the selection state.

### BUD-011 Share Link Reproduces Budget State

- Priority: `P0`
- Type: `Common`
- Preconditions: change at least one budget parameter from default
- Steps:
  1. Use the share action.
  2. Open the copied URL in a fresh tab.
- Expected result:
  1. The URL contains the changed budget state.
  2. The opened page reproduces the same inputs and ranking.

### BUD-012 Reset Restores Defaults

- Priority: `P1`
- Type: `Common`
- Preconditions: non-default budget state
- Steps:
  1. Press reset.
- Expected result:
  1. Budget, quality, bedrooms, people count, and category weights return to defaults.
  2. Share-success state is cleared or no longer shown as active.

### BUD-013 Budget localStorage Persistence And Recovery

- Priority: `P0`
- Type: `Failure`
- Preconditions: storage access available
- Steps:
  1. Save a non-default budget state and reload.
  2. Manually corrupt the budget storage payload and reload again.
- Expected result:
  1. Valid state persists.
  2. Corrupt state falls back safely to defaults.
  3. The page remains usable.

### BUD-014 Missing Cost Data Handling

- Priority: `P1`
- Type: `Failure`
- Preconditions: choose or simulate a country with missing required budget inputs
- Steps:
  1. Load the budget matcher with the affected data set.
- Expected result:
  1. Countries missing required cost fields are excluded from results.
  2. The page does not render broken cards, `NaN`, or invalid totals.

## 10. Static Information And Content Pages

### INFO-001 Data Sources Page Content Integrity

- Priority: `P1`
- Type: `Common`
- Preconditions: route available
- Steps:
  1. Open `/data-sources`.
- Expected result:
  1. All configured data source cards render.
  2. Titles, descriptions, categories, tags, and update text are localized.

### INFO-002 Indicators Page Content Integrity

- Priority: `P1`
- Type: `Common`
- Preconditions: route available
- Steps:
  1. Open `/indicators`.
- Expected result:
  1. Core indicator cards render for every configured category.
  2. The AI indicator section count and note render correctly.

### INFO-003 AI Indicators Page Content Integrity

- Priority: `P1`
- Type: `Common`
- Preconditions: route available
- Steps:
  1. Open `/ai-indicators`.
- Expected result:
  1. Disclaimer banner renders.
  2. AI cards render with name, description, source, and sub-indicators.

### INFO-004 Budget Categories Page Content Integrity

- Priority: `P1`
- Type: `Common`
- Preconditions: route available
- Steps:
  1. Open `/budget-categories`.
- Expected result:
  1. Every budget category card renders.
  2. Methodology and source text appear for each category.

### INFO-005 Home Hero Links To Methodology Pages

- Priority: `P2`
- Type: `Common`
- Preconditions: home page loaded
- Steps:
  1. Use the hero stat links to open indicators, data sources, and AI indicators.
  2. Navigate back.
- Expected result:
  1. Links route correctly.
  2. Returning to the home page does not lose the user unexpectedly.

## 11. Localization And Language-Specific Cases

### I18N-001 English Default Without Prefix

- Priority: `P0`
- Type: `Common`
- Preconditions: none
- Steps:
  1. Open `/` and several non-prefixed routes.
- Expected result:
  1. English content renders as the default language.
  2. Non-prefixed routes remain valid.

### I18N-002 Ukrainian And Russian Route Coverage

- Priority: `P0`
- Type: `Common`
- Preconditions: none
- Steps:
  1. Open `/ua/`, `/ua/map`, `/ua/compare`, `/ua/nomad-visas`, `/ua/budget-matcher`.
  2. Repeat with `/ru/...`.
- Expected result:
  1. Language shell, labels, and page text load in the requested language.
  2. No route-level mismatch occurs.

### I18N-003 Language Switch Preserves Query-Driven Workflows

- Priority: `P0`
- Type: `Edge`
- Preconditions: route with query state is loaded
- Steps:
  1. Switch language while on a compare route with `c` and `m`.
  2. Switch language while on a budget matcher route with budget query params.
- Expected result:
  1. Query state survives the language change.
  2. The resulting page shows the same logical workflow in the new language.

### I18N-004 Localized Country And Region Labels

- Priority: `P1`
- Type: `Common`
- Preconditions: routes loaded in `ua` and `ru`
- Steps:
  1. Check country list cards, compare views, and country detail headers.
- Expected result:
  1. Country names and related labels are localized where translations exist.

### I18N-005 Translation Fallback Behavior

- Priority: `P1`
- Type: `Failure`
- Preconditions: choose content with partial localization coverage
- Steps:
  1. Inspect visa fields and long-form content in `ua` and `ru`.
- Expected result:
  1. Missing translated values fall back to English.
  2. Raw i18n keys do not appear in the UI.

### I18N-006 Count And Pluralized Labels

- Priority: `P1`
- Type: `Corner`
- Preconditions: Ukrainian and Russian routes available
- Steps:
  1. Inspect hero stats, compare labels, and count-driven text.
- Expected result:
  1. Count-based labels use correct plural forms.
  2. No known pluralization regressions reappear.

### I18N-007 Shared URLs Remain Valid Across Languages

- Priority: `P1`
- Type: `Edge`
- Preconditions: shared URLs copied from home, compare, and budget routes
- Steps:
  1. Open shared URLs in English, then switch to `ua` and `ru`.
- Expected result:
  1. Shared URLs remain valid and reproducible after language changes.

## 12. Backend, Data Fallbacks, And Data Integrity

### API-001 Health Endpoint Schema

- Priority: `P0`
- Type: `Common`
- Preconditions: backend is running
- Steps:
  1. Call `GET /api/health`.
- Expected result:
  1. Response returns `200`.
  2. JSON includes `status` and `timestamp`.

### API-002 Countries Endpoint Schema

- Priority: `P0`
- Type: `Common`
- Preconditions: backend is running
- Steps:
  1. Call `GET /api/countries`.
  2. Inspect the first few records.
- Expected result:
  1. Response returns a JSON array.
  2. Records include fields required by the client, such as code, localized names, region, flag URL, scores, and route-critical metadata.

### API-003 CORS And Browser Accessibility

- Priority: `P1`
- Type: `Common`
- Preconditions: frontend and backend running separately
- Steps:
  1. Load the client against the API configuration that uses the backend.
- Expected result:
  1. Browser requests succeed without CORS rejection.

### API-004 Generic Error Handler Contract

- Priority: `P1`
- Type: `Failure`
- Preconditions: controlled environment where a server-side exception can be forced safely
- Steps:
  1. Trigger a backend failure path.
- Expected result:
  1. Server returns JSON with an error message.
  2. The process does not expose a raw stack trace to the end user.

### API-005 Client Fallback To Embedded Data

- Priority: `P1`
- Type: `Corner`
- Preconditions: standalone build or environment with `window.__NOMAD_LENS_DATA__`
- Steps:
  1. Load the client with embedded data available.
- Expected result:
  1. The client resolves countries from the embedded payload.
  2. The app behaves like a normal data-backed session.

### API-006 Client Fallback To Bundled Local Data

- Priority: `P1`
- Type: `Corner`
- Preconditions: `VITE_API_URL` is empty
- Steps:
  1. Load the client without a remote API base URL.
- Expected result:
  1. The app uses bundled local country data.
  2. Major routes still work.

### API-007 Remote API Failure Behavior

- Priority: `P0`
- Type: `Failure`
- Preconditions: configure client to use remote API, then make the API unavailable
- Steps:
  1. Open list, country, compare, nomad visas, and budget routes.
- Expected result:
  1. No route hard-crashes into a white screen.
  2. Routes with explicit error handling show it.
  3. Routes without explicit error views still remain stable enough for triage.

### API-008 Sparse Score Data Does Not Break Ranking

- Priority: `P1`
- Type: `Failure`
- Preconditions: choose or simulate a country with some null score values
- Steps:
  1. View the home list, compare page, and country detail page for the affected country.
- Expected result:
  1. Ranking and detail views still render.
  2. Missing fields do not produce client crashes.

### API-009 Missing Climate Data Fallback

- Priority: `P1`
- Type: `Failure`
- Preconditions: choose or simulate a country without climate data
- Steps:
  1. Use climate-related filters and inspect the affected country.
- Expected result:
  1. The app falls back safely instead of failing the page.
  2. Climate filters do not create invalid values.

### API-010 Missing Cost Data Exclusion Rule

- Priority: `P1`
- Type: `Failure`
- Preconditions: choose or simulate a country missing required cost inputs
- Steps:
  1. Open the budget matcher and compare results.
- Expected result:
  1. The country is excluded from budget results.
  2. The rest of the page remains correct.

### API-011 Partial Nomad Visa Data Handling

- Priority: `P1`
- Type: `Failure`
- Preconditions: choose or simulate a country with partial visa fields
- Steps:
  1. Inspect nomad visa list, dedicated compare, and country detail views.
- Expected result:
  1. Missing fields degrade gracefully.
  2. The route does not crash because one visa record is incomplete.

### API-012 Release Gate For Static Country Data File

- Priority: `P0`
- Type: `Corner`
- Preconditions: release candidate validation
- Steps:
  1. Validate that `server/src/data/countries.json` exists and is parseable before deployment.
  2. Validate that the client-bundled data file is present when relying on local data fallback.
- Expected result:
  1. Startup-critical data files are present and valid.
  2. Release is blocked if the static data file is malformed or missing.

## 13. Responsive, Accessibility, And Manual Browser Checks

### UX-001 Desktop Layout Integrity

- Priority: `P1`
- Type: `Common`
- Preconditions: desktop viewport around `1280px+`
- Steps:
  1. Open home, map, compare, nomad visas, budget matcher, and country detail.
- Expected result:
  1. Sticky headers, sidebars, and comparison layouts render correctly.
  2. No unexpected horizontal overflow appears on standard desktop widths.

### UX-002 Tablet Layout Integrity

- Priority: `P1`
- Type: `Common`
- Preconditions: viewport around `872px` to `1024px`
- Steps:
  1. Repeat major flows on tablet width.
- Expected result:
  1. Compare layouts remain readable.
  2. Sticky areas do not overlap core content.

### UX-003 True Mobile Layout Integrity

- Priority: `P0`
- Type: `Edge`
- Preconditions: external mobile runner or real device
- Steps:
  1. Repeat key home, compare, nomad visas, and budget matcher flows below `768px` width.
- Expected result:
  1. Mobile drawers, cards, tables, and CTAs remain usable.
  2. No critical control becomes inaccessible.

### UX-004 Keyboard Accessibility Of Main Controls

- Priority: `P1`
- Type: `Common`
- Preconditions: keyboard-only navigation
- Steps:
  1. Tab through header, search, compare mode controls, language switch, and action buttons.
- Expected result:
  1. Focus order is logical.
  2. Visible focus indication exists on interactive elements.

### UX-005 Focus Trap And Escape Handling In Mobile Sheets

- Priority: `P1`
- Type: `Edge`
- Preconditions: mobile parameter sheet or similar overlay open
- Steps:
  1. Use `Tab`, `Shift+Tab`, and `Escape`.
- Expected result:
  1. Focus remains trapped inside the active sheet.
  2. `Escape` closes the sheet when supported.

### UX-006 Horizontal Scroll Usability

- Priority: `P2`
- Type: `Edge`
- Preconditions: routes with wide tables or comparison columns
- Steps:
  1. Test horizontal scrolling on compare and visa table layouts.
- Expected result:
  1. Content remains usable without clipped critical columns.
  2. Header and body stay aligned where the design intends it.

### UX-007 Long String And Localization Overflow

- Priority: `P2`
- Type: `Edge`
- Preconditions: routes in `ua` and `ru`
- Steps:
  1. Inspect hero stats, badges, table cells, and long-form notes.
- Expected result:
  1. Text does not overlap icons or controls.
  2. Wrapping and truncation remain readable.

### UX-008 Dark Theme Readability

- Priority: `P2`
- Type: `Common`
- Preconditions: default theme
- Steps:
  1. Inspect major pages and data-heavy tables.
- Expected result:
  1. Text, icons, labels, and status colors remain legible against the dark background.

## 14. Known Regression Retests

### REG-001 Dedicated Visa Compare Rejects Single Country

- Priority: `P0`
- Type: `Regression`
- Preconditions: none
- Steps:
  1. Open `/nomad-visas/compare?c=DE`.
- Expected result:
  1. Empty guidance state is shown.
  2. A single comparison card is not rendered.

### REG-002 Dedicated Visa Compare Rejects Mixed Invalid Selection

- Priority: `P0`
- Type: `Regression`
- Preconditions: none
- Steps:
  1. Open `/nomad-visas/compare?c=ZZ,DE`.
- Expected result:
  1. Invalid code is filtered out.
  2. The remaining single valid code is still insufficient, so the page stays empty.

### REG-003 Dedicated Visa Compare Rejects Duplicate Selection

- Priority: `P0`
- Type: `Regression`
- Preconditions: none
- Steps:
  1. Open `/nomad-visas/compare?c=DE,DE`.
- Expected result:
  1. Duplicate codes are deduplicated.
  2. The page remains in the empty guidance state because only one unique country remains.

### REG-004 Compare Route Deduplicates Country Columns

- Priority: `P0`
- Type: `Regression`
- Preconditions: none
- Steps:
  1. Open `/compare?c=DE,DE`.
- Expected result:
  1. Duplicate country columns are not rendered.
  2. The URL is normalized.

### REG-005 Budget Compare Deduplicates Country Columns

- Priority: `P0`
- Type: `Regression`
- Preconditions: none
- Steps:
  1. Open `/compare?m=budget&c=AR,AR`.
- Expected result:
  1. Duplicate budget comparison columns are not rendered.
  2. The page remains stable after URL sanitization.

### REG-006 No-Result Search States Remain Intact

- Priority: `P1`
- Type: `Regression`
- Preconditions: dataset loaded
- Steps:
  1. Trigger a guaranteed no-result search on `/`.
  2. Trigger a guaranteed no-result search on `/nomad-visas`.
- Expected result:
  1. Both pages render a correct empty state.
  2. No console or page errors appear.

## Exit Criteria For A Full Regression Pass

- No `P0` failure remains open.
- No route produces an uncaught runtime exception.
- Query-driven workflows do not lose or corrupt state.
- Localized routes render without raw translation keys.
- Compare routes sanitize invalid and duplicate country codes consistently.
- Budget, visa, and country-detail views degrade safely when data is partial.
- Health and countries endpoints are reachable and structurally valid for the active environment.

## Recommended Follow-Up Artifacts

- A smoke-only subset derived from the `SMK-*` and `REG-*` cases for quick release gates
- A browser compatibility matrix once Safari and Firefox regression coverage is required
- An automation candidate list once the team decides which manual scenarios should move into Playwright

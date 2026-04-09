# Playwright QA Bug Report

Date: 2026-04-09

## Scope

This QA pass used Playwright-driven browser checks against the local client at `http://localhost:5173`.

Routes covered:

- `/`
- `/map`
- `/compare`
- `/compare?c=DE,ES`
- `/compare?m=regions`
- `/compare?m=budget&c=TW,AR`
- `/compare?m=nomadVisas&c=DE,ES`
- `/country/de`
- `/country/zz`
- `/nomad-visas`
- `/nomad-visas/compare`
- `/nomad-visas/compare?c=DE,ES`
- `/budget-matcher`
- `/data-sources`
- `/indicators`
- `/ai-indicators`
- `/budget-categories`

Additional edge cases covered:

- `/nomad-visas/compare?c=DE`
- `/nomad-visas/compare?c=ZZ,DE`
- `/nomad-visas/compare?c=DE,DE`
- `/compare?c=DE,DE`
- `/compare?m=budget&c=AR,AR`
- no-result search states on `/` and `/nomad-visas`
- map country click navigation on `/map`

## Result Summary

- All tested routes loaded without runtime exceptions after fixes.
- No console errors or page errors were present in the final regression sweep across the main route set.
- Two route-sanitization defects were found and fixed.

## Bugs Found

### 1. Dedicated Nomad Visa Compare allowed fewer than 2 valid countries

Status: Fixed

Reproduction:

- Open `/nomad-visas/compare?c=DE`
- Open `/nomad-visas/compare?c=ZZ,DE`
- Open `/nomad-visas/compare?c=DE,DE`

Observed before fix:

- The page rendered a single-country comparison card even though the page message and intended flow require at least two selected countries.
- Invalid and duplicate codes were not sanitized consistently.

Fix:

- Sanitized compare query country codes by trimming, uppercasing, filtering invalid codes, and deduplicating them.
- Changed the dedicated visa compare route to treat fewer than two valid selected countries as an empty comparison state.

Files changed:

- `client/src/pages/NomadVisaComparePage.tsx`
- `client/src/utils/countryCodeSelection.ts`

### 2. Compare routes accepted duplicate country codes and rendered duplicated columns

Status: Fixed

Reproduction:

- Open `/compare?c=DE,DE`
- Open `/compare?m=budget&c=AR,AR`
- Open `/nomad-visas/compare?c=DE,DE`

Observed before fix:

- Duplicate countries were rendered twice in compare views.
- The dedicated visa compare route emitted React duplicate-key console errors.
- URLs could carry invalid or duplicate country code state into the compare UI.

Fix:

- Added shared route-level country code normalization and used it in compare pages.
- Compare pages now deduplicate and validate country selections before rendering.
- Dirty duplicate query params are normalized in the URL during page initialization.

Files changed:

- `client/src/pages/ComparePage.tsx`
- `client/src/pages/NomadVisaComparePage.tsx`
- `client/src/utils/countryCodeSelection.ts`

## Pages and Flows Checked

### Core route load sweep

Verified that the following routes render `main` content and complete without console/page errors in the final sweep:

- `/`
- `/map`
- `/compare`
- `/compare?c=DE,ES`
- `/compare?m=regions`
- `/compare?m=budget&c=TW,AR`
- `/compare?m=nomadVisas&c=DE,ES`
- `/country/de`
- `/country/zz`
- `/nomad-visas`
- `/nomad-visas/compare`
- `/nomad-visas/compare?c=DE,ES`
- `/budget-matcher`
- `/data-sources`
- `/indicators`
- `/ai-indicators`
- `/budget-categories`

### Interaction checks

- `/map`: clicking a country shape navigated to a country detail page (`/country/dz` in the test run).
- `/`: no-result search state displayed correctly.
- `/nomad-visas`: no-result search state displayed correctly.
- `/compare?c=DE,ES`: valid two-country comparison still rendered correctly after sanitization changes.
- `/compare`: switching between Countries, Regions, Nomad Visas, and Budget updated both the page heading and query state correctly.
- `/nomad-visas`: compare mode still entered cleanly after the sanitization fix and showed the expected instructional state before enough countries were selected.
- `/budget-matcher`: search and reset interactions completed without console or page errors.
- `/`: navigation from the homepage into the methodology pages still worked after the route-fix changes.

## Validation After Fixes

- `npm run build -w client`: passed
- `npm run lint -w client`: passed with one pre-existing warning in `client/src/hooks/useCountries.ts`
- Playwright regression sweep across the main route set: passed with no console or page errors

## Limitations

- The integrated browser viewport remained fixed at roughly 872px wide during this session even when Playwright viewport resizing was attempted.
- Because of that limitation, this pass focused on desktop/tablet-width rendering plus route, state, and interaction edge cases. True narrow mobile viewport validation would need either a resizable automation target or an external Playwright runner configured for mobile emulation.

## Final Status

- Blocking issues found in this pass: 2
- Blocking issues fixed in this pass: 2
- Remaining blocking issues found in tested routes: 0

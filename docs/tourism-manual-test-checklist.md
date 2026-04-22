# Nomad Lens Tourism Manual Test Checklist

Date: 2026-04-22

Document type: Manual QA checklist and execution record

## Scope

This checklist covers the tourism-specific user flows that were exercised with Playwright MCP:

- `/tourism`
- `/ua/tourism`
- `/ru/tourism`
- `/compare?m=tourism&c=...`
- Tourism search, compare mode, localized shell copy, and mobile parameters sheet behavior

## Environment

- App runtime: `npm run dev -w client`
- URL under test: `http://127.0.0.1:4173`
- Data source: client-side bundled country data fallback
- Browser driver: Playwright MCP via the VS Code integrated browser
- Viewport used for the interactive checks: compact/mobile-like integrated browser viewport

## Checklist

- [x] `TOUR-001` Tourism page smoke test
      Route: `/tourism`
      Expected: hero, search, activity tags, and ranked country list render without a blank state.
      Result: Pass.

- [x] `TOUR-002` Tourism localized route smoke test
      Routes: `/ua/tourism`, `/ru/tourism`
      Expected: tourism shell copy renders in the selected language with no raw translation keys.
      Result: Pass after localized control-label fix.

- [x] `TOUR-003` Search filter mode
      Steps: enter `thai` in the tourism search box.
      Expected: list filters to the matching country and count updates.
      Result: Pass.

- [x] `TOUR-004` Search scroll mode
      Steps: switch search mode from filter to scroll mode with an active query.
      Expected: full list remains visible, match counter appears, and highlight navigation controls are shown.
      Result: Pass.

- [x] `TOUR-005` Compare mode entry helper copy
      Steps: enter tourism compare mode on `/tourism`.
      Expected: helper copy renders readable text with no raw interpolation placeholders.
      Result: Fixed.
      Commit: `5595422`.

- [x] `TOUR-006` Tourism compare navigation
      Steps: select two countries in tourism compare mode and open comparison.
      Expected: `/compare?m=tourism&c=...` loads the side-by-side tourism comparison.
      Result: Pass.

- [x] `TOUR-007` Mobile parameters sheet open and dismiss controls
      Steps: open the tourism parameters sheet and close it with the close button.
      Expected: sheet opens as a modal dialog and dismisses cleanly.
      Result: Pass.

- [x] `TOUR-008` Mobile parameters sheet keyboard dismissal
      Steps: open the tourism parameters sheet and press `Escape`.
      Expected: sheet closes and focus returns cleanly.
      Result: Fixed.
      Commit: `7233ecf`.

- [x] `TOUR-009` Tourism localized accessibility labels
      Steps: inspect the Ukrainian and Russian tourism routes in the integrated browser snapshot.
      Expected: tourism control names do not stay in English on localized routes.
      Result: Fixed.
      Commit: `2f97386`.

- [x] `TOUR-010` Travel-date month selectors localization
      Steps: open the tourism parameters sheet on `/ua/tourism`.
      Expected: month placeholder and month options are localized.
      Result: Fixed.
      Commit: `2f97386`.

## Issues Found And Fixed

1. Tourism compare mode reused `compare.countrySubtitle`, which expects interpolation values and leaked raw placeholders on the tourism page.
   Fix commit: `5595422`.

2. The tourism mobile parameters sheet trapped `Tab` but ignored `Escape`, so keyboard dismissal failed.
   Fix commit: `7233ecf`.

3. Tourism controls and travel-date selectors kept English-only accessible labels and English month labels on localized routes.
   Fix commit: `2f97386`.

## Notes

- The tourism page uses bundled client data when no API URL is configured, so backend startup was not required for this QA pass.
- This pass focused on the compact integrated-browser viewport because that is where the tourism mobile sheet regressions reproduced.
- A dedicated wide-desktop layout sweep was not executed in this run.

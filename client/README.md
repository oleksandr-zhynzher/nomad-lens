# Nomad Lens Client

React 19, TypeScript, Vite, React Router, i18next, and Zustand power the client application.

## Validation

Run these before merging architecture or behavior changes:

```bash
npm run lint
npm run test
npm run build
npm run doctor:ci
```

`doctor:ci` fails when React Doctor reports errors or the health score drops below 80.

## Folder ownership

- `src/app`: application bootstrap, router, global styles, and app-level store helpers.
- `src/core`: reusable `api`, `constants`, `hooks`, `models`, `store`, `ui`, and `utils` with the same role-folder structure used by features. Keep `models` for TypeScript shapes only.
- `src/core/i18n`: localization setup and locale files.
- `src/features`: feature-owned UI, hooks, Zustand stores, models, constants, utilities, data, and APIs.
- Routes in `src/app/router` lazy-load owning feature/core UI components directly. Do not add thin page adapter files.

## State ownership

- Use Zustand for shared or persisted app state.
- Keep shareable state in URL helpers close to the owning feature.
- Keep ephemeral UI state local to the component that owns the interaction.
- Put derived calculations in selectors, feature hooks, or pure utilities, not JSX.

## Component rules

- Prefer small single-responsibility files over route-sized components.
- Use composition or explicit variants instead of boolean-prop mode switches.
- Shared primitives must own accessibility details such as labels, focus management, Escape handling, and visible focus states.
- Use semantic role folders: React hooks in `hooks`, Zustand state in `store`, TypeScript shapes in `models`, static values in `constants`, and pure helpers in `utils`.
- Avoid redundant role nesting such as `core/ui/layout/ui`; once inside `ui`, place section components directly in that section folder.
- Keep `core` for multi-feature or app-wide code only. If a file is used by one feature, move it into that feature's matching role folder.
- New localStorage usage should go through `core/utils/storage.utils.ts`; new clipboard usage should go through `core/hooks/useClipboard.ts`.

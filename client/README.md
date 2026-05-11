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

- `src/app`: application shell, providers, router, and app-level store helpers.
- `src/shared`: reusable UI primitives, hooks, API clients, and framework-agnostic utilities.
- `src/entities`: domain entities and data access that are not owned by a single feature.
- `src/features`: feature models, Zustand stores, URL-state helpers, and feature-specific UI.
- `src/pages`: route coordinators only. Pages should compose feature components and avoid owning domain logic.

## State ownership

- Use Zustand for shared or persisted app state.
- Keep shareable state in URL helpers close to the feature model.
- Keep ephemeral UI state local to the component that owns the interaction.
- Put derived calculations in selectors or pure model utilities, not JSX.

## Component rules

- Prefer small single-responsibility files over route-sized components.
- Use composition or explicit variants instead of boolean-prop mode switches.
- Shared primitives must own accessibility details such as labels, focus management, Escape handling, and visible focus states.
- New localStorage usage should go through `shared/lib/storage.ts`; new clipboard usage should go through `shared/hooks/useClipboard.ts`.

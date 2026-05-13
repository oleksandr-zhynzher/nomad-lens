# Client Architecture

The client source keeps application layers explicit at the top level:

```txt
src/
  app/
  core/
  features/
  i18n/
```

`app` owns bootstrap, routing, app-level store helpers, and global styles. `features` owns product capabilities. `core` owns cross-feature models plus domain-neutral primitives, hooks, API helpers, utilities, and app-wide UI sections using the same role-folder shape as feature slices. `i18n` owns localization setup and locale files. Routes lazy-load the owning feature/core UI components directly instead of using page adapter files.

## Dependency direction

Keep dependencies simple:

```txt
app -> core/features
features -> core
core -> app
core/features -> i18n
features -/-> unrelated feature internals
```

Feature-to-feature imports are allowed only for intentional cross-feature composition, such as compare screens rendering budget/tourism/country-ranking outputs. Prefer moving reusable, domain-neutral code to `core` instead of importing another feature's internals.

## Folder ownership

- `src/app`: router, app-level store helpers, global styles, and bootstrap-only code.
- `src/core/api`: domain-neutral API helpers.
- `src/core/constants`: cross-feature constants and static configuration.
- `src/core/hooks`: domain-neutral reusable React hooks.
- `src/core/models`: TypeScript model/type declarations only.
- `src/core/store`: cross-feature Zustand stores and selectors.
- `src/core/ui`: reusable primitives and app-wide UI sections.
- `src/core/utils`: domain-neutral pure helpers.
- `src/features/<feature>`: feature-owned `ui`, `hooks`, `store`, `models`, `constants`, `utils`, `api`, and `data`.
- `src/i18n`: i18next setup and locale files.
- Do not nest another `ui` folder inside an existing `ui` role folder; put section components directly under the section folder.
- Keep code in `core` only when it is reused by multiple features or is genuinely app-wide. Single-feature code belongs in that feature's matching role folder.

## State rules

- Use Zustand only for durable cross-route state, persisted preferences, or shared cached data.
- Keep local UI state local: open panels, hover state, selected rows, copied feedback, search strings, and temporary expansion state.
- Keep derived rankings, filters, scoring, and matching in feature `hooks` or pure `utils` functions.
- URL state belongs in the owning feature `utils`/`hooks` or, when route-specific, beside the owning routed component.

## Import rules

- Use `@app/*` for app bootstrap/router/store, `@core/*` for core imports, and `@features/*` for feature imports.
- Use `@i18n`/`@i18n/*` for localization.
- Do not add new top-level `src` folders beyond `app`, `core`, `features`, and `i18n`.
- Prefer explicit role folders over catch-all names: `hooks` for React hooks, `store` for Zustand stores/selectors, `models` for TypeScript shapes, `constants` for static values, and `utils` for pure helpers.
- Constants files should use `*.constants.ts`; utilities should use `*.utils.ts`; model shape files should use `*.models.ts`.
- Avoid broad `index.ts` barrels. Prefer direct imports or tiny public APIs for stable entry points.

## Styling rules

Use Tailwind classes for styling. Do not add React `style` attributes for static visual styles. Dynamic CSS variables are allowed only for values Tailwind cannot know at build time, such as range progress or tooltip coordinates.

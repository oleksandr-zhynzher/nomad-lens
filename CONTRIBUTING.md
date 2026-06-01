# Contributing

Thanks for helping improve Nomad Lens.

## Local development

1. Install dependencies with `npm ci`.
2. Start the app with `npm run dev`.
3. Run `npm run quality:pr` before opening a pull request.

## Architecture expectations

- Keep client code inside `app`, `core`, `features`, and `i18n`.
- Import across features only through public feature indexes.
- Keep business logic in hooks, utilities, stores, or API modules; avoid putting domain rules directly in large UI components.
- Add or update tests when changing business logic, routing, API behavior, or infrastructure.

## Pull requests

- Use conventional commits.
- Keep changes focused and explain user-visible behavior changes.
- Include screenshots or screen recordings for UI changes.
- Document new environment variables, deployment requirements, and operational changes.

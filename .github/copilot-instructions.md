# Repository Copilot Instructions

These instructions apply to all agents working in this repository.

## Tooling and environment assumptions

- Treat runtime tool availability as environment-controlled, not repository-controlled.
- Do **not** claim that `.github` configuration can grant missing filesystem, shell, search, or web-fetch tools in the current session.
- If normal read/search tools are unavailable, say that plainly, but first check whether the runtime already exposes any alternative built-in file inspection tools before concluding you are blocked.
- Do **not** fabricate architecture findings, code review results, file contents, or test outcomes.

## Required fallback behavior for reviews

- For architecture, React, accessibility, and UI reviews, use local repository files and local skill documentation first.
- If a skill suggests fetching remote guidance and web fetch is unavailable, fall back to the local checked-in skill files under `.github/skills/` instead of failing the task for that reason alone.
- Missing web fetch is **not** by itself a blocker when equivalent local guidance exists in the repository.
- Only report a tooling blocker when the task truly cannot continue without unavailable capabilities.

## Repository review expectations

- When asked to review code, inspect the repository before answering.
- Start with high-level structure, then drill into routes, components, hooks, services, utilities, state ownership, data fetching, rendering boundaries, accessibility, localization, and tests.
- Prefer evidence-backed findings with file paths and lines whenever the runtime can inspect files.
- When the user asks for a report, create the requested artifact in the repository if writing files is available.

## React architecture guidance

- Prefer explicit data flow, small components, pure utilities, and hooks with narrow ownership.
- Avoid boolean-prop proliferation; prefer composition or explicit variants.
- Keep user-visible strings localization-safe.
- Flag mixed-responsibility components that fetch, transform, manage UI state, and render large trees together.
- Call out avoidable re-render breadth, request waterfalls, oversized contexts, hidden state, and inaccessible interactions.

## Communication

- Lead with what you accomplished or what is truly blocked.
- Do not blame the repository for runtime tool limitations.
- If blocked by missing runtime tools, explain that the limitation comes from the current session environment, not from project configuration.

import type { Configuration } from "lint-staged";

// Pre-commit: fast (non-typed) ESLint + Prettier.
// Full typed ESLint (strictTypeChecked) runs in the pre-push hook and CI.
const config: Configuration = {
  "client/src/**/*.{ts,tsx}": [
    "eslint --fix --config client/eslint.config.fast.js",
    "prettier --write",
  ],
  "server/src/**/*.{ts,tsx}": ["prettier --write"],
  "*.{js,mjs,cjs}": ["prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"],
};

export default config;

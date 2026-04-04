import type { Configuration } from "lint-staged";

const config: Configuration = {
  "client/src/**/*.{ts,tsx}": [
    "eslint --fix --config client/eslint.config.js",
    "prettier --write",
  ],
  "server/src/**/*.{ts,tsx}": ["prettier --write"],
  "*.{js,mjs,cjs}": ["prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"],
};

export default config;

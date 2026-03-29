import type { Configuration } from "lint-staged";

const config: Configuration = {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{js,mjs,cjs}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"],
};

export default config;

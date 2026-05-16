import type { Configuration } from "lint-staged";
import path from "node:path";

// Pre-commit: fast (non-typed) ESLint + Prettier.
// Full typed ESLint (strictTypeChecked) runs in the pre-push hook and CI.
const quote = (value: string): string => JSON.stringify(value);

const workspaceFiles = (workspace: string, files: string[]): string =>
  files
    .map((file) => {
      const absoluteFile = path.isAbsolute(file) ? file : path.resolve(file);
      return quote(path.relative(path.resolve(workspace), absoluteFile));
    })
    .join(" ");

const config: Configuration = {
  "client/src/**/*.{ts,tsx}": [
    (files) =>
      `cd client && eslint --fix --max-warnings=0 --config eslint.config.fast.js ${workspaceFiles("client", files)}`,
    "prettier --write",
  ],
  "server/src/**/*.{ts,tsx}": [
    (files) =>
      `cd server && eslint --fix --max-warnings=0 --config eslint.config.js ${workspaceFiles("server", files)}`,
    "prettier --write",
  ],
  "infra/{bin,lib}/**/*.ts": [
    (files) =>
      `cd infra && eslint --fix --max-warnings=0 --config eslint.config.js ${workspaceFiles("infra", files)}`,
    "prettier --write",
  ],
  "*.{js,mjs,cjs}": ["prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"],
};

export default config;

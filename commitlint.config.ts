import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      2,
      "always",
      ["client", "server", "infra", "data", "deps", "docker"],
    ],
    "scope-empty": [1, "never"],
    "subject-max-length": [2, "always", 100],
    "body-max-line-length": [1, "always", 120],
  },
};

export default config;

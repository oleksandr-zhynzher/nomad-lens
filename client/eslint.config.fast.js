/**
 * Fast ESLint config for pre-commit lint-staged.
 * Identical to eslint.config.js but WITHOUT projectService / typed rules.
 * Type-aware linting runs in the pre-push hook and CI via the full config.
 */
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import react from "eslint-plugin-react";
import jsxA11y from "eslint-plugin-jsx-a11y";
import unicorn from "eslint-plugin-unicorn";
import sonarjs from "eslint-plugin-sonarjs";
import prettier from "eslint-config-prettier";

export default defineConfig([
  globalIgnores(["dist", "node_modules", "coverage", "**/*.d.ts"]),

  {
    files: ["src/**/*.{ts,tsx}", "tests/**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      // Use recommended (not strictTypeChecked) — no projectService needed
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      react.configs.flat.recommended,
      react.configs.flat["jsx-runtime"],
      jsxA11y.flatConfigs.recommended,
      unicorn.configs.recommended,
      sonarjs.configs.recommended,
      prettier,
    ],

    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser, ...globals.node },
    },

    settings: {
      react: { version: "detect" },
    },

    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/no-non-null-assertion": "warn",

      "react/no-unstable-nested-components": ["error", { allowAsProps: false }],
      "react/jsx-no-useless-fragment": "warn",
      "react/no-array-index-key": "warn",
      "react/self-closing-comp": ["warn", { component: true, html: true }],
      "react/jsx-pascal-case": "error",
      "react/no-direct-mutation-state": "error",
      "react/hook-use-state": "warn",
      "react/jsx-no-leaked-render": ["error", { validStrategies: ["ternary"] }],

      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",

      "unicorn/filename-case": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-null": "off",
      "unicorn/no-array-reduce": "off",
      "unicorn/no-negated-condition": "off",
      "unicorn/prefer-ternary": "off",
      "unicorn/switch-case-braces": "off",
      "unicorn/prefer-module": "off",
      "unicorn/prefer-top-level-await": "off",
      "unicorn/no-process-exit": "off",
      "unicorn/prefer-global-this": "off",
      "unicorn/no-array-for-each": "error",
      "unicorn/prefer-at": "error",
      "unicorn/prefer-spread": "warn",
      "unicorn/numeric-separators-style": "warn",
      "unicorn/no-nested-ternary": "warn",
      "unicorn/no-array-sort": "off",

      "sonarjs/cognitive-complexity": ["warn", 20],
      "sonarjs/no-duplicate-string": "off",
      "sonarjs/no-nested-conditional": "off",
      "sonarjs/prefer-read-only-props": "warn",
      // void operator is the correct pattern for intentionally-ignored promises
      "sonarjs/void-use": "off",
    },
  },
]);

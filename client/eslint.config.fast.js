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

// Phase 3 strict source gate plugins (non-type-aware subset)
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";
import eslintComments from "eslint-plugin-eslint-comments";
import security from "eslint-plugin-security";
import promise from "eslint-plugin-promise";
import functional from "eslint-plugin-functional";
import boundaries from "eslint-plugin-boundaries";
import deprecation from "eslint-plugin-deprecation";
import noSecrets from "eslint-plugin-no-secrets";
import regexp from "eslint-plugin-regexp";
import perfectionist from "eslint-plugin-perfectionist";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tailwindcss from "eslint-plugin-tailwindcss";

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
      jsxA11y.flatConfigs.strict,
      unicorn.configs.recommended,
      sonarjs.configs.recommended,

      // Phase 3 strict source gate (non-type-aware)
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
      promise.configs["flat/recommended"],
      security.configs.recommended,
      regexp.configs["flat/recommended"],

      prettier,
    ],

    plugins: {
      "unused-imports": unusedImports,
      "eslint-comments": eslintComments,
      functional,
      boundaries,
      deprecation,
      "no-secrets": noSecrets,
      perfectionist,
      "simple-import-sort": simpleImportSort,
      tailwindcss,
    },

    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser, ...globals.node },
    },

    settings: {
      react: { version: "detect" },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.app.json",
        },
        node: true,
      },
      "boundaries/elements": [
        {
          type: "core",
          pattern: "src/core/**/*",
        },
        {
          type: "features",
          pattern: "src/features/**/*",
          mode: "folder",
          capture: ["featureName"],
        },
        {
          type: "i18n",
          pattern: "src/i18n/**/*",
        },
        {
          type: "app",
          pattern: "src/app/**/*",
        },
      ],
    },

    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/array-type": ["error", { default: "array-simple" }],

      "react/no-unstable-nested-components": ["error", { allowAsProps: false }],
      "react/jsx-no-useless-fragment": "error",
      "react/no-array-index-key": "error",
      "react/self-closing-comp": ["error", { component: true, html: true }],
      "react/jsx-pascal-case": "error",
      "react/no-direct-mutation-state": "error",
      "react/hook-use-state": "error",
      "react/jsx-no-leaked-render": ["error", { validStrategies: ["ternary"] }],

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
      "unicorn/prefer-spread": "error",
      "unicorn/numeric-separators-style": "error",
      "unicorn/no-nested-ternary": "error",
      "unicorn/no-array-sort": "off",

      "sonarjs/cognitive-complexity": ["error", 20],
      "sonarjs/no-duplicate-string": "off",
      "sonarjs/no-nested-conditional": "off",
      "sonarjs/prefer-read-only-props": "error",
      "sonarjs/void-use": "off",

      // Phase 3: Import & Unused Imports (non-type-aware)
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
      "import/no-unresolved": "error",
      "import/default": "off",
      "import/no-named-as-default": "off",
      "import/no-named-as-default-member": "off",
      "import/no-cycle": "off",
      "import/no-self-import": "error",
      "import/no-useless-path-segments": "error",
      "import/no-mutable-exports": "error",
      "import/no-default-export": "off",
      "import/no-deprecated": "off", // Type-aware rule
      "import/export": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // Phase 3: ESLint Comments
      "eslint-comments/disable-enable-pair": ["error", { allowWholeFile: true }],
      "eslint-comments/no-aggregating-enable": "error",
      "eslint-comments/no-duplicate-disable": "error",
      "eslint-comments/no-unlimited-disable": "error",
      "eslint-comments/no-unused-disable": "error",
      "eslint-comments/no-unused-enable": "error",
      "eslint-comments/require-description": "off",

      // Phase 3: Security (non-type-aware)
      "security/detect-object-injection": "off",
      "security/detect-non-literal-regexp": "off",
      "security/detect-unsafe-regex": "error",

      // Phase 3: Promise (non-type-aware)
      "promise/prefer-await-to-then": "off",
      "promise/prefer-await-to-callbacks": "off",
      "promise/no-nesting": "error",
      "promise/no-return-wrap": "error",
      "promise/param-names": "error",
      "promise/no-new-statics": "error",

      // Phase 3: Functional (non-type-aware React-compatible subset)
      "functional/no-classes": "error",
      "functional/no-class-inheritance": "error",
      "functional/no-this-expressions": "error",
      "functional/no-promise-reject": "off", // Promise rejection is required for fetch/error APIs.
      "functional/immutable-data": "off",
      "functional/no-let": "off",
      "functional/prefer-immutable-types": "off",
      "functional/no-conditional-statements": "off",
      "functional/no-expression-statements": "off",
      "functional/functional-parameters": "off",

      // Phase 3: Boundaries
      "boundaries/dependencies": [
        "error",
        {
          default: "allow",
          rules: [
            {
              from: { type: "core" },
              disallow: { to: { type: "features" } },
            },
            {
              from: { type: "i18n" },
              disallow: { to: { type: ["app", "core", "features"] } },
            },
          ],
        },
      ],

      // Phase 3: No Secrets
      "no-secrets/no-secrets": ["error", { tolerance: 4.5 }],

      // Phase 3: Deprecation (requires type information in the strict config)
      "deprecation/deprecation": "off",

      // Phase 3: Regexp
      "regexp/no-unused-capturing-group": "error",
      "regexp/no-useless-flag": "error",
      "regexp/prefer-regexp-exec": "error",
      "regexp/prefer-regexp-test": "error",

      // Phase 3: Perfectionist
      "perfectionist/sort-imports": "off",
      "perfectionist/sort-named-imports": "off",
      "perfectionist/sort-exports": "off",

      // Phase 3: Tailwind CSS v4 Compatible
      "tailwindcss/classnames-order": "off",
      "tailwindcss/enforces-negative-arbitrary-values": "off",
      "tailwindcss/enforces-shorthand": "off",
      "tailwindcss/no-custom-classname": "off",
      "tailwindcss/no-contradicting-classname": "off",
    },
  },
]);

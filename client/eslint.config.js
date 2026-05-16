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

// Phase 3 strict source gate plugins
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

  // ── Source files ────────────────────────────────────────────────────────
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [
      // Core JS + TypeScript (typed linting via project service)
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,

      // React
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      react.configs.flat.recommended,
      react.configs.flat["jsx-runtime"],

      // Accessibility (upgrade to errors for Phase 3)
      jsxA11y.flatConfigs.strict,

      // Code quality
      unicorn.configs.recommended,
      sonarjs.configs.recommended,

      // Phase 3 strict source gate
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
      promise.configs["flat/recommended"],
      security.configs.recommended,
      regexp.configs["flat/recommended"],

      // Prettier must be last — disables formatting rules
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
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    settings: {
      react: { version: "detect" },
      // Import resolution for TS aliases
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.app.json",
        },
        node: true,
      },
      // Boundaries: core must not import features; features should not import sibling features.
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
      // ── TypeScript ────────────────────────────────────────────────────
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/no-unnecessary-type-parameters": "error",
      // Unsafe rules: all errors — use proper types instead of any
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true, allowBoolean: false },
      ],
      // Arrow shorthand returning void is idiomatic React event handler syntax
      "@typescript-eslint/no-confusing-void-expression": "off",
      // Require explicit boolean conversions — catches truthy/falsy pitfalls
      "@typescript-eslint/strict-boolean-expressions": [
        "error",
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: true,
          allowNullableBoolean: true,
          allowNullableString: false,
          allowNullableNumber: false,
          allowAny: false,
        },
      ],
      // All switch cases must cover union members
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      // No variable shadowing — hard bugs in closures
      "@typescript-eslint/no-shadow": "error",
      // Prefer readonly for class properties that are never reassigned
      "@typescript-eslint/prefer-readonly": "error",
      // Functions returning a Promise must be declared async
      "@typescript-eslint/promise-function-async": ["error", { allowedPromiseNames: ["Thenable"] }],
      // Disallow unnecessary namespace qualifiers
      "@typescript-eslint/no-unnecessary-qualifier": "error",
      // Consistent array type declarations: T[] over Array<T>
      "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
      // Prefer ?? over || for nullish coalescing (strictTypeChecked already enables this)
      "@typescript-eslint/prefer-nullish-coalescing": [
        "error",
        { ignorePrimitives: { boolean: true } },
      ],

      // ── React ─────────────────────────────────────────────────────────
      // Inline component definitions cause remounts on every render
      "react/no-unstable-nested-components": ["error", { allowAsProps: false }],
      "react/jsx-no-useless-fragment": "error",
      // Array index keys hide bugs when list order changes
      "react/no-array-index-key": "error",
      "react/self-closing-comp": ["error", { component: true, html: true }],
      "react/jsx-pascal-case": "error",
      "react/no-direct-mutation-state": "error",
      "react/hook-use-state": "error",
      // Rendering falsy numbers (0) causes visible bugs — use ternary
      "react/jsx-no-leaked-render": ["error", { validStrategies: ["ternary"] }],

      // ── Accessibility (upgraded to errors for Phase 3) ────────────────
      // All a11y rules from jsxA11y.flatConfigs.strict are now errors

      // ── Unicorn ───────────────────────────────────────────────────────
      // File naming is a project convention, not enforced by linter
      "unicorn/filename-case": "off",
      // Short names like i, k, fn, cb are legitimate
      "unicorn/prevent-abbreviations": "off",
      // null is idiomatic in React and TypeScript APIs
      "unicorn/no-null": "off",
      // reduce() is fine when used correctly
      "unicorn/no-array-reduce": "off",
      // Negated conditions sometimes read more naturally
      "unicorn/no-negated-condition": "off",
      // ternary preference rules conflict with readable conditionals
      "unicorn/prefer-ternary": "off",
      // Switch-case brace style is a team preference
      "unicorn/switch-case-braces": "off",
      // CommonJS vs ESM: handled by tsconfig/vite bundler
      "unicorn/prefer-module": "off",
      // Top-level await not supported in all file contexts
      "unicorn/prefer-top-level-await": "off",
      // process.exit used in scripts
      "unicorn/no-process-exit": "off",
      // globalThis vs window: window is idiomatic in browser-only code
      "unicorn/prefer-global-this": "off",
      // for-of vs forEach: enforce for-of (better perf, supports async)
      "unicorn/no-array-for-each": "error",
      // prefer .at(-1) over [length - 1]
      "unicorn/prefer-at": "error",
      // prefer spread over Array.from
      "unicorn/prefer-spread": "error",
      // numeric separators (1_000_000) improve readability
      "unicorn/numeric-separators-style": "error",
      // nested ternary is a real readability issue
      "unicorn/no-nested-ternary": "error",
      // .sort() without compare fn gives wrong order for non-ASCII
      "unicorn/no-array-sort": "off",

      // ── SonarJS ───────────────────────────────────────────────────────
      "sonarjs/cognitive-complexity": ["error", 20],
      // Duplicate string detection has too many false positives for i18n keys
      "sonarjs/no-duplicate-string": "off",
      // Nested ternary already covered by unicorn
      "sonarjs/no-nested-conditional": "off",
      // Props must be read-only — prevents accidental mutation
      "sonarjs/prefer-read-only-props": "error",
      // void operator is the correct pattern for intentionally-ignored promises
      "sonarjs/void-use": "off",

      // ── Phase 3: Import & Unused Imports ──────────────────────────────
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
      "import/no-unresolved": "error",
      "import/default": "off", // React 19 uses named exports
      "import/no-named-as-default": "off", // i18next uses default + named exports
      "import/no-named-as-default-member": "off", // i18next uses default + named exports
      "import/no-cycle": "off", // Too many false positives in feature boundaries
      "import/no-self-import": "error",
      "import/no-useless-path-segments": "error",
      "import/no-mutable-exports": "error",
      "import/no-default-export": "off", // React components use default exports
      "import/no-deprecated": "error",
      "import/export": "off", // False positives with re-exports
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

      // ── Phase 3: ESLint Comments ──────────────────────────────────────
      "eslint-comments/disable-enable-pair": ["error", { allowWholeFile: true }],
      "eslint-comments/no-aggregating-enable": "error",
      "eslint-comments/no-duplicate-disable": "error",
      "eslint-comments/no-unlimited-disable": "error",
      "eslint-comments/no-unused-disable": "error",
      "eslint-comments/no-unused-enable": "error",
      "eslint-comments/require-description": "off", // Too noisy for inline disables

      // ── Phase 3: Security ─────────────────────────────────────────────
      "security/detect-object-injection": "off", // Too many false positives with TS
      "security/detect-non-literal-regexp": "off", // Legitimate use case
      "security/detect-unsafe-regex": "error",

      // ── Phase 3: Promise ──────────────────────────────────────────────
      "promise/prefer-await-to-then": "off", // .then() is valid for non-async contexts
      "promise/prefer-await-to-callbacks": "off", // React APIs use callbacks
      "promise/no-nesting": "error",
      "promise/no-return-wrap": "error",
      "promise/param-names": "error",
      "promise/no-new-statics": "error",

      // ── Phase 3: Functional (React-compatible immutability rules) ─────
      "functional/no-classes": "error",
      "functional/no-class-inheritance": "error",
      "functional/no-this-expressions": "error",
      "functional/no-promise-reject": "off", // Promise rejection is required for fetch/error APIs.
      // Disabled: these force immutable programming patterns that fight React state.
      "functional/immutable-data": "off",
      "functional/no-let": "off",
      "functional/prefer-immutable-types": "off",
      "functional/no-conditional-statements": "off",
      "functional/no-expression-statements": "off",
      "functional/functional-parameters": "off",

      // ── Phase 3: Boundaries ───────────────────────────────────────────
      "boundaries/dependencies": [
        "error",
        {
          default: "allow",
          rules: [
            // Core must not depend on feature-layer code.
            {
              from: { type: "core" },
              disallow: { to: { type: "features" } },
            },
            // i18n is standalone and must not pull UI/business feature code.
            {
              from: { type: "i18n" },
              disallow: { to: { type: ["app", "core", "features"] } },
            },
          ],
        },
      ],

      // ── Phase 3: No Secrets ───────────────────────────────────────────
      "no-secrets/no-secrets": ["error", { tolerance: 4.5 }],

      // ── Phase 3: Deprecation ───────────────────────────────────────────
      // Disabled until eslint-plugin-deprecation supports ESLint 9 context APIs.
      "deprecation/deprecation": "off",

      // ── Phase 3: Regexp ───────────────────────────────────────────────
      "regexp/no-unused-capturing-group": "error",
      "regexp/no-useless-flag": "error",
      "regexp/prefer-regexp-exec": "error",
      "regexp/prefer-regexp-test": "error",

      // ── Phase 3: Perfectionist (deterministic ordering) ───────────────
      // Disabled: conflicts with existing import style and prettier
      "perfectionist/sort-imports": "off",
      "perfectionist/sort-named-imports": "off",
      "perfectionist/sort-exports": "off",

      // ── Phase 3: Tailwind CSS v4 Compatible ───────────────────────────
      // Disabled: Tailwind v4 doesn't need config file
      "tailwindcss/classnames-order": "off",
      "tailwindcss/enforces-negative-arbitrary-values": "off",
      "tailwindcss/enforces-shorthand": "off",
      "tailwindcss/no-custom-classname": "off",
      "tailwindcss/no-contradicting-classname": "off",
    },
  },

  // ── Test files ──────────────────────────────────────────────────────────
  {
    files: ["tests/**/*.{ts,tsx}"],
    extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked, prettier],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
    },
  },
]);

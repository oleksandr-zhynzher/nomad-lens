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

      // Accessibility
      jsxA11y.flatConfigs.recommended,

      // Code quality
      unicorn.configs.recommended,
      sonarjs.configs.recommended,

      // Prettier must be last — disables formatting rules
      prettier,
    ],

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

      // ── Accessibility ─────────────────────────────────────────────────
      // Interactive elements with no accessible role
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",

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

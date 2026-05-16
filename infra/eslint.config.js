const js = require("@eslint/js");
const deprecation = require("eslint-plugin-deprecation");
const eslintComments = require("eslint-plugin-eslint-comments");
const functional = require("eslint-plugin-functional").default;
const globals = require("globals");
const importPlugin = require("eslint-plugin-import");
const noSecrets = require("eslint-plugin-no-secrets");
const prettier = require("eslint-config-prettier");
const promise = require("eslint-plugin-promise");
const regexp = require("eslint-plugin-regexp");
const security = require("eslint-plugin-security");
const sonarjs = require("eslint-plugin-sonarjs");
const { defineConfig, globalIgnores } = require("eslint/config");
const simpleImportSort = require("eslint-plugin-simple-import-sort");
const tseslint = require("typescript-eslint");
const unicorn = require("eslint-plugin-unicorn").default;
const unusedImports = require("eslint-plugin-unused-imports");

module.exports = defineConfig([
  globalIgnores(["dist", "cdk.out", "node_modules", "**/*.d.ts"]),
  {
    files: ["{bin,lib}/**/*.ts"],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
      unicorn.configs["flat/recommended"],
      sonarjs.configs.recommended,
      security.configs.recommended,
      promise.configs["flat/recommended"],
      regexp.configs["flat/recommended"],
      prettier,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
      sourceType: "module",
    },
    plugins: {
      deprecation,
      "eslint-comments": eslintComments,
      functional,
      "no-secrets": noSecrets,
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },
    rules: {
      // ── TypeScript ───────────────────────────────────────────────────────
      "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports", prefer: "type-imports" },
      ],
      "@typescript-eslint/no-confusing-void-expression": "off",
      "@typescript-eslint/no-deprecated": "off",
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/no-unnecessary-qualifier": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/no-unnecessary-type-parameters": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/prefer-nullish-coalescing": [
        "error",
        { ignorePrimitives: { boolean: true } },
      ],
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/promise-function-async": "error",
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
      "@typescript-eslint/strict-boolean-expressions": [
        "error",
        {
          allowAny: false,
          allowNullableBoolean: false,
          allowNullableNumber: false,
          allowNullableObject: false,
          allowNullableString: false,
          allowNumber: false,
          allowString: false,
        },
      ],
      "@typescript-eslint/switch-exhaustiveness-check": "error",

      // ── Imports ──────────────────────────────────────────────────────────
      "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
      "import/no-duplicates": "error",
      "import/order": "off",
      "simple-import-sort/exports": "error",
      "simple-import-sort/imports": "error",
      "unused-imports/no-unused-imports": "error",

      // ── Comments and deprecations ────────────────────────────────────────
      // eslint-plugin-deprecation currently calls context.getAncestors(),
      // which is not available under ESLint 9 flat config. Keep the plugin
      // wired here so the rule can be enabled once the plugin is compatible.
      "deprecation/deprecation": "off",
      "eslint-comments/disable-enable-pair": "error",
      "eslint-comments/no-aggregating-enable": "error",
      "eslint-comments/no-duplicate-disable": "error",
      "eslint-comments/no-unlimited-disable": "error",
      "eslint-comments/no-unused-enable": "error",

      // ── CDK-safe quality rules ───────────────────────────────────────────
      "functional/prefer-readonly-type": ["error", { ignoreClass: true, ignoreInterface: false }],
      "no-secrets/no-secrets": [
        "error",
        {
          additionalDelimiters: [],
          additionalRegexes: {},
          ignoreCase: false,
          ignoreContent: [],
          ignoreIdentifiers: [],
          ignoreModules: true,
          tolerance: 4.2,
        },
      ],
      "security/detect-child-process": "off",
      "sonarjs/aws-s3-bucket-insecure-http": "off",
      "sonarjs/aws-s3-bucket-versioning": "off",
      "sonarjs/cognitive-complexity": ["error", 20],
      "sonarjs/constructor-for-side-effects": "off",
      "sonarjs/no-nested-conditional": "off",
      "sonarjs/no-os-command-from-path": "off",

      // ── Unicorn ──────────────────────────────────────────────────────────
      "unicorn/filename-case": "off",
      "unicorn/import-style": "off",
      "unicorn/no-null": "off",
      "unicorn/numeric-separators-style": "error",
      "unicorn/prefer-module": "off",
      "unicorn/prevent-abbreviations": "off",
    },
  },
]);

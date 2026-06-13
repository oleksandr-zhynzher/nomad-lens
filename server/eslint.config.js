const js = require("@eslint/js");
const { defineConfig, globalIgnores } = require("eslint/config");
const prettier = require("eslint-config-prettier");
const eslintComments = require("eslint-plugin-eslint-comments");
const functionalModule = require("eslint-plugin-functional");
const importPlugin = require("eslint-plugin-import");
const noSecrets = require("eslint-plugin-no-secrets");
const promise = require("eslint-plugin-promise");
const regexpModule = require("eslint-plugin-regexp");
const security = require("eslint-plugin-security");
const simpleImportSort = require("eslint-plugin-simple-import-sort");
const sonarjsModule = require("eslint-plugin-sonarjs");
const unicornModule = require("eslint-plugin-unicorn");
const unusedImports = require("eslint-plugin-unused-imports");
const globals = require("globals");
const tseslint = require("typescript-eslint");

const functional = functionalModule.default ?? functionalModule;
const regexp = regexpModule.default ?? regexpModule;
const sonarjs = sonarjsModule.default ?? sonarjsModule;
const unicorn = unicornModule.default ?? unicornModule;

module.exports = defineConfig([
  globalIgnores(["dist", "coverage", "node_modules", "**/*.d.ts"]),
  {
    files: ["src/**/*.ts", "tests/**/*.ts"],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
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
        projectService: {
          allowDefaultProject: [
            "tests/*.ts",
            "src/__test__/*.ts",
            "src/middleware/__test__/*.ts",
            "src/routes/__test__/*.ts",
            "src/services/__test__/*.ts",
            "src/shared/__test__/*.ts",
            "src/utils/__test__/*.ts",
          ],
          maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 20,
        },
        tsconfigRootDir: __dirname,
      },
      sourceType: "module",
    },
    linterOptions: {
      reportUnusedDisableDirectives: "error",
      reportUnusedInlineConfigs: "error",
    },
    plugins: {
      "eslint-comments": eslintComments,
      functional,
      import: importPlugin,
      "no-secrets": noSecrets,
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
    },
    rules: {
      ...importPlugin.configs.recommended.rules,
      ...importPlugin.configs.typescript.rules,
      ...eslintComments.configs.recommended.rules,
      "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports", prefer: "type-imports" },
      ],
      "@typescript-eslint/no-confusing-void-expression": [
        "error",
        { ignoreArrowShorthand: true, ignoreVoidOperator: true },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: {
            arguments: false,
            attributes: false,
          },
        },
      ],
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/no-unnecessary-qualifier": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/no-unnecessary-type-parameters": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/prefer-nullish-coalescing": [
        "error",
        { ignorePrimitives: { boolean: true } },
      ],
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/promise-function-async": "error",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowBoolean: false, allowNumber: true },
      ],
      "@typescript-eslint/strict-boolean-expressions": [
        "error",
        {
          allowAny: false,
          allowNullableBoolean: true,
          allowNullableNumber: false,
          allowNullableObject: true,
          allowNullableString: true,
          allowNumber: false,
          allowString: true,
        },
      ],
      "@typescript-eslint/switch-exhaustiveness-check": "error",

      "functional/prefer-property-signatures": "error",

      "import/consistent-type-specifier-style": "off",
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
      "import/no-unresolved": "off",

      "no-secrets/no-secrets": ["error", { tolerance: 4.5 }],

      "promise/always-return": "off",
      "promise/catch-or-return": "off",

      "security/detect-non-literal-fs-filename": "off",
      "security/detect-object-injection": "off",

      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      "sonarjs/cognitive-complexity": ["error", 25],
      "sonarjs/cors": "off",
      "sonarjs/function-return-type": "off",
      "sonarjs/null-dereference": "off",
      "sonarjs/no-duplicate-string": "off",
      "sonarjs/no-nested-conditional": "off",
      "sonarjs/todo-tag": "off",
      "sonarjs/void-use": "off",

      "unicorn/filename-case": "off",
      "unicorn/no-array-callback-reference": "off",
      "unicorn/no-array-for-each": "error",
      "unicorn/no-array-reduce": "off",
      "unicorn/no-null": "off",
      "unicorn/no-process-exit": "off",
      "unicorn/prefer-module": "off",
      "unicorn/prefer-node-protocol": "error",
      "unicorn/prefer-top-level-await": "off",
      "unicorn/prevent-abbreviations": "off",

      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          vars: "all",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["src/generate.ts"],
    rules: {
      "sonarjs/cognitive-complexity": ["error", 250],
      "sonarjs/no-unused-collection": "off",
    },
  },
  {
    files: ["src/**/__test__/**/*.ts", "tests/**/*.ts"],
    rules: {
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/promise-function-async": "off",
      "@typescript-eslint/unbound-method": "off",
      "import/first": "off",
      "promise/param-names": "off",
      "simple-import-sort/imports": "off",
      "sonarjs/no-duplicate-string": "off",
      "sonarjs/no-element-overwrite": "off",
      "sonarjs/no-undefined-argument": "off",
      "unicorn/no-useless-undefined": "off",
      "unicorn/no-zero-fractions": "off",
      "unicorn/numeric-separators-style": "off",
      "unicorn/prefer-event-target": "off",
      "unicorn/prefer-response-static-json": "off",
    },
  },
]);

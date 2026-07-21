import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // ─── Custom quality rules ───────────────────────────────────────────────────
  {
    rules: {
      // Catch unused variables (allow underscore-prefixed intentional ignores)
      "no-unused-vars": "off", // Disabled in favour of the TS-aware version
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      // Prevent duplicate imports in the same file
      "no-duplicate-imports": "error",

      // React Hooks — prevents incorrect hook usage
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Prevent `any` from silently swallowing type errors
      "@typescript-eslint/no-explicit-any": "warn",

      // Prevent calling `console.log` in production code
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // Enforce consistent use of `import type` for type-only imports
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", disallowTypeAnnotations: false },
      ],
    },
  },
]);

export default eslintConfig;

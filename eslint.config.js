import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      // z3-solver's type system requires `any` in a few places
      "@typescript-eslint/no-explicit-any": "off",
      // A parameter named _like_this is unused on purpose (e.g. in a stub)
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
);

module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    "prettier",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/typescript",
  ],
  parser: "@typescript-eslint/parser",
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
    },
  ],
  plugins: ["@typescript-eslint", "import"],
  root: true,
  ignorePatterns: [
    "**/*.js",
    "**/*.jsx",
    "**/vite.config.ts",
    "packages/*/dist",
    "packages/app/out",
    "packages/api/src/ivls/generated/*",
  ],
  rules: {
    "@typescript-eslint/no-namespace": "warn",
    "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
    "@typescript-eslint/ban-types": "warn",

    "react/jsx-key": "warn",

    "react-hooks/exhaustive-deps": "warn",

    "import/no-cycle": "error",
    // TypeScript compilation already ensures that named imports exist in the referenced module
    "import/named": "off",

    //disabled checks:

    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "react/display-name": "off",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "react/jsx-uses-react": "off",
  },
  settings: {
    react: {
      version: "18",
    },
  },
};

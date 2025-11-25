import js from "@eslint/js";

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "coverage/**",
      "build/**",
      "public/**"
    ]
  },
  js.configs.recommended,
  {
    files: ["src/**/*.js", "src/**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module"
    },
    rules: {
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "no-console": "off"
    }
  }
];

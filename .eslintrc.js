/* eslint-env node */
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
    tsConfigRootDir: __dirname,
  },
  plugins: ["@typescript-eslint"],
  overrides: [
    {
      files: ["*.ts", "*.mts", "*.cts", "*.tsx"],
      rules: {
        "no-undef": "off",
      },
    },
  ],
  ignorePatterns: ["**/*.js"],
  root: true,
};

/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  singleQuote: false,
  trailingComma: "es5",
  printWidth: 80,
  tabWidth: 2,
  semi: true,
  arrowParens: "always",
  bracketSpacing: true,
  endOfLine: "lf",
  plugins: ["prettier-plugin-tailwindcss"],
};

module.exports = config;

module.exports = {
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  plugins: ["prettier"],
  globals: {
    chrome: "readonly",
  },
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
  },
  rules: {
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
      },
    ],
  },
};

module.exports = {
  "extends": [
    "airbnb",
    "plugin:react/recommended",
    "prettier",
    "prettier/react",
  ],
  plugins: [
    "react",
    "prettier",
  ],
  parser: "babel-eslint",
  rules: {
    strict: 0,
    "prettier/prettier": "error",
    "react/jsx-filename-extension": "off"
  }
};

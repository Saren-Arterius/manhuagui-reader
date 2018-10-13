module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
    'eslint:recommended',
    'airbnb',
    'plugin:vue/strongly-recommended',
  ],
  // required to lint *.vue files

  plugins: [
    'vue'
  ],
  // add your custom rules here
  rules: {
    "no-unused-expressions": 0,
    "strict": 0,
    "class-methods-use-this": 0,
    "arrow-body-style": 0,
    "no-plusplus": 0,
    "new-cap": 0,
    "no-undef": "error",
    "no-console": 0,
    "node/no-extraneous-require": 0,
    "no-process-exit": 0,
    "no-multi-spaces": "error",
    "indent": ["error", 2, {
      "SwitchCase": 1
    }],
    "semi": "error",
    "space-before-function-paren": ["error", {
      "anonymous": "always",
      "named": "always",
      "asyncArrow": "always"
    }],
    "no-mixed-spaces-and-tabs": "error",
    "no-restricted-globals": "off",
    "no-restricted-syntax": "off",
    "consistent-return": "error",
    "no-unused-vars": ["warn", {
      "args": "none"
    }],
    "no-trailing-spaces": "error",
    "comma-dangle": ["error", "never"],
    "eol-last": "error",
    "arrow-spacing": "error",
    "no-param-reassign": "off",
    "max-len": "off",
    "prefer-destructuring": "off",
    "no-underscore-dangle": "warn",
    "global-require": "off",
    "import/no-dynamic-require": "off",
    "no-alert": "off",
    "no-continue": "off",
    "func-names": "off",
    "no-await-in-loop": "off",
    "node/shebang": "off",
    "object-curly-spacing": ["error", "never"],
    "newline-per-chained-call": "off",
    "import/no-extraneous-dependencies": "off",
    "import/no-unresolved": "off",
    "vue/require-default-prop": "off"
  }
}

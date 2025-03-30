module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  rules: {
    // Custom rules can be added here
  },
  ignorePatterns: ['dist', 'node_modules', 'coverage'],
}; 
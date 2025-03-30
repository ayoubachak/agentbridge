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
    // Turn off no-explicit-any errors
    '@typescript-eslint/no-explicit-any': 'warn',
    // Allow unused variables when they are prefixed with _
    '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }]
  },
  ignorePatterns: ['dist', 'node_modules', 'coverage'],
}; 
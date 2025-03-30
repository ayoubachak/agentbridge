module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'react-native'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-native/all',
  ],
  env: {
    node: true,
    browser: true,
    'react-native/react-native': true,
    es6: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // Turn off no-explicit-any errors
    '@typescript-eslint/no-explicit-any': 'warn',
    // Allow unused variables when they are prefixed with _
    '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }]
  },
  ignorePatterns: ['dist', 'node_modules', 'coverage'],
}; 
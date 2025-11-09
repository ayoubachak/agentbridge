module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.ts?(x)',
    '**/?(*.)+(spec|test).ts?(x)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/examples/',
    'packages/frameworks/flutter',
    '\\.d\\.ts$', // Exclude .d.ts files
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  collectCoverageFrom: [
    'packages/**/src/**/*.{ts,tsx}',
    '!packages/**/dist/**',
    '!packages/frameworks/flutter/**',
    '!**/*.d.ts',
    '!examples/**',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@agentbridge/(.*)$': '<rootDir>/packages/$1/src',
  },
  // Exclude examples and dist from module resolution to avoid naming collisions
  modulePathIgnorePatterns: [
    '<rootDir>/examples/',
    '<rootDir>/packages/.*/dist/',
  ],
}; 
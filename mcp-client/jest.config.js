/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(node-fetch)/)'
  ],
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.interface.ts",
    "!src/**/*.d.ts",
    "!src/**/index.ts"
  ]
}; 
/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  moduleNameMapper: {
    '^@touchspin/react$': '<rootDir>/src/index.ts',
    '^@touchspin/core$': '<rootDir>/../../../packages/core/src/index.ts',
    '^@touchspin/core/(.*)$': '<rootDir>/../../../packages/core/src/$1.ts',
    '^@touchspin/renderer-vanilla$':
      '<rootDir>/../../../packages/renderers/vanilla/src/VanillaRenderer.ts',
    '^@touchspin/renderer-(.*)$': '<rootDir>/../../../packages/renderers/$1/src/$1Renderer.ts',
  },
  testMatch: ['**/unit-tests/**/*.test.ts', '**/unit-tests/**/*.test.tsx'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/bootstrap3.tsx',
    '!src/bootstrap4.tsx',
    '!src/bootstrap5.tsx',
    '!src/tailwind.tsx',
    '!src/vanilla.tsx',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'text-summary', 'lcovonly'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        types: ['jest', 'node'],
      },
    },
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          types: ['jest', 'node'],
        },
      },
    ],
    '^.+\\.jsx?$': 'babel-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!(@touchspin)/)'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
};

module.exports = config;

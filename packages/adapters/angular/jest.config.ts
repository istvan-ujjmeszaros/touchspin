import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.html$',
      },
    ],
  },
  moduleNameMapper: {
    '^@touchspin/angular$': '<rootDir>/src/public-api.ts',
    '^@touchspin/angular/(.*)$': '<rootDir>/src/$1',
    '^@touchspin/core$': '<rootDir>/../../../packages/core/dist/index.js',
    '^@touchspin/core/(.*)$': '<rootDir>/../../../packages/core/dist/$1',
    '^@touchspin/renderer-(.*)$': '<rootDir>/../../../packages/renderers/$1/dist/index.js',
  },
  testMatch: ['**/tests/**/*.spec.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/**/index.ts', '!src/public-api.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'text-summary', 'lcovonly'],
  moduleFileExtensions: ['ts', 'html', 'js', 'json', 'mjs'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
};

export default config;

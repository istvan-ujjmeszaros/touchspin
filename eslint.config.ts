import js from '@eslint/js';
import ts from 'typescript-eslint';
import path from 'node:path';

export default [
  {
    ignores: [
      'dist/**',
      '**/dist/**',
      '**/build/**',
      'reports/**',
      'tmp/**',
      'node_modules/**',
      '__tests__/html/assets/**',
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    files: ['packages/**/*.ts', 'packages/**/*.tsx'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: path.resolve('.'),
      },
    },
    rules: {
      'no-trailing-spaces': 'error',
      'quotes': ['error', 'single'],
      'eqeqeq': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }],
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
  // Forbid jQuery usage inside core package (SOLID boundary)
  {
    files: ['packages/core/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { paths: ['jquery'] }],
      'no-restricted-globals': ['error', 'jQuery', '$'],
    },
  },
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '__tests__/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: path.resolve('.'),
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        window: 'readonly',
        document: 'readonly',
        globalThis: 'readonly',
      },
    },
    rules: {
      'no-trailing-spaces': 'error',
      'quotes': ['error', 'single'],
      'eqeqeq': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }],
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
  {
    files: ['eslint.config.ts', 'playwright.config.ts', '**/playwright*.config.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      'no-trailing-spaces': 'error',
      'quotes': ['error', 'single'],
      'eqeqeq': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/consistent-type-assertions': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
  {
    files: ['scripts/**/*.js', 'scripts/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      'no-trailing-spaces': 'error',
      'quotes': ['error', 'single'],
      'eqeqeq': 'error',
      'no-undef': 'error',
    },
  },
];

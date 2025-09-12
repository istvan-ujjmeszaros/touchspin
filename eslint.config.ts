import js from '@eslint/js';
import ts from 'typescript-eslint';
import path from 'node:path';

export default [
  {
    ignores: [
      'dist/**',
      'reports/**',
      'tmp/**',
      'node_modules/**',
      '__tests__/html/assets/**',
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
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
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
];


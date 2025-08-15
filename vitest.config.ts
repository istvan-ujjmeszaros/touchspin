import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test file patterns
    include: ['**/?(*.)+(spec|test).[jt]s?(x)'],
    
    // Environment and setup
    environment: 'node',
    globalSetup: ['__tests__/helpers/vitestGlobalSetup.ts'],
    setupFiles: ['__tests__/helpers/vitestSetup.ts'],
    
    // Timeout configuration
    testTimeout: 60000,
    hookTimeout: 30000,
    
    // Sequential execution to avoid browser conflicts (like Jest --runInBand)
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    },
    
    // Better error reporting
    reporter: ['verbose'],
    
    // Coverage configuration (optional)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '__tests__/',
        'dist/',
        'demo/',
        '*.config.*'
      ]
    },
    
    // Retry configuration for flaky tests
    retry: 1,
    
    // Better cleanup
    clearMocks: true,
    restoreMocks: true
  }
});
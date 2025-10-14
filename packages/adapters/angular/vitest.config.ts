import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false, // Disable globals to avoid conflicts with Playwright
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/**/*.test.ts', 'tests/**/*', '**/*.d.ts'],
      all: true,
    },
  },
});

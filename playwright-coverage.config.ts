import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

/**
 * Playwright configuration for coverage collection
 */
export default defineConfig({
  ...baseConfig,

  // Use only chromium for coverage
  projects: [
    {
      name: 'chromium-coverage',
      testIgnore: '**/visual/**',
      use: {
        ...baseConfig.projects?.[0]?.use,
        // Enable coverage collection
        contextOptions: {
          ...baseConfig.projects?.[0]?.use?.contextOptions,
          // Enable JS coverage
          javaScriptEnabled: true,
        },
        launchOptions: {
          ...baseConfig.projects?.[0]?.use?.launchOptions,
          args: [
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
          ]
        }
      },
    }
  ],

  // Reporter configuration
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/playwright', open: 'never' }]
  ],

  // Global setup/teardown for coverage
  globalSetup: './coverage.setup.ts',
  globalTeardown: './coverage.teardown.ts',
});
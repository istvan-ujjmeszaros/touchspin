import { defineConfig, devices } from '@playwright/test';
import baseConfig from './playwright.config';
import path from 'path';

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
        ...devices['Desktop Chrome'],
        // Enable coverage collection
        contextOptions: {
          // Enable JS coverage
          javaScriptEnabled: true,
        },
        launchOptions: {
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
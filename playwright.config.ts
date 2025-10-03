import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
const DEV_BASE_URL = (process.env.DEV_BASE_URL || 'http://localhost:8866').replace(/\/$/, '');
const DEFAULT_BASE = 'http://localhost:8866';
const useExternalServer = DEV_BASE_URL !== DEFAULT_BASE;

// Allow controlling worker count via environment variable
const workerCount = process.env.PLAYWRIGHT_WORKERS
  ? parseInt(process.env.PLAYWRIGHT_WORKERS, 10)
  : undefined; // undefined = Playwright default (50% of cores)

export default defineConfig({
  testDir: './',
  testMatch: ['**/__tests__/**/*.spec.ts', '**/packages/**/tests/**/*.spec.ts'],
  testIgnore: ['**/node_modules/**', '**/dist/**', '**/build/**'],

  /* Control worker parallelization via PLAYWRIGHT_WORKERS env var */
  workers: workerCount,

  /* Run tests in files in parallel */
  fullyParallel: false, // Keep sequential for now to match Jest behavior

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* No retries; fail fast */
  retries: 0,
  // Stop as soon as a failure occurs on CI to surface issues quickly
  maxFailures: process.env.CI ? 1 : 0,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    [
      'html',
      {
        outputFolder: 'reports/playwright',
      },
    ],
    ['list'],
  ],

  /* Configure output directories */
  outputDir: 'reports/test-results',

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: DEV_BASE_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video recording */
    video: 'retain-on-failure',

    /* Global timeout settings */
    actionTimeout: 3000,
    navigationTimeout: 10000,
  },

  /* Global timeout */
  timeout: 15000,
  expect: {
    timeout: 3000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      testIgnore: '**/visual/**',
      use: { ...devices['Desktop Chrome'] },
    },

    // Visual regression testing project
    {
      name: 'visual-tests',
      testMatch: '**/visual/**/*.test.ts',
      use: {
        ...devices['Desktop Chrome'],
        // Fixed viewport for consistent screenshots
        viewport: { width: 1280, height: 720 },
        // Consistent color scheme
        colorScheme: 'light',
        // Disable animations for consistent screenshots
        launchOptions: {
          args: [
            '--force-prefers-reduced-motion',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
          ],
        },
      },
    },

    // Uncomment to test other browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  /* Serve repository root statically for tests (no HMR/bundling) */
  webServer: useExternalServer
    ? {
        url: DEV_BASE_URL,
        reuseExistingServer: true,
        timeout: 20000,
        stdout: 'pipe',
        stderr: 'pipe',
      }
    : {
        command: 'yarn serve:root',
        port: 8866,
        reuseExistingServer: true,
        timeout: 20000,
        stdout: 'pipe',
        stderr: 'pipe',
      },
});

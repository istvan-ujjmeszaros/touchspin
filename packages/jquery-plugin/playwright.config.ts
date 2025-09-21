import { defineConfig, devices } from '@playwright/test';

const DEV_BASE_URL = process.env.DEV_BASE_URL || 'http://localhost:8866';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/?(*.)+(spec|test).[jt]s?(x)',

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  maxFailures: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', {
      outputFolder: '../../reports/playwright/jquery-plugin'
    }],
    ['list']
  ],

  outputDir: '../../reports/test-results/jquery-plugin',

  use: {
    baseURL: DEV_BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 3000,
    navigationTimeout: 10000,
  },

  timeout: 15000,
  expect: {
    timeout: 3000
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'yarn dev',
    port: 8866,
    reuseExistingServer: true,
    timeout: 20000,
    cwd: '../..',
  },
});

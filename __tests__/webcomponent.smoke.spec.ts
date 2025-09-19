import { test, expect } from '@playwright/test';
import * as apiHelpers from './helpers/touchspinApiHelpers';
import './coverage.hooks';


test.describe('Web Component Smoke', () => {

  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html'); // Update URL as needed
  });

  test.afterEach(async ({ page }) => {
    await apiHelpers.collectCoverage(page, 'webcomponent.smoke');
  });

  test('renders and injects controls', async ({ page }) => {
    await page.goto('/packages/web-component/example/index.html');

    const elements = page.locator('touchspin-element');
    await expect(elements.first()).toBeVisible();

    // Wait briefly for internal wiring
    await apiHelpers.waitForTimeout(200);

    // Controls should be injected
    const upButtons = page.locator('[data-touchspin-injected="up"]');
    const count = await upButtons.count();
    expect(count).toBeGreaterThan(0);
  });
});


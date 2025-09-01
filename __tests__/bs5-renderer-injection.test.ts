import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinHelpers';

test.describe('Bootstrap 5 Renderer Injection Tests', () => {

  test.describe('Raw TouchSpin with Bootstrap 5 Renderer', () => {
    test.beforeEach(async ({ page }) => {
      await touchspinHelpers.startCoverage(page);
      await page.goto('/__tests__/html-minimal-rendering/bs5-renderer-raw.html');
    });

    test.afterEach(async ({ page }) => {
      await touchspinHelpers.collectCoverage(page, 'bs5-renderer-injection');
    });

    test('should inject up button with data attribute (raw core)', async ({ page }) => {
      // Wait for initialization to complete
      await page.waitForTimeout(200);

      // Check that the up button was injected with the correct data attribute
      const upButton = page.locator('[data-touchspin-injected="up"]');
      await expect(upButton).toBeVisible();
    });
  });

  test.describe('jQuery Wrapper with Bootstrap 5 Renderer', () => {
    test.beforeEach(async ({ page }) => {
      await touchspinHelpers.startCoverage(page);
      await page.goto('/__tests__/html-minimal-rendering/bs5-renderer-jquery.html');
    });

    test.afterEach(async ({ page }) => {
      await touchspinHelpers.collectCoverage(page, 'bs5-renderer-injection');
    });

    test('should inject up button with data attribute (jQuery)', async ({ page }) => {
      // Wait for initialization to complete
      await page.waitForTimeout(200);

      // Check that the up button was injected with the correct data attribute
      const upButton = page.locator('[data-touchspin-injected="up"]');
      await expect(upButton).toBeVisible();
    });
  });
});

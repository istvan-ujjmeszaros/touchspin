import { test, expect } from '@playwright/test';
import * as apiHelpers from './helpers/touchspinApiHelpers';
import './coverage.hooks';


test.describe('Tailwind advanced container', () => {

  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html'); // Update URL as needed
  });

  test.afterEach(async ({ page }) => {
    await apiHelpers.collectCoverage(page, 'wrapperAdvancedTailwindContainer');
  });

  test('enhances [data-touchspin-advanced] and cleans up on destroy', async ({ page }) => {
    await page.goto('/__tests__/html-package/tailwind-renderer-jquery.html');

    const container = page.locator('[data-testid="tw-adv-container"]');
    const input = page.locator('[data-testid="tw-adv-input"]');

    await expect(container).toBeVisible();
    await expect(input).toBeVisible();

    // Initialize advanced widget
    await page.click('[data-testid="btn-adv-init"]');

    // The container should be marked as enhanced and have one up/down button
    await expect(container).toHaveAttribute('data-touchspin-injected', 'wrapper-advanced');
    await expect(container.locator('.tailwind-btn[data-touchspin-injected="down"]')).toHaveCount(1);
    await expect(container.locator('.tailwind-btn[data-touchspin-injected="up"]')).toHaveCount(1);

    // Prefix/Postfix should be injected when provided in settings
    await expect(container.locator('[data-touchspin-injected="prefix"]')).toHaveCount(1);
    await expect(container.locator('[data-touchspin-injected="postfix"]')).toHaveCount(1);

    // Destroy should remove injected elements but leave container and input intact
    await page.click('[data-testid="btn-adv-destroy"]');

    await expect(container).toBeVisible();
    await expect(input).toBeVisible();
    await expect(container.locator('[data-touchspin-injected]')).toHaveCount(0);
    await expect(container.locator('.tailwind-btn[data-touchspin-injected="down"]')).toHaveCount(0);
    await expect(container.locator('.tailwind-btn[data-touchspin-injected="up"]')).toHaveCount(0);
  });
});


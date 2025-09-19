// @ts-check
import { test, expect } from '@playwright/test';
import './coverage.hooks';
import * as apiHelpers from './helpers/touchspinApiHelpers';


test.describe('Core Lifecycle (Direct)', () => {

  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html'); // Update URL as needed
  });

  test.afterEach(async ({ page }) => {
    await apiHelpers.collectCoverage(page, 'coreLifecycle');
  });

  test('should not respond to commands after destroy (core-only)', async ({ page }) => {
    // Navigate to the core smoke test page (no jQuery)
    await page.goto('/__tests__/html-package/core-smoke-simple.html');

    const input = page.locator('#simple-input');
    const initButton = page.getByRole('button', { name: 'Initialize' });
    const upOnceButton = page.getByRole('button', { name: 'Up Once' });
    const destroyButton = page.getByRole('button', { name: 'Destroy' });
    const updateStepButton = page.getByRole('button', { name: 'Set Step=10' });

    // Verify initial state (auto-initialized on load)
    await expect(input).toHaveValue('50');

    // Step 1: Reinitialize to ensure fresh state (page auto-initializes)
    await initButton.click();
    await expect(input).toHaveValue('50'); // Should remain 50

    // Step 2: Click upOnce twice (should increment from 50 → 51 → 52)
    await upOnceButton.click();
    await expect(input).toHaveValue('51');

    await upOnceButton.click();
    await expect(input).toHaveValue('52');

    // Step 3: Destroy the TouchSpin core instance
    await destroyButton.click();

    // Step 4: Verify that upOnce() does nothing after destroy
    const valueAfterDestroy = await input.inputValue();
    await upOnceButton.click();
    await expect(input).toHaveValue(valueAfterDestroy); // Should remain unchanged

    // Step 5: Verify that updateSettings() does nothing after destroy
    await updateStepButton.click();
    await expect(input).toHaveValue(valueAfterDestroy); // Should still remain unchanged

    // Additional verification: Try upOnce again to make sure it's truly inactive
    await upOnceButton.click();
    await expect(input).toHaveValue(valueAfterDestroy); // Should still remain unchanged

    // Verify the final value is still 52 (from before destroy)
    await expect(input).toHaveValue('52');
  });

  test('should properly reinitialize after destroy (core-only)', async ({ page }) => {
    // Navigate to the core smoke test page
    await page.goto('/__tests__/html-package/core-smoke-simple.html');

    const input = page.locator('#simple-input');
    const initButton = page.getByRole('button', { name: 'Initialize' });
    const upOnceButton = page.getByRole('button', { name: 'Up Once' });
    const destroyButton = page.getByRole('button', { name: 'Destroy' });

    // Initialize → increment → destroy → reinitialize → increment should work
    await initButton.click();
    await upOnceButton.click();
    await expect(input).toHaveValue('51');

    await destroyButton.click();

    // After destroy, upOnce should not work
    await upOnceButton.click();
    await expect(input).toHaveValue('51');

    // But after reinit, it should work again
    await initButton.click();
    await upOnceButton.click();
    await expect(input).toHaveValue('52');
  });
});

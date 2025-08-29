// @ts-check
import { test, expect } from '@playwright/test';

test.describe('jQuery Plugin Lifecycle', () => {
  test('should not respond to commands after destroy', async ({ page }) => {
    // Navigate to the jQuery plugin smoke test page
    await page.goto('/__tests__/html-package/jquery-plugin-smoke.html');
    
    const input = page.locator('#jq-input');
    const initButton = page.locator('#btn-init');
    const upOnceButton = page.locator('#btn-uponce');
    const destroyButton = page.locator('#btn-destroy');
    const updateButton = page.locator('#btn-update');
    
    // Verify initial state
    await expect(input).toHaveValue('10');
    
    // Step 1: Initialize TouchSpin
    await initButton.click();
    await expect(page.locator('#status')).toContainText('Initialized');
    
    // Step 2: Click upOnce twice (should increment from 10 → 11 → 12)
    await upOnceButton.click();
    await expect(input).toHaveValue('11');
    
    await upOnceButton.click();
    await expect(input).toHaveValue('12');
    
    // Step 3: Destroy the TouchSpin instance
    await destroyButton.click();
    await expect(page.locator('#status')).toContainText('Destroyed');
    
    // Step 4: Verify that upOnce() does nothing after destroy
    const valueAfterDestroy = await input.inputValue();
    await upOnceButton.click();
    await expect(input).toHaveValue(valueAfterDestroy); // Should remain unchanged
    
    // Step 5: Verify that updateSettings() does nothing after destroy
    await updateButton.click();
    await expect(input).toHaveValue(valueAfterDestroy); // Should still remain unchanged
    
    // Additional verification: Try upOnce again to make sure it's truly inactive
    await upOnceButton.click();
    await expect(input).toHaveValue(valueAfterDestroy); // Should still remain unchanged
    
    // Verify the final value is still 12 (from before destroy)
    await expect(input).toHaveValue('12');
  });

  test('should properly reinitialize after destroy', async ({ page }) => {
    // Navigate to the jQuery plugin smoke test page
    await page.goto('/__tests__/html-package/jquery-plugin-smoke.html');
    
    const input = page.locator('#jq-input');
    const initButton = page.locator('#btn-init');
    const upOnceButton = page.locator('#btn-uponce');
    const destroyButton = page.locator('#btn-destroy');
    
    // Initialize → increment → destroy → reinitialize → increment should work
    await initButton.click();
    await upOnceButton.click();
    await expect(input).toHaveValue('11');
    
    await destroyButton.click();
    
    // After destroy, upOnce should not work
    await upOnceButton.click();
    await expect(input).toHaveValue('11');
    
    // But after reinit, it should work again
    await initButton.click();
    await upOnceButton.click();
    await expect(input).toHaveValue('12');
  });
});
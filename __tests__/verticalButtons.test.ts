import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinHelpers';

test.describe('Vertical Buttons', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/__tests__/html/index-bs4.html');
    await touchspinHelpers.waitForTouchSpinReady(page, '#input_vertical');
  });

  test('should render vertical button structure correctly', async ({ page }) => {
    // Check for vertical wrapper
    const verticalWrapper = page.locator('.bootstrap-touchspin-vertical-button-wrapper').first();
    await expect(verticalWrapper).toBeVisible();

    // Check buttons are inside wrapper
    const upButton = page.locator('.bootstrap-touchspin-vertical-button-wrapper .bootstrap-touchspin-up').first();
    const downButton = page.locator('.bootstrap-touchspin-vertical-button-wrapper .bootstrap-touchspin-down').first();
    
    await expect(upButton).toBeVisible();
    await expect(downButton).toBeVisible();
  });

  test('should function correctly with vertical buttons', async ({ page }) => {
    const selector = '#input_vertical';
    
    // Test increment
    await touchspinHelpers.touchspinClickUp(page, selector);
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
    
    // Test decrement
    await touchspinHelpers.touchspinClickDown(page, selector);
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('50');
  });

  test('should work with size variations and prefix/postfix', async ({ page }) => {
    // Test small size with prefix/postfix
    const smallSelector = '#input_group_sm_vertical';
    await touchspinHelpers.touchspinClickUp(page, smallSelector);
    expect(await touchspinHelpers.readInputValue(page, smallSelector)).toBe('51');
    
    // Verify prefix/postfix exist
    const prefix = page.locator('.bootstrap-touchspin-prefix').first();
    const postfix = page.locator('.bootstrap-touchspin-postfix').first();
    await expect(prefix).toBeVisible();
    await expect(postfix).toBeVisible();
  });

  test('should work with existing DOM input groups', async ({ page }) => {
    const selector = '#input_group_from_dom_prefix_postfix_vertical';
    
    // Should maintain existing DOM structure
    const existingPrefix = await page.evaluate(() => {
      const container = document.querySelector('#input_group_from_dom_prefix_postfix_vertical')?.parentElement;
      return container?.querySelector('.input-group-addon:not(.bootstrap-touchspin-prefix), .input-group-text:not(.bootstrap-touchspin-prefix)') !== null;
    });
    expect(existingPrefix).toBe(true);
    
    // Should still function correctly
    await touchspinHelpers.touchspinClickUp(page, selector);
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
  });

  test('should handle disabled state for vertical buttons', async ({ page }) => {
    const selector = '#input_vertical';
    
    await touchspinHelpers.setInputAttr(page, selector, 'disabled', true);
    
    // Buttons should be disabled
    const upButtonDisabled = await page.locator('.bootstrap-touchspin-vertical-button-wrapper .bootstrap-touchspin-up').first().evaluate((button) => {
      return (button as HTMLButtonElement).disabled || button.hasAttribute('disabled');
    });
    
    expect(upButtonDisabled).toBe(true);
    
    // Functionality should be disabled
    await touchspinHelpers.touchspinClickUp(page, selector);
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('50');
  });

  test('should support long press spinning for vertical buttons', async ({ page }) => {
    const selector = '#input_vertical';
    
    // Simulate long press by holding mousedown for longer than stepintervaldelay (500ms)
    await page.locator('.bootstrap-touchspin-vertical-button-wrapper .bootstrap-touchspin-up').first().evaluate((button) => {
      button.dispatchEvent(new Event('mousedown', { bubbles: true }));
    });
    
    // Wait longer than the default stepintervaldelay (500ms) to trigger spinning
    await touchspinHelpers.waitForTimeout(700);
    
    await page.locator('.bootstrap-touchspin-vertical-button-wrapper .bootstrap-touchspin-up').first().evaluate((button) => {
      button.dispatchEvent(new Event('mouseup', { bubbles: true }));
    });
    
    // Should have incremented multiple times due to spinning
    const finalValue = parseInt(await touchspinHelpers.readInputValue(page, selector) || '50');
    expect(finalValue).toBeGreaterThan(51);
  });
});
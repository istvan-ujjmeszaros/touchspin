import { test, expect } from '@playwright/test';
import * as apiHelpers from './helpers/touchspinApiHelpers';
import './coverage.hooks';

test.describe('Vertical Buttons', () => {

  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html');
  });

  test.afterEach(async ({ page }) => {
    await apiHelpers.collectCoverage(page, 'verticalButtons');
  });

  test('should render vertical button structure correctly', async ({ page }) => {
    const testid = 'touchspin-vertical';
    const wrapper = await apiHelpers.getElement(page, testid + '-wrapper');

    // Check for vertical wrapper within the specific TouchSpin
    const verticalWrapper = wrapper.locator('.bootstrap-touchspin-vertical-button-wrapper');
    await expect(verticalWrapper).toBeVisible();

    // Check buttons are inside wrapper
    const upButton = verticalWrapper.locator('.bootstrap-touchspin-up');
    const downButton = verticalWrapper.locator('.bootstrap-touchspin-down');

    await expect(upButton).toBeVisible();
    await expect(downButton).toBeVisible();
  });

  test('should function correctly with vertical buttons', async ({ page }) => {
    const testid = 'touchspin-vertical';

    // Test increment
    await apiHelpers.clickUpButton(page, testid);
    await expect.poll(
      async () => await apiHelpers.readInputValue(page, testid)
    ).toBe('51');

    // Test decrement
    await apiHelpers.clickDownButton(page, testid);
    await expect.poll(
      async () => await apiHelpers.readInputValue(page, testid)
    ).toBe('50');
  });

  test('should work with size variations and prefix/postfix', async ({ page }) => {
    const testid = 'touchspin-group-sm-vertical';
    await apiHelpers.clickUpButton(page, testid);
    await expect.poll(
      async () => await apiHelpers.readInputValue(page, testid)
    ).toBe('51');

    // Verify prefix/postfix exist using specific testids
    const prefix = page.locator(`[data-testid="${testid}-prefix"]`);
    const postfix = page.locator(`[data-testid="${testid}-postfix"]`);
    await expect(prefix).toBeVisible();
    await expect(postfix).toBeVisible();
  });

  test('should work with existing DOM input groups', async ({ page }) => {
    const testid = 'touchspin-prefix-postfix-vertical';

    // Should maintain existing DOM structure
    const existingPrefix = await page.evaluate((testId) => {
      const input = document.querySelector(`[data-testid="${testId}"]`);
      const container = input?.parentElement;
      return container?.querySelector('.input-group-addon:not([data-touchspin-injected="prefix"]), .input-group-text:not([data-touchspin-injected="prefix"])') !== null;
    }, testid);
    expect(existingPrefix).toBe(true);

    // Should still function correctly
    await apiHelpers.clickUpButton(page, testid);
    await expect.poll(
      async () => await apiHelpers.readInputValue(page, testid)
    ).toBe('51');
  });

  test('should handle disabled state for vertical buttons', async ({ page }) => {
    const testid = 'touchspin-vertical';

    await apiHelpers.setInputAttr(page, testid, 'disabled', true);

    // Buttons should be disabled
    const upButtonDisabled = await page.locator('.bootstrap-touchspin-vertical-button-wrapper .bootstrap-touchspin-up').first().evaluate((button) => {
      return (button as HTMLButtonElement).disabled || button.hasAttribute('disabled');
    });

    expect(upButtonDisabled).toBe(true);

    // Functionality should be disabled
    await apiHelpers.clickUpButton(page, testid);
    expect(await apiHelpers.readInputValue(page, testid)).toBe('50');
  });

  test('should support long press spinning for vertical buttons', async ({ page }) => {
    const testid = 'touchspin-vertical';

    // Simulate long press by holding mousedown for longer than stepintervaldelay (500ms)
    await page.locator('.bootstrap-touchspin-vertical-button-wrapper .bootstrap-touchspin-up').first().evaluate((button) => {
      button.dispatchEvent(new Event('mousedown', { bubbles: true }));
    });

    // Wait longer than the default stepintervaldelay (500ms) to trigger spinning
    await apiHelpers.waitForTimeout(700);

    await page.locator('.bootstrap-touchspin-vertical-button-wrapper .bootstrap-touchspin-up').first().evaluate((button) => {
      button.dispatchEvent(new Event('mouseup', { bubbles: true }));
    });

    // Should have incremented multiple times due to spinning
    const finalValue = parseInt(await apiHelpers.readInputValue(page, testid) || '50');
    expect(finalValue).toBeGreaterThan(51);
  });
});

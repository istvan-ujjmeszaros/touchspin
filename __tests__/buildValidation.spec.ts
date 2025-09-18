import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinHelpers';
import './coverage.hooks';

test.describe('Build Validation Tests', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'buildValidation');
  });

  test('Bootstrap 3 UMD build should work', async ({ page }) => {
    await page.goto('/__tests__/html/build-bs3-umd.html');
    await page.waitForLoadState('networkidle');

    // Check that TouchSpin is available
    const touchSpinExists = await page.evaluate(() => {
      return typeof window.jQuery !== 'undefined' &&
             typeof window.jQuery.fn.TouchSpin === 'function';
    });
    expect(touchSpinExists).toBe(true);

    // Test basic functionality
    await touchspinHelpers.touchspinClickUp(page, 'build-test');
    const value = await touchspinHelpers.readInputValue(page, 'build-test');
    expect(parseInt(value)).toBe(51);
  });

  test('Bootstrap 4 UMD build should work', async ({ page }) => {
    await page.goto('/__tests__/html/build-bs4-umd.html');
    await page.waitForLoadState('networkidle');

    // Check that TouchSpin is available
    const touchSpinExists = await page.evaluate(() => {
      return typeof window.jQuery !== 'undefined' &&
             typeof window.jQuery.fn.TouchSpin === 'function';
    });
    expect(touchSpinExists).toBe(true);

    // Test basic functionality
    await touchspinHelpers.touchspinClickUp(page, 'build-test');
    const value = await touchspinHelpers.readInputValue(page, 'build-test');
    expect(parseInt(value)).toBe(51);
  });

  test('Bootstrap 5 UMD build should work', async ({ page }) => {
    await page.goto('/__tests__/html/build-bs5-umd.html');
    await page.waitForLoadState('networkidle');

    // Check that TouchSpin is available
    const touchSpinExists = await page.evaluate(() => {
      return typeof window.jQuery !== 'undefined' &&
             typeof window.jQuery.fn.TouchSpin === 'function';
    });
    expect(touchSpinExists).toBe(true);

    // Test basic functionality
    await touchspinHelpers.touchspinClickUp(page, 'build-test');
    const value = await touchspinHelpers.readInputValue(page, 'build-test');
    expect(parseInt(value)).toBe(51);
  });

  test('Tailwind build should work', async ({ page }) => {
    await page.goto('/__tests__/html/build-tailwind.html');
    await page.waitForLoadState('networkidle');

    // Check that TouchSpin is available
    const touchSpinExists = await page.evaluate(() => {
      return typeof window.jQuery !== 'undefined' &&
             typeof window.jQuery.fn.TouchSpin === 'function';
    });
    expect(touchSpinExists).toBe(true);

    // Test basic functionality
    await touchspinHelpers.touchspinClickUp(page, 'build-test');
    const value = await touchspinHelpers.readInputValue(page, 'build-test');
    expect(parseInt(value)).toBe(51);
  });

  // ESM test removed - the ESM build only exports the core module, not the jQuery wrapper
});
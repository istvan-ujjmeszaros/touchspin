import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinHelpers';

test.describe('RTL (Right-to-Left) Support', () => {

  test.describe('Bootstrap 3 RTL', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/__tests__/html/rtl-bs3.html');
      await touchspinHelpers.waitForTouchSpinReady(page, '#testinput_default');
    });

    test('should render and function correctly in RTL layout', async ({ page }) => {
      const selector = '#testinput_default';

      // Check that the page has RTL direction
      const htmlDir = await page.$eval('html', el => el.getAttribute('dir'));
      const bodyDir = await page.$eval('body', el => el.getAttribute('dir'));
      const rtlClass = await page.$eval('body', el => el.classList.contains('rtl'));

      expect(htmlDir === 'rtl' || bodyDir === 'rtl' || rtlClass).toBe(true);

      // Check that TouchSpin buttons are rendered and functional
      await touchspinHelpers.touchspinClickUp(page, selector);
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');

      await touchspinHelpers.touchspinClickDown(page, selector);
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('50');
    });

    test('should handle vertical buttons and prefix/postfix in RTL', async ({ page }) => {
      // Test vertical buttons
      const verticalSelector = '#input_vertical';
      await touchspinHelpers.touchspinClickUp(page, verticalSelector);
      expect(await touchspinHelpers.readInputValue(page, verticalSelector)).toBe('51');

      // Test prefix/postfix elements exist and are functional
      const prefixSelector = '#input_group_sm';
      const prefix = page.locator('.bootstrap-touchspin-prefix');
      const postfix = page.locator('.bootstrap-touchspin-postfix');

      await expect(prefix).toBeVisible();
      await expect(postfix).toBeVisible();

      await touchspinHelpers.touchspinClickUp(page, prefixSelector);
      expect(await touchspinHelpers.readInputValue(page, prefixSelector)).toBe('51');
    });
  });

  test.describe('Bootstrap 4 RTL', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/__tests__/html/rtl-bs4.html');
      await touchspinHelpers.waitForTouchSpinReady(page, '#testinput_default');
    });

    test('should render and function correctly in RTL layout', async ({ page }) => {
      const selector = '#testinput_default';

      // Check RTL direction
      const htmlDir = await page.$eval('html', el => el.getAttribute('dir'));
      expect(htmlDir).toBe('rtl');

      // Test basic functionality in RTL
      await touchspinHelpers.touchspinClickUp(page, selector);
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');

      // Check Bootstrap 4 specific structure exists
      const hasBS4Structure = await page.evaluate(() => {
        return document.querySelector('.input-group-prepend') !== null ||
               document.querySelector('.input-group-append') !== null;
      });
      expect(hasBS4Structure).toBe(true);
    });
  });

  test.describe('Bootstrap 5 RTL', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/__tests__/html/rtl-bs5.html');
      await touchspinHelpers.waitForTouchSpinReady(page, '#testinput_default');
    });

    test('should render and function correctly in RTL layout', async ({ page }) => {
      const selector = '#testinput_default';

      // Check RTL direction and Bootstrap 5 RTL CSS
      const htmlDir = await page.$eval('html', el => el.getAttribute('dir'));
      expect(htmlDir).toBe('rtl');

      const rtlCSS = page.locator('link[href*="bootstrap.rtl.min.css"]');
      await expect(rtlCSS).toBeVisible();

      // Test functionality
      await touchspinHelpers.touchspinClickUp(page, selector);
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');

      await touchspinHelpers.touchspinClickDown(page, selector);
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('50');
    });

    test('should handle Bootstrap 5 structure without deprecated classes', async ({ page }) => {
      // Verify no deprecated prepend/append classes exist
      const hasDeprecatedClasses = await page.evaluate(() => {
        return document.querySelector('.input-group-prepend') !== null ||
               document.querySelector('.input-group-append') !== null;
      });
      expect(hasDeprecatedClasses).toBe(false);

      // Test prefix/postfix with direct input-group-text
      const prefixSelector = '#input_group_sm';
      const directPrefix = page.locator('.bootstrap-touchspin-prefix.input-group-text');
      await expect(directPrefix).toBeVisible();

      await touchspinHelpers.touchspinClickUp(page, prefixSelector);
      expect(await touchspinHelpers.readInputValue(page, prefixSelector)).toBe('51');
    });
  });

  test.describe('RTL Text Input Handling', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/__tests__/html/rtl-bs4.html');
      await touchspinHelpers.waitForTouchSpinReady(page, '#testinput_default');
    });

    test('should handle manual text input correctly in RTL', async ({ page }) => {
      const selector = '#testinput_default';

      // Test manual input of values
      await touchspinHelpers.fillWithValue(page, selector, '42');
      await page.keyboard.press('Tab');

      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('42');

      // Test decimal values in RTL
      const decimalSelector = '#testinput_decimals';
      await touchspinHelpers.fillWithValue(page, decimalSelector, '12.34');
      await page.keyboard.press('Tab');

      expect(await touchspinHelpers.readInputValue(page, decimalSelector)).toBe('12.34');
    });
  });
});

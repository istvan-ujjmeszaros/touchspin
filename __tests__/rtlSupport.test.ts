import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinHelpers';

test.describe('RTL (Right-to-Left) Support', () => {

  test.describe('Bootstrap 3 RTL', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/__tests__/html/rtl-bs3.html');
      await touchspinHelpers.waitForTouchSpinReady(page, 'touchspin-rtl-default');
    });

    test('should render and function correctly in RTL layout', async ({ page }) => {
      const testid = 'touchspin-rtl-default';

      // Check that the page has RTL direction
      const htmlDir = await page.locator('html').first().evaluate(el => el.getAttribute('dir'));
      const bodyDir = await page.locator('body').first().evaluate(el => el.getAttribute('dir'));
      const rtlClass = await page.locator('body').first().evaluate(el => el.classList.contains('rtl'));

      expect(htmlDir === 'rtl' || bodyDir === 'rtl' || rtlClass).toBe(true);

      // Check that TouchSpin buttons are rendered and functional
      await touchspinHelpers.touchspinClickUp(page, testid);
      expect(await touchspinHelpers.readInputValue(page, testid)).toBe('51');

      await touchspinHelpers.touchspinClickDown(page, testid);
      expect(await touchspinHelpers.readInputValue(page, testid)).toBe('50');
    });

    test('should handle vertical buttons and prefix/postfix in RTL', async ({ page }) => {
      // TODO: Add testid to input_vertical in RTL HTML files
      const verticalSelector = '#input_vertical';
      await touchspinHelpers.touchspinClickUp(page, verticalSelector);
      expect(await touchspinHelpers.readInputValue(page, verticalSelector)).toBe('51');

      // TODO: Add testid to input_group_sm in RTL HTML files
      const prefixSelector = '#input_group_sm';
      const prefix = page.locator('.bootstrap-touchspin-prefix').first();
      const postfix = page.locator('.bootstrap-touchspin-postfix').first();

      await expect(prefix).toBeVisible();
      await expect(postfix).toBeVisible();

      await touchspinHelpers.touchspinClickUp(page, prefixSelector);
      expect(await touchspinHelpers.readInputValue(page, prefixSelector)).toBe('51');
    });
  });

  test.describe('Bootstrap 4 RTL', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/__tests__/html/rtl-bs4.html');
      await touchspinHelpers.waitForTouchSpinReady(page, 'touchspin-rtl-default');
    });

    test('should render and function correctly in RTL layout', async ({ page }) => {
      const testid = 'touchspin-rtl-default';

      // Check RTL direction
      const htmlDir = await page.locator('html').first().evaluate(el => el.getAttribute('dir'));
      expect(htmlDir).toBe('rtl');

      // Test basic functionality in RTL
      await touchspinHelpers.touchspinClickUp(page, testid);
      expect(await touchspinHelpers.readInputValue(page, testid)).toBe('51');

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
      await touchspinHelpers.waitForTouchSpinReady(page, 'touchspin-rtl-default');
    });

    test('should render and function correctly in RTL layout', async ({ page }) => {
      const testid = 'touchspin-rtl-default';

      // Check RTL direction and Bootstrap 5 RTL CSS
      const htmlDir = await page.locator('html').first().evaluate(el => el.getAttribute('dir'));
      expect(htmlDir).toBe('rtl');

      const rtlCSS = page.locator('link[href*="bootstrap.rtl.min.css"]').first();
      await expect(rtlCSS).toBeAttached();

      // Test functionality
      await touchspinHelpers.touchspinClickUp(page, testid);
      expect(await touchspinHelpers.readInputValue(page, testid)).toBe('51');

      await touchspinHelpers.touchspinClickDown(page, testid);
      expect(await touchspinHelpers.readInputValue(page, testid)).toBe('50');
    });

    test('should handle Bootstrap 5 structure without deprecated classes', async ({ page }) => {
      // Verify no deprecated prepend/append classes exist
      const hasDeprecatedClasses = await page.evaluate(() => {
        return document.querySelector('.input-group-prepend') !== null ||
               document.querySelector('.input-group-append') !== null;
      });
      expect(hasDeprecatedClasses).toBe(false);

      // TODO: Add testid to input_group_sm in RTL HTML files
      const prefixSelector = '#input_group_sm';
      const directPrefix = page.locator('.bootstrap-touchspin-prefix.input-group-text').first();
      await expect(directPrefix).toBeVisible();

      await touchspinHelpers.touchspinClickUp(page, prefixSelector);
      expect(await touchspinHelpers.readInputValue(page, prefixSelector)).toBe('51');
    });
  });

  test.describe('RTL Text Input Handling', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/__tests__/html/rtl-bs4.html');
      await touchspinHelpers.waitForTouchSpinReady(page, 'touchspin-rtl-default');
    });

    test('should handle manual text input correctly in RTL', async ({ page }) => {
      const testid = 'touchspin-rtl-default';

      // Test manual input of values
      await touchspinHelpers.fillWithValue(page, testid, '42');
      await page.keyboard.press('Tab');

      expect(await touchspinHelpers.readInputValue(page, testid)).toBe('42');

      // Test decimal values in RTL
      const decimalTestid = 'touchspin-rtl-decimals';
      await touchspinHelpers.fillWithValue(page, decimalTestid, '12.34');
      await page.keyboard.press('Tab');

      expect(await touchspinHelpers.readInputValue(page, decimalTestid)).toBe('12.34');
    });
  });
});

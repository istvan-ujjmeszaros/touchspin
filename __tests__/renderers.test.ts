import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinHelpers';

test.describe('Cross-Version Renderer Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'cross-version-consistency');
  });

  test('should maintain consistent button behavior across Bootstrap versions', async ({ page }) => {
    const versions = [
      { name: 'Bootstrap 3', html: 'index-bs3.html' },
      { name: 'Bootstrap 4', html: 'index-bs4.html' },
      { name: 'Bootstrap 5', html: 'index-bs5.html' }
    ];

    for (const version of versions) {
      await page.goto(`/__tests__/html/${version.html}`);

      // Reset value and test increment
      await touchspinHelpers.fillWithValue(page, 'touchspin-default', '50');
      await touchspinHelpers.touchspinClickUp(page, 'touchspin-default');

      const value = await touchspinHelpers.readInputValue(page, 'touchspin-default');
      expect(value).toBe('51');
    }
  });

  test('should generate valid HTML structure for all versions', async ({ page }) => {
    const versions = ['index-bs3.html', 'index-bs4.html', 'index-bs5.html'];

    for (const html of versions) {
      await page.goto(`/__tests__/html/${html}`);

      // Wait for TouchSpin to initialize by waiting for wrapper to exist
      const wrapper = page.getByTestId('touchspin-default-wrapper');
      await expect(wrapper).toBeAttached();

      // Validate basic structure exists using data-testid selectors (consistent across versions)
      const hasUpButton = wrapper.getByTestId('touchspin-default-up');
      const hasDownButton = wrapper.getByTestId('touchspin-default-down');

      // All versions should have up/down buttons with data attributes
      await expect(hasUpButton).toBeVisible();
      await expect(hasDownButton).toBeVisible();

      // Check that wrapper contains some form of Bootstrap structure
      await expect(wrapper).toBeVisible();
    }
  });

  test('should maintain consistent data-touchspin-injected attributes across versions', async ({ page }) => {
    const versions = ['index-bs3.html', 'index-bs4.html', 'index-bs5.html'];

    for (const html of versions) {
      await page.goto(`/__tests__/html/${html}`);

      // Wait for initialization
      const wrapper = page.getByTestId('touchspin-default-wrapper');
      await expect(wrapper).toBeAttached();

      // All versions should have consistent data attributes
      await expect(wrapper).toHaveAttribute('data-touchspin-injected', 'wrapper');
      await expect(wrapper.getByTestId('touchspin-default-up')).toBeVisible();
      await expect(wrapper.getByTestId('touchspin-default-down')).toBeVisible();

      // Prefix/Postfix elements are conditionally rendered - only exist when values are provided
      // Since touchspin-default is initialized without prefix/postfix, they should not exist
      await expect(wrapper.getByTestId('touchspin-default-prefix')).toHaveCount(0);
      await expect(wrapper.getByTestId('touchspin-default-postfix')).toHaveCount(0);
    }
  });

  test('should maintain consistent prefix/postfix elements when initialized with values', async ({ page }) => {
    const versions = ['index-bs3.html', 'index-bs4.html', 'index-bs5.html'];
    
    for (const html of versions) {
      await page.goto(`/__tests__/html/${html}`);
      
      // Initialize the test input with prefix and postfix values
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        // Destroy if already initialized
        try {
          $('#testinput_prefix_postfix').trigger('touchspin.destroy');
        } catch {}
        // Initialize with prefix and postfix
        $('#testinput_prefix_postfix').TouchSpin({
          prefix: '$',
          postfix: '.00'
        });
      });
      
      // Wait for initialization
      const wrapper = page.getByTestId('prefix-postfix-wrapper');
      await expect(wrapper).toBeAttached();
      
      // Now prefix/postfix elements should exist
      await expect(wrapper.getByTestId('prefix-postfix-prefix')).toHaveCount(1);
      await expect(wrapper.getByTestId('prefix-postfix-postfix')).toHaveCount(1);
      
      // Verify they contain the expected text
      await expect(wrapper.getByTestId('prefix-postfix-prefix')).toHaveText('$');
      await expect(wrapper.getByTestId('prefix-postfix-postfix')).toHaveText('.00');
    }
  });

  test('should maintain consistent functional behavior across all renderers', async ({ page }, testInfo) => {
    // This test navigates across multiple pages; allow more time to avoid flakiness
    testInfo.setTimeout(15000);
    const versions = [
      { name: 'Bootstrap 3', html: 'index-bs3.html' },
      { name: 'Bootstrap 4', html: 'index-bs4.html' },
      { name: 'Bootstrap 5', html: 'index-bs5.html' },
      { name: 'Tailwind', html: 'index-tailwind.html' }
    ];

    for (const version of versions) {
      await page.goto(`/__tests__/html/${version.html}`);

      // Pick the first initialized wrapper on the page for each renderer
      const wrapper = page.locator('[data-testid$="-wrapper"]').first();
      await expect(wrapper).toBeAttached();
      const input = wrapper.locator('input');
      const upButton = wrapper.locator('[data-testid$="-up"]');
      const downButton = wrapper.locator('[data-testid$="-down"]');

      // Reset to known state
      await input.fill('10');

      // Test increment
      await upButton.click();
      expect(await input.inputValue()).toBe('11');

      // Test decrement
      await downButton.click();
      await downButton.click();
      expect(await input.inputValue()).toBe('9');

      // Test that prefix/postfix are visible only when they have content
      const prefix = wrapper.locator('[data-testid$="-prefix"]');
      const postfix = wrapper.locator('[data-testid$="-postfix"]');

      if (await prefix.count() > 0) {
        const prefixText = await prefix.evaluate(el => (el.textContent || '').trim());
        if (prefixText.length > 0) {
          await expect(prefix).toBeVisible();
        }
      }
      if (await postfix.count() > 0) {
        const postfixText = await postfix.evaluate(el => (el.textContent || '').trim());
        if (postfixText.length > 0) {
          await expect(postfix).toBeVisible();
        }
      }
    }
  });
});

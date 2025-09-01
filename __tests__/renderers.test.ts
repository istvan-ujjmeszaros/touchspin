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
      
      // Validate basic structure exists using data attributes (consistent across versions)
      const hasUpButton = wrapper.locator('[data-touchspin-injected="up"]');
      const hasDownButton = wrapper.locator('[data-touchspin-injected="down"]');
      
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
      await expect(wrapper.locator('[data-touchspin-injected="up"]')).toBeVisible();
      await expect(wrapper.locator('[data-touchspin-injected="down"]')).toBeVisible();
      await expect(wrapper.locator('[data-touchspin-injected="prefix"]')).toBeVisible();
      await expect(wrapper.locator('[data-touchspin-injected="postfix"]')).toBeVisible();
    }
  });

  test('should maintain consistent functional behavior across all renderers', async ({ page }) => {
    const versions = [
      { name: 'Bootstrap 3', html: 'index-bs3.html' },
      { name: 'Bootstrap 4', html: 'index-bs4.html' },
      { name: 'Bootstrap 5', html: 'index-bs5.html' },
      { name: 'Tailwind', html: 'index-tailwind.html' }
    ];

    for (const version of versions) {
      await page.goto(`/__tests__/html/${version.html}`);
      
      // Test basic functionality is identical across all renderers
      const wrapper = page.getByTestId('touchspin-default-wrapper');
      const input = wrapper.locator('input[type="text"]');
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');
      const downButton = wrapper.locator('[data-touchspin-injected="down"]');
      
      // Reset to known state
      await input.fill('10');
      
      // Test increment
      await upButton.click();
      expect(await input.inputValue()).toBe('11');
      
      // Test decrement
      await downButton.click();
      await downButton.click();
      expect(await input.inputValue()).toBe('9');
      
      // Test that prefix/postfix are visible (if they exist)
      const prefix = wrapper.locator('[data-touchspin-injected="prefix"]');
      const postfix = wrapper.locator('[data-touchspin-injected="postfix"]');
      
      if (await prefix.count() > 0) {
        await expect(prefix).toBeVisible();
      }
      if (await postfix.count() > 0) {
        await expect(postfix).toBeVisible();
      }
    }
  });
});
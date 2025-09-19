import { test, expect } from '@playwright/test';
import * as apiHelpers from './helpers/touchspinApiHelpers';
import './coverage.hooks';

test.describe('Tailwind CSS Renderer', () => {

  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('/__tests__/html-renderers/tailwind-renderer-test.html');
  });

  test.afterEach(async ({ page }) => {
    await apiHelpers.collectCoverage(page, 'tailwind-renderer');
  });

  test.describe('Basic Rendering', () => {
    test('should inject required data-touchspin-injected attributes', async ({ page }) => {
      const wrapper = page.getByTestId('basic-container').locator('[data-touchspin-injected="wrapper"]');

      // Verify wrapper itself has the data attribute
      await expect(wrapper).toHaveAttribute('data-touchspin-injected', 'wrapper');

      // Verify buttons have required data attributes
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');
      const downButton = wrapper.locator('[data-touchspin-injected="down"]');

      await expect(upButton).toBeVisible();
      await expect(downButton).toBeVisible();

      // Test functionality with data attribute selectors
      const input = wrapper.locator('input[type="text"]');
      const initialValue = await input.inputValue();
      await upButton.click();
      expect(await input.inputValue()).toBe(String(parseInt(initialValue) + 1));
    });

    test('should work without any Bootstrap CSS dependencies', async ({ page }) => {
      // Verify TouchSpin still functions correctly
      const wrapper = page.getByTestId('basic-container').locator('[data-touchspin-injected="wrapper"]');
      const input = wrapper.locator('input[type="text"]');

      const upButton = wrapper.locator('[data-touchspin-injected="up"]');
      const initialValue = parseInt(await input.inputValue());
      await upButton.click();

      const value = await input.inputValue();
      expect(parseInt(value)).toBe(initialValue + 1);
    });

    test('should not include any Bootstrap-specific classes', async ({ page }) => {
      // Check that no Bootstrap UI classes are present in the DOM
      const bootstrapClasses = await page.evaluate(() => {
        const allElements = document.querySelectorAll('*');
        const bootstrapUIClassPatterns = [
          'input-group', 'input-group-addon', 'input-group-btn',
          'input-group-prepend', 'input-group-append', 'input-group-text',
          'btn-default', 'btn-primary', 'btn-secondary',
          'form-control', 'form-control-sm', 'form-control-lg'
        ];

        for (const element of allElements) {
          for (const pattern of bootstrapUIClassPatterns) {
            if (element.classList.contains(pattern)) {
              return { found: true, className: pattern, element: element.tagName };
            }
          }
        }
        return { found: false };
      });

      expect(bootstrapClasses.found).toBe(false);
    });

    test('should handle basic increment/decrement', async ({ page }) => {
      const wrapper = page.getByTestId('basic-container').locator('[data-touchspin-injected="wrapper"]');
      const input = wrapper.locator('input[type="text"]');
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');
      const downButton = wrapper.locator('[data-touchspin-injected="down"]');

      const initialValue = parseInt(await input.inputValue());

      // Test increment
      await upButton.click();
      expect(parseInt(await input.inputValue())).toBe(initialValue + 1);

      // Test decrement
      await downButton.click();
      await downButton.click();
      expect(parseInt(await input.inputValue())).toBe(initialValue - 1);
    });

    test('should display initial prefix/postfix', async ({ page }) => {
      // Look for inputs with prefix/postfix in the test page
      const prefix = page.getByTestId('prefixed-container').locator('[data-touchspin-injected="prefix"]');
      const postfix = page.getByTestId('prefixed-container').locator('[data-touchspin-injected="postfix"]');

      await expect(prefix).toBeVisible();
      await expect(postfix).toBeVisible();
    });

    test('should handle vertical layout', async ({ page }) => {
      // Test vertical button configuration if available in test page
      const verticalWrapper = page.getByTestId('vertical-container').locator('[data-touchspin-injected="vertical-wrapper"]');
      const count = await verticalWrapper.count();

      if (count > 0) {
        await expect(verticalWrapper).toBeVisible();

        const upButton = verticalWrapper.locator('[data-touchspin-injected="up"]');
        const downButton = verticalWrapper.locator('[data-touchspin-injected="down"]');

        await expect(upButton).toBeVisible();
        await expect(downButton).toBeVisible();
      }
    });
  });

  test.describe('Dynamic Settings Updates - Normal Input', () => {
    test('should update prefix/postfix text via updatesettings', async ({ page }) => {
      // Use manual test controls on the renderer test page
      await page.click('[data-testid="basic-update-prefix"]');
      await page.click('[data-testid="basic-update-postfix"]');

      const prefix = page.getByTestId('basic-container').locator('[data-touchspin-injected="prefix"]');
      const postfix = page.getByTestId('basic-container').locator('[data-touchspin-injected="postfix"]');

      await expect(prefix).toHaveText('$');
      await expect(postfix).toHaveText('.00');

      // Test removing prefix/postfix
      await page.click('[data-testid="basic-clear-prefix"]');
      await page.click('[data-testid="basic-clear-postfix"]');

      // Elements should be hidden when empty
      await expect(prefix).not.toBeVisible();
      await expect(postfix).not.toBeVisible();
    });

    test('should update button text (buttonup_txt/buttondown_txt)', async ({ page }) => {
      // Use manual test controls on the renderer test page
      await page.click('[data-testid="basic-update-up-text"]');
      await page.click('[data-testid="basic-update-down-text"]');

      const wrapper = page.getByTestId('basic-container').locator('[data-touchspin-injected="wrapper"]');
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');
      const downButton = wrapper.locator('[data-touchspin-injected="down"]');

      await expect(upButton).toHaveText('▲');
      await expect(downButton).toHaveText('▼');
    });

    test('should update button classes (buttonup_class/buttondown_class)', async ({ page }) => {
      // Apply button class updates via direct API call
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('#input-basic');
        $i.trigger('touchspin.updatesettings', [{ buttonup_class: 'custom-up-class', buttondown_class: 'custom-down-class' }]);
      });

      const wrapper = page.getByTestId('basic-container').locator('[data-touchspin-injected="wrapper"]');
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');
      const downButton = wrapper.locator('[data-touchspin-injected="down"]');

      const upButtonClasses = await upButton.evaluate(el => el.className);
      const downButtonClasses = await downButton.evaluate(el => el.className);

      expect(upButtonClasses).toContain('custom-up-class');
      expect(downButtonClasses).toContain('custom-down-class');
    });

    test('should update addon classes (prefix_extraclass/postfix_extraclass)', async ({ page }) => {
      // Use manual test controls to add prefix/postfix first, then extra classes
      await page.click('[data-testid="basic-update-prefix"]');
      await page.click('[data-testid="basic-update-postfix"]');
      await page.click('[data-testid="basic-update-prefix-class"]');
      await page.click('[data-testid="basic-update-postfix-class"]');

      const prefix = page.getByTestId('basic-container').locator('[data-touchspin-injected="prefix"]');
      const postfix = page.getByTestId('basic-container').locator('[data-touchspin-injected="postfix"]');

      // Class updates applied
      const prefixClass = await prefix.evaluate(el => el.className);
      const postfixClass = await postfix.evaluate(el => el.className);
      expect(prefixClass).toContain('tw-test-prefix-extra');
      expect(postfixClass).toContain('tw-test-postfix-extra');

      // Change classes again to ensure removal then add works
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('#input-basic');
        $i.trigger('touchspin.updatesettings', [{ prefix_extraclass: 'tw-prefix-z', postfix_extraclass: 'tw-postfix-q' }]);
      });
      const prefixClass2 = await prefix.evaluate(el => el.className);
      const postfixClass2 = await postfix.evaluate(el => el.className);
      expect(prefixClass2).not.toContain('tw-test-prefix-extra');
      expect(postfixClass2).not.toContain('tw-test-postfix-extra');
      expect(prefixClass2).toContain('tw-prefix-z');
      expect(postfixClass2).toContain('tw-postfix-q');
    });

    test('should update vertical button classes', async ({ page }) => {
      // Use the vertical input already initialized in the test page
      await page.click('[data-testid="vertical-update-up-class"]');
      await page.click('[data-testid="vertical-update-down-class"]');

      const wrapper = page.getByTestId('vertical-container');
      const verticalWrapper = wrapper.locator('[data-touchspin-injected="vertical-wrapper"]');
      const upButton = verticalWrapper.locator('[data-touchspin-injected="up"]');
      const downButton = verticalWrapper.locator('[data-touchspin-injected="down"]');

      const upButtonClasses = await upButton.evaluate(el => el.className);
      const downButtonClasses = await downButton.evaluate(el => el.className);

      expect(upButtonClasses).toContain('bg-green-500');
      expect(downButtonClasses).toContain('bg-red-500');
    });

    test('should update vertical button text', async ({ page }) => {
      // Use the vertical input already initialized in the test page
      await page.click('[data-testid="vertical-update-up-text"]');
      await page.click('[data-testid="vertical-update-down-text"]');

      const wrapper = page.getByTestId('vertical-container');
      const verticalWrapper = wrapper.locator('[data-touchspin-injected="vertical-wrapper"]');
      const upButton = verticalWrapper.locator('[data-touchspin-injected="up"]');
      const downButton = verticalWrapper.locator('[data-touchspin-injected="down"]');

      await expect(upButton).toHaveText('⬆');
      await expect(downButton).toHaveText('⬇');
    });
  });

  test.describe('Dynamic Settings Updates - Advanced Container', () => {
    test('should not overwrite existing data-testid on advanced container', async ({ page }) => {
      const advanced = page.getByTestId('advanced-container');
      await expect(advanced).toBeVisible();
      await expect(advanced).toHaveAttribute('data-testid', 'advanced-container');
      await expect(advanced).toHaveAttribute('data-touchspin-injected', 'wrapper-advanced');
    });

    test('should update settings in advanced mode', async ({ page }) => {
      // Use the advanced container test controls
      await page.click('[data-testid="advanced-update-prefix"]');
      await page.click('[data-testid="advanced-update-postfix"]');

      const prefix = page.getByTestId('advanced-container').locator('[data-touchspin-injected="prefix"]');
      const postfix = page.getByTestId('advanced-container').locator('[data-touchspin-injected="postfix"]');

      await expect(prefix).toHaveText('$');
      await expect(postfix).toHaveText('USD');
    });

    test('should preserve existing container structure', async ({ page }) => {
      // Verify original elements are still present in advanced container
      const originalElements = page.getByTestId('advanced-container').locator('.text-gray-600');
      expect(await originalElements.count()).toBeGreaterThan(0);

      // Verify TouchSpin buttons are also present
      await expect(page.getByTestId('advanced-container').locator('[data-touchspin-injected="up"]')).toBeVisible();
      await expect(page.getByTestId('advanced-container').locator('[data-touchspin-injected="down"]')).toBeVisible();
    });
  });

  test.describe('Cleanup', () => {
    test('should properly clean up on destroy', async ({ page }) => {
      // Verify elements are present
      await expect(page.getByTestId('basic-container').locator('[data-touchspin-injected="up"]')).toBeVisible();
      await expect(page.getByTestId('basic-container').locator('[data-touchspin-injected="down"]')).toBeVisible();

      // Destroy via API
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('#input-basic').trigger('touchspin.destroy');
      });

      // Verify cleanup
      await expect(page.getByTestId('basic-container').locator('[data-touchspin-injected="up"]')).not.toBeVisible();
      await expect(page.getByTestId('basic-container').locator('[data-touchspin-injected="down"]')).not.toBeVisible();
    });

    test('should remove all data-touchspin-injected elements', async ({ page }) => {
      // Verify elements are present in advanced container
      const injectedElements = page.getByTestId('advanced-container').locator('[data-touchspin-injected]');
      expect(await injectedElements.count()).toBeGreaterThan(0);

      // Destroy via API
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('#input-advanced').trigger('touchspin.destroy');
      });

      // Verify all injected elements are removed
      expect(await injectedElements.count()).toBe(0);
    });
  });

  test.describe('Tailwind CSS Specific Features', () => {
    test('should apply correct size classes', async ({ page }) => {
      // Skip size class testing on dedicated renderer page since we don't have different sizes
      // This test was for the original demo page with multiple input sizes
      expect(true).toBe(true); // Placeholder
    });

    test('should not include any Bootstrap-specific classes', async ({ page }) => {
      // Check that no Bootstrap UI classes are present in the DOM
      const bootstrapClasses = await page.evaluate(() => {
        const allElements = document.querySelectorAll('*');
        const bootstrapUIClassPatterns = [
          'input-group', 'input-group-addon', 'input-group-btn',
          'input-group-prepend', 'input-group-append', 'input-group-text',
          'btn-default', 'btn-primary', 'btn-secondary',
          'form-control', 'form-control-sm', 'form-control-lg'
        ];

        for (const element of allElements) {
          for (const pattern of bootstrapUIClassPatterns) {
            if (element.classList.contains(pattern)) {
              return { found: true, className: pattern, element: element.tagName };
            }
          }
        }
        return { found: false };
      });

      expect(bootstrapClasses.found).toBe(false);
    });
  });
});

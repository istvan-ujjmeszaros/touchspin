import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinHelpers';

test.describe('Bootstrap 4 Renderer', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html');
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'bs4-renderer');
  });

  test.describe('Basic Rendering', () => {
    test('should inject required data-touchspin-injected attributes', async ({ page }) => {
      const wrapper = page.getByTestId('touchspin-default-wrapper');
      
      // Verify wrapper itself has the data attribute
      await expect(wrapper).toHaveAttribute('data-touchspin-injected', 'wrapper');
      
      // Verify buttons have required data attributes
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');
      const downButton = wrapper.locator('[data-touchspin-injected="down"]');
      
      await expect(upButton).toBeVisible();
      await expect(downButton).toBeVisible();
      
      // Test functionality
      const input = wrapper.locator('input[type="text"]');
      const initialValue = await input.inputValue();
      await upButton.click();
      expect(await input.inputValue()).toBe(String(parseInt(initialValue) + 1));
    });

    test('should generate correct Bootstrap 4 markup structure', async ({ page }) => {
      const wrapper = page.getByTestId('touchspin-default-wrapper');
      
      // Test buttons have correct classes
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');
      const downButton = wrapper.locator('[data-touchspin-injected="down"]');
      
      const upButtonClasses = await upButton.evaluate((el) => el.className);
      const downButtonClasses = await downButton.evaluate((el) => el.className);
      
      expect(upButtonClasses).toContain('btn');
      expect(downButtonClasses).toContain('btn');
      
      // Bootstrap 4 uses input-group-prepend and input-group-append
      const prependElements = wrapper.locator('.input-group-prepend');
      const appendElements = wrapper.locator('.input-group-append');
      
      // Should have at least one prepend or append element
      expect(await prependElements.count() + await appendElements.count()).toBeGreaterThan(0);
    });

    test('should handle basic increment/decrement', async ({ page }) => {
      const wrapper = page.getByTestId('touchspin-default-wrapper');
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
      const prefix = page.locator('[data-touchspin-injected="prefix"]').first();
      const postfix = page.locator('[data-touchspin-injected="postfix"]').first();
      
      await expect(prefix).toBeVisible();
      await expect(postfix).toBeVisible();
      
      // Bootstrap 4 uses input-group-text for addons
      const prefixClasses = await prefix.evaluate(el => el.className);
      const postfixClasses = await postfix.evaluate(el => el.className);
      
      expect(prefixClasses).toContain('input-group-text');
      expect(postfixClasses).toContain('input-group-text');
    });

    test('should handle vertical layout', async ({ page }) => {
      // Test vertical button configuration if available in test page
      const verticalWrappers = page.locator('[data-touchspin-injected="vertical-wrapper"]');
      const count = await verticalWrappers.count();
      
      if (count > 0) {
        const verticalWrapper = verticalWrappers.first();
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
      await page.goto('/__tests__/html-package/index-bs4-wrapper.html');
      await page.click('#btn-init');

      // Apply updates: add prefix/postfix text
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('#bs4-input');
        $i.trigger('touchspin.updatesettings', [{ prefix: 'USD', postfix: 'kg' }]);
      });

      const prefix = page.locator('#bs4-group [data-touchspin-injected="prefix"]');
      const postfix = page.locator('#bs4-group [data-touchspin-injected="postfix"]');

      await expect(prefix).toHaveText('USD');
      await expect(postfix).toHaveText('kg');
      
      // Test removing prefix/postfix
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('#bs4-input');
        $i.trigger('touchspin.updatesettings', [{ prefix: '', postfix: '' }]);
      });
      
      // Elements should be removed when empty
      await expect(prefix).not.toBeVisible();
      await expect(postfix).not.toBeVisible();
    });

    test('should update button text (buttonup_txt/buttondown_txt)', async ({ page }) => {
      // This test will fail for BS4Renderer - driving TDD implementation
      await page.goto('/__tests__/html-package/index-bs4-wrapper.html');
      await page.click('#btn-init');

      // Apply button text updates
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('#bs4-input');
        $i.trigger('touchspin.updatesettings', [{ buttonup_txt: '▲', buttondown_txt: '▼' }]);
      });

      const wrapper = page.locator('#bs4-group');
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');
      const downButton = wrapper.locator('[data-touchspin-injected="down"]');

      await expect(upButton).toHaveText('▲');
      await expect(downButton).toHaveText('▼');
    });

    test('should update button classes (buttonup_class/buttondown_class)', async ({ page }) => {
      await page.goto('/__tests__/html-package/index-bs4-wrapper.html');
      await page.click('#btn-init');

      // Apply button class updates
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('#bs4-input');
        $i.trigger('touchspin.updatesettings', [{ buttonup_class: 'custom-up-class', buttondown_class: 'custom-down-class' }]);
      });

      const wrapper = page.locator('#bs4-group');
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');
      const downButton = wrapper.locator('[data-touchspin-injected="down"]');

      const upButtonClasses = await upButton.evaluate(el => el.className);
      const downButtonClasses = await downButton.evaluate(el => el.className);
      
      expect(upButtonClasses).toContain('custom-up-class');
      expect(downButtonClasses).toContain('custom-down-class');
    });

    test('should update addon classes (prefix_extraclass/postfix_extraclass)', async ({ page }) => {
      // This test will fail for BS4Renderer - driving TDD implementation
      await page.goto('/__tests__/html-package/index-bs4-wrapper.html');
      await page.click('#btn-init');

      // Apply updates: add prefix/postfix text and extra classes
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('#bs4-input');
        $i.trigger('touchspin.updatesettings', [{ prefix: 'USD', postfix: 'kg', prefix_extraclass: 'bs4-prefix-x', postfix_extraclass: 'bs4-postfix-y' }]);
      });

      const prefix = page.locator('#bs4-group [data-touchspin-injected="prefix"]');
      const postfix = page.locator('#bs4-group [data-touchspin-injected="postfix"]');

      // Class updates applied
      const prefixClass = await prefix.evaluate(el => el.className);
      const postfixClass = await postfix.evaluate(el => el.className);
      expect(prefixClass).toContain('bs4-prefix-x');
      expect(postfixClass).toContain('bs4-postfix-y');

      // Change classes again to ensure removal then add works
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('#bs4-input');
        $i.trigger('touchspin.updatesettings', [{ prefix_extraclass: 'bs4-prefix-z', postfix_extraclass: 'bs4-postfix-q' }]);
      });
      const prefixClass2 = await prefix.evaluate(el => el.className);
      const postfixClass2 = await postfix.evaluate(el => el.className);
      expect(prefixClass2).not.toContain('bs4-prefix-x');
      expect(postfixClass2).not.toContain('bs4-postfix-y');
      expect(prefixClass2).toContain('bs4-prefix-z');
      expect(postfixClass2).toContain('bs4-postfix-q');
    });

    test('should update vertical button classes', async ({ page }) => {
      await page.goto('/__tests__/html-package/index-bs4-wrapper.html');
      // Initialize with vertical buttons
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('#bs4-input');
        $i.TouchSpin({ verticalbuttons: true });
      });

      // Update vertical button classes
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('#bs4-input');
        $i.trigger('touchspin.updatesettings', [{ verticalupclass: 'custom-vertical-up', verticaldownclass: 'custom-vertical-down' }]);
      });

      const wrapper = page.locator('#bs4-group');
      const verticalWrapper = wrapper.locator('[data-touchspin-injected="vertical-wrapper"]');
      const upButton = verticalWrapper.locator('[data-touchspin-injected="up"]');
      const downButton = verticalWrapper.locator('[data-touchspin-injected="down"]');

      const upButtonClasses = await upButton.evaluate(el => el.className);
      const downButtonClasses = await downButton.evaluate(el => el.className);
      
      expect(upButtonClasses).toContain('custom-vertical-up');
      expect(downButtonClasses).toContain('custom-vertical-down');
    });

    test('should update vertical button text', async ({ page }) => {
      await page.goto('/__tests__/html-package/index-bs4-wrapper.html');
      // Initialize with vertical buttons
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('#bs4-input');
        $i.TouchSpin({ verticalbuttons: true });
      });

      // Update vertical button text
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('#bs4-input');
        $i.trigger('touchspin.updatesettings', [{ verticalup: '↑', verticaldown: '↓' }]);
      });

      const wrapper = page.locator('#bs4-group');
      const verticalWrapper = wrapper.locator('[data-touchspin-injected="vertical-wrapper"]');
      const upButton = verticalWrapper.locator('[data-touchspin-injected="up"]');
      const downButton = verticalWrapper.locator('[data-touchspin-injected="down"]');

      await expect(upButton).toHaveText('↑');
      await expect(downButton).toHaveText('↓');
    });
  });

  test.describe('Dynamic Settings Updates - Advanced Container', () => {
    test('should update settings in advanced mode', async ({ page }) => {
      await page.goto('/__tests__/html-package/index-bs4-wrapper.html');
      await page.click('#btn-adv-init');

      // Update settings in advanced mode
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('#bs4-adv-input');
        $i.trigger('touchspin.updatesettings', [{ prefix: 'Advanced', postfix: 'Mode' }]);
      });

      const prefix = page.locator('#bs4-adv-group [data-touchspin-injected="prefix"]');
      const postfix = page.locator('#bs4-adv-group [data-touchspin-injected="postfix"]');

      await expect(prefix).toHaveText('Advanced');
      await expect(postfix).toHaveText('Mode');
    });

    test('should preserve existing container structure', async ({ page }) => {
      await page.goto('/__tests__/html-package/index-bs4-wrapper.html');
      await page.click('#btn-adv-init');

      // Verify original elements are still present
      const originalElements = page.locator('#bs4-adv-group').locator('.input-group-text');
      expect(await originalElements.count()).toBeGreaterThan(0);
      
      // Verify TouchSpin buttons are also present
      await expect(page.locator('#bs4-adv-group [data-touchspin-injected="up"]')).toBeVisible();
      await expect(page.locator('#bs4-adv-group [data-touchspin-injected="down"]')).toBeVisible();
    });
  });

  test.describe('Cleanup', () => {
    test('should properly clean up on destroy', async ({ page }) => {
      await page.goto('/__tests__/html-package/index-bs4-wrapper.html');
      await page.click('#btn-init');

      // Verify elements are present
      await expect(page.locator('#bs4-group [data-touchspin-injected="up"]')).toBeVisible();
      await expect(page.locator('#bs4-group [data-touchspin-injected="down"]')).toBeVisible();

      // Destroy
      await page.click('#btn-destroy');

      // Verify cleanup
      await expect(page.locator('#bs4-group [data-touchspin-injected="up"]')).not.toBeVisible();
      await expect(page.locator('#bs4-group [data-touchspin-injected="down"]')).not.toBeVisible();
    });

    test('should remove all data-touchspin-injected elements', async ({ page }) => {
      await page.goto('/__tests__/html-package/index-bs4-wrapper.html');
      await page.click('#btn-adv-init');

      // Verify elements are present
      const injectedElements = page.locator('#bs4-adv-group [data-touchspin-injected]');
      expect(await injectedElements.count()).toBeGreaterThan(0);

      // Destroy
      await page.click('#btn-adv-destroy');

      // Verify all injected elements are removed
      expect(await injectedElements.count()).toBe(0);
    });
  });

  test.describe('Bootstrap 4 Specific Features', () => {
    test('should handle existing input groups correctly', async ({ page }) => {
      // Test that Bootstrap 4 input-group structure is preserved
      const inputGroups = page.locator('.input-group');
      expect(await inputGroups.count()).toBeGreaterThan(0);
      
      // Check for Bootstrap 4 specific classes
      const prependElements = page.locator('.input-group-prepend');
      const appendElements = page.locator('.input-group-append');
      const textElements = page.locator('.input-group-text');
      
      // Should have Bootstrap 4 structure elements
      const totalStructureElements = await prependElements.count() + await appendElements.count() + await textElements.count();
      expect(totalStructureElements).toBeGreaterThan(0);
    });

    test('should apply correct form-control size classes', async ({ page }) => {
      // Test small form control
      const smallInputs = page.locator('.form-control-sm');
      const smallCount = await smallInputs.count();
      
      if (smallCount > 0) {
        const smallInput = smallInputs.first();
        const parentClasses = await smallInput.locator('..').evaluate(el => el.className);
        expect(parentClasses).toContain('input-group');
      }
      
      // Test large form control
      const largeInputs = page.locator('.form-control-lg');
      const largeCount = await largeInputs.count();
      
      if (largeCount > 0) {
        const largeInput = largeInputs.first();
        const parentClasses = await largeInput.locator('..').evaluate(el => el.className);
        expect(parentClasses).toContain('input-group');
      }
    });

    test('should use input-group-text class for addons', async ({ page }) => {
      const prefixElements = page.locator('[data-touchspin-injected="prefix"]');
      const postfixElements = page.locator('[data-touchspin-injected="postfix"]');
      
      const prefixCount = await prefixElements.count();
      const postfixCount = await postfixElements.count();
      
      if (prefixCount > 0) {
        const prefixClasses = await prefixElements.first().evaluate(el => el.className);
        expect(prefixClasses).toContain('input-group-text');
      }
      
      if (postfixCount > 0) {
        const postfixClasses = await postfixElements.first().evaluate(el => el.className);
        expect(postfixClasses).toContain('input-group-text');
      }
    });
  });
});
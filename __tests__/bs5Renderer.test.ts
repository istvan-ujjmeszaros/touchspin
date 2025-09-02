import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinHelpers';

test.describe('Bootstrap 5 Renderer', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs5.html');
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'bs5-renderer');
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

    test('should inject up button with data attribute (raw core)', async ({ page }) => {
      await page.goto('/__tests__/html-minimal-rendering/bs5-renderer-raw.html');
      // Wait for initialization to complete
      await page.waitForTimeout(200);

      // Check that the up button was injected with the correct data attribute
      const upButton = page.locator('[data-touchspin-injected="up"]');
      await expect(upButton).toBeVisible();
    });

    test('should inject up button with data attribute (jQuery)', async ({ page }) => {
      await page.goto('/__tests__/html-minimal-rendering/bs5-renderer-jquery.html');
      // Wait for initialization to complete
      await page.waitForTimeout(200);

      // Check that the up button was injected with the correct data attribute
      const upButton = page.locator('[data-touchspin-injected="up"]');
      await expect(upButton).toBeVisible();
    });

    test('should generate correct Bootstrap 5 markup structure', async ({ page }) => {
      const wrapper = page.getByTestId('touchspin-default-wrapper');
      
      // Test buttons have correct classes
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');
      const downButton = wrapper.locator('[data-touchspin-injected="down"]');
      
      const upButtonClasses = await upButton.evaluate((el) => el.className);
      const downButtonClasses = await downButton.evaluate((el) => el.className);
      
      expect(upButtonClasses).toContain('btn');
      expect(downButtonClasses).toContain('btn');
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
      
      // Bootstrap 5 uses input-group-text for addons
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
      await page.goto('/__tests__/html-package/index-bs5-wrapper.html');
      await page.click('#btn-init');

      // Apply updates: add prefix/postfix text
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('#bs5-input');
        $i.trigger('touchspin.updatesettings', [{ prefix: 'USD', postfix: 'kg' }]);
      });

      const prefix = page.getByTestId('bs5-group-wrapper').locator('[data-touchspin-injected="prefix"]');
      const postfix = page.getByTestId('bs5-group-wrapper').locator('[data-touchspin-injected="postfix"]');

      await expect(prefix).toHaveText('USD');
      await expect(postfix).toHaveText('kg');
      
      // Test removing prefix/postfix
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('#bs5-input');
        $i.trigger('touchspin.updatesettings', [{ prefix: '', postfix: '' }]);
      });
      
      // Elements should be removed when empty
      await expect(prefix).not.toBeVisible();
      await expect(postfix).not.toBeVisible();
    });

    test('should update button text (buttonup_txt/buttondown_txt)', async ({ page }) => {
      // This test should pass for BS5Renderer - already implemented
      await page.goto('/__tests__/html-package/index-bs5-wrapper.html');
      await page.click('#btn-init');

      // Apply button text updates
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('#bs5-input');
        $i.trigger('touchspin.updatesettings', [{ buttonup_txt: '▲', buttondown_txt: '▼' }]);
      });

      const wrapper = page.getByTestId('bs5-group-wrapper');
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');
      const downButton = wrapper.locator('[data-touchspin-injected="down"]');

      await expect(upButton).toHaveText('▲');
      await expect(downButton).toHaveText('▼');
    });

    test('should update button classes (buttonup_class/buttondown_class)', async ({ page }) => {
      await page.goto('/__tests__/html-package/index-bs5-wrapper.html');
      await page.click('#btn-init');

      // Apply button class updates
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('#bs5-input');
        $i.trigger('touchspin.updatesettings', [{ buttonup_class: 'custom-up-class', buttondown_class: 'custom-down-class' }]);
      });

      const wrapper = page.getByTestId('bs5-group-wrapper');
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');
      const downButton = wrapper.locator('[data-touchspin-injected="down"]');

      const upButtonClasses = await upButton.evaluate(el => el.className);
      const downButtonClasses = await downButton.evaluate(el => el.className);
      
      expect(upButtonClasses).toContain('custom-up-class');
      expect(downButtonClasses).toContain('custom-down-class');
    });

    test('should update addon classes (prefix_extraclass/postfix_extraclass)', async ({ page }) => {
      // This test should pass for BS5Renderer - already implemented
      await page.goto('/__tests__/html-package/index-bs5-wrapper.html');
      await page.click('#btn-init');

      // Apply updates: add prefix/postfix text and extra classes
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('#bs5-input');
        $i.trigger('touchspin.updatesettings', [{ prefix: 'USD', postfix: 'kg', prefix_extraclass: 'bs5-prefix-x', postfix_extraclass: 'bs5-postfix-y' }]);
      });

      const prefix = page.getByTestId('bs5-group-wrapper').locator('[data-touchspin-injected="prefix"]');
      const postfix = page.getByTestId('bs5-group-wrapper').locator('[data-touchspin-injected="postfix"]');

      // Class updates applied
      const prefixClass = await prefix.evaluate(el => el.className);
      const postfixClass = await postfix.evaluate(el => el.className);
      expect(prefixClass).toContain('bs5-prefix-x');
      expect(postfixClass).toContain('bs5-postfix-y');

      // Change classes again to ensure removal then add works
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('#bs5-input');
        $i.trigger('touchspin.updatesettings', [{ prefix_extraclass: 'bs5-prefix-z', postfix_extraclass: 'bs5-postfix-q' }]);
      });
      const prefixClass2 = await prefix.evaluate(el => el.className);
      const postfixClass2 = await postfix.evaluate(el => el.className);
      expect(prefixClass2).not.toContain('bs5-prefix-x');
      expect(postfixClass2).not.toContain('bs5-postfix-y');
      expect(prefixClass2).toContain('bs5-prefix-z');
      expect(postfixClass2).toContain('bs5-postfix-q');
    });

    test('should update vertical button classes', async ({ page }) => {
      await page.goto('/__tests__/html-package/index-bs5-wrapper.html');
      // Initialize with vertical buttons
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('#bs5-input');
        $i.TouchSpin({ verticalbuttons: true });
      });

      // Update vertical button classes
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('#bs5-input');
        $i.trigger('touchspin.updatesettings', [{ verticalupclass: 'custom-vertical-up', verticaldownclass: 'custom-vertical-down' }]);
      });

      const wrapper = page.getByTestId('bs5-group-wrapper');
      const verticalWrapper = wrapper.locator('[data-touchspin-injected="vertical-wrapper"]');
      const upButton = verticalWrapper.locator('[data-touchspin-injected="up"]');
      const downButton = verticalWrapper.locator('[data-touchspin-injected="down"]');

      const upButtonClasses = await upButton.evaluate(el => el.className);
      const downButtonClasses = await downButton.evaluate(el => el.className);
      
      expect(upButtonClasses).toContain('custom-vertical-up');
      expect(downButtonClasses).toContain('custom-vertical-down');
    });

    test('should update vertical button text', async ({ page }) => {
      await page.goto('/__tests__/html-package/index-bs5-wrapper.html');
      // Initialize with vertical buttons
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('#bs5-input');
        $i.TouchSpin({ verticalbuttons: true });
      });

      // Update vertical button text
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('#bs5-input');
        $i.trigger('touchspin.updatesettings', [{ verticalup: '↑', verticaldown: '↓' }]);
      });

      const wrapper = page.getByTestId('bs5-group-wrapper');
      const verticalWrapper = wrapper.locator('[data-touchspin-injected="vertical-wrapper"]');
      const upButton = verticalWrapper.locator('[data-touchspin-injected="up"]');
      const downButton = verticalWrapper.locator('[data-touchspin-injected="down"]');

      await expect(upButton).toHaveText('↑');
      await expect(downButton).toHaveText('↓');
    });
  });

  test.describe('Dynamic Settings Updates - Advanced Container', () => {
    test('should update settings in advanced mode', async ({ page }) => {
      await page.goto('/__tests__/html-package/index-bs5-wrapper.html');
      await page.click('#btn-adv-init');

      // Update settings in advanced mode
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('#bs5-adv-input');
        $i.trigger('touchspin.updatesettings', [{ prefix: 'Advanced', postfix: 'Mode' }]);
      });

      const prefix = page.locator('#bs5-adv-group [data-touchspin-injected="prefix"]');
      const postfix = page.locator('#bs5-adv-group [data-touchspin-injected="postfix"]');

      await expect(prefix).toHaveText('Advanced');
      await expect(postfix).toHaveText('Mode');
    });

    test('should preserve existing input-group-text elements', async ({ page }) => {
      await page.goto('/__tests__/html-package/index-bs5-wrapper.html');
      await page.click('#btn-adv-init');

      // Verify original elements are still present
      const originalElements = page.locator('#bs5-adv-group').locator('.input-group-text');
      expect(await originalElements.count()).toBeGreaterThan(0);
      
      // Verify TouchSpin buttons are also present
      await expect(page.locator('#bs5-adv-group [data-touchspin-injected="up"]')).toBeVisible();
      await expect(page.locator('#bs5-adv-group [data-touchspin-injected="down"]')).toBeVisible();
    });
  });

  test.describe('Cleanup', () => {
    test('should properly clean up on destroy', async ({ page }) => {
      await page.goto('/__tests__/html-package/index-bs5-wrapper.html');
      await page.click('#btn-init');

      // Verify elements are present
      await expect(page.getByTestId('bs5-group-wrapper').locator('[data-touchspin-injected="up"]')).toBeVisible();
      await expect(page.getByTestId('bs5-group-wrapper').locator('[data-touchspin-injected="down"]')).toBeVisible();

      // Destroy
      await page.click('#btn-destroy');

      // Verify cleanup
      await expect(page.getByTestId('bs5-group-wrapper').locator('[data-touchspin-injected="up"]')).not.toBeVisible();
      await expect(page.getByTestId('bs5-group-wrapper').locator('[data-touchspin-injected="down"]')).not.toBeVisible();
    });

    test('should remove all data-touchspin-injected elements', async ({ page }) => {
      await page.goto('/__tests__/html-package/index-bs5-wrapper.html');
      await page.click('#btn-adv-init');

      // Verify elements are present
      const injectedElements = page.locator('#bs5-adv-group [data-touchspin-injected]');
      expect(await injectedElements.count()).toBeGreaterThan(0);

      // Destroy
      await page.click('#btn-adv-destroy');

      // Verify all injected elements are removed
      expect(await injectedElements.count()).toBe(0);
    });
  });

  test.describe('Bootstrap 5 Specific Features', () => {
    test('should handle direct button placement', async ({ page }) => {
      // Bootstrap 5 allows direct button placement without wrappers
      const buttons = page.locator('[data-touchspin-injected="up"], [data-touchspin-injected="down"]');
      const buttonCount = await buttons.count();
      expect(buttonCount).toBeGreaterThan(0);
      
      // Test that buttons are functional
      const upButton = page.locator('[data-touchspin-injected="up"]').first();
      if (await upButton.isVisible()) {
        const wrapper = upButton.locator('../..');
        const input = wrapper.locator('input[type="text"]');
        const initialValue = parseInt(await input.inputValue());
        
        await upButton.click();
        expect(parseInt(await input.inputValue())).toBe(initialValue + 1);
      }
    });

    test('should function correctly with Bootstrap 5 structure', async ({ page }) => {
      // Test basic functionality with Bootstrap 5 input groups
      const inputGroup = page.locator('.input-group').first();
      if (await inputGroup.isVisible()) {
        const input = inputGroup.locator('input[type="text"]');
        const upButton = inputGroup.locator('[data-touchspin-injected="up"]');
        
        if (await upButton.isVisible()) {
          const initialValue = parseInt(await input.inputValue());
          await upButton.click();
          expect(parseInt(await input.inputValue())).toBe(initialValue + 1);
        }
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

    test('should support all BS5 specific settings', async ({ page }) => {
      // Test that BS5 supports all the additional settings
      await page.goto('/__tests__/html-package/index-bs5-wrapper.html');
      await page.click('#btn-init');

      // Test all BS5-specific settings in one go
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('#bs5-input');
        $i.trigger('touchspin.updatesettings', [{
          buttonup_txt: '⬆',
          buttondown_txt: '⬇',
          prefix: 'Pre',
          postfix: 'Post',
          prefix_extraclass: 'custom-prefix',
          postfix_extraclass: 'custom-postfix'
        }]);
      });

      const wrapper = page.getByTestId('bs5-group-wrapper');
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');
      const downButton = wrapper.locator('[data-touchspin-injected="down"]');
      const prefix = wrapper.locator('[data-touchspin-injected="prefix"]');
      const postfix = wrapper.locator('[data-touchspin-injected="postfix"]');

      // Verify all updates applied
      await expect(upButton).toHaveText('⬆');
      await expect(downButton).toHaveText('⬇');
      await expect(prefix).toHaveText('Pre');
      await expect(postfix).toHaveText('Post');

      const prefixClasses = await prefix.evaluate(el => el.className);
      const postfixClasses = await postfix.evaluate(el => el.className);
      expect(prefixClasses).toContain('custom-prefix');
      expect(postfixClasses).toContain('custom-postfix');
    });
  });
});
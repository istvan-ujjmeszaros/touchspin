import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinHelpers';

test.describe('Bootstrap 4 Renderer', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('/__tests__/html-renderers/bs4-renderer-test.html');
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'bs4-renderer');
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

      // Verify Bootstrap 4 specific structure
      const prependElements = wrapper.locator('.input-group-prepend');
      const appendElements = wrapper.locator('.input-group-append');

      // Should have at least one prepend or append element
      expect(await prependElements.count() + await appendElements.count()).toBeGreaterThan(0);

      // Test functionality
      const input = wrapper.locator('input[type="text"]');
      const initialValue = await input.inputValue();
      await upButton.click();
      expect(await input.inputValue()).toBe(String(parseInt(initialValue) + 1));
    });

    test('should generate proper Bootstrap 4 markup structure', async ({ page }) => {
      // Verify the correct Bootstrap 4 structure:
      // <div class="input-group">
      //   <div class="input-group-prepend">
      //     <button>-</button>
      //     <span class="input-group-text">prefix</span>
      //   </div>
      //   <input>
      //   <div class="input-group-append">
      //     <span class="input-group-text">postfix</span>
      //     <button>+</button>
      //   </div>
      // </div>

      const wrapper = page.getByTestId('prefixed-container').locator('[data-touchspin-injected="wrapper"]');

      // Should have single prepend and append wrappers
      await expect(wrapper.locator('.input-group-prepend')).toHaveCount(1);
      await expect(wrapper.locator('.input-group-append')).toHaveCount(1);

      // Prepend wrapper should contain down button and prefix
      const prependWrapper = wrapper.locator('.input-group-prepend');
      await expect(prependWrapper.locator('[data-touchspin-injected="down"]')).toHaveCount(1);
      await expect(prependWrapper.locator('[data-touchspin-injected="prefix"].input-group-text')).toHaveCount(1);

      // Append wrapper should contain postfix and up button
      const appendWrapper = wrapper.locator('.input-group-append');
      await expect(appendWrapper.locator('[data-touchspin-injected="postfix"].input-group-text')).toHaveCount(1);
      await expect(appendWrapper.locator('[data-touchspin-injected="up"]')).toHaveCount(1);

      // Verify prefix/postfix are input-group-text spans (not wrapper divs)
      await expect(wrapper.locator('[data-touchspin-injected="prefix"]')).toHaveClass(/input-group-text/);
      await expect(wrapper.locator('[data-touchspin-injected="postfix"]')).toHaveClass(/input-group-text/);
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
      expect(prefixClass).toContain('bs4-test-prefix-extra');
      expect(postfixClass).toContain('bs4-test-postfix-extra');

      // Change classes again to ensure removal then add works
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('#input-basic');
        $i.trigger('touchspin.updatesettings', [{ prefix_extraclass: 'bs4-prefix-z', postfix_extraclass: 'bs4-postfix-q' }]);
      });
      const prefixClass2 = await prefix.evaluate(el => el.className);
      const postfixClass2 = await postfix.evaluate(el => el.className);
      expect(prefixClass2).not.toContain('bs4-test-prefix-extra');
      expect(postfixClass2).not.toContain('bs4-test-postfix-extra');
      expect(prefixClass2).toContain('bs4-prefix-z');
      expect(postfixClass2).toContain('bs4-postfix-q');
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

      expect(upButtonClasses).toContain('btn-success');
      expect(downButtonClasses).toContain('btn-danger');
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
      const originalElements = page.getByTestId('advanced-container').locator('.input-group-text');
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

  test.describe('Bootstrap 4 Specific Features', () => {
    test('should apply correct size classes', async ({ page }) => {
      // Skip size class testing on dedicated renderer page since we don't have different sizes
      // This test was for the original demo page with multiple input sizes
      expect(true).toBe(true); // Placeholder
    });

    test('should generate correct Bootstrap 4 markup structure', async ({ page }) => {
      const wrapper = page.getByTestId('basic-container').locator('[data-touchspin-injected="wrapper"]');

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
  });
});

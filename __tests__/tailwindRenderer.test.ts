import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinHelpers';

test.describe('Tailwind CSS Renderer', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-tailwind.html');
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'tailwind-renderer');
  });

  test.describe('Basic Rendering', () => {
    test('should inject required data-touchspin-injected attributes', async ({ page }) => {
      const wrapper = page.getByTestId('basic-test-wrapper');
      const input = wrapper.locator('input[type="text"]');

      // Verify wrapper itself has the data attribute
      await expect(wrapper).toHaveAttribute('data-touchspin-injected', 'wrapper');

      // Verify buttons have required data attributes
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');
      const downButton = wrapper.locator('[data-touchspin-injected="down"]');

      await expect(upButton).toBeVisible();
      await expect(downButton).toBeVisible();

      // Test functionality with data attribute selectors
      await upButton.click();
      expect(await input.inputValue()).toBe('6'); // Initial value 5 + 1
    });

    test('should work without any Bootstrap CSS dependencies', async ({ page }) => {
      // Verify no Bootstrap CSS is loaded
      const bootstrapCSS = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        return links.some(link =>
          link.href.includes('bootstrap') ||
          link.href.includes('bs3') ||
          link.href.includes('bs4') ||
          link.href.includes('bs5')
        );
      });
      expect(bootstrapCSS).toBe(false);

      // Verify TouchSpin still functions correctly
      const basicTest = page.getByTestId('basic-test-wrapper');
      await expect(basicTest).toBeVisible();

      const wrapper = basicTest.locator('..');
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');
      await upButton.click();

      const value = await basicTest.inputValue();
      expect(parseInt(value)).toBe(6); // Initial value 5 + 1
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
      const basicTest = page.getByTestId('basic-test-wrapper');
      const initialValue = await basicTest.inputValue();
      expect(initialValue).toBe('5');

      const wrapper = basicTest.locator('..');
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');
      const downButton = wrapper.locator('[data-touchspin-injected="down"]');

      // Test increment
      await upButton.click();
      expect(await basicTest.inputValue()).toBe('6');

      // Test decrement
      await downButton.click();
      await downButton.click();
      expect(await basicTest.inputValue()).toBe('4');
    });

    test('should display initial prefix/postfix', async ({ page }) => {
      const prefixPostfixTest = page.getByTestId('prefix-postfix-test');
      const wrapper = prefixPostfixTest.locator('..');

      // Verify prefix is displayed
      const prefix = wrapper.locator('[data-touchspin-injected="prefix"]');
      await expect(prefix).toBeVisible();
      expect((await prefix.textContent()).trim()).toBe('$');

      // Verify postfix is displayed
      const postfix = wrapper.locator('[data-touchspin-injected="postfix"]');
      await expect(postfix).toBeVisible();
      expect((await postfix.textContent()).trim()).toBe('.00');

      // Test functionality with prefix/postfix
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');
      await upButton.click();
      expect(await prefixPostfixTest.inputValue()).toBe('15'); // 10 + 5 (step)
    });

    test('should handle vertical layout', async ({ page }) => {
      const verticalTest = page.getByTestId('vertical-basic-test');
      const wrapper = verticalTest.locator('..');
      const verticalWrapper = wrapper.locator('[data-touchspin-injected="vertical-wrapper"]');

      await expect(verticalWrapper).toBeVisible();

      // Test vertical button functionality
      const upButton = verticalWrapper.locator('[data-touchspin-injected="up"]');
      const downButton = verticalWrapper.locator('[data-touchspin-injected="down"]');

      await expect(upButton).toBeVisible();
      await expect(downButton).toBeVisible();

      // Test functionality
      await upButton.click();
      expect(await verticalTest.inputValue()).toBe('16'); // 15 + 1
    });
  });

  test.describe('Dynamic Settings Updates - Normal Input', () => {
    test('should update prefix/postfix text via updatesettings', async ({ page }) => {
      await page.goto('/__tests__/html-package/tailwind-renderer-jquery.html');
      await page.click('[data-testid="btn-init"]');

      // Apply updates: add prefix/postfix text
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('[data-testid="jq-input"]');
        $i.trigger('touchspin.updatesettings', [{ prefix: 'USD', postfix: 'kg' }]);
      });

      // Query elements inside wrapper
      const prefix = page.locator('[data-touchspin-injected="wrapper"] [data-touchspin-injected="prefix"]');
      const postfix = page.locator('[data-touchspin-injected="wrapper"] [data-touchspin-injected="postfix"]');

      await expect(prefix).toHaveText('USD');
      await expect(postfix).toHaveText('kg');

      // Test removing prefix/postfix
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('[data-testid="jq-input"]');
        $i.trigger('touchspin.updatesettings', [{ prefix: '', postfix: '' }]);
      });

      // Elements should be removed when empty
      await expect(prefix).not.toBeVisible();
      await expect(postfix).not.toBeVisible();
    });

    test('should update button text (buttonup_txt/buttondown_txt)', async ({ page }) => {
      // This test will fail for TailwindRenderer - driving TDD implementation
      await page.goto('/__tests__/html-package/tailwind-renderer-jquery.html');
      await page.click('[data-testid="btn-init"]');

      // Apply button text updates
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('[data-testid="jq-input"]');
        $i.trigger('touchspin.updatesettings', [{ buttonup_txt: '▲', buttondown_txt: '▼' }]);
      });

      const wrapper = page.locator('[data-touchspin-injected="wrapper"]');
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');
      const downButton = wrapper.locator('[data-touchspin-injected="down"]');

      await expect(upButton).toHaveText('▲');
      await expect(downButton).toHaveText('▼');
    });

    test('should update button classes (buttonup_class/buttondown_class)', async ({ page }) => {
      await page.goto('/__tests__/html-package/tailwind-renderer-jquery.html');
      await page.click('[data-testid="btn-init"]');

      // Apply button class updates
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('[data-testid="jq-input"]');
        $i.trigger('touchspin.updatesettings', [{ buttonup_class: 'custom-up-class', buttondown_class: 'custom-down-class' }]);
      });

      const wrapper = page.locator('[data-touchspin-injected="wrapper"]');
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');
      const downButton = wrapper.locator('[data-touchspin-injected="down"]');

      const upButtonClasses = await upButton.evaluate(el => el.className);
      const downButtonClasses = await downButton.evaluate(el => el.className);

      expect(upButtonClasses).toContain('custom-up-class');
      expect(downButtonClasses).toContain('custom-down-class');
    });

    test('should update addon classes (prefix_extraclass/postfix_extraclass)', async ({ page }) => {
      // This test will fail for TailwindRenderer - driving TDD implementation
      await page.goto('/__tests__/html-package/tailwind-renderer-jquery.html');
      await page.click('[data-testid="btn-init"]');

      // Apply updates: add prefix/postfix text and extra classes
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('[data-testid="jq-input"]');
        $i.trigger('touchspin.updatesettings', [{ prefix: 'USD', postfix: 'kg', prefix_extraclass: 'tw-prefix-x', postfix_extraclass: 'tw-postfix-y' }]);
      });

      const prefix = page.locator('[data-touchspin-injected="wrapper"] [data-touchspin-injected="prefix"]');
      const postfix = page.locator('[data-touchspin-injected="wrapper"] [data-touchspin-injected="postfix"]');

      // Class updates applied
      const prefixClass = await prefix.evaluate(el => el.className);
      const postfixClass = await postfix.evaluate(el => el.className);
      expect(prefixClass).toContain('tw-prefix-x');
      expect(postfixClass).toContain('tw-postfix-y');

      // Change classes again to ensure removal then add works
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('[data-testid="jq-input"]');
        $i.trigger('touchspin.updatesettings', [{ prefix_extraclass: 'tw-prefix-z', postfix_extraclass: 'tw-postfix-q' }]);
      });
      const prefixClass2 = await prefix.evaluate(el => el.className);
      const postfixClass2 = await postfix.evaluate(el => el.className);
      expect(prefixClass2).not.toContain('tw-prefix-x');
      expect(postfixClass2).not.toContain('tw-postfix-y');
      expect(prefixClass2).toContain('tw-prefix-z');
      expect(postfixClass2).toContain('tw-postfix-q');
    });

    test('should update vertical button classes', async ({ page }) => {
      await page.goto('/__tests__/html-package/tailwind-renderer-jquery.html');
      // Initialize with vertical buttons
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('[data-testid="jq-input"]');
        $i.TouchSpin({ verticalbuttons: true });
      });

      // Update vertical button classes
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('[data-testid="jq-input"]');
        $i.trigger('touchspin.updatesettings', [{ verticalupclass: 'custom-vertical-up', verticaldownclass: 'custom-vertical-down' }]);
      });

      const wrapper = page.locator('[data-touchspin-injected="wrapper"]');
      const verticalWrapper = wrapper.locator('[data-touchspin-injected="vertical-wrapper"]');
      const upButton = verticalWrapper.locator('[data-touchspin-injected="up"]');
      const downButton = verticalWrapper.locator('[data-touchspin-injected="down"]');

      const upButtonClasses = await upButton.evaluate(el => el.className);
      const downButtonClasses = await downButton.evaluate(el => el.className);

      expect(upButtonClasses).toContain('custom-vertical-up');
      expect(downButtonClasses).toContain('custom-vertical-down');
    });

    test('should update vertical button text', async ({ page }) => {
      await page.goto('/__tests__/html-package/tailwind-renderer-jquery.html');
      // Initialize with vertical buttons
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('[data-testid="jq-input"]');
        $i.TouchSpin({ verticalbuttons: true });
      });

      // Update vertical button text
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('[data-testid="jq-input"]');
        $i.trigger('touchspin.updatesettings', [{ verticalup: '↑', verticaldown: '↓' }]);
      });

      const wrapper = page.locator('[data-touchspin-injected="wrapper"]');
      const verticalWrapper = wrapper.locator('[data-touchspin-injected="vertical-wrapper"]');
      const upButton = verticalWrapper.locator('[data-touchspin-injected="up"]');
      const downButton = verticalWrapper.locator('[data-touchspin-injected="down"]');

      await expect(upButton).toHaveText('↑');
      await expect(downButton).toHaveText('↓');
    });
  });

  test.describe('Dynamic Settings Updates - Advanced Container', () => {
    test('should update settings in advanced mode', async ({ page }) => {
      await page.goto('/__tests__/html-package/tailwind-renderer-jquery.html');
      // Initialize in advanced mode by using existing flex container
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="jq-input"]');
        if (input) {
          const flexContainer = document.createElement('div');
          flexContainer.className = 'flex rounded-md';
          input.parentElement.insertBefore(flexContainer, input);
          flexContainer.appendChild(input);

          const $ = (window as any).jQuery;
          const $i = $(input);
          $i.TouchSpin({ prefix: 'Start', postfix: 'End' });
        }
      });

      // Update settings in advanced mode
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const $i = $('[data-testid="jq-input"]');
        $i.trigger('touchspin.updatesettings', [{ prefix: 'Advanced', postfix: 'Mode' }]);
      });

      const prefix = page.locator('[data-touchspin-injected="wrapper-advanced"] [data-touchspin-injected="prefix"]');
      const postfix = page.locator('[data-touchspin-injected="wrapper-advanced"] [data-touchspin-injected="postfix"]');

      await expect(prefix).toHaveText('Advanced');
      await expect(postfix).toHaveText('Mode');
    });
  });

  test.describe('Boundary and Validation', () => {
    test('should respect min/max boundaries', async ({ page }) => {
      const input = page.getByTestId('boundary-test');
      const wrapper = input.locator('..');
      const downButton = wrapper.locator('[data-touchspin-injected="down"]');
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');

      // Test minimum boundary - start at 5, need to click 15 times to reach -10
      for (let i = 0; i < 15; i++) {
        await downButton.click();
      }

      const minValue = await input.inputValue();
      expect(parseInt(minValue)).toBe(-10); // Should stop at min boundary

      // Test maximum boundary (should be 10)
      await page.fill('[data-testid="boundary-test"]', '10');
      await upButton.click(); // Try to go above 10

      const maxValue = await input.inputValue();
      expect(parseInt(maxValue)).toBe(10); // Should not go above 10
    });

    test('should handle decimal values correctly', async ({ page }) => {
      const input = page.getByTestId('decimal-test');
      const wrapper = input.locator('..');
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');

      // Initial value should be 12.50
      expect(await input.inputValue()).toBe('12.50');

      // Increment by step (0.25)
      await upButton.click();
      expect(await input.inputValue()).toBe('12.75');

      await upButton.click();
      expect(await input.inputValue()).toBe('13.00');
    });

    test('should handle step validation correctly', async ({ page }) => {
      const input = page.getByTestId('step-test');
      const wrapper = input.locator('..');
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');

      // Initial value should be 0, step should be 10
      expect(await input.inputValue()).toBe('0');

      await upButton.click();
      expect(await input.inputValue()).toBe('10');

      await upButton.click();
      expect(await input.inputValue()).toBe('20');
    });
  });

  test.describe('CSS Independence Verification', () => {
    test('should function completely without Bootstrap CSS', async ({ page }) => {
      const input = page.getByTestId('independence-test');
      const wrapper = input.locator('..');

      // Verify the test section has the correct highlighting
      const testSection = page.locator('.bg-yellow-50');
      await expect(testSection).toBeVisible();

      // Verify prefix and postfix work
      const prefix = wrapper.locator('[data-touchspin-injected="prefix"]');
      const postfix = wrapper.locator('[data-touchspin-injected="postfix"]');

      await expect(prefix).toBeVisible();
      await expect(postfix).toBeVisible();
      expect((await prefix.textContent()).trim()).toBe('🎯');
      expect((await postfix.textContent()).trim()).toBe('pts');

      // Test full functionality
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');
      const downButton = wrapper.locator('[data-touchspin-injected="down"]');

      await upButton.click();
      expect(await input.inputValue()).toBe('43'); // 42 + 1

      await downButton.click();
      await downButton.click();
      expect(await input.inputValue()).toBe('41'); // 43 - 2
    });

    test('should have proper focus and interaction behavior', async ({ page }) => {
      const input = page.getByTestId('basic-test');
      const wrapper = input.locator('..');

      // Test focus states
      await input.focus();

      // Test button interaction
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');

      // Verify button is interactive
      await expect(upButton).toBeEnabled();
      await upButton.click();
      expect(await input.inputValue()).toBe('6');
    });
  });
});

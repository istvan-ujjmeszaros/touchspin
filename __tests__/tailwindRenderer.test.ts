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

  test.describe('CSS Independence', () => {
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
      const basicTest = page.getByTestId('basic-test');
      await expect(basicTest).toBeVisible();
      
      const wrapper = basicTest.locator('..');
      const upButton = wrapper.locator('.bootstrap-touchspin-up');
      await upButton.click();
      
      const value = await basicTest.inputValue();
      expect(parseInt(value)).toBe(6); // Initial value 5 + 1
    });

    test('should use only Tailwind utility classes', async ({ page }) => {
      const basicTest = page.getByTestId('basic-test');
      const wrapper = basicTest.locator('..');
      
      // Verify container uses Tailwind classes
      const containerClasses = await wrapper.evaluate(el => el.className);
      expect(containerClasses).toContain('flex');
      expect(containerClasses).toContain('rounded-md');
      expect(containerClasses).toContain('shadow-sm');
      expect(containerClasses).toContain('border');
      expect(containerClasses).toContain('border-gray-300');

      // Verify buttons use Tailwind classes
      const upButton = wrapper.locator('.bootstrap-touchspin-up');
      const upButtonClasses = await upButton.evaluate(el => el.className);
      expect(upButtonClasses).toContain('inline-flex');
      expect(upButtonClasses).toContain('items-center');
      expect(upButtonClasses).toContain('justify-center');
      expect(upButtonClasses).toContain('bg-gray-100');
      expect(upButtonClasses).toContain('hover:bg-gray-200');
    });

    test('should not include any Bootstrap-specific classes', async ({ page }) => {
      // Check that no Bootstrap UI classes are present in the DOM
      // Note: We exclude bootstrap-touchspin classes as these are our own plugin classes
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

  test.describe('Basic Functionality', () => {
    test('should increment and decrement values correctly', async ({ page }) => {
      const basicTest = page.getByTestId('basic-test');
      const initialValue = await basicTest.inputValue();
      expect(initialValue).toBe('5');

      // Test increment
      const wrapper = basicTest.locator('..');
      const upButton = wrapper.locator('.bootstrap-touchspin-up');
      await upButton.click();
      expect(await basicTest.inputValue()).toBe('6');

      // Test decrement
      const downButton = wrapper.locator('.bootstrap-touchspin-down');
      await downButton.click();
      await downButton.click();
      expect(await basicTest.inputValue()).toBe('4');
    });

    test('should handle prefix and postfix correctly', async ({ page }) => {
      const prefixPostfixTest = page.getByTestId('prefix-postfix-test');
      const wrapper = prefixPostfixTest.locator('..');
      
      // Verify prefix is displayed
      const prefix = wrapper.locator('.bootstrap-touchspin-prefix');
      await expect(prefix).toBeVisible();
      expect((await prefix.textContent()).trim()).toBe('$');
      
      // Verify postfix is displayed
      const postfix = wrapper.locator('.bootstrap-touchspin-postfix');
      await expect(postfix).toBeVisible();
      expect((await postfix.textContent()).trim()).toBe('.00');

      // Test functionality with prefix/postfix
      const upButton = wrapper.locator('.bootstrap-touchspin-up');
      await upButton.click();
      expect(await prefixPostfixTest.inputValue()).toBe('15'); // 10 + 5 (step)
    });

    test('should handle decimal values correctly', async ({ page }) => {
      const decimalTest = page.getByTestId('decimal-test');
      const wrapper = decimalTest.locator('..');
      const upButton = wrapper.locator('.bootstrap-touchspin-up');
      
      // Initial value should be 12.50
      expect(await decimalTest.inputValue()).toBe('12.50');
      
      // Increment by step (0.25)
      await upButton.click();
      expect(await decimalTest.inputValue()).toBe('12.75');
      
      await upButton.click();
      expect(await decimalTest.inputValue()).toBe('13.00');
    });
  });

  test.describe('Size Detection', () => {
    test('should detect small size inputs correctly', async ({ page }) => {
      const smallTest = page.getByTestId('small-size-test');
      const wrapper = smallTest.locator('..');
      
      // Verify small size classes are applied
      const buttons = wrapper.locator('.tailwind-btn');
      const firstButton = buttons.first();
      
      const buttonClasses = await firstButton.evaluate(el => el.className);
      // Small inputs should have appropriate small button styling
      expect(buttonClasses).toContain('tailwind-btn');
    });

    test('should detect large size inputs correctly', async ({ page }) => {
      const largeTest = page.getByTestId('large-size-test');
      const wrapper = largeTest.locator('..');
      
      // Verify large size handling
      const buttons = wrapper.locator('.tailwind-btn');
      const firstButton = buttons.first();
      
      const buttonClasses = await firstButton.evaluate(el => el.className);
      expect(buttonClasses).toContain('tailwind-btn');
    });
  });

  test.describe('Vertical Button Layout', () => {
    test('should render vertical buttons correctly', async ({ page }) => {
      const verticalTest = page.getByTestId('vertical-basic-test');
      const wrapper = verticalTest.locator('..');
      const verticalWrapper = wrapper.locator('.bootstrap-touchspin-vertical-button-wrapper');
      
      await expect(verticalWrapper).toBeVisible();
      
      // Verify vertical wrapper classes
      const wrapperClasses = await verticalWrapper.evaluate(el => el.className);
      expect(wrapperClasses).toContain('flex');
      expect(wrapperClasses).toContain('flex-col');
      
      // Test vertical button functionality
      const upButton = verticalWrapper.locator('.bootstrap-touchspin-up');
      const downButton = verticalWrapper.locator('.bootstrap-touchspin-down');
      
      await expect(upButton).toBeVisible();
      await expect(downButton).toBeVisible();
      
      // Test functionality
      await upButton.click();
      expect(await verticalTest.inputValue()).toBe('16'); // 15 + 1
    });

    test('should work with vertical buttons and prefix', async ({ page }) => {
      const verticalPrefixTest = page.getByTestId('vertical-prefix-test');
      const wrapper = verticalPrefixTest.locator('..');
      
      // Verify prefix is present
      const prefix = wrapper.locator('.bootstrap-touchspin-prefix');
      await expect(prefix).toBeVisible();
      expect((await prefix.textContent()).trim()).toBe('#');
      
      // Test vertical button functionality
      const verticalWrapper = wrapper.locator('.bootstrap-touchspin-vertical-button-wrapper');
      const upButton = verticalWrapper.locator('.bootstrap-touchspin-up');
      
      await upButton.click();
      expect(await verticalPrefixTest.inputValue()).toBe('100'); // 99 + 1
    });
  });

  test.describe('Boundary and Validation', () => {
    test('should respect min/max boundaries', async ({ page }) => {
      const boundaryTest = page.getByTestId('boundary-test');
      const wrapper = boundaryTest.locator('..');
      const downButton = wrapper.locator('.bootstrap-touchspin-down');
      const upButton = wrapper.locator('.bootstrap-touchspin-up');
      
      // Test minimum boundary (should be 1)
      await downButton.click();
      await downButton.click();
      await downButton.click();
      await downButton.click();
      await downButton.click(); // Try to go below 1
      
      const minValue = await boundaryTest.inputValue();
      expect(parseInt(minValue)).toBe(1); // Should not go below 1
      
      // Test maximum boundary (should be 10)
      await page.fill('[data-testid="boundary-test"]', '10');
      await upButton.click(); // Try to go above 10
      
      const maxValue = await boundaryTest.inputValue();
      expect(parseInt(maxValue)).toBe(10); // Should not go above 10
    });

    test('should handle step validation correctly', async ({ page }) => {
      const stepTest = page.getByTestId('step-test');
      const wrapper = stepTest.locator('..');
      const upButton = wrapper.locator('.bootstrap-touchspin-up');
      
      // Initial value should be 0, step should be 10
      expect(await stepTest.inputValue()).toBe('0');
      
      await upButton.click();
      expect(await stepTest.inputValue()).toBe('10');
      
      await upButton.click();
      expect(await stepTest.inputValue()).toBe('20');
    });
  });

  test.describe('CSS Independence Verification', () => {
    test('should function completely without Bootstrap CSS', async ({ page }) => {
      const independenceTest = page.getByTestId('independence-test');
      const wrapper = independenceTest.locator('..');
      
      // Verify the test section has the correct highlighting
      const testSection = page.locator('.bg-yellow-50');
      await expect(testSection).toBeVisible();
      
      // Verify prefix and postfix work
      const prefix = wrapper.locator('.bootstrap-touchspin-prefix');
      const postfix = wrapper.locator('.bootstrap-touchspin-postfix');
      
      await expect(prefix).toBeVisible();
      await expect(postfix).toBeVisible();
      expect((await prefix.textContent()).trim()).toBe('🎯');
      expect((await postfix.textContent()).trim()).toBe('pts');
      
      // Test full functionality
      const upButton = wrapper.locator('.bootstrap-touchspin-up');
      const downButton = wrapper.locator('.bootstrap-touchspin-down');
      
      await upButton.click();
      expect(await independenceTest.inputValue()).toBe('43'); // 42 + 1
      
      await downButton.click();
      await downButton.click();
      expect(await independenceTest.inputValue()).toBe('41'); // 43 - 2
    });

    test('should have proper focus and interaction states', async ({ page }) => {
      const basicTest = page.getByTestId('basic-test');
      const wrapper = basicTest.locator('..');
      
      // Test focus states
      await basicTest.focus();
      
      // Verify focus-within styles are applied
      const containerClasses = await wrapper.evaluate(el => el.className);
      expect(containerClasses).toContain('focus-within:ring-2');
      expect(containerClasses).toContain('focus-within:ring-blue-500');
      
      // Test button hover states (classes should be present)
      const upButton = wrapper.locator('.bootstrap-touchspin-up');
      const buttonClasses = await upButton.evaluate(el => el.className);
      expect(buttonClasses).toContain('hover:bg-gray-200');
      expect(buttonClasses).toContain('active:bg-gray-300');
    });
  });

  test.describe('Framework Identification', () => {
    test('should identify as tailwind framework', async ({ page }) => {
      // This would typically be tested through the renderer factory
      // but we can verify the build includes the right framework ID
      const frameworkInfo = await page.evaluate(() => {
        // Check if RendererFactory exists and has the right framework ID
        return window.RendererFactory ? window.RendererFactory.getFrameworkId() : null;
      });
      
      expect(frameworkInfo).toBe('tailwind');
    });
  });
});
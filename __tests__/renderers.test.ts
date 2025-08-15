import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinHelpers';

test.describe('Bootstrap Renderer System', () => {

  test.describe('Bootstrap 3 Renderer', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/__tests__/html/index-bs3.html');
      await touchspinHelpers.waitForTouchSpinReady(page, 'touchspin-default');
    });

    test('should generate correct Bootstrap 3 markup structure', async ({ page }) => {
      // Test basic button structure scoped to specific testid
      const spin = page.getByTestId('touchspin-default');
      const buttonContainer = spin.locator('.input-group-btn');
      await expect(buttonContainer).toBeVisible();
      
      // Test buttons have correct classes
      const upButton = spin.locator('.bootstrap-touchspin-up');
      const downButton = spin.locator('.bootstrap-touchspin-down');
      await expect(upButton).toBeVisible();
      await expect(downButton).toBeVisible();
      
      // Validate button classes
      const upButtonClasses = await upButton.evaluate((el) => el.className);
      const downButtonClasses = await downButton.evaluate((el) => el.className);
      
      expect(upButtonClasses).toContain('btn');
      expect(downButtonClasses).toContain('btn');
    });

    test('should use input-group-addon class for prefix and postfix', async ({ page }) => {
      const prefixClasses = await page.locator('.bootstrap-touchspin-prefix').first().evaluate(el => el.className);
      const postfixClasses = await page.locator('.bootstrap-touchspin-postfix').first().evaluate(el => el.className);
      
      expect(prefixClasses).toContain('input-group-addon');
      expect(postfixClasses).toContain('input-group-addon');
    });

    test('should apply correct size classes', async ({ page }) => {
      // Test small input group
      const smallInputGroup = await page.evaluate(() => {
        const input = document.querySelector('#input_group_sm');
        return input?.parentElement?.className;
      });
      expect(smallInputGroup).toContain('input-group-sm');
      
      // Test large input group  
      const largeInputGroup = await page.evaluate(() => {
        const input = document.querySelector('#input_group_lg');
        return input?.parentElement?.className;
      });
      expect(largeInputGroup).toContain('input-group-lg');
    });

    test('should handle vertical button markup correctly', async ({ page }) => {
      const verticalWrapper = page.locator('.bootstrap-touchspin-vertical-button-wrapper').first();
      await expect(verticalWrapper).toBeVisible();
      
      const upButton = page.locator('.bootstrap-touchspin-vertical-button-wrapper .bootstrap-touchspin-up').first();
      const downButton = page.locator('.bootstrap-touchspin-vertical-button-wrapper .bootstrap-touchspin-down').first();
      
      await expect(upButton).toBeVisible();
      await expect(downButton).toBeVisible();
    });
  });

  test.describe('Bootstrap 4 Renderer', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/__tests__/html/index-bs4.html');
      await touchspinHelpers.waitForTouchSpinReady(page, 'touchspin-default');
    });

    test('should generate correct Bootstrap 4 markup structure', async ({ page }) => {
      // Test for prepend/append structure
      const prepend = page.locator('.input-group-prepend').first();
      const append = page.locator('.input-group-append').first();
      
      const hasPrependOrAppend = await prepend.count() > 0 || await append.count() > 0;
      expect(hasPrependOrAppend).toBe(true);
      
      // Test input-group-text wrapper
      const prefixText = page.locator('.bootstrap-touchspin-prefix .input-group-text').first();
      const postfixText = page.locator('.bootstrap-touchspin-postfix .input-group-text').first();
      
      await expect(prefixText).toBeVisible();
      await expect(postfixText).toBeVisible();
    });

    test('should handle existing input groups correctly', async ({ page }) => {
      // Test with existing DOM structure
      const existingGroup = page.locator('#input_group_from_dom_prefix_postfix');
      await expect(existingGroup).toBeVisible();
      
      // Ensure original prepend/append are preserved
      const originalPrepend = await page.evaluate(() => {
        const container = document.querySelector('#input_group_from_dom_prefix_postfix')?.parentElement;
        return container?.querySelector('.input-group-prepend:not(.bootstrap-touchspin-prefix)') !== null;
      });
      expect(originalPrepend).toBe(true);
    });

    test('should apply correct form-control size classes', async ({ page }) => {
      const smallInput = page.locator('#input_group_sm');
      const largeInput = page.locator('#input_group_lg');
      
      const smallClasses = await smallInput.evaluate((el) => el.className);
      const largeClasses = await largeInput.evaluate((el) => el.className);
      
      expect(smallClasses).toContain('form-control-sm');
      expect(largeClasses).toContain('form-control-lg');
    });
  });

  test.describe('Bootstrap 5 Renderer', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/__tests__/html/index-bs5.html');
      await touchspinHelpers.waitForTouchSpinReady(page, 'touchspin-default');
    });

    test('should generate correct Bootstrap 5 markup structure', async ({ page }) => {
      // Test direct input-group-text without prepend/append wrappers
      const directPrefix = page.locator('.bootstrap-touchspin-prefix.input-group-text').first();
      const directPostfix = page.locator('.bootstrap-touchspin-postfix.input-group-text').first();
      
      await expect(directPrefix).toBeVisible();
      await expect(directPostfix).toBeVisible();
      
      // Ensure no deprecated prepend/append classes
      const prepend = page.locator('.input-group-prepend').first();
      const append = page.locator('.input-group-append').first();
      
      await expect(prepend).not.toBeVisible();
      await expect(append).not.toBeVisible();
    });

    test('should handle direct button placement', async ({ page }) => {
      // Buttons should be placed directly in input group without wrapper divs
      const inputGroup = page.locator('.input-group').first();
      const buttons = page.locator('.input-group .btn.bootstrap-touchspin-up, .input-group .btn.bootstrap-touchspin-down');
      
      await expect(inputGroup).toBeVisible();
      expect(await buttons.count()).toBeGreaterThan(0);
    });

    test('should preserve existing input-group-text elements', async ({ page }) => {
      const existingElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('.input-group .input-group-text:not(.bootstrap-touchspin-prefix):not(.bootstrap-touchspin-postfix)');
        return elements.length;
      });
      
      expect(existingElements).toBeGreaterThan(0);
    });

    test('should function correctly with Bootstrap 5 structure', async ({ page }) => {
      const testid = 'touchspin-default';
      
      // Test functionality
      await touchspinHelpers.touchspinClickUp(page, testid);
      expect(await touchspinHelpers.readInputValue(page, testid)).toBe('51');
      
      await touchspinHelpers.touchspinClickDown(page, testid);
      expect(await touchspinHelpers.readInputValue(page, testid)).toBe('50');
    });
  });

  test.describe('Renderer Consistency Across Versions', () => {
    test('should maintain consistent button behavior across Bootstrap versions', async ({ page }) => {
      const versions = [
        { name: 'Bootstrap 3', html: 'index-bs3.html' },
        { name: 'Bootstrap 4', html: 'index-bs4.html' },
        { name: 'Bootstrap 5', html: 'index-bs5.html' }
      ];

      for (const version of versions) {
        await page.goto(`/__tests__/html/${version.html}`);
        await touchspinHelpers.waitForTouchSpinReady(page, 'touchspin-default');
        
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
        await touchspinHelpers.waitForTouchSpinReady(page, 'touchspin-default');
        
        // Validate basic structure exists
        const spin = page.getByTestId('touchspin-default');
        const hasInputGroup = spin.locator('.input-group');
        const hasUpButton = spin.locator('.bootstrap-touchspin-up');
        const hasDownButton = spin.locator('.bootstrap-touchspin-down');
        
        await expect(hasInputGroup).toBeVisible();
        await expect(hasUpButton).toBeVisible();
        await expect(hasDownButton).toBeVisible();
      }
    });
  });
});
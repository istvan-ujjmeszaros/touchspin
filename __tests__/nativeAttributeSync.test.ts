import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinHelpers';

test.describe('Native Attribute Synchronization Tests', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html');
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'nativeAttributeSync');
  });

  test.describe('Native Attribute Priority and Synchronization', () => {
    test('should demonstrate native attribute synchronization - step changes affect increment behavior', async ({ page }) => {
      // Test that changing step attribute affects TouchSpin increment behavior
      const testid = 'touchspin-number';
      
      // Reset to a known value and set a larger step
      await page.evaluate((testId) => {
        const $input = $(`[data-testid="${testId}"]`);
        $input.val('50');
        const inputElement = $input[0];
        inputElement.setAttribute('step', '5');
      }, testid);
      
      // Wait for potential MutationObserver processing
      await touchspinHelpers.waitForTimeout(200);
      
      // Click up button and verify it increments by the step amount
      await touchspinHelpers.touchspinClickUp(page, testid);
      const valueAfterUp = await touchspinHelpers.readInputValue(page, testid);
      
      // Should increment by step (5), so 50 + 5 = 55
      expect(valueAfterUp).toBe('55');
      
      // Test with different step value
      await page.evaluate((testId) => {
        const $input = $(`[data-testid="${testId}"]`);
        $input.val('60');
        const inputElement = $input[0];
        inputElement.setAttribute('step', '10');
      }, testid);
      
      await touchspinHelpers.waitForTimeout(200);
      
      // Click up button and verify it increments by the new step amount
      await touchspinHelpers.touchspinClickUp(page, testid);
      const valueAfterSecondUp = await touchspinHelpers.readInputValue(page, testid);
      
      // Should increment by new step (10), so 60 + 10 = 70
      expect(valueAfterSecondUp).toBe('70');
    });

    test('should demonstrate attribute removal synchronization', async ({ page }) => {
      // Test that removing step attribute affects behavior
      const testid = 'touchspin-number';
      
      // First set a custom step
      await page.evaluate((testId) => {
        const $input = $(`[data-testid="${testId}"]`);
        $input.val('50');
        const inputElement = $input[0];
        inputElement.setAttribute('step', '5');
      }, testid);
      
      await touchspinHelpers.waitForTimeout(200);
      
      // Verify step=5 works
      await touchspinHelpers.touchspinClickUp(page, testid);
      expect(await touchspinHelpers.readInputValue(page, testid)).toBe('55');
      
      // Now remove the step attribute (should default to step=1)
      await page.evaluate((testId) => {
        const $input = $(`[data-testid="${testId}"]`);
        $input.val('60');
        const inputElement = $input[0];
        inputElement.removeAttribute('step');
      }, testid);
      
      await touchspinHelpers.waitForTimeout(200);
      
      // Should now increment by 1 (default step)
      await touchspinHelpers.touchspinClickUp(page, testid);
      expect(await touchspinHelpers.readInputValue(page, testid)).toBe('61');
    });
  });
});
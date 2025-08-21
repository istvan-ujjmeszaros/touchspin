/**
 * Settings Precedence Tests
 * Tests that user-configurable settings work correctly with the renderer system.
 * Note: Button classes are now hard-coded in renderers and not user-configurable.
 * These tests focus on settings that users can still customize.
 */

import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinHelpers';

test.describe('Settings Precedence System', () => {

  test.describe('User Content Settings Are Preserved', () => {

    test('should preserve user button text over defaults', async ({ page }) => {
      await touchspinHelpers.startCoverage(page);
      await page.goto('/__tests__/html/index-bs4.html');
      
      const customUpText = '↑UP↑';
      const customDownText = '↓DOWN↓';
      const testId = 'touchspin-default';
      
      // Initialize with custom button text
      await page.evaluate(({ customUpText, customDownText }) => {
        const $ = (window as any).jQuery;
        const input = $('#testinput_default');
        
        input.TouchSpin({
          buttonup_txt: customUpText,
          buttondown_txt: customDownText
        });
      }, { customUpText, customDownText });
      
      // Get the TouchSpin wrapper and check button text
      const wrapper = page.getByTestId(testId + '-wrapper');
      const upButton = wrapper.locator('.bootstrap-touchspin-up');
      const downButton = wrapper.locator('.bootstrap-touchspin-down');
      
      await expect(upButton).toHaveText(customUpText);
      await expect(downButton).toHaveText(customDownText);
      
      await touchspinHelpers.collectCoverage(page, 'settingsPrecedence');
    });

    test('should preserve user prefix and postfix content', async ({ page }) => {
      await touchspinHelpers.startCoverage(page);
      await page.goto('/__tests__/html/index-bs4.html');
      
      const customPrefix = '$$$';
      const customPostfix = ' USD';
      const testId = 'touchspin-default';
      
      // Initialize with custom prefix/postfix
      await page.evaluate(({ customPrefix, customPostfix }) => {
        const $ = (window as any).jQuery;
        const input = $('#testinput_default');
        
        input.TouchSpin({
          prefix: customPrefix,
          postfix: customPostfix
        });
      }, { customPrefix, customPostfix });
      
      // Get the TouchSpin wrapper and check prefix/postfix
      const wrapper = page.getByTestId(testId + '-wrapper');
      const prefixElement = wrapper.locator('.bootstrap-touchspin-prefix');
      const postfixElement = wrapper.locator('.bootstrap-touchspin-postfix');
      
      await expect(prefixElement).toHaveText(customPrefix);
      await expect(postfixElement).toHaveText(customPostfix);
      
      await touchspinHelpers.collectCoverage(page, 'settingsPrecedence');
    });

    test('should preserve user vertical button content', async ({ page }) => {
      await touchspinHelpers.startCoverage(page);
      await page.goto('/__tests__/html/index-bs5.html');
      
      const customUpSymbol = '⬆️';
      const customDownSymbol = '⬇️';
      const testId = 'touchspin-vertical';
      
      // Initialize with custom vertical button symbols
      await page.evaluate(({ customUpSymbol, customDownSymbol }) => {
        const $ = (window as any).jQuery;
        const input = $('#input_vertical');
        
        input.TouchSpin({
          verticalbuttons: true,
          verticalup: customUpSymbol,
          verticaldown: customDownSymbol
        });
      }, { customUpSymbol, customDownSymbol });
      
      // Get the TouchSpin wrapper and check vertical button symbols
      const wrapper = page.getByTestId(testId + '-wrapper');
      const upButton = wrapper.locator('.bootstrap-touchspin-up');
      const downButton = wrapper.locator('.bootstrap-touchspin-down');
      
      await expect(upButton).toHaveText(customUpSymbol);
      await expect(downButton).toHaveText(customDownSymbol);
      
      await touchspinHelpers.collectCoverage(page, 'settingsPrecedence');
    });
  });

  test.describe('User Numerical Settings Are Preserved', () => {

    test('should preserve user min/max/step settings', async ({ page }) => {
      await touchspinHelpers.startCoverage(page);
      await page.goto('/__tests__/html/index-bs4.html');
      
      const customMin = 5;
      const customMax = 50;
      const customStep = 3;
      const testId = 'touchspin-default';
      
      // Initialize with custom numerical settings
      await page.evaluate(({ customMin, customMax, customStep }) => {
        const $ = (window as any).jQuery;
        const input = $('#testinput_default');
        
        input.TouchSpin({
          min: customMin,
          max: customMax,
          step: customStep,
          initval: 10
        });
      }, { customMin, customMax, customStep });
      
      // Test the functionality using helpers
      const initialValue = parseInt((await touchspinHelpers.readInputValue(page, testId)) || '10');
      
      // Click up
      await touchspinHelpers.touchspinClickUp(page, testId);
      const afterUpValue = parseInt((await touchspinHelpers.readInputValue(page, testId)) || '0');
      
      // Click down twice
      await touchspinHelpers.touchspinClickDown(page, testId);
      await touchspinHelpers.touchspinClickDown(page, testId);
      const afterDownValue = parseInt((await touchspinHelpers.readInputValue(page, testId)) || '0');
      
      expect(afterUpValue - initialValue).toBe(customStep);
      expect(afterUpValue - afterDownValue).toBe(customStep * 2);
      expect(initialValue).toBeGreaterThanOrEqual(customMin);
      
      await touchspinHelpers.collectCoverage(page, 'settingsPrecedence');
    });

    test('should preserve user decimal and formatting settings', async ({ page }) => {
      await touchspinHelpers.startCoverage(page);
      await page.goto('/__tests__/html/index-bs4.html');
      
      const customDecimals = 2;
      const customStep = 0.25;
      const testId = 'touchspin-decimals';
      
      // Initialize with decimal settings
      await page.evaluate(({ customDecimals, customStep }) => {
        const $ = (window as any).jQuery;
        const input = $('#testinput_decimals');
        
        input.TouchSpin({
          decimals: customDecimals,
          step: customStep,
          initval: '5.00'
        });
      }, { customDecimals, customStep });
      
      // Test decimal functionality
      await touchspinHelpers.touchspinClickUp(page, testId);
      const afterUpValue = await touchspinHelpers.readInputValue(page, testId);
      
      expect(afterUpValue).toBe('5.25');
      
      await touchspinHelpers.collectCoverage(page, 'settingsPrecedence');
    });
  });

  test.describe('User Extra Class Settings Are Applied', () => {

    test('should apply user prefix and postfix extra classes', async ({ page }) => {
      await touchspinHelpers.startCoverage(page);
      await page.goto('/__tests__/html/index-bs4.html');
      
      const customPrefixClass = 'custom-prefix-style';
      const customPostfixClass = 'custom-postfix-style';
      const testId = 'touchspin-default';
      
      // Initialize with extra classes
      await page.evaluate(({ customPrefixClass, customPostfixClass }) => {
        const $ = (window as any).jQuery;
        const input = $('#testinput_default');
        
        input.TouchSpin({
          prefix: '$',
          postfix: '.00',
          prefix_extraclass: customPrefixClass,
          postfix_extraclass: customPostfixClass
        });
      }, { customPrefixClass, customPostfixClass });
      
      // Get the TouchSpin wrapper and check extra classes
      const wrapper = page.getByTestId(testId + '-wrapper');
      const prefixElement = wrapper.locator('.bootstrap-touchspin-prefix');
      const postfixElement = wrapper.locator('.bootstrap-touchspin-postfix');
      
      await expect(prefixElement).toHaveClass(new RegExp(customPrefixClass));
      await expect(postfixElement).toHaveClass(new RegExp(customPostfixClass));
      
      await touchspinHelpers.collectCoverage(page, 'settingsPrecedence');
    });
  });

  test.describe('Data Attributes Integration', () => {

    test('should respect data attribute settings', async ({ page }) => {
      await touchspinHelpers.startCoverage(page);
      await page.goto('/__tests__/html/index-bs4.html');
      
      const customPrefix = 'DATA-';
      const customStep = 5;
      const testId = 'touchspin-default';
      
      // Set data attributes and initialize
      await page.evaluate(({ customPrefix, customStep }) => {
        const $ = (window as any).jQuery;
        const input = $('#testinput_default');
        
        // Set data attributes
        input.attr('data-bts-prefix', customPrefix);
        input.attr('data-bts-step', customStep.toString());
        
        // Initialize (should pick up data attributes)
        input.TouchSpin({});
      }, { customPrefix, customStep });
      
      // Check prefix text
      const wrapper = page.getByTestId(testId + '-wrapper');
      const prefixElement = wrapper.locator('.bootstrap-touchspin-prefix');
      await expect(prefixElement).toHaveText(customPrefix);
      
      // Test step functionality
      const initialValue = parseInt((await touchspinHelpers.readInputValue(page, testId)) || '0');
      await touchspinHelpers.touchspinClickUp(page, testId);
      const afterUpValue = parseInt((await touchspinHelpers.readInputValue(page, testId)) || '0');
      
      expect(afterUpValue - initialValue).toBe(customStep);
      
      await touchspinHelpers.collectCoverage(page, 'settingsPrecedence');
    });
  });

  test.describe('Settings Update Precedence', () => {

    test('should maintain user settings when updating programmatically', async ({ page }) => {
      await touchspinHelpers.startCoverage(page);
      await page.goto('/__tests__/html/index-bs4.html');
      
      const initialCustomText = 'UP!';
      const updatedCustomText = 'HIGHER!';
      const testId = 'touchspin-default';
      
      // Initialize with custom button text
      await page.evaluate(({ initialCustomText }) => {
        const $ = (window as any).jQuery;
        const input = $('#testinput_default');
        
        input.TouchSpin({
          buttonup_txt: initialCustomText
        });
      }, { initialCustomText });
      
      // Check initial text
      const wrapper = page.getByTestId(testId + '-wrapper');
      const upButton = wrapper.locator('.bootstrap-touchspin-up');
      await expect(upButton).toHaveText(initialCustomText);
      
      // Update settings programmatically
      await page.evaluate(({ updatedCustomText }) => {
        const $ = (window as any).jQuery;
        const input = $('#testinput_default');
        
        input.trigger('touchspin.updatesettings', {
          buttonup_txt: updatedCustomText
        });
      }, { updatedCustomText });
      
      // Check updated text
      await expect(upButton).toHaveText(updatedCustomText);
      
      await touchspinHelpers.collectCoverage(page, 'settingsPrecedence');
    });
  });
});
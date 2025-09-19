/**
 * Settings Precedence Tests
import './coverage.hooks';
 * Tests the framework-agnostic settings precedence system where:
 * 1. Core defaults use null for framework-specific properties
 * 2. User settings take highest precedence
 * 3. Renderer defaults only fill null placeholders
 * 4. User customizations are never overridden by renderer defaults
 *
 * These tests use dedicated HTML files with fresh inputs to test proper precedence.
 */

import { test, expect } from '@playwright/test';
import * as apiHelpers from './helpers/touchspinApiHelpers';

test.describe('Settings Precedence System', () => {

  test.describe('User Text Content Takes Priority', () => {

    test('should preserve user button text over renderer defaults', async ({ page }) => {
      await apiHelpers.startCoverage(page);
      await page.goto('/__tests__/html/settings-precedence-user-text.html');
      await page.waitForLoadState('networkidle');

      // Check that user button text was applied
      const wrapper = await apiHelpers.getWrapperInstanceWhenReady(page, 'test-button-text-wrapper');
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');
      const downButton = wrapper.locator('[data-touchspin-injected="down"]');

      await expect(upButton).toHaveText('USER-UP');
      await expect(downButton).toHaveText('USER-DOWN');

      await apiHelpers.collectCoverage(page, 'settingsPrecedence');
    });

    test('should preserve user prefix and postfix content', async ({ page }) => {
      await apiHelpers.startCoverage(page);
      await page.goto('/__tests__/html/settings-precedence-user-text.html');
      await page.waitForLoadState('networkidle');

      // Check that user prefix/postfix was applied
      const wrapper = await apiHelpers.getWrapperInstanceWhenReady(page, 'test-prefix-postfix-wrapper');
      const prefixElement = wrapper.locator('[data-touchspin-injected="prefix"]');
      const postfixElement = wrapper.locator('[data-touchspin-injected="postfix"]');

      await expect(prefixElement).toHaveText('USER-PREFIX-');
      await expect(postfixElement).toHaveText('-USER-POSTFIX');

      await apiHelpers.collectCoverage(page, 'settingsPrecedence');
    });

    test('should preserve user vertical button content', async ({ page }) => {
      await apiHelpers.startCoverage(page);
      await page.goto('/__tests__/html/settings-precedence-user-text.html');
      await page.waitForLoadState('networkidle');

      // Check that user vertical button content was applied
      const wrapper = await apiHelpers.getWrapperInstanceWhenReady(page, 'test-vertical-wrapper');
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');
      const downButton = wrapper.locator('[data-touchspin-injected="down"]');

      await expect(upButton).toHaveText('USER-↑');
      await expect(downButton).toHaveText('USER-↓');

      await apiHelpers.collectCoverage(page, 'settingsPrecedence');
    });
  });

  test.describe('Renderer Defaults vs User Settings', () => {


    test('should preserve user classes over renderer defaults', async ({ page }) => {
      await apiHelpers.startCoverage(page);
      await page.goto('/__tests__/html/settings-precedence-renderer-defaults.html');
      await page.waitForLoadState('networkidle');

      // Check that user classes override renderer defaults
      const wrapper = await apiHelpers.getWrapperInstanceWhenReady(page, 'test-user-override-wrapper');
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');
      const downButton = wrapper.locator('[data-touchspin-injected="down"]');

      // Should have user custom classes, NOT renderer defaults
      await expect(upButton).toHaveClass(/user-custom-up-class/);
      await expect(downButton).toHaveClass(/user-custom-down-class/);
      await expect(upButton).not.toHaveClass(/test-btn-up/);
      await expect(downButton).not.toHaveClass(/test-btn-down/);

      await apiHelpers.collectCoverage(page, 'settingsPrecedence');
    });
  });

  test.describe('Numerical Settings Precedence', () => {

    test('should preserve user numerical settings', async ({ page }) => {
      await apiHelpers.startCoverage(page);
      await page.goto('/__tests__/html/settings-precedence-numerical.html');
      await page.waitForLoadState('networkidle');

      // Test custom step setting
      const testId = 'test-custom-step';
      const initialValue = parseInt((await apiHelpers.readInputValue(page, testId)) || '10');

      await apiHelpers.clickUpButton(page, testId);
      const afterUpValue = parseInt((await apiHelpers.readInputValue(page, testId)) || '0');

      // Should increment by custom step (3), not default (1)
      expect(afterUpValue - initialValue).toBe(3);

      await apiHelpers.collectCoverage(page, 'settingsPrecedence');
    });

    test('should preserve user decimal formatting settings', async ({ page }) => {
      await apiHelpers.startCoverage(page);
      await page.goto('/__tests__/html/settings-precedence-numerical.html');
      await page.waitForLoadState('networkidle');

      // Test decimal formatting
      const testId = 'test-decimals';

      await apiHelpers.clickUpButton(page, testId);
      const afterUpValue = await apiHelpers.readInputValue(page, testId);

      // Should increment by 0.25 and maintain 2 decimal places
      expect(afterUpValue).toBe('5.25');

      await apiHelpers.collectCoverage(page, 'settingsPrecedence');
    });

    test('should respect user min/max constraints', async ({ page }) => {
      await apiHelpers.startCoverage(page);
      await page.goto('/__tests__/html/settings-precedence-numerical.html');
      await page.waitForLoadState('networkidle');

      // Test min/max constraints with custom step
      const testId = 'test-min-max';
      const initialValue = parseInt((await apiHelpers.readInputValue(page, testId)) || '10');

      await apiHelpers.clickUpButton(page, testId);
      const afterUpValue = parseInt((await apiHelpers.readInputValue(page, testId)) || '0');

      // Should increment by custom step (3)
      expect(afterUpValue - initialValue).toBe(3);
      expect(initialValue).toBeGreaterThanOrEqual(5); // Custom min

      await apiHelpers.collectCoverage(page, 'settingsPrecedence');
    });
  });

  test.describe('Data Attributes Integration', () => {

    test('should respect data attribute settings when no JS settings provided', async ({ page }) => {
      await apiHelpers.startCoverage(page);
      await page.goto('/__tests__/html/settings-precedence-data-attributes.html');
      await page.waitForLoadState('networkidle');

      // Check that data attributes were applied
      const wrapper = await apiHelpers.getWrapperInstanceWhenReady(page, 'test-data-attrs-wrapper');
      const prefixElement = wrapper.locator('[data-touchspin-injected="prefix"]');
      const postfixElement = wrapper.locator('[data-touchspin-injected="postfix"]');

      await expect(prefixElement).toHaveText('DATA-PREFIX-');
      await expect(postfixElement).toHaveText('-DATA-POSTFIX');

      // Test data attribute step functionality
      const testId = 'test-data-attrs';
      const initialValue = parseInt((await apiHelpers.readInputValue(page, testId)) || '0');
      await apiHelpers.clickUpButton(page, testId);
      const afterUpValue = parseInt((await apiHelpers.readInputValue(page, testId)) || '0');

      // Should increment by data-bts-step="5"
      expect(afterUpValue - initialValue).toBe(5);

      await apiHelpers.collectCoverage(page, 'settingsPrecedence');
    });

    test('should allow JS settings to override data attributes', async ({ page }) => {
      await apiHelpers.startCoverage(page);
      await page.goto('/__tests__/html/settings-precedence-data-attributes.html');
      await page.waitForLoadState('networkidle');

      // Check that JS settings override data attributes
      const wrapper = await apiHelpers.getWrapperInstanceWhenReady(page, 'test-js-override-wrapper');
      const prefixElement = wrapper.locator('[data-touchspin-injected="prefix"]');

      // Should have JS prefix, not data attribute prefix
      await expect(prefixElement).toHaveText('JS-PREFIX-');

      // Test JS step override
      const testId = 'test-js-override';
      const initialValue = parseInt((await apiHelpers.readInputValue(page, testId)) || '0');
      await apiHelpers.clickUpButton(page, testId);
      const afterUpValue = parseInt((await apiHelpers.readInputValue(page, testId)) || '0');

      // Should increment by JS step (10), not data attribute step (1)
      expect(afterUpValue - initialValue).toBe(10);

      await apiHelpers.collectCoverage(page, 'settingsPrecedence');
    });
  });

  test.describe('Settings Update Events', () => {

    test('should handle programmatic settings updates correctly', async ({ page }) => {
      await apiHelpers.startCoverage(page);
      await page.goto('/__tests__/html/settings-precedence-user-text.html');
      await page.waitForLoadState('networkidle');

      // Check initial state
      const wrapper = await apiHelpers.getWrapperInstanceWhenReady(page, 'test-button-text-wrapper');
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');

      await expect(upButton).toHaveText('USER-UP');

      // Update settings programmatically
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('#test-button-text').trigger('touchspin.updatesettings', {
          buttonup_txt: 'UPDATED-UP'
        });
      });

      // Should update to new text
      await expect(upButton).toHaveText('UPDATED-UP');

      await apiHelpers.collectCoverage(page, 'settingsPrecedence');
    });
  });
});

/**
 * Feature: Bootstrap 3 renderer edge cases and defensive coding
 * Background: fixture = /packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] handles input-group-lg size class
 * [x] handles input-group-sm size class
 * [x] handles input-group-xs size class (Bootstrap 3 specific)
 * [x] handles horizontal addon with input-group-addon class
 * [x] handles btn-block class on buttons
 * [x] handles icon placement with glyphicon classes
 * [x] handles null wrapper in update methods
 * [x] handles missing addon group in horizontal layout
 * [x] updates button classes with btn-lg size variant
 * [x] updates button classes with btn-sm size variant
 * [x] updates button classes with btn-xs size variant
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { ensureBootstrap3Globals } from './helpers/bootstrap3-globals';

const BOOTSTRAP3_FIXTURE = '/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html';

test.beforeEach(async ({ page }) => {
  await page.goto(BOOTSTRAP3_FIXTURE);
  await ensureBootstrap3Globals(page);
  await apiHelpers.installDomHelpers(page);
});

/**
 * Scenario: handles input-group-lg size class
 * Given input has input-lg class
 * When TouchSpin initializes
 * Then wrapper gets input-group-lg class
 * Params:
 * { "inputSize": "input-lg", "wrapperSize": "input-group-lg" }
 */
test('handles input-group-lg size class', async ({ page }) => {
  // Add input-lg class to test input
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
    input.classList.add('input-lg');
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const wrapper = page.getByTestId('test-input-wrapper');
  await expect(wrapper).toHaveClass(/input-group-lg/);
});

/**
 * Scenario: handles input-group-sm size class
 * Given input has input-sm class
 * When TouchSpin initializes
 * Then wrapper gets input-group-sm class
 * Params:
 * { "inputSize": "input-sm", "wrapperSize": "input-group-sm" }
 */
test('handles input-group-sm size class', async ({ page }) => {
  // Add input-sm class to test input
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
    input.classList.add('input-sm');
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const wrapper = page.getByTestId('test-input-wrapper');
  await expect(wrapper).toHaveClass(/input-group-sm/);
});

/**
 * Scenario: handles input-group-xs size class (Bootstrap 3 specific)
 * Given input has input-xs class
 * When TouchSpin initializes
 * Then wrapper gets input-group-xs class
 * Params:
 * { "inputSize": "input-xs", "wrapperSize": "input-group-xs", "bootstrap3Specific": true }
 */
test('handles input-group-xs size class (Bootstrap 3 specific)', async ({ page }) => {
  // Add input-xs class to test input
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
    input.classList.add('input-xs');
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const wrapper = page.getByTestId('test-input-wrapper');
  await expect(wrapper).toHaveClass(/input-group-xs/);
});

/**
 * Scenario: handles horizontal addon with input-group-addon class
 * Given horizontal layout is used
 * When prefix or postfix is set
 * Then addon elements get input-group-addon class
 * Params:
 * { "layout": "horizontal", "prefix": "$", "addonClass": "input-group-addon" }
 */
test('handles horizontal addon with input-group-addon class', async ({ page }) => {
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    verticalbuttons: false,
    prefix: '$',
    postfix: 'USD',
  });

  const wrapper = page.getByTestId('test-input-wrapper');
  const prefix = wrapper.locator('[data-touchspin-injected="prefix"]');
  const postfix = wrapper.locator('[data-touchspin-injected="postfix"]');

  await expect(prefix).toHaveClass(/input-group-addon/);
  await expect(postfix).toHaveClass(/input-group-addon/);
});

/**
 * Scenario: handles btn-block class on buttons
 * Given buttons have btn-block in buttonup_class or buttondown_class
 * When TouchSpin renders
 * Then buttons span full width correctly
 * Params:
 * { "buttonup_class": "btn-block btn-primary", "fullWidth": true }
 */
test('handles btn-block class on buttons', async ({ page }) => {
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    buttonup_class: 'btn-block btn-primary',
    buttondown_class: 'btn-block btn-danger',
  });

  const wrapper = page.getByTestId('test-input-wrapper');
  const upButton = wrapper.locator('[data-touchspin-injected="up"]');
  const downButton = wrapper.locator('[data-touchspin-injected="down"]');

  await expect(upButton).toHaveClass(/btn-block/);
  await expect(downButton).toHaveClass(/btn-block/);
});

/**
 * Scenario: handles icon placement with glyphicon classes
 * Given buttonup_txt or buttondown_txt contains glyphicon markup
 * When buttons render
 * Then icon appears correctly in button
 * Params:
 * { "buttonup_txt": "<span class='glyphicon glyphicon-plus'></span>", "iconRendered": true }
 */
test('handles icon placement with glyphicon classes', async ({ page }) => {
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    buttonup_txt: "<span class='glyphicon glyphicon-plus'></span>",
    buttondown_txt: "<span class='glyphicon glyphicon-minus'></span>",
  });

  const wrapper = page.getByTestId('test-input-wrapper');
  const upButton = wrapper.locator('[data-touchspin-injected="up"]');
  const downButton = wrapper.locator('[data-touchspin-injected="down"]');

  // Check that glyphicon spans are present in buttons
  await expect(upButton.locator('.glyphicon.glyphicon-plus')).toBeVisible();
  await expect(downButton.locator('.glyphicon.glyphicon-minus')).toBeVisible();
});

/**
 * Scenario: handles null wrapper in update methods
 * Given wrapper becomes null after teardown
 * When updateButtonClass or similar is called
 * Then method returns early without error
 * Params:
 * { "wrapperState": "null", "defensive": true }
 */
test('handles null wrapper in update methods', async ({ page }) => {
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Destroy the TouchSpin instance and null out wrapper
  const noError = await page.evaluate(() => {
    try {
      const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
      const instance = (input as any).__touchspin_instance;
      if (instance && instance.renderer) {
        // Manually null the wrapper to simulate defensive scenario
        instance.renderer.wrapper = null;
        // Try to call an update method - should not throw
        instance.renderer.updateButtonClass?.('up', 'btn-success');
      }
      return true;
    } catch (e) {
      return false;
    }
  });

  expect(noError).toBe(true);
});

/**
 * Scenario: handles missing addon group in horizontal layout
 * Given horizontal layout but addon group query fails
 * When DOM manipulation occurs
 * Then fallback logic handles missing elements
 * Params:
 * { "addonGroupMissing": true, "defensive": true, "fallback": "applied" }
 */
test('handles missing addon group in horizontal layout', async ({ page }) => {
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    verticalbuttons: false,
  });

  // Manually remove addon group elements to test defensive behavior
  const noError = await page.evaluate(() => {
    try {
      const wrapper = document.querySelector('[data-testid="test-input-wrapper"]');
      if (wrapper) {
        // Remove all input-group-btn elements to simulate missing addon groups
        const addonGroups = wrapper.querySelectorAll('.input-group-btn');
        addonGroups.forEach((el) => el.remove());
      }
      // Try to update settings - should not throw
      const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
      const instance = (input as any).__touchspin_instance;
      if (instance) {
        instance.updateSettings({ prefix: 'New' });
      }
      return true;
    } catch (e) {
      return false;
    }
  });

  expect(noError).toBe(true);
});

/**
 * Scenario: updates button classes with btn-lg size variant
 * Given TouchSpin initialized
 * When buttonup_class is set to btn-lg btn-success
 * Then button gets large size styling
 * Params:
 * { "buttonup_class": "btn-lg btn-success", "sizeVariant": "large" }
 */
test('updates button classes with btn-lg size variant', async ({ page }) => {
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    buttonup_class: 'btn-lg btn-success',
  });

  const wrapper = page.getByTestId('test-input-wrapper');
  const upButton = wrapper.locator('[data-touchspin-injected="up"]');

  await expect(upButton).toHaveClass(/btn-lg/);
  await expect(upButton).toHaveClass(/btn-success/);
});

/**
 * Scenario: updates button classes with btn-sm size variant
 * Given TouchSpin initialized
 * When buttondown_class is set to btn-sm btn-warning
 * Then button gets small size styling
 * Params:
 * { "buttondown_class": "btn-sm btn-warning", "sizeVariant": "small" }
 */
test('updates button classes with btn-sm size variant', async ({ page }) => {
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    buttondown_class: 'btn-sm btn-warning',
  });

  const wrapper = page.getByTestId('test-input-wrapper');
  const downButton = wrapper.locator('[data-touchspin-injected="down"]');

  await expect(downButton).toHaveClass(/btn-sm/);
  await expect(downButton).toHaveClass(/btn-warning/);
});

/**
 * Scenario: updates button classes with btn-xs size variant
 * Given TouchSpin initialized
 * When buttonup_class is set to btn-xs btn-info
 * Then button gets extra-small size styling
 * Params:
 * { "buttonup_class": "btn-xs btn-info", "sizeVariant": "extra-small", "bootstrap3Specific": true }
 */
test('updates button classes with btn-xs size variant', async ({ page }) => {
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    buttonup_class: 'btn-xs btn-info',
  });

  const wrapper = page.getByTestId('test-input-wrapper');
  const upButton = wrapper.locator('[data-touchspin-injected="up"]');

  await expect(upButton).toHaveClass(/btn-xs/);
  await expect(upButton).toHaveClass(/btn-info/);
});

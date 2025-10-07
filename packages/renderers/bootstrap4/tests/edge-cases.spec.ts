/**
 * Feature: Bootstrap 4 renderer edge cases and defensive coding
 * Background: fixture = /packages/renderers/bootstrap4/tests/fixtures/bootstrap4-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] handles input-group-lg size class
 * [x] handles input-group-sm size class
 * [x] handles horizontal prepend and append groups
 * [x] handles btn-block class on buttons
 * [x] handles icon placement with FontAwesome or Bootstrap icons
 * [x] handles null wrapper in update methods
 * [x] handles missing prepend/append group in horizontal layout
 * [x] updates button classes with btn-lg size variant
 * [x] updates button classes with btn-sm size variant
 * [x] applies input-group-prepend for prefix
 * [x] applies input-group-append for postfix
 * [x] handles form-control-lg input size class
 * [x] handles form-control-sm input size class
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { ensureBootstrap4Globals } from './helpers/bootstrap4-globals';

const BOOTSTRAP4_FIXTURE = '/packages/renderers/bootstrap4/tests/fixtures/bootstrap4-fixture.html';

test.beforeEach(async ({ page }) => {
  await page.goto(BOOTSTRAP4_FIXTURE);
  await ensureBootstrap4Globals(page);
  await apiHelpers.installDomHelpers(page);
});

/**
 * Scenario: handles input-group-lg size class
 * Given input has form-control-lg class
 * When TouchSpin initializes
 * Then wrapper gets input-group-lg class
 * Params:
 * { "inputSize": "form-control-lg", "wrapperSize": "input-group-lg" }
 */
test('handles input-group-lg size class', async ({ page }) => {
  // Add form-control-lg class to test input
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
    input.classList.add('form-control-lg');
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const wrapper = page.getByTestId('test-input-wrapper');
  await expect(wrapper).toHaveClass(/input-group-lg/);
});

/**
 * Scenario: handles input-group-sm size class
 * Given input has form-control-sm class
 * When TouchSpin initializes
 * Then wrapper gets input-group-sm class
 * Params:
 * { "inputSize": "form-control-sm", "wrapperSize": "input-group-sm" }
 */
test('handles input-group-sm size class', async ({ page }) => {
  // Add form-control-sm class to test input
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
    input.classList.add('form-control-sm');
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const wrapper = page.getByTestId('test-input-wrapper');
  await expect(wrapper).toHaveClass(/input-group-sm/);
});

/**
 * Scenario: handles horizontal prepend and append groups
 * Given horizontal layout with prefix and postfix
 * When TouchSpin renders
 * Then input-group-prepend and input-group-append are used
 * Params:
 * { "layout": "horizontal", "prefix": "$", "postfix": "USD", "bootstrap4Specific": true }
 */
test('handles horizontal prepend and append groups', async ({ page }) => {
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    verticalbuttons: false,
    prefix: '$',
    postfix: 'USD',
  });

  const wrapper = page.getByTestId('test-input-wrapper');
  const prepend = wrapper.locator('.input-group-prepend');
  const append = wrapper.locator('.input-group-append');

  await expect(prepend).toBeVisible();
  await expect(append).toBeVisible();
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
 * Scenario: handles icon placement with FontAwesome or Bootstrap icons
 * Given buttonup_txt contains icon markup
 * When buttons render
 * Then icon appears correctly in button
 * Params:
 * { "buttonup_txt": "<i class='fas fa-plus'></i>", "iconRendered": true }
 */
test('handles icon placement with FontAwesome or Bootstrap icons', async ({ page }) => {
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    buttonup_txt: "<i class='fas fa-plus'></i>",
    buttondown_txt: "<i class='fas fa-minus'></i>",
  });

  const wrapper = page.getByTestId('test-input-wrapper');
  const upButton = wrapper.locator('[data-touchspin-injected="up"]');
  const downButton = wrapper.locator('[data-touchspin-injected="down"]');

  // Check that icon elements exist in buttons (note: not checking visibility since FontAwesome CSS isn't loaded)
  const hasIcons = await page.evaluate(() => {
    const upBtn = document.querySelector('[data-touchspin-injected="up"]');
    const downBtn = document.querySelector('[data-touchspin-injected="down"]');
    const upIcon = upBtn?.querySelector('i.fas.fa-plus');
    const downIcon = downBtn?.querySelector('i.fas.fa-minus');
    return upIcon !== null && downIcon !== null;
  });
  expect(hasIcons).toBe(true);
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
 * Scenario: handles missing prepend/append group in horizontal layout
 * Given horizontal layout but prepend/append group query fails
 * When DOM manipulation occurs
 * Then fallback logic handles missing elements
 * Params:
 * { "prependAppendMissing": true, "defensive": true, "fallback": "applied" }
 */
test('handles missing prepend/append group in horizontal layout', async ({ page }) => {
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    verticalbuttons: false,
  });

  // Manually remove prepend/append elements to test defensive behavior
  const noError = await page.evaluate(() => {
    try {
      const wrapper = document.querySelector('[data-testid="test-input-wrapper"]');
      if (wrapper) {
        // Remove all input-group-prepend and input-group-append elements
        const prependAppendGroups = wrapper.querySelectorAll(
          '.input-group-prepend, .input-group-append'
        );
        prependAppendGroups.forEach((el) => el.remove());
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
 * Scenario: applies input-group-prepend for prefix
 * Given prefix is set in horizontal layout
 * When TouchSpin builds DOM
 * Then prefix is wrapped in input-group-prepend div
 * Params:
 * { "prefix": "$", "prependWrapper": "input-group-prepend", "bootstrap4Specific": true }
 */
test('applies input-group-prepend for prefix', async ({ page }) => {
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    verticalbuttons: false,
    prefix: '$',
  });

  const wrapper = page.getByTestId('test-input-wrapper');
  const prefix = wrapper.locator('[data-touchspin-injected="prefix"]');
  const prependParent = prefix.locator('..').first();

  await expect(prefix).toHaveText('$');
  await expect(prependParent).toHaveClass(/input-group-prepend/);
});

/**
 * Scenario: applies input-group-append for postfix
 * Given postfix is set in horizontal layout
 * When TouchSpin builds DOM
 * Then postfix is wrapped in input-group-append div
 * Params:
 * { "postfix": "kg", "appendWrapper": "input-group-append", "bootstrap4Specific": true }
 */
test('applies input-group-append for postfix', async ({ page }) => {
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    verticalbuttons: false,
    postfix: 'kg',
  });

  const wrapper = page.getByTestId('test-input-wrapper');
  const postfix = wrapper.locator('[data-touchspin-injected="postfix"]');
  const appendParent = postfix.locator('..').first();

  await expect(postfix).toHaveText('kg');
  await expect(appendParent).toHaveClass(/input-group-append/);
});

/**
 * Scenario: handles form-control-lg input size class
 * Given input has form-control-lg class
 * When size detection runs
 * Then large input styling is applied
 * Params:
 * { "inputClass": "form-control-lg", "sizeDetection": "large" }
 */
test('handles form-control-lg input size class', async ({ page }) => {
  // Add form-control-lg class to test input
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
    input.classList.add('form-control-lg');
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const wrapper = page.getByTestId('test-input-wrapper');
  await expect(wrapper).toHaveClass(/input-group-lg/);
});

/**
 * Scenario: handles form-control-sm input size class
 * Given input has form-control-sm class
 * When size detection runs
 * Then small input styling is applied
 * Params:
 * { "inputClass": "form-control-sm", "sizeDetection": "small" }
 */
test('handles form-control-sm input size class', async ({ page }) => {
  // Add form-control-sm class to test input
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
    input.classList.add('form-control-sm');
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const wrapper = page.getByTestId('test-input-wrapper');
  await expect(wrapper).toHaveClass(/input-group-sm/);
});

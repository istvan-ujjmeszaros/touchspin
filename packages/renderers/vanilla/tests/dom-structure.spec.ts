/**
 * Feature: Vanilla renderer DOM structure assembly
 * Background: fixture = /packages/renderers/vanilla/tests/fixtures/vanilla-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] creates clean markup without framework dependencies
 * [x] uses semantic button elements without framework styling
 * [x] maintains minimal DOM structure
 * [x] preserves custom classes without interference
 */

import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { universalRendererSuite } from '@touchspin/core/test-helpers/renderers';
import { installDomHelpers, initializeTouchSpin } from '@touchspin/core/test-helpers';

const VANILLA_RENDERER_URL = '/packages/renderers/vanilla/devdist/VanillaRenderer.js';
const VANILLA_FIXTURE = '/packages/renderers/vanilla/tests/fixtures/vanilla-fixture.html';

// Run universal tests that all renderers must pass
universalRendererSuite('Vanilla', VANILLA_RENDERER_URL, VANILLA_FIXTURE);

// Vanilla-specific tests (framework-independent behavior)
test.describe('Vanilla specific behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(VANILLA_FIXTURE);
    await installDomHelpers(page);
  });

  /**
   * Scenario: creates clean markup without framework dependencies
   * Given the fixture page is loaded with DOM helpers
   * When TouchSpin initializes with vanilla renderer
   * Then wrapper has no framework-specific classes and clean semantic structure
   */
  test('creates clean markup without framework dependencies', async ({ page }) => {
    await initializeTouchSpin(page, 'test-input');

    const wrapper = page.getByTestId('test-input-wrapper');

    // Vanilla renderer should not add any framework-specific classes
    const wrapperClasses = await wrapper.getAttribute('class');
    expect(wrapperClasses).not.toMatch(/input-group|form-|btn-|input-/);

    // Should have clean, semantic classes only
    await expect(wrapper).toHaveAttribute('data-touchspin-injected');
  });

  /**
   * Scenario: uses semantic button elements without framework styling
   * Given the fixture page is loaded with DOM helpers
   * When TouchSpin initializes with vanilla renderer
   * Then buttons are visible with semantic classes but no framework-specific styling
   */
  test('uses semantic button elements without framework styling', async ({ page }) => {
    await initializeTouchSpin(page, 'test-input');

    const wrapper = page.getByTestId('test-input-wrapper');
    const upButton = wrapper.locator('[data-touchspin-injected="up"]');
    const downButton = wrapper.locator('[data-touchspin-injected="down"]');

    // Should be semantic button elements
    await expect(upButton).toBeVisible();
    await expect(downButton).toBeVisible();

    // Should not have framework-specific button classes (but may have ts-btn as semantic class)
    const upClasses = await upButton.getAttribute('class');
    const downClasses = await downButton.getAttribute('class');

    // Should avoid Bootstrap/framework classes but allow TouchSpin's semantic classes like ts-btn
    expect(upClasses || '').not.toMatch(/(?:^|\s)btn(?:\s|$)|button-|input-group/); // Avoid standalone 'btn' but allow 'ts-btn'
    expect(downClasses || '').not.toMatch(/(?:^|\s)btn(?:\s|$)|button-|input-group/);
  });

  /**
   * Scenario: maintains minimal DOM structure
   * Given the fixture page is loaded with DOM helpers
   * When TouchSpin initializes with vanilla renderer including prefix and postfix
   * Then DOM structure contains essential elements without excessive wrapper elements
   */
  test('maintains minimal DOM structure', async ({ page }) => {
    await initializeTouchSpin(page, 'test-input', {
      prefix: '$',
      postfix: 'USD',
    });

    const wrapper = page.getByTestId('test-input-wrapper');

    // Count direct children - should be minimal
    const children = await wrapper.locator('> *').count();

    // Should have input + 2 buttons + prefix + postfix = reasonable count
    expect(children).toBeGreaterThanOrEqual(4);
    expect(children).toBeLessThanOrEqual(6); // No excessive wrapper elements

    // Verify essential elements are present
    await expect(wrapper.locator('[data-touchspin-injected="prefix"]')).toBeVisible();
    await expect(wrapper.locator('[data-touchspin-injected="postfix"]')).toBeVisible();
    await expect(wrapper.locator('[data-touchspin-injected="up"]')).toBeVisible();
    await expect(wrapper.locator('[data-touchspin-injected="down"]')).toBeVisible();
  });

  /**
   * Scenario: preserves custom classes without interference
   * Given the fixture page is loaded and input has custom classes
   * When TouchSpin initializes with vanilla renderer and custom button classes
   * Then original input classes are preserved and custom button classes are applied
   */
  test('preserves custom classes without interference', async ({ page }) => {
    // Add custom classes to input
    await page.evaluate(() => {
      const input = document.getElementById('test-input') as HTMLInputElement;
      input.className = 'my-custom-input special-styling';
    });

    await initializeTouchSpin(page, 'test-input', {
      buttonup_class: 'custom-up-btn',
      buttondown_class: 'custom-down-btn',
    });

    const input = page.getByTestId('test-input');
    const wrapper = page.getByTestId('test-input-wrapper');
    const upButton = wrapper.locator('[data-touchspin-injected="up"]');
    const downButton = wrapper.locator('[data-touchspin-injected="down"]');

    // Original input classes should be preserved
    await expect(input).toHaveClass(/my-custom-input/);
    await expect(input).toHaveClass(/special-styling/);

    // Custom button classes should be applied
    await expect(upButton).toHaveClass(/custom-up-btn/);
    await expect(downButton).toHaveClass(/custom-down-btn/);
  });
});

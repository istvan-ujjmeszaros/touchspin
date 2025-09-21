/**
 * Feature: Vanilla renderer DOM structure assembly
 * Background: fixture = /packages/core/tests/__shared__/fixtures/test-fixture.html
 */

import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { universalRendererSuite } from '@touchspin/core/test-helpers/renderers';
import { installDomHelpers, initializeTouchspinWithRenderer } from '@touchspin/core/test-helpers';

// Vanilla Renderer URL for tests
const VANILLA_RENDERER_URL = '/packages/renderers/vanilla/devdist/index.js';

// Run universal tests that all renderers must pass
universalRendererSuite('Vanilla', VANILLA_RENDERER_URL);

// Vanilla-specific tests (framework-independent behavior)
test.describe('Vanilla specific behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/core/tests/__shared__/fixtures/test-fixture.html');
    await installDomHelpers(page);
  });

  test('creates clean markup without framework dependencies', async ({ page }) => {
    await initializeTouchspinWithRenderer(page, 'test-input', VANILLA_RENDERER_URL);

    const wrapper = page.getByTestId('test-input-wrapper');

    // Vanilla renderer should not add any framework-specific classes
    const wrapperClasses = await wrapper.getAttribute('class');
    expect(wrapperClasses).not.toMatch(/input-group|form-|btn-|input-/);

    // Should have clean, semantic classes only
    await expect(wrapper).toHaveAttribute('data-touchspin-injected');
  });

  test('uses semantic button elements without framework styling', async ({ page }) => {
    await initializeTouchspinWithRenderer(page, 'test-input', VANILLA_RENDERER_URL);

    const wrapper = page.getByTestId('test-input-wrapper');
    const upButton = wrapper.locator('[data-touchspin-injected="up"]');
    const downButton = wrapper.locator('[data-touchspin-injected="down"]');

    // Should be semantic button elements
    await expect(upButton).toBeVisible();
    await expect(downButton).toBeVisible();

    // Should not have framework-specific button classes
    const upClasses = await upButton.getAttribute('class');
    const downClasses = await downButton.getAttribute('class');

    expect(upClasses || '').not.toMatch(/btn|button-|input-group/);
    expect(downClasses || '').not.toMatch(/btn|button-|input-group/);
  });

  test('maintains minimal DOM structure', async ({ page }) => {
    await initializeTouchspinWithRenderer(page, 'test-input', VANILLA_RENDERER_URL, {
      prefix: '$',
      postfix: 'USD'
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

  test('preserves custom classes without interference', async ({ page }) => {
    // Add custom classes to input
    await page.evaluate(() => {
      const input = document.getElementById('test-input') as HTMLInputElement;
      input.className = 'my-custom-input special-styling';
    });

    await initializeTouchspinWithRenderer(page, 'test-input', VANILLA_RENDERER_URL, {
      buttonup_class: 'custom-up-btn',
      buttondown_class: 'custom-down-btn'
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
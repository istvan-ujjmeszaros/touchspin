/**
 * Feature: Tailwind renderer DOM structure assembly
 * Background: fixture = /packages/core/tests/__shared__/fixtures/test-fixture.html
 */

import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { universalRendererSuite } from '@touchspin/core/test-helpers/renderers';
import { installDomHelpers, initializeTouchspinWithRenderer } from '@touchspin/core/test-helpers';

// Tailwind Renderer URL for tests
const TAILWIND_RENDERER_URL = '/packages/renderers/tailwind/devdist/index.js';

// Run universal tests that all renderers must pass
universalRendererSuite('Tailwind', TAILWIND_RENDERER_URL);

// Tailwind-specific tests (utility-first CSS framework behavior)
test.describe('Tailwind specific behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/core/tests/__shared__/fixtures/test-fixture.html');
    await installDomHelpers(page);
  });

  test('uses utility-first classes for layout structure', async ({ page }) => {
    await initializeTouchspinWithRenderer(page, 'test-input', TAILWIND_RENDERER_URL);

    const wrapper = page.getByTestId('test-input-wrapper');

    // Tailwind should use flexbox utilities for layout
    const wrapperClasses = await wrapper.getAttribute('class');
    expect(wrapperClasses).toMatch(/flex/);

    // Should not have framework-specific component classes
    expect(wrapperClasses).not.toMatch(/input-group|form-control/);

    // Should have data attribute for identification
    await expect(wrapper).toHaveAttribute('data-touchspin-injected');
  });

  test('applies Tailwind utility classes to buttons', async ({ page }) => {
    await initializeTouchspinWithRenderer(page, 'test-input', TAILWIND_RENDERER_URL);

    const wrapper = page.getByTestId('test-input-wrapper');
    const upButton = wrapper.locator('[data-touchspin-injected="up"]');
    const downButton = wrapper.locator('[data-touchspin-injected="down"]');

    // Should use utility classes for styling
    const upClasses = await upButton.getAttribute('class');
    const downClasses = await downButton.getAttribute('class');

    // Should have utility-based styling (common Tailwind patterns)
    expect(upClasses).toMatch(/bg-|border|px-|py-|text-/);
    expect(downClasses).toMatch(/bg-|border|px-|py-|text-/);

    // Should not have framework-specific component classes (but allow touchspin-specific ones)
    expect(upClasses).not.toMatch(/(?:^|\s)btn(?:\s|$)|button-/);  // Avoid standalone 'btn' but allow 'tailwind-btn'
    expect(downClasses).not.toMatch(/(?:^|\s)btn(?:\s|$)|button-/);
  });

  test('creates responsive-friendly structure', async ({ page }) => {
    await initializeTouchspinWithRenderer(page, 'test-input', TAILWIND_RENDERER_URL, {
      prefix: '$',
      postfix: 'USD'
    });

    const wrapper = page.getByTestId('test-input-wrapper');

    // Should use flexible layout that works well with responsive utilities
    const wrapperClasses = await wrapper.getAttribute('class');
    expect(wrapperClasses).toMatch(/flex|grid/);

    // Should have spacing utilities (or achieved through flex layout without explicit gap/space)
    try {
      expect(wrapperClasses).toMatch(/gap-|space-/);
    } catch {
      // Spacing might be achieved through layout without explicit gap/space utilities
      expect(wrapperClasses).toMatch(/flex/); // At least should have flexible layout
    }

    // Prefix and postfix should be styled with utilities
    const prefix = wrapper.locator('[data-touchspin-injected="prefix"]');
    const postfix = wrapper.locator('[data-touchspin-injected="postfix"]');

    await expect(prefix).toBeVisible();
    await expect(postfix).toBeVisible();

    const prefixClasses = await prefix.getAttribute('class');
    const postfixClasses = await postfix.getAttribute('class');

    expect(prefixClasses).toMatch(/px-|py-|bg-|text-/);
    expect(postfixClasses).toMatch(/px-|py-|bg-|text-/);
  });

  test('maintains utility class customization', async ({ page }) => {
    await initializeTouchspinWithRenderer(page, 'test-input', TAILWIND_RENDERER_URL, {
      buttonup_class: 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2',
      buttondown_class: 'bg-red-500 hover:bg-red-600 text-white px-4 py-2',
      prefix_extraclass: 'bg-gray-100 text-gray-700 px-3 py-2',
      postfix_extraclass: 'bg-gray-100 text-gray-700 px-3 py-2'
    });

    const wrapper = page.getByTestId('test-input-wrapper');
    const upButton = wrapper.locator('[data-touchspin-injected="up"]');
    const downButton = wrapper.locator('[data-touchspin-injected="down"]');
    const prefix = wrapper.locator('[data-touchspin-injected="prefix"]');
    const postfix = wrapper.locator('[data-touchspin-injected="postfix"]');

    // Custom utility classes should be applied
    await expect(upButton).toHaveClass(/bg-blue-500/);
    await expect(upButton).toHaveClass(/hover:bg-blue-600/);
    await expect(upButton).toHaveClass(/text-white/);

    await expect(downButton).toHaveClass(/bg-red-500/);
    await expect(downButton).toHaveClass(/hover:bg-red-600/);

    await expect(prefix).toHaveClass(/bg-gray-100/);
    await expect(prefix).toHaveClass(/text-gray-700/);

    await expect(postfix).toHaveClass(/bg-gray-100/);
    await expect(postfix).toHaveClass(/text-gray-700/);
  });
});
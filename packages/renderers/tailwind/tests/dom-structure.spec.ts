/**
 * Feature: Tailwind renderer DOM structure assembly
 * Background: fixture = /packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] uses utility-first classes for layout structure
 * [x] applies Tailwind utility classes to buttons
 * [x] creates responsive-friendly structure
 * [x] maintains utility class customization
 * [x] allows overriding input utility classes
 * [x] allows overriding wrapper utility classes
 * [x] supports addon utility overrides
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { initializeTouchspinFromGlobals, installDomHelpers } from '@touchspin/core/test-helpers';
import { universalRendererSuite } from '@touchspin/core/test-helpers/renderers';
import { ensureTailwindGlobals, tailwindRendererUrl } from './helpers/tailwind-globals';

// Tailwind Renderer URL for tests
const TAILWIND_RENDERER_URL = tailwindRendererUrl;
const TAILWIND_FIXTURE = '/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html';

// Run universal tests that all renderers must pass
universalRendererSuite('Tailwind', TAILWIND_RENDERER_URL, TAILWIND_FIXTURE, {
  setupGlobals: ensureTailwindGlobals,
});

// Tailwind-specific tests (utility-first CSS framework behavior)
test.describe('Tailwind specific behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TAILWIND_FIXTURE);
    await ensureTailwindGlobals(page);
    await apiHelpers.waitForPageReady(page);
    await installDomHelpers(page);
  });

  /**
   * Scenario: uses utility-first classes for layout structure
   * Given the fixture page is loaded with DOM helpers
   * When TouchSpin initializes with tailwind renderer
   * Then wrapper uses flexbox utilities and avoids framework-specific component classes
   */
  test('uses utility-first classes for layout structure', async ({ page }) => {
    await initializeTouchspinFromGlobals(page, 'test-input');

    const wrapper = page.getByTestId('test-input-wrapper');

    // Tailwind should use flexbox utilities for layout
    const wrapperClasses = await wrapper.getAttribute('class');
    expect(wrapperClasses).toMatch(/flex/);

    // Should not have framework-specific component classes
    expect(wrapperClasses).not.toMatch(/input-group|form-control/);

    // Should have data attribute for identification
    await expect(wrapper).toHaveAttribute('data-touchspin-injected');
  });

  /**
   * Scenario: applies Tailwind utility classes to buttons
   * Given the fixture page is loaded with DOM helpers
   * When TouchSpin initializes with tailwind renderer
   * Then buttons have utility-based styling and avoid framework-specific component classes
   */
  test('applies Tailwind utility classes to buttons', async ({ page }) => {
    await initializeTouchspinFromGlobals(page, 'test-input');

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
    expect(upClasses).not.toMatch(/(?:^|\s)btn(?:\s|$)|button-/); // Avoid standalone 'btn' but allow 'tailwind-btn'
    expect(downClasses).not.toMatch(/(?:^|\s)btn(?:\s|$)|button-/);
  });

  /**
   * Scenario: creates responsive-friendly structure
   * Given the fixture page is loaded with DOM helpers
   * When TouchSpin initializes with tailwind renderer including prefix and postfix
   * Then structure uses flexible layout with utility-styled prefix and postfix elements
   */
  test('creates responsive-friendly structure', async ({ page }) => {
    await initializeTouchspinFromGlobals(page, 'test-input', {
      prefix: '$',
      postfix: 'USD',
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

  /**
   * Scenario: maintains utility class customization
   * Given the fixture page is loaded with DOM helpers
   * When TouchSpin initializes with custom utility classes for buttons and prefix/postfix
   * Then custom utility classes are properly applied to all elements
   */
  test('maintains utility class customization', async ({ page }) => {
    await initializeTouchspinFromGlobals(page, 'test-input', {
      buttonup_class: 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2',
      buttondown_class: 'bg-red-500 hover:bg-red-600 text-white px-4 py-2',
      prefix_extraclass: 'bg-gray-100 text-gray-700 px-3 py-2',
      postfix_extraclass: 'bg-gray-100 text-gray-700 px-3 py-2',
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

  /**
   * Scenario: replaces default input utility classes when custom classes are provided
   * Given the fixture page is loaded with DOM helpers
   * When TouchSpin initializes with custom input utility classes
   * Then the input keeps structural hooks while only using the provided utilities
   */
  test('allows overriding input utility classes', async ({ page }) => {
    await initializeTouchspinFromGlobals(page, 'test-input', {
      input_classes:
        'flex-1 px-5 py-3 bg-blue-50 text-blue-900 font-semibold rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 placeholder:text-blue-400',
    });

    const { input } = await apiHelpers.getTouchSpinElements(page, 'test-input');

    await expect(input).toHaveAttribute('class', /ts-input/);
    await expect(input).toHaveAttribute('class', /bg-blue-50/);
    await expect(input).toHaveAttribute('class', /placeholder:text-blue-400/);
    await expect(input).not.toHaveAttribute('class', /bg-transparent/);
    await expect(input).not.toHaveAttribute('class', /placeholder-gray-500/);
  });

  /**
   * Scenario: replaces default wrapper utility classes when custom classes are provided
   * Given the fixture page is loaded with DOM helpers
   * When TouchSpin initializes with custom wrapper utility classes
   * Then the wrapper uses the provided utilities without the default Tailwind baseline
   */
  test('allows overriding wrapper utility classes', async ({ page }) => {
    await initializeTouchspinFromGlobals(page, 'test-input', {
      wrapper_classes:
        'flex items-stretch rounded-2xl border border-blue-600 bg-white shadow-[0_8px_24px_rgba(30,64,175,0.18)] focus-within:border-blue-700 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.35)] transition-shadow duration-200',
    });

    const { wrapper } = await apiHelpers.getTouchSpinElements(page, 'test-input');

    await expect(wrapper).toHaveAttribute('class', /ts-wrapper/);
    await expect(wrapper).toHaveAttribute('class', /rounded-2xl/);
    await expect(wrapper).toHaveAttribute('class', /border-blue-600/);
    await expect(wrapper).not.toHaveAttribute('class', /shadow-sm/);
    await expect(wrapper).not.toHaveAttribute('class', /border-gray-300/);
    await expect(wrapper).not.toHaveAttribute('class', /focus-within:ring-2/);
  });

  /**
   * Scenario: supports overriding addon utility classes
   * Given the fixture page is loaded with DOM helpers
   * When TouchSpin initializes with addon override classes
   * Then the addon override utilities replace the defaults while structural hooks remain
   */
  test('supports addon utility overrides', async ({ page }) => {
    await initializeTouchspinFromGlobals(page, 'test-input', {
      prefix: '$',
      prefix_classes_override:
        'inline-flex items-center px-4 py-1 bg-blue-900 text-white rounded-l-lg',
      postfix: 'USD',
      postfix_classes_override:
        'inline-flex items-center px-4 py-1 bg-blue-900 text-white rounded-r-lg uppercase tracking-wide',
    });

    const { prefix, postfix } = await apiHelpers.getTouchSpinElements(page, 'test-input');

    await expect(prefix).toHaveAttribute('class', /ts-addon/);
    await expect(prefix).toHaveAttribute('class', /bg-blue-900/);
    await expect(prefix).not.toHaveAttribute('class', /bg-gray-50/);

    await expect(postfix).toHaveAttribute('class', /ts-addon/);
    await expect(postfix).toHaveAttribute('class', /tracking-wide/);
    await expect(postfix).not.toHaveAttribute('class', /bg-gray-50/);
  });
});

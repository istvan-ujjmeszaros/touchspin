/**
 * Feature: Bootstrap 5 renderer DOM structure assembly
 * Background: fixture = /packages/core/tests/__shared__/fixtures/test-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] uses Bootstrap 5 input-group-text for buttons
 * [x] applies Bootstrap 5 default button styling
 * [x] supports Bootstrap 5 floating labels compatibility
 * [x] maintains Bootstrap 5 validation state classes
 */

import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { universalRendererSuite, bootstrapSharedSuite } from '@touchspin/core/test-helpers/renderers';
import { installDomHelpers, initializeTouchspinWithRenderer } from '@touchspin/core/test-helpers';

// Bootstrap 5 Renderer URL for tests
const BOOTSTRAP5_RENDERER_URL = '/packages/renderers/bootstrap5/devdist/index.js';

// Run universal tests that all renderers must pass
universalRendererSuite('Bootstrap 5', BOOTSTRAP5_RENDERER_URL);

// Run Bootstrap family shared tests
bootstrapSharedSuite('Bootstrap 5', BOOTSTRAP5_RENDERER_URL);

// Bootstrap 5-specific tests (not covered by shared suites)
test.describe('Bootstrap 5 specific behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/core/tests/__shared__/fixtures/test-fixture.html');
    await installDomHelpers(page);
  });

  /**
   * Scenario: uses Bootstrap 5 input-group-text for buttons
   * Given the fixture page is loaded with DOM helpers
   * When TouchSpin initializes with Bootstrap 5 renderer
   * Then buttons are directly in input-group without append/prepend wrappers
   */
  test('uses Bootstrap 5 input-group-text for buttons', async ({ page }) => {
    await initializeTouchspinWithRenderer(page, 'test-input', BOOTSTRAP5_RENDERER_URL);

    const wrapper = page.getByTestId('test-input-wrapper');
    const upButton = wrapper.locator('[data-touchspin-injected="up"]');
    const downButton = wrapper.locator('[data-touchspin-injected="down"]');

    // Bootstrap 5 specific: buttons should be directly in input-group (no append/prepend wrappers)
    await expect(upButton).toHaveClass(/btn/);
    await expect(downButton).toHaveClass(/btn/);

    // Parent should be input-group, not input-group-append/prepend
    const upParent = upButton.locator('..');
    const downParent = downButton.locator('..');
    await expect(upParent).toHaveClass(/input-group/);
    await expect(downParent).toHaveClass(/input-group/);
  });

  /**
   * Scenario: applies Bootstrap 5 default button styling
   * Given the fixture page is loaded with DOM helpers
   * When TouchSpin initializes with Bootstrap 5 renderer
   * Then buttons have Bootstrap 5 default btn-outline-secondary styling
   */
  test('applies Bootstrap 5 default button styling', async ({ page }) => {
    await initializeTouchspinWithRenderer(page, 'test-input', BOOTSTRAP5_RENDERER_URL);

    const wrapper = page.getByTestId('test-input-wrapper');
    const upButton = wrapper.locator('[data-touchspin-injected="up"]');
    const downButton = wrapper.locator('[data-touchspin-injected="down"]');

    // Bootstrap 5 default styling
    await expect(upButton).toHaveClass(/btn-outline-secondary/);
    await expect(downButton).toHaveClass(/btn-outline-secondary/);
  });

  /**
   * Scenario: supports Bootstrap 5 floating labels compatibility
   * Given the fixture page has floating label structure around input
   * When TouchSpin initializes with Bootstrap 5 renderer
   * Then floating label structure is preserved and TouchSpin wrapper is visible
   */
  test('supports Bootstrap 5 floating labels compatibility', async ({ page }) => {
    // Create floating label structure
    await page.evaluate(() => {
      const input = document.getElementById('test-input') as HTMLInputElement;
      const floatingDiv = document.createElement('div');
      floatingDiv.className = 'form-floating';

      const label = document.createElement('label');
      label.setAttribute('for', 'test-input');
      label.textContent = 'Amount';

      input.parentNode!.insertBefore(floatingDiv, input);
      floatingDiv.appendChild(input);
      floatingDiv.appendChild(label);
    });

    await initializeTouchspinWithRenderer(page, 'test-input', BOOTSTRAP5_RENDERER_URL);

    // Should preserve floating label structure
    const floatingDiv = page.locator('.form-floating');
    const label = floatingDiv.locator('label[for="test-input"]');

    await expect(floatingDiv).toBeVisible();
    await expect(label).toBeVisible();
    await expect(label).toHaveText('Amount');

    // TouchSpin wrapper should work with floating labels
    const wrapper = page.getByTestId('test-input-wrapper');
    await expect(wrapper).toBeVisible();
  });

  /**
   * Scenario: maintains Bootstrap 5 validation state classes
   * Given the fixture page input has validation state class
   * When TouchSpin initializes with Bootstrap 5 renderer
   * Then validation state is preserved and wrapper does not interfere
   */
  test('maintains Bootstrap 5 validation state classes', async ({ page }) => {
    // Add validation state to input
    await page.evaluate(() => {
      const input = document.getElementById('test-input') as HTMLInputElement;
      input.classList.add('is-valid');
    });

    await initializeTouchspinWithRenderer(page, 'test-input', BOOTSTRAP5_RENDERER_URL);

    const input = page.getByTestId('test-input');
    const wrapper = page.getByTestId('test-input-wrapper');

    // Should preserve validation state
    await expect(input).toHaveClass(/is-valid/);

    // Wrapper should not interfere with validation styling
    await expect(wrapper).toHaveClass(/input-group/);
  });
});
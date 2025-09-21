/**
 * Feature: Bootstrap 4 renderer DOM structure assembly
 * Background: fixture = /packages/core/tests/__shared__/fixtures/test-fixture.html
 */

import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { universalRendererSuite, bootstrapSharedSuite } from '@touchspin/core/test-helpers/renderers';
import { installDomHelpers, initializeTouchspinWithRenderer } from '@touchspin/core/test-helpers';

// Bootstrap 4 Renderer URL for tests
const BOOTSTRAP4_RENDERER_URL = '/packages/renderers/bootstrap4/devdist/index.js';

// Run universal tests that all renderers must pass
universalRendererSuite('Bootstrap 4', BOOTSTRAP4_RENDERER_URL);

// Run Bootstrap family shared tests
bootstrapSharedSuite('Bootstrap 4', BOOTSTRAP4_RENDERER_URL);

// Bootstrap 4-specific tests (not covered by shared suites)
test.describe('Bootstrap 4 specific behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/core/tests/__shared__/fixtures/test-fixture.html');
    await installDomHelpers(page);
  });

  test('uses Bootstrap 4 input-group-append and input-group-prepend structure', async ({ page }) => {
    await initializeTouchspinWithRenderer(page, 'test-input', BOOTSTRAP4_RENDERER_URL);

    const wrapper = page.getByTestId('test-input-wrapper');

    // Bootstrap 4 specific: should have input-group-prepend and input-group-append
    const prepend = wrapper.locator('.input-group-prepend');
    const append = wrapper.locator('.input-group-append');

    await expect(prepend).toBeVisible();
    await expect(append).toBeVisible();

    // Buttons should be inside these containers
    const downButton = prepend.locator('[data-touchspin-injected="down"]');
    const upButton = append.locator('[data-touchspin-injected="up"]');

    await expect(downButton).toBeVisible();
    await expect(upButton).toBeVisible();
  });

  test('applies Bootstrap 4 default button styling', async ({ page }) => {
    await initializeTouchspinWithRenderer(page, 'test-input', BOOTSTRAP4_RENDERER_URL);

    const wrapper = page.getByTestId('test-input-wrapper');
    const upButton = wrapper.locator('[data-touchspin-injected="up"]');
    const downButton = wrapper.locator('[data-touchspin-injected="down"]');

    // Bootstrap 4 default styling
    await expect(upButton).toHaveClass(/btn-outline-secondary/);
    await expect(downButton).toHaveClass(/btn-outline-secondary/);
  });

  test('structures prefix and postfix within input-group-prepend/append', async ({ page }) => {
    await initializeTouchspinWithRenderer(page, 'test-input', BOOTSTRAP4_RENDERER_URL, {
      prefix: '$',
      postfix: 'USD'
    });

    const wrapper = page.getByTestId('test-input-wrapper');

    // Bootstrap 4 specific: prefix should be in input-group-prepend
    const prepend = wrapper.locator('.input-group-prepend');
    const prefix = prepend.locator('[data-touchspin-injected="prefix"]');

    await expect(prefix).toBeVisible();
    await expect(prefix).toHaveText('$');
    await expect(prefix).toHaveClass(/input-group-text/);

    // Bootstrap 4 specific: postfix should be in input-group-append
    const append = wrapper.locator('.input-group-append');
    const postfix = append.locator('[data-touchspin-injected="postfix"]');

    await expect(postfix).toBeVisible();
    await expect(postfix).toHaveText('USD');
    await expect(postfix).toHaveClass(/input-group-text/);
  });
});
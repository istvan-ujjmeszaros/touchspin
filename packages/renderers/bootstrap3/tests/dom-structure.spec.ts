/**
 * Feature: Bootstrap 3 renderer DOM structure assembly
 * Background: fixture = /packages/core/tests/__shared__/fixtures/test-fixture.html
 */

import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { universalRendererSuite, bootstrapSharedSuite } from '@touchspin/core/test-helpers/renderers';
import { installDomHelpers, initializeTouchspinWithRenderer } from '@touchspin/core/test-helpers';

// Bootstrap 3 Renderer URL for tests
const BOOTSTRAP3_RENDERER_URL = '/packages/renderers/bootstrap3/devdist/index.js';

// Run universal tests that all renderers must pass
universalRendererSuite('Bootstrap 3', BOOTSTRAP3_RENDERER_URL);

// Run Bootstrap family shared tests
bootstrapSharedSuite('Bootstrap 3', BOOTSTRAP3_RENDERER_URL);

// Bootstrap 3-specific tests (not covered by shared suites)
test.describe('Bootstrap 3 specific behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/core/tests/__shared__/fixtures/test-fixture.html');
    await installDomHelpers(page);
  });

  test('uses Bootstrap 3 input-group-btn structure', async ({ page }) => {
    await initializeTouchspinWithRenderer(page, 'test-input', BOOTSTRAP3_RENDERER_URL);

    const wrapper = page.getByTestId('test-input-wrapper');

    // Bootstrap 3 specific: should have input-group-btn containers
    const btnContainers = wrapper.locator('.input-group-btn');
    await expect(btnContainers).toHaveCount(2); // One for each button

    // Buttons should be inside these containers
    const downButton = wrapper.locator('[data-touchspin-injected="down"]');
    const upButton = wrapper.locator('[data-touchspin-injected="up"]');

    await expect(downButton).toBeVisible();
    await expect(upButton).toBeVisible();

    // Verify they're inside input-group-btn containers
    const downParent = downButton.locator('..').first();
    const upParent = upButton.locator('..').first();
    await expect(downParent).toHaveClass(/input-group-btn/);
    await expect(upParent).toHaveClass(/input-group-btn/);
  });

  test('applies Bootstrap 3 default button styling', async ({ page }) => {
    await initializeTouchspinWithRenderer(page, 'test-input', BOOTSTRAP3_RENDERER_URL);

    const wrapper = page.getByTestId('test-input-wrapper');
    const upButton = wrapper.locator('[data-touchspin-injected="up"]');
    const downButton = wrapper.locator('[data-touchspin-injected="down"]');

    // Bootstrap 3 default styling
    await expect(upButton).toHaveClass(/btn-default/);
    await expect(downButton).toHaveClass(/btn-default/);
  });

  test('structures prefix and postfix as input-group-addon', async ({ page }) => {
    await initializeTouchspinWithRenderer(page, 'test-input', BOOTSTRAP3_RENDERER_URL, {
      prefix: '$',
      postfix: 'USD'
    });

    const wrapper = page.getByTestId('test-input-wrapper');

    // Bootstrap 3 specific: uses input-group-addon class
    const prefix = wrapper.locator('[data-touchspin-injected="prefix"]');
    const postfix = wrapper.locator('[data-touchspin-injected="postfix"]');

    await expect(prefix).toBeVisible();
    await expect(prefix).toHaveText('$');
    await expect(prefix).toHaveClass(/input-group-addon/);

    await expect(postfix).toBeVisible();
    await expect(postfix).toHaveText('USD');
    await expect(postfix).toHaveClass(/input-group-addon/);
  });
});
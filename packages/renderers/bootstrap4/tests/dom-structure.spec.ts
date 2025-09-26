/**
 * Feature: Bootstrap 4 renderer DOM structure assembly
 * Background: fixture = /packages/renderers/bootstrap4/tests/fixtures/bootstrap4-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] uses Bootstrap 4 input-group-append and input-group-prepend structure
 * [x] applies Bootstrap 4 default button styling
 * [x] structures prefix and postfix within input-group-prepend/append
 */

import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { universalRendererSuite, bootstrapSharedSuite } from '@touchspin/core/test-helpers/renderers';
import { installDomHelpers, initializeTouchspinWithRenderer } from '@touchspin/core/test-helpers';

// Bootstrap 4 Renderer URL for tests
const BOOTSTRAP4_RENDERER_URL = '/packages/renderers/bootstrap4/devdist/index.js';
const BOOTSTRAP4_FIXTURE = '/packages/renderers/bootstrap4/tests/fixtures/bootstrap4-fixture.html';

// Run universal tests that all renderers must pass
universalRendererSuite('Bootstrap 4', BOOTSTRAP4_RENDERER_URL, BOOTSTRAP4_FIXTURE);

// Run Bootstrap family shared tests
bootstrapSharedSuite('Bootstrap 4', BOOTSTRAP4_RENDERER_URL, BOOTSTRAP4_FIXTURE);

// Bootstrap 4-specific tests (not covered by shared suites)
test.describe('Bootstrap 4 specific behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BOOTSTRAP4_FIXTURE);
    await installDomHelpers(page);
  });

  /**
   * Scenario: uses Bootstrap 4 input-group-append and input-group-prepend structure
   * Given the fixture page is loaded with DOM helpers
   * When TouchSpin initializes with Bootstrap 4 renderer
   * Then wrapper contains input-group-prepend and input-group-append with buttons inside
   */
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

  /**
   * Scenario: applies Bootstrap 4 default button styling
   * Given the fixture page is loaded with DOM helpers
   * When TouchSpin initializes with Bootstrap 4 renderer
   * Then buttons have Bootstrap 4 default btn-outline-secondary styling
   */
  test('applies Bootstrap 4 default button styling', async ({ page }) => {
    await initializeTouchspinWithRenderer(page, 'test-input', BOOTSTRAP4_RENDERER_URL);

    const wrapper = page.getByTestId('test-input-wrapper');
    const upButton = wrapper.locator('[data-touchspin-injected="up"]');
    const downButton = wrapper.locator('[data-touchspin-injected="down"]');

    // Bootstrap 4 default styling
    await expect(upButton).toHaveClass(/btn-outline-secondary/);
    await expect(downButton).toHaveClass(/btn-outline-secondary/);
  });

  /**
   * Scenario: structures prefix and postfix within input-group-prepend/append
   * Given the fixture page is loaded with DOM helpers
   * When TouchSpin initializes with Bootstrap 4 renderer including prefix and postfix
   * Then prefix is in input-group-prepend and postfix is in input-group-append with proper styling
   */
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
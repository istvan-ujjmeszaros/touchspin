/**
 * Feature: Bootstrap 3 renderer DOM structure assembly
 * Background: fixture = /packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] uses Bootstrap 3 input-group-btn structure
 * [x] applies Bootstrap 3 default button styling
 * [x] structures prefix and postfix as input-group-addon
 */

import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { universalRendererSuite, bootstrapSharedSuite } from '@touchspin/core/test-helpers/renderers';
import { installDomHelpers, initializeTouchspinFromGlobals } from '@touchspin/core/test-helpers';

// Bootstrap 3 Renderer URL for tests
const BOOTSTRAP3_RENDERER_URL = '/packages/renderers/bootstrap3/devdist/Bootstrap3Renderer.js';
const BOOTSTRAP3_FIXTURE = '/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html';

// Run universal tests that all renderers must pass
universalRendererSuite('Bootstrap 3', BOOTSTRAP3_RENDERER_URL, BOOTSTRAP3_FIXTURE);

// Run Bootstrap family shared tests
bootstrapSharedSuite('Bootstrap 3', BOOTSTRAP3_RENDERER_URL, BOOTSTRAP3_FIXTURE);

// Bootstrap 3-specific tests (not covered by shared suites)
test.describe('Bootstrap 3 specific behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BOOTSTRAP3_FIXTURE);
    await installDomHelpers(page);
  });

  /**
   * Scenario: uses Bootstrap 3 input-group-btn structure
   * Given the fixture page is loaded with DOM helpers
   * When TouchSpin initializes with Bootstrap 3 renderer
   * Then wrapper contains two input-group-btn containers with buttons inside
   */
  test('uses Bootstrap 3 input-group-btn structure', async ({ page }) => {
    await initializeTouchspinFromGlobals(page, 'test-input');

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

  /**
   * Scenario: applies Bootstrap 3 default button styling
   * Given the fixture page is loaded with DOM helpers
   * When TouchSpin initializes with Bootstrap 3 renderer
   * Then buttons have Bootstrap 3 default btn-default styling
   */
  test('applies Bootstrap 3 default button styling', async ({ page }) => {
    await initializeTouchspinFromGlobals(page, 'test-input');

    const wrapper = page.getByTestId('test-input-wrapper');
    const upButton = wrapper.locator('[data-touchspin-injected="up"]');
    const downButton = wrapper.locator('[data-touchspin-injected="down"]');

    // Bootstrap 3 default styling
    await expect(upButton).toHaveClass(/btn-default/);
    await expect(downButton).toHaveClass(/btn-default/);
  });

  /**
   * Scenario: structures prefix and postfix as input-group-addon
   * Given the fixture page is loaded with DOM helpers
   * When TouchSpin initializes with Bootstrap 3 renderer including prefix and postfix
   * Then prefix and postfix use input-group-addon class and display correct text
   */
  test('structures prefix and postfix as input-group-addon', async ({ page }) => {
    await initializeTouchspinFromGlobals(page, 'test-input', {
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

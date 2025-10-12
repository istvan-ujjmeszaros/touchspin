/**
 * Feature: Bootstrap 5 renderer floating labels support
 * Background: fixture = /packages/renderers/bootstrap5/tests/fixtures/floating-labels-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] supports floating labels with TouchSpin initialization and all interaction methods
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { initializeTouchspinFromGlobals, installDomHelpers } from '@touchspin/core/test-helpers';
import { bootstrap5RendererUrl, ensureBootstrap5Globals } from './helpers/bootstrap5-globals';

// Alias for readability in renderer tests
const initializeTouchSpin = initializeTouchspinFromGlobals;

// Bootstrap 5 Renderer URL for tests
const BOOTSTRAP5_RENDERER_URL = bootstrap5RendererUrl;
const FLOATING_LABELS_FIXTURE =
  '/packages/renderers/bootstrap5/tests/fixtures/floating-labels-fixture.html';

// Coverage hooks
test.afterEach(async ({ page }, testInfo) => {
  await apiHelpers.collectCoverage(page, testInfo.title.replace(/\s+/g, '-'));
});

/**
 * Scenario: supports floating labels with TouchSpin initialization and all interaction methods
 * Given the floating labels fixture page is loaded with DOM helpers
 * When TouchSpin initializes on inputs with floating labels
 * Then floating label structure is preserved and all interaction methods work correctly
 * And accessibility attributes are maintained
 * And visual positioning is correct
 */
test('supports floating labels with TouchSpin initialization and all interaction methods', async ({
  page,
}) => {
  await page.goto(FLOATING_LABELS_FIXTURE);
  await ensureBootstrap5Globals(page);
  await installDomHelpers(page);
  await apiHelpers.startCoverage(page);

  // Test 1: Basic floating label initialization
  await initializeTouchSpin(page, 'basic-floating', BOOTSTRAP5_RENDERER_URL);

  // Verify floating label structure is preserved
  // Note: Using locator instead of getByRole because Bootstrap 5 floating labels
  // have special CSS positioning that may affect accessibility tree computation
  // eslint-disable-next-line playwright/no-page-locator
  const basicFloatingLabel = page.locator('.form-floating label[for="basic-floating"]');
  await expect(basicFloatingLabel).toBeVisible();
  await expect(basicFloatingLabel).toHaveText('Amount');

  // Verify input maintains accessibility
  const basicInput = page.getByTestId('basic-floating');
  await expect(basicInput).toHaveAccessibleName(/Amount/);

  // Test 2: Floating label in input group
  await initializeTouchSpin(page, 'group-floating', BOOTSTRAP5_RENDERER_URL);

  // Verify input group structure with floating labels
  // eslint-disable-next-line playwright/no-page-locator
  const groupLabel = page.locator('.form-floating label[for="group-floating"]');
  await expect(groupLabel).toBeVisible();
  await expect(groupLabel).toHaveText('Price');

  // Verify prefix and postfix are present
  const groupWrapper = page.getByTestId('group-floating-wrapper');
  await expect(groupWrapper.locator('.input-group-text').first()).toHaveText('$');
  await expect(groupWrapper.locator('.input-group-text').last()).toHaveText('.00');

  // Test 3: Multiple floating labels
  await initializeTouchSpin(page, 'multi-1', BOOTSTRAP5_RENDERER_URL);
  await initializeTouchSpin(page, 'multi-2', BOOTSTRAP5_RENDERER_URL);
  await initializeTouchSpin(page, 'multi-3', BOOTSTRAP5_RENDERER_URL);

  // Verify all labels are visible and functional
  const expectedLabels = ['Quantity', 'Rate', 'Total'];
  for (let i = 0; i < expectedLabels.length; i++) {
    const labelName = expectedLabels[i];
    const inputId = `multi-${i + 1}`;

    // eslint-disable-next-line playwright/no-page-locator
    const label = page.locator(`.form-floating label[for="${inputId}"]`);
    await expect(label).toBeVisible();
    await expect(label).toHaveText(labelName);

    const input = page.getByTestId(inputId);
    await expect(input).toHaveAttribute('data-touchspin-injected', 'input');
  }

  // Test 4: Complex form layout
  await initializeTouchSpin(page, 'form-amount', BOOTSTRAP5_RENDERER_URL);
  await initializeTouchSpin(page, 'form-percentage', BOOTSTRAP5_RENDERER_URL);
  await initializeTouchSpin(page, 'form-total', BOOTSTRAP5_RENDERER_URL);

  // Comprehensive interaction testing on the basic floating input

  // Test button interactions
  await apiHelpers.expectValueToBe(page, 'basic-floating', '50');

  await apiHelpers.clickUpButton(page, 'basic-floating');
  await apiHelpers.expectValueToBe(page, 'basic-floating', '51');

  await apiHelpers.clickDownButton(page, 'basic-floating');
  await apiHelpers.expectValueToBe(page, 'basic-floating', '50');

  // Test keyboard interactions
  await page.getByTestId('basic-floating').focus();

  // Arrow up key
  await page.keyboard.press('ArrowUp');
  await apiHelpers.expectValueToBe(page, 'basic-floating', '51');

  // Arrow down key
  await page.keyboard.press('ArrowDown');
  await apiHelpers.expectValueToBe(page, 'basic-floating', '50');

  // Test API interactions
  await apiHelpers.incrementViaAPI(page, 'basic-floating');
  await apiHelpers.expectValueToBe(page, 'basic-floating', '51');

  await apiHelpers.decrementViaAPI(page, 'basic-floating');
  await apiHelpers.expectValueToBe(page, 'basic-floating', '50');

  // Test setValue API
  await apiHelpers.setValueViaAPI(page, 'basic-floating', 75);
  await apiHelpers.expectValueToBe(page, 'basic-floating', '75');

  // Test wheel interactions (if input is focused)
  await page.getByTestId('basic-floating').focus();

  // Simulate wheel up
  await page.getByTestId('basic-floating').hover();
  await page.mouse.wheel(0, -100); // Negative deltaY = wheel up
  await apiHelpers.expectValueToBe(page, 'basic-floating', '76');

  // Simulate wheel down
  await page.mouse.wheel(0, 100); // Positive deltaY = wheel down
  await apiHelpers.expectValueToBe(page, 'basic-floating', '75');

  // Verify DOM structure preservation after all interactions

  // Check that floating label is still present and functional
  await expect(basicFloatingLabel).toBeVisible();
  await expect(basicFloatingLabel).toHaveText('Amount');

  // Check that input maintains proper floating label relationship
  const floatingContainer = page.getByTestId('basic-floating').locator('..').first();
  await expect(floatingContainer).toBeVisible();

  // Check that TouchSpin wrapper exists
  const touchSpinWrapper = page.getByTestId('basic-floating-wrapper');
  await expect(touchSpinWrapper).toBeVisible();
  await expect(touchSpinWrapper).toHaveClass(/bootstrap-touchspin/);

  // Verify accessibility is maintained
  await expect(basicInput).toHaveAttribute('role', 'spinbutton');
  await expect(basicInput).toHaveAccessibleName(/Amount/);

  // Check ARIA attributes
  await expect(basicInput).toHaveAttribute('aria-valuenow', '75');
  await expect(basicInput).toHaveAttribute('aria-valuetext', '75');

  // Test floating label behavior (CSS-driven)

  // Clear input to test floating behavior
  await page.getByTestId('basic-floating').fill('');

  // Label should float up when focused (even if empty)
  await page.getByTestId('basic-floating').focus();

  // Add value and verify label stays floated
  await apiHelpers.setValueViaAPI(page, 'basic-floating', 100);
  await apiHelpers.expectValueToBe(page, 'basic-floating', '100');

  // Label should remain visible and positioned correctly
  await expect(basicFloatingLabel).toBeVisible();

  // Test complex input group with floating labels

  // Test the input group with prefix/postfix
  // Note: Value may be normalized during re-initialization
  await apiHelpers.expectValueToBe(page, 'group-floating', '100');

  // Should be at max, so down button should work
  await apiHelpers.clickDownButton(page, 'group-floating');
  await apiHelpers.expectValueToBe(page, 'group-floating', '99');

  // Verify prefix and postfix are still present
  const groupWrapperFinal = page.getByTestId('group-floating-wrapper');
  await expect(groupWrapperFinal.locator('.input-group-text').first()).toHaveText('$');
  await expect(groupWrapperFinal.locator('.input-group-text').last()).toHaveText('.00');

  // Verify floating label is still functional
  // eslint-disable-next-line playwright/no-page-locator
  const groupLabelFinal = page.locator('.form-floating label[for="group-floating"]');
  await expect(groupLabelFinal).toBeVisible();
  await expect(groupLabelFinal).toHaveText('Price');
});

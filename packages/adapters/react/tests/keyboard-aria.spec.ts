/**
 * Feature: TouchSpin React Adapter - Keyboard & ARIA Smoke Test
 * Background: fixture = /packages/adapters/react/tests/fixtures/react-bootstrap5-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] keyboard arrow up increments value
 * [x] keyboard arrow down decrements value
 * [x] ARIA role spinbutton is present
 * [x] ARIA valuenow updates with value changes
 * [x] ARIA valuemin and valuemax are set correctly
 * [x] disabled state prevents keyboard interaction
 * [x] disabled state prevents button clicks
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';

test.describe('TouchSpin React - Keyboard & ARIA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/adapters/react/tests/fixtures/react-bootstrap5-fixture.html');

    // Wait for React to mount
    await apiHelpers.waitForTouchspinInitialized(page, 'aria-input', 5000);
  });

  /**
   * Scenario: keyboard arrow up increments value
   * Given a focused TouchSpin input
   * When the user presses ArrowUp key
   * Then value increases by step amount
   */
  test('keyboard arrow up increments value', async ({ page }) => {
    // Given: ARIA test component at value 42
    const { input: ariaInput } = await apiHelpers.getTouchSpinElements(page, 'aria-input');
    await expect(ariaInput).toHaveValue('42');

    // Focus the input
    await ariaInput.focus();

    // When: Press ArrowUp key
    await ariaInput.press('ArrowUp');

    // Then: Value increases by step (2)
    await expect(ariaInput).toHaveValue('44');
  });

  /**
   * Scenario: keyboard arrow down decrements value
   * Given a focused TouchSpin input
   * When the user presses ArrowDown key
   * Then value decreases by step amount
   */
  test('keyboard arrow down decrements value', async ({ page }) => {
    // Given: ARIA test component at value 42
    const { input: ariaInput } = await apiHelpers.getTouchSpinElements(page, 'aria-input');
    await expect(ariaInput).toHaveValue('42');

    // Focus the input
    await ariaInput.focus();

    // When: Press ArrowDown key
    await ariaInput.press('ArrowDown');

    // Then: Value decreases by step (2)
    await expect(ariaInput).toHaveValue('40');
  });

  /**
   * Scenario: ARIA role spinbutton is present
   * Given a TouchSpin component
   * When the component is rendered
   * Then the input has role="spinbutton"
   */
  test('ARIA role spinbutton is present', async ({ page }) => {
    // Given: ARIA test component
    const { input: ariaInput } = await apiHelpers.getTouchSpinElements(page, 'aria-input');

    // Then: Input has role="spinbutton"
    await expect(ariaInput).toHaveAttribute('role', 'spinbutton');
  });

  /**
   * Scenario: ARIA valuenow updates with value changes
   * Given a TouchSpin component with initial value
   * When the value is changed
   * Then aria-valuenow attribute updates
   */
  test('ARIA valuenow updates with value changes', async ({ page }) => {
    // Given: ARIA test component at value 42
    const { input: ariaInput } = await apiHelpers.getTouchSpinElements(page, 'aria-input');
    await expect(ariaInput).toHaveAttribute('aria-valuenow', '42');

    // When: Increment value
    await apiHelpers.clickUpButton(page, 'aria-input');

    // Then: aria-valuenow updates to 44
    await expect(ariaInput).toHaveAttribute('aria-valuenow', '44');
  });

  /**
   * Scenario: ARIA valuemin and valuemax are set correctly
   * Given a TouchSpin component with min=10 and max=90
   * When the component is rendered
   * Then aria-valuemin and aria-valuemax are set
   */
  test('ARIA valuemin and valuemax are set correctly', async ({ page }) => {
    // Given: ARIA test component with min=10, max=90
    const { input: ariaInput } = await apiHelpers.getTouchSpinElements(page, 'aria-input');

    // Then: ARIA attributes are set
    await expect(ariaInput).toHaveAttribute('aria-valuemin', '10');
    await expect(ariaInput).toHaveAttribute('aria-valuemax', '90');
  });

  /**
   * Scenario: disabled state prevents keyboard interaction
   * Given a disabled TouchSpin component
   * When the user presses arrow keys
   * Then the value does not change
   */
  test('disabled state prevents keyboard interaction', async ({ page }) => {
    // Given: Disabled component at value 30
    const { input: disabledInput } = await apiHelpers.getTouchSpinElements(page, 'disabled-input');
    await expect(disabledInput).toHaveValue('30');
    await expect(disabledInput).toBeDisabled();

    // Focus the input (browsers allow focus on disabled inputs)
    await disabledInput.focus();

    // When: Press ArrowUp key
    await disabledInput.press('ArrowUp');

    // Then: Value does not change (remains 30)
    await page.waitForTimeout(100);
    await expect(disabledInput).toHaveValue('30');
  });

  /**
   * Scenario: disabled state prevents button clicks
   * Given a disabled TouchSpin component
   * When the user clicks increment button
   * Then the value does not change
   */
  test('disabled state prevents button clicks', async ({ page }) => {
    // Given: Disabled component at value 30
    const { input: disabledInput, upButton } = await apiHelpers.getTouchSpinElements(
      page,
      'disabled-input'
    );
    await expect(disabledInput).toHaveValue('30');

    // When: Try to click up button
    // Note: Button should be disabled (Bootstrap renderer disables buttons)
    await expect(upButton).toBeDisabled();

    // Then: Value remains 30
    await expect(disabledInput).toHaveValue('30');
  });
});

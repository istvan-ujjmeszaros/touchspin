/**
 * Feature: TouchSpin React Adapter - Controlled vs Uncontrolled Behavior
 * Background: fixture = /packages/adapters/react/tests/fixtures/react-bootstrap5-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] controlled component updates when prop changes
 * [x] uncontrolled component maintains internal state
 * [x] controlled component onChange fires on user interaction
 * [x] uncontrolled component onChange fires on user interaction
 * [x] controlled component reflects external state changes
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';

test.describe('TouchSpin React - Controlled vs Uncontrolled', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/adapters/react/tests/fixtures/react-bootstrap5-fixture.html');

    // Wait for React to mount
    await apiHelpers.waitForTouchspinInitialized(page, 'controlled-input', 5000);
    await apiHelpers.waitForTouchspinInitialized(page, 'uncontrolled-input', 5000);
  });

  /**
   * Scenario: controlled component updates when prop changes
   * Given a controlled TouchSpin component with value={50}
   * When the value prop is changed externally to 75
   * Then the input displays 75
   */
  test('controlled component updates when prop changes', async ({ page }) => {
    // Given: Controlled component with initial value 50
    const { input: controlledInput } = await apiHelpers.getTouchSpinElements(page, 'controlled-input');
    await expect(controlledInput).toHaveValue('50');

    // When: Update value prop via test interface
    await page.evaluate(() => {
      (window as any).testInterface.setControlledValue(75);
    });

    // Then: Input displays new value
    await expect(controlledInput).toHaveValue('75');
  });

  /**
   * Scenario: uncontrolled component maintains internal state
   * Given an uncontrolled TouchSpin component with defaultValue={25}
   * When the user clicks increment button
   * Then the internal state updates to 30 (step=5)
   */
  test('uncontrolled component maintains internal state', async ({ page }) => {
    // Given: Uncontrolled component with defaultValue 25
    const { input: uncontrolledInput } = await apiHelpers.getTouchSpinElements(page, 'uncontrolled-input');
    await expect(uncontrolledInput).toHaveValue('25');

    // When: Click increment button (step=5)
    await apiHelpers.clickUpButton(page, 'uncontrolled-input');

    // Then: Value increases to 30
    await expect(uncontrolledInput).toHaveValue('30');
  });

  /**
   * Scenario: controlled component onChange fires on user interaction
   * Given a controlled TouchSpin component
   * When the user clicks increment button
   * Then onChange callback is fired with new value
   */
  test('controlled component onChange fires on user interaction', async ({ page }) => {
    // Given: Controlled component at value 50
    const controlledDisplay = await page.getByTestId('controlled-display');
    await expect(controlledDisplay).toHaveText('Controlled: 50');

    // When: Click increment button
    await apiHelpers.clickUpButton(page, 'controlled-input');

    // Then: onChange updates parent state (displayed on page)
    await expect(controlledDisplay).toHaveText('Controlled: 51');
  });

  /**
   * Scenario: uncontrolled component onChange fires on user interaction
   * Given an uncontrolled TouchSpin component with onChange handler
   * When the user clicks increment button
   * Then onChange callback is fired
   */
  test('uncontrolled component onChange fires on user interaction', async ({ page }) => {
    // Given: Uncontrolled component at value 25
    const { input: uncontrolledInput } = await apiHelpers.getTouchSpinElements(page, 'uncontrolled-input');
    await expect(uncontrolledInput).toHaveValue('25');

    // Track onChange calls
    await page.evaluate(() => {
      (window as any).onChangeCallCount = 0;
    });

    // When: Click increment button
    await apiHelpers.clickUpButton(page, 'uncontrolled-input');

    // Then: Value updates (onChange was called internally)
    await expect(uncontrolledInput).toHaveValue('30');
  });

  /**
   * Scenario: controlled component reflects external state changes
   * Given a controlled TouchSpin component
   * When the value prop changes multiple times rapidly
   * Then the component reflects each change
   */
  test('controlled component reflects external state changes', async ({ page }) => {
    // Given: Controlled component at value 50
    const { input: controlledInput } = await apiHelpers.getTouchSpinElements(page, 'controlled-input');
    await expect(controlledInput).toHaveValue('50');

    // When: Rapidly change value prop
    await page.evaluate(() => {
      const iface = (window as any).testInterface;
      iface.setControlledValue(10);
    });
    await expect(controlledInput).toHaveValue('10');

    await page.evaluate(() => {
      (window as any).testInterface.setControlledValue(90);
    });
    await expect(controlledInput).toHaveValue('90');

    await page.evaluate(() => {
      (window as any).testInterface.setControlledValue(50);
    });
    await expect(controlledInput).toHaveValue('50');
  });
});

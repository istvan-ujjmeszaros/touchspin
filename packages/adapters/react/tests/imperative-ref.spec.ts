/**
 * Feature: TouchSpin React Adapter - Imperative Ref Methods
 * Background: fixture = /packages/adapters/react/tests/fixtures/react-bootstrap5-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] ref.increment() increases value by step
 * [x] ref.decrement() decreases value by step
 * [x] ref.getValue() returns current value
 * [x] ref.setValue() updates value programmatically
 * [x] ref.focus() focuses the input element
 * [x] ref.blur() blurs the input element
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import * as reactHelpers from './helpers/react-helpers.js';

test.describe('TouchSpin React - Imperative Ref Methods', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/adapters/react/tests/fixtures/react-bootstrap5-fixture.html');

    // Wait for React to mount
    await apiHelpers.waitForTouchspinInitialized(page, 'controlled-input', 5000);
  });

  /**
   * Scenario: ref.increment() increases value by step
   * Given a TouchSpin component with ref
   * When ref.increment() is called
   * Then value increases by step amount
   */
  test('ref.increment() increases value by step', async ({ page }) => {
    // Given: Controlled component at value 50
    const { input: controlledInput } = await apiHelpers.getTouchSpinElements(
      page,
      'controlled-input'
    );
    await expect(controlledInput).toHaveValue('50');

    // When: Call ref.increment()
    await page.evaluate(() => {
      const ref = (window as any).testInterface.getControlledRef();
      ref.increment();
    });

    // Then: Value increases by 1 (step=1)
    // Wait for React to update
    await page.waitForTimeout(50);
    await expect(controlledInput).toHaveValue('51');
  });

  /**
   * Scenario: ref.decrement() decreases value by step
   * Given a TouchSpin component with ref
   * When ref.decrement() is called
   * Then value decreases by step amount
   */
  test('ref.decrement() decreases value by step', async ({ page }) => {
    // Given: Controlled component at value 50
    const { input: controlledInput } = await apiHelpers.getTouchSpinElements(
      page,
      'controlled-input'
    );
    await expect(controlledInput).toHaveValue('50');

    // When: Call ref.decrement()
    await page.evaluate(() => {
      const ref = (window as any).testInterface.getControlledRef();
      ref.decrement();
    });

    // Then: Value decreases by 1 (step=1)
    await page.waitForTimeout(50);
    await expect(controlledInput).toHaveValue('49');
  });

  /**
   * Scenario: ref.getValue() returns current value
   * Given a TouchSpin component with value
   * When ref.getValue() is called
   * Then it returns the current numeric value
   */
  test('ref.getValue() returns current value', async ({ page }) => {
    // Given: Controlled component at value 50
    const { input: controlledInput } = await apiHelpers.getTouchSpinElements(
      page,
      'controlled-input'
    );
    await expect(controlledInput).toHaveValue('50');

    // When: Call ref.getValue()
    const value = await page.evaluate(() => {
      const ref = (window as any).testInterface.getControlledRef();
      return ref.getValue();
    });

    // Then: Returns 50
    expect(value).toBe(50);
  });

  /**
   * Scenario: ref.setValue() updates value programmatically
   * Given a TouchSpin component with ref
   * When ref.setValue(80) is called
   * Then value updates to 80
   */
  test('ref.setValue() updates value programmatically', async ({ page }) => {
    // Given: Controlled component at value 50
    const { input: controlledInput } = await apiHelpers.getTouchSpinElements(
      page,
      'controlled-input'
    );
    await expect(controlledInput).toHaveValue('50');

    // When: Call ref.setValue(80)
    await page.evaluate(() => {
      const ref = (window as any).testInterface.getControlledRef();
      ref.setValue(80);
    });

    // Then: Value updates to 80
    await page.waitForTimeout(50);
    await expect(controlledInput).toHaveValue('80');
  });

  /**
   * Scenario: ref.focus() focuses the input element
   * Given a TouchSpin component with ref
   * When ref.focus() is called
   * Then the input element receives focus
   */
  test('ref.focus() focuses the input element', async ({ page }) => {
    // Given: Controlled component
    const { input: controlledInput } = await apiHelpers.getTouchSpinElements(
      page,
      'controlled-input'
    );

    // Ensure input is not focused initially
    await reactHelpers.blurActiveElement(page);
    await expect(controlledInput).not.toBeFocused();

    // When: Call ref.focus()
    await page.evaluate(() => {
      const ref = (window as any).testInterface.getControlledRef();
      ref.focus();
    });

    // Then: Input is focused
    await expect(controlledInput).toBeFocused();
  });

  /**
   * Scenario: ref.blur() blurs the input element
   * Given a focused TouchSpin component with ref
   * When ref.blur() is called
   * Then the input element loses focus
   */
  test('ref.blur() blurs the input element', async ({ page }) => {
    // Given: Controlled component that is focused
    const { input: controlledInput } = await apiHelpers.getTouchSpinElements(
      page,
      'controlled-input'
    );
    await controlledInput.focus();
    await expect(controlledInput).toBeFocused();

    // When: Call ref.blur()
    await page.evaluate(() => {
      const ref = (window as any).testInterface.getControlledRef();
      ref.blur();
    });

    // Then: Input loses focus
    await expect(controlledInput).not.toBeFocused();
  });
});

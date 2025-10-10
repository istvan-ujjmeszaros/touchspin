/**
 * Smoke test for jQuery Adapter (using Standalone)
 * Background: fixture = /packages/adapters/jquery/tests/fixtures/jquery-bootstrap5.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] initializes TouchSpin using jQuery plugin API
 * [x] increments value with up button
 * [x] decrements value with down button
 * [x] supports command API (getValue)
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';

test.describe('jQuery Adapter Smoke Test (Bootstrap5)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/adapters/jquery/tests/fixtures/jquery-bootstrap5.html');
    await apiHelpers.startCoverage(page);
    // Wait for TouchSpin to be mounted (buttons appear)
    await page.waitForSelector('[data-testid="jquery-test-up"]', { timeout: 5000 });
  });

  test.afterEach(async ({ page }, testInfo) => {
    await apiHelpers.collectCoverage(page, testInfo.title);
  });

  /**
   * Scenario: initializes TouchSpin using jQuery plugin API
   * Given an input element with data-testid="jquery-test"
   * When $('#input').touchspin() is called
   * Then the TouchSpin UI is created with up/down buttons
   */
  test('initializes TouchSpin using jQuery plugin API', async ({ page }) => {
    // Verify TouchSpin was initialized successfully
    const input = page.getByTestId('jquery-test');
    await expect(input).toBeAttached();

    // Verify TouchSpin UI components exist
    const upButton = page.getByTestId('jquery-test-up');
    const downButton = page.getByTestId('jquery-test-down');

    await expect(upButton).toBeAttached();
    await expect(downButton).toBeAttached();

    // Verify initial value and aria-valuenow
    await expect(input).toHaveValue('10');
    await expect(input).toHaveAttribute('aria-valuenow', '10');
  });

  /**
   * Scenario: increments value with up button
   * Given a mounted TouchSpin with value=10 and step=5
   * When the up button is clicked
   * Then the value increases to 15 and aria-valuenow updates
   */
  test('increments value with up button', async ({ page }) => {
    const input = page.getByTestId('jquery-test');
    const upButton = page.getByTestId('jquery-test-up');

    // Click increment button
    await upButton.click();

    // Verify value and aria-valuenow updated
    await expect(input).toHaveValue('15');
    await expect(input).toHaveAttribute('aria-valuenow', '15');
  });

  /**
   * Scenario: decrements value with down button
   * Given a mounted TouchSpin with value=10 and step=5
   * When the down button is clicked
   * Then the value decreases to 5 and aria-valuenow updates
   */
  test('decrements value with down button', async ({ page }) => {
    const input = page.getByTestId('jquery-test');
    const downButton = page.getByTestId('jquery-test-down');

    // Click decrement button
    await downButton.click();

    // Verify value and aria-valuenow updated
    await expect(input).toHaveValue('5');
    await expect(input).toHaveAttribute('aria-valuenow', '5');
  });

  /**
   * Scenario: supports command API (getValue)
   * Given a mounted TouchSpin
   * When the getValue command is called via jQuery API
   * Then it returns the current value
   */
  test('supports command API (getValue)', async ({ page }) => {
    const input = page.getByTestId('jquery-test');

    // Get value using jQuery command API
    const value = await page.evaluate(() => {
      // biome-ignore lint/suspicious/noExplicitAny: jQuery not typed in browser context
      // biome-ignore lint/correctness/noUndeclaredVariables: $ is jQuery global
      return ($('#test-input') as any).TouchSpin('getValue');
    });

    // Verify it matches the input value
    const inputValue = await input.inputValue();
    expect(value).toBe(Number(inputValue));
  });
});

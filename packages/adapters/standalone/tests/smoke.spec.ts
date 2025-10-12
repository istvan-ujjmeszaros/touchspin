/**
 * Smoke test for TouchSpin Standalone Bootstrap5 Adapter
 * Background: fixture = /packages/adapters/standalone/tests/fixtures/bootstrap5-standalone.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] mounts TouchSpin on input element
 * [x] increments value with up button
 * [x] decrements value with down button
 * [x] updates aria-valuenow attribute
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';

test.describe('TouchSpin Standalone Bootstrap5 Smoke Test', () => {
  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('/packages/adapters/standalone/tests/fixtures/bootstrap5-standalone.html');
    // Wait for TouchSpin to be mounted (buttons appear)
    await page.waitForSelector('[data-testid="standalone-test-up"]', { timeout: 5000 });
  });

  test.afterEach(async ({ page }, testInfo) => {
    await apiHelpers.collectCoverage(page, testInfo.title);
  });

  /**
   * Scenario: mounts TouchSpin on input element
   * Given an input element with data-testid="standalone-test"
   * When the standalone adapter mounts TouchSpin
   * Then the TouchSpin UI is created with up/down buttons
   */
  test('mounts TouchSpin on input element', async ({ page }) => {
    // Verify TouchSpin was mounted successfully
    const input = page.getByTestId('standalone-test');
    await expect(input).toBeAttached();

    // Verify TouchSpin UI components exist
    const upButton = page.getByTestId('standalone-test-up');
    const downButton = page.getByTestId('standalone-test-down');

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
    const input = page.getByTestId('standalone-test');
    const upButton = page.getByTestId('standalone-test-up');

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
    const input = page.getByTestId('standalone-test');
    const downButton = page.getByTestId('standalone-test-down');

    // Click decrement button
    await downButton.click();

    // Verify value and aria-valuenow updated
    await expect(input).toHaveValue('5');
    await expect(input).toHaveAttribute('aria-valuenow', '5');
  });

  /**
   * Scenario: updates aria-valuenow attribute
   * Given a mounted TouchSpin
   * When the value changes via button clicks
   * Then the aria-valuenow attribute stays synchronized
   */
  test('updates aria-valuenow attribute', async ({ page }) => {
    const input = page.getByTestId('standalone-test');
    const upButton = page.getByTestId('standalone-test-up');
    const downButton = page.getByTestId('standalone-test-down');

    // Initial state
    await expect(input).toHaveAttribute('aria-valuenow', '10');

    // Increment twice
    await upButton.click();
    await expect(input).toHaveAttribute('aria-valuenow', '15');

    await upButton.click();
    await expect(input).toHaveAttribute('aria-valuenow', '20');

    // Decrement once
    await downButton.click();
    await expect(input).toHaveAttribute('aria-valuenow', '15');

    // Verify value matches aria-valuenow
    const value = await input.inputValue();
    const ariaValueNow = await input.getAttribute('aria-valuenow');
    expect(value).toBe(ariaValueNow);
  });
});

/**
 * Feature: Core callback value suffix and destroy lifecycle
 * Background: fixture = /packages/core/tests/fixtures/core-api-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] displays value with USD suffix via callback and restores raw value on destroy
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { initializeTouchspin } from '../../test-helpers/core-adapter';

test.describe('Core callback value suffix and destroy lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/core/tests/fixtures/core-api-fixture.html');
    await apiHelpers.startCoverage(page);
    await apiHelpers.waitForPageReady(page);
    await apiHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await apiHelpers.collectCoverage(page, testInfo.title);
  });

  /**
   * Scenario: displays value with USD suffix via callback and restores raw value on destroy
   * Given an input with type="number" and initial value 50
   * When TouchSpin initializes with callback_after_calculation appending "USD"
   * Then the displayed value is "50USD"
   * When the value is incremented
   * Then the displayed value is "51USD"
   * When destroy is called
   * Then the input contains the raw numeric value "51"
   * Params:
   * { "inputType": "number", "initialValue": 50, "callback": "append USD", "expectedDisplay": "50USD", "afterIncrement": "51USD", "afterDestroy": "51" }
   */
  test('displays value with USD suffix via callback and restores raw value on destroy', async ({
    page,
  }) => {
    // Set initial input type to number and value to 50
    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
      input.type = 'number';
      input.value = '50';
    });

    // Initialize TouchSpin with callback that appends "USD"
    await initializeTouchspin(page, 'test-input', {
      step: 1,
      initval: 50,
      callback_after_calculation: (value) => {
        return value + 'USD';
      },
    });

    // Verify the displayed value contains "USD"
    const initialDisplay = await apiHelpers.readInputValue(page, 'test-input');
    expect(initialDisplay).toBe('50USD');

    // Increment the value
    await apiHelpers.incrementViaAPI(page, 'test-input');

    // Verify the displayed value is updated with "USD"
    const incrementedDisplay = await apiHelpers.readInputValue(page, 'test-input');
    expect(incrementedDisplay).toBe('51USD');

    // Destroy the TouchSpin instance
    await apiHelpers.destroyCore(page, 'test-input');

    // Verify the input contains only the raw numeric value
    const destroyedValue = await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
      return input ? input.value : '';
    });

    expect(destroyedValue).toBe('51');
  });
});

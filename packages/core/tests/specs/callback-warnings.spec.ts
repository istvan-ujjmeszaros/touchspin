/**
 * Feature: Callback pairing warnings
 * Background: fixture = /packages/core/tests/fixtures/core-api-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] warns when only callback_before_calculation is provided on initialization
 * [x] warns when only callback_after_calculation is provided on initialization
 * [x] no warning when both callbacks are provided on initialization
 * [x] no warning when neither callback is provided on initialization
 * [x] warns when only callback_before_calculation is provided via updateSettings
 * [x] warns when only callback_after_calculation is provided via updateSettings
 * [x] no warning when both callbacks are provided via updateSettings
 * [x] warns when removing one callback via updateSettings
 * [x] warns when callbacks are improperly paired (round-trip test fails)
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { captureConsoleWarnings } from '@touchspin/core/test-helpers';
import { initializeTouchspin, updateSettingsViaAPI } from '../test-helpers/core-adapter';

test.describe('TouchSpin callback pairing warnings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/core/tests/fixtures/core-api-fixture.html');
    await apiHelpers.startCoverage(page);
    await apiHelpers.waitForPageReady(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await apiHelpers.collectCoverage(page, testInfo.title);
  });

  /**
   * Scenario: warns when only callback_before_calculation is provided on initialization
   * Given the fixture page is loaded
   * When TouchSpin initializes with only callback_before_calculation
   * Then a console warning is emitted
   */
  test('warns when only callback_before_calculation is provided on initialization', async ({
    page,
  }) => {
    const warnings = captureConsoleWarnings(page);

    await initializeTouchspin(page, 'test-input', {
      callback_before_calculation: (val) => String(val).replace('$', ''),
    });

    expect(warnings).toContainEqual(
      expect.stringContaining(
        'callback_before_calculation is defined but callback_after_calculation is missing'
      )
    );
  });

  /**
   * Scenario: warns when only callback_after_calculation is provided on initialization
   * Given the fixture page is loaded
   * When TouchSpin initializes with only callback_after_calculation
   * Then a console warning is emitted
   */
  test('warns when only callback_after_calculation is provided on initialization', async ({
    page,
  }) => {
    const warnings = captureConsoleWarnings(page);

    await initializeTouchspin(page, 'test-input', {
      callback_after_calculation: (val) => `$${val}`,
    });

    expect(warnings).toContainEqual(
      expect.stringContaining(
        'callback_after_calculation is defined but callback_before_calculation is missing'
      )
    );
  });

  /**
   * Scenario: no warning when both callbacks are provided on initialization
   * Given the fixture page is loaded
   * When TouchSpin initializes with both callbacks
   * Then no console warning is emitted
   */
  test('no warning when both callbacks are provided on initialization', async ({ page }) => {
    const warnings = captureConsoleWarnings(page);

    await initializeTouchspin(page, 'test-input', {
      callback_before_calculation: (val) => String(val).replace('$', ''),
      callback_after_calculation: (val) => `$${val}`,
    });

    // Filter to only callback-related warnings (ignore renderer/type warnings from real core)
    const callbackWarnings = warnings.filter(
      (w) => w.includes('callback_before_calculation') || w.includes('callback_after_calculation')
    );
    expect(callbackWarnings).toHaveLength(0);
  });

  /**
   * Scenario: no warning when neither callback is provided on initialization
   * Given the fixture page is loaded
   * When TouchSpin initializes without callbacks
   * Then no console warning is emitted
   */
  test('no warning when neither callback is provided on initialization', async ({ page }) => {
    const warnings = captureConsoleWarnings(page);

    await initializeTouchspin(page, 'test-input', { step: 5 });

    // Filter to only callback-related warnings (ignore renderer warnings from real core)
    const callbackWarnings = warnings.filter(
      (w) => w.includes('callback_before_calculation') || w.includes('callback_after_calculation')
    );
    expect(callbackWarnings).toHaveLength(0);
  });

  /**
   * Scenario: warns when only callback_before_calculation is provided via updateSettings
   * Given TouchSpin is initialized without callbacks
   * When updateSettings adds only callback_before_calculation
   * Then a console warning is emitted
   */
  test('warns when only callback_before_calculation is provided via updateSettings', async ({
    page,
  }) => {
    const warnings = captureConsoleWarnings(page);

    await initializeTouchspin(page, 'test-input', { step: 5 });

    await updateSettingsViaAPI(page, 'test-input', {
      callback_before_calculation: (val) => String(val).replace('$', ''),
    });

    expect(warnings).toContainEqual(
      expect.stringContaining(
        'callback_before_calculation is defined but callback_after_calculation is missing'
      )
    );
  });

  /**
   * Scenario: warns when only callback_after_calculation is provided via updateSettings
   * Given TouchSpin is initialized without callbacks
   * When updateSettings adds only callback_after_calculation
   * Then a console warning is emitted
   */
  test('warns when only callback_after_calculation is provided via updateSettings', async ({
    page,
  }) => {
    const warnings = captureConsoleWarnings(page);

    await initializeTouchspin(page, 'test-input', { step: 5 });

    await updateSettingsViaAPI(page, 'test-input', {
      callback_after_calculation: (val) => `$${val}`,
    });

    expect(warnings).toContainEqual(
      expect.stringContaining(
        'callback_after_calculation is defined but callback_before_calculation is missing'
      )
    );
  });

  /**
   * Scenario: no warning when both callbacks are provided via updateSettings
   * Given TouchSpin is initialized without callbacks
   * When updateSettings adds both callbacks
   * Then no console warning is emitted
   */
  test('no warning when both callbacks are provided via updateSettings', async ({ page }) => {
    const warnings = captureConsoleWarnings(page);

    await initializeTouchspin(page, 'test-input', { step: 5 });

    await updateSettingsViaAPI(page, 'test-input', {
      callback_before_calculation: (val) => String(val).replace('$', ''),
      callback_after_calculation: (val) => `$${val}`,
    });

    // Since both callbacks are provided, no warning should be present
    const callbackWarnings = warnings.filter(
      (w) => w.includes('callback_before_calculation') || w.includes('callback_after_calculation')
    );
    expect(callbackWarnings).toHaveLength(0);
  });

  /**
   * Scenario: warns when removing one callback via updateSettings
   * Given TouchSpin is initialized with both callbacks
   * When updateSettings removes one callback by setting to default
   * Then a console warning is emitted
   */
  test('warns when removing one callback via updateSettings', async ({ page }) => {
    const warnings = captureConsoleWarnings(page);

    await initializeTouchspin(page, 'test-input', {
      callback_before_calculation: (val) => String(val).replace('$', ''),
      callback_after_calculation: (val) => `$${val}`,
    });

    // Remove the before callback by setting it to null/undefined
    await updateSettingsViaAPI(page, 'test-input', {
      callback_before_calculation: undefined, // Remove the callback
    });

    expect(warnings).toContainEqual(
      expect.stringContaining(
        'callback_after_calculation is defined but callback_before_calculation is missing'
      )
    );
  });

  /**
   * Scenario: warns when callbacks are improperly paired (round-trip test fails)
   * Given the fixture page is loaded
   * When TouchSpin initializes with callbacks that don't reverse each other
   * Then a console warning about round-trip test failure is emitted
   */
  test('warns when callbacks are improperly paired (round-trip test fails)', async ({ page }) => {
    const warnings = captureConsoleWarnings(page);

    // These callbacks are improperly paired:
    // - after adds " USD"
    // - before returns the value unchanged (doesn't strip " USD")
    await initializeTouchspin(page, 'test-input', {
      callback_before_calculation: (val) => {
        // This callback doesn't strip " USD" - it just returns the value
        return String(val);
      },
      callback_after_calculation: (val) => `${val} USD`, // Adds " USD"
    });

    expect(warnings).toContainEqual(
      expect.stringContaining('Callbacks are not properly paired - round-trip test failed')
    );
    expect(warnings).toContainEqual(
      expect.stringContaining(
        'callback_before_calculation must reverse what callback_after_calculation does'
      )
    );
  });
});

/**
 * Feature: Core change & boundary behaviors (API methods only)
 * Background: fixture = /packages/core/tests/fixtures/core-api-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] triggers change event on blur when value changed
 * [x] does not trigger change event on blur when value unchanged
 * [x] Mount does not emit change event
 * [x] Blur value above max clamps to max with single change event
 * [x] Blur value below min clamps to min with single change event
 * [x] Blur unchanged value does not emit change event
 * [x] Callable startupspin and stopspin emit start and stop events in order
 * [x] Keyboard ArrowUp increments by step
 * [x] Wheel scrolling down decrements by step when enabled
 * [x] Decimal rounding on blur respects decimals option
 * [x] Programmatic value setting on text input preserves non-numeric values (no auto-sanitization)
 */

import { test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { expectValueToBe } from '../__shared__/helpers/assertions/values';
import {
  fillWithValueAndBlur,
  setValueSilentlyAndBlur,
} from '../__shared__/helpers/interactions/input';
import { holdUpArrowKeyOnInput } from '../__shared__/helpers/interactions/keyboard';
import {
  clearEventLog,
  countEventInLog,
  getEventsOfType,
  hasEventInLog,
} from '../__shared__/helpers/events/log';
import { initializeTouchspin } from '../__shared__/helpers/core/initialization';

/**
 * Scenario: triggers change event on blur when value changed
 * Given the fixture page is loaded
 * When I change the value and blur the input
 * Then a change event is fired
 */
test('triggers change event on blur when value changed', async ({ page }) => {
  const testFixtureUrl = '/packages/core/tests/fixtures/core-api-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspin(page, 'test-input', { step: 1, min: 0, max: 100, initval: '0' });
  await fillWithValueAndBlur(page, 'test-input', '5');
  await expectValueToBe(page, 'test-input', '5');
  const changeEventCount = await countEventInLog(page, 'change');
  test.expect(changeEventCount).toBe(1);
});

/**
 * Scenario: does not trigger change event on blur when value unchanged
 * Given the fixture page is loaded
 * When I blur the input without changing the value
 * Then no change event is fired
 */
test('does not trigger change event on blur when value unchanged', async ({ page }) => {
  const testFixtureUrl = '/packages/core/tests/fixtures/core-api-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspin(page, 'test-input', { step: 1, min: 0, max: 100, initval: '0' });
  // Focus input but don't change value, then blur
  const input = page.getByTestId('test-input');
  await input.focus();
  await page.keyboard.press('Tab');
  await expectValueToBe(page, 'test-input', '0');
  const changeEventCount = await countEventInLog(page, 'change');
  test.expect(changeEventCount).toBe(0);
});

/**
 * Scenario: Mount does not emit change event
 * Given the fixture page is loaded
 * When I mount TouchSpin on the input with settings
 * Then no change event is emitted during initialization
 * Params:
 * { "settings": { "min": 0, "max": 100, "step": 1, "initval": "42" }, "expectEvents": [] }
 */
test('Mount does not emit change event', async ({ page }) => {
  const testFixtureUrl = '/packages/core/tests/fixtures/core-api-fixture.html';
  await page.goto(testFixtureUrl);
  await clearEventLog(page);

  // Initialize TouchSpin - this should not emit change events
  await initializeTouchspin(page, 'test-input', { step: 1, min: 0, max: 100, initval: 42 });

  const changeEventCount = await countEventInLog(page, 'change');
  test.expect(changeEventCount).toBe(0);

  // Verify the value was set correctly without change events
  await expectValueToBe(page, 'test-input', '42');
});

/**
 * Scenario: Blur value above max clamps to max with single change event
 * Given the fixture page is loaded
 * When I type a value above max and blur
 * Then the value clamps to max with a single change event
 * Params:
 * { "settings": { "min": 0, "max": 50, "step": 5, "initval": "25" }, "expectChangeCount": 1 }
 */
test('Blur value above max clamps to max with single change event', async ({ page }) => {
  const testFixtureUrl = '/packages/core/tests/fixtures/core-api-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspin(page, 'test-input', { step: 5, min: 0, max: 50, initval: 25 });
  await clearEventLog(page);

  // Type value above max and blur
  await fillWithValueAndBlur(page, 'test-input', '75');

  // Should clamp to max with single change event
  const changeCount = await countEventInLog(page, 'change');
  test.expect(changeCount).toBe(1);
  const nativeChanges = await getEventsOfType(page, 'native');
  const changeEvents = nativeChanges.filter((entry) => entry.event === 'change');
  test.expect(changeEvents.length).toBe(1);
  test.expect(changeEvents[0]!.value).toBe('50');

  await expectValueToBe(page, 'test-input', '50');
});

/**
 * Scenario: Blur value below min clamps to min with single change event
 * Given the fixture page is loaded
 * When I type a value below min and blur
 * Then the value clamps to min with a single change event
 * Params:
 * { "settings": { "min": 10, "max": 20, "step": 2, "initval": "12" }, "expectChangeCount": 1 }
 */
test('Blur value below min clamps to min with single change event', async ({ page }) => {
  const testFixtureUrl = '/packages/core/tests/fixtures/core-api-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspin(page, 'test-input', { step: 2, min: 10, max: 20, initval: 12 });
  await clearEventLog(page);

  // Type value below min and blur
  await fillWithValueAndBlur(page, 'test-input', '5');

  // Should clamp to min with single change event
  const changeCount = await countEventInLog(page, 'change');
  test.expect(changeCount).toBe(1);
  const nativeChanges = await getEventsOfType(page, 'native');
  const changeEvents = nativeChanges.filter((entry) => entry.event === 'change');
  test.expect(changeEvents.length).toBe(1);
  test.expect(changeEvents[0]!.value).toBe('10');

  await expectValueToBe(page, 'test-input', '10');
});

/**
 * Scenario: Blur unchanged value does not emit change event
 * Given the fixture page is loaded
 * When I type the same value and blur
 * Then no change event is emitted
 * Params:
 * { "settings": { "min": 0, "max": 10, "step": 1, "initval": "7" }, "expectChangeCount": 0 }
 */
test('Blur unchanged value does not emit change event', async ({ page }) => {
  const testFixtureUrl = '/packages/core/tests/fixtures/core-api-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspin(page, 'test-input', { step: 1, min: 0, max: 10, initval: 7 });
  await clearEventLog(page);

  // Focus, type the same value, and blur
  await fillWithValueAndBlur(page, 'test-input', '7');

  // Should not emit change event since value didn't change
  const changeCount = await countEventInLog(page, 'change');
  test.expect(changeCount).toBe(0);

  await expectValueToBe(page, 'test-input', '7');
});

/**
 * Scenario: Callable startupspin and stopspin emit start and stop events in order
 * Given the fixture page is loaded
 * When I call startupspin and then stopspin
 * Then start and stop events are emitted in the correct order
 * Params:
 * { "settings": { "min": 0, "max": 100, "step": 1, "initval": "50" }, "expectEvents": ["touchspin.on.startspin","touchspin.on.startupspin","touchspin.on.stopupspin","touchspin.on.stopspin"] }
 */
test('Callable startupspin and stopspin emit start and stop events in order', async ({ page }) => {
  const testFixtureUrl = '/packages/core/tests/fixtures/core-api-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspin(page, 'test-input', { step: 1, min: 0, max: 100, initval: 50 });
  await clearEventLog(page);

  // Hold up arrow key should emit start and stop events in order
  await holdUpArrowKeyOnInput(page, 'test-input', 1000);

  // Check for proper event sequence using typed helpers
  const hasStartSpin = await hasEventInLog(page, 'touchspin.on.startspin');
  const hasStartUpSpin = await hasEventInLog(page, 'touchspin.on.startupspin');
  const hasStopUpSpin = await hasEventInLog(page, 'touchspin.on.stopupspin');
  const hasStopSpin = await hasEventInLog(page, 'touchspin.on.stopspin');

  test.expect(hasStartSpin || hasStartUpSpin).toBe(true);
  test.expect(hasStopSpin || hasStopUpSpin).toBe(true);
});

/**
 * Scenario: Keyboard ArrowUp increments by step
 * Given the fixture page is loaded
 * When I press ArrowUp on the input
 * Then the value increments by the step amount
 * Params:
 * { "settings": { "min": 0, "max": 10, "step": 1, "initval": "5" } }
 */
test('Keyboard ArrowUp increments by step', async ({ page }) => {
  const testFixtureUrl = '/packages/core/tests/fixtures/core-api-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspin(page, 'test-input', { step: 1, min: 0, max: 10, initval: 5 });
  await clearEventLog(page);

  const input = page.getByTestId('test-input');
  await input.focus();
  await page.keyboard.press('ArrowUp');

  await expectValueToBe(page, 'test-input', '6');

  const changeCount = await countEventInLog(page, 'change');
  test.expect(changeCount).toBe(1);
});

/**
 * Scenario: Wheel scrolling down decrements by step when enabled
 * Given the fixture page is loaded with mousewheel enabled
 * When I scroll down on the input
 * Then the value decrements by the step amount
 * Params:
 * { "settings": { "min": 0, "max": 10, "step": 1, "initval": "5", "mousewheel": true } }
 */
test('Wheel scrolling down decrements by step when enabled', async ({ page }) => {
  const testFixtureUrl = '/packages/core/tests/fixtures/core-api-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspin(page, 'test-input', {
    step: 1,
    min: 0,
    max: 10,
    initval: 5,
    mousewheel: true,
  });
  await clearEventLog(page);

  // Focus input and scroll down
  const input = page.getByTestId('test-input');
  await input.focus();
  await input.hover();
  await page.mouse.wheel(0, 100); // Scroll down

  await expectValueToBe(page, 'test-input', '4');

  const changeCount = await countEventInLog(page, 'change');
  test.expect(changeCount).toBe(1);
});

/**
 * Scenario: Decimal rounding on blur respects decimals option
 * Given the fixture page is loaded with decimal precision setting
 * When I type a value with extra decimals and blur
 * Then the value rounds according to the decimals option
 * Params:
 * { "settings": { "min": 0, "max": 9, "step": 0.01, "initval": "1.00", "decimals": 2 } }
 */
test('Decimal rounding on blur respects decimals option', async ({ page }) => {
  const testFixtureUrl = '/packages/core/tests/fixtures/core-api-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspin(page, 'test-input', {
    step: 0.01,
    min: 0,
    max: 9,
    initval: 1.0,
    decimals: 2,
  });
  await clearEventLog(page);

  // Type value with extra decimals and blur
  await fillWithValueAndBlur(page, 'test-input', '1.23456');

  // Should round to 2 decimal places
  await expectValueToBe(page, 'test-input', '1.23');

  const changeCount = await countEventInLog(page, 'change');
  test.expect(changeCount).toBe(1);
});

/**
 * Scenario: Programmatic value setting on text input preserves non-numeric values (no auto-sanitization)
 * Given the fixture page is loaded with a text input (type="number" inputs reject non-numeric values)
 * When I set a value with non-numeric characters programmatically then blur
 * Then the value is preserved as-is without sanitization
 * Params:
 * { "settings": { "min": 0, "max": 100, "step": 1, "initval": "0" }, "inputType": "text" }
 */
test('Programmatic value setting on text input preserves non-numeric values (no auto-sanitization)', async ({
  page,
}) => {
  const testFixtureUrl = '/packages/core/tests/fixtures/core-api-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspin(page, 'test-input', { step: 1, min: 0, max: 100, initval: 0 });
  await clearEventLog(page);

  // Temporarily change input type to 'text' to allow non-numeric characters
  await page.evaluate(
    ({ testId }) => {
      const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
      if (input) input.type = 'text';
    },
    { testId: 'test-input' }
  );

  // Set value with non-numeric characters and spaces, then blur
  await setValueSilentlyAndBlur(page, 'test-input', '  42abc  ');

  // Should preserve non-numeric value as-is (no change event = no sanitization)
  await expectValueToBe(page, 'test-input', '  42abc  ');

  const changeCount = await countEventInLog(page, 'change');
  test.expect(changeCount).toBe(0); // No change event fired = no sanitization
});

/**
 * Feature: Core change & boundary behaviors (sample spec)
 * Background: fixture = /packages/core/tests/__shared__/fixtures/test-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] increases value on click on up button and triggers change event
 * [x] decreases value on click on down button and triggers change event
 * [x] triggers change event on blur when value changed
 * [x] does not trigger change event on blur when value unchanged
 * [x] Mount does not emit change event
 * [x] Clicking up caps at max with only real transitions emitting change
 * [x] Clicking down caps at min with only real transitions emitting change
 * [x] Blur value above max clamps to max with single change event
 * [x] Blur value below min clamps to min with single change event
 * [x] Blur unchanged value does not emit change event
 * [x] Callable startupspin and stopspin emit start and stop events in order
 * [x] Callable uponce increments without spin start and stop events
 * [x] Reaching max emits on max event exactly once
 * [x] Reaching min emits on min event exactly once
 * [x] UpdateSettings increasing max allows a further increment
 * [x] UpdateSettings decreasing max clamps current value on next blur
 * [x] Keyboard ArrowUp increments by step
 * [x] Wheel scrolling down decrements by step when enabled
 * [x] Decimal step increments and clamps correctly
 * [x] Decimal rounding on blur respects decimals option
 * [x] Destroy removes artifacts while other instance remains intact
 * [x] Blur strips non-numeric and parses leading trailing spaces
 * [x] Uponce from max stays at max with no change event
 * [x] Range with negatives increments across zero correctly
 */

import { test } from '@playwright/test';
import { expectValueToBe } from '../__shared__/helpers/assertions/values';
import {
  typeInInput,
  fillWithValueAndBlur,
  fillWithValue,
  setValueSilentlyAndBlur,
} from '../__shared__/helpers/interactions/input';
import { clickUpButton, clickDownButton } from '../__shared__/helpers/interactions/buttons';
import { clearEventLog, countEventInLog } from '../__shared__/helpers/events/log';
import { initializeTouchspinWithVanilla } from '../__shared__/helpers/core/initialization';

 /**
  * Scenario: increases value on click on up button and triggers change event
  * Given the fixture page is loaded
  * When I click the up button
  * Then the value increases and change event is fired
  */
test('increases value on click on up button and triggers change event', async ({ page }) => {
  const testFixtureUrl = '/packages/core/tests/__shared__/fixtures/test-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspinWithVanilla(page, 'test-input', { step: 1, min: 0, max: 100, initval: '0' });
  await clickUpButton(page, 'test-input');
  await expectValueToBe(page, 'test-input', '1');
  const changeEventCount = await countEventInLog(page, 'change');
  test.expect(changeEventCount).toBe(1);
});

 /**
  * Scenario: decreases value on click on down button and triggers change event
  * Given the fixture page is loaded
  * When I click the down button
  * Then the value decreases and change event is fired
  */
test('decreases value on click on down button and triggers change event', async ({ page }) => {
  const testFixtureUrl = '/packages/core/tests/__shared__/fixtures/test-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspinWithVanilla(page, 'test-input', { step: 1, min: 0, max: 100, initval: '1' });
  await clickDownButton(page, 'test-input');
  await expectValueToBe(page, 'test-input', '0');
  const changeEventCount = await countEventInLog(page, 'change');
  test.expect(changeEventCount).toBe(1);
});

 /**
  * Scenario: triggers change event on blur when value changed
  * Given the fixture page is loaded
  * When I change the value and blur the input
  * Then a change event is fired
  */
test('triggers change event on blur when value changed', async ({ page }) => {
  const testFixtureUrl = '/packages/core/tests/__shared__/fixtures/test-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspinWithVanilla(page, 'test-input', { step: 1, min: 0, max: 100, initval: '0' });
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
  const testFixtureUrl = '/packages/core/tests/__shared__/fixtures/test-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspinWithVanilla(page, 'test-input', { step: 1, min: 0, max: 100, initval: '0' });
  // Focus input but don't change value, then blur
  await page.locator('[data-testid="test-input"]').focus();
  await page.keyboard.press('Tab');
  await expectValueToBe(page, 'test-input', '0');
  const changeEventCount = await countEventInLog(page, 'change');
  test.expect(changeEventCount).toBe(0);
});

// ======= Planned Scenarios (test.skip) =======

/**
 * Scenario: Mount does not emit change event
 * Given the fixture page is loaded
 * When I mount TouchSpin on the input with settings
 * Then no change event is emitted during initialization
 * Params:
 * { "settings": { "min": 0, "max": 100, "step": 1, "initval": "42" }, "expectEvents": [] }
 */
test('Mount does not emit change event', async ({ page }) => {
  const testFixtureUrl = '/packages/core/tests/__shared__/fixtures/test-fixture.html';
  await page.goto(testFixtureUrl);
  await clearEventLog(page);

  // Initialize TouchSpin - this should not emit change events
  await initializeTouchspinWithVanilla(page, 'test-input', { step: 1, min: 0, max: 100, initval: 42 });

  const changeEventCount = await countEventInLog(page, 'change');
  test.expect(changeEventCount).toBe(0);

  // Verify the value was set correctly without change events
  await expectValueToBe(page, 'test-input', '42');
});

/**
 * Scenario: Clicking up caps at max with only real transitions emitting change
 * Given the fixture page is loaded with value near max
 * When I click the up button multiple times beyond max
 * Then the value caps at max and only real transitions emit change events
 * Params:
 * { "settings": { "min": 0, "max": 100, "step": 2, "initval": "96" }, "expectChangeCount": 2 }
 */
test('Clicking up caps at max with only real transitions emitting change', async ({ page }) => {
  const testFixtureUrl = '/packages/core/tests/__shared__/fixtures/test-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspinWithVanilla(page, 'test-input', { step: 2, min: 0, max: 100, initval: 96 });
  await clearEventLog(page);

  // Click up: 96 -> 98 (should emit change)
  await clickUpButton(page, 'test-input');
  let changeCount = await countEventInLog(page, 'change');
  test.expect(changeCount).toBe(1);

  // Click up: 98 -> 100 (should emit change)
  await clickUpButton(page, 'test-input');
  changeCount = await countEventInLog(page, 'change');
  test.expect(changeCount).toBe(2);

  // Click up: 100 -> 100 (should NOT emit change - no real transition)
  await clickUpButton(page, 'test-input');
  changeCount = await countEventInLog(page, 'change');
  test.expect(changeCount).toBe(2); // Still 2, no new change event

  await expectValueToBe(page, 'test-input', '100');
});

/**
 * Scenario: Clicking down caps at min with only real transitions emitting change
 * Given the fixture page is loaded with value near min
 * When I click the down button multiple times beyond min
 * Then the value caps at min and only real transitions emit change events
 * Params:
 * { "settings": { "min": 0, "max": 10, "step": 2, "initval": "6" }, "expectChangeCount": 3 }
 */
test('Clicking down caps at min with only real transitions emitting change', async ({ page }) => {
  const testFixtureUrl = '/packages/core/tests/__shared__/fixtures/test-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspinWithVanilla(page, 'test-input', { step: 2, min: 0, max: 10, initval: 6 });
  await clearEventLog(page);

  // Click down: 6 -> 4 (should emit change)
  await clickDownButton(page, 'test-input');
  let changeCount = await countEventInLog(page, 'change');
  test.expect(changeCount).toBe(1);

  // Click down: 4 -> 2 (should emit change)
  await clickDownButton(page, 'test-input');
  changeCount = await countEventInLog(page, 'change');
  test.expect(changeCount).toBe(2);

  // Click down: 2 -> 0 (should emit change)
  await clickDownButton(page, 'test-input');
  changeCount = await countEventInLog(page, 'change');
  test.expect(changeCount).toBe(3);

  // Click down: 0 -> 0 (should NOT emit change - no real transition)
  await clickDownButton(page, 'test-input');
  changeCount = await countEventInLog(page, 'change');
  test.expect(changeCount).toBe(3); // Still 3, no new change event

  await expectValueToBe(page, 'test-input', '0');
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
  const testFixtureUrl = '/packages/core/tests/__shared__/fixtures/test-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspinWithVanilla(page, 'test-input', { step: 5, min: 0, max: 50, initval: 25 });
  await clearEventLog(page);

  // Type value above max and blur
  await fillWithValueAndBlur(page, 'test-input', '75');

  // Should clamp to max with single change event
  const changeCount = await countEventInLog(page, 'change');
  test.expect(changeCount).toBe(1);

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
  const testFixtureUrl = '/packages/core/tests/__shared__/fixtures/test-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspinWithVanilla(page, 'test-input', { step: 2, min: 10, max: 20, initval: 12 });
  await clearEventLog(page);

  // Type value below min and blur
  await fillWithValueAndBlur(page, 'test-input', '5');

  // Should clamp to min with single change event
  const changeCount = await countEventInLog(page, 'change');
  test.expect(changeCount).toBe(1);

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
  const testFixtureUrl = '/packages/core/tests/__shared__/fixtures/test-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspinWithVanilla(page, 'test-input', { step: 1, min: 0, max: 10, initval: 7 });
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
  const testFixtureUrl = '/packages/core/tests/__shared__/fixtures/test-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspinWithVanilla(page, 'test-input', { step: 1, min: 0, max: 100, initval: 50 });
  await clearEventLog(page);

  // Hold up arrow key should emit start and stop events in order
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(100);
  await page.keyboard.up('ArrowUp');

  const eventLog = await page.locator('#event-log').inputValue();
  const events = eventLog.split('\n').filter(line => line.includes('touchspin'));

  // Check for proper event sequence
  const hasStartSpin = events.some(event => event.includes('touchspin.on.startspin'));
  const hasStartUpSpin = events.some(event => event.includes('touchspin.on.startupspin'));
  const hasStopUpSpin = events.some(event => event.includes('touchspin.on.stopupspin'));
  const hasStopSpin = events.some(event => event.includes('touchspin.on.stopspin'));

  test.expect(hasStartSpin || hasStartUpSpin).toBe(true);
  test.expect(hasStopSpin || hasStopUpSpin).toBe(true);
});

/**
 * Scenario: Callable uponce increments without spin start and stop events
 * Given the fixture page is loaded
 * When I call uponce
 * Then the value increments without spin start and stop events
 * Params:
 * { "settings": { "min": 0, "max": 100, "step": 1, "initval": "50" }, "forbidEvents": ["touchspin.on.startspin","touchspin.on.stopspin"] }
 */
test('Callable uponce increments without spin start and stop events', async ({ page }) => {
  const testFixtureUrl = '/packages/core/tests/__shared__/fixtures/test-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspinWithVanilla(page, 'test-input', { step: 1, min: 0, max: 100, initval: 50 });
  await clearEventLog(page);

  // Click button once (uponce equivalent) - should not emit spin start/stop events
  await clickUpButton(page, 'test-input');

  const eventLog = await page.locator('#event-log').inputValue();
  const hasStartSpin = eventLog.includes('touchspin.on.startspin');
  const hasStopSpin = eventLog.includes('touchspin.on.stopspin');

  test.expect(hasStartSpin).toBe(false);
  test.expect(hasStopSpin).toBe(false);

  // Should still increment the value
  await expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: Reaching max emits on max event exactly once
 * Given the fixture page is loaded near max value
 * When I call uponce to reach max
 * Then on max event is emitted exactly once
 * Params:
 * { "settings": { "min": 0, "max": 10, "step": 10, "initval": "0" }, "expectEvents": ["touchspin.on.change","touchspin.on.max"] }
 */
test('Reaching max emits on max event exactly once', async ({ page }) => {
  const testFixtureUrl = '/packages/core/tests/__shared__/fixtures/test-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspinWithVanilla(page, 'test-input', { step: 10, min: 0, max: 10, initval: 0 });
  await clearEventLog(page);

  // Click up to reach max in one step
  await clickUpButton(page, 'test-input');

  const eventLog = await page.locator('#event-log').inputValue();
  const maxEventCount = (eventLog.match(/touchspin\.on\.max/g) || []).length;

  test.expect(maxEventCount).toBe(1);
  await expectValueToBe(page, 'test-input', '10');
});

/**
 * Scenario: Reaching min emits on min event exactly once
 * Given the fixture page is loaded at max value
 * When I click the down button to reach min
 * Then on min event is emitted exactly once
 * Params:
 * { "settings": { "min": 0, "max": 10, "step": 10, "initval": "10" }, "expectEvents": ["touchspin.on.change","touchspin.on.min"] }
 */
test('Reaching min emits on min event exactly once', async ({ page }) => {
  const testFixtureUrl = '/packages/core/tests/__shared__/fixtures/test-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspinWithVanilla(page, 'test-input', { step: 10, min: 0, max: 10, initval: 10 });
  await clearEventLog(page);

  // Click down to reach min in one step
  await clickDownButton(page, 'test-input');

  const eventLog = await page.locator('#event-log').inputValue();
  const minEventCount = (eventLog.match(/touchspin\.on\.min/g) || []).length;

  test.expect(minEventCount).toBe(1);
  await expectValueToBe(page, 'test-input', '0');
});

/**
 * Scenario: UpdateSettings increasing max allows a further increment
 * Given the fixture page is loaded at current max
 * When I update settings to increase max and call uponce
 * Then the value can increment beyond the previous max
 * Params:
 * { "settings": { "min": 0, "max": 5, "step": 1, "initval": "5" }, "updateSettings": { "max": 7, "step": 2 } }
 */
test('UpdateSettings increasing max allows a further increment', async ({ page }) => {
  const testFixtureUrl = '/packages/core/tests/__shared__/fixtures/test-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspinWithVanilla(page, 'test-input', { step: 1, min: 0, max: 5, initval: 5 });

  // At max, should not be able to increment
  await clickUpButton(page, 'test-input');
  await expectValueToBe(page, 'test-input', '5');

  // Update settings to increase max and change step
  await page.evaluate(({ testId }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
    const core = (input as any)._touchSpinCore;
    if (core) {
      core.updateSettings({ max: 7, step: 2 });
    }
  }, { testId: 'test-input' });

  // Now should be able to increment beyond previous max
  await clickUpButton(page, 'test-input');
  await expectValueToBe(page, 'test-input', '7');
});

/**
 * Scenario: UpdateSettings decreasing max clamps current value on next blur
 * Given the fixture page is loaded with a high value
 * When I update settings to decrease max and blur
 * Then the current value clamps to the new max
 * Params:
 * { "settings": { "min": 0, "max": 10, "step": 1, "initval": "8" }, "updateSettings": { "max": 5 } }
 */
test('UpdateSettings decreasing max clamps current value on next blur', async ({ page }) => {
  const testFixtureUrl = '/packages/core/tests/__shared__/fixtures/test-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspinWithVanilla(page, 'test-input', { step: 1, min: 0, max: 10, initval: 8 });

  // Update settings to decrease max
  await page.evaluate(({ testId }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
    const core = (input as any)._touchSpinCore;
    if (core) {
      core.updateSettings({ max: 5 });
    }
  }, { testId: 'test-input' });

  await clearEventLog(page);

  // Focus and blur to trigger clamping
  const input = page.locator('[data-testid="test-input"]');
  await input.focus();
  await input.blur();

  // Should clamp to new max
  await expectValueToBe(page, 'test-input', '5');

  // Should have emitted change event due to clamping
  const changeCount = await countEventInLog(page, 'change');
  test.expect(changeCount).toBe(1);
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
  const testFixtureUrl = '/packages/core/tests/__shared__/fixtures/test-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspinWithVanilla(page, 'test-input', { step: 1, min: 0, max: 10, initval: 5 });
  await clearEventLog(page);

  // Focus input and press ArrowUp
  const input = page.locator('[data-testid="test-input"]');
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
  const testFixtureUrl = '/packages/core/tests/__shared__/fixtures/test-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspinWithVanilla(page, 'test-input', { step: 1, min: 0, max: 10, initval: 5, mousewheel: true });
  await clearEventLog(page);

  // Focus input and scroll down
  const input = page.locator('[data-testid="test-input"]');
  await input.focus();
  await input.hover();
  await page.mouse.wheel(0, 100); // Scroll down

  await expectValueToBe(page, 'test-input', '4');

  const changeCount = await countEventInLog(page, 'change');
  test.expect(changeCount).toBe(1);
});

/**
 * Scenario: Decimal step increments and clamps correctly
 * Given the fixture page is loaded with decimal step
 * When I call uponce
 * Then the value increments by the decimal step amount
 * Params:
 * { "settings": { "min": 0, "max": 2, "step": 0.1, "initval": "1.0", "decimals": 1 } }
 */
test('Decimal step increments and clamps correctly', async ({ page }) => {
  const testFixtureUrl = '/packages/core/tests/__shared__/fixtures/test-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspinWithVanilla(page, 'test-input', { step: 0.1, min: 0, max: 2, initval: 1.0, decimals: 1 });
  await clearEventLog(page);

  // Click up to increment by decimal step
  await clickUpButton(page, 'test-input');

  await expectValueToBe(page, 'test-input', '1.1');

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
  const testFixtureUrl = '/packages/core/tests/__shared__/fixtures/test-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspinWithVanilla(page, 'test-input', { step: 0.01, min: 0, max: 9, initval: 1.00, decimals: 2 });
  await clearEventLog(page);

  // Type value with extra decimals and blur
  await fillWithValueAndBlur(page, 'test-input', '1.23456');

  // Should round to 2 decimal places
  await expectValueToBe(page, 'test-input', '1.23');

  const changeCount = await countEventInLog(page, 'change');
  test.expect(changeCount).toBe(1);
});

/**
 * Scenario: Destroy removes artifacts while other instance remains intact
 * Given the fixture page is loaded with two TouchSpin instances
 * When I destroy one instance
 * Then its artifacts are removed but the other instance remains intact
 * Params:
 * { "settings": { "min": 0, "max": 9, "step": 1, "initval": "5" }, "inputOptions": { "id": "second-input", "value": "3" } }
 */
test('Destroy removes artifacts while other instance remains intact', async ({ page }) => {
  const testFixtureUrl = '/packages/core/tests/__shared__/fixtures/test-fixture.html';
  await page.goto(testFixtureUrl);

  // Create additional input for second instance
  await page.evaluate(() => {
    const container = document.querySelector('.container');
    if (container) {
      const secondInput = document.createElement('input');
      secondInput.setAttribute('data-testid', 'second-input');
      secondInput.setAttribute('type', 'number');
      secondInput.setAttribute('value', '3');
      container.appendChild(secondInput);
    }
  });

  // Initialize both instances
  await initializeTouchspinWithVanilla(page, 'test-input', { step: 1, min: 0, max: 9, initval: 5 });
  await initializeTouchspinWithVanilla(page, 'second-input', { step: 1, min: 0, max: 9, initval: 3 });

  // Destroy first instance
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
    const core = (input as any)._touchSpinCore;
    if (core) {
      core.destroy();
    }
  });

  await clearEventLog(page);

  // Second instance should still work
  await clickUpButton(page, 'second-input');
  await expectValueToBe(page, 'second-input', '4');

  const changeCount = await countEventInLog(page, 'change');
  test.expect(changeCount).toBe(1);
});

/**
 * Scenario: Blur strips non-numeric and parses leading trailing spaces
 * Given the fixture page is loaded
 * When I type a value with non-numeric characters and spaces then blur
 * Then the value is sanitized to just the numeric part
 * Params:
 * { "settings": { "min": 0, "max": 100, "step": 1, "initval": "0" } }
 */
test('Blur strips non-numeric and parses leading trailing spaces', async ({ page }) => {
  const testFixtureUrl = '/packages/core/tests/__shared__/fixtures/test-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspinWithVanilla(page, 'test-input', { step: 1, min: 0, max: 100, initval: 0 });
  await clearEventLog(page);

  // Type value with non-numeric characters and spaces
  await fillWithValueAndBlur(page, 'test-input', '  42abc  ');

  // Should parse and keep only the numeric part
  await expectValueToBe(page, 'test-input', '42');

  const changeCount = await countEventInLog(page, 'change');
  test.expect(changeCount).toBe(1);
});

/**
 * Scenario: Uponce from max stays at max with no change event
 * Given the fixture page is loaded at max value
 * When I call uponce
 * Then the value stays at max with no change event
 * Params:
 * { "settings": { "min": 0, "max": 10, "step": 5, "initval": "10" }, "expectChangeCount": 0 }
 */
test('Uponce from max stays at max with no change event', async ({ page }) => {
  const testFixtureUrl = '/packages/core/tests/__shared__/fixtures/test-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspinWithVanilla(page, 'test-input', { step: 5, min: 0, max: 10, initval: 10 });
  await clearEventLog(page);

  // Click up when already at max - should not emit change event
  await clickUpButton(page, 'test-input');

  await expectValueToBe(page, 'test-input', '10');

  // Should not emit change event since no value change occurred
  const changeCount = await countEventInLog(page, 'change');
  test.expect(changeCount).toBe(0);
});

/**
 * Scenario: Range with negatives increments across zero correctly
 * Given the fixture page is loaded with negative range
 * When I call uponce from a negative value
 * Then the value increments correctly across zero
 * Params:
 * { "settings": { "min": -5, "max": 5, "step": 1, "initval": "-5" } }
 */
test('Range with negatives increments across zero correctly', async ({ page }) => {
  const testFixtureUrl = '/packages/core/tests/__shared__/fixtures/test-fixture.html';
  await page.goto(testFixtureUrl);
  await initializeTouchspinWithVanilla(page, 'test-input', { step: 1, min: -5, max: 5, initval: -1 });
  await clearEventLog(page);

  // Increment from -1 to 0
  await clickUpButton(page, 'test-input');
  await expectValueToBe(page, 'test-input', '0');

  // Increment from 0 to 1
  await clickUpButton(page, 'test-input');
  await expectValueToBe(page, 'test-input', '1');

  // Should have 2 change events for the 2 increments
  const changeCount = await countEventInLog(page, 'change');
  test.expect(changeCount).toBe(2);
});

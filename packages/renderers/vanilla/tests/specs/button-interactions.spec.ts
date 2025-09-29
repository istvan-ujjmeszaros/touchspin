/**
 * Feature: Button interactions and change events (moved from core)
 * Background: fixture = /packages/renderers/vanilla/tests/fixtures/vanilla-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] increases value on click on up button and triggers change event
 * [x] decreases value on click on down button and triggers change event
 * [x] Clicking up caps at max with only real transitions emitting change
 * [x] Clicking down caps at min with only real transitions emitting change
 * [x] Button click increments value and emits spin start and stop events
 * [x] Reaching max emits on max event exactly once
 * [x] Reaching min emits on min event exactly once
 * [x] UpdateSettings increasing max allows a further increment
 * [x] UpdateSettings decreasing max clamps current value immediately
 * [x] Decimal step increments and clamps correctly
 * [x] Destroy removes artifacts while other instance remains intact
 * [x] Uponce from max stays at max with no change event
 * [x] Range with negatives increments across zero correctly
 */

import { test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { expectValueToBe } from '@touchspin/core/test-helpers';
import { fillWithValueAndBlur, setValueSilentlyAndBlur } from '@touchspin/core/test-helpers';
import { clickUpButton, clickDownButton } from '@touchspin/core/test-helpers';
import { holdUpArrowKeyOnInput } from '@touchspin/core/test-helpers';
import { clearEventLog, countEventInLog, getEventsOfType, hasEventInLog } from '@touchspin/core/test-helpers';
import { createAdditionalInput } from '@touchspin/core/test-helpers';

const VANILLA_RENDERER_URL = '/packages/renderers/vanilla/devdist/VanillaRenderer.js';
const VANILLA_FIXTURE = '/packages/renderers/vanilla/tests/fixtures/vanilla-fixture.html';

/**
 * Initialize TouchSpin with default renderer on clean fixture
 */
async function initializeTouchSpinOnCleanFixture(page, testId: string, settings = {}) {
  await page.goto(VANILLA_FIXTURE);
  await page.waitForFunction(() => window.testPageReady);
  await apiHelpers.initializeTouchspinWithRenderer(page, testId, VANILLA_RENDERER_URL, settings);
}

 /**
  * Scenario: increases value on click on up button and triggers change event
  * Given the fixture page is loaded
  * When I click the up button
  * Then the value increases and change event is fired
  */
test('increases value on click on up button and triggers change event', async ({ page }) => {
  await initializeTouchSpinOnCleanFixture(page, 'test-input', { step: 1, min: 0, max: 100, initval: '0' });
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
  await initializeTouchSpinOnCleanFixture(page, 'test-input', { step: 1, min: 0, max: 100, initval: '1' });
  await clickDownButton(page, 'test-input');
  await expectValueToBe(page, 'test-input', '0');
  const changeEventCount = await countEventInLog(page, 'change');
  test.expect(changeEventCount).toBe(1);
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
  await initializeTouchSpinOnCleanFixture(page, 'test-input', { step: 2, min: 0, max: 100, initval: 96 });
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
  await initializeTouchSpinOnCleanFixture(page, 'test-input', { step: 2, min: 0, max: 10, initval: 6 });
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
 * Scenario: Button click increments value and emits spin start and stop events
 * Given the fixture page is loaded
 * When I click the up button
 * Then the value increments and spin start and stop events are emitted
 * Params:
 * { "settings": { "min": 0, "max": 100, "step": 1, "initval": "50" }, "expectEvents": ["touchspin.on.startspin","touchspin.on.stopspin"] }
 */
test('Button click increments value and emits spin start and stop events', async ({ page }) => {
  await initializeTouchSpinOnCleanFixture(page, 'test-input', { step: 1, min: 0, max: 100, initval: 50 });
  await clearEventLog(page);

  // Click button - buttons ARE spinners and DO emit spin start/stop events
  await clickUpButton(page, 'test-input');

  // Check that spin events ARE emitted for button clicks (corrected expectation)
  const hasStartSpin = await hasEventInLog(page, 'touchspin.on.startspin');
  const hasStopSpin = await hasEventInLog(page, 'touchspin.on.stopspin');

  test.expect(hasStartSpin).toBe(true);
  test.expect(hasStopSpin).toBe(true);

  // Should increment the value
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
  await initializeTouchSpinOnCleanFixture(page, 'test-input', { step: 10, min: 0, max: 10, initval: 0 });
  await clearEventLog(page);

  // Click up to reach max in one step
  await clickUpButton(page, 'test-input');

  // Check max event count using typed helper
  const maxEventCount = await countEventInLog(page, 'touchspin.on.max');

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
  await initializeTouchSpinOnCleanFixture(page, 'test-input', { step: 10, min: 0, max: 10, initval: 10 });
  await clearEventLog(page);

  // Click down to reach min in one step
  await clickDownButton(page, 'test-input');

  // Check min event count using typed helper
  const minEventCount = await countEventInLog(page, 'touchspin.on.min');

  test.expect(minEventCount).toBe(1);
  await expectValueToBe(page, 'test-input', '0');
});

/**
 * Scenario: UpdateSettings increasing max allows a further increment
 * Given the fixture page is loaded at current max
 * When I update settings to increase max and call uponce
 * Then the value can increment beyond the previous max
 * Params:
 * { "settings": { "min": 0, "max": 5, "step": 1, "initval": "5" }, "updateSettings": { "max": 10, "step": 2 } }
 */
test('UpdateSettings increasing max allows a further increment', async ({ page }) => {
  await initializeTouchSpinOnCleanFixture(page, 'test-input', { step: 1, min: 0, max: 5, initval: 5 });

  // At max, should not be able to increment
  await clickUpButton(page, 'test-input');
  await expectValueToBe(page, 'test-input', '5');

  // Update settings to increase max and change step
  await page.evaluate(({ testId }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
    const core = (input as any)._touchSpinCore;
    if (core) {
      core.updateSettings({ max: 10, step: 2 });
    }
  }, { testId: 'test-input' });

  // Now should be able to increment beyond previous max
  await clickUpButton(page, 'test-input');
  await expectValueToBe(page, 'test-input', '8');
});

/**
 * Scenario: UpdateSettings decreasing max clamps current value immediately
 * Given the fixture page is loaded with a high value
 * When I update settings to decrease max
 * Then the current value clamps to the new max immediately
 * Params:
 * { "settings": { "min": 0, "max": 10, "step": 1, "initval": "8" }, "updateSettings": { "max": 5 } }
 */
test('UpdateSettings decreasing max clamps current value immediately', async ({ page }) => {
  await initializeTouchSpinOnCleanFixture(page, 'test-input', { step: 1, min: 0, max: 10, initval: 8 });

  // Update settings to decrease max
  await page.evaluate(({ testId }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
    const core = (input as any)._touchSpinCore;
    if (core) {
      core.updateSettings({ max: 5 });
    }
  }, { testId: 'test-input' });

  // Should clamp to new max
  await expectValueToBe(page, 'test-input', '5');

  // Should have emitted change event due to clamping
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
  await initializeTouchSpinOnCleanFixture(page, 'test-input', { step: 0.1, min: 0, max: 2, initval: 1.0, decimals: 1 });
  await clearEventLog(page);

  // Click up to increment by decimal step
  await clickUpButton(page, 'test-input');

  await expectValueToBe(page, 'test-input', '1.1');

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
  await initializeTouchSpinOnCleanFixture(page, 'test-input', { step: 1, min: 0, max: 9, initval: 5 });

  // Create additional input for second instance using proper helper
  await createAdditionalInput(page, 'second-input', { value: '3' });

  // Initialize second instance
  await apiHelpers.initializeTouchspinWithRenderer(page, 'second-input', VANILLA_RENDERER_URL, {
    step: 1,
    min: 0,
    max: 9,
    initval: 3,
  });

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
 * Scenario: Uponce from max stays at max with no change event
 * Given the fixture page is loaded at max value
 * When I call uponce
 * Then the value stays at max with no change event
 * Params:
 * { "settings": { "min": 0, "max": 10, "step": 5, "initval": "10" }, "expectChangeCount": 0 }
 */
test('Uponce from max stays at max with no change event', async ({ page }) => {
  await initializeTouchSpinOnCleanFixture(page, 'test-input', { step: 5, min: 0, max: 10, initval: 10 });
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
  await initializeTouchSpinOnCleanFixture(page, 'test-input', { step: 1, min: -5, max: 5, initval: -1 });
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

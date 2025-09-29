/**
 * Feature: Button interaction edge cases (moved from core)
 * Background: fixture = /packages/renderers/vanilla/tests/fixtures/vanilla-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] step=5, init 95: two ups => one change (100)
 * [x] forcestepdivisibility='none', step=5, init 97: two ups => one change (100)
 * [x] at max: up => zero change; at min: down => zero change
 * [x] blur sanitization: raw 96 with step=5 => exactly one change to 95
 */

import { test } from '@playwright/test';
import { expectValueToBe } from '@touchspin/core/test-helpers';
import { clickUpButton, clickDownButton } from '@touchspin/core/test-helpers';
import { fillWithValueAndBlur } from '@touchspin/core/test-helpers';
import { clearEventLog, countEventInLog } from '@touchspin/core/test-helpers';
import * as apiHelpers from '@touchspin/core/test-helpers';

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
 * Scenario: step=5, init 95: two ups => one change (100)
 * Given the fixture page is loaded with step=5 and init value 95
 * When I click up button twice
 * Then value reaches max (100) with only one change event
 */
test('step=5, init 95: two ups => one change (100)', async ({ page }) => {
  await initializeTouchSpinOnCleanFixture(page, 'test-input', { step: 5, min: 0, max: 100, initval: '95' });
  await clearEventLog(page);
  await clickUpButton(page, 'test-input');
  await clickUpButton(page, 'test-input');
  await expectValueToBe(page, 'test-input', '100');
  const count = await countEventInLog(page, 'change');
  test.expect(count).toBe(1);
});

/**
 * Scenario: forcestepdivisibility='none', step=5, init 97: two ups => one change (100)
 * Given the fixture page is loaded with forcestepdivisibility='none', step=5 and init value 97
 * When I click up button twice
 * Then value reaches max (100) with only one change event
 */
test("forcestepdivisibility='none', step=5, init 97: two ups => one change (100)", async ({ page }) => {
  await initializeTouchSpinOnCleanFixture(page, 'test-input', { step: 5, min: 0, max: 100, initval: '97', forcestepdivisibility: 'none' });
  await clearEventLog(page);
  await clickUpButton(page, 'test-input');
  await clickUpButton(page, 'test-input');
  await expectValueToBe(page, 'test-input', '100');
  const count = await countEventInLog(page, 'change');
  test.expect(count).toBe(1);
});

/**
 * Scenario: at max: up => zero change; at min: down => zero change
 * Given the fixture page is loaded at max/min values
 * When I click buttons beyond boundaries
 * Then no change events are emitted
 */
test('at max: up => zero change; at min: down => zero change', async ({ page }) => {
  await initializeTouchSpinOnCleanFixture(page, 'test-input', { step: 5, min: 0, max: 100, initval: '100' });
  await clearEventLog(page);
  await clickUpButton(page, 'test-input');
  const c1 = await countEventInLog(page, 'change');
  test.expect(c1).toBe(0);

  // Min case - reinitialize for clean state
  await apiHelpers.initializeTouchspinWithRenderer(page, 'test-input', VANILLA_RENDERER_URL, {
    step: 5,
    min: 0,
    max: 100,
    initval: '0',
  });

  await clearEventLog(page);
  await clickDownButton(page, 'test-input');
  const c2 = await countEventInLog(page, 'change');
  test.expect(c2).toBe(0);
});

/**
 * Scenario: blur sanitization: raw 96 with step=5 => exactly one change to 95
 * Given the fixture page is loaded with step=5
 * When I type 96 and blur
 * Then value sanitizes to 95 with exactly one change event
 */
test('blur sanitization: raw 96 with step=5 => exactly one change to 95', async ({ page }) => {
  await initializeTouchSpinOnCleanFixture(page, 'test-input', { step: 5, min: 0, max: 100, initval: '90' });
  await clearEventLog(page);
  await fillWithValueAndBlur(page, 'test-input', '96');
  await expectValueToBe(page, 'test-input', '95');
  const count = await countEventInLog(page, 'change');
  test.expect(count).toBe(1);
});

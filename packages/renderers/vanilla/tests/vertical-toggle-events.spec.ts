import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { initializeTouchspinFromGlobals, installDomHelpers } from '@touchspin/core/test-helpers';
import { ensureVanillaGlobals } from './helpers/vanilla-globals';

/**
 * Test: Toggling verticalbuttons multiple times should not duplicate event listeners
 *
 * This test verifies that TouchSpin properly guards against duplicate event
 * listener registration when toggling the verticalbuttons setting multiple times.
 *
 * Bug: If event listeners are re-added on each toggle without cleanup, then
 * toggling 5 times will result in 5+ duplicate listeners, causing each event
 * to fire 5+ times instead of once.
 */
test('toggling verticalbuttons 5 times should not duplicate change events', async ({ page }) => {
  await page.goto('/packages/renderers/vanilla/tests/fixtures/vanilla-fixture.html');
  await ensureVanillaGlobals(page);
  await installDomHelpers(page);

  // Initialize TouchSpin
  await initializeTouchspinFromGlobals(page, 'test-input', {
    min: 0,
    max: 100,
    initval: 50,
    verticalbuttons: false,
  });

  // Toggle verticalbuttons 5 times
  for (let i = 0; i < 5; i++) {
    await page.evaluate((toggleState) => {
      window.__ts?.requireCoreByTestId('test-input').updateSettings({
        verticalbuttons: toggleState % 2 === 1,
      });
    }, i);
  }

  // Clear any events from toggles
  await apiHelpers.clearEventLog(page);

  // Click up button once
  await apiHelpers.clickUpButton(page, 'test-input');

  // Should have exactly 1 change event, not 5+
  const changeEventCount = await apiHelpers.countEventInLog(page, 'change');
  expect(changeEventCount).toBe(1);
});

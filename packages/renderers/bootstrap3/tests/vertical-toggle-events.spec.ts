import { test, expect } from '@playwright/test';

/**
 * Test: Toggling verticalbuttons multiple times should not duplicate event listeners
 *
 * This test verifies that the example page properly guards against duplicate event
 * listener registration when toggling the verticalbuttons setting multiple times.
 *
 * Bug: If event listeners are re-added on each toggle without cleanup, then
 * toggling 5 times will result in 5+ duplicate listeners, causing each event
 * to fire 5+ times instead of once.
 */
test('toggling verticalbuttons 5 times should not duplicate change events', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/example/index.html');

  // Wait for page to be ready
  await page.waitForSelector('#basic-spinner');

  // Toggle verticalbuttons 5 times programmatically
  await page.evaluate(() => {
    const checkbox = document.getElementById('control-vertical') as HTMLInputElement;
    for (let i = 0; i < 5; i++) {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  // Wait a bit for any async operations to complete
  await page.waitForTimeout(100);

  // Clear event log to start fresh
  await page.evaluate(() => {
    const logContent = document.getElementById('event-log-content');
    if (logContent) {
      logContent.innerHTML = '';
    }
  });

  // Click the up button once
  await page.click('[data-touchspin-injected="up"]');

  // Wait for events to fire
  await page.waitForTimeout(100);

  // Count how many 'change' events were logged
  const changeEventCount = await page.evaluate(() => {
    const logContent = document.getElementById('event-log-content');
    if (!logContent) return 0;

    const entries = Array.from(logContent.querySelectorAll('.event-entry'));
    return entries.filter((entry) => entry.textContent?.includes('change')).length;
  });

  // Should have exactly 1 change event, not 5+
  expect(changeEventCount).toBe(1);
});

import { test } from '@playwright/test';
import { installJqueryPlugin, initializeTouchspinJQuery } from '@touchspin/jquery-plugin/test-helpers';
import { startCoverage, collectCoverage } from '@touchspin/core/test-helpers/test-utilities/coverage';
import { clickUpButton, clickDownButton } from '@touchspin/core/test-helpers/interactions/buttons';
import { clearEventLog, countEventInLog } from '@touchspin/core/test-helpers/events/log';
import { expectValueToBe } from '@touchspin/core/test-helpers/assertions/values';

test.describe('jQuery plugin: change event emission edge cases', () => {
  test.beforeEach(async ({ page }) => {
    await startCoverage(page);
  });
  test.afterEach(async ({ page }, testInfo) => {
    await collectCoverage(page, testInfo.title);
  });

  test('step=5, init 95: two ups => one change (100)', async ({ page }) => {
    await page.goto('/packages/core/tests/html/test-fixture.html');
    await installJqueryPlugin(page);
    await initializeTouchspinJQuery(page, 'test-input', { step: 5, min: 0, max: 100, initval: 95 });
    await clearEventLog(page);
    await clickUpButton(page, 'test-input');
    await clickUpButton(page, 'test-input');
    await expectValueToBe(page, 'test-input', '100');
    const count = await countEventInLog(page, 'change');
    test.expect(count).toBe(1);
  });

  test("forcestepdivisibility='none', step=5, init 97: two ups => one change (100)", async ({ page }) => {
    await page.goto('/packages/core/tests/html/test-fixture.html');
    await installJqueryPlugin(page);
    await initializeTouchspinJQuery(page, 'test-input', { step: 5, min: 0, max: 100, initval: 97, forcestepdivisibility: 'none' });
    await clearEventLog(page);
    await clickUpButton(page, 'test-input');
    await clickUpButton(page, 'test-input');
    await expectValueToBe(page, 'test-input', '100');
    const count = await countEventInLog(page, 'change');
    test.expect(count).toBe(1);
  });

  test('at max/min boundary: no change duplicates', async ({ page }) => {
    await page.goto('/packages/core/tests/html/test-fixture.html');
    await installJqueryPlugin(page);

    await initializeTouchspinJQuery(page, 'test-input', { step: 5, min: 0, max: 100, initval: 100 });
    await clearEventLog(page);
    await clickUpButton(page, 'test-input');
    const c1 = await countEventInLog(page, 'change');
    test.expect(c1).toBe(0);

    await initializeTouchspinJQuery(page, 'test-input', { step: 5, min: 0, max: 100, initval: 0 });
    await clearEventLog(page);
    await clickDownButton(page, 'test-input');
    const c2 = await countEventInLog(page, 'change');
    test.expect(c2).toBe(0);
  });
});


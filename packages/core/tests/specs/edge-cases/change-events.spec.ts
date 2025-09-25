import { test } from '@playwright/test';
import { startCoverage, collectCoverage } from '../../__shared__/helpers/test-utilities/coverage';
import { initializeTouchspinWithVanilla } from '../../__shared__/helpers/core/initialization';
import { clickUpButton, clickDownButton } from '../../__shared__/helpers/interactions/buttons';
import { fillWithValueAndBlur } from '../../__shared__/helpers/interactions/input';
import { clearEventLog, countEventInLog } from '../../__shared__/helpers/events/log';
import { expectValueToBe } from '../../__shared__/helpers/assertions/values';

test.describe('Core change event emission edge cases (Vanilla renderer)', () => {
  test.beforeEach(async ({ page }) => {
    await startCoverage(page);
  });
  test.afterEach(async ({ page }, testInfo) => {
    await collectCoverage(page, testInfo.title);
  });

  test('step=5, init 95: two ups => one change (100)', async ({ page }) => {
    await page.goto('/packages/core/tests/__shared__/fixtures/test-fixture.html');
    await initializeTouchspinWithVanilla(page, 'test-input', { step: 5, min: 0, max: 100, initval: '95' });
    await clearEventLog(page);
    await clickUpButton(page, 'test-input');
    await clickUpButton(page, 'test-input');
    await expectValueToBe(page, 'test-input', '100');
    const count = await countEventInLog(page, 'change');
    test.expect(count).toBe(1);
  });

  test("forcestepdivisibility='none', step=5, init 97: two ups => one change (100)", async ({ page }) => {
    await page.goto('/packages/core/tests/__shared__/fixtures/test-fixture.html');
    await initializeTouchspinWithVanilla(page, 'test-input', { step: 5, min: 0, max: 100, initval: '97', forcestepdivisibility: 'none' });
    await clearEventLog(page);
    await clickUpButton(page, 'test-input');
    await clickUpButton(page, 'test-input');
    await expectValueToBe(page, 'test-input', '100');
    const count = await countEventInLog(page, 'change');
    test.expect(count).toBe(1);
  });

  test('at max: up => zero change; at min: down => zero change', async ({ page }) => {
    await page.goto('/packages/core/tests/__shared__/fixtures/test-fixture.html');

    // Max case
    await initializeTouchspinWithVanilla(page, 'test-input', { step: 5, min: 0, max: 100, initval: '100' });
    await clearEventLog(page);
    await clickUpButton(page, 'test-input');
    const c1 = await countEventInLog(page, 'change');
    test.expect(c1).toBe(0);

    // Min case
    await initializeTouchspinWithVanilla(page, 'test-input', { step: 5, min: 0, max: 100, initval: '0' });
    await clearEventLog(page);
    await clickDownButton(page, 'test-input');
    const c2 = await countEventInLog(page, 'change');
    test.expect(c2).toBe(0);
  });

  test('blur sanitization: raw 96 with step=5 => exactly one change to 95', async ({ page }) => {
    await page.goto('/packages/core/tests/__shared__/fixtures/test-fixture.html');
    await initializeTouchspinWithVanilla(page, 'test-input', { step: 5, min: 0, max: 100, initval: '90' });
    await clearEventLog(page);
    await fillWithValueAndBlur(page, 'test-input', '96');
    await expectValueToBe(page, 'test-input', '95');
    const count = await countEventInLog(page, 'change');
    test.expect(count).toBe(1);
  });
});

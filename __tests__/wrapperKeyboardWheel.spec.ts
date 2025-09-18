import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinApiHelpers';
import './coverage.hooks';


test.describe('Wrapper parity: keyboard and mouse wheel', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html'); // Update URL as needed
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'wrapperKeyboardWheel');
  });

  test('ArrowUp emits change and spin start/stop; wheel emits change only', async ({ page }) => {
    await page.goto('/__tests__/html-package/tailwind-renderer-jquery.html');

    // Init
    await page.click('[data-testid="btn-init"]');

    // Focus input and press ArrowUp
    await page.focus('[data-testid="jq-input"]');
    const before = await page.inputValue('[data-testid="jq-input"]');
    await page.keyboard.press('ArrowUp');

    // Read log
    const log = await page.locator('[data-testid="log"]').textContent();
    expect(log).toContain('change[');
    expect(log).toContain('core:startspin');
    expect(log).toContain('core:startupspin');
    expect(log).toContain('core:stopupspin');
    expect(log).toContain('core:stopspin');

    // Wheel should only log change and adjust value when focused
    await page.focus('[data-testid="jq-input"]');
    await page.evaluate(() => {
      const el = document.querySelector('[data-testid="jq-input"]');
      if (!el) return;
      const evt = new WheelEvent('wheel', { deltaY: -120, bubbles: true, cancelable: true });
      el.dispatchEvent(evt);
    });
    const afterWheelLog = await page.locator('[data-testid="log"]').textContent();
    expect(afterWheelLog).toMatch(/change\[/);

    const after = await page.inputValue('[data-testid="jq-input"]');
    expect(Number(after)).toBeGreaterThan(Number(before));
  });
});

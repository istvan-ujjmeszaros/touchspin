import { test, expect } from '@playwright/test';

test.describe('Wrapper parity: keyboard and mouse wheel', () => {
  test('ArrowUp emits change and spin start/stop; wheel emits change only', async ({ page }) => {
    await page.goto('/__tests__/html-package/tailwind-renderer-jquery.html');

    // Init
    await page.click('#btn-init');

    // Focus input and press ArrowUp
    await page.focus('#jq-input');
    const before = await page.inputValue('#jq-input');
    await page.keyboard.press('ArrowUp');

    // Read log
    const log = await page.locator('#log').textContent();
    expect(log).toContain('change[');
    expect(log).toContain('core:startspin');
    expect(log).toContain('core:startupspin');
    expect(log).toContain('core:stopupspin');
    expect(log).toContain('core:stopspin');

    // Wheel should only log change and adjust value when focused
    await page.focus('#jq-input');
    await page.evaluate(() => {
      const el = document.getElementById('jq-input');
      if (!el) return;
      const evt = new WheelEvent('wheel', { deltaY: -120, bubbles: true, cancelable: true });
      el.dispatchEvent(evt);
    });
    const afterWheelLog = await page.locator('#log').textContent();
    expect(afterWheelLog).toMatch(/change\[/);

    const after = await page.inputValue('#jq-input');
    expect(Number(after)).toBeGreaterThan(Number(before));
  });
});

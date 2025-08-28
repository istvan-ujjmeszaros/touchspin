import { test, expect } from '@playwright/test';

test.describe('A/B parity: original src vs wrapper', () => {
  test('ArrowUp once produces same events pattern and value step', async ({ page }) => {
    await page.goto('/__tests__/html-package/ab-compare.html');

    // Init both sides
    await page.click('#orig-init');
    await page.click('#wrap-init');

    const getVal = (sel: string) => page.inputValue(sel);
    const getLog = (sel: string) => page.locator(sel).textContent();

    const origBefore = Number(await getVal('#orig-input'));
    const wrapBefore = Number(await getVal('#wrap-input'));

    // Press ArrowUp once on each side
    await page.focus('#orig-input');
    await page.keyboard.press('ArrowUp');
    await page.focus('#wrap-input');
    await page.keyboard.press('ArrowUp');

    const origAfter = Number(await getVal('#orig-input'));
    const wrapAfter = Number(await getVal('#wrap-input'));

    expect(origAfter - origBefore).toBe(1);
    expect(wrapAfter - wrapBefore).toBe(1);

    const origLog = await getLog('#orig-log') || '';
    const wrapLog = await getLog('#wrap-log') || '';

    // Both should contain the same event markers for a quick tap
    [origLog, wrapLog].forEach((log) => {
      expect(log).toMatch(/change\[/);
      expect(log).toContain('startspin');
      expect(log).toContain('startupspin');
      expect(log).toContain('stopupspin');
      expect(log).toContain('stopspin');
    });
  });
});

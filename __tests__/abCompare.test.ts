import { test, expect } from '@playwright/test';

test.describe('A/B parity: original src vs wrapper', () => {
  test('ArrowUp once produces same events pattern and value step', async ({ page }) => {
    await page.goto('/__tests__/html-package/ab-compare.html');

    // Init both sides using test IDs
    await page.click('[data-testid="orig-init"]');
    await page.click('[data-testid="wrap-init"]');

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

    expect(origAfter - origBefore).toBe(5); // step:5 configured
    expect(wrapAfter - wrapBefore).toBe(5); // step:5 configured

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

  test('Typing 77 shows 77 until blur, then snaps to 75 (step enforcement)', async ({ page }) => {
    await page.goto('/__tests__/html-package/ab-compare.html');

    // Init both sides using test IDs
    await page.click('[data-testid="orig-init"]');
    await page.click('[data-testid="wrap-init"]');

    // Type 77 in left input without leaving focus
    await page.focus('#orig-input');
    await page.keyboard.press('Control+a');
    await page.keyboard.type('77');
    const leftBeforeBlur = await page.inputValue('#orig-input');
    expect(leftBeforeBlur).toBe('77'); // Should show 77 while typing

    // Type 77 in right input without leaving focus
    await page.focus('#wrap-input');
    await page.keyboard.press('Control+a');
    await page.keyboard.type('77');
    const rightBeforeBlur = await page.inputValue('#wrap-input');
    expect(rightBeforeBlur).toBe('77'); // Should show 77 while typing

    // Check left again after blur (when focus moved to right)
    const leftAfterBlur = await page.inputValue('#orig-input');
    expect(leftAfterBlur).toBe('75'); // Should have snapped to 75 on blur

    // Click back in left input to trigger blur on right
    await page.focus('#orig-input');
    
    // Check right after blur
    const rightAfterBlur = await page.inputValue('#wrap-input');
    expect(rightAfterBlur).toBe('75'); // Should have snapped to 75 on blur
  });

  test('Pressing Enter after typing 77 should sanitize to 75 (step enforcement)', async ({ page }) => {
    await page.goto('/__tests__/html-package/ab-compare.html');

    // Init both sides using test IDs
    await page.click('[data-testid="orig-init"]');
    await page.click('[data-testid="wrap-init"]');

    // Test left input: Type 77 and press Enter
    await page.focus('#orig-input');
    await page.keyboard.press('Control+a');
    await page.keyboard.type('77');
    await page.keyboard.press('Enter');
    const leftAfterEnter = await page.inputValue('#orig-input');
    expect(leftAfterEnter).toBe('75'); // Should snap to 75 on Enter

    // Test right input: Type 77 and press Enter
    await page.focus('#wrap-input');
    await page.keyboard.press('Control+a');
    await page.keyboard.type('77');
    await page.keyboard.press('Enter');
    const rightAfterEnter = await page.inputValue('#wrap-input');
    expect(rightAfterEnter).toBe('75'); // Should snap to 75 on Enter
  });
});

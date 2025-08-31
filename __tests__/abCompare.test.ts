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

  test('Typing 7 at end of existing value 40 should result in 407 → 100 (max clamp) with single change event', async ({ page }) => {
    await page.goto('/__tests__/html-package/ab-compare.html');

    // Init both sides using test IDs (42 will be corrected to 40 due to step:5)
    await page.click('[data-testid="orig-init"]');
    await page.click('[data-testid="wrap-init"]');

    // Verify both inputs were corrected to 40 after initialization
    const leftAfterInit = await page.inputValue('#orig-input');
    const rightAfterInit = await page.inputValue('#wrap-input');
    expect(leftAfterInit).toBe('40'); // 42 corrected to nearest step boundary
    expect(rightAfterInit).toBe('40'); // 42 corrected to nearest step boundary

    // Clear logs after initialization
    await page.evaluate(() => {
      const origLog = document.getElementById('orig-log');
      const wrapLog = document.getElementById('wrap-log');
      if (origLog) origLog.textContent = '';
      if (wrapLog) wrapLog.textContent = '';
    });

    // Click at end of left input (after "40") and type "7"
    await page.click('#orig-input');
    await page.keyboard.press('End'); // Ensure cursor is at end
    await page.keyboard.type('7');
    const leftBeforeBlur = await page.inputValue('#orig-input');
    expect(leftBeforeBlur).toBe('407'); // Should show 407 while typing

    // Click at end of right input (after "40") and type "7"
    await page.click('#wrap-input');
    await page.keyboard.press('End'); // Ensure cursor is at end  
    await page.keyboard.type('7');
    const rightBeforeBlur = await page.inputValue('#wrap-input');
    expect(rightBeforeBlur).toBe('407'); // Should show 407 while typing

    // Blur both inputs by clicking elsewhere
    await page.click('h1'); // Click on page title to blur
    
    const leftAfterBlur = await page.inputValue('#orig-input');
    const rightAfterBlur = await page.inputValue('#wrap-input');
    
    // Both should clamp to max value 100
    expect(leftAfterBlur).toBe('100');
    expect(rightAfterBlur).toBe('100');

    // Check event logs - both should have exactly one change event with value 100
    const getLog = (sel: string) => page.locator(sel).textContent();
    const origLog = await getLog('#orig-log') || '';
    const wrapLog = await getLog('#wrap-log') || '';

    // Both logs should contain exactly one change event showing the max value
    expect(origLog).toContain('change[100]');
    expect(wrapLog).toContain('change[100]');

    // Should not contain multiple change events (count occurrences of 'change[')
    const origChangeCount = (origLog.match(/change\[/g) || []).length;
    const wrapChangeCount = (wrapLog.match(/change\[/g) || []).length;
    
    expect(origChangeCount).toBe(1);
    expect(wrapChangeCount).toBe(1);
  });
});

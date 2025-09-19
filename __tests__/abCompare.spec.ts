import { test, expect } from '@playwright/test';
import * as apiHelpers from './helpers/touchspinApiHelpers';
import './coverage.hooks';


test.describe('A/B parity: original src vs wrapper', () => {

  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html'); // Update URL as needed
  });

  test.afterEach(async ({ page }) => {
    await apiHelpers.collectCoverage(page, 'abCompare');
  });

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
    await apiHelpers.pressUpArrowKeyOnInput(page, testid);
    await page.focus('#wrap-input');
    await apiHelpers.pressUpArrowKeyOnInput(page, testid);

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

  test('Typing 77 after initial 40 creates 4077, Enter should sanitize to 100 with single change event', async ({ page }) => {
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

    // Test left input: Click, type "77", press Enter without blurring
    await page.click('#orig-input');
    await page.keyboard.type('77');
    const leftBeforeEnter = await page.inputValue('#orig-input');
    expect(leftBeforeEnter).toBe('4077'); // Should show 4077 after typing

    await page.keyboard.press('Enter');
    const leftAfterEnter = await page.inputValue('#orig-input');
    expect(leftAfterEnter).toBe('100'); // Should clamp to max 100

    // Test right input: Click, type "77", press Enter without blurring
    await page.click('#wrap-input');
    await page.keyboard.type('77');
    const rightBeforeEnter = await page.inputValue('#wrap-input');
    expect(rightBeforeEnter).toBe('4077'); // Should show 4077 after typing

    await page.keyboard.press('Enter');
    const rightAfterEnter = await page.inputValue('#wrap-input');
    expect(rightAfterEnter).toBe('100'); // Should clamp to max 100

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

  test('Min boundary events fire when clicking down to reach min and at min boundary', async ({ page }) => {
    await page.goto('/__tests__/html-package/ab-compare.html');

    // Init both sides with min:0, max:100, step:5 (42 will become 40)
    await page.click('[data-testid="orig-init"]');
    await page.click('[data-testid="wrap-init"]');

    // Set up event tracking arrays
    await page.evaluate(() => {
      (window as any).origEvents = [];
      (window as any).wrapEvents = [];

      const $ = (window as any).jQuery;
      const $orig = $('#orig-input');
      const $wrap = $('#wrap-input');

      // Track min/max and change events in order
      $orig.on('touchspin.on.min', () => (window as any).origEvents.push('min.on'));
      $orig.on('touchspin.on.max', () => (window as any).origEvents.push('max.on'));
      $orig.on('change', () => (window as any).origEvents.push('change[' + $orig.val() + ']'));

      $wrap.on('touchspin.on.min', () => (window as any).wrapEvents.push('min.on'));
      $wrap.on('touchspin.on.max', () => (window as any).wrapEvents.push('max.on'));
      $wrap.on('change', () => (window as any).wrapEvents.push('change[' + $wrap.val() + ']'));
    });

    // Use API to decrement 8 times to reach min (40→35→30→25→20→15→10→5→0)
    await page.evaluate(() => {
      const $ = (window as any).jQuery;
      const $orig = $('#orig-input');
      const $wrap = $('#wrap-input');
      for (let i = 0; i < 8; i++) {
        $orig.trigger('touchspin.downonce');
        $wrap.trigger('touchspin.downonce');
      }
    });

    // Get events after reaching min
    let events = await page.evaluate(() => ({
      orig: (window as any).origEvents,
      wrap: (window as any).wrapEvents
    }));

    // Both should have fired min.on event when reaching min
    expect(events.orig).toContain('min.on');
    expect(events.wrap).toContain('min.on');

    // Both should have change[0] event
    expect(events.orig).toContain('change[0]');
    expect(events.wrap).toContain('change[0]');

    // Clear events for boundary test
    await page.evaluate(() => {
      (window as any).origEvents = [];
      (window as any).wrapEvents = [];
    });

    // Click down once more at min boundary - should fire min.on again
    await page.click('[data-testid="orig-down"]');
    await page.click('[data-testid="wrap-down"]');

    events = await page.evaluate(() => ({
      orig: (window as any).origEvents,
      wrap: (window as any).wrapEvents
    }));

    // Both should fire min.on event even when already at min boundary
    expect(events.orig).toContain('min.on');
    expect(events.wrap).toContain('min.on');

    // Should NOT have change events (value didn't change)
    expect(events.orig.filter(e => e.startsWith('change'))).toHaveLength(0);
    expect(events.wrap.filter(e => e.startsWith('change'))).toHaveLength(0);
  });

  test('Max boundary events fire when clicking up to reach max and at max boundary', async ({ page }) => {
    await page.goto('/__tests__/html-package/ab-compare.html');

    // Init both sides with min:0, max:100, step:5 (42 will become 40)
    await page.click('[data-testid="orig-init"]');
    await page.click('[data-testid="wrap-init"]');

    // Set up event tracking arrays
    await page.evaluate(() => {
      (window as any).origEvents = [];
      (window as any).wrapEvents = [];

      const $ = (window as any).jQuery;
      const $orig = $('#orig-input');
      const $wrap = $('#wrap-input');

      // Track min/max and change events in order
      $orig.on('touchspin.on.min', () => (window as any).origEvents.push('min.on'));
      $orig.on('touchspin.on.max', () => (window as any).origEvents.push('max.on'));
      $orig.on('change', () => (window as any).origEvents.push('change[' + $orig.val() + ']'));

      $wrap.on('touchspin.on.min', () => (window as any).wrapEvents.push('min.on'));
      $wrap.on('touchspin.on.max', () => (window as any).wrapEvents.push('max.on'));
      $wrap.on('change', () => (window as any).wrapEvents.push('change[' + $wrap.val() + ']'));
    });

    // Use API to increment 12 times to reach max (40→45→50→55→60→65→70→75→80→85→90→95→100)
    await page.evaluate(() => {
      const $ = (window as any).jQuery;
      const $orig = $('#orig-input');
      const $wrap = $('#wrap-input');

      // Use API calls instead of clicking for speed and reliability
      for (let i = 0; i < 12; i++) {
        $orig.trigger('touchspin.uponce');
        $wrap.trigger('touchspin.uponce');
      }
    });

    // Get events after reaching max
    let events = await page.evaluate(() => ({
      orig: (window as any).origEvents,
      wrap: (window as any).wrapEvents
    }));

    // Both should have fired max.on event when reaching max
    expect(events.orig).toContain('max.on');
    expect(events.wrap).toContain('max.on');

    // Both should have change[100] event
    expect(events.orig).toContain('change[100]');
    expect(events.wrap).toContain('change[100]');

    // Clear events for boundary test
    await page.evaluate(() => {
      (window as any).origEvents = [];
      (window as any).wrapEvents = [];
    });

    // Click up once more at max boundary - should fire max.on again
    await page.click('[data-testid="orig-up"]');
    await page.click('[data-testid="wrap-up"]');

    events = await page.evaluate(() => ({
      orig: (window as any).origEvents,
      wrap: (window as any).wrapEvents
    }));

    // Both should fire max.on event even when already at max boundary
    expect(events.orig).toContain('max.on');
    expect(events.wrap).toContain('max.on');

    // Should NOT have change events (value didn't change)
    expect(events.orig.filter(e => e.startsWith('change'))).toHaveLength(0);
    expect(events.wrap.filter(e => e.startsWith('change'))).toHaveLength(0);
  });

  test('Min/Max events fire before change events (correct ordering)', async ({ page }) => {
    await page.goto('/__tests__/html-package/ab-compare.html');

    // Init both sides
    await page.click('[data-testid="orig-init"]');
    await page.click('[data-testid="wrap-init"]');

    // Set up event tracking arrays
    await page.evaluate(() => {
      (window as any).origEvents = [];
      (window as any).wrapEvents = [];

      const $ = (window as any).jQuery;
      const $orig = $('#orig-input');
      const $wrap = $('#wrap-input');

      // Track events in order they fire
      $orig.on('touchspin.on.min', () => (window as any).origEvents.push('min.on'));
      $orig.on('touchspin.on.max', () => (window as any).origEvents.push('max.on'));
      $orig.on('change', () => (window as any).origEvents.push('change[' + $orig.val() + ']'));

      $wrap.on('touchspin.on.min', () => (window as any).wrapEvents.push('min.on'));
      $wrap.on('touchspin.on.max', () => (window as any).wrapEvents.push('max.on'));
      $wrap.on('change', () => (window as any).wrapEvents.push('change[' + $wrap.val() + ']'));
    });

    // Use API to decrement 7 times to reach near min (40→35→30→25→20→15→10→5)
    await page.evaluate(() => {
      const $ = (window as any).jQuery;
      const $orig = $('#orig-input');
      const $wrap = $('#wrap-input');

      // Use API calls instead of clicking for speed and reliability
      for (let i = 0; i < 7; i++) {
        $orig.trigger('touchspin.downonce');
        $wrap.trigger('touchspin.downonce');
      }
    });

    // Clear events, then click down once more to reach min and test ordering
    await page.evaluate(() => {
      (window as any).origEvents = [];
      (window as any).wrapEvents = [];
    });

    // Click down once more to reach min (5→0) - should trigger min.on BEFORE change
    await page.click('[data-testid="orig-down"]');
    await page.click('[data-testid="wrap-down"]');

    const events = await page.evaluate(() => ({
      orig: (window as any).origEvents,
      wrap: (window as any).wrapEvents
    }));

    // Both should have both min.on and change events
    expect(events.orig).toContain('min.on');
    expect(events.orig).toContain('change[0]');
    expect(events.wrap).toContain('min.on');
    expect(events.wrap).toContain('change[0]');

    // Check event ordering: min.on should come before change
    const origMinIndex = events.orig.indexOf('min.on');
    const origChangeIndex = events.orig.indexOf('change[0]');
    const wrapMinIndex = events.wrap.indexOf('min.on');
    const wrapChangeIndex = events.wrap.indexOf('change[0]');

    expect(origMinIndex).toBeLessThan(origChangeIndex); // min.on before change for original
    expect(wrapMinIndex).toBeLessThan(wrapChangeIndex); // min.on before change for wrapper
  });
});

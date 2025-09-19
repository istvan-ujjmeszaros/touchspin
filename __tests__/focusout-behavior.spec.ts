import { test, expect } from '@playwright/test';
import * as apiHelpers from './helpers/touchspinApiHelpers';
import './coverage.hooks';

test.describe('Focus and Outside Click Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html');
  });

  test.afterEach(async ({ page }) => {
    await apiHelpers.collectCoverage(page, 'focusout-behavior');
  });

  test('clicking body without leaving widget does not sanitize', async ({ page }) => {
    const testid = 'touchspin-default';

    await apiHelpers.fillWithValue(page, testid, '3');

    // Clicking the document body should not sanitize since focus remains on the input
    await page.click('body');
    const finalValue = await apiHelpers.readInputValue(page, testid);
    expect(finalValue).toBe('3');
  });

  test('sanity: no touchspin doc-level listeners (post-refactor)', async ({ page }) => {
    const res = await page.evaluate(() => {
      const $ = (window as any).jQuery;
      const _data = ($ as any)?._data;
      if (!_data) return { ok: true, note: 'no _data available' };

      const ev = _data(document, 'events') || {};
      const names = (type: string) => (ev[type] || []).map((h: any) => h.namespace || '');
      const anyTs = (names('mousedown').concat(names('touchstart'))).some((n: string) => n.includes('touchspin'));
      return { ok: !anyTs, note: anyTs ? 'found touchspin handlers' : 'none' };
    });

    expect(res.ok).toBeTruthy();
  });

  test('NEW TARGET: focus moving within widget should not sanitize', async ({ page }) => {
    const testid = 'touchspin-default';

    // Type invalid value
    await apiHelpers.fillWithValue(page, testid, '3');

    // Focus the up button explicitly (within the same widget)
    await apiHelpers.focusUpButton(page, testid);

    // Should NOT sanitize because we're still within the widget
    const valueAfterFocusButton = await apiHelpers.readInputValue(page, testid);
    expect(valueAfterFocusButton).toBe('3'); // Should stay unsanitized
  });

  test('NEW TARGET: leaving widget completely should sanitize', async ({ page }) => {
    const testid = 'touchspin-default';

    // Type invalid value
    await apiHelpers.fillWithValue(page, testid, '3');

    // Focus outside the widget
    await apiHelpers.focusOutside(page, 'touchspin-group-lg');

    // Compute expected sanitized value based on runtime step
    const { step, decimals, divisibility } = await page.evaluate(() => {
      const $ = (window as any).jQuery;
      const $inp = $('[data-testid="touchspin-default"]');
      const s = Number($inp.attr('step') || 1);
      const d = Number($inp.attr('data-bts-decimals') || 0) || 0;
      const f = $inp.data('bts-force-step-divisibility') || 'round';
      return { step: s, decimals: d, divisibility: f };
    });

    const expected = (() => {
      const val = 3;
      switch (divisibility) {
        case 'floor': return (Math.floor(val / step) * step).toFixed(decimals);
        case 'ceil':  return (Math.ceil(val / step) * step).toFixed(decimals);
        default:      return (Math.round(val / step) * step).toFixed(decimals);
      }
    })();

    // Use expect.poll for async sanitization timing
    await expect.poll(async () => apiHelpers.readInputValue(page, testid)).toBe(expected);
  });

  test('BEHAVIOR: change fires for button spins and sanitize, not updatesettings', async ({ page }) => {
    const testid = 'touchspin-default';

    await page.evaluate((testid) => {
      const $ = (window as any).jQuery;
      (window as any).chg = 0;
      const $inp = $(`[data-testid="${testid}"]`);
      $inp.off('.test').on('change.test', () => (window as any).chg++);
    }, testid);

    // Sanitization (outside focus) SHOULD count now
    await apiHelpers.fillWithValue(page, testid, '3');
    await apiHelpers.focusOutside(page, 'touchspin-group-lg');
    await expect.poll(() => page.evaluate(() => (window as any).chg)).toBe(1);

    // updatesettings should NOT count
    await page.evaluate((testid) => {
      const $ = (window as any).jQuery;
      $(`[data-testid="${testid}"]`).trigger('touchspin.updatesettings', { max: 10 });
    }, testid);
    expect(await page.evaluate(() => (window as any).chg)).toBe(1);

    // Button click SHOULD add one more
    await apiHelpers.clickUpButton(page, testid);
    expect(await page.evaluate(() => (window as any).chg)).toBe(2);
  });

  test('CLEANUP BEHAVIOR: destroy should remove all listeners', async ({ page }) => {
    const testid = 'touchspin-default';

    // Initialize and then destroy
    await page.evaluate((testid) => {
      const $ = (window as any).jQuery;
      const input = $(`[data-testid="${testid}"]`);
      (input as any).trigger('touchspin.destroy');
    }, testid);

    // After destroy, outside clicks should NOT trigger sanitization
    await apiHelpers.fillWithValue(page, testid, '3');
    await page.click('body');

    const valueAfterDestroy = await apiHelpers.readInputValue(page, testid);
    expect(valueAfterDestroy).toBe('3'); // Should stay unchanged
  });

  test('replacementval on empty input emits change once', async ({ page }) => {
    const testid = 'touchspin-default';

    await page.evaluate((testid) => {
      const $ = (window as any).jQuery;
      const $inp = $(`[data-testid="${testid}"]`);
      (window as any).chg = 0;
      $inp.off('.test').on('change.test', () => (window as any).chg++);
      // Update settings to use replacementval
      $inp.trigger('touchspin.updatesettings', { replacementval: '0' });

      // Set input to empty (like user deleting all text)
      $inp.val('');
    }, testid);

    // Focus the input first, then focus outside to trigger focusout
    const input = page.getByTestId(testid);
    await input.focus();
    await apiHelpers.focusOutside(page, 'touchspin-group-lg');

    // Allow the deferred focusout commit to run
    await apiHelpers.waitForTimeout(0);

    await expect.poll(() => page.evaluate(() => (window as any).chg)).toBe(1);
    expect(await apiHelpers.readInputValue(page, testid)).toBe('0');
  });
});

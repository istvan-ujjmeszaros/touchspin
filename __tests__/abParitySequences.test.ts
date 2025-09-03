import {test, expect} from '@playwright/test';

async function clearLogs(page) {
  await page.evaluate(() => {
    const o = document.getElementById('orig-log');
    const w = document.getElementById('wrap-log');
    if (o) o.textContent = '';
    if (w) w.textContent = '';
  });
}

async function initBoth(page, opts: any) {
  await page.evaluate((o) => {
    const $ = (window as any).jQuery;
    const $orig = $('[data-testid="ab-orig"]');
    const $wrap = $('[data-testid="ab-wrap"]');
    try {
      $orig.trigger('touchspin.destroy');
    } catch {
    }
    try {
      $wrap.trigger('touchspin.destroy');
    } catch {
    }
    $orig.OriginalTouchSpin(o);
    $wrap.TouchSpin(Object.assign({renderer: (window as any).Bootstrap4Renderer}, o));
  }, opts);
}

async function getVals(page) {
  const [orig, wrap] = await Promise.all([
    page.getByTestId('ab-orig').inputValue(),
    page.getByTestId('ab-wrap').inputValue(),
  ]);
  return {orig: Number(orig), wrap: Number(wrap)};
}

test.describe('A/B parity sequences', () => {
  test('boundary hold and disabled parity', async ({page}, testInfo) => {
    // Increase time budget for this multi-phase sequence
    testInfo.setTimeout(15000);
    page.setDefaultTimeout(5000);
    await page.goto('/__tests__/html-package/ab-compare.html');
    await clearLogs(page);

    // Jump to near max and hold to boundary (deterministic timings)
    await initBoth(page, {min: 0, max: 100, step: 5, stepinterval: 20, stepintervaldelay: 10, booster: false});
    await page.evaluate(() => {
      const $ = (window as any).jQuery;
      const $o = $('[data-testid="ab-orig"]');
      const $w = $('[data-testid="ab-wrap"]');
      // Set values directly for both plugins; original v4.7.3 lacks a 'set' command
      $o.val('95').trigger('change');
      $w.TouchSpin('set', 95);
      $o.trigger('touchspin.startupspin');
      $w.trigger('touchspin.startupspin');
      // Safety: ensure we stop even if boundary auto-stop timing differs across engines
      setTimeout(() => {
        $o.trigger('touchspin.stopspin');
        $w.trigger('touchspin.stopspin');
      }, 800);
    });
    // Wait for boundary clamp to 100 on both using testids (robust in CI)
    await expect(page.getByTestId('ab-orig')).toHaveValue('100', {timeout: 6000});
    await expect(page.getByTestId('ab-wrap')).toHaveValue('100', {timeout: 6000});

    // Disable both and ensure ArrowUp does not change values
    await page.evaluate(() => {
      const $ = (window as any).jQuery;
      const $o = $('[data-testid="ab-orig"]');
      const $w = $('[data-testid="ab-wrap"]');
      $o.attr('disabled', '');
      $w.attr('disabled', '');
    });
    const before = await getVals(page);
    await page.getByTestId('ab-orig').focus();
    await page.keyboard.press('ArrowUp');
    await page.getByTestId('ab-wrap').focus();
    await page.keyboard.press('ArrowUp');
    const after = await getVals(page);
    expect(after.orig).toBe(before.orig);
    expect(after.wrap).toBe(before.wrap);
  });
});

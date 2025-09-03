import { test, expect } from '@playwright/test';

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
    const $orig = $('#orig-input');
    const $wrap = $('#wrap-input');
    try { $orig.trigger('touchspin.destroy'); } catch {}
    try { $wrap.trigger('touchspin.destroy'); } catch {}
    $orig.OriginalTouchSpin(o);
    $wrap.TouchSpin(Object.assign({renderer: (window as any).Bootstrap4Renderer}, o));
  }, opts);
}

async function getVals(page) {
  const [orig, wrap] = await Promise.all([
    page.inputValue('#orig-input'),
    page.inputValue('#wrap-input'),
  ]);
  return { orig: Number(orig), wrap: Number(wrap) };
}

test.describe('A/B parity sequences', () => {
  test('boundary hold and disabled parity', async ({ page }) => {
    await page.goto('/__tests__/html-package/ab-compare.html');
    await clearLogs(page);

    // Fast timings to keep tests snappy
    await initBoth(page, { min: 0, max: 100, step: 1, stepinterval: 40, stepintervaldelay: 40, booster: true });

    // Hold Up on both for a short duration
    await page.evaluate(() => {
      const $ = (window as any).jQuery;
      const $orig = $('#orig-input');
      const $wrap = $('#wrap-input');
      $orig.trigger('touchspin.startupspin');
      $wrap.trigger('touchspin.startupspin');
      setTimeout(() => { $orig.trigger('touchspin.stopspin'); $wrap.trigger('touchspin.stopspin'); }, 200);
    });
    // Wait for spin to complete and values to stabilize
    await page.waitForFunction(() => {
      const orig = (document.getElementById('orig-input') as HTMLInputElement)?.value;
      const wrap = (document.getElementById('wrap-input') as HTMLInputElement)?.value;
      return Number(orig) > 0 && Number(wrap) > 0; // Both should have incremented
    }, { timeout: 500 });
    let { orig, wrap } = await getVals(page);
    expect(Math.abs(orig - wrap)).toBeLessThanOrEqual(1); // allow tiny drift

    // Jump to near max and hold to boundary
    // Use deterministic spin timings to reduce flakiness in CI
    await initBoth(page, { min: 0, max: 100, step: 1, stepinterval: 20, stepintervaldelay: 10, booster: false });
    await page.evaluate(() => {
      const $ = (window as any).jQuery; const $o=$('#orig-input'); const $w=$('#wrap-input');
      $o.OriginalTouchSpin('set', 95); $w.TouchSpin('set', 95);
      $o.trigger('touchspin.startupspin'); $w.trigger('touchspin.startupspin');
    });
    await page.waitForFunction(() => {
      const o = (document.getElementById('orig-input') as HTMLInputElement)?.value;
      const w = (document.getElementById('wrap-input') as HTMLInputElement)?.value;
      return o === '100' && w === '100';
    }, { timeout: 4000 });
    ({ orig, wrap } = await getVals(page));
    expect(orig).toBe(100);
    expect(wrap).toBe(100);

    // Disable both and ensure ArrowUp does not change values
    await page.evaluate(() => {
      const $ = (window as any).jQuery; const $o=$('#orig-input'); const $w=$('#wrap-input');
      $o.attr('disabled',''); $w.attr('disabled','');
    });
    const before = await getVals(page);
    await page.focus('#orig-input');
    await page.keyboard.press('ArrowUp');
    await page.focus('#wrap-input');
    await page.keyboard.press('ArrowUp');
    const after = await getVals(page);
    expect(after.orig).toBe(before.orig);
    expect(after.wrap).toBe(before.wrap);
  });
});

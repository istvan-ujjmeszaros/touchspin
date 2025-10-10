import type { Page } from '@playwright/test';
import type { TouchSpinCoreOptions } from '@touchspin/core';
import { installDomHelpers, setupLogging } from '@touchspin/core/test-helpers';

/* ──────────────────────────
 * jQuery plugin bootstrap (for jQuery pages)
 * ────────────────────────── */

export async function installJqueryPlugin(page: Page): Promise<void> {
  // Install core test infrastructure (needed for helper functions)
  await installDomHelpers(page);
  await setupLogging(page);

  // Verify UMD build loaded correctly
  await page.evaluate(() => {
    if (typeof window.jQuery === 'undefined') {
      throw new Error('jQuery is not loaded');
    }
    if (typeof window.jQuery.fn.TouchSpin === 'undefined') {
      throw new Error('TouchSpin jQuery plugin is not loaded');
    }
  });
}

/* ──────────────────────────
 * jQuery init for a single input
 * ────────────────────────── */

export async function initializeTouchspinJQuery(
  page: Page,
  testId: string,
  options: Partial<TouchSpinCoreOptions> = {}
): Promise<void> {
  await installDomHelpers(page);
  await page.evaluate(() => {
    if (!window.__ts) throw new Error('__ts not installed');
  });
  await setupLogging(page);

  await page.evaluate(
    ({ id, opts }) => {
      try {
        // Verify jQuery and TouchSpin are available
        if (typeof window.jQuery === 'undefined') {
          throw new Error('jQuery is not available on window');
        }
        if (typeof window.jQuery.fn.TouchSpin === 'undefined') {
          throw new Error('TouchSpin plugin is not available on jQuery');
        }

        const $ = window.jQuery;
        const $input = $(`[data-testid="${id}"]`);

        if ($input.length === 0) {
          throw new Error(`No element found with testid: ${id}`);
        }

        if ((opts as Record<string, unknown>).initval !== undefined) {
          $input.val((opts as Record<string, unknown>).initval);
        }

        $input.TouchSpin(opts);
      } catch (err) {
        console.error('initializeTouchspinJQuery failed:', err);
        throw err;
      }
    },
    { id: testId, opts: options }
  );

  const sel = [
    `[data-testid="${testId}-wrapper"][data-touchspin-injected]`,
    `[data-testid="${testId}"][data-touchspin-injected]`,
  ].join(', ');
  await page.locator(sel).first().waitFor({ timeout: 5000 });
}

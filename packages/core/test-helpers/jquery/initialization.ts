import type { Page } from '@playwright/test';
import type { TouchSpinCoreOptions } from '../types';
import { setupLogging } from '../events/setup';
import { installDomHelpers } from '../runtime/installDomHelpers';

/* ──────────────────────────
 * jQuery plugin bootstrap (for jQuery pages)
 * ────────────────────────── */

export async function installJqueryPlugin(page: Page): Promise<void> {
  await installDomHelpers(page);
  await page.evaluate(() => { if (!window.__ts) throw new Error('__ts not installed'); });
  await page.evaluate(async () => {
    try {
      const offenders = Array.from(document.querySelectorAll('script[src*="/src/"]')).map(
        (s) => (s as HTMLScriptElement).src
      );
      if (offenders.length) {
        throw new Error('Tests must not load /src/. Use /dist/index.js.\n' + offenders.join('\n'));
      }

      // Import jQuery from node_modules
      const jq = (await import('jquery')) as unknown as { default: unknown };
      const $ = (jq as { default: unknown }).default as unknown;
      const w = window as unknown as Record<string, unknown>;
      if (!w['jQuery']) w['jQuery'] = $;
      if (!w['$']) w['$'] = $;

      const jqueryPluginUrl = '/packages/jquery-plugin/dist/index.js';
      const { installWithRenderer } = (await import(jqueryPluginUrl)) as unknown as {
        installWithRenderer: (renderer: unknown) => void;
      };
      const rendererUrl = '/packages/renderers/bootstrap5/dist/index.js';
      const rendererMod = (await import(rendererUrl)) as unknown as {
        default?: unknown;
        Bootstrap5Renderer?: unknown;
      };
      const Bootstrap5Renderer = (rendererMod.default ?? rendererMod.Bootstrap5Renderer) as unknown;
      installWithRenderer(Bootstrap5Renderer);

      window.touchSpinReady = true;
    } catch (err) {
      console.error('installJqueryPlugin failed:', err);
      throw err;
    }
  });

  // Centralized logging (no jQuery-specific .on wiring)
  await setupLogging(page);
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
  await page.evaluate(() => { if (!window.__ts) throw new Error('__ts not installed'); });
  await setupLogging(page);
  await page.evaluate(({ id, opts }) => {
    try {
      const win = window as unknown as Record<string, unknown>;
      const $ = win['$'] as unknown as {
        (selector: string): { val: (v: unknown) => void; TouchSpin: (o: unknown) => void };
        call?: (thisArg: unknown, selector: string) => { val: (v: unknown) => void; TouchSpin: (o: unknown) => void };
      };
      const $input = $.call ? $.call(null, `[data-testid=\"${id}\"]`) : $(`[data-testid=\"${id}\"]`);
      if ((opts as Record<string, unknown>).initval !== undefined) $input.val((opts as Record<string, unknown>).initval);
      $input.TouchSpin(opts);
    } catch (err) {
      console.error('initializeTouchspinJQuery failed:', err);
      throw err;
    }
  }, { id: testId, opts: options });

  const sel = [
    `[data-testid=\"${testId}-wrapper\"][data-touchspin-injected]`,
    `[data-testid=\"${testId}\"][data-touchspin-injected]`,
  ].join(', ');
  await page.locator(sel).first().waitFor({ timeout: 5000 });
}

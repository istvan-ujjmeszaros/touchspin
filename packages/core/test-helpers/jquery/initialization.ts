import type { Page } from '@playwright/test';
import type { TouchSpinCoreOptions } from '../types';
import { setupLogging } from '../events/setup';

/* ──────────────────────────
 * jQuery plugin bootstrap (for jQuery pages)
 * ────────────────────────── */

export async function installJqueryPlugin(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const offenders = Array.from(document.querySelectorAll('script[src*="/src/"]')).map(
      (s) => (s as HTMLScriptElement).src
    );
    if (offenders.length) {
      throw new Error('Tests must not load /src/. Use /dist/index.js.\n' + offenders.join('\n'));
    }

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
  await setupLogging(page);
  await page.evaluate(({ id, opts }) => {
    const win = window as unknown as Record<string, unknown>;
    const $ = win['$'] as unknown as {
      (selector: string): { val: (v: unknown) => void; TouchSpin: (o: unknown) => void };
      call?: (thisArg: unknown, selector: string) => { val: (v: unknown) => void; TouchSpin: (o: unknown) => void };
    };
    const $input = $.call ? $.call(null, `[data-testid="${id}"]`) : $(`[data-testid="${id}"]`);
    if (opts.initval !== undefined) $input.val(opts.initval);
    $input.TouchSpin(opts);
  }, { id: testId, opts: options });
}

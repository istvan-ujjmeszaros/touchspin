import type { Page } from '@playwright/test';
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

    const { installWithRenderer } = await import('/packages/jquery-plugin/dist/index.js');
    const rendererMod = await import('/packages/renderers/bootstrap5/dist/index.js');
    const Bootstrap5Renderer = (rendererMod as any).default || (rendererMod as any).Bootstrap5Renderer;
    installWithRenderer(Bootstrap5Renderer);

    (window as any).touchSpinReady = true;
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
  options: Record<string, unknown> = {}
): Promise<void> {
  await setupLogging(page);
  await page.evaluate(({ id, opts }) => {
    const $ = (window as any).$;
    const $input = $.call ? $.call(null, `[data-testid="${id}"]`) : $(`[data-testid="${id}"]`);
    if ((opts as any).initval !== undefined) $input.val((opts as any).initval);
    $input.TouchSpin(opts);
  }, { id: testId, opts: options });
}
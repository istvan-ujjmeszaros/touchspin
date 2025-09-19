import type { Page } from '@playwright/test';
import type { TouchSpinCoreOptions, TouchSpinCorePublicAPI } from '../types';
import { inputById } from './selectors';
import { setupLogging } from '../events/setup';
import { installDomHelpers } from '../runtime/installDomHelpers';

/* ──────────────────────────
 * Core (direct) API initialization
 * ────────────────────────── */

export async function initializeTouchspin(
  page: Page,
  testId: string,
  options: Partial<TouchSpinCoreOptions> = {}
): Promise<void> {
  await installDomHelpers(page);
  // Early DX check: ensure namespace exists
  await page.evaluate(() => { if (!window.__ts) throw new Error('__ts not installed'); });
  await setupLogging(page);
  await page.evaluate(async ({ testId, options }) => {
    const url = 'http://localhost:8866/packages/core/dist/index.js';
    const { TouchSpinCore } = (await import(url)) as unknown as {
      TouchSpinCore: new (input: HTMLInputElement, opts: Partial<TouchSpinCoreOptions>) => unknown;
    };
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
    if (!input) throw new Error(`Input with testId "${testId}" not found`);
    if (options.initval !== undefined) input.value = String(options.initval);

    const core = new TouchSpinCore(input, options);
    (input as unknown as Record<string, unknown>)['_touchSpinCore'] = core as unknown;

    // No per-instance listeners here: core will dispatch DOM CustomEvents
    (core as { initDOMEventHandling: () => void }).initDOMEventHandling();
  }, { testId, options });

  const sel = [
    `[data-testid=\"${testId}-wrapper\"][data-touchspin-injected]`,
    `[data-testid=\"${testId}\"][data-touchspin-injected]`,
  ].join(', ');
  await page.locator(sel).first().waitFor({ timeout: 5000 });
}

export async function isCoreInitialized(page: Page, testId: string): Promise<boolean> {
  return page.evaluate(({ testId }) => {
    if (!window.__ts) return false;
    try {
      window.__ts.requireCoreByTestId(testId);
      return true;
    } catch {
      return false;
    }
  }, { testId });
}

export async function initializeTouchspinWithBootstrap5(
  page: Page,
  testId: string,
  options: Partial<TouchSpinCoreOptions> = {}
): Promise<void> {
  await setupLogging(page);
  await page.evaluate(async ({ testId, options }) => {
    const coreUrl = 'http://localhost:8866/packages/core/dist/index.js';
    const rendererUrl = 'http://localhost:8866/packages/renderers/bootstrap5/dist/index.js';
    const { TouchSpinCore } = (await import(coreUrl)) as unknown as {
      TouchSpinCore: new (input: HTMLInputElement, opts: Partial<TouchSpinCoreOptions>) => unknown;
    };
    const rendererMod = (await import(rendererUrl)) as unknown as { default?: unknown; Bootstrap5Renderer?: unknown };
    const Bootstrap5Renderer = (rendererMod.default ?? rendererMod.Bootstrap5Renderer) as unknown;

    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
    if (!input) throw new Error(`Input with testId "${testId}" not found`);
    if ((options as Record<string, unknown>).initval !== undefined) input.value = String((options as Record<string, unknown>).initval);

    const core = new TouchSpinCore(input, { ...options, renderer: Bootstrap5Renderer } as Partial<TouchSpinCoreOptions>);
    (input as unknown as Record<string, unknown>)['_touchSpinCore'] = core as unknown;
    (core as { initDOMEventHandling: () => void }).initDOMEventHandling();
  }, { testId, options });

  const sel2 = [
    `[data-testid=\"${testId}-wrapper\"][data-touchspin-injected]`,
    `[data-testid=\"${testId}\"][data-touchspin-injected]`,
  ].join(', ');
  await page.locator(sel2).first().waitFor({ timeout: 5000 });
}

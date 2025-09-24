import type { Page } from '@playwright/test';
import type { TouchSpinCoreOptions, TouchSpinCorePublicAPI } from '../types';
import { inputById } from './selectors';
import { setupLogging } from '../events/setup';
import { coreUrl as coreRuntimeUrl, vanillaRendererClassUrl } from '../runtime/paths';
import { installDomHelpers } from '../runtime/installDomHelpers';
import { preFetchCheck } from '../test-utilities/network';

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

  // Pre-check that core module is fetchable (better error messages)
  await preFetchCheck(page, coreRuntimeUrl);

  await page.evaluate(async ({ testId, options, coreUrl }) => {
    const origin = (globalThis as any).location?.origin ?? '';
    const url = new URL(coreUrl, origin).href;
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
  }, { testId, options, coreUrl: coreRuntimeUrl });

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
  throw new Error('initializeTouchspinWithBootstrap5 was removed from core test helpers. Use renderer-local helpers instead.');
}

/**
 * Given I mount TouchSpin on "{testId}" with settings
 * Given TouchSpin is initialized on "{testId}" with {settings}
 * @note Uses vanilla renderer for core testing
 */
export async function initializeTouchspinWithVanilla(
  page: Page,
  testId: string,
  options: Partial<TouchSpinCoreOptions> = {}
): Promise<void> {
  await setupLogging(page);
  await page.evaluate(async ({ testId, options, coreUrl, rendererUrl }) => {
    const origin = (globalThis as any).location?.origin ?? '';
    const { TouchSpinCore } = (await import(new URL(coreUrl, origin).href)) as unknown as {
      TouchSpinCore: new (input: HTMLInputElement, opts: Partial<TouchSpinCoreOptions>) => unknown;
    };
    const rendererMod = (await import(new URL(rendererUrl, origin).href)) as unknown as { default?: unknown };
    const VanillaRenderer = rendererMod.default as unknown;

    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
    if (!input) throw new Error(`Input with testId "${testId}" not found`);
    if ((options as Record<string, unknown>).initval !== undefined) input.value = String((options as Record<string, unknown>).initval);

    const core = new TouchSpinCore(input, { ...options, renderer: VanillaRenderer } as Partial<TouchSpinCoreOptions>);
    (input as unknown as Record<string, unknown>)['_touchSpinCore'] = core as unknown;
    (core as { initDOMEventHandling: () => void }).initDOMEventHandling();
  }, { testId, options, coreUrl: coreRuntimeUrl, rendererUrl: vanillaRendererClassUrl });

  const sel2 = [
    `[data-testid=\"${testId}-wrapper\"][data-touchspin-injected]`,
    `[data-testid=\"${testId}\"][data-touchspin-injected]`,
  ].join(', ');
  await page.locator(sel2).first().waitFor({ timeout: 5000 });
}

/* ──────────────────────────
 * Generic renderer initializer (by URL)
 * ────────────────────────── */

export async function initializeTouchspinWithRenderer(
  page: Page,
  testId: string,
  rendererUrl: string,
  options: Partial<TouchSpinCoreOptions> = {},
  exportName?: string
): Promise<void> {
  await setupLogging(page);
  await installDomHelpers(page);

  // Pre-check that modules are fetchable (better error messages)
  await preFetchCheck(page, coreRuntimeUrl);
  await preFetchCheck(page, rendererUrl);

  const coreUrl = coreRuntimeUrl;
  await page.evaluate(async ({ testId, options, rendererUrl, exportName, coreUrl }) => {
    try {
      const origin = (globalThis as any).location?.origin ?? '';

      // Import core module
      const coreModule = (await import(new URL(coreUrl, origin).href)) as unknown as {
        TouchSpinCore: new (input: HTMLInputElement, opts: Partial<TouchSpinCoreOptions>) => unknown;
      };
      const { TouchSpinCore } = coreModule;

      if (!TouchSpinCore) {
        throw new Error(`TouchSpinCore not found in module: ${coreUrl}`);
      }

      // Import renderer module
      const rendererModule = (await import(new URL(rendererUrl, origin).href)) as unknown as Record<string, unknown> & { default?: unknown };
      const Renderer = (exportName ? (rendererModule[exportName] as unknown) : (rendererModule.default as unknown)) ?? rendererModule.default;

      if (!Renderer) {
        throw new Error(`Renderer not found in module: ${rendererUrl} (export: ${exportName || 'default'})`);
      }

      // eslint-disable-next-line -- Required in browser context
      const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
      if (!input) throw new Error(`Input with testId "${testId}" not found`);
      if ((options as Record<string, unknown>).initval !== undefined) input.value = String((options as Record<string, unknown>).initval);

      const core = new TouchSpinCore(input, { ...options, renderer: Renderer } as Partial<TouchSpinCoreOptions>);
      (input as unknown as Record<string, unknown>)['_touchSpinCore'] = core as unknown;
      (core as { initDOMEventHandling: () => void }).initDOMEventHandling();
    } catch (err) {
      console.error('initializeTouchspinWithRenderer failed:', err);
      throw err;
    }
  }, { testId, options, rendererUrl, exportName, coreUrl });

  const sel = [
    `[data-testid=\"${testId}-wrapper\"][data-touchspin-injected]`,
    `[data-testid=\"${testId}\"][data-touchspin-injected]`,
  ].join(', ');
  await page.locator(sel).first().waitFor({ timeout: 5000 });
}

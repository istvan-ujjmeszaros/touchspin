import type { Page } from '@playwright/test';
import type { TouchSpinCoreOptions, TouchSpinCorePublicAPI } from '../types';
import { inputById } from './selectors';
import { setupLogging } from '../events/setup';
import { coreUrl as coreRuntimeUrl } from '../runtime/paths';
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

  try {
    await page.locator(sel).first().waitFor({ timeout: 5000 });
  } catch {
    // No renderer applied; wait until the core instance is registered instead
    await page.waitForFunction((id: string) => {
      try {
        window.__ts?.requireCoreByTestId(id);
        return true;
      } catch {
        return false;
      }
    }, testId, { timeout: 5000 });
  }
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
  await page.waitForFunction(() => (globalThis as unknown as { testPageReady?: unknown }).testPageReady === true, {
    timeout: 2000
  }).catch(() => {
    // Ignore readiness wait failures; fixture may not define testPageReady
  });

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

      // Resolve renderer: prefer module import, but allow fixtures to provide a default renderer globally
      let Renderer: unknown;
      const fallbackRenderer = (globalThis as unknown as { TouchSpinDefaultRenderer?: unknown }).TouchSpinDefaultRenderer;

      if (fallbackRenderer && !exportName) {
        Renderer = fallbackRenderer;
      } else {
        const rendererModule = (await import(new URL(rendererUrl, origin).href)) as unknown as Record<string, unknown> & { default?: unknown };
        Renderer = exportName ? rendererModule[exportName] ?? rendererModule.default : rendererModule.default ?? rendererModule[exportName ?? 'default'];
      }

      if (!Renderer) {
        throw new Error(`Renderer not found (module: ${rendererUrl}, export: ${exportName || 'default'})`);
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

/**
 * Initialize TouchSpin using pre-loaded modules from self-contained fixtures
 *
 * This function is designed for fixtures that have already loaded TouchSpinCore
 * and the renderer onto globalThis.TouchSpinCore and globalThis.TouchSpinDefaultRenderer.
 * It avoids dynamic imports that can cause "Execution context destroyed" errors.
 */
export async function initializeTouchspinWithPreloadedModules(
  page: Page,
  testId: string,
  options: Record<string, unknown> = {}
): Promise<void> {
  await setupLogging(page);
  await installDomHelpers(page);

  await page.evaluate(({ testId, options }) => {
    try {
      // Use pre-loaded modules from the fixture
      const TouchSpinCore = (globalThis as any).TouchSpinCore;
      const Renderer = (globalThis as any).TouchSpinDefaultRenderer;

      if (!TouchSpinCore) {
        throw new Error('TouchSpinCore not found on window. Ensure the fixture has loaded the core module.');
      }

      if (!Renderer) {
        throw new Error('TouchSpinDefaultRenderer not found on window. Ensure the fixture has loaded the renderer module.');
      }

      // eslint-disable-next-line -- Required in browser context
      const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
      if (!input) throw new Error(`Input with testId "${testId}" not found`);
      if ((options as Record<string, unknown>).initval !== undefined) input.value = String((options as Record<string, unknown>).initval);

      const core = new TouchSpinCore(input, { ...options, renderer: Renderer } as any);
      (input as any)['_touchSpinCore'] = core;
      (core as { initDOMEventHandling: () => void }).initDOMEventHandling();
    } catch (err) {
      console.error('initializeTouchspinWithPreloadedModules failed:', err);
      throw err;
    }
  }, { testId, options });

  const sel = [
    `[data-testid=\"${testId}-wrapper\"][data-touchspin-injected]`,
    `[data-testid=\"${testId}\"][data-touchspin-injected]`,
  ].join(', ');
  await page.locator(sel).first().waitFor({ timeout: 5000 });
}

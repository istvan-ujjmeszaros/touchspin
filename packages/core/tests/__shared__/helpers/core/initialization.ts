import type { Page } from '@playwright/test';
import type { TouchSpinCoreOptions, } from '../types';
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
  await page.evaluate(() => {
    if (!window.__ts) throw new Error('__ts not installed');
  });
  await setupLogging(page);

  // Pre-check that core module is fetchable (better error messages)
  await preFetchCheck(page, coreRuntimeUrl);

  await page.evaluate(
    async ({ testId, options, coreUrl }) => {
      const origin = (globalThis as any).location?.origin ?? '';
      const url = new URL(coreUrl, origin).href;
      const { TouchSpinCore } = (await import(url)) as unknown as {
        TouchSpinCore: new (
          input: HTMLInputElement,
          opts: Partial<TouchSpinCoreOptions>
        ) => unknown;
      };
      const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
      if (!input) throw new Error(`Input with testId "${testId}" not found`);
      if (options.initval !== undefined) input.value = String(options.initval);

      const core = new TouchSpinCore(input, options);
      (input as unknown as Record<string, unknown>)._touchSpinCore = core as unknown;

      // No per-instance listeners here: core will dispatch DOM CustomEvents
      (core as { initDOMEventHandling: () => void }).initDOMEventHandling();
    },
    { testId, options, coreUrl: coreRuntimeUrl }
  );

  const sel = [
    `[data-testid="${testId}-wrapper"][data-touchspin-injected]`,
    `[data-testid="${testId}"][data-touchspin-injected]`,
  ].join(', ');

  try {
    await page.locator(sel).first().waitFor({ timeout: 5000 });
  } catch {
    // No renderer applied; wait until the core instance is registered instead
    await page.waitForFunction(
      (id: string) => {
        try {
          window.__ts?.requireCoreByTestId(id);
          return true;
        } catch {
          return false;
        }
      },
      testId,
      { timeout: 5000 }
    );
  }
}

export async function isCoreInitialized(page: Page, testId: string): Promise<boolean> {
  return page.evaluate(
    ({ testId }) => {
      if (!window.__ts) return false;
      try {
        window.__ts.requireCoreByTestId(testId);
        return true;
      } catch {
        return false;
      }
    },
    { testId }
  );
}

// Removed deprecated helpers:
// - initializeTouchspinWithBootstrap5 (use renderer-local helpers)
// - initializeTouchspinWithRenderer (use initializeTouchSpin with globals)

/**
 * Given I mount TouchSpin on "{testId}" with {settings}
 * Given TouchSpin is initialized on "{testId}" with {settings}
 *
 * Initialize TouchSpin from global variables (IIFE bundles or import maps).
 *
 * Core automatically detects `globalThis.TouchSpinDefaultRenderer` if present.
 * If no renderer is found, Core initializes in renderer-free mode (keyboard/wheel only).
 *
 * Works with:
 * - IIFE bundles (Bootstrap/Tailwind) via <script src="touchspin-complete.global.js">
 * - Import maps (Vanilla) that set window.TouchSpinCore and window.TouchSpinDefaultRenderer
 * - Core-only fixtures (no renderer) for API/keyboard/wheel tests
 *
 * @param page - Playwright page object
 * @param testId - data-testid of the input element
 * @param options - TouchSpin configuration options
 *
 * @example
 * ```typescript
 * // Renderer test (Bootstrap/Tailwind/Vanilla):
 * await initializeTouchSpin(page, 'test-input', { step: 5, buttonup_txt: 'UP' });
 *
 * // Core-only test (no renderer):
 * await initializeTouchSpin(page, 'test-input', { step: 5, min: 0, max: 100 });
 * ```
 */
export async function initializeTouchSpin(
  page: Page,
  testId: string,
  options: Record<string, unknown> = {}
): Promise<void> {
  await setupLogging(page);
  await installDomHelpers(page);

  await page.evaluate(
    ({ testId, options }) => {
      try {
        const TouchSpinCore = (globalThis as any).TouchSpinCore;

        if (!TouchSpinCore) {
          throw new Error(
            'TouchSpinCore not found on window. Ensure the fixture has loaded the core module.'
          );
        }

        // eslint-disable-next-line -- Required in browser context
        const input = document.querySelector(
          `[data-testid="${testId}"]`
        ) as HTMLInputElement | null;
        if (!input) throw new Error(`Input with testId "${testId}" not found`);
        if ((options as Record<string, unknown>).initval !== undefined)
          input.value = String((options as Record<string, unknown>).initval);

        // Core automatically checks globalThis.TouchSpinDefaultRenderer and uses it if present
        const core = new TouchSpinCore(input, options);
        (input as any)._touchSpinCore = core;
        (core as { initDOMEventHandling: () => void }).initDOMEventHandling();
      } catch (err) {
        console.error('initializeTouchSpin failed:', err);
        throw err;
      }
    },
    { testId, options }
  );

  // Wait for initialization: try wrapper (with renderer) first, fallback to core registration (no renderer)
  const wrapperSel = [
    `[data-testid="${testId}-wrapper"][data-touchspin-injected]`,
    `[data-testid="${testId}"][data-touchspin-injected]`,
  ].join(', ');

  try {
    await page.locator(wrapperSel).first().waitFor({ timeout: 5000 });
  } catch {
    // No renderer applied; wait until the core instance is registered instead
    await page.waitForFunction(
      (id: string) => {
        try {
          window.__ts?.requireCoreByTestId(id);
          return true;
        } catch {
          return false;
        }
      },
      testId,
      { timeout: 5000 }
    );
  }
}

/**
 * Alias for initializeTouchSpin() - maintained for backward compatibility.
 * Both names are equally valid.
 */
export async function initializeTouchspinFromGlobals(
  page: Page,
  testId: string,
  options: Record<string, unknown> = {}
): Promise<void> {
  return initializeTouchSpin(page, testId, options);
}

import type { Page } from '@playwright/test';
import type { TouchSpinCoreOptions } from '../types';
import { inputById } from './selectors';
import { setupLogging } from '../events/setup';

/* ──────────────────────────
 * Core (direct) API initialization
 * ────────────────────────── */

export async function initializeTouchspin(
  page: Page,
  testId: string,
  options: Partial<TouchSpinCoreOptions> = {}
): Promise<void> {
  await setupLogging(page);
  await page.evaluate(async ({ testId, options }) => {
    const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
    if (!input) throw new Error(`Input with testId "${testId}" not found`);
    if (options.initval !== undefined) input.value = String(options.initval);

    const core = new TouchSpinCore(input, options);
    (input as any)._touchSpinCore = core;

    // No per-instance listeners here: core will dispatch DOM CustomEvents
    core.initDOMEventHandling();
  }, { testId, options });

  await inputById(page, testId).locator('[data-touchspin-injected]').waitFor({ timeout: 5000 });
}

export async function isCoreInitialized(page: Page, testId: string): Promise<boolean> {
  return page.evaluate(({ testId }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
    return !!(input && (input as any)._touchSpinCore);
  }, { testId });
}
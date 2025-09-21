import type { Page } from '@playwright/test';
import type { TouchSpinCoreOptions } from '@touchspin/core';
import { setupLogging, coreUrl as coreRuntimeUrl, rendererClassUrlFor } from '@touchspin/core/test-helpers';

export async function initializeTouchspinWithBootstrap5(
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
    const rendererMod = (await import(new URL(rendererUrl, origin).href)) as unknown as { default?: unknown; Bootstrap5Renderer?: unknown };
    const Bootstrap5Renderer = (rendererMod.default ?? rendererMod.Bootstrap5Renderer) as unknown;

    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
    if (!input) throw new Error(`Input with testId "${testId}" not found`);
    if ((options as Record<string, unknown>).initval !== undefined) input.value = String((options as Record<string, unknown>).initval);

    const core = new TouchSpinCore(input, { ...options, renderer: Bootstrap5Renderer } as Partial<TouchSpinCoreOptions>);
    (input as unknown as Record<string, unknown>)['_touchSpinCore'] = core as unknown;
    (core as { initDOMEventHandling: () => void }).initDOMEventHandling();
  }, { testId, options, coreUrl: coreRuntimeUrl, rendererUrl: rendererClassUrlFor('bootstrap5') });

  const sel2 = [
    `[data-testid=\"${testId}-wrapper\"][data-touchspin-injected]`,
    `[data-testid=\"${testId}\"][data-touchspin-injected]`,
  ].join(', ');
  await page.locator(sel2).first().waitFor({ timeout: 5000 });
}

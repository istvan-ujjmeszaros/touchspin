import type { Page } from '@playwright/test';
import * as helpers from '@touchspin/core/test-helpers';

export const vanillaRendererUrl = helpers.rendererClassUrlFor('vanilla');

export async function ensureVanillaGlobals(page: Page): Promise<void> {
  const coreModuleUrl = helpers.artifactUrlFor('packages/core', 'esmEntry');
  const coreRendererUrl = helpers.artifactUrlFor('packages/core', 'rendererEntry');
  const rendererModuleUrl = vanillaRendererUrl;
  const cssUrl = helpers.rendererArtifactUrlFor('vanilla', 'css');

  const coreEventsUrl = coreModuleUrl?.replace(/index\.js$/, 'events.js');

  if (cssUrl) {
    await helpers.loadStylesheet(page, cssUrl);
  }

  await page.evaluate(
    async ({ coreModuleUrl, coreRendererUrl, coreEventsUrl, rendererModuleUrl }) => {
      const origin = (globalThis as any).location?.origin ?? '';
      const toAbsolute = (url: string | null) => (url ? new URL(url, origin).href : null);

      const importMapScriptId = 'touchspin-importmap';
      document.getElementById(importMapScriptId)?.remove();

      const imports: Record<string, string> = {};
      const coreUrlAbs = toAbsolute(coreModuleUrl);
      const rendererUrlAbs = toAbsolute(rendererModuleUrl);
      const coreRendererUrlAbs = toAbsolute(coreRendererUrl);
      const coreEventsUrlAbs = toAbsolute(coreEventsUrl);

      if (coreUrlAbs) imports['@touchspin/core'] = coreUrlAbs;
      if (coreRendererUrlAbs) imports['@touchspin/core/renderer'] = coreRendererUrlAbs;
      if (coreEventsUrlAbs) imports['@touchspin/core/events'] = coreEventsUrlAbs;
      if (rendererUrlAbs) imports['@touchspin/renderer-vanilla'] = rendererUrlAbs;

      const importMapEl = document.createElement('script');
      importMapEl.type = 'importmap';
      importMapEl.id = importMapScriptId;
      importMapEl.textContent = JSON.stringify({ imports });
      document.head.appendChild(importMapEl);

      const coreModule = await import('@touchspin/core');
      const rendererModule = await import('@touchspin/renderer-vanilla');

      const TouchSpinCore =
        (coreModule as { TouchSpinCore?: unknown }).TouchSpinCore ??
        (coreModule as { default?: unknown }).default;
      const VanillaRenderer = (rendererModule as { default?: unknown }).default ?? rendererModule;

      if (!TouchSpinCore || !VanillaRenderer) {
        throw new Error('Unable to load vanilla renderer globals');
      }

      (globalThis as any).TouchSpinDefaultRenderer = VanillaRenderer;
      (globalThis as any).TouchSpinCore = TouchSpinCore;
      (globalThis as any).testPageReady = true;
    },
    { coreModuleUrl, coreRendererUrl, coreEventsUrl, rendererModuleUrl }
  );
}

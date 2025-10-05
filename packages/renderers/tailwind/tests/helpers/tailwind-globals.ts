import type { Page } from '@playwright/test';
import * as helpers from '@touchspin/core/test-helpers';

const EXTRA_SCRIPTS = [helpers.rendererExternalUrlFor('tailwind', 'js/tailwind.js')];

export const tailwindRendererUrl = helpers.rendererClassUrlFor('tailwind');

export async function ensureTailwindGlobals(page: Page): Promise<void> {
  await helpers.loadTouchSpinRendererGlobals(page, 'tailwind', {
    extraScripts: EXTRA_SCRIPTS,
  });
}

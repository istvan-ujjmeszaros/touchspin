import type { Page } from '@playwright/test';
import * as helpers from '@touchspin/core/test-helpers';

const EXTRA_STYLES = [helpers.rendererExternalUrlFor('bootstrap5', 'css/bootstrap.min.css')];

const EXTRA_SCRIPTS = [
  helpers.packageExternalUrlFor('packages/adapters/jquery', 'js/jquery.min.js'),
  helpers.rendererExternalUrlFor('bootstrap5', 'js/bootstrap.bundle.min.js'),
];

export const bootstrap5RendererUrl = helpers.rendererClassUrlFor('bootstrap5');

export async function ensureBootstrap5Globals(page: Page): Promise<void> {
  await helpers.loadTouchSpinRendererGlobals(page, 'bootstrap5', {
    extraScripts: EXTRA_SCRIPTS,
    extraStyles: EXTRA_STYLES,
  });
}

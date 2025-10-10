import type { Page } from '@playwright/test';
import * as helpers from '@touchspin/core/test-helpers';

const EXTRA_STYLES = [helpers.rendererExternalUrlFor('bootstrap4', 'css/bootstrap.min.css')];

const EXTRA_SCRIPTS = [
  helpers.packageExternalUrlFor('packages/adapters/jquery', 'js/jquery.min.js'),
  helpers.rendererExternalUrlFor('bootstrap4', 'js/bootstrap.bundle.min.js'),
];

export const bootstrap4RendererUrl = helpers.rendererClassUrlFor('bootstrap4');

export async function ensureBootstrap4Globals(page: Page): Promise<void> {
  await helpers.loadTouchSpinRendererGlobals(page, 'bootstrap4', {
    extraScripts: EXTRA_SCRIPTS,
    extraStyles: EXTRA_STYLES,
  });
}

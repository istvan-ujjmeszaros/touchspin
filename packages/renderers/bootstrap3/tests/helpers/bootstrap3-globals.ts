import type { Page } from '@playwright/test';
import * as helpers from '@touchspin/core/test-helpers';

const EXTRA_STYLES = [
  helpers.rendererExternalUrlFor('bootstrap3', 'css/bootstrap.min.css'),
  helpers.rendererExternalUrlFor('bootstrap3', 'css/bootstrap-theme.min.css'),
];

const EXTRA_SCRIPTS = [
  helpers.packageExternalUrlFor('packages/jquery-plugin', 'js/jquery.min.js'),
  helpers.rendererExternalUrlFor('bootstrap3', 'js/bootstrap.min.js'),
];

export const bootstrap3RendererUrl = helpers.rendererClassUrlFor('bootstrap3');

export async function ensureBootstrap3Globals(page: Page): Promise<void> {
  await helpers.loadTouchSpinRendererGlobals(page, 'bootstrap3', {
    extraScripts: EXTRA_SCRIPTS,
    extraStyles: EXTRA_STYLES,
  });
}

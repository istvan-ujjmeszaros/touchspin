// @ts-check
/**
 * Planned ESM export shape for the Bootstrap 5 renderer package.
 * Actual wiring to the renderer class will be done in Phase B4.
 */

/**
 * @param {import('jquery').JQueryStatic} $
 * @param {any} settings
 * @param {import('jquery').JQuery} originalinput
 */
export function createRenderer($, settings, originalinput) {
  throw new Error('Renderer package not wired yet (Phase B4 pending)');
}

export function getFrameworkId() { return 'bootstrap5'; }


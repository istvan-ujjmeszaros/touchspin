import type { JQueryStatic } from 'jquery';
/**
 * Planned ESM export shape for the Bootstrap 5 renderer package.
 */
// TODO: refine factory typing
export function createRenderer(_$: JQueryStatic, _settings: unknown, _originalinput: unknown) {
  throw new Error('Renderer package not wired yet (Phase B4 pending)');
}

export function getFrameworkId(): string { return 'bootstrap5'; }

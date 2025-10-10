/**
 * Standalone TouchSpin with Bootstrap 5 renderer
 */

import Bootstrap5Renderer from '@touchspin/renderer-bootstrap5';
import { type MountOptions, mountAll as mountAllBase, mount as mountBase } from './mount';

export type { MountOptions };

/**
 * Mount TouchSpin with Bootstrap 5 renderer on a single element
 */
export function mount(host: Element | string, opts?: MountOptions) {
  return mountBase(host, opts, Bootstrap5Renderer);
}

/**
 * Mount TouchSpin with Bootstrap 5 renderer on all elements matching selector
 */
export function mountAll(selector: string, opts?: MountOptions) {
  return mountAllBase(selector, opts, Bootstrap5Renderer);
}

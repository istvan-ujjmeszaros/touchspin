/**
 * Standalone TouchSpin with Bootstrap 4 renderer
 */

import Bootstrap4Renderer from '@touchspin/renderer-bootstrap4';
import { type MountOptions, mountAll as mountAllBase, mount as mountBase } from './mount';

export type { MountOptions };

/**
 * Mount TouchSpin with Bootstrap 4 renderer on a single element
 */
export function mount(host: Element | string, opts?: MountOptions) {
  return mountBase(host, opts, Bootstrap4Renderer);
}

/**
 * Mount TouchSpin with Bootstrap 4 renderer on all elements matching selector
 */
export function mountAll(selector: string, opts?: MountOptions) {
  return mountAllBase(selector, opts, Bootstrap4Renderer);
}

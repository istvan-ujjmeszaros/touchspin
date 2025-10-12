/**
 * Standalone TouchSpin with Bootstrap 3 renderer
 */

import Bootstrap3Renderer from '@touchspin/renderer-bootstrap3';
import { type MountOptions, mountAll as mountAllBase, mount as mountBase } from './mount';

export type { MountOptions };

/**
 * Mount TouchSpin with Bootstrap 3 renderer on a single element
 */
export function mount(host: Element | string, opts?: MountOptions) {
  return mountBase(host, opts, Bootstrap3Renderer);
}

/**
 * Mount TouchSpin with Bootstrap 3 renderer on all elements matching selector
 */
export function mountAll(selector: string, opts?: MountOptions) {
  return mountAllBase(selector, opts, Bootstrap3Renderer);
}

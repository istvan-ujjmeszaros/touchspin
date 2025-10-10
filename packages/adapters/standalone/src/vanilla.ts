/**
 * Standalone TouchSpin with Vanilla renderer
 */

import VanillaRenderer from '@touchspin/renderer-vanilla';
import { type MountOptions, mountAll as mountAllBase, mount as mountBase } from './mount';

export type { MountOptions };

/**
 * Mount TouchSpin with Vanilla renderer on a single element
 */
export function mount(host: Element | string, opts?: MountOptions) {
  return mountBase(host, opts, VanillaRenderer);
}

/**
 * Mount TouchSpin with Vanilla renderer on all elements matching selector
 */
export function mountAll(selector: string, opts?: MountOptions) {
  return mountAllBase(selector, opts, VanillaRenderer);
}

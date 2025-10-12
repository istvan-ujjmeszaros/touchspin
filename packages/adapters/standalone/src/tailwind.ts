/**
 * Standalone TouchSpin with Tailwind renderer
 */

import TailwindRenderer from '@touchspin/renderer-tailwind';
import { type MountOptions, mountAll as mountAllBase, mount as mountBase } from './mount';

export type { MountOptions };

/**
 * Mount TouchSpin with Tailwind renderer on a single element
 */
export function mount(host: Element | string, opts?: MountOptions) {
  return mountBase(host, opts, TailwindRenderer);
}

/**
 * Mount TouchSpin with Tailwind renderer on all elements matching selector
 */
export function mountAll(selector: string, opts?: MountOptions) {
  return mountAllBase(selector, opts, TailwindRenderer);
}

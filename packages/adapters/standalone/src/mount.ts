/**
 * Shared mount/mountAll implementation for standalone adapters
 */

import type {
  RendererConstructor,
  TouchSpinCoreOptions,
  TouchSpinCorePublicAPI,
} from '@touchspin/core';
import { TouchSpin } from '@touchspin/core';

export type MountOptions = Partial<TouchSpinCoreOptions>;

/**
 * Mount TouchSpin on a single element
 * @param host - Element or selector string
 * @param opts - TouchSpin options
 * @param renderer - Renderer class to use
 * @returns TouchSpin instance
 */
export function mount(
  host: Element | string,
  opts: MountOptions | undefined,
  renderer: RendererConstructor
): TouchSpinCorePublicAPI | null {
  const element = typeof host === 'string' ? document.querySelector<HTMLInputElement>(host) : host;

  if (!element) {
    throw new Error(
      `TouchSpin mount failed: element not found${typeof host === 'string' ? ` (selector: "${host}")` : ''}`
    );
  }

  if (!(element instanceof HTMLInputElement)) {
    throw new Error('TouchSpin mount failed: element must be an HTMLInputElement');
  }

  return TouchSpin(element, {
    ...opts,
    renderer,
  });
}

/**
 * Mount TouchSpin on all elements matching selector
 * @param selector - CSS selector
 * @param opts - TouchSpin options
 * @param renderer - Renderer class to use
 * @returns Array of TouchSpin instances
 */
export function mountAll(
  selector: string,
  opts: MountOptions | undefined,
  renderer: RendererConstructor
): Array<TouchSpinCorePublicAPI | null> {
  const elements = document.querySelectorAll<HTMLInputElement>(selector);

  if (elements.length === 0) {
    return [];
  }

  const instances: Array<TouchSpinCorePublicAPI | null> = [];

  // Convert NodeListOf to Array for safe iteration
  Array.from(elements).forEach((element) => {
    if (!(element instanceof HTMLInputElement)) {
      console.warn('TouchSpin mountAll: skipping non-input element', element);
      return;
    }

    instances.push(
      TouchSpin(element, {
        ...opts,
        renderer,
      })
    );
  });

  return instances;
}

/**
 * TouchSpin Tailwind Web Component
 * Custom element using the Tailwind CSS renderer
 */

import { TailwindRenderer } from '@touchspin/renderer-tailwind';
import { TouchSpinBase } from './base/TouchSpinBase.js';

/**
 * TouchSpin Tailwind Custom Element
 *
 * @example
 * <touchspin-tailwind min="0" max="100" value="50"></touchspin-tailwind>
 */
export class TouchSpinTailwind extends TouchSpinBase {
  protected getRenderer() {
    return TailwindRenderer;
  }
}

// Register the custom element
if (!customElements.get('touchspin-tailwind')) {
  customElements.define('touchspin-tailwind', TouchSpinTailwind);
}

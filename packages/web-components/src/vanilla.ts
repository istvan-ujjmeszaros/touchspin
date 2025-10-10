/**
 * TouchSpin Vanilla Web Component
 * Custom element using the Vanilla CSS renderer
 */

import { VanillaRenderer } from '@touchspin/renderer-vanilla';
import { TouchSpinBase } from './base/TouchSpinBase.js';

/**
 * TouchSpin Vanilla Custom Element
 *
 * @example
 * <touchspin-vanilla min="0" max="100" value="50"></touchspin-vanilla>
 */
export class TouchSpinVanilla extends TouchSpinBase {
  protected getRenderer() {
    return VanillaRenderer;
  }
}

// Register the custom element
if (!customElements.get('touchspin-vanilla')) {
  customElements.define('touchspin-vanilla', TouchSpinVanilla);
}

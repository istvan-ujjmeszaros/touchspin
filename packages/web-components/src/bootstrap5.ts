/**
 * TouchSpin Bootstrap 5 Web Component
 * Custom element using the Bootstrap 5 renderer
 */

import { Bootstrap5Renderer } from '@touchspin/renderer-bootstrap5';
import { TouchSpinBase } from './base/TouchSpinBase.js';

/**
 * TouchSpin Bootstrap 5 Custom Element
 *
 * @example
 * <touchspin-bootstrap5 min="0" max="100" value="50"></touchspin-bootstrap5>
 */
export class TouchSpinBootstrap5 extends TouchSpinBase {
  protected getRenderer() {
    return Bootstrap5Renderer;
  }
}

// Register the custom element
if (!customElements.get('touchspin-bootstrap5')) {
  customElements.define('touchspin-bootstrap5', TouchSpinBootstrap5);
}

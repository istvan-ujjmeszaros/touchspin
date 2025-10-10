/**
 * TouchSpin Bootstrap 3 Web Component
 * Custom element using the Bootstrap 3 renderer
 */

import { Bootstrap3Renderer } from '@touchspin/renderer-bootstrap3';
import { TouchSpinBase } from './base/TouchSpinBase.js';

/**
 * TouchSpin Bootstrap 3 Custom Element
 *
 * @example
 * <touchspin-bootstrap3 min="0" max="100" value="50"></touchspin-bootstrap3>
 */
export class TouchSpinBootstrap3 extends TouchSpinBase {
  protected getRenderer() {
    return Bootstrap3Renderer;
  }
}

// Register the custom element
if (!customElements.get('touchspin-bootstrap3')) {
  customElements.define('touchspin-bootstrap3', TouchSpinBootstrap3);
}

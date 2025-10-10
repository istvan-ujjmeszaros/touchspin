/**
 * TouchSpin Bootstrap 4 Web Component
 * Custom element using the Bootstrap 4 renderer
 */

import { Bootstrap4Renderer } from '@touchspin/renderer-bootstrap4';
import { TouchSpinBase } from './base/TouchSpinBase.js';

/**
 * TouchSpin Bootstrap 4 Custom Element
 *
 * @example
 * <touchspin-bootstrap4 min="0" max="100" value="50"></touchspin-bootstrap4>
 */
export class TouchSpinBootstrap4 extends TouchSpinBase {
  protected getRenderer() {
    return Bootstrap4Renderer;
  }
}

// Register the custom element
if (!customElements.get('touchspin-bootstrap4')) {
  customElements.define('touchspin-bootstrap4', TouchSpinBootstrap4);
}

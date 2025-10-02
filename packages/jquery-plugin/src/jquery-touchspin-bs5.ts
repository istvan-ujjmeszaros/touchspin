/**
 * jQuery TouchSpin Bootstrap 5 UMD Bundle
 *
 * All-in-one bundle including:
 * - jQuery plugin wrapper
 * - Bootstrap 5 renderer
 * - 100% backwards compatible with legacy TouchSpin
 */

import { installWithRenderer, TouchSpinCallableEvent } from './index.js';

// Import Bootstrap 5 renderer - this will be bundled into the UMD build
import { Bootstrap5Renderer } from '@touchspin/renderer-bootstrap5';

// Install the jQuery plugin with Bootstrap 5 renderer automatically
installWithRenderer(Bootstrap5Renderer);

// Export TouchSpinCallableEvent to global scope for UMD usage
if (typeof window !== 'undefined') {
  (window as any).TouchSpinCallableEvent = TouchSpinCallableEvent;
}

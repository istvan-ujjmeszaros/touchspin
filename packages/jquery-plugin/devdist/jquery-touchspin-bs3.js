/**
 * jQuery TouchSpin Bootstrap 3 UMD Bundle
 *
 * All-in-one bundle including:
 * - jQuery plugin wrapper
 * - Bootstrap 3 renderer
 * - 100% backwards compatible with legacy TouchSpin
 */
import { installWithRenderer } from './index.js';
// Import Bootstrap 3 renderer - this will be bundled into the UMD build
import { Bootstrap3Renderer } from '@touchspin/renderer-bootstrap3';
// Install the jQuery plugin with Bootstrap 3 renderer automatically
installWithRenderer(Bootstrap3Renderer);
//# sourceMappingURL=jquery-touchspin-bs3.js.map
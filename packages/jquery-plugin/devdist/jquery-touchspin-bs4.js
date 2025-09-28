/**
 * jQuery TouchSpin Bootstrap 4 UMD Bundle
 *
 * All-in-one bundle including:
 * - jQuery plugin wrapper
 * - Bootstrap 4 renderer
 * - 100% backwards compatible with legacy TouchSpin
 */
import { installWithRenderer } from './index.js';
// Import Bootstrap 4 renderer - this will be bundled into the UMD build
import { Bootstrap4Renderer } from '@touchspin/renderer-bootstrap4';
// Install the jQuery plugin with Bootstrap 4 renderer automatically
installWithRenderer(Bootstrap4Renderer);
//# sourceMappingURL=jquery-touchspin-bs4.js.map
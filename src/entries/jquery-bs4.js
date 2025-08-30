// jQuery Bootstrap 4 build entry point
import { TouchSpinCore, getTouchSpin } from '../../packages/core/src/index.js';
import Bootstrap4Renderer from '../../packages/renderers/bootstrap4/src/Bootstrap4Renderer.js';
import { installJqueryTouchSpin } from '../../packages/jquery-plugin/src/index.js';

// Wrapper function for standalone use (when jQuery is not available)
function TouchSpin(element, options = {}) {
  if (!(element instanceof Element)) {
    throw new TypeError('TouchSpin expects an HTMLElement');
  }
  
  // Set the baked-in renderer for this build
  options.renderer = options.renderer || Bootstrap4Renderer;
  
  // Use core directly
  if (element._touchSpinCore) {
    element._touchSpinCore.destroy();
  }
  
  const core = new TouchSpinCore(element, options);
  element._touchSpinCore = core;
  core.initDOMEventHandling();
  
  return core.toPublicApi();
}

// Install jQuery plugin if jQuery is available
if (typeof window !== 'undefined' && window.jQuery) {
  installJqueryTouchSpin(window.jQuery);
}

// For jQuery builds, ensure globals are properly exposed for direct access
if (typeof window !== 'undefined') {
  window.TouchSpin = TouchSpin;
  window.TouchSpinCore = TouchSpinCore;
  window.getTouchSpin = getTouchSpin;
  window.Bootstrap4Renderer = Bootstrap4Renderer;
  window.installJqueryTouchSpin = installJqueryTouchSpin;
}

// Export for module systems only (no default export)
export { TouchSpin, TouchSpinCore, getTouchSpin, Bootstrap4Renderer, installJqueryTouchSpin };
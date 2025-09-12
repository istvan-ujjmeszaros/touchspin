// Standalone Bootstrap 5 build entry point
import { TouchSpin as CoreTouchSpin, TouchSpinCore, getTouchSpin } from '../../../core/src/index';
import Bootstrap5Renderer from './Bootstrap5Renderer';

// Create a wrapper that automatically sets the Bootstrap 5 renderer
function TouchSpin(element: HTMLElement, options: Record<string, unknown> = {}) {
  if (!(element instanceof Element)) {
    throw new TypeError('TouchSpin expects an HTMLElement');
  }

  // Set the baked-in renderer for this build
  options.renderer = options.renderer || Bootstrap5Renderer;

  // Use the core TouchSpin function which properly handles initDOMEventHandling
  return CoreTouchSpin(element, options);
}

// Expose additional API functions
TouchSpin.get = getTouchSpin;
TouchSpin.destroy = (element) => {
  const instance = getTouchSpin(element);
  if (instance && instance.destroy) {
    instance.destroy();
    return true;
  }
  return false;
};

// For standalone builds, ensure globals are properly exposed
if (typeof window !== 'undefined') {
  window.TouchSpin = TouchSpin;
  window.TouchSpinCore = TouchSpinCore;
  window.getTouchSpin = getTouchSpin;
  window.Bootstrap5Renderer = Bootstrap5Renderer;
}

// Export for module systems only (no default export)
export { TouchSpin, TouchSpinCore, getTouchSpin, Bootstrap5Renderer };

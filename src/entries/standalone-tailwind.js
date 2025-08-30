// Standalone Tailwind build entry point
import { TouchSpin as CoreTouchSpin, TouchSpinCore, getTouchSpin } from '../../packages/core/src/index.js';
import TailwindRenderer from '../../packages/renderers/tailwind/src/TailwindRenderer.js';

// Create a wrapper that automatically sets the Tailwind renderer
function TouchSpin(element, options = {}) {
  if (!(element instanceof Element)) {
    throw new TypeError('TouchSpin expects an HTMLElement');
  }
  
  // Set the baked-in renderer for this build
  options.renderer = options.renderer || TailwindRenderer;
  
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
  window.TailwindRenderer = TailwindRenderer;
}

// Export for module systems only (no default export)
export { TouchSpin, TouchSpinCore, getTouchSpin, TailwindRenderer };
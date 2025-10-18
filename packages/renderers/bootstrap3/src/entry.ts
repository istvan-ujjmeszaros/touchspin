// Standalone Bootstrap 3 build entry point
import {
  TouchSpin as CoreTouchSpin,
  getTouchSpin,
  TouchSpinCore,
  type TouchSpinCoreOptions,
} from '@touchspin/core';
import Bootstrap3Renderer from './Bootstrap3Renderer.js';

// Create a wrapper that automatically sets the Bootstrap 3 renderer
function TouchSpin(element: HTMLInputElement, options: Partial<TouchSpinCoreOptions> = {}) {
  if (!(element instanceof HTMLInputElement)) {
    throw new TypeError('TouchSpin expects an HTMLElement');
  }

  // Set the baked-in renderer for this build
  options.renderer = options.renderer || Bootstrap3Renderer;

  // Use the core TouchSpin function which properly handles initDOMEventHandling
  return CoreTouchSpin(element, options);
}

// Expose additional API functions
TouchSpin.get = getTouchSpin;
TouchSpin.destroy = (element: HTMLInputElement) => {
  const instance = getTouchSpin(element);
  if (instance?.destroy) {
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
  window.Bootstrap3Renderer = Bootstrap3Renderer;
}

// Export for module systems only (no default export)
export { TouchSpin, TouchSpinCore, getTouchSpin, Bootstrap3Renderer };

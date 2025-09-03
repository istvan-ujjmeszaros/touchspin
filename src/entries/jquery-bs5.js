// jQuery Bootstrap 5 build entry point
import { TouchSpin as CoreTouchSpin, TouchSpinCore, getTouchSpin, CORE_EVENTS } from '../../packages/core/src/index.js';
import Bootstrap5Renderer from '../../packages/renderers/bootstrap5/src/Bootstrap5Renderer.js';

// Wrapper function for standalone use (when jQuery is not available)
function TouchSpin(element, options = {}) {
  if (!(element instanceof Element)) {
    throw new TypeError('TouchSpin expects an HTMLElement');
  }

  // Set the baked-in renderer for this build
  options.renderer = options.renderer || Bootstrap5Renderer;

  // Use the core TouchSpin function which properly handles initDOMEventHandling
  return CoreTouchSpin(element, options);
}

// Custom jQuery plugin installer with baked-in Bootstrap5Renderer
function installJqueryTouchSpin($) {
  $.fn.TouchSpin = function(options, arg) {
    // Command API - forward to core (core manages instance lifecycle)
    if (typeof options === 'string') {
      const cmd = String(options).toLowerCase();
      let ret;
      this.each(function() {
        const inputEl = /** @type {HTMLInputElement} */ (this);
        const api = getTouchSpin(inputEl);

        // Handle get/getvalue specially - fall back to raw input value if no instance
        if ((cmd === 'getvalue' || cmd === 'get') && ret === undefined) {
          if (api) {
            ret = api.getValue();
          } else {
            // No TouchSpin instance - return raw input value
            ret = inputEl.value;
          }
          return; // Skip other commands if no instance
        }

        if (!api) return; // No instance exists - other commands ignored

        switch (cmd) {
          case 'destroy': api.destroy(); break; // Core removes instance from element
          case 'uponce': api.upOnce(); break;
          case 'downonce': api.downOnce(); break;
          case 'startupspin': api.startUpSpin(); break;
          case 'startdownspin': api.startDownSpin(); break;
          case 'stopspin': api.stopSpin(); break;
          case 'updatesettings': api.updateSettings(arg || {}); break;
          case 'setvalue': case 'set': api.setValue(arg); break;
        }
      });
      return ret === undefined ? this : ret;
    }

    // Initialize - use TouchSpin wrapper with baked-in renderer
    return this.each(function() {
      const $input = $(this);
      const inputEl = /** @type {HTMLInputElement} */ (this);

      // Create TouchSpin instance with baked-in Bootstrap5Renderer
      const opts = options || {};
      opts.renderer = opts.renderer || Bootstrap5Renderer;
      const inst = CoreTouchSpin(inputEl, opts);

      // Bridge core events to jQuery events (minimal event forwarding only)
      const evMap = {
        [CORE_EVENTS.MIN]: 'touchspin.on.min',
        [CORE_EVENTS.MAX]: 'touchspin.on.max',
        [CORE_EVENTS.START_SPIN]: 'touchspin.on.startspin',
        [CORE_EVENTS.START_UP]: 'touchspin.on.startupspin',
        [CORE_EVENTS.START_DOWN]: 'touchspin.on.startdownspin',
        [CORE_EVENTS.STOP_SPIN]: 'touchspin.on.stopspin',
        [CORE_EVENTS.STOP_UP]: 'touchspin.on.stopupspin',
        [CORE_EVENTS.STOP_DOWN]: 'touchspin.on.stopdownspin',
      };

      // Store unsubscribe functions for cleanup
      const unsubs = [];
      Object.keys(evMap).forEach(k => {
        unsubs.push(inst.on(k, () => $input.trigger(evMap[k])));
      });

      // Define jQuery teardown function that cleans up jQuery-specific resources
      const jqueryTeardown = () => {
        // Clean up event subscriptions to core
        unsubs.forEach(unsub => {
          try { unsub(); } catch {}
        });
        // Clean up jQuery events
        $input.off('touchspin.uponce touchspin.downonce touchspin.startupspin touchspin.startdownspin touchspin.stopspin touchspin.updatesettings touchspin.destroy');
      };

      // Register teardown with core so it's called on core destroy too
      inst.registerTeardown(jqueryTeardown);

      // Callable events - forward to core (core manages lifecycle)
      $input.on('touchspin.uponce', () => {
        const api = getTouchSpin(inputEl);
        if (api) api.upOnce();
      });
      $input.on('touchspin.downonce', () => {
        const api = getTouchSpin(inputEl);
        if (api) api.downOnce();
      });
      $input.on('touchspin.startupspin', () => {
        const api = getTouchSpin(inputEl);
        if (api) api.startUpSpin();
      });
      $input.on('touchspin.startdownspin', () => {
        const api = getTouchSpin(inputEl);
        if (api) api.startDownSpin();
      });
      $input.on('touchspin.stopspin', () => {
        const api = getTouchSpin(inputEl);
        if (api) api.stopSpin();
      });
      $input.on('touchspin.updatesettings', (e, o) => {
        const api = getTouchSpin(inputEl);
        if (api) api.updateSettings(o || {});
      });
      $input.on('touchspin.destroy', () => {
        // Forward destroy to core (core will call registered teardown callbacks)
        const api = getTouchSpin(inputEl);
        if (api) api.destroy();
      });
    });
  };
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
  window.Bootstrap5Renderer = Bootstrap5Renderer;
  window.installJqueryTouchSpin = installJqueryTouchSpin;
}

// Export for module systems only (no default export)
export { TouchSpin, TouchSpinCore, getTouchSpin, Bootstrap5Renderer, installJqueryTouchSpin };
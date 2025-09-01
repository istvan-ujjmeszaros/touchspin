// @ts-check
import { TouchSpin, getTouchSpin, CORE_EVENTS } from '../../core/src/index.js';

/**
 * Install a minimal jQuery plugin wrapper that just forwards everything to core.
 * Contains NO logic - only forwards commands and events.
 * Core manages its own instance lifecycle on the input element.
 * @param {import('jquery').JQueryStatic} $
 */
export function installJqueryTouchSpin($) {
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

    // Initialize - forward to core
    return this.each(function() {
      const $input = $(this);
      const inputEl = /** @type {HTMLInputElement} */ (this);
      
      // Create TouchSpin instance (core handles non-input validation)
      const inst = TouchSpin(inputEl, options || {});
      
      // If TouchSpin returned null (non-input element), skip jQuery setup
      if (!inst) {
        return;
      }

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
        // @ts-ignore
        unsubs.push(inst.on(k, () => $input.trigger(evMap[k])));
      });

      // Define jQuery teardown function that cleans up jQuery-specific resources
      const jqueryTeardown = () => {
        // Clean up event subscriptions to core
        unsubs.forEach(unsub => {
          try { unsub(); } catch {} 
        });
        // Clean up jQuery events
        $input.off('touchspin.uponce touchspin.downonce touchspin.startupspin touchspin.startdownspin touchspin.stopspin touchspin.updatesettings touchspin.destroy blur.touchspin');
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
      
      // Handle jQuery-triggered blur events for backward compatibility
      // jQuery's .trigger('blur') doesn't fire native addEventListener('blur')
      $input.on('blur.touchspin', () => {
        const core = inputEl._touchSpinCore;
        if (core && core._checkValue) {
          core._checkValue(true);
        }
      });
    });
  };
}
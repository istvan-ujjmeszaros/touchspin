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
        const api = getTouchSpin(/** @type {HTMLInputElement} */ (this));
        if (!api) return; // No instance exists - command ignored
        
        switch (cmd) {
          case 'destroy': api.destroy(); break; // Core removes instance from element
          case 'uponce': api.upOnce(); break;
          case 'downonce': api.downOnce(); break;
          case 'startupspin': api.startUpSpin(); break;
          case 'startdownspin': api.startDownSpin(); break;
          case 'stopspin': api.stopSpin(); break;
          case 'updatesettings': api.updateSettings(arg || {}); break;
          case 'getvalue': case 'get': if (ret === undefined) ret = api.getValue(); break;
          case 'setvalue': case 'set': api.setValue(arg); break;
        }
      });
      return ret === undefined ? this : ret;
    }

    // Initialize - forward to core
    return this.each(function() {
      const $input = $(this);
      const inputEl = /** @type {HTMLInputElement} */ (this);
      
      // Create TouchSpin instance (core handles everything including storage on element)
      const inst = TouchSpin(inputEl, options || {});

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
        // Clean up event subscriptions
        unsubs.forEach(unsub => {
          try { unsub(); } catch {} 
        });
        // Forward destroy to core (core removes instance from element)
        const api = getTouchSpin(inputEl);
        if (api) api.destroy();
        // Clean up jQuery events
        $input.off('touchspin.uponce touchspin.downonce touchspin.startupspin touchspin.startdownspin touchspin.stopspin touchspin.updatesettings touchspin.destroy');
      });
    });
  };
}
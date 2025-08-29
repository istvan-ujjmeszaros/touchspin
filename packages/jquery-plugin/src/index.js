// @ts-check
import { TouchSpin, getTouchSpin, CORE_EVENTS } from '../../core/src/index.js';

/**
 * Install a minimal jQuery plugin wrapper that just forwards everything to core.
 * Contains NO logic - only forwards commands and events.
 * @param {import('jquery').JQueryStatic} $
 */
export function installJqueryTouchSpin($) {
  $.fn.TouchSpin = function(options, arg) {
    // Command API - just forward to core
    if (typeof options === 'string') {
      const cmd = String(options).toLowerCase();
      let ret;
      this.each(function() {
        const api = getTouchSpin(/** @type {HTMLInputElement} */ (this));
        if (!api) return;
        switch (cmd) {
          case 'destroy': api.destroy(); break;
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

    // Initialize - just forward to core
    return this.each(function() {
      const $input = $(this);
      const inputEl = /** @type {HTMLInputElement} */ (this);
      
      // Create TouchSpin instance (core handles everything)
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

      // Callable events - forward to core
      $input.on('touchspin.uponce', () => inst.upOnce());
      $input.on('touchspin.downonce', () => inst.downOnce());
      $input.on('touchspin.startupspin', () => inst.startUpSpin());
      $input.on('touchspin.startdownspin', () => inst.startDownSpin());
      $input.on('touchspin.stopspin', () => inst.stopSpin());
      $input.on('touchspin.updatesettings', (e, o) => inst.updateSettings(o || {}));
      $input.on('touchspin.destroy', () => {
        // Clean up event subscriptions
        unsubs.forEach(unsub => {
          try { unsub(); } catch {} 
        });
        // Forward destroy to core
        inst.destroy();
        // Clean up jQuery events by specific names
        $input.off('touchspin.uponce touchspin.downonce touchspin.startupspin touchspin.startdownspin touchspin.stopspin touchspin.updatesettings touchspin.destroy');
      });

      // Store cleanup for manual access
      $input.data('__ts_unsubs', unsubs);
    });
  };
}
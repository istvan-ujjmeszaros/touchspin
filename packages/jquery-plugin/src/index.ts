import type { JQueryStatic } from 'jquery';
import { TouchSpin, getTouchSpin, CORE_EVENTS } from '@touchspin/core';
import type { TSRenderer } from '@touchspin/core/renderer';
import { TouchSpinCallableEvent, TouchSpinEmittedEvent } from './types/events';

// Export event types for external use
export { TouchSpinCallableEvent, TouchSpinEmittedEvent } from './types/events';
export type { TouchSpinUpdateSettingsData } from './types/events';

/**
 * Install a minimal jQuery plugin wrapper that just forwards everything to core.
 * Contains NO logic - only forwards commands and events.
 * Core manages its own instance lifecycle on the input element.
 * @param {import('jquery').JQueryStatic} $
 */
export function installJqueryTouchSpin($: JQueryStatic) {
  $.fn.TouchSpin = function(options, arg) {
    // Command API - forward to core (core manages instance lifecycle)
    if (typeof options === 'string') {
      const cmd = String(options).toLowerCase();
      let ret: unknown;
      this.each(function() {
        const inputEl = (this as unknown as HTMLInputElement);
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
      return ret === undefined ? this : (ret as unknown);
    }

    // Initialize - forward to core
    return this.each(function() {
      const $input = $(this);
      const inputEl = (this as unknown as HTMLInputElement);

      // Create TouchSpin instance (core handles non-input validation)
      const inst = TouchSpin(inputEl, (options as Partial<Record<string, unknown>>) || {});

      // If TouchSpin returned null (non-input element), skip jQuery setup
      if (!inst) {
        return;
      }

      // Bridge core events to jQuery events (minimal event forwarding only)
      const evMap: Record<string, string> = {
        [CORE_EVENTS.MIN]: TouchSpinEmittedEvent.ON_MIN,
        [CORE_EVENTS.MAX]: TouchSpinEmittedEvent.ON_MAX,
        [CORE_EVENTS.START_SPIN]: TouchSpinEmittedEvent.ON_START_SPIN,
        [CORE_EVENTS.START_UP]: TouchSpinEmittedEvent.ON_START_UP_SPIN,
        [CORE_EVENTS.START_DOWN]: TouchSpinEmittedEvent.ON_START_DOWN_SPIN,
        [CORE_EVENTS.STOP_SPIN]: TouchSpinEmittedEvent.ON_STOP_SPIN,
        [CORE_EVENTS.STOP_UP]: TouchSpinEmittedEvent.ON_STOP_UP_SPIN,
        [CORE_EVENTS.STOP_DOWN]: TouchSpinEmittedEvent.ON_STOP_DOWN_SPIN,
      };

      // Store unsubscribe functions for cleanup
      const unsubs: Array<() => void> = [];
      Object.keys(evMap).forEach(k => {
        // @ts-ignore
        unsubs.push(inst.on(k, () => $input.trigger(evMap[k])));
      });

      // Define jQuery teardown function that cleans up jQuery-specific resources
      const jqueryTeardown = () => {
        // Clean up event subscriptions to core
        unsubs.forEach(unsub => {
          try { unsub(); } catch {
            // Ignore unsubscribe errors during cleanup
          }
        });
        // Clean up ONLY the jQuery events that THIS plugin explicitly added
        // Based on lines 93-125 in this file: 8 explicit jQuery events
        $input.off(`${TouchSpinCallableEvent.UP_ONCE} ${TouchSpinCallableEvent.DOWN_ONCE} ${TouchSpinCallableEvent.START_UP_SPIN} ${TouchSpinCallableEvent.START_DOWN_SPIN} ${TouchSpinCallableEvent.STOP_SPIN} ${TouchSpinCallableEvent.UPDATE_SETTINGS} ${TouchSpinCallableEvent.DESTROY} blur.touchspin`);

        // If the core is adding additional jQuery events, they would need to be cleaned up by the core itself
        // or added to the list above. Currently there are 2 unaccounted events that are not being cleaned up.
      };

      // Register teardown with core so it's called on core destroy too
      inst.registerTeardown(jqueryTeardown);

      // Callable events - forward to core (core manages lifecycle)
      $input.on(TouchSpinCallableEvent.UP_ONCE, () => {
        const api = getTouchSpin(inputEl);
        if (api) api.upOnce();
      });
      $input.on(TouchSpinCallableEvent.DOWN_ONCE, () => {
        const api = getTouchSpin(inputEl);
        if (api) api.downOnce();
      });
      $input.on(TouchSpinCallableEvent.START_UP_SPIN, () => {
        const api = getTouchSpin(inputEl);
        if (api) api.startUpSpin();
      });
      $input.on(TouchSpinCallableEvent.START_DOWN_SPIN, () => {
        const api = getTouchSpin(inputEl);
        if (api) api.startDownSpin();
      });
      $input.on(TouchSpinCallableEvent.STOP_SPIN, () => {
        const api = getTouchSpin(inputEl);
        if (api) api.stopSpin();
      });
      $input.on(TouchSpinCallableEvent.UPDATE_SETTINGS, (_e, o) => {
        const api = getTouchSpin(inputEl);
        if (api) api.updateSettings(o || {});
      });
      $input.on(TouchSpinCallableEvent.DESTROY, () => {
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

/**
 * Install the jQuery plugin and set a default renderer for TouchSpin.
 * Uses global window.jQuery if available; otherwise, requires manual
 * install via installJqueryTouchSpin($).
 */
export function installWithRenderer(renderer: TSRenderer): void {
  // Set the global default renderer consumed by core if no renderer is provided in options
  (globalThis as unknown as { TouchSpinDefaultRenderer?: TSRenderer }).TouchSpinDefaultRenderer = renderer;

  const $ = (globalThis as unknown as { jQuery?: JQueryStatic }).jQuery;
  if ($) {
    installJqueryTouchSpin($);
  } else {
    console.warn('installWithRenderer: jQuery not found on window. Call installJqueryTouchSpin($) manually.');
  }
}

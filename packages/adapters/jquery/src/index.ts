/**
 * jQuery adapter for TouchSpin using standalone adapter
 *
 * This adapter wraps the standalone mount API with a jQuery plugin interface,
 * maintaining 100% backward compatibility with the legacy jQuery plugin API.
 */

import type { TouchSpinCorePublicAPI } from '@touchspin/core';
import { TouchSpinCallableEvent, TouchSpinEmittedEvent } from '@touchspin/core';
import type { MountOptions } from '@touchspin/standalone';

export type { TouchSpinUpdateSettingsData } from '@touchspin/core';
// Re-export event types for external use
export { TouchSpinCallableEvent, TouchSpinEmittedEvent } from '@touchspin/core';

// Minimal jQuery types to avoid hard module dependency
type JQueryInst = {
  each: (cb: (this: Element) => void) => JQueryInst;
  on: (...args: unknown[]) => JQueryInst;
  off: (...args: unknown[]) => JQueryInst;
  trigger: (...args: unknown[]) => JQueryInst;
};
type JQueryStatic = {
  fn: Record<string, unknown> & { TouchSpin?: (options?: unknown, arg?: unknown) => unknown };
  (selector: Element | string): JQueryInst;
};

/**
 * Install jQuery plugin that uses standalone adapter
 * @param $ - jQuery instance
 * @param mountFn - Mount function from standalone adapter (e.g., from @touchspin/standalone/bootstrap5)
 */
export function installJQueryAdapter(
  $: JQueryStatic,
  mountFn: (host: Element | string, opts?: MountOptions) => TouchSpinCorePublicAPI | null
) {
  // Define the plugin with typed params and jQuery context
  $.fn.TouchSpin = function (this: JQueryInst, options?: unknown, arg?: unknown): unknown {
    // Command API - forward to instance
    if (typeof options === 'string') {
      const cmd = String(options).toLowerCase();
      let ret: unknown;

      this.each(function (this: Element) {
        const inputEl = this as HTMLInputElement;
        const inst = (inputEl as unknown as { __touchspin?: TouchSpinCorePublicAPI }).__touchspin;

        // Handle get/getvalue specially - fall back to raw input value if no instance
        if ((cmd === 'getvalue' || cmd === 'get') && ret === undefined) {
          if (inst) {
            ret = inst.getValue();
          } else {
            // No TouchSpin instance - return raw input value
            ret = inputEl.value;
          }
          return; // Skip other commands if no instance
        }

        if (!inst) return; // No instance exists - other commands ignored

        switch (cmd) {
          case 'destroy':
            inst.destroy();
            delete (inputEl as unknown as { __touchspin?: TouchSpinCorePublicAPI }).__touchspin;
            break;
          case 'uponce':
            inst.upOnce();
            break;
          case 'downonce':
            inst.downOnce();
            break;
          case 'startupspin':
            inst.startUpSpin();
            break;
          case 'startdownspin':
            inst.startDownSpin();
            break;
          case 'stopspin':
            inst.stopSpin();
            break;
          case 'updatesettings':
            inst.updateSettings((arg as Record<string, unknown>) || {});
            break;
          case 'setvalue':
          case 'set':
            inst.setValue(arg as number | string);
            break;
        }
      });

      return ret === undefined ? this : (ret as unknown);
    }

    // Initialize - use standalone mount
    return this.each(function (this: Element) {
      const $input = $(this as Element);
      const inputEl = this as HTMLInputElement;

      // Try to mount, silently skip non-input elements (backward compatibility)
      let inst: TouchSpinCorePublicAPI | null = null;
      try {
        inst = mountFn(inputEl, (options as MountOptions) || {});
      } catch (error) {
        // Silently skip mount failures (e.g., non-input elements)
        // This matches legacy jQuery plugin behavior
        return;
      }

      // If mount returned null, skip jQuery setup
      if (!inst) {
        return;
      }

      // Store instance on element for command API
      (inputEl as unknown as { __touchspin: TouchSpinCorePublicAPI }).__touchspin = inst;

      // Define jQuery teardown function that cleans up jQuery-specific resources
      const jqueryTeardown = () => {
        // Clean up ONLY the jQuery events that THIS plugin explicitly added
        // Based on the callable events below: UP_ONCE, DOWN_ONCE, START_UP_SPIN, START_DOWN_SPIN, STOP_SPIN, UPDATE_SETTINGS, DESTROY, blur.touchspin
        $input.off(
          `${TouchSpinCallableEvent.UP_ONCE} ${TouchSpinCallableEvent.DOWN_ONCE} ${TouchSpinCallableEvent.START_UP_SPIN} ${TouchSpinCallableEvent.START_DOWN_SPIN} ${TouchSpinCallableEvent.STOP_SPIN} ${TouchSpinCallableEvent.UPDATE_SETTINGS} ${TouchSpinCallableEvent.DESTROY} blur.touchspin`
        );
      };

      // Register teardown with core so it's called on core destroy too
      inst.registerTeardown(jqueryTeardown);

      // Callable events - forward to core (core manages lifecycle)
      $input.on(TouchSpinCallableEvent.UP_ONCE, () => {
        const api = (inputEl as unknown as { __touchspin?: TouchSpinCorePublicAPI }).__touchspin;
        if (api) api.upOnce();
      });
      $input.on(TouchSpinCallableEvent.DOWN_ONCE, () => {
        const api = (inputEl as unknown as { __touchspin?: TouchSpinCorePublicAPI }).__touchspin;
        if (api) api.downOnce();
      });
      $input.on(TouchSpinCallableEvent.START_UP_SPIN, () => {
        const api = (inputEl as unknown as { __touchspin?: TouchSpinCorePublicAPI }).__touchspin;
        if (api) api.startUpSpin();
      });
      $input.on(TouchSpinCallableEvent.START_DOWN_SPIN, () => {
        const api = (inputEl as unknown as { __touchspin?: TouchSpinCorePublicAPI }).__touchspin;
        if (api) api.startDownSpin();
      });
      $input.on(TouchSpinCallableEvent.STOP_SPIN, () => {
        const api = (inputEl as unknown as { __touchspin?: TouchSpinCorePublicAPI }).__touchspin;
        if (api) api.stopSpin();
      });
      $input.on(TouchSpinCallableEvent.UPDATE_SETTINGS, (_e: unknown, o: unknown) => {
        const api = (inputEl as unknown as { __touchspin?: TouchSpinCorePublicAPI }).__touchspin;
        if (api) api.updateSettings((o as Record<string, unknown>) || {});
      });
      $input.on(TouchSpinCallableEvent.DESTROY, () => {
        // Forward destroy to core (core will call registered teardown callbacks)
        const api = (inputEl as unknown as { __touchspin?: TouchSpinCorePublicAPI }).__touchspin;
        if (api) {
          api.destroy();
          delete (inputEl as unknown as { __touchspin?: TouchSpinCorePublicAPI }).__touchspin;
        }
      });

      // Handle jQuery-triggered blur events for backward compatibility
      // jQuery's .trigger('blur') doesn't fire native addEventListener('blur')
      $input.on('blur.touchspin', () => {
        const core = (inputEl as unknown as Record<string, unknown>)._touchSpinCore as
          | { _checkValue?: (finalize: boolean) => void }
          | undefined;
        core?._checkValue?.(true);
      });
    });
  };
}

/**
 * Auto-install jQuery adapter if jQuery is available on window
 * @param mountFn - Mount function from standalone adapter
 */
export function autoInstall(
  mountFn: (host: Element | string, opts?: MountOptions) => TouchSpinCorePublicAPI | null
): void {
  const $ = (globalThis as unknown as { jQuery?: JQueryStatic }).jQuery;
  if ($) {
    installJQueryAdapter($, mountFn);
  } else {
    console.warn(
      'jQuery adapter: jQuery not found on window. Call installJQueryAdapter($, mountFn) manually.'
    );
  }
}

/**
 * jQuery adapter for TouchSpin using standalone adapter
 *
 * This adapter wraps the standalone mount API with a jQuery plugin interface,
 * maintaining backward compatibility with the existing jQuery plugin API.
 */

import type { TouchSpinCorePublicAPI } from '@touchspin/core';
import type { MountOptions } from '@touchspin/standalone';

// Minimal jQuery types to avoid hard module dependency
type JQueryInst = {
  each: (cb: (this: Element) => void) => JQueryInst;
};
type JQueryStatic = {
  fn: Record<string, unknown> & { touchspin?: (options?: unknown, arg?: unknown) => unknown };
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
  $.fn.touchspin = function (this: JQueryInst, options?: unknown, arg?: unknown): unknown {
    // Command API - forward to instance
    if (typeof options === 'string') {
      const cmd = String(options).toLowerCase();
      let ret: unknown;

      this.each(function (this: Element) {
        const inst = (this as unknown as { __touchspin?: TouchSpinCorePublicAPI }).__touchspin;

        // Handle get/getvalue specially - fall back to raw input value if no instance
        if ((cmd === 'getvalue' || cmd === 'get') && ret === undefined) {
          if (inst) {
            ret = inst.getValue();
          } else {
            // No TouchSpin instance - return raw input value
            ret = (this as HTMLInputElement).value;
          }
          return; // Skip other commands if no instance
        }

        if (!inst) return; // No instance exists - other commands ignored

        switch (cmd) {
          case 'destroy':
            inst.destroy();
            delete (this as unknown as { __touchspin?: TouchSpinCorePublicAPI }).__touchspin;
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
      const inst = mountFn(this as HTMLElement, (options as MountOptions) || {});
      if (inst) {
        (this as unknown as { __touchspin: TouchSpinCorePublicAPI }).__touchspin = inst;
      }
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

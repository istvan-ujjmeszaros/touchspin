/*
 * jQuery wrapper scaffold for TouchSpinCore (ESM).
 * This file is not yet wired into the UMD builds. It shows how the
 * legacy callable events will bridge to the core’s instance API.
 */

import { TouchSpinCore } from '../core/TouchSpinCore.js';

/**
 * Register wrapper on a provided jQuery instance.
 * Consumers will typically use the UMD builds; this ESM wrapper is for
 * future integration and testing.
 * @param {JQueryStatic} $
 */
export function registerJQueryWrapper($) {
  if (!$.fn.TouchSpin) {
    $.fn.TouchSpin = function(optionsOrCommand, arg) {
      return this.each(function() {
        const $input = $(this);
        let instance = $input.data('touchspin');

        if (!instance) {
          instance = new TouchSpinCore(this, /** @type {any} */(optionsOrCommand || {}));
          instance.init();
          $input.data('touchspin', instance);
        }

        // Bridge legacy callable events
        if (typeof optionsOrCommand === 'string') {
          switch (optionsOrCommand) {
            case 'touchspin.uponce':
              instance.upOnce();
              break;
            case 'touchspin.downonce':
              instance.downOnce();
              break;
            case 'touchspin.startupspin':
              instance.startUpSpin();
              break;
            case 'touchspin.startdownspin':
              instance.startDownSpin();
              break;
            case 'touchspin.stopspin':
              instance.stopSpin();
              break;
            case 'touchspin.updatesettings':
              instance.updateSettings(arg || {});
              break;
            default:
              break;
          }
        }
      });
    };
  }
}

export default registerJQueryWrapper;


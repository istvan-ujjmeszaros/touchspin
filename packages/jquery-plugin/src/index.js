// @ts-check
import { initCoreOnJqueryInput } from '../../core/src/TouchSpinCore.migrated.js';

/**
 * Install jQuery plugin that delegates to core initializer.
 * Preserves Command API and callable event emissions.
 * @param {import('jquery').JQueryStatic} $
 */
export function installJqueryTouchSpin($) {
  $.fn.TouchSpin = function(options, arg) {
    if (typeof options === 'string') {
      const cmd = String(options).toLowerCase();
      let ret;
      this.each(function() {
        const $el = $(this);
        const api = $el.data('touchspinInternal');
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

    return this.each(function() {
      initCoreOnJqueryInput($, /** @type {HTMLInputElement} */ (this), options, arg);
    });
  };
}


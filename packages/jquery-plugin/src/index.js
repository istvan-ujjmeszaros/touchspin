// @ts-check
import { createPublicApi, CORE_EVENTS } from '../../core/src/index.js';

/**
 * Install a jQuery plugin wrapper powered by the new core.
 * Preserves Command API and callable event emissions.
 * @param {import('jquery').JQueryStatic} $
 */
export function installJqueryTouchSpin($) {
  /** Basic defaults mirroring core */
  const DEFAULTS = {
    min: 0,
    max: 100,
    step: 1,
    decimals: 0,
    forcestepdivisibility: 'round',
    stepinterval: 100,
    stepintervaldelay: 500,
    booster: true,
    boostat: 10,
    maxboostedstep: false,
    prefix: '',
    postfix: '',
    verticalbuttons: false,
    verticalup: '▲',
    verticaldown: '▼',
  };

  $.fn.TouchSpin = function(options, arg) {
    if (typeof options === 'string') {
      const cmd = String(options).toLowerCase();
      let ret;
      this.each(function() {
        const $el = $(this);
        const api = $el.data('touchspinInternal');
        if (!api) return;
        switch (cmd) {
          case 'destroy': api.destroy(); teardown($el); break;
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
      const $input = $(this);
      try { if ($input.data('touchspinInternal')) teardown($input); } catch {}
      const opts = $.extend({}, DEFAULTS, options || {});

      // Optional UI via RendererFactory; if absent, run core-only with no wrapper UI
      /* global RendererFactory */
      let elements = { up: null, down: null };
      if (typeof window !== 'undefined' && window.RendererFactory) {
        const renderer = window.RendererFactory.createRenderer($, opts, $input);
        const container = renderer.buildInputGroup();
        elements = renderer.initElements(container);
        try { renderer.hideEmptyPrefixPostfix(); } catch {}
      }

      // Create core API
      const inst = createPublicApi(/** @type {HTMLInputElement} */ ($input[0]), opts);
      $input.data('touchspin', inst);
      $input.data('touchspinInternal', inst);

      // Bridge core events to jQuery events
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
      const unsubs = [];
      Object.keys(evMap).forEach(k => {
        // @ts-ignore
        unsubs.push(inst.on(k, () => $input.trigger(evMap[k])));
      });

      // Wire buttons if present
      if (elements && elements.up && elements.up.length) elements.up.on('click.touchspin', () => inst.upOnce());
      if (elements && elements.down && elements.down.length) elements.down.on('click.touchspin', () => inst.downOnce());

      // Callable events
      $input.on('touchspin.uponce', () => inst.upOnce());
      $input.on('touchspin.downonce', () => inst.downOnce());
      $input.on('touchspin.startupspin', () => inst.startUpSpin());
      $input.on('touchspin.startdownspin', () => inst.startDownSpin());
      $input.on('touchspin.stopspin', () => inst.stopSpin());
      $input.on('touchspin.updatesettings', (e, o) => inst.updateSettings(o || {}));

      // record cleanup hooks
      $input.data('__ts_unsubs', unsubs);
    });

    function teardown($input) {
      try {
        const inst = $input.data('touchspinInternal');
        if (inst) { try { inst.destroy(); } catch {} }
      } catch {}
      try {
        const unsubs = $input.data('__ts_unsubs') || [];
        unsubs.forEach((u) => { try { u(); } catch {} });
      } catch {}
      // Remove container wrapper if present and restore input
      const $wrap = $input.closest('[data-touchspin-injected="wrapper"]');
      if ($wrap.length) {
        $wrap.before($input);
        $wrap.remove();
      }
      $input.off('.touchspin');
      $input.removeData('touchspin');
      $input.removeData('touchspinInternal');
      $input.removeData('__ts_unsubs');
    }
  };
}

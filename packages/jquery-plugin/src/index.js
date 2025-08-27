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
    firstclickvalueifempty: null,
    step: 1,
    decimals: 0,
    forcestepdivisibility: 'round',
    stepinterval: 100,
    stepintervaldelay: 500,
    booster: true,
    boostat: 10,
    maxboostedstep: false,
    buttondown_txt: '&minus;',
    buttonup_txt: '&plus;',
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
      let elements = { up: null, down: null, input: $input };
      let $container = null;
      if (typeof window !== 'undefined' && window.RendererFactory) {
        const renderer = window.RendererFactory.createRenderer($, opts, $input);
        const container = renderer.buildInputGroup();
        $container = container;
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
      if (elements && elements.up && elements.up.length) {
        elements.up.on('click.touchspin', () => inst.upOnce());
        // Hold-to-spin (up)
        elements.up.on('mousedown.touchspin touchstart.touchspin', (e) => { e.preventDefault(); inst.startUpSpin(); });
        elements.up.on('mouseup.touchspin mouseleave.touchspin touchend.touchspin touchcancel.touchspin', () => inst.stopSpin());
      }
      if (elements && elements.down && elements.down.length) {
        elements.down.on('click.touchspin', () => inst.downOnce());
        // Hold-to-spin (down)
        elements.down.on('mousedown.touchspin touchstart.touchspin', (e) => { e.preventDefault(); inst.startDownSpin(); });
        elements.down.on('mouseup.touchspin mouseleave.touchspin touchend.touchspin touchcancel.touchspin', () => inst.stopSpin());
      }

      // Callable events
      $input.on('touchspin.uponce', () => inst.upOnce());
      $input.on('touchspin.downonce', () => inst.downOnce());
      $input.on('touchspin.startupspin', () => inst.startUpSpin());
      $input.on('touchspin.startdownspin', () => inst.startDownSpin());
      $input.on('touchspin.stopspin', () => inst.stopSpin());
      $input.on('touchspin.updatesettings', (e, o) => inst.updateSettings(o || {}));

      // Keyboard interactions (ArrowUp/Down once+auto; Enter sanitizes)
      let __dir = false;
      $input.on('keydown.touchspin', (ev) => {
        const e = ev.originalEvent || ev;
        const code = e.keyCode || e.which || 0;
        if (code === 38) { // ArrowUp
          if (__dir !== 'up') { inst.upOnce(); inst.startUpSpin(); __dir = 'up'; }
          ev.preventDefault();
        } else if (code === 40) { // ArrowDown
          if (__dir !== 'down') { inst.downOnce(); inst.startDownSpin(); __dir = 'down'; }
          ev.preventDefault();
        } else if (code === 13) { // Enter: sanitize
          try { const v = inst.getValue(); if (isFinite(v)) inst.setValue(v); } catch {}
        }
      });
      $input.on('keyup.touchspin', (ev) => {
        const e = ev.originalEvent || ev;
        const code = e.keyCode || e.which || 0;
        if (code === 38 || code === 40) { inst.stopSpin(); __dir = false; }
      });

      // Mouse wheel interaction
      $input.on('wheel.touchspin', (ev) => {
        const e = ev.originalEvent || ev;
        // Support legacy wheelDelta (positive up) and deltaY (negative up)
        const wheelDelta = typeof e.wheelDelta === 'number' ? e.wheelDelta : 0;
        const deltaY = typeof e.deltaY === 'number' ? e.deltaY : 0;
        const up = wheelDelta > 0 || deltaY < 0;
        if (up) inst.upOnce(); else inst.downOnce();
        ev.preventDefault();
      });

      // Container focusout: stop spin and sanitize when leaving the widget
      if ($container && $container.length) {
        $container.on('focusout.touchspin', (evt) => {
          const next = /** @type {HTMLElement|null} */(evt.relatedTarget);
          const contains = next ? $container[0].contains(next) : false;
          if (contains) return;
          setTimeout(() => {
            const ae = /** @type {HTMLElement|null} */ (document.activeElement);
            if (!ae || !$container[0].contains(ae)) {
              try { inst.stopSpin(); const v = inst.getValue(); if (isFinite(v)) inst.setValue(v); } catch {}
            }
          }, 0);
        });
      }

      // Attribute sync via MutationObserver
      let __observer = null;
      try {
        const el = /** @type {HTMLElement} */ ($input[0]);
        if ('MutationObserver' in window) {
          __observer = new MutationObserver(() => {
            const disabled = $input.is(':disabled');
            const readonly = $input.is('[readonly]');
            if (disabled || readonly) inst.stopSpin();
            /** @type {any} */
            const ns = {};
            const attrMin = $input.attr('min');
            const attrMax = $input.attr('max');
            const attrStep = $input.attr('step');
            ns.min = (attrMin !== undefined) ? Number(attrMin) : null;
            ns.max = (attrMax !== undefined) ? Number(attrMax) : null;
            ns.step = (attrStep !== undefined) ? Number(attrStep) : 1;
            inst.updateSettings(ns);
          });
          __observer.observe(el, { attributes: true, attributeFilter: ['disabled','readonly','min','max','step'] });
        }
      } catch {}

      // record cleanup hooks
      $input.data('__ts_unsubs', unsubs);
      if (__observer) $input.data('__ts_observer', __observer);
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
      try { const obs = $input.data('__ts_observer'); if (obs && obs.disconnect) obs.disconnect(); } catch {}
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

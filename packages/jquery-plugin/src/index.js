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
    // Framework-specific classes are provided by the active renderer; leave placeholders as null
    buttondown_class: null,
    buttonup_class: null,
    verticalupclass: null,
    verticaldownclass: null,
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
      let renderer = null;
      let __detached = null;
      if (typeof window !== 'undefined' && window.RendererFactory) {
        // Fill renderer-specific defaults for null placeholders (parity with original plugin)
        try {
          const temp = window.RendererFactory.createRenderer($, {}, $input);
          if (temp && typeof temp.getDefaultSettings === 'function') {
            const rd = temp.getDefaultSettings();
            Object.keys(rd).forEach((k) => { if (opts[k] === null) opts[k] = rd[k]; });
          }
        } catch {}

        renderer = window.RendererFactory.createRenderer($, opts, $input);
        // Detect advanced input-group (Bootstrap) or a custom advanced container
        let advancedContainer = null;
        try {
          const $parent = $input.parent();
          if ($parent && $parent.hasClass('input-group')) advancedContainer = $parent;
          if (!advancedContainer) {
            const $adv = $input.closest('[data-touchspin-advanced]');
            if ($adv && $adv.length) advancedContainer = $adv;
          }
        } catch {}
        const container = advancedContainer
          ? renderer.buildAdvancedInputGroup(advancedContainer)
          : renderer.buildInputGroup();
        $container = container;
        elements = renderer.initElements(container);
        try { __detached = renderer.hideEmptyPrefixPostfix(); } catch {}
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

      // Initialize core DOM event handling (replaces jQuery wrapper DOM logic)
      inst.initDOMEventHandling();

      // Callable events
      $input.on('touchspin.uponce', () => inst.upOnce());
      $input.on('touchspin.downonce', () => inst.downOnce());
      $input.on('touchspin.startupspin', () => inst.startUpSpin());
      $input.on('touchspin.startdownspin', () => inst.startDownSpin());
      $input.on('touchspin.stopspin', () => inst.stopSpin());
      $input.on('touchspin.updatesettings', (e, o) => {
        const newOpts = o || {};
        // Update core first (sanitizes and ARIA sync inside)
        inst.updateSettings(newOpts);
        // Merge for local defaults continuity
        Object.assign(opts, newOpts);
        // Update renderer-controlled UI bits (prefix/postfix text and classes)
        try {
          if (renderer && typeof renderer.updatePrefixPostfix === 'function') {
            renderer.updatePrefixPostfix(newOpts, __detached || {});
          }
          // Handle extra classes on prefix/postfix when provided
          if ($container && $container.length) {
            if (Object.prototype.hasOwnProperty.call(newOpts, 'prefix_extraclass')) {
              const prev = $input.data('__ts_prefix_extra');
              const next = newOpts.prefix_extraclass;
              const $el = $container.find('[data-touchspin-injected="prefix"]');
              if (prev) $el.removeClass(prev);
              if (next) $el.addClass(next);
              $input.data('__ts_prefix_extra', next || '');
            }
            if (Object.prototype.hasOwnProperty.call(newOpts, 'postfix_extraclass')) {
              const prev = $input.data('__ts_postfix_extra');
              const next = newOpts.postfix_extraclass;
              const $el = $container.find('[data-touchspin-injected="postfix"]');
              if (prev) $el.removeClass(prev);
              if (next) $el.addClass(next);
              $input.data('__ts_postfix_extra', next || '');
            }
          }
        } catch {}
      });
      $input.on('touchspin.destroy', () => teardown($input));

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
      if (renderer) $input.data('__ts_renderer', renderer);
      if (__detached) $input.data('__ts_detached', __detached);
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
      try { $input.removeData('__ts_renderer'); } catch {}
      try { $input.removeData('__ts_detached'); } catch {}
      // Remove container wrapper if present and restore input
      const $wrap = $input.closest('[data-touchspin-injected="wrapper"]');
      if ($wrap.length) {
        $wrap.before($input);
        $wrap.remove();
      } else {
        // Advanced enhancement cleanup: keep parent container (.input-group or [data-touchspin-advanced])
        let $adv = null;
        try {
          $adv = $input.closest('.input-group');
          if (!$adv || !$adv.length) $adv = $input.closest('[data-touchspin-advanced]');
          if (!$adv || !$adv.length) $adv = $input.closest('[data-touchspin-injected="enhanced-wrapper"]');
        } catch {}
        const $scope = ($adv && $adv.length) ? $adv : $input.parent();
        try { $scope.find('[data-touchspin-injected="down"],[data-touchspin-injected="down-wrapper"]').remove(); } catch {}
        try { $scope.find('[data-touchspin-injected="up"],[data-touchspin-injected="up-wrapper"]').remove(); } catch {}
        try { $scope.find('[data-touchspin-injected="prefix"]').remove(); } catch {}
        try { $scope.find('[data-touchspin-injected="postfix"]').remove(); } catch {}
        try { $scope.find('[data-touchspin-injected="vertical-wrapper"]').remove(); } catch {}
        try { if ($adv && $adv.length) { $adv.removeAttr('data-touchspin-injected'); $adv.removeClass('bootstrap-touchspin'); } } catch {}
      }
      $input.off('.touchspin');
      $input.removeData('touchspin');
      $input.removeData('touchspinInternal');
      $input.removeData('__ts_unsubs');
    }
  };
}

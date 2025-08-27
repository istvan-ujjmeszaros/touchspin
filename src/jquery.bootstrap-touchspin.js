// @ts-check
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = function (root, jQuery) {
      if (jQuery === undefined) {
        if (typeof window !== 'undefined') {
          jQuery = require('jquery');
        } else {
          jQuery = require('jquery')(root);
        }
      }
      factory(jQuery);
      return jQuery;
    };
  } else {
    factory(jQuery);
  }
}(function ($) {
  'use strict';

  // Internal instance store to support future wrapper/core decoupling
  // Mirrors jQuery .data('touchspinInternal') without changing behavior
  var __touchspinInternalStore = (typeof WeakMap !== 'undefined') ? new WeakMap() : null;

  /**
   * @fileoverview Bootstrap TouchSpin — mobile-friendly numeric input spinner.
   * @typedef {import('jquery').JQuery} JQuery
   * @typedef {import('jquery').JQueryStatic} JQueryStatic
   * @requires jQuery
   */

  // Include renderer classes
  // These will be included during build process or loaded separately

  /**
   * How to handle step divisibility.
   * @typedef {'none'|'floor'|'round'|'ceil'} ForceStepDivisibility
   */

  /**
   * TouchSpin calculation callback.
   * @callback TouchSpinCalcCallback
   * @param {string} value Raw input value (string from the <input>).
   * @returns {string} Processed value to use/display.
   */

  /**
   * Renderer instance interface (built for the active Bootstrap flavor).
   * @typedef {Object} TouchSpinRenderer
   * @property {function(): JQuery} buildInputGroup
   * @property {function(JQuery): JQuery} buildAdvancedInputGroup
   * @property {function(JQuery): TouchSpinElements} initElements
   * @property {function(): { _detached_prefix: JQuery|null, _detached_postfix: JQuery|null }} hideEmptyPrefixPostfix
   * @property {function(Partial<TouchSpinOptions>, { _detached_prefix: JQuery|null, _detached_postfix: JQuery|null }): void} updatePrefixPostfix
   */

  /**
   * Renderer factory (global).
   * @typedef {Object} RendererFactoryType
   * @property {function(JQueryStatic, TouchSpinOptions, JQuery): TouchSpinRenderer} createRenderer
   */

  /**
   * Elements returned by renderer.initElements(container)
   * @typedef {Object} TouchSpinElements
   * @property {JQuery<HTMLInputElement>} input
   * @property {JQuery<HTMLButtonElement>} up
   * @property {JQuery<HTMLButtonElement>} down
   */

  /**
   * @typedef TouchSpinOptions
   * @property {number|null} [min=0] - Minimum allowed value (null for no minimum)
   * @property {number|null} [max=100] - Maximum allowed value (null for no maximum)
   * @property {string} [initval=''] - Initial value if input is empty
   * @property {string} [replacementval=''] - Value to show when input is empty
   * @property {number|null} [firstclickvalueifempty=null] - Value to set on first click if input is empty
   * @property {number} [step=1] - Step increment/decrement amount
   * @property {number} [decimals=0] - Number of decimal places to display
   * @property {number} [stepinterval=100] - Milliseconds between steps when holding button
   * @property {ForceStepDivisibility} [forcestepdivisibility='round'] - How to handle step divisibility
   * @property {number} [stepintervaldelay=500] - Delay in milliseconds before step interval begins
   * @property {boolean} [verticalbuttons=false] - Whether to display buttons vertically
   * @property {string} [verticalup='&plus;'] - HTML content for vertical up button
   * @property {string} [verticaldown='&minus;'] - HTML content for vertical down button
   * @property {string} [verticalupclass=null] - CSS classes for vertical up button (framework-specific, provided by renderer)
   * @property {string} [verticaldownclass=null] - CSS classes for vertical down button (framework-specific, provided by renderer)
   * @property {string} [prefix=''] - Text or HTML to display before the input
   * @property {string} [postfix=''] - Text or HTML to display after the input
   * @property {string} [prefix_extraclass=''] - Additional CSS classes for prefix element
   * @property {string} [postfix_extraclass=''] - Additional CSS classes for postfix element
   * @property {boolean} [booster=true] - Enable accelerated value changes for rapid input
   * @property {number} [boostat=10] - Number of steps before booster mode activates
   * @property {number|false} [maxboostedstep=false] - Maximum step size during boost mode
   * @property {boolean} [mousewheel=true] - Enable mouse wheel support for value changes
   * @property {string} [buttondown_class=null] - CSS classes for decrement button (framework-specific, provided by renderer)
   * @property {string} [buttonup_class=null] - CSS classes for increment button (framework-specific, provided by renderer)
   * @property {string} [buttondown_txt='&minus;'] - HTML content for decrement button
   * @property {string} [buttonup_txt='&plus;'] - HTML content for increment button
   * @property {TouchSpinRenderer|null} [renderer=null] - Custom renderer instance for Bootstrap version compatibility
   * @property {TouchSpinCalcCallback} [callback_before_calculation] - Function called before value calculation
   * @property {TouchSpinCalcCallback} [callback_after_calculation] - Function called after value calculation
   */

  /**
   * Fired when minimum value is reached.
   * @event touchspin.on.min
   */

  /**
   * Fired when maximum value is reached.
   * @event touchspin.on.max
   */

  /**
   * Fired when spinning starts (any direction).
   * @event touchspin.on.startspin
   */

  /**
   * Fired when spinning stops (any direction).
   * @event touchspin.on.stopspin
   */

  /** @event touchspin.on.startupspin */
  /** @event touchspin.on.startdownspin */
  /** @event touchspin.on.stopupspin */
  /** @event touchspin.on.stopdownspin */


  /**
   * jQuery TouchSpin plugin for creating mobile-friendly numeric input spinners.
   * @function TouchSpin
   * @memberof jQuery.fn
   * @this {JQuery<HTMLInputElement>} jQuery collection of <input> elements
   * @param {TouchSpinOptions=} options
   * @returns {JQuery<HTMLInputElement>} The original jQuery collection (chainable).
   * @fires touchspin.on.min
   * @fires touchspin.on.max
   * @fires touchspin.on.startspin
   * @fires touchspin.on.stopspin
   * @fires touchspin.on.startupspin
   * @fires touchspin.on.startdownspin
   * @fires touchspin.on.stopupspin
   * @fires touchspin.on.stopdownspin
   * @throws {Error} If a renderer factory cannot be found or a renderer cannot be created.
   * @example
   * // Basic usage
   * $('#myinput').TouchSpin();
   *
   * @example
   * // With configuration
   * $('#myinput').TouchSpin({
   *   min: 0,
   *   max: 100,
   *   step: 5,
   *   prefix: '$',
   *   postfix: '.00'
   * });
   *
   * @example
   * // Event handling
   * $('#myinput').on('touchspin.on.min', function() {
   *   console.log('Minimum value reached');
   * });
   *
   */
  $.fn.TouchSpin = function (options, arg) {

    /** @type {TouchSpinOptions} */
    var defaults = {
      min: 0, // If null, there is no minimum enforced
      max: 100, // If null, there is no maximum enforced
      initval: '',
      replacementval: '',
      firstclickvalueifempty: null,
      step: 1,
      decimals: 0,
      stepinterval: 100,
      forcestepdivisibility: 'round', // none | floor | round | ceil
      stepintervaldelay: 500,
      verticalbuttons: false,
      verticalup: '&plus;',
      verticaldown: '&minus;',
      verticalupclass: null,   // Framework-specific, will be provided by renderer
      verticaldownclass: null, // Framework-specific, will be provided by renderer
      prefix: '',
      postfix: '',
      prefix_extraclass: '',
      postfix_extraclass: '',
      booster: true,
      boostat: 10,
      maxboostedstep: false,
      mousewheel: true,
      buttondown_class: null,  // Framework-specific, will be provided by renderer
      buttonup_class: null,    // Framework-specific, will be provided by renderer
      buttondown_txt: '&minus;',
      buttonup_txt: '&plus;',
      // Renderer system options
      renderer: null, // Custom renderer instance
      /** @type {TouchSpinCalcCallback} */
      callback_before_calculation: function (value) {
        return value;
      },
      /** @type {TouchSpinCalcCallback} */
      callback_after_calculation: function (value) {
        return value;
      }
    };

    /**
     * Maps TouchSpin option names to data attribute names.
     * Example: data-bts-step-interval="100" → stepinterval: 100
     * @type {Record<string,string>}
     * @private
     */
    var attributeMap = {
      min: 'min',
      max: 'max',
      initval: 'init-val',
      replacementval: 'replacement-val',
      firstclickvalueifempty: 'first-click-value-if-empty',
      step: 'step',
      decimals: 'decimals',
      stepinterval: 'step-interval',
      verticalbuttons: 'vertical-buttons',
      verticalupclass: 'vertical-up-class',
      verticaldownclass: 'vertical-down-class',
      forcestepdivisibility: 'force-step-divisibility',
      stepintervaldelay: 'step-interval-delay',
      prefix: 'prefix',
      postfix: 'postfix',
      prefix_extraclass: 'prefix-extra-class',
      postfix_extraclass: 'postfix-extra-class',
      booster: 'booster',
      boostat: 'boostat',
      maxboostedstep: 'max-boosted-step',
      mousewheel: 'mouse-wheel',
      buttondown_class: 'button-down-class',
      buttonup_class: 'button-up-class',
      buttondown_txt: 'button-down-txt',
      buttonup_txt: 'button-up-txt'
    };

    // Command API: allow calling internal methods directly
    if (typeof options === 'string') {
      var cmd = String(options).toLowerCase();
      var ret;
      this.each(function () {
        var $el = $(this);
        var api = $el.data('touchspinInternal');
        if (!api) return; // not initialized
        switch (cmd) {
          case 'destroy':
            api.destroy();
            break;
          case 'uponce':
            api.upOnce();
            break;
          case 'downonce':
            api.downOnce();
            break;
          case 'startupspin':
            api.startUpSpin();
            break;
          case 'startdownspin':
            api.startDownSpin();
            break;
          case 'stopspin':
            api.stopSpin();
            break;
          case 'updatesettings':
            api.updateSettings(arg || {});
            break;
          case 'getvalue':
          case 'get':
            if (ret === undefined) ret = api.getValue();
            break;
          case 'setvalue':
          case 'set':
            api.setValue(arg);
            break;
        }
      });
      return ret === undefined ? this : ret;
    }

    return this.each(function () {

      /** @type {TouchSpinOptions} Final merged settings */
      var settings,
        /** @type {JQuery<HTMLInputElement>} Original input element */
        originalinput = $(this),
        /** @type {Record<string, any>} Data attributes from original input */
        originalinput_data = originalinput.data(),
        /** @type {JQuery|null} Detached prefix element */
        _detached_prefix,
        /** @type {JQuery|null} Detached postfix element */
        _detached_postfix,
        /** @type {JQuery} TouchSpin container element */
        container,
        /** @type {TouchSpinElements} TouchSpin DOM elements */
        elements,
        /** @type {TouchSpinRenderer|undefined} Bootstrap version-specific renderer */
        renderer,
        /** @type {number} Current numeric value */
        value,
        /** @type {ReturnType<typeof setInterval>|undefined} */ downSpinTimer,
        /** @type {ReturnType<typeof setInterval>|undefined} */ upSpinTimer,
        /** @type {ReturnType<typeof setTimeout>|undefined} */ downDelayTimeout,
        /** @type {ReturnType<typeof setTimeout>|undefined} */ upDelayTimeout,
        /** @type {number} Current spin count for booster calculation */
        spincount = 0,
        /** @type {false|'up'|'down'} Current spinning direction */
        spinning = false,
        /** @type {MutationObserver|undefined} MutationObserver for attribute changes */
        mutationObserver,
        /** @type {Array<[Element,string,EventListenerOrEventListenerObject,any]>} */
        _nativeListeners = [],
        /** @type {HTMLInputElement} */
        inputEl,
        /** @type {HTMLElement|undefined} */
        containerEl,
        /** @type {HTMLElement|undefined} */
        upEl,
        /** @type {HTMLElement|undefined} */
        downEl;

      init();

      /**
       * Initializes the TouchSpin plugin for a single input element.
       * @private
       */
      function init() {
        if (originalinput.data('alreadyinitialized')) {
          // If already initialized, destroy current instance and reinitialize with new settings
          originalinput.trigger('touchspin.destroy');
          // Continue with normal initialization after destroy
        }

        originalinput.data('alreadyinitialized', true);

        if (!originalinput.is('input')) {
          console.log('Must be an input.');
          return;
        }

        // Cache DOM element reference
        inputEl = /** @type {HTMLInputElement} */ (originalinput[0]);

        _initSettings();
        _initRenderer();
        _setInitval();
        _checkValue();
        _buildHtml();
        _initElements();
        _initAriaAttributes();
        _updateButtonDisabledState();
        _hideEmptyPrefixPostfix();
        _syncNativeAttributes();
        _setupMutationObservers();
        _bindEvents();
        _bindEventsInterface();

        // Expose internal instance methods for facades/wrappers
        originalinput.data('touchspinInternal', {
          upOnce: upOnce,
          downOnce: downOnce,
          startUpSpin: startUpSpin,
          startDownSpin: startDownSpin,
          stopSpin: stopSpin,
          updateSettings: changeSettings,
          destroy: function() { _destroy(); },
          getValue: function() {
            var raw = String(inputEl.value ?? '');
            if (raw === '') return NaN;
            var num = parseFloat(settings.callback_before_calculation(raw));
            return isFinite(num) ? num : NaN;
          },
          setValue: function(v) {
            if (inputEl.disabled || inputEl.hasAttribute('readonly')) return;
            stopSpin();
            var parsed = Number(v);
            if (!isFinite(parsed)) return;
            // Apply step divisibility first, then clamp to bounds (mirrors _checkValue)
            var adjusted = parseFloat(_forcestepdivisibility(parsed));
            if ((settings.min !== null) && (adjusted < settings.min)) {
              adjusted = settings.min;
            }
            if ((settings.max !== null) && (adjusted > settings.max)) {
              adjusted = settings.max;
            }
            var prev = String(inputEl.value ?? '');
            var next = _setDisplay(adjusted);
            if (prev !== next) {
              originalinput.trigger('change');
            }
          }
        });
        if (__touchspinInternalStore) {
          try { __touchspinInternalStore.set(originalinput[0], originalinput.data('touchspinInternal')); } catch (e) {}
        }
      }

      /**
       * Sets the initial value from settings if input is empty.
       * @private
       */
      function _setInitval() {
        if (settings.initval !== '' && inputEl.value === '') {
          inputEl.value = settings.initval;
        }
      }

      /**
       * Updates TouchSpin settings and applies changes.
       * @private
       * @param {Partial<TouchSpinOptions>} newsettings - New settings to apply
       */
      function changeSettings(newsettings) {
        _updateSettings(newsettings);
        _checkValue(true);

        /** @type {string} */
        var raw = String(inputEl.value ?? '');

        if (raw !== '') {
          var num = parseFloat(settings.callback_before_calculation(raw));
          if (isFinite(num)) {
            _setDisplay(num);
          }
        }
      }

      /**
       * Computes the next numeric value in a given direction without touching the DOM.
       * Pure calculation using current settings and spin state.
       * @private
       * @param {'up'|'down'} dir
       * @param {number} current
       * @returns {number} next numeric value (clamped to min/max)
       */
      function _nextValue(dir, current) {
        var v = current;
        if (isNaN(v)) {
          v = valueIfIsNaN();
        } else {
          var step = _getBoostedStep();
          v = dir === 'up' ? (v + step) : (v - step);
        }
        if ((settings.max !== null) && (v >= settings.max)) {
          v = settings.max;
        }
        if ((settings.min !== null) && (v <= settings.min)) {
          v = settings.min;
        }
        return v;
      }

      /**
       * Formats a numeric value for display using decimals and callbacks.
       * @private
       * @param {number} num
       * @returns {string}
       */
function _formatDisplay(num) {
  return settings.callback_after_calculation(parseFloat(num).toFixed(settings.decimals));
}

      /**
       * Applies a numeric value to the input's display and updates ARIA.
       * Caller remains responsible for emitting change events if needed.
       * @private
       * @param {number} num
       * @returns {string} the display string written to the input
       */
      function _setDisplay(num) {
        var next = _formatDisplay(num);
        if (inputEl) {
          inputEl.value = next;
        } else {
          originalinput.val(next);
        }
        _updateAriaAttributes();
        return next;
      }

      /**
       * Aligns a value to step boundaries using integer arithmetic to avoid float issues.
       * @private
       * @param {number|null} val - Value to align
       * @param {number} step - Step size
       * @param {string} dir - Direction: 'up' or 'down'
       * @returns {number|null} Aligned value
       */
      function _alignToStep(val, step, dir) {
        if (val == null) return val;
        // scale to integers to avoid float mod issues
        var k = 1, s = step;
        while ((s * k) % 1 !== 0 && k < 1e6) k *= 10;
        var V = Math.round(val * k), S = Math.round(step * k);
        if (S === 0) return val;
        var r = V % S;
        if (r === 0) return val;
        return ((dir === 'down' ? (V - r) : (V + (S - r))) / k);
      }

      /**
       * Initializes settings by merging defaults, data attributes, and options.
       * @private
       */
      function _initSettings() {
        settings = Object.assign({}, defaults, originalinput_data, _parseAttributes(), options);

        // Normalize step (guard against "any", 0, negatives, NaN)
        var stepNum = Number(settings.step);
        if (!isFinite(stepNum) || stepNum <= 0) settings.step = 1;

        // Normalize min/max to numbers for consistency (null/undefined preserved)
        if (settings.min != null) {
          var minNum = Number(settings.min);
          settings.min = isFinite(minNum) ? minNum : null;
        }
        if (settings.max != null) {
          var maxNum = Number(settings.max);
          settings.max = isFinite(maxNum) ? maxNum : null;
        }

        // Normalize decimals (ensure non-negative integer)
        var dec = parseInt(String(settings.decimals), 10);
        settings.decimals = isFinite(dec) && dec >= 0 ? dec : 0;

        // Normalize timing and boost options
        settings.stepinterval = Math.max(0, parseInt(String(settings.stepinterval), 10) || 0);
        settings.stepintervaldelay = Math.max(0, parseInt(String(settings.stepintervaldelay), 10) || 0);
        settings.boostat = Math.max(1, parseInt(String(settings.boostat), 10) || 10);
        if (settings.maxboostedstep !== false) {
          var mbs = Number(settings.maxboostedstep);
          settings.maxboostedstep = isFinite(mbs) && mbs > 0 ? mbs : false;
        }

        if (parseFloat(settings.step) !== 1) {
          settings.max = _alignToStep(settings.max, settings.step, 'down');
          settings.min = _alignToStep(settings.min, settings.step, 'up');
        }
      }

      /**
       * Parses data attributes and native input attributes into settings.
       * @private
       * @returns {Partial<TouchSpinOptions>} Parsed attribute values
       */
      function _parseAttributes() {
        var data = {};

        // Setting up based on data attributes
        $.each(attributeMap, function (key, value) {
          var attrName = 'bts-' + value;

          if (originalinput.is('[data-' + attrName + ']')) {
            data[key] = originalinput.data(attrName);
          }
        });

        // Setting up based on input attributes if specified (input attributes have precedence)
        $.each(['min', 'max', 'step'], function (i, key) {
          if (originalinput.is('['+key+']')) {
            if (data[key] !== undefined) {
              console.warn('Both the "data-bts-' + key + '" data attribute and the "' + key + '" individual attribute were specified, the individual attribute will take precedence on: ', originalinput);
            }
            data[key] = originalinput.attr(key);
          }
        });

        return data;
      }

      /**
       * Initializes the Bootstrap version-specific renderer.
       * @private
       * @throws {Error} If renderer factory is unavailable or renderer creation fails
       */
      function _initRenderer() {
        // Initialize the Bootstrap version-specific renderer
        if (settings.renderer) {
          // Use custom renderer if provided
          renderer = settings.renderer;
          return;
        }

        // Check for RendererFactory availability
        const rf = /** @type {any} */ (typeof globalThis !== 'undefined' ? globalThis : {});
        /** @type {RendererFactoryType|undefined} */
        const factory = rf && rf.RendererFactory && typeof rf.RendererFactory.createRenderer === 'function' ? rf.RendererFactory : undefined;

        if (!factory || !factory.createRenderer) {
          throw new Error('Bootstrap TouchSpin: RendererFactory not available. This indicates a build system error. Please ensure the renderer files are properly built and included.');
        }

        // Create temporary renderer to get framework-specific defaults
        const tempRenderer = factory.createRenderer($, {}, originalinput);
        if (tempRenderer && typeof tempRenderer.getDefaultSettings === 'function') {
          const rendererDefaults = tempRenderer.getDefaultSettings();

          // Only apply renderer defaults for null values (framework-agnostic placeholders)
          // This preserves user customizations while filling in framework-specific defaults
          Object.keys(rendererDefaults).forEach(key => {
            if (settings[key] === null) {
              // Fill in framework-specific default for null placeholder
              settings[key] = rendererDefaults[key];
            }
          });
        }

        renderer = factory.createRenderer($, settings, originalinput);

        if (!renderer) {
          throw new Error('Bootstrap TouchSpin: Failed to create renderer');
        }
      }

      /**
       * Destroys the TouchSpin instance and restores original input.
       * @private
       */
      function _destroy() {
        var $parent = originalinput.parent();

        stopSpin();

        // Remove all plugin handlers bound on the input
        originalinput.off('keydown.touchspin keyup.touchspin mousewheel.touchspin DOMMouseScroll.touchspin wheel.touchspin touchspin.destroy touchspin.uponce touchspin.downonce touchspin.startupspin touchspin.startdownspin touchspin.stopspin touchspin.updatesettings');

        // Clean up container event handlers
        if (container) {
          container.off('.touchspin');
        }

        // Remove native listeners bound by this instance
        _offAllNative();

        // Disconnect MutationObserver
        if (mutationObserver) {
          mutationObserver.disconnect();
          mutationObserver = undefined;
        }

        // Teardown logic differs for injected vs existing wrappers
        const injectedMarker = $parent.attr('data-touchspin-injected');

        if (injectedMarker === 'wrapper') {
          // Injected wrapper: remove only plugin-injected siblings, then unwrap
          originalinput.siblings('[data-touchspin-injected]').remove();
          originalinput.unwrap();
        } else {
          // Existing container or non-wrapper: remove injected elements, keep container
          $('[data-touchspin-injected]', $parent).remove();
          $parent.removeClass('bootstrap-touchspin');
          $parent.removeAttr('data-touchspin-injected');
        }

        originalinput.data('alreadyinitialized', false);
        // Cleanup internal facade reference
        originalinput.removeData('touchspinInternal');
        if (__touchspinInternalStore) {
          try { __touchspinInternalStore.delete(originalinput[0]); } catch (e) {}
        }
      }

      /**
       * Updates internal settings and synchronizes with DOM.
       * @private
       * @param {Partial<TouchSpinOptions>} newsettings - Settings to update
       */
      function _updateSettings(newsettings) {
        settings = Object.assign({}, settings, newsettings);

        // Re-align bounds to step if any of these changed
        if (
          (newsettings.step !== undefined ||
           newsettings.min  !== undefined ||
           newsettings.max  !== undefined) &&
          parseFloat(settings.step) !== 1
        ) {
          settings.max = _alignToStep(settings.max, settings.step, 'down');
          settings.min = _alignToStep(settings.min, settings.step, 'up');
        }

        // Update postfix and prefix texts if those settings were changed.
        if ('postfix' in newsettings || 'prefix' in newsettings) {
          if (!renderer) {
            throw new Error('Bootstrap TouchSpin: Renderer not available for updating prefix/postfix.');
          }
          renderer.updatePrefixPostfix(newsettings, {
            _detached_prefix: _detached_prefix,
            _detached_postfix: _detached_postfix
          });
        }

        // Update button text if those settings were changed
        if ('buttonup_txt' in newsettings || 'buttondown_txt' in newsettings || 'verticalup' in newsettings || 'verticaldown' in newsettings) {
          if (newsettings.buttonup_txt !== undefined && elements.up) {
            elements.up.html(newsettings.buttonup_txt);
          }
          if (newsettings.buttondown_txt !== undefined && elements.down) {
            elements.down.html(newsettings.buttondown_txt);
          }
          if (newsettings.verticalup !== undefined && elements.up) {
            elements.up.html(newsettings.verticalup);
          }
          if (newsettings.verticaldown !== undefined && elements.down) {
            elements.down.html(newsettings.verticaldown);
          }
        }

        // Sync native attributes when TouchSpin settings change
        if (newsettings.min !== undefined || newsettings.max !== undefined || newsettings.step !== undefined) {
          _syncNativeAttributes();
          _updateAriaAttributes();
        }

        _hideEmptyPrefixPostfix();
      }

      /**
       * Builds the HTML structure for TouchSpin using the renderer system.
       * @private
       */
      function _buildHtml() {
        var initval = inputEl.value,
          parentelement = originalinput.parent();

        if (initval !== '') {
          var raw = settings.callback_before_calculation(initval);
          var num = parseFloat(raw);
          initval = isFinite(num)
            ? settings.callback_after_calculation(num.toFixed(settings.decimals))
            : settings.callback_after_calculation(raw);
        }

        originalinput.data('initvalue', initval).val(initval);
        originalinput.addClass('form-control');

        // Use the renderer system - should always be available
        if (!renderer) {
          throw new Error('Bootstrap TouchSpin: Renderer not initialized. This indicates an initialization error.');
        }

        if (parentelement.hasClass('input-group')) {
          container = renderer.buildAdvancedInputGroup(parentelement);
        } else {
          container = renderer.buildInputGroup();
        }
      }




      /**
       * Initializes TouchSpin DOM elements using the renderer.
       * @private
       */
      function _initElements() {
        if (!renderer) {
          throw new Error('Bootstrap TouchSpin: Renderer not available for element initialization.');
        }
        elements = renderer.initElements(container);
        // Cache element handles
        containerEl = container && container[0];
        upEl = elements && elements.up && elements.up[0];
        downEl = elements && elements.down && elements.down[0];
      }

      /**
       * Initializes ARIA attributes for accessibility.
       * @private
       */
      function _initAriaAttributes() {
        // Set ARIA attributes on the input for screen readers
        if (!inputEl.getAttribute('role')) {
          inputEl.setAttribute('role', 'spinbutton');
        }

        // Set aria-valuemin and aria-valuemax if they exist
        if (settings.min !== null && settings.min !== undefined) {
          inputEl.setAttribute('aria-valuemin', String(settings.min));
        }
        if (settings.max !== null && settings.max !== undefined) {
          inputEl.setAttribute('aria-valuemax', String(settings.max));
        }

        // Set current value (don't force 0 on empty input)
        var rawInit = inputEl.value;
        var nInit = rawInit !== '' ? parseFloat(String(rawInit)) : NaN;
        if (!isNaN(nInit)) {
          inputEl.setAttribute('aria-valuenow', String(nInit));
        } else {
          inputEl.removeAttribute('aria-valuenow');
        }

        // Add descriptive labels to buttons for screen readers
        if (elements && elements.up && elements.down) {
          elements.up.attr('aria-label', 'Increase value');
          elements.down.attr('aria-label', 'Decrease value');
        }
      }

      /**
       * Updates ARIA attributes when value changes.
       * @private
       */
      function _updateAriaAttributes() {
        var raw = String(inputEl.value ?? '');
        if (raw === '') {
          inputEl.removeAttribute('aria-valuenow');
          inputEl.removeAttribute('aria-valuetext');
        } else {
          var n = parseFloat(raw);
          if (!isNaN(n)) {
            inputEl.setAttribute('aria-valuenow', String(n));
          } else {
            inputEl.removeAttribute('aria-valuenow');
          }
          inputEl.setAttribute('aria-valuetext', raw);
        }

        // Update min/max if they've changed
        if (settings.min !== null && settings.min !== undefined) {
          inputEl.setAttribute('aria-valuemin', String(settings.min));
        } else {
          inputEl.removeAttribute('aria-valuemin');
        }
        if (settings.max !== null && settings.max !== undefined) {
          inputEl.setAttribute('aria-valuemax', String(settings.max));
        } else {
          inputEl.removeAttribute('aria-valuemax');
        }
      }

      /**
       * Hides empty prefix/postfix elements and stores detached elements.
       * @private
       */
      function _hideEmptyPrefixPostfix() {
        if (!renderer) {
          throw new Error('Bootstrap TouchSpin: Renderer not available for prefix/postfix handling.');
        }
        var detached = renderer.hideEmptyPrefixPostfix();
        _detached_prefix = detached._detached_prefix;
        _detached_postfix = detached._detached_postfix;
      }

      /**
       * Binds all TouchSpin interaction events (keyboard, mouse, touch).
       * @private
       */
      function _bindEvents() {
        inputEl = /** @type {HTMLInputElement} */ (originalinput[0]);
        containerEl = /** @type {HTMLElement} */ (container && container[0]);
        upEl = /** @type {HTMLElement} */ (elements.up && elements.up[0]);
        downEl = /** @type {HTMLElement} */ (elements.down && elements.down[0]);

        function _onNative(el, type, handler, options) {
          if (!el) return;
          el.addEventListener(type, handler, options);
          _nativeListeners.push([el, type, handler, options]);
        }

        // Keyboard on input
        _onNative(inputEl, 'keydown', function (ev) {
          var e = /** @type {KeyboardEvent} */ (ev);
          var code = e.keyCode || e.which || 0;
          if (code === 38) {
            if (spinning !== 'up') {
              upOnce();
              startUpSpin();
            }
            e.preventDefault();
          } else if (code === 40) {
            if (spinning !== 'down') {
              downOnce();
              startDownSpin();
            }
            e.preventDefault();
          } else if (code === 13) {
            _checkValue(true);
          }
        });

        _onNative(inputEl, 'keyup', function (ev) {
          var e = /** @type {KeyboardEvent} */ (ev);
          var code = e.keyCode || e.which || 0;
          if (code === 38 || code === 40) {
            stopSpin();
          }
        });

        // Back-compat: handle jQuery-triggered blur to sanitize immediately
        originalinput.on('blur.touchspin', function () {
          _checkValue(true);
        });

        // Container focusout handler - sanitizes when leaving the entire widget
        function leavingWidget(nextEl) {
          return !nextEl || (containerEl ? !containerEl.contains(nextEl) : true);
        }

        _onNative(containerEl, 'focusout', function (e) {
          var next = /** @type {HTMLElement|null|undefined} */ ((/** @type {FocusEvent} */(e)).relatedTarget);
          if (!leavingWidget(next)) return;
          setTimeout(function () {
            var ae = /** @type {HTMLElement|null} */ (document.activeElement);
            if (leavingWidget(ae)) {
              stopSpin();
              _checkValue(true);
            }
          }, 0);
        });

        // Buttons: keyboard (keep jQuery bindings to support namespaced triggers)
        elements.down.on('keydown.touchspin', function (ev) {
          var code = ev.keyCode || ev.which;
          if (code === 32 || code === 13) {
            if (spinning !== 'down') {
              downOnce();
              startDownSpin();
            }
            ev.preventDefault();
          }
        });
        elements.down.on('keyup.touchspin', function (ev) {
          var code = ev.keyCode || ev.which;
          if (code === 32 || code === 13) {
            stopSpin();
          }
        });
        elements.up.on('keydown.touchspin', function (ev) {
          var code = ev.keyCode || ev.which;
          if (code === 32 || code === 13) {
            if (spinning !== 'up') {
              upOnce();
              startUpSpin();
            }
            ev.preventDefault();
          }
        });
        elements.up.on('keyup.touchspin', function (ev) {
          var code = ev.keyCode || ev.which;
          if (code === 32 || code === 13) {
            stopSpin();
          }
        });

        // Buttons: pointer (jQuery to support tests using namespaced triggers)
        elements.down.on('mousedown.touchspin', function (ev) {
          elements.down.off('touchstart.touchspin');
          if (inputEl.disabled || inputEl.hasAttribute('readonly')) return;
          downOnce();
          startDownSpin();
          ev.preventDefault();
          ev.stopPropagation();
        });
        elements.down.on('touchstart.touchspin', function (ev) {
          elements.down.off('mousedown.touchspin');
          if (inputEl.disabled || inputEl.hasAttribute('readonly')) return;
          downOnce();
          startDownSpin();
          ev.preventDefault();
          ev.stopPropagation();
        });
        elements.up.on('mousedown.touchspin', function (ev) {
          elements.up.off('touchstart.touchspin');
          if (inputEl.disabled || inputEl.hasAttribute('readonly')) return;
          upOnce();
          startUpSpin();
          ev.preventDefault();
          ev.stopPropagation();
        });
        elements.up.on('touchstart.touchspin', function (ev) {
          elements.up.off('mousedown.touchspin');
          if (inputEl.disabled || inputEl.hasAttribute('readonly')) return;
          upOnce();
          startUpSpin();
          ev.preventDefault();
          ev.stopPropagation();
        });
        elements.up.on('mouseup.touchspin mouseout.touchspin touchleave.touchspin touchend.touchspin touchcancel.touchspin', function (ev) {
          if (!spinning) return;
          ev.stopPropagation();
          stopSpin();
        });
        elements.down.on('mouseup.touchspin mouseout.touchspin touchleave.touchspin touchend.touchspin touchcancel.touchspin', function (ev) {
          if (!spinning) return;
          ev.stopPropagation();
          stopSpin();
        });
        elements.down.on('mousemove.touchspin touchmove.touchspin', function (ev) {
          if (!spinning) return;
          ev.stopPropagation();
          ev.preventDefault();
        });
        elements.up.on('mousemove.touchspin touchmove.touchspin', function (ev) {
          if (!spinning) return;
          ev.stopPropagation();
          ev.preventDefault();
        });

        // Mouse wheel on input (native)
        _onNative(inputEl, 'wheel', function (ev) {
          if (!settings.mousewheel || document.activeElement !== inputEl) return;
          var oe = /** @type {any} */ (ev);
          var delta = (oe.wheelDelta != null ? oe.wheelDelta : 0) || -oe.deltaY || -oe.detail || 0;
          ev.stopPropagation();
          ev.preventDefault();
          if (delta < 0) {
            downOnce();
          } else {
            upOnce();
          }
        });
      }

      /**
       * Binds TouchSpin API events for external control.
       * @private
       */
      function _bindEventsInterface() {
        originalinput.on('touchspin.destroy', function () {
          _destroy();
        });

        originalinput.on('touchspin.uponce', function () {
          stopSpin();
          upOnce();
        });

        originalinput.on('touchspin.downonce', function () {
          stopSpin();
          downOnce();
        });

        originalinput.on('touchspin.startupspin', function () {
          startUpSpin();
        });

        originalinput.on('touchspin.startdownspin', function () {
          startDownSpin();
        });

        originalinput.on('touchspin.stopspin', function () {
          stopSpin();
        });

        originalinput.on('touchspin.updatesettings', function (e, newsettings) {
          changeSettings(newsettings);
        });

      }

      /**
       * Remove all native listeners registered by this instance.
       * @private
       */
      function _offAllNative() {
        for (var i = 0; i < _nativeListeners.length; i++) {
          var rec = _nativeListeners[i];
          rec[0].removeEventListener(rec[1], rec[2], rec[3]);
        }
        _nativeListeners = [];
      }

      /**
       * Sets up MutationObserver to watch for attribute changes.
       * @private
       */
      function _setupMutationObservers() {
        if (typeof MutationObserver !== 'undefined') {
          // MutationObserver is available
          mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.type === 'attributes') {
                if (mutation.attributeName === 'disabled' || mutation.attributeName === 'readonly') {
                  _updateButtonDisabledState();
                } else if (mutation.attributeName === 'min' || mutation.attributeName === 'max' || mutation.attributeName === 'step') {
                  _syncSettingsFromNativeAttributes();
                }
              }
            });
          });

          mutationObserver.observe(originalinput[0], {
            attributes: true,
            attributeFilter: ['disabled','readonly','min','max','step']
          });
        }
      }

      /**
       * Applies step divisibility rules to a value.
       * @private
       * @param {number} value - Value to apply divisibility to
       * @returns {string} Value adjusted for step divisibility
       */
      function _forcestepdivisibility(value) {
        switch (settings.forcestepdivisibility) {
          case 'round':
            return (Math.round(value / settings.step) * settings.step).toFixed(settings.decimals);
          case 'floor':
            return (Math.floor(value / settings.step) * settings.step).toFixed(settings.decimals);
          case 'ceil':
            return (Math.ceil(value / settings.step) * settings.step).toFixed(settings.decimals);
          default:
            return value.toFixed(settings.decimals);
        }
      }

      /**
       * Validates and corrects the input value according to constraints.
       * @private
       * @param {boolean} [mayTriggerChange=false] - Whether to fire change event if display value changes
       * @fires touchspin.on.min
       * @fires touchspin.on.max
       */
      function _checkValue(mayTriggerChange) {
        var val, parsedval, returnval;
        var prevDisplay = String(inputEl.value ?? '');

        val = settings.callback_before_calculation(inputEl.value);

        if (val === '') {
          if (settings.replacementval !== '') {
            inputEl.value = String(settings.replacementval);
            _updateAriaAttributes();
          } else {
            inputEl.removeAttribute('aria-valuenow');
          }
          // For empty values, compare final result with initial value
          if (mayTriggerChange) {
            var finalDisplay = String(inputEl.value ?? '');
            if (finalDisplay !== prevDisplay) {
              originalinput.trigger('change');
            }
          }
          return;
        }

        if (settings.decimals > 0 && val === '.') {
          return;
        }

        parsedval = parseFloat(val);

        if (isNaN(parsedval)) {
          if (settings.replacementval !== '') {
            var rv = parseFloat(String(settings.replacementval));
            parsedval = isNaN(rv) ? 0 : rv;
          } else {
            parsedval = 0;
          }
        }

        returnval = parsedval;

        returnval = _forcestepdivisibility(parsedval);

        if ((settings.min !== null) && (parsedval < settings.min)) {
          returnval = settings.min;
        }

        if ((settings.max !== null) && (parsedval > settings.max)) {
          returnval = settings.max;
        }

        var currentValue = String(inputEl.value ?? '');
        var newValue = _setDisplay(parseFloat(returnval));

        if (mayTriggerChange) {
          var nextDisplay = String(inputEl.value ?? '');
          if (nextDisplay !== prevDisplay) {
            originalinput.trigger('change');
          }
        }
      }

      /**
       * Synchronizes TouchSpin settings with native input attributes.
       * @private
       */
      function _syncNativeAttributes() {
        // Always set native attributes when input type is number to ensure consistency
        if (inputEl.getAttribute('type') === 'number') {
          if (settings.min !== null && settings.min !== undefined) {
            inputEl.setAttribute('min', String(settings.min));
          } else {
            inputEl.removeAttribute('min');
          }

          if (settings.max !== null && settings.max !== undefined) {
            inputEl.setAttribute('max', String(settings.max));
          } else {
            inputEl.removeAttribute('max');
          }

          if (settings.step !== null && settings.step !== undefined) {
            inputEl.setAttribute('step', String(settings.step));
          } else {
            inputEl.removeAttribute('step');
          }
        }
      }

      /**
       * Updates TouchSpin settings when native attributes change externally.
       * @private
       */
      function _syncSettingsFromNativeAttributes() {
        // Update TouchSpin settings when native attributes change externally
        var nativeMin = inputEl.getAttribute('min');
        var nativeMax = inputEl.getAttribute('max');
        var nativeStep = inputEl.getAttribute('step');
        var needsUpdate = false;
        var newSettings = {};

        // Check min attribute
        if (nativeMin != null) {
          var parsedMin = nativeMin === '' ? null : parseFloat(nativeMin);
          // Normalize min to number for consistency (same as _initSettings)
          if (parsedMin != null) {
            var minNum = Number(parsedMin);
            parsedMin = isFinite(minNum) ? minNum : null;
          }
          if (parsedMin !== settings.min) {
            newSettings.min = parsedMin;
            needsUpdate = true;
          }
        } else if (settings.min !== null) {
          // Attribute was removed
          newSettings.min = null;
          needsUpdate = true;
        }

        // Check max attribute
        if (nativeMax != null) {
          var parsedMax = nativeMax === '' ? null : parseFloat(nativeMax);
          // Normalize max to number for consistency (same as _initSettings)
          if (parsedMax != null) {
            var maxNum = Number(parsedMax);
            parsedMax = isFinite(maxNum) ? maxNum : null;
          }
          if (parsedMax !== settings.max) {
            newSettings.max = parsedMax;
            needsUpdate = true;
          }
        } else if (settings.max !== null) {
          // Attribute was removed
          newSettings.max = null;
          needsUpdate = true;
        }

        // Check step attribute
        if (nativeStep != null) {
          var parsedStep = (nativeStep === '' || nativeStep === 'any') ? 1 : parseFloat(nativeStep);
          if (!isFinite(parsedStep) || parsedStep <= 0) parsedStep = 1;
          if (parsedStep !== settings.step) {
            newSettings.step = parsedStep;
            needsUpdate = true;
          }
        } else if (settings.step !== 1) {
          // Attribute was removed, default to 1
          newSettings.step = 1;
          needsUpdate = true;
        }

        if (needsUpdate) {
          // Update settings without triggering another sync to avoid infinite loop
          settings = Object.assign({}, settings, newSettings);

          // Re-process step divisibility rules if step, min, or max changed
          if (
            (newSettings.step !== undefined ||
             newSettings.min  !== undefined ||
             newSettings.max  !== undefined) &&
            parseFloat(settings.step) !== 1
          ) {
            settings.max = _alignToStep(settings.max, settings.step, 'down');
            settings.min = _alignToStep(settings.min, settings.step, 'up');
          }

          // Update ARIA attributes when min/max settings change
          _updateAriaAttributes();
          _checkValue(true);
        }
      }

      /**
       * Calculates the boosted step value based on spin count.
       * @private
       * @returns {number} Current step value (potentially boosted)
       */
      function _getBoostedStep() {
        if (!settings.booster) {
          return settings.step;
        } else {
          var boosted = Math.pow(2, Math.floor(spincount / settings.boostat)) * settings.step;

          if (settings.maxboostedstep) {
            if (boosted > settings.maxboostedstep) {
              boosted = settings.maxboostedstep;
              value = Math.round((value / boosted)) * boosted;
            }
          }

          return Math.max(settings.step, boosted);
        }
      }

      /**
       * Clears spin timers (delay + interval) without triggering events.
       * @private
       */
      function _clearSpinTimers() {
        clearTimeout(downDelayTimeout);
        clearTimeout(upDelayTimeout);
        clearInterval(downSpinTimer);
        clearInterval(upSpinTimer);
      }

      /**
       * Starts continuous spinning in the specified direction using shared helpers.
       * Preserves original event order and semantics.
       * @private
       * @param {'up'|'down'} dir
       */
      function _startSpin(dir) {
        if (inputEl.disabled || inputEl.hasAttribute('readonly')) {
          return;
        }

        // stop any previous spin and reset state
        _clearSpinTimers();
        spincount = 0;
        spinning = dir;

        // fire start events
        originalinput.trigger('touchspin.on.startspin');
        if (dir === 'up') {
          originalinput.trigger('touchspin.on.startupspin');
          upDelayTimeout = setTimeout(function () {
            upSpinTimer = setInterval(function () {
              spincount++;
              upOnce();
            }, settings.stepinterval);
          }, settings.stepintervaldelay);
        } else {
          originalinput.trigger('touchspin.on.startdownspin');
          downDelayTimeout = setTimeout(function () {
            downSpinTimer = setInterval(function () {
              spincount++;
              downOnce();
            }, settings.stepinterval);
          }, settings.stepintervaldelay);
        }
      }

      /**
       * Returns a fallback value when input is NaN.
       * @private
       * @returns {number} Fallback value (firstclickvalueifempty or midpoint)
       */
      function valueIfIsNaN() {
        if (typeof settings.firstclickvalueifempty === 'number') {
          return settings.firstclickvalueifempty;
        } else {
          const min = typeof settings.min === 'number' ? settings.min : 0;
          const max = typeof settings.max === 'number' ? settings.max : min;
          return (min + max) / 2;
        }
      }

      /**
       * Updates TouchSpin button disabled state based on input state.
       * @private
       */
      function _updateButtonDisabledState() {
        const isDisabled = inputEl.disabled || inputEl.hasAttribute('readonly');
        elements.up.prop('disabled', isDisabled);
        elements.down.prop('disabled', isDisabled);

        if (isDisabled) {
          stopSpin();
        }
      }

      /**
       * Increments the value by one step.
       * @private
       * @fires touchspin.on.max
       */
      function upOnce() {
        if (inputEl.disabled || inputEl.hasAttribute('readonly')) {
          return;
        }

        _checkValue();
        var prevDisplay = String(inputEl.value ?? '');
        value = parseFloat(settings.callback_before_calculation(inputEl.value));
        value = _nextValue('up', value);
        if ((settings.max !== null) && (value === settings.max)) {
          originalinput.trigger('touchspin.on.max');
          stopSpin();
        }
        var nextDisplay = _setDisplay(value);
        if (prevDisplay !== nextDisplay) originalinput.trigger('change');
      }

      /**
       * Decrements the value by one step.
       * @private
       * @fires touchspin.on.min
       */
      function downOnce() {
        if (inputEl.disabled || inputEl.hasAttribute('readonly')) {
          return;
        }

        _checkValue();
        var prevDisplay = String(inputEl.value ?? '');
        value = parseFloat(settings.callback_before_calculation(inputEl.value));
        value = _nextValue('down', value);
        if ((settings.min !== null) && (value === settings.min)) {
          originalinput.trigger('touchspin.on.min');
          stopSpin();
        }
        var nextDisplay = _setDisplay(value);
        if (prevDisplay !== nextDisplay) originalinput.trigger('change');
      }

      /**
       * Starts continuous downward spinning.
       * @private
       * @fires touchspin.on.startspin
       * @fires touchspin.on.startdownspin
       */
      function startDownSpin() {
        _startSpin('down');
      }

      /**
       * Starts continuous upward spinning.
       * @private
       * @fires touchspin.on.startspin
       * @fires touchspin.on.startupspin
       */
      function startUpSpin() {
        _startSpin('up');
      }

      /**
       * Stops all spinning and clears timers.
       * @private
       * @fires touchspin.on.stopupspin
       * @fires touchspin.on.stopdownspin
       * @fires touchspin.on.stopspin
       */
      function stopSpin() {
        _clearSpinTimers();

        switch (spinning) {
          case 'up':
            originalinput.trigger('touchspin.on.stopupspin');
            originalinput.trigger('touchspin.on.stopspin');
            break;
          case 'down':
            originalinput.trigger('touchspin.on.stopdownspin');
            originalinput.trigger('touchspin.on.stopspin');
            break;
        }

        spincount = 0;
        spinning = false;
      }

    });

  };

}));

// Renderer classes are included before this file during the build process
// They should be available as global classes: BootstrapRenderer, Bootstrap3Renderer, etc.
// and RendererFactory should be available

// Modern facade: expose a method-only API without requiring callers to use jQuery directly.
// This uses the existing plugin internally (no behavior change) and returns an
// object with stable methods. During migration, internals can move behind these methods.
(function () {
  if (typeof window === 'undefined') return;
  if (!window.jQuery || !window.jQuery.fn || typeof window.jQuery.fn.TouchSpin !== 'function') return;

  window.TouchSpin = window.TouchSpin || {};
  window.TouchSpin.attach = function (input, opts) {
    var el = (input && input.nodeType === 1) ? input : document.querySelector(input);
    if (!el) throw new Error('TouchSpin.attach: invalid element');
    var $el = window.jQuery(el);
    $el.TouchSpin(opts);
    var api = $el.data('touchspinInternal');
    if (!api) throw new Error('TouchSpin failed to initialize');
    return {
      upOnce: api.upOnce,
      downOnce: api.downOnce,
      startUpSpin: api.startUpSpin,
      startDownSpin: api.startDownSpin,
      stopSpin: api.stopSpin,
      updateSettings: api.updateSettings,
      getValue: api.getValue,
      setValue: api.setValue,
      destroy: api.destroy
    };
  };

  var _Element = (typeof globalThis !== 'undefined' && /** @type {any} */ (globalThis).Element) || undefined;
  if (_Element && _Element.prototype && !_Element.prototype.TouchSpin) {
    Object.defineProperty(_Element.prototype, 'TouchSpin', {
      configurable: true,
      writable: true,
      value: function (opts) { return window.TouchSpin.attach(this, opts); }
    });
  }
})();

/*
 *  Bootstrap Touchspin - v4.8.0
 *  A mobile and touch friendly input spinner component for Bootstrap 3, 4 & 5.
 *  https://www.virtuosoft.eu/code/bootstrap-touchspin/
 *
 *  Made by István Ujj-Mészáros
 *  Under MIT License
 */
(function (exports) {
  'use strict';

  function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function _arrayWithHoles(r) {
    if (Array.isArray(r)) return r;
  }
  function _arrayWithoutHoles(r) {
    if (Array.isArray(r)) return _arrayLikeToArray(r);
  }
  function _assertThisInitialized(e) {
    if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e;
  }
  function _callSuper(t, o, e) {
    return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e));
  }
  function _classCallCheck(a, n) {
    if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
  }
  function _defineProperties(e, r) {
    for (var t = 0; t < r.length; t++) {
      var o = r[t];
      o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey(o.key), o);
    }
  }
  function _createClass(e, r, t) {
    return r && _defineProperties(e.prototype, r), Object.defineProperty(e, "prototype", {
      writable: false
    }), e;
  }
  function _defineProperty(e, r, t) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
      value: t,
      enumerable: true,
      configurable: true,
      writable: true
    }) : e[r] = t, e;
  }
  function _get() {
    return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) {
      var p = _superPropBase(e, t);
      if (p) {
        var n = Object.getOwnPropertyDescriptor(p, t);
        return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value;
      }
    }, _get.apply(null, arguments);
  }
  function _getPrototypeOf(t) {
    return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) {
      return t.__proto__ || Object.getPrototypeOf(t);
    }, _getPrototypeOf(t);
  }
  function _inherits(t, e) {
    if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
    t.prototype = Object.create(e && e.prototype, {
      constructor: {
        value: t,
        writable: true,
        configurable: true
      }
    }), Object.defineProperty(t, "prototype", {
      writable: false
    }), e && _setPrototypeOf(t, e);
  }
  function _isNativeReflectConstruct() {
    try {
      var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    } catch (t) {}
    return (_isNativeReflectConstruct = function () {
      return !!t;
    })();
  }
  function _iterableToArray(r) {
    if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
  }
  function _iterableToArrayLimit(r, l) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e,
        n,
        i,
        u,
        a = [],
        f = true,
        o = false;
      try {
        if (i = (t = t.call(r)).next, 0 === l) ; else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
      } catch (r) {
        o = true, n = r;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function (r) {
        return Object.getOwnPropertyDescriptor(e, r).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread2(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys(Object(t), true).forEach(function (r) {
        _defineProperty(e, r, t[r]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
        Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
      });
    }
    return e;
  }
  function _possibleConstructorReturn(t, e) {
    if (e && ("object" == typeof e || "function" == typeof e)) return e;
    if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
    return _assertThisInitialized(t);
  }
  function _setPrototypeOf(t, e) {
    return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) {
      return t.__proto__ = e, t;
    }, _setPrototypeOf(t, e);
  }
  function _slicedToArray(r, e) {
    return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
  }
  function _superPropBase(t, o) {
    for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t)););
    return t;
  }
  function _superPropGet(t, o, e, r) {
    var p = _get(_getPrototypeOf(t.prototype ), o, e);
    return "function" == typeof p ? function (t) {
      return p.apply(e, t);
    } : p;
  }
  function _toConsumableArray(r) {
    return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (String )(t);
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _unsupportedIterableToArray(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
    }
  }

  // @ts-check

  /**
   * @fileoverview Framework-agnostic core scaffold for TouchSpin.
   * Phase A (A1): minimal public API surface to enable incremental extraction.
   * This is a placeholder; logic will be ported from TouchSpinCore.migrated.js in A2–A7.
   */

  /**
   * @typedef {'none'|'floor'|'round'|'ceil'} ForceStepDivisibility
   */

  /**
   * @callback TouchSpinCalcCallback
   * @param {string} value
   * @returns {string}
   */

  /**
   * @typedef {Object} TouchSpinCoreOptions
   * @property {number|null=} min
   * @property {number|null=} max
   * @property {number|null=} firstclickvalueifempty
   * @property {number=} step
   * @property {number=} decimals
   * @property {ForceStepDivisibility=} forcestepdivisibility
   * @property {number=} stepinterval
   * @property {number=} stepintervaldelay
   * @property {boolean=} booster
   * @property {number=} boostat
   * @property {number|false=} maxboostedstep
   * @property {TouchSpinCalcCallback=} callback_before_calculation
   * @property {TouchSpinCalcCallback=} callback_after_calculation
   * @property {Function} renderer - Renderer class (e.g., Bootstrap5Renderer) or null for no UI
   * @property {string=} initval - Initial value for the input
   * @property {string=} replacementval - Value to use when input is empty
   * @property {boolean=} mousewheel - Enable/disable mousewheel support
   * @property {boolean=} verticalbuttons - Enable vertical button layout
   * @property {string=} verticalup - Text for vertical up button
   * @property {string=} verticaldown - Text for vertical down button
   * @property {string=} verticalupclass - CSS classes for vertical up button (handled by renderer)
   * @property {string=} verticaldownclass - CSS classes for vertical down button (handled by renderer)
   * @property {string=} prefix - Text/HTML before input (handled by renderer)
   * @property {string=} postfix - Text/HTML after input (handled by renderer)
   * @property {string=} prefix_extraclass - Extra CSS classes for prefix element (handled by renderer)
   * @property {string=} postfix_extraclass - Extra CSS classes for postfix element (handled by renderer)
   * @property {string=} buttonup_class - CSS classes for up button (handled by renderer)
   * @property {string=} buttondown_class - CSS classes for down button (handled by renderer)
   * @property {string=} buttonup_txt - Content for up button (handled by renderer)
   * @property {string=} buttondown_txt - Content for down button (handled by renderer)
   */

  var DEFAULTS = {
    min: 0,
    max: 100,
    initval: '',
    replacementval: '',
    firstclickvalueifempty: null,
    step: 1,
    decimals: 0,
    forcestepdivisibility: 'round',
    stepinterval: 100,
    stepintervaldelay: 500,
    verticalbuttons: false,
    verticalup: '+',
    verticaldown: '-',
    verticalupclass: null,
    verticaldownclass: null,
    focusablebuttons: false,
    prefix: '',
    postfix: '',
    prefix_extraclass: '',
    postfix_extraclass: '',
    booster: true,
    boostat: 10,
    maxboostedstep: false,
    mousewheel: true,
    buttonup_class: null,
    buttondown_class: null,
    buttonup_txt: '+',
    buttondown_txt: '-',
    callback_before_calculation: function callback_before_calculation(v) {
      return v;
    },
    callback_after_calculation: function callback_after_calculation(v) {
      return v;
    }
  };
  var INSTANCE_KEY = '_touchSpinCore';
  var TouchSpinCore = /*#__PURE__*/function () {
    /**
     * @param {HTMLInputElement} inputEl
     * @param {Partial<TouchSpinCoreOptions>=} opts
     */
    function TouchSpinCore(inputEl) {
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      _classCallCheck(this, TouchSpinCore);
      if (!inputEl || inputEl.nodeName !== 'INPUT') {
        throw new Error('TouchSpinCore requires an <input> element');
      }

      /** @type {HTMLInputElement} */
      this.input = inputEl;

      // Parse data-bts-* attributes
      var dataAttrs = this._parseDataAttributes(inputEl);

      /** @type {TouchSpinCoreOptions} */
      this.settings = Object.assign({}, DEFAULTS, dataAttrs, opts);

      // Check for renderer: explicit option > global default > none
      if (!this.settings.renderer) {
        // Check for global default renderer
        if (typeof globalThis !== 'undefined' && globalThis.TouchSpinDefaultRenderer) {
          this.settings.renderer = globalThis.TouchSpinDefaultRenderer;
        } else {
          // Allow no renderer for keyboard/wheel-only functionality
          console.warn('TouchSpin: No renderer specified (renderer: null). Only keyboard/wheel events will work. Consider using Bootstrap3/4/5Renderer or TailwindRenderer for UI.');
        }
      }

      /** @type {boolean} */
      this.spinning = false;
      /** @type {number} */
      this.spincount = 0;
      /** @type {false|'up'|'down'} */
      this.direction = false;
      /** @type {Map<string, Set<Function>>} */
      this._events = new Map();
      /** @type {Array<Function>} */
      this._teardownCallbacks = [];
      /** @type {Map<string, Set<Function>>} */
      this._settingObservers = new Map(); // For observer pattern

      /** @type {ReturnType<typeof setTimeout>|null} */
      this._spinDelayTimeout = null;
      /** @type {ReturnType<typeof setInterval>|null} */
      this._spinIntervalTimer = null;

      /** @type {HTMLElement|null} */
      this._upButton = null;
      /** @type {HTMLElement|null} */
      this._downButton = null;
      /** @type {HTMLElement|null} */
      this._wrapper = null;

      // DOM event handlers (bound methods)
      this._handleUpMouseDown = this._handleUpMouseDown.bind(this);
      this._handleDownMouseDown = this._handleDownMouseDown.bind(this);
      this._handleMouseUp = this._handleMouseUp.bind(this);
      this._handleUpKeyDown = this._handleUpKeyDown.bind(this);
      this._handleUpKeyUp = this._handleUpKeyUp.bind(this);
      this._handleDownKeyDown = this._handleDownKeyDown.bind(this);
      this._handleDownKeyUp = this._handleDownKeyUp.bind(this);
      this._handleInputChange = this._handleInputChange.bind(this);
      this._handleInputBlur = this._handleInputBlur.bind(this);
      this._handleKeyDown = this._handleKeyDown.bind(this);
      this._handleKeyUp = this._handleKeyUp.bind(this);
      this._handleWheel = this._handleWheel.bind(this);

      // Core always manages the input element
      this._initializeInput();

      // Initialize renderer with reference to core
      if (this.settings.renderer) {
        this.renderer = new this.settings.renderer(inputEl, this.settings, this);
        this.renderer.init();
      }

      // Set up mutation observer to watch for disabled/readonly changes
      this._setupMutationObserver();
    }

    /**
     * Initialize input element (core always handles this)
     * @private
     */
    return _createClass(TouchSpinCore, [{
      key: "_initializeInput",
      value: function _initializeInput() {
        // Set initial value if specified and input is empty
        if (this.settings.initval !== '' && this.input.value === '') {
          this.input.value = this.settings.initval;
        }

        // Core always handles these for the input
        this._updateAriaAttributes();
        this._syncNativeAttributes();
        this._checkValue(false);
      }

      /**
       * Parse data-bts-* attributes from the input element.
       * @param {HTMLInputElement} inputEl
       * @returns {Partial<TouchSpinCoreOptions>}
       * @private
       */
    }, {
      key: "_parseDataAttributes",
      value: function _parseDataAttributes(inputEl) {
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
          verticalup: 'vertical-up',
          verticaldown: 'vertical-down',
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
        var parsed = {};

        // Parse data-bts-* attributes
        for (var _i = 0, _Object$entries = Object.entries(attributeMap); _i < _Object$entries.length; _i++) {
          var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
            optionName = _Object$entries$_i[0],
            attrName = _Object$entries$_i[1];
          var fullAttrName = "data-bts-".concat(attrName);
          if (inputEl.hasAttribute(fullAttrName)) {
            var rawValue = inputEl.getAttribute(fullAttrName);
            parsed[optionName] = this._coerceAttributeValue(optionName, rawValue);
          }
        }

        // Also handle native attributes with precedence (warn if both specified)
        for (var _i2 = 0, _arr = ['min', 'max', 'step']; _i2 < _arr.length; _i2++) {
          var nativeAttr = _arr[_i2];
          if (inputEl.hasAttribute(nativeAttr)) {
            var _rawValue = inputEl.getAttribute(nativeAttr);
            if (parsed[nativeAttr] !== undefined) {
              console.warn("Both \"data-bts-".concat(nativeAttr, "\" and \"").concat(nativeAttr, "\" attributes specified. Native attribute takes precedence."), inputEl);
            }
            parsed[nativeAttr] = this._coerceAttributeValue(nativeAttr, _rawValue);
          }
        }
        return parsed;
      }

      /**
       * Convert string attribute values to appropriate types.
       * @param {string} optionName
       * @param {string} rawValue
       * @returns {any}
       * @private
       */
    }, {
      key: "_coerceAttributeValue",
      value: function _coerceAttributeValue(optionName, rawValue) {
        if (rawValue === null || rawValue === undefined) {
          return rawValue;
        }

        // Boolean attributes
        if (['booster', 'mousewheel', 'verticalbuttons'].includes(optionName)) {
          return rawValue === 'true' || rawValue === '' || rawValue === optionName;
        }

        // Numeric attributes
        if (['min', 'max', 'step', 'decimals', 'stepinterval', 'stepintervaldelay', 'boostat', 'maxboostedstep', 'firstclickvalueifempty'].includes(optionName)) {
          var num = parseFloat(rawValue);
          return isNaN(num) ? rawValue : num;
        }

        // String attributes - return as-is
        return rawValue;
      }

      /** Increment once according to step */
    }, {
      key: "upOnce",
      value: function upOnce() {
        if (this.input.disabled || this.input.hasAttribute('readonly')) {
          return;
        }
        var v = this.getValue();
        var next = this._nextValue('up', v);

        // Check if already at max boundary before incrementing
        if (this.settings.max != null && v === this.settings.max) {
          this.emit('max');
          if (this.spinning && this.direction === 'up') {
            this.stopSpin();
          }
          return;
        }

        // Fire max event BEFORE setting display if we're reaching max
        if (this.settings.max != null && next === this.settings.max) {
          this.emit('max');
          if (this.spinning && this.direction === 'up') {
            this.stopSpin();
          }
        }
        this._setDisplay(next, true);
      }

      /** Decrement once according to step */
    }, {
      key: "downOnce",
      value: function downOnce() {
        if (this.input.disabled || this.input.hasAttribute('readonly')) {
          return;
        }
        var v = this.getValue();
        var next = this._nextValue('down', v);

        // Check if already at min boundary before decrementing
        if (this.settings.min != null && v === this.settings.min) {
          this.emit('min');
          if (this.spinning && this.direction === 'down') {
            this.stopSpin();
          }
          return;
        }

        // Fire min event BEFORE setting display if we're reaching min
        if (this.settings.min != null && next === this.settings.min) {
          this.emit('min');
          if (this.spinning && this.direction === 'down') {
            this.stopSpin();
          }
        }
        this._setDisplay(next, true);
      }

      /** Start increasing repeatedly (placeholder) */
    }, {
      key: "startUpSpin",
      value: function startUpSpin() {
        this._startSpin('up');
      }

      /** Start decreasing repeatedly (placeholder) */
    }, {
      key: "startDownSpin",
      value: function startDownSpin() {
        this._startSpin('down');
      }

      /** Stop spinning (placeholder) */
    }, {
      key: "stopSpin",
      value: function stopSpin() {
        this._clearSpinTimers();
        if (this.spinning) {
          if (this.direction === 'up') {
            this.emit('stopupspin');
            this.emit('stopspin');
          } else if (this.direction === 'down') {
            this.emit('stopdownspin');
            this.emit('stopspin');
          }
        }
        this.spinning = false;
        this.direction = false;
        this.spincount = 0;
      }

      /**
       * @param {Partial<TouchSpinCoreOptions>} opts
       */
    }, {
      key: "updateSettings",
      value: function updateSettings(opts) {
        var _this = this;
        var oldSettings = _objectSpread2({}, this.settings);
        var newSettings = opts || {};
        this.settings = Object.assign({}, this.settings, newSettings);

        // If step/min/max changed and step != 1, align bounds to step like the jQuery plugin
        var step = Number(this.settings.step || 1);
        if ((newSettings.step !== undefined || newSettings.min !== undefined || newSettings.max !== undefined) && step !== 1) {
          if (this.settings.max != null) {
            this.settings.max = this._alignToStep(Number(this.settings.max), step, 'down');
          }
          if (this.settings.min != null) {
            this.settings.min = this._alignToStep(Number(this.settings.min), step, 'up');
          }
        }

        // Notify observers of changed settings
        Object.keys(newSettings).forEach(function (key) {
          if (oldSettings[key] !== newSettings[key]) {
            var observers = _this._settingObservers.get(key);
            if (observers) {
              observers.forEach(function (callback) {
                try {
                  callback(newSettings[key], oldSettings[key]);
                } catch (error) {
                  console.error('TouchSpin: Error in setting observer callback:', error);
                }
              });
            }
          }
        });

        // Core handles its own setting changes
        this._updateAriaAttributes();
        this._syncNativeAttributes();
        this._checkValue(false);
      }

      /** @returns {number} */
    }, {
      key: "getValue",
      value: function getValue() {
        var raw = this.input.value;
        if (raw === '' && this.settings.replacementval !== '') {
          raw = this.settings.replacementval;
        }
        if (raw === '') return NaN;
        var before = this.settings.callback_before_calculation || function (v) {
          return v;
        };
        var num = parseFloat(before(String(raw)));
        return isNaN(num) ? NaN : num;
      }

      /**
       * @param {number|string} v
       */
    }, {
      key: "setValue",
      value: function setValue(v) {
        if (this.input.disabled || this.input.hasAttribute('readonly')) return;
        var parsed = Number(v);
        if (!isFinite(parsed)) return;
        var adjusted = this._applyConstraints(parsed);
        this._setDisplay(adjusted, true);
      }

      /**
       * Initialize DOM event handling by finding elements and attaching listeners.
       * Must be called after the renderer has created the DOM structure.
       */
    }, {
      key: "initDOMEventHandling",
      value: function initDOMEventHandling() {
        // Find DOM elements and attach listeners
        this._findDOMElements();
        this._attachDOMEventListeners();
      }

      /**
       * Register a teardown callback that will be called when the instance is destroyed.
       * This allows wrapper libraries to register cleanup logic.
       * @param {Function} callback - Function to call on destroy
       * @returns {Function} - Unregister function
       */
    }, {
      key: "registerTeardown",
      value: function registerTeardown(callback) {
        var _this2 = this;
        if (typeof callback !== 'function') {
          throw new Error('Teardown callback must be a function');
        }
        this._teardownCallbacks.push(callback);

        // Return unregister function
        return function () {
          var index = _this2._teardownCallbacks.indexOf(callback);
          if (index > -1) {
            _this2._teardownCallbacks.splice(index, 1);
          }
        };
      }

      /** Cleanup and destroy the TouchSpin instance */
    }, {
      key: "destroy",
      value: function destroy() {
        this.stopSpin();

        // Renderer cleans up its added elements
        if (this.renderer && this.renderer.teardown) {
          this.renderer.teardown();
        }

        // Core cleans up input events only
        this._detachDOMEventListeners();

        // Call all registered teardown callbacks (for wrapper cleanup)
        this._teardownCallbacks.forEach(function (callback) {
          try {
            callback();
          } catch (error) {
            console.error('TouchSpin teardown callback error:', error);
          }
        });
        this._teardownCallbacks.length = 0; // Clear the array

        // Clear setting observers
        this._settingObservers.clear();

        // Clean up mutation observer
        if (this._mutationObserver) {
          this._mutationObserver.disconnect();
          this._mutationObserver = null;
        }

        // Clear button references
        this._upButton = null;
        this._downButton = null;

        // Remove instance from element
        if (this.input[INSTANCE_KEY] === this) {
          delete this.input[INSTANCE_KEY];
        }
      }

      /**
       * Create a plain public API object with bound methods for wrappers.
       * @returns {TouchSpinCorePublicAPI}
       */
    }, {
      key: "toPublicApi",
      value: function toPublicApi() {
        return {
          upOnce: this.upOnce.bind(this),
          downOnce: this.downOnce.bind(this),
          startUpSpin: this.startUpSpin.bind(this),
          startDownSpin: this.startDownSpin.bind(this),
          stopSpin: this.stopSpin.bind(this),
          updateSettings: this.updateSettings.bind(this),
          getValue: this.getValue.bind(this),
          setValue: this.setValue.bind(this),
          destroy: this.destroy.bind(this),
          on: this.on.bind(this),
          off: this.off.bind(this),
          initDOMEventHandling: this.initDOMEventHandling.bind(this),
          registerTeardown: this.registerTeardown.bind(this),
          attachUpEvents: this.attachUpEvents.bind(this),
          attachDownEvents: this.attachDownEvents.bind(this),
          observeSetting: this.observeSetting.bind(this)
        };
      }

      // --- Renderer Event Attachment Methods ---
      /**
       * Attach up button events to an element
       * Called by renderers after creating up button
       * @param {HTMLElement|null} element - The element to attach events to
       */
    }, {
      key: "attachUpEvents",
      value: function attachUpEvents(element) {
        if (!element) {
          console.warn('TouchSpin: attachUpEvents called with null element');
          return;
        }
        this._upButton = element;
        element.addEventListener('mousedown', this._handleUpMouseDown);
        element.addEventListener('touchstart', this._handleUpMouseDown, {
          passive: false
        });

        // Add keyboard event listeners if focusable buttons are enabled
        if (this.settings.focusablebuttons) {
          element.addEventListener('keydown', this._handleUpKeyDown);
          element.addEventListener('keyup', this._handleUpKeyUp);
        }

        // Update disabled state immediately after attaching
        this._updateButtonDisabledState();
      }

      /**
       * Attach down button events to an element
       * Called by renderers after creating down button
       * @param {HTMLElement|null} element - The element to attach events to
       */
    }, {
      key: "attachDownEvents",
      value: function attachDownEvents(element) {
        if (!element) {
          console.warn('TouchSpin: attachDownEvents called with null element');
          return;
        }
        this._downButton = element;
        element.addEventListener('mousedown', this._handleDownMouseDown);
        element.addEventListener('touchstart', this._handleDownMouseDown, {
          passive: false
        });

        // Add keyboard event listeners if focusable buttons are enabled
        if (this.settings.focusablebuttons) {
          element.addEventListener('keydown', this._handleDownKeyDown);
          element.addEventListener('keyup', this._handleDownKeyUp);
        }

        // Update disabled state immediately after attaching
        this._updateButtonDisabledState();
      }

      // --- Settings Observer Pattern ---
      /**
       * Allow renderers to observe setting changes
       * @param {string} settingName - Name of setting to observe
       * @param {Function} callback - Function to call when setting changes (newValue, oldValue)
       * @returns {Function} Unsubscribe function
       */
    }, {
      key: "observeSetting",
      value: function observeSetting(settingName, callback) {
        if (!this._settingObservers.has(settingName)) {
          this._settingObservers.set(settingName, new Set());
        }
        var observers = this._settingObservers.get(settingName);
        observers.add(callback);

        // Return unsubscribe function
        return function () {
          return observers.delete(callback);
        };
      }

      // --- Minimal internal emitter API ---
      /**
       * Subscribe to a core event.
       * Events: 'min', 'max', 'startspin', 'startupspin', 'startdownspin', 'stopspin', 'stopupspin', 'stopdownspin'
       * @param {string} event
       * @param {(detail?: any) => void} handler
       */
    }, {
      key: "on",
      value: function on(event, handler) {
        var _this3 = this;
        var set = this._events.get(event) || new Set();
        set.add(handler);
        this._events.set(event, set);
        return function () {
          return _this3.off(event, handler);
        };
      }

      /**
       * Unsubscribe from a core event.
       * @param {string} event
       * @param {(detail?: any) => void=} handler
       */
    }, {
      key: "off",
      value: function off(event, handler) {
        var set = this._events.get(event);
        if (!set) return;
        if (!handler) {
          this._events.delete(event);
          return;
        }
        set.delete(handler);
        if (set.size === 0) this._events.delete(event);
      }

      /**
       * Emit a core event to subscribers.
       * @param {string} event
       * @param {any=} detail
       */
    }, {
      key: "emit",
      value: function emit(event, detail) {
        var set = this._events.get(event);
        if (!set || set.size === 0) return;
        for (var _i3 = 0, _arr2 = _toConsumableArray(set); _i3 < _arr2.length; _i3++) {
          var fn = _arr2[_i3];
          try {
            fn(detail);
          } catch (_) {}
        }
      }

      /**
       * Internal: start timed spin in a direction with initial step, delay, then interval.
       * @param {'up'|'down'} dir
       */
    }, {
      key: "_startSpin",
      value: function _startSpin(dir) {
        var _this4 = this;
        if (this.input.disabled || this.input.hasAttribute('readonly')) return;
        // If changing direction, reset counters
        var changed = !this.spinning || this.direction !== dir;
        if (changed) {
          this.spinning = true;
          this.direction = dir;
          this.spincount = 0;
          // Match jQuery plugin event order: startspin then direction-specific
          this.emit('startspin');
          if (dir === 'up') this.emit('startupspin');else this.emit('startdownspin');
        }

        // Clear previous timers
        this._clearSpinTimers();
        // Schedule repeat after delay, then at interval (no immediate step; wrapper triggers first step)
        var delay = this.settings.stepintervaldelay || 500;
        var interval = this.settings.stepinterval || 100;
        this._spinDelayTimeout = setTimeout(function () {
          _this4._spinDelayTimeout = null;
          _this4._spinIntervalTimer = setInterval(function () {
            if (!_this4.spinning || _this4.direction !== dir) return; // safety
            _this4._spinStep(dir);
          }, interval);
        }, delay);
      }
    }, {
      key: "_clearSpinTimers",
      value: function _clearSpinTimers() {
        try {
          if (this._spinDelayTimeout) {
            clearTimeout(this._spinDelayTimeout);
          }
        } catch (_unused) {}
        try {
          if (this._spinIntervalTimer) {
            clearInterval(this._spinIntervalTimer);
          }
        } catch (_unused2) {}
        this._spinDelayTimeout = null;
        this._spinIntervalTimer = null;
      }

      /**
       * Compute the next numeric value for a direction, respecting step, booster and bounds.
       * @param {'up'|'down'} dir
       * @param {number} current
       */
    }, {
      key: "_nextValue",
      value: function _nextValue(dir, current) {
        var v = current;
        if (isNaN(v)) {
          v = this._valueIfIsNaN();
        } else {
          var base = this.settings.step || 1;
          var boostat = Math.max(1, parseInt(String(this.settings.boostat || 10), 10));
          var stepUnclamped = Math.pow(2, Math.floor(this.spincount / boostat)) * base;
          var mbs = this.settings.maxboostedstep;
          var step = stepUnclamped;
          if (mbs && isFinite(mbs) && stepUnclamped > Number(mbs)) {
            step = Number(mbs);
            // Align current value to the boosted step grid when clamped (parity with jQuery plugin)
            v = Math.round(v / step) * step;
          }
          step = Math.max(base, step);
          v = dir === 'up' ? v + step : v - step;
        }
        return this._applyConstraints(v);
      }

      /** Returns a reasonable value to use when current is NaN. */
    }, {
      key: "_valueIfIsNaN",
      value: function _valueIfIsNaN() {
        if (typeof this.settings.firstclickvalueifempty === 'number') {
          return this.settings.firstclickvalueifempty;
        }
        var min = typeof this.settings.min === 'number' ? this.settings.min : 0;
        var max = typeof this.settings.max === 'number' ? this.settings.max : min;
        return (min + max) / 2;
      }

      /** Apply step divisibility and clamp to min/max. */
    }, {
      key: "_applyConstraints",
      value: function _applyConstraints(v) {
        var aligned = this._forcestepdivisibility(v);
        var min = this.settings.min;
        var max = this.settings.max;
        var clamped = aligned;
        if (min != null && clamped < min) clamped = min;
        if (max != null && clamped > max) clamped = max;
        return clamped;
      }

      /** Determine the effective step with booster if enabled. */
    }, {
      key: "_getBoostedStep",
      value: function _getBoostedStep() {
        var base = this.settings.step || 1;
        if (!this.settings.booster) return base;
        var boostat = Math.max(1, parseInt(String(this.settings.boostat || 10), 10));
        var boosted = Math.pow(2, Math.floor(this.spincount / boostat)) * base;
        var mbs = this.settings.maxboostedstep;
        if (mbs && isFinite(mbs)) {
          var cap = Number(mbs);
          if (boosted > cap) boosted = cap;
        }
        return Math.max(base, boosted);
      }

      /** Aligns value to step per forcestepdivisibility. */
    }, {
      key: "_forcestepdivisibility",
      value: function _forcestepdivisibility(val) {
        var mode = this.settings.forcestepdivisibility || 'round';
        var step = this.settings.step || 1;
        var dec = this.settings.decimals || 0;
        var out;
        switch (mode) {
          case 'floor':
            out = Math.floor(val / step) * step;
            break;
          case 'ceil':
            out = Math.ceil(val / step) * step;
            break;
          case 'none':
            out = val;
            break;
          case 'round':
          default:
            out = Math.round(val / step) * step;
            break;
        }
        // Normalize to configured decimals without string pipeline; formatting applies later
        return Number(out.toFixed(dec));
      }

      /** Aligns a value to nearest step boundary using integer arithmetic. */
    }, {
      key: "_alignToStep",
      value: function _alignToStep(val, step, dir) {
        if (step === 0) return val;
        var k = 1,
          s = step;
        while (s * k % 1 !== 0 && k < 1e6) k *= 10;
        var V = Math.round(val * k);
        var S = Math.round(step * k);
        var r = V % S;
        if (r === 0) return val;
        return (dir === 'down' ? V - r : V + (S - r)) / k;
      }

      /** Format and write to input, optionally emit change if different. */
    }, {
      key: "_setDisplay",
      value: function _setDisplay(num, mayTriggerChange) {
        var _this$input$value;
        var prev = String((_this$input$value = this.input.value) !== null && _this$input$value !== void 0 ? _this$input$value : '');
        var next = this._formatDisplay(num);
        this.input.value = next;
        this._updateAriaAttributes();
        if (mayTriggerChange && prev !== next) {
          // mirror plugin behavior: trigger a native change event
          this.input.dispatchEvent(new Event('change', {
            bubbles: true
          }));
        }
        return next;
      }
    }, {
      key: "_formatDisplay",
      value: function _formatDisplay(num) {
        var dec = this.settings.decimals || 0;
        var after = this.settings.callback_after_calculation || function (v) {
          return v;
        };
        var s = Number(num).toFixed(dec);
        return after(s);
      }

      /**
       * Perform one spin step in a direction while tracking spincount for booster.
       * @param {'up'|'down'} dir
       */
    }, {
      key: "_spinStep",
      value: function _spinStep(dir) {
        this.spincount++;
        if (dir === 'up') this.upOnce();else this.downOnce();
      }

      /** Sanitize current input value and update display; optionally emits change. */
    }, {
      key: "_checkValue",
      value: function _checkValue(mayTriggerChange) {
        var v = this.getValue();
        if (!isFinite(v)) return;
        var adjusted = this._applyConstraints(v);
        this._setDisplay(adjusted, !!mayTriggerChange);
      }
    }, {
      key: "_updateAriaAttributes",
      value: function _updateAriaAttributes() {
        var el = this.input;
        if (el.getAttribute('role') !== 'spinbutton') {
          el.setAttribute('role', 'spinbutton');
        }
        var min = this.settings.min;
        var max = this.settings.max;
        if (min != null) el.setAttribute('aria-valuemin', String(min));else el.removeAttribute('aria-valuemin');
        if (max != null) el.setAttribute('aria-valuemax', String(max));else el.removeAttribute('aria-valuemax');
        var raw = el.value;
        var before = this.settings.callback_before_calculation || function (v) {
          return v;
        };
        var num = parseFloat(before(String(raw)));
        if (isFinite(num)) el.setAttribute('aria-valuenow', String(num));else el.removeAttribute('aria-valuenow');
        el.setAttribute('aria-valuetext', String(raw));
      }

      /**
       * Synchronize TouchSpin settings to native input attributes.
       * Only applies to type="number" inputs to maintain browser consistency.
       * @private
       */
    }, {
      key: "_syncNativeAttributes",
      value: function _syncNativeAttributes() {
        // Only set native attributes on number inputs
        if (this.input.getAttribute('type') === 'number') {
          // Sync min attribute
          if (this.settings.min != null && isFinite(this.settings.min)) {
            this.input.setAttribute('min', String(this.settings.min));
          } else {
            this.input.removeAttribute('min');
          }

          // Sync max attribute
          if (this.settings.max != null && isFinite(this.settings.max)) {
            this.input.setAttribute('max', String(this.settings.max));
          } else {
            this.input.removeAttribute('max');
          }

          // Sync step attribute
          if (this.settings.step != null && isFinite(this.settings.step) && this.settings.step > 0) {
            this.input.setAttribute('step', String(this.settings.step));
          } else {
            this.input.removeAttribute('step');
          }
        }
      }

      /**
       * Update TouchSpin settings from native attribute changes.
       * Called by mutation observer when min/max/step attributes change.
       * @private
       */
    }, {
      key: "_syncSettingsFromNativeAttributes",
      value: function _syncSettingsFromNativeAttributes() {
        var nativeMin = this.input.getAttribute('min');
        var nativeMax = this.input.getAttribute('max');
        var nativeStep = this.input.getAttribute('step');
        var needsUpdate = false;
        var newSettings = {};

        // Check min attribute
        if (nativeMin != null) {
          var parsedMin = nativeMin === '' ? null : parseFloat(nativeMin);
          var minNum = parsedMin != null && isFinite(parsedMin) ? parsedMin : null;
          if (minNum !== this.settings.min) {
            newSettings.min = minNum;
            needsUpdate = true;
          }
        } else if (this.settings.min != null) {
          // Attribute was removed
          newSettings.min = null;
          needsUpdate = true;
        }

        // Check max attribute
        if (nativeMax != null) {
          var parsedMax = nativeMax === '' ? null : parseFloat(nativeMax);
          var maxNum = parsedMax != null && isFinite(parsedMax) ? parsedMax : null;
          if (maxNum !== this.settings.max) {
            newSettings.max = maxNum;
            needsUpdate = true;
          }
        } else if (this.settings.max != null) {
          // Attribute was removed
          newSettings.max = null;
          needsUpdate = true;
        }

        // Check step attribute
        if (nativeStep != null) {
          var parsedStep = nativeStep === '' ? null : parseFloat(nativeStep);
          var stepNum = parsedStep != null && isFinite(parsedStep) && parsedStep > 0 ? parsedStep : null;
          if (stepNum !== this.settings.step) {
            newSettings.step = stepNum;
            needsUpdate = true;
          }
        } else if (this.settings.step !== 1) {
          // Attribute was removed, reset to default
          newSettings.step = 1;
          needsUpdate = true;
        }

        // Apply updates if needed
        if (needsUpdate) {
          this.updateSettings(newSettings);
        }
      }

      // --- DOM Event Handling Methods ---

      /**
       * Find and store references to DOM elements using data-touchspin-injected attributes.
       * @private
       */
    }, {
      key: "_findDOMElements",
      value: function _findDOMElements() {
        // Core doesn't need to find buttons - renderers handle button events directly
        // We only need to find the wrapper for potential future use
        var wrapper = this.input.parentElement;
        while (wrapper && !wrapper.hasAttribute('data-touchspin-injected')) {
          wrapper = wrapper.parentElement;
        }
        this._wrapper = wrapper;
      }

      /**
       * Attach DOM event listeners to elements.
       * @private
       */
    }, {
      key: "_attachDOMEventListeners",
      value: function _attachDOMEventListeners() {
        // Core should NOT attach button events - renderers handle that via attachUpEvents/attachDownEvents

        // Global mouseup/touchend to stop spinning
        document.addEventListener('mouseup', this._handleMouseUp);
        document.addEventListener('mouseleave', this._handleMouseUp);
        document.addEventListener('touchend', this._handleMouseUp);

        // Input events (always attach these - they work without renderer UI)
        this.input.addEventListener('change', this._handleInputChange, true); // Capture phase to intercept
        this.input.addEventListener('blur', this._handleInputBlur);
        this.input.addEventListener('keydown', this._handleKeyDown);
        this.input.addEventListener('keyup', this._handleKeyUp);
        this.input.addEventListener('wheel', this._handleWheel);
      }

      /**
       * Remove DOM event listeners.
       * @private
       */
    }, {
      key: "_detachDOMEventListeners",
      value: function _detachDOMEventListeners() {
        // Core does not manage button events - renderers handle their own cleanup

        // Global events
        document.removeEventListener('mouseup', this._handleMouseUp);
        document.removeEventListener('mouseleave', this._handleMouseUp);
        document.removeEventListener('touchend', this._handleMouseUp);

        // Input events
        this.input.removeEventListener('change', this._handleInputChange, true);
        this.input.removeEventListener('blur', this._handleInputBlur);
        this.input.removeEventListener('keydown', this._handleKeyDown);
        this.input.removeEventListener('keyup', this._handleKeyUp);
        this.input.removeEventListener('wheel', this._handleWheel);
      }

      // --- DOM Event Handlers ---

      /**
       * Handle mousedown/touchstart on up button.
       * @private
       */
    }, {
      key: "_handleUpMouseDown",
      value: function _handleUpMouseDown(e) {
        e.preventDefault();
        this.upOnce();
        this.startUpSpin();
      }

      /**
       * Handle mousedown/touchstart on down button.
       * @private
       */
    }, {
      key: "_handleDownMouseDown",
      value: function _handleDownMouseDown(e) {
        e.preventDefault();
        this.downOnce();
        this.startDownSpin();
      }

      /**
       * Handle mouseup/touchend/mouseleave to stop spinning.
       * @private
       */
    }, {
      key: "_handleMouseUp",
      value: function _handleMouseUp(e) {
        this.stopSpin();
      }

      /**
       * Handle keydown events on up button.
       * @private
       */
    }, {
      key: "_handleUpKeyDown",
      value: function _handleUpKeyDown(e) {
        // Only handle Enter and Space keys
        if (e.keyCode === 13 || e.keyCode === 32) {
          // Enter or Space
          e.preventDefault();
          this.upOnce();
          this.startUpSpin();
        }
      }

      /**
       * Handle keyup events on up button.
       * @private
       */
    }, {
      key: "_handleUpKeyUp",
      value: function _handleUpKeyUp(e) {
        // Only handle Enter and Space keys
        if (e.keyCode === 13 || e.keyCode === 32) {
          // Enter or Space
          this.stopSpin();
        }
      }

      /**
       * Handle keydown events on down button.
       * @private
       */
    }, {
      key: "_handleDownKeyDown",
      value: function _handleDownKeyDown(e) {
        // Only handle Enter and Space keys
        if (e.keyCode === 13 || e.keyCode === 32) {
          // Enter or Space
          e.preventDefault();
          this.downOnce();
          this.startDownSpin();
        }
      }

      /**
       * Handle keyup events on down button.
       * @private
       */
    }, {
      key: "_handleDownKeyUp",
      value: function _handleDownKeyUp(e) {
        // Only handle Enter and Space keys
        if (e.keyCode === 13 || e.keyCode === 32) {
          // Enter or Space
          this.stopSpin();
        }
      }

      /**
       * Intercept change events to prevent wrong values from propagating.
       * @private
       */
    }, {
      key: "_handleInputChange",
      value: function _handleInputChange(e) {
        var currentValue = this.getValue();
        var wouldBeSanitized = this._applyConstraints(currentValue);
        if (isFinite(currentValue) && currentValue !== wouldBeSanitized) {
          // This change event has wrong value - prevent it from propagating
          e.stopImmediatePropagation();
          // Don't sanitize here - blur handler will do it with correct change event
        }
        // If values match, let the change event through normally
      }

      /**
       * Handle blur events on the input element for sanitization.
       * @private
       */
    }, {
      key: "_handleInputBlur",
      value: function _handleInputBlur(e) {
        this._checkValue(true);
      }

      /**
       * Handle keydown events on the input element.
       * @private
       */
    }, {
      key: "_handleKeyDown",
      value: function _handleKeyDown(e) {
        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            this.upOnce();
            this.startUpSpin();
            break;
          case 'ArrowDown':
            e.preventDefault();
            this.downOnce();
            this.startDownSpin();
            break;
          case 'Enter':
            this._checkValue(false);
            break;
        }
      }

      /**
       * Handle keyup events on the input element.
       * @private
       */
    }, {
      key: "_handleKeyUp",
      value: function _handleKeyUp(e) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          this.stopSpin();
        }
      }

      /**
       * Handle wheel events on the input element.
       * @private
       */
    }, {
      key: "_handleWheel",
      value: function _handleWheel(e) {
        if (!this.settings.mousewheel) {
          return;
        }
        if (document.activeElement === this.input) {
          e.preventDefault();
          if (e.deltaY < 0) {
            this.upOnce();
          } else if (e.deltaY > 0) {
            this.downOnce();
          }
        }
      }

      /**
       * Set up mutation observer to watch for disabled/readonly attribute changes
       * @private
       */
    }, {
      key: "_setupMutationObserver",
      value: function _setupMutationObserver() {
        var _this5 = this;
        if (typeof MutationObserver !== 'undefined') {
          this._mutationObserver = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
              if (mutation.type === 'attributes') {
                if (mutation.attributeName === 'disabled' || mutation.attributeName === 'readonly') {
                  _this5._updateButtonDisabledState();
                } else if (mutation.attributeName === 'min' || mutation.attributeName === 'max' || mutation.attributeName === 'step') {
                  _this5._syncSettingsFromNativeAttributes();
                }
              }
            });
          });
          this._mutationObserver.observe(this.input, {
            attributes: true,
            attributeFilter: ['disabled', 'readonly', 'min', 'max', 'step']
          });
        }
      }

      /**
       * Update button disabled state based on input disabled/readonly state
       * @private
       */
    }, {
      key: "_updateButtonDisabledState",
      value: function _updateButtonDisabledState() {
        var isDisabled = this.input.disabled || this.input.hasAttribute('readonly');
        if (this._upButton) {
          this._upButton.disabled = isDisabled;
        }
        if (this._downButton) {
          this._downButton.disabled = isDisabled;
        }
        if (isDisabled) {
          this.stopSpin();
        }
      }
    }]);
  }();

  /**
   * @typedef {Object} TouchSpinCorePublicAPI
   * @property {() => void} upOnce
   * @property {() => void} downOnce
   * @property {() => void} startUpSpin
   * @property {() => void} startDownSpin
   * @property {() => void} stopSpin
   * @property {(opts: Partial<TouchSpinCoreOptions>) => void} updateSettings
   * @property {() => number} getValue
   * @property {(v: number|string) => void} setValue
   * @property {() => void} destroy
   * @property {(event: string, handler: (detail?: any) => void) => () => void} on
   * @property {(event: string, handler?: (detail?: any) => void) => void} off
   * @property {() => void} initDOMEventHandling
   * @property {(callback: Function) => () => void} registerTeardown
   */

  /**
   * Initialize TouchSpin on an input element or get existing instance.
   * @param {HTMLInputElement} inputEl
   * @param {Partial<TouchSpinCoreOptions>=} opts
   * @returns {TouchSpinCorePublicAPI|null}
   */
  function TouchSpin$1(inputEl, opts) {
    // Check if element is an input (graceful handling for public API)
    if (!inputEl || inputEl.nodeName !== 'INPUT') {
      console.warn('Must be an input.');
      return null;
    }

    // If options provided, initialize/reinitialize
    if (opts !== undefined) {
      // Destroy existing instance if it exists (destroy() removes itself from element)
      if (inputEl[INSTANCE_KEY]) {
        inputEl[INSTANCE_KEY].destroy();
      }

      // Create new instance and store on element
      var core = new TouchSpinCore(inputEl, opts);
      inputEl[INSTANCE_KEY] = core;

      // Initialize DOM event handling
      core.initDOMEventHandling();
      return core.toPublicApi();
    }

    // No options - return existing instance or create with defaults
    if (!inputEl[INSTANCE_KEY]) {
      var _core = new TouchSpinCore(inputEl, {});
      inputEl[INSTANCE_KEY] = _core;
      _core.initDOMEventHandling();
      return _core.toPublicApi();
    }
    return inputEl[INSTANCE_KEY].toPublicApi();
  }

  /**
   * Get existing TouchSpin instance from input element (without creating one).
   * @param {HTMLInputElement} inputEl
   * @returns {TouchSpinCorePublicAPI|null}
   */
  function getTouchSpin(inputEl) {
    return inputEl[INSTANCE_KEY] ? inputEl[INSTANCE_KEY].toPublicApi() : null;
  }

  // Note: AbstractRenderer is not exported as it's only needed by renderer implementations
  // Renderers should import it directly: import AbstractRenderer from '../../../core/src/AbstractRenderer.js';

  /**
   * AbstractRenderer - Base class for TouchSpin renderers
   * Part of @touchspin/core package to avoid duplication across renderer packages
   * 
   * @example
   * class CustomRenderer extends AbstractRenderer {
   *   init() {
   *     this.wrapper = this.buildUI();
   *     const upBtn = this.wrapper.querySelector('[data-touchspin-injected="up"]');
   *     const downBtn = this.wrapper.querySelector('[data-touchspin-injected="down"]');
   *     this.core.attachUpEvents(upBtn);
   *     this.core.attachDownEvents(downBtn);
   *     this.core.observeSetting('prefix', (value) => this.updatePrefix(value));
   *   }
   * }
   */
  var AbstractRenderer = /*#__PURE__*/function () {
    /**
     * @param {HTMLInputElement} inputEl - The input element to render around
     * @param {Object} settings - TouchSpin settings (read-only)
     * @param {Object} core - TouchSpin core instance for event delegation
     */
    function AbstractRenderer(inputEl, settings, core) {
      _classCallCheck(this, AbstractRenderer);
      // New renderer architecture
      /** @type {HTMLInputElement} */
      this.input = inputEl;
      /** @type {Object} */
      this.settings = settings; // Read-only access to settings
      /** @type {Object} */
      this.core = core; // Reference to core for calling attachment methods
      /** @type {HTMLElement|null} */
      this.wrapper = null; // Set by subclasses during init()

      // Legacy compatibility (transitional)
      this.$ = typeof $ !== 'undefined' ? $ : null;
      this.originalinput = this.$ ? this.$(inputEl) : null;
      this.container = null;
      this.elements = null;
    }

    /**
     * Initialize the renderer - build DOM structure and attach events
     * Must be implemented by subclasses
     * @abstract
     */
    return _createClass(AbstractRenderer, [{
      key: "init",
      value: function init() {
        throw new Error('init() must be implemented by renderer');
      }

      /**
       * Cleanup renderer - remove injected elements and restore original state
       * Default implementation removes all injected elements
       * Subclasses can override for custom teardown
       */
    }, {
      key: "teardown",
      value: function teardown() {
        // Default implementation - remove all injected elements
        this.removeInjectedElements();
        // Subclasses can override for custom teardown
      }

      /**
       * Utility method to remove all injected TouchSpin elements
       * Handles both regular wrappers and advanced input groups
       * Called automatically by teardown()
       */
    }, {
      key: "removeInjectedElements",
      value: function removeInjectedElements() {
        var _this = this;
        // Find and remove all elements with data-touchspin-injected attribute
        if (this.wrapper) {
          var injected = this.wrapper.querySelectorAll('[data-touchspin-injected]');
          injected.forEach(function (el) {
            return el.remove();
          });

          // If wrapper itself was injected and is not the original parent
          if (this.wrapper.hasAttribute('data-touchspin-injected') && this.wrapper.parentElement) {
            var injectedType = this.wrapper.getAttribute('data-touchspin-injected');
            if (injectedType === 'wrapper-advanced') {
              // For advanced input groups, just remove the TouchSpin classes and attribute
              // but keep the original input-group structure intact
              this.wrapper.classList.remove('bootstrap-touchspin');
              this.wrapper.removeAttribute('data-touchspin-injected');
            } else {
              // For regular wrappers, unwrap the input element
              var parent = this.wrapper.parentElement;
              parent.insertBefore(this.input, this.wrapper);
              this.wrapper.remove();
            }
          }
        }

        // Also find any injected elements that might be siblings or elsewhere
        var allInjected = document.querySelectorAll('[data-touchspin-injected]');
        allInjected.forEach(function (el) {
          var _this$input$parentEle;
          // Only remove if it's related to this input (check if input is descendant or sibling)
          if (el.contains(_this.input) || el.parentElement && el.parentElement.contains(_this.input) || (_this$input$parentEle = _this.input.parentElement) !== null && _this$input$parentEle !== void 0 && _this$input$parentEle.contains(el)) {
            // Don't remove the input itself
            if (el !== _this.input) {
              el.remove();
            }
          }
        });
      }

      // Legacy methods (transitional - for backward compatibility)
    }, {
      key: "getFrameworkId",
      value: function getFrameworkId() {
        throw new Error('getFrameworkId() must be implemented by subclasses');
      }
    }, {
      key: "buildAdvancedInputGroup",
      value: function buildAdvancedInputGroup(parentelement) {
        throw new Error('buildAdvancedInputGroup() must be implemented by subclasses');
      }
    }, {
      key: "buildInputGroup",
      value: function buildInputGroup() {
        throw new Error('buildInputGroup() must be implemented by subclasses');
      }
    }, {
      key: "buildVerticalButtons",
      value: function buildVerticalButtons() {
        throw new Error('buildVerticalButtons() must be implemented by subclasses');
      }
    }, {
      key: "initElements",
      value: function initElements(container) {
        this.container = container;
        var downButtons = this._findElements(container, 'down');
        var upButtons = this._findElements(container, 'up');
        if (downButtons.length === 0 || upButtons.length === 0) {
          var verticalContainer = this._findElements(container.parent(), 'vertical-wrapper');
          if (verticalContainer.length > 0) {
            downButtons = this._findElements(verticalContainer, 'down');
            upButtons = this._findElements(verticalContainer, 'up');
          }
        }

        // Ensure input element has data-touchspin-injected="input" for core event targeting
        this.originalinput.attr('data-touchspin-injected', 'input');
        this.elements = {
          down: downButtons,
          up: upButtons,
          input: this.$('input', container),
          prefix: this._findElements(container, 'prefix').addClass(this.settings.prefix_extraclass),
          postfix: this._findElements(container, 'postfix').addClass(this.settings.postfix_extraclass)
        };
        return this.elements;
      }
    }, {
      key: "_findElements",
      value: function _findElements(container, role) {
        return this.$("[data-touchspin-injected=\"".concat(role, "\"]"), container);
      }
    }, {
      key: "hideEmptyPrefixPostfix",
      value: function hideEmptyPrefixPostfix() {
        var detached = {};
        if (this.settings.prefix === '') detached._detached_prefix = this.elements.prefix.detach();
        if (this.settings.postfix === '') detached._detached_postfix = this.elements.postfix.detach();
        return detached;
      }
    }, {
      key: "updatePrefixPostfix",
      value: function updatePrefixPostfix(newsettings, detached) {
        throw new Error('updatePrefixPostfix() must be implemented by subclasses');
      }
    }, {
      key: "getWrapperTestId",
      value: function getWrapperTestId() {
        // Modern vanilla JS version
        var inputTestId = this.input.getAttribute('data-testid');
        if (inputTestId) return " data-testid=\"".concat(inputTestId, "-wrapper\"");
        return '';
      }
    }]);
  }();

  var Bootstrap5Renderer = /*#__PURE__*/function (_AbstractRenderer) {
    function Bootstrap5Renderer() {
      _classCallCheck(this, Bootstrap5Renderer);
      return _callSuper(this, Bootstrap5Renderer, arguments);
    }
    _inherits(Bootstrap5Renderer, _AbstractRenderer);
    return _createClass(Bootstrap5Renderer, [{
      key: "init",
      value: function init() {
        var _this = this;
        // Add form-control class if not present (Bootstrap requirement)
        if (!this.input.classList.contains('form-control')) {
          this.input.classList.add('form-control');
          this._formControlAdded = true; // Track if we added it
        }

        // 1. Build and inject DOM structure around input
        this.wrapper = this.buildInputGroup();

        // 2. Find created buttons
        var upButton = this.wrapper.querySelector('[data-touchspin-injected="up"]');
        var downButton = this.wrapper.querySelector('[data-touchspin-injected="down"]');

        // 3. Tell core to attach its event handlers
        this.core.attachUpEvents(upButton);
        this.core.attachDownEvents(downButton);

        // 4. Register for setting changes we care about
        this.core.observeSetting('prefix', function (newValue) {
          return _this.updatePrefix(newValue);
        });
        this.core.observeSetting('postfix', function (newValue) {
          return _this.updatePostfix(newValue);
        });
        this.core.observeSetting('buttonup_class', function (newValue) {
          return _this.updateButtonClass('up', newValue);
        });
        this.core.observeSetting('buttondown_class', function (newValue) {
          return _this.updateButtonClass('down', newValue);
        });
        this.core.observeSetting('verticalupclass', function (newValue) {
          return _this.updateVerticalButtonClass('up', newValue);
        });
        this.core.observeSetting('verticaldownclass', function (newValue) {
          return _this.updateVerticalButtonClass('down', newValue);
        });
        this.core.observeSetting('verticalup', function (newValue) {
          return _this.updateVerticalButtonText('up', newValue);
        });
        this.core.observeSetting('verticaldown', function (newValue) {
          return _this.updateVerticalButtonText('down', newValue);
        });
        this.core.observeSetting('buttonup_txt', function (newValue) {
          return _this.updateButtonText('up', newValue);
        });
        this.core.observeSetting('buttondown_txt', function (newValue) {
          return _this.updateButtonText('down', newValue);
        });
        this.core.observeSetting('prefix_extraclass', function (newValue) {
          return _this.updatePrefix(_this.settings.prefix);
        });
        this.core.observeSetting('postfix_extraclass', function (newValue) {
          return _this.updatePostfix(_this.settings.postfix);
        });
      }
    }, {
      key: "teardown",
      value: function teardown() {
        // Remove form-control class only if we added it
        if (this._formControlAdded) {
          this.input.classList.remove('form-control');
          this._formControlAdded = false;
        }

        // Call parent teardown to handle DOM cleanup
        _superPropGet(Bootstrap5Renderer, "teardown", this)([]);
      }
    }, {
      key: "buildInputGroup",
      value: function buildInputGroup() {
        // Check if input is already inside an input-group
        var existingInputGroup = this.input.closest('.input-group');
        if (existingInputGroup) {
          return this.buildAdvancedInputGroup(existingInputGroup);
        } else {
          return this.buildBasicInputGroup();
        }
      }
    }, {
      key: "buildBasicInputGroup",
      value: function buildBasicInputGroup() {
        var inputGroupSize = this._detectInputGroupSize();
        var testidAttr = this.getWrapperTestId();
        var html;
        if (this.settings.verticalbuttons) {
          html = "\n        <div class=\"input-group ".concat(inputGroupSize, " bootstrap-touchspin\" data-touchspin-injected=\"wrapper\"").concat(testidAttr, ">\n          <span class=\"input-group-text bootstrap-touchspin-prefix ").concat(this.settings.prefix_extraclass || '', "\" data-touchspin-injected=\"prefix\">").concat(this.settings.prefix || '', "</span>\n          <span class=\"input-group-text bootstrap-touchspin-postfix ").concat(this.settings.postfix_extraclass || '', "\" data-touchspin-injected=\"postfix\">").concat(this.settings.postfix || '', "</span>\n          ").concat(this.buildVerticalButtons(), "\n        </div>\n      ");
        } else {
          html = "\n        <div class=\"input-group ".concat(inputGroupSize, " bootstrap-touchspin\" data-touchspin-injected=\"wrapper\"").concat(testidAttr, ">\n          <span class=\"input-group-text bootstrap-touchspin-prefix ").concat(this.settings.prefix_extraclass || '', "\" data-touchspin-injected=\"prefix\">").concat(this.settings.prefix || '', "</span>\n          <button tabindex=\"").concat(this.settings.focusablebuttons ? '0' : '-1', "\" class=\"").concat(this.settings.buttondown_class || 'btn btn-outline-secondary', " bootstrap-touchspin-down\" data-touchspin-injected=\"down\" type=\"button\" aria-label=\"Decrease value\">").concat(this.settings.buttondown_txt || '−', "</button>\n          <button tabindex=\"").concat(this.settings.focusablebuttons ? '0' : '-1', "\" class=\"").concat(this.settings.buttonup_class || 'btn btn-outline-secondary', " bootstrap-touchspin-up\" data-touchspin-injected=\"up\" type=\"button\" aria-label=\"Increase value\">").concat(this.settings.buttonup_txt || '+', "</button>\n          <span class=\"input-group-text bootstrap-touchspin-postfix ").concat(this.settings.postfix_extraclass || '', "\" data-touchspin-injected=\"postfix\">").concat(this.settings.postfix || '', "</span>\n        </div>\n      ");
        }

        // Create wrapper and wrap the input
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = html.trim();
        var wrapper = tempDiv.firstChild;

        // Insert wrapper and move input into it
        this.input.parentElement.insertBefore(wrapper, this.input);

        // Find the position to insert input
        if (this.settings.verticalbuttons) {
          // For vertical buttons, insert after prefix
          var prefixEl = wrapper.querySelector('[data-touchspin-injected="prefix"]');
          wrapper.insertBefore(this.input, prefixEl.nextSibling);
        } else {
          // For horizontal buttons, insert after down button, before up button
          var upButton = wrapper.querySelector('[data-touchspin-injected="up"]');
          wrapper.insertBefore(this.input, upButton);
        }

        // Hide empty prefix/postfix (pass wrapper directly since this.wrapper isn't set yet)
        this.hideEmptyPrefixPostfix(wrapper);
        return wrapper;
      }
    }, {
      key: "buildAdvancedInputGroup",
      value: function buildAdvancedInputGroup(existingInputGroup) {
        // Add bootstrap-touchspin class to existing input-group
        existingInputGroup.classList.add('bootstrap-touchspin');
        existingInputGroup.setAttribute('data-touchspin-injected', 'wrapper-advanced');

        // Add testid if input has one
        var inputTestId = this.input.getAttribute('data-testid');
        if (inputTestId) {
          existingInputGroup.setAttribute('data-testid', "".concat(inputTestId, "-wrapper"));
        }

        // Create elements based on vertical or horizontal layout
        var elementsHtml;
        if (this.settings.verticalbuttons) {
          elementsHtml = "\n        <span class=\"input-group-text bootstrap-touchspin-prefix ".concat(this.settings.prefix_extraclass || '', "\" data-touchspin-injected=\"prefix\">").concat(this.settings.prefix || '', "</span>\n        <span class=\"input-group-text bootstrap-touchspin-postfix ").concat(this.settings.postfix_extraclass || '', "\" data-touchspin-injected=\"postfix\">").concat(this.settings.postfix || '', "</span>\n        ").concat(this.buildVerticalButtons(), "\n      ");
        } else {
          elementsHtml = "\n        <span class=\"input-group-text bootstrap-touchspin-prefix ".concat(this.settings.prefix_extraclass || '', "\" data-touchspin-injected=\"prefix\">").concat(this.settings.prefix || '', "</span>\n        <button tabindex=\"").concat(this.settings.focusablebuttons ? '0' : '-1', "\" class=\"").concat(this.settings.buttondown_class || 'btn btn-outline-secondary', " bootstrap-touchspin-down\" data-touchspin-injected=\"down\" type=\"button\" aria-label=\"Decrease value\">").concat(this.settings.buttondown_txt || '−', "</button>\n        <button tabindex=\"").concat(this.settings.focusablebuttons ? '0' : '-1', "\" class=\"").concat(this.settings.buttonup_class || 'btn btn-outline-secondary', " bootstrap-touchspin-up\" data-touchspin-injected=\"up\" type=\"button\" aria-label=\"Increase value\">").concat(this.settings.buttonup_txt || '+', "</button>\n        <span class=\"input-group-text bootstrap-touchspin-postfix ").concat(this.settings.postfix_extraclass || '', "\" data-touchspin-injected=\"postfix\">").concat(this.settings.postfix || '', "</span>\n      ");
        }
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = elementsHtml;

        // Insert prefix before the input
        var prefixEl = tempDiv.querySelector('[data-touchspin-injected="prefix"]');
        existingInputGroup.insertBefore(prefixEl, this.input);
        if (this.settings.verticalbuttons) {
          // For vertical buttons, insert vertical wrapper after input
          var verticalWrapper = tempDiv.querySelector('[data-touchspin-injected="vertical-wrapper"]');
          existingInputGroup.insertBefore(verticalWrapper, this.input.nextSibling);

          // Insert postfix after vertical wrapper
          var postfixEl = tempDiv.querySelector('[data-touchspin-injected="postfix"]');
          existingInputGroup.insertBefore(postfixEl, verticalWrapper.nextSibling);
        } else {
          // For horizontal buttons, insert them around the input
          var downButton = tempDiv.querySelector('[data-touchspin-injected="down"]');
          existingInputGroup.insertBefore(downButton, this.input);
          var upButton = tempDiv.querySelector('[data-touchspin-injected="up"]');
          existingInputGroup.insertBefore(upButton, this.input.nextSibling);

          // Insert postfix after up button
          var _postfixEl = tempDiv.querySelector('[data-touchspin-injected="postfix"]');
          existingInputGroup.insertBefore(_postfixEl, upButton.nextSibling);
        }

        // Hide empty prefix/postfix
        this.hideEmptyPrefixPostfix(existingInputGroup);
        return existingInputGroup;
      }
    }, {
      key: "_detectInputGroupSize",
      value: function _detectInputGroupSize() {
        var classList = this.input.className;
        if (classList.includes('form-control-sm')) {
          return 'input-group-sm';
        } else if (classList.includes('form-control-lg')) {
          return 'input-group-lg';
        }
        return '';
      }
    }, {
      key: "hideEmptyPrefixPostfix",
      value: function hideEmptyPrefixPostfix() {
        var wrapper = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.wrapper;
        var prefixEl = wrapper.querySelector('[data-touchspin-injected="prefix"]');
        var postfixEl = wrapper.querySelector('[data-touchspin-injected="postfix"]');
        if (prefixEl && (!this.settings.prefix || this.settings.prefix === '')) {
          prefixEl.remove();
        }
        if (postfixEl && (!this.settings.postfix || this.settings.postfix === '')) {
          postfixEl.remove();
        }
      }
    }, {
      key: "updatePrefix",
      value: function updatePrefix(value) {
        var prefixEl = this.wrapper.querySelector('[data-touchspin-injected="prefix"]');
        if (value && value !== '') {
          if (!prefixEl) {
            // Re-create prefix element if it was removed
            prefixEl = document.createElement('span');
            prefixEl.className = "input-group-text bootstrap-touchspin-prefix ".concat(this.settings.prefix_extraclass || '').trim();
            prefixEl.setAttribute('data-touchspin-injected', 'prefix');
            // Insert at the beginning of the wrapper
            this.wrapper.insertBefore(prefixEl, this.wrapper.firstChild);
          }
          prefixEl.textContent = value;
          // Update classes in case prefix_extraclass changed
          prefixEl.className = "input-group-text bootstrap-touchspin-prefix ".concat(this.settings.prefix_extraclass || '').trim();
        } else if (prefixEl) {
          // Remove element if value is empty
          prefixEl.remove();
        }
      }
    }, {
      key: "updatePostfix",
      value: function updatePostfix(value) {
        var postfixEl = this.wrapper.querySelector('[data-touchspin-injected="postfix"]');
        if (value && value !== '') {
          if (!postfixEl) {
            // Re-create postfix element if it was removed
            postfixEl = document.createElement('span');
            postfixEl.className = "input-group-text bootstrap-touchspin-postfix ".concat(this.settings.postfix_extraclass || '').trim();
            postfixEl.setAttribute('data-touchspin-injected', 'postfix');
            // Insert at the end of the wrapper
            this.wrapper.appendChild(postfixEl);
          }
          postfixEl.textContent = value;
          // Update classes in case postfix_extraclass changed
          postfixEl.className = "input-group-text bootstrap-touchspin-postfix ".concat(this.settings.postfix_extraclass || '').trim();
        } else if (postfixEl) {
          // Remove element if value is empty
          postfixEl.remove();
        }
      }
    }, {
      key: "updateButtonClass",
      value: function updateButtonClass(type, className) {
        var button = this.wrapper.querySelector("[data-touchspin-injected=\"".concat(type, "\"]"));
        if (button) {
          button.className = "".concat(className || 'btn btn-outline-secondary', " bootstrap-touchspin-").concat(type);
        }
      }
    }, {
      key: "buildVerticalButtons",
      value: function buildVerticalButtons() {
        // Bootstrap 5: Return complete wrapper since there's no outer wrapper in the calling code
        return "\n      <span class=\"input-group-text bootstrap-touchspin-vertical-button-wrapper\" data-touchspin-injected=\"vertical-wrapper\">\n        <span class=\"input-group-btn-vertical\">\n          <button tabindex=\"".concat(this.settings.focusablebuttons ? '0' : '-1', "\" class=\"").concat(this.settings.buttonup_class || 'btn btn-outline-secondary', " ").concat(this.settings.verticalupclass || 'btn btn-outline-secondary', " bootstrap-touchspin-up\" data-touchspin-injected=\"up\" type=\"button\" aria-label=\"Increase value\">").concat(this.settings.verticalup || '+', "</button>\n          <button tabindex=\"").concat(this.settings.focusablebuttons ? '0' : '-1', "\" class=\"").concat(this.settings.buttondown_class || 'btn btn-outline-secondary', " ").concat(this.settings.verticaldownclass || 'btn btn-outline-secondary', " bootstrap-touchspin-down\" data-touchspin-injected=\"down\" type=\"button\" aria-label=\"Decrease value\">").concat(this.settings.verticaldown || '−', "</button>\n        </span>\n      </span>\n    ");
      }
    }, {
      key: "updateVerticalButtonClass",
      value: function updateVerticalButtonClass(type, className) {
        var verticalWrapper = this.wrapper.querySelector('[data-touchspin-injected="vertical-wrapper"]');
        if (verticalWrapper) {
          var button = verticalWrapper.querySelector("[data-touchspin-injected=\"".concat(type, "\"]"));
          if (button) {
            // Update the vertical-specific class while preserving base classes
            var baseClasses = this.settings.buttonup_class || this.settings.buttondown_class || 'btn btn-outline-secondary';
            button.className = "".concat(baseClasses, " ").concat(className || 'btn btn-outline-secondary', " bootstrap-touchspin-").concat(type);
          }
        }
      }
    }, {
      key: "updateVerticalButtonText",
      value: function updateVerticalButtonText(type, text) {
        var verticalWrapper = this.wrapper.querySelector('[data-touchspin-injected="vertical-wrapper"]');
        if (verticalWrapper) {
          var button = verticalWrapper.querySelector("[data-touchspin-injected=\"".concat(type, "\"]"));
          if (button) {
            button.textContent = text || (type === 'up' ? '+' : '−');
          }
        }
      }
    }, {
      key: "updateButtonText",
      value: function updateButtonText(type, text) {
        var button = this.wrapper.querySelector("[data-touchspin-injected=\"".concat(type, "\"]"));
        if (button) {
          button.textContent = text || (type === 'up' ? '+' : '−');
        }
      }
    }]);
  }(AbstractRenderer);

  // Standalone Bootstrap 5 build entry point

  // Create a wrapper that automatically sets the Bootstrap 5 renderer
  function TouchSpin(element) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (!(element instanceof Element)) {
      throw new TypeError('TouchSpin expects an HTMLElement');
    }

    // Set the baked-in renderer for this build
    options.renderer = options.renderer || Bootstrap5Renderer;

    // Use the core TouchSpin function which properly handles initDOMEventHandling
    return TouchSpin$1(element, options);
  }

  // Expose additional API functions
  TouchSpin.get = getTouchSpin;
  TouchSpin.destroy = function (element) {
    var instance = getTouchSpin(element);
    if (instance && instance.destroy) {
      instance.destroy();
      return true;
    }
    return false;
  };

  // For standalone builds, ensure globals are properly exposed
  if (typeof window !== 'undefined') {
    window.TouchSpin = TouchSpin;
    window.TouchSpinCore = TouchSpinCore;
    window.getTouchSpin = getTouchSpin;
    window.Bootstrap5Renderer = Bootstrap5Renderer;
  }

  exports.Bootstrap5Renderer = Bootstrap5Renderer;
  exports.TouchSpin = TouchSpin;
  exports.TouchSpinCore = TouchSpinCore;
  exports.getTouchSpin = getTouchSpin;

  return exports;

})({});
//# sourceMappingURL=touchspin-bs5.js.map

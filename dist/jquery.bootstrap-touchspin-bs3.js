/*
 *  Bootstrap Touchspin - v4.8.0
 *  A mobile and touch friendly input spinner component for Bootstrap 3, 4 & 5.
 *  https://www.virtuosoft.eu/code/bootstrap-touchspin/
 *
 *  Made by István Ujj-Mészáros
 *  Under MIT License
 */
"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
// Bootstrap 3 specific build - BEFORE main plugin
(function () {
  'use strict';

  /**
  * Migrated copy from src/renderers/AbstractRenderer.js (transitional)
  */
  var AbstractRenderer = /*#__PURE__*/function () {
    function AbstractRenderer($, settings, originalinput) {
      _classCallCheck(this, AbstractRenderer);
      this.$ = $;
      this.settings = settings;
      this.originalinput = originalinput;
      this.container = null;
      this.elements = null;
    }
    return _createClass(AbstractRenderer, [{
      key: "getFrameworkId",
      value: function getFrameworkId() {
        throw new Error('getFrameworkId() must be implemented by subclasses');
      }
    }, {
      key: "getDefaultSettings",
      value: function getDefaultSettings() {
        return {};
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
        var inputTestId = this.originalinput.attr('data-testid');
        if (inputTestId) return " data-testid=\"".concat(inputTestId, "-wrapper\"");
        return '';
      }
    }]);
  }();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AbstractRenderer;
  } else if (typeof window !== 'undefined') {
    window.AbstractRenderer = AbstractRenderer;
  }

  /**
   * Migrated copy from src/renderers/Bootstrap3Renderer.js (transitional)
   */
  var Bootstrap3Renderer = /*#__PURE__*/function (_AbstractRenderer) {
    function Bootstrap3Renderer() {
      _classCallCheck(this, Bootstrap3Renderer);
      return _callSuper(this, Bootstrap3Renderer, arguments);
    }
    _inherits(Bootstrap3Renderer, _AbstractRenderer);
    return _createClass(Bootstrap3Renderer, [{
      key: "getFrameworkId",
      value: function getFrameworkId() {
        return 'bootstrap3';
      }
    }, {
      key: "getDefaultSettings",
      value: function getDefaultSettings() {
        return {
          buttonup_class: 'btn btn-default',
          buttondown_class: 'btn btn-default',
          verticalupclass: 'btn btn-default',
          verticaldownclass: 'btn btn-default'
        };
      }
    }, {
      key: "_detectInputGroupSize",
      value: function _detectInputGroupSize() {
        if (this.originalinput.hasClass('input-sm')) {
          return 'input-group-sm';
        } else if (this.originalinput.hasClass('input-lg')) {
          return 'input-group-lg';
        }
        return '';
      }
    }, {
      key: "_applySizeClasses",
      value: function _applySizeClasses() {
        if (this.originalinput.hasClass('input-sm')) {
          this.container.addClass('input-group-sm');
        } else if (this.originalinput.hasClass('input-lg')) {
          this.container.addClass('input-group-lg');
        }
      }
    }, {
      key: "buildAdvancedInputGroup",
      value: function buildAdvancedInputGroup(parentelement) {
        parentelement.addClass('bootstrap-touchspin');
        parentelement.attr('data-touchspin-injected', 'enhanced-wrapper');
        var testidAttr = this.getWrapperTestId();
        if (testidAttr) {
          var testidValue = testidAttr.match(/data-testid=\"([^\"]+)\"/);
          if (testidValue) {
            parentelement.attr('data-testid', testidValue[1]);
          }
        }
        var prev = this.originalinput.prev();
        var next = this.originalinput.next();
        if (this.settings.verticalbuttons) {
          var verticalHtml = this.buildVerticalButtons();
          this.$(verticalHtml).insertAfter(this.originalinput);
        } else {
          if (prev.hasClass('input-group-btn')) {
            var downhtml = "\n          <button tabindex=\"-1\" class=\"".concat(this.settings.buttondown_class, " bootstrap-touchspin-down\" data-touchspin-injected=\"down\" type=\"button\">").concat(this.settings.buttondown_txt, "</button>\n        ");
            prev.append(downhtml);
          } else {
            var _downhtml = "\n          <span class=\"input-group-btn\" data-touchspin-injected=\"down-wrapper\">\n            <button tabindex=\"-1\" class=\"".concat(this.settings.buttondown_class, " bootstrap-touchspin-down\" data-touchspin-injected=\"down\" type=\"button\">").concat(this.settings.buttondown_txt, "</button>\n          </span>\n        ");
            this.$(_downhtml).insertBefore(this.originalinput);
          }
          if (next.hasClass('input-group-btn')) {
            var uphtml = "\n          <button tabindex=\"-1\" class=\"".concat(this.settings.buttonup_class, " bootstrap-touchspin-up\" data-touchspin-injected=\"up\" type=\"button\">").concat(this.settings.buttonup_txt, "</button>\n        ");
            next.prepend(uphtml);
          } else {
            var _uphtml = "\n          <span class=\"input-group-btn\" data-touchspin-injected=\"up-wrapper\">\n            <button tabindex=\"-1\" class=\"".concat(this.settings.buttonup_class, " bootstrap-touchspin-up\" data-touchspin-injected=\"up\" type=\"button\">").concat(this.settings.buttonup_txt, "</button>\n          </span>\n        ");
            this.$(_uphtml).insertAfter(this.originalinput);
          }
        }
        var prefixhtml = "\n      <span class=\"input-group-addon\" data-touchspin-injected=\"prefix\">".concat(this.settings.prefix, "</span>\n    ");
        var postfixhtml = "\n      <span class=\"input-group-addon\" data-touchspin-injected=\"postfix\">".concat(this.settings.postfix, "</span>\n    ");
        if (prev.hasClass('input-group-addon')) {
          // Reuse existing prefix addon; do not modify attributes
        } else {
          this.$(prefixhtml).insertBefore(this.originalinput);
        }
        if (next.hasClass('input-group-addon')) {
          // Reuse existing postfix addon; do not modify attributes
        } else {
          this.$(postfixhtml).insertAfter(this.originalinput);
        }
        this.container = parentelement;
        return parentelement;
      }
    }, {
      key: "buildInputGroup",
      value: function buildInputGroup() {
        var inputGroupSize = this._detectInputGroupSize();
        var testidAttr = this.getWrapperTestId();
        var html;
        if (this.settings.verticalbuttons) {
          html = "\n        <div class=\"input-group ".concat(inputGroupSize, " bootstrap-touchspin\" data-touchspin-injected=\"wrapper\"").concat(testidAttr, ">\n          <span class=\"input-group-addon\" data-touchspin-injected=\"prefix\">").concat(this.settings.prefix, "</span>\n          <span class=\"input-group-addon\" data-touchspin-injected=\"postfix\">").concat(this.settings.postfix, "</span>\n          <span class=\"bootstrap-touchspin-vertical-button-wrapper\" data-touchspin-injected=\"vertical-wrapper\">\n            <span class=\"input-group-btn-vertical\">\n              <button tabindex=\"-1\" class=\"").concat(this.settings.buttonup_class, " bootstrap-touchspin-up ").concat(this.settings.verticalupclass, "\" data-touchspin-injected=\"up\" type=\"button\">").concat(this.settings.verticalup, "</button>\n              <button tabindex=\"-1\" class=\"").concat(this.settings.buttondown_class, " bootstrap-touchspin-down ").concat(this.settings.verticaldownclass, "\" data-touchspin-injected=\"down\" type=\"button\">").concat(this.settings.verticaldown, "</button>\n            </span>\n          </span>\n        </div>\n      ");
        } else {
          html = "\n        <div class=\"input-group ".concat(inputGroupSize, " bootstrap-touchspin\" data-touchspin-injected=\"wrapper\"").concat(testidAttr, ">\n          <span class=\"input-group-btn\" data-touchspin-injected=\"down\">\n            <button tabindex=\"-1\" class=\"").concat(this.settings.buttondown_class, " bootstrap-touchspin-down\" type=\"button\">").concat(this.settings.buttondown_txt, "</button>\n          </span>\n          <span class=\"input-group-addon\" data-touchspin-injected=\"prefix\">").concat(this.settings.prefix, "</span>\n          <span class=\"input-group-addon\" data-touchspin-injected=\"postfix\">").concat(this.settings.postfix, "</span>\n          <span class=\"input-group-btn\" data-touchspin-injected=\"up\">\n            <button tabindex=\"-1\" class=\"").concat(this.settings.buttonup_class, " bootstrap-touchspin-up\" type=\"button\">").concat(this.settings.buttonup_txt, "</button>\n          </span>\n        </div>\n      ");
        }
        this.container = this.$(html).insertBefore(this.originalinput);
        this.$('[data-touchspin-injected="prefix"]', this.container).after(this.originalinput);
        this._applySizeClasses();
        return this.container;
      }
    }, {
      key: "buildVerticalButtons",
      value: function buildVerticalButtons() {
        return "\n      <span class=\"input-group-addon bootstrap-touchspin-vertical-button-wrapper\" data-touchspin-injected=\"vertical-wrapper\">\n        <span class=\"input-group-btn-vertical\">\n          <button tabindex=\"-1\" class=\"".concat(this.settings.buttonup_class, " bootstrap-touchspin-up ").concat(this.settings.verticalupclass, "\" data-touchspin-injected=\"up\" type=\"button\">").concat(this.settings.verticalup, "</button>\n          <button tabindex=\"-1\" class=\"").concat(this.settings.buttondown_class, " bootstrap-touchspin-down ").concat(this.settings.verticaldownclass, "\" data-touchspin-injected=\"down\" type=\"button\">").concat(this.settings.verticaldown, "</button>\n        </span>\n      </span>\n    ");
      }
    }, {
      key: "updatePrefixPostfix",
      value: function updatePrefixPostfix(newsettings, detached) {
        if (newsettings.postfix) {
          var $postfix = this.originalinput.parent().find('[data-touchspin-injected="postfix"]');
          if ($postfix.length === 0 && detached._detached_postfix) {
            detached._detached_postfix.insertAfter(this.originalinput);
          }
          this.originalinput.parent().find('[data-touchspin-injected="postfix"]').text(newsettings.postfix);
        }
        if (newsettings.prefix) {
          var $prefix = this.originalinput.parent().find('[data-touchspin-injected="prefix"]');
          if ($prefix.length === 0 && detached._detached_prefix) {
            detached._detached_prefix.insertBefore(this.originalinput);
          }
          this.originalinput.parent().find('[data-touchspin-injected="prefix"]').text(newsettings.prefix);
        }
      }
    }]);
  }(AbstractRenderer);
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Bootstrap3Renderer;
  } else if (typeof window !== 'undefined') {
    window.Bootstrap3Renderer = Bootstrap3Renderer;
  }

  // Simple factory for single version - no auto-detection needed
  var RendererFactory = /*#__PURE__*/function () {
    function RendererFactory() {
      _classCallCheck(this, RendererFactory);
    }
    return _createClass(RendererFactory, null, [{
      key: "createRenderer",
      value: function createRenderer($, settings, originalinput) {
        return new Bootstrap3Renderer($, settings, originalinput);
      }
    }, {
      key: "getFrameworkId",
      value: function getFrameworkId() {
        return 'bootstrap3';
      }
    }]);
  }();
  if (typeof window !== 'undefined') {
    window.AbstractRenderer = AbstractRenderer;
    window.Bootstrap3Renderer = Bootstrap3Renderer;
    window.RendererFactory = RendererFactory;
  }
})();

// Wrapper-based plugin registration (core initializer + wrapper)
(function () {
  'use strict';

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
   * @property {import('./renderer-interface.js').TSRenderer=} renderer  // future DOM renderer
   */
  var DEFAULTS = {
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
    callback_before_calculation: function callback_before_calculation(v) {
      return v;
    },
    callback_after_calculation: function callback_after_calculation(v) {
      return v;
    }
  };
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
      /** @type {TouchSpinCoreOptions} */
      this.settings = Object.assign({}, DEFAULTS, opts);
      /** @type {boolean} */
      this.spinning = false;
      /** @type {number} */
      this.spincount = 0;
      /** @type {false|'up'|'down'} */
      this.direction = false;
      /** @type {Map<string, Set<Function>>} */
      this._events = new Map();

      // Initialize ARIA attributes and sanitize display immediately
      this._updateAriaAttributes();
      this._checkValue(false);

      /** @type {ReturnType<typeof setTimeout>|null} */
      this._spinDelayTimeout = null;
      /** @type {ReturnType<typeof setInterval>|null} */
      this._spinIntervalTimer = null;
    }

    /** Increment once according to step */
    return _createClass(TouchSpinCore, [{
      key: "upOnce",
      value: function upOnce() {
        if (this.input.disabled || this.input.hasAttribute('readonly')) {
          return;
        }
        var v = this.getValue();
        var next = this._nextValue('up', v);
        var prevNum = v;
        this._setDisplay(next, true);
        if (isFinite(prevNum) && next !== prevNum) {
          if (this.settings.max != null && next === this.settings.max) this.emit('max');
          if (this.settings.min != null && next === this.settings.min) this.emit('min');
        }
        // If we hit the max while spinning upward, stop the spin to release lock
        if (this.spinning && this.direction === 'up' && this.settings.max != null && next === this.settings.max) {
          this.stopSpin();
        }
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
        var prevNum = v;
        this._setDisplay(next, true);
        if (isFinite(prevNum) && next !== prevNum) {
          if (this.settings.max != null && next === this.settings.max) this.emit('max');
          if (this.settings.min != null && next === this.settings.min) this.emit('min');
        }
        // If we hit the min while spinning downward, stop the spin to release lock
        if (this.spinning && this.direction === 'down' && this.settings.min != null && next === this.settings.min) {
          this.stopSpin();
        }
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
        this.settings = Object.assign({}, this.settings, opts || {});
        // If step/min/max changed and step != 1, align bounds to step like the jQuery plugin
        var ns = opts || {};
        var step = Number(this.settings.step || 1);
        if ((ns.step !== undefined || ns.min !== undefined || ns.max !== undefined) && step !== 1) {
          if (this.settings.max != null) {
            this.settings.max = this._alignToStep(Number(this.settings.max), step, 'down');
          }
          if (this.settings.min != null) {
            this.settings.min = this._alignToStep(Number(this.settings.min), step, 'up');
          }
        }
        this._updateAriaAttributes();
        this._checkValue(false);
      }

      /** @returns {number} */
    }, {
      key: "getValue",
      value: function getValue() {
        var raw = this.input.value;
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

      /** Cleanup (placeholder) */
    }, {
      key: "destroy",
      value: function destroy() {
        this.stopSpin();
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
          off: this.off.bind(this)
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
        var _this = this;
        var set = this._events.get(event) || new Set();
        set.add(handler);
        this._events.set(event, set);
        return function () {
          return _this.off(event, handler);
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
        for (var _i = 0, _arr = _toConsumableArray(set); _i < _arr.length; _i++) {
          var fn = _arr[_i];
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
        var _this2 = this;
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
          _this2._spinDelayTimeout = null;
          _this2._spinIntervalTimer = setInterval(function () {
            if (!_this2.spinning || _this2.direction !== dir) return; // safety
            _this2._spinStep(dir);
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
   */
  /**
   * Create and return a plain public API bound to a new core instance.
   * @param {HTMLInputElement} inputEl
   * @param {Partial<TouchSpinCoreOptions>=} opts
   * @returns {TouchSpinCorePublicAPI}
   */
  function createPublicApi(inputEl, opts) {
    return new TouchSpinCore(inputEl, opts).toPublicApi();
  }

  /** Event name constants for wrappers to map/bridge. */
  var CORE_EVENTS = Object.freeze({
    MIN: 'min',
    MAX: 'max',
    START_SPIN: 'startspin',
    START_UP: 'startupspin',
    START_DOWN: 'startdownspin',
    STOP_SPIN: 'stopspin',
    STOP_UP: 'stopupspin',
    STOP_DOWN: 'stopdownspin'
  });

  /**
   * Convenience helper to attach core to an input element.
   * @param {HTMLInputElement} inputEl
   * @param {Partial<TouchSpinCoreOptions>=} opts
   * @returns {TouchSpinCore}
   */
  function attach(inputEl, opts) {
    return new TouchSpinCore(inputEl, opts);
  }

  // @ts-check
  /**
   * Install a jQuery plugin wrapper powered by the new core.
   * Preserves Command API and callable event emissions.
   * @param {import('jquery').JQueryStatic} $
   */
  function installJqueryTouchSpin($) {
    /** Basic defaults mirroring core */
    var DEFAULTS = {
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
      verticaldown: '▼'
    };
    $.fn.TouchSpin = function (options, arg) {
      if (typeof options === 'string') {
        var cmd = String(options).toLowerCase();
        var ret;
        this.each(function () {
          var $el = $(this);
          var api = $el.data('touchspinInternal');
          if (!api) return;
          switch (cmd) {
            case 'destroy':
              api.destroy();
              teardown($el);
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
        var $input = $(this);
        try {
          if ($input.data('touchspinInternal')) teardown($input);
        } catch (_unused3) {}
        var opts = $.extend({}, DEFAULTS, options || {});

        // Optional UI via RendererFactory; if absent, run core-only with no wrapper UI
        /* global RendererFactory */
        var elements = {
          up: null,
          down: null,
          input: $input
        };
        var $container = null;
        var renderer = null;
        var __detached = null;
        if (typeof window !== 'undefined' && window.RendererFactory) {
          // Fill renderer-specific defaults for null placeholders (parity with original plugin)
          try {
            var temp = window.RendererFactory.createRenderer($, {}, $input);
            if (temp && typeof temp.getDefaultSettings === 'function') {
              var rd = temp.getDefaultSettings();
              Object.keys(rd).forEach(function (k) {
                if (opts[k] === null) opts[k] = rd[k];
              });
            }
          } catch (_unused4) {}
          renderer = window.RendererFactory.createRenderer($, opts, $input);
          // Detect advanced input-group (Bootstrap) or a custom advanced container
          var advancedContainer = null;
          try {
            var $parent = $input.parent();
            if ($parent && $parent.hasClass('input-group')) advancedContainer = $parent;
            if (!advancedContainer) {
              var $adv = $input.closest('[data-touchspin-advanced]');
              if ($adv && $adv.length) advancedContainer = $adv;
            }
          } catch (_unused5) {}
          var container = advancedContainer ? renderer.buildAdvancedInputGroup(advancedContainer) : renderer.buildInputGroup();
          $container = container;
          elements = renderer.initElements(container);
          try {
            __detached = renderer.hideEmptyPrefixPostfix();
          } catch (_unused6) {}
        }

        // Create core API
        var inst = createPublicApi(/** @type {HTMLInputElement} */$input[0], opts);
        $input.data('touchspin', inst);
        $input.data('touchspinInternal', inst);

        // Bridge core events to jQuery events
        var evMap = _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, CORE_EVENTS.MIN, 'touchspin.on.min'), CORE_EVENTS.MAX, 'touchspin.on.max'), CORE_EVENTS.START_SPIN, 'touchspin.on.startspin'), CORE_EVENTS.START_UP, 'touchspin.on.startupspin'), CORE_EVENTS.START_DOWN, 'touchspin.on.startdownspin'), CORE_EVENTS.STOP_SPIN, 'touchspin.on.stopspin'), CORE_EVENTS.STOP_UP, 'touchspin.on.stopupspin'), CORE_EVENTS.STOP_DOWN, 'touchspin.on.stopdownspin');
        var unsubs = [];
        Object.keys(evMap).forEach(function (k) {
          // @ts-ignore
          unsubs.push(inst.on(k, function () {
            return $input.trigger(evMap[k]);
          }));
        });

        // Wire buttons if present (match src: immediate once, then start spin)
        if (elements && elements.up && elements.up.length) {
          elements.up.on('mousedown.touchspin', function (e) {
            if ($input.is(':disabled') || $input.is('[readonly]')) return;
            inst.upOnce();
            inst.startUpSpin();
            e.preventDefault();
            e.stopPropagation();
          });
          elements.up.on('touchstart.touchspin', function (e) {
            if ($input.is(':disabled') || $input.is('[readonly]')) return;
            inst.upOnce();
            inst.startUpSpin();
            e.preventDefault();
            e.stopPropagation();
          });
          elements.up.on('mouseup.touchspin mouseout.touchspin touchleave.touchspin touchend.touchspin touchcancel.touchspin', function (e) {
            inst.stopSpin();
            e.stopPropagation();
          });
          elements.up.on('mousemove.touchspin touchmove.touchspin', function (e) {
            if (!$input.data('touchspinInternal')) return;
            e.stopPropagation();
            e.preventDefault();
          });
        }
        if (elements && elements.down && elements.down.length) {
          elements.down.on('mousedown.touchspin', function (e) {
            if ($input.is(':disabled') || $input.is('[readonly]')) return;
            inst.downOnce();
            inst.startDownSpin();
            e.preventDefault();
            e.stopPropagation();
          });
          elements.down.on('touchstart.touchspin', function (e) {
            if ($input.is(':disabled') || $input.is('[readonly]')) return;
            inst.downOnce();
            inst.startDownSpin();
            e.preventDefault();
            e.stopPropagation();
          });
          elements.down.on('mouseup.touchspin mouseout.touchspin touchleave.touchspin touchend.touchspin touchcancel.touchspin', function (e) {
            inst.stopSpin();
            e.stopPropagation();
          });
          elements.down.on('mousemove.touchspin touchmove.touchspin', function (e) {
            if (!$input.data('touchspinInternal')) return;
            e.stopPropagation();
            e.preventDefault();
          });
        }

        // Callable events
        $input.on('touchspin.uponce', function () {
          return inst.upOnce();
        });
        $input.on('touchspin.downonce', function () {
          return inst.downOnce();
        });
        $input.on('touchspin.startupspin', function () {
          return inst.startUpSpin();
        });
        $input.on('touchspin.startdownspin', function () {
          return inst.startDownSpin();
        });
        $input.on('touchspin.stopspin', function () {
          return inst.stopSpin();
        });
        $input.on('touchspin.updatesettings', function (e, o) {
          var newOpts = o || {};
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
                var prev = $input.data('__ts_prefix_extra');
                var next = newOpts.prefix_extraclass;
                var $el = $container.find('[data-touchspin-injected="prefix"]');
                if (prev) $el.removeClass(prev);
                if (next) $el.addClass(next);
                $input.data('__ts_prefix_extra', next || '');
              }
              if (Object.prototype.hasOwnProperty.call(newOpts, 'postfix_extraclass')) {
                var _prev = $input.data('__ts_postfix_extra');
                var _next = newOpts.postfix_extraclass;
                var _$el = $container.find('[data-touchspin-injected="postfix"]');
                if (_prev) _$el.removeClass(_prev);
                if (_next) _$el.addClass(_next);
                $input.data('__ts_postfix_extra', _next || '');
              }
            }
          } catch (_unused7) {}
        });
        $input.on('touchspin.destroy', function () {
          return teardown($input);
        });

        // Keyboard interactions (ArrowUp/Down once+auto; Enter sanitizes) — requires focus
        var __dir = false;
        $input.on('keydown.touchspin', function (ev) {
          var e = ev.originalEvent || ev;
          var code = e.keyCode || e.which || 0;
          if (code === 38) {
            // ArrowUp
            if (__dir !== 'up') {
              inst.upOnce();
              inst.startUpSpin();
              __dir = 'up';
            }
            ev.preventDefault();
          } else if (code === 40) {
            // ArrowDown
            if (__dir !== 'down') {
              inst.downOnce();
              inst.startDownSpin();
              __dir = 'down';
            }
            ev.preventDefault();
          } else if (code === 13) {
            // Enter: sanitize
            try {
              var v = inst.getValue();
              if (isFinite(v)) inst.setValue(v);
            } catch (_unused8) {}
          }
        });
        $input.on('keyup.touchspin', function (ev) {
          var e = ev.originalEvent || ev;
          var code = e.keyCode || e.which || 0;
          if (code === 38 || code === 40) {
            inst.stopSpin();
            __dir = false;
          }
        });

        // Mouse wheel interaction (requires focus, like the original src)
        $input.on('wheel.touchspin', function (ev) {
          var e = ev.originalEvent || ev;
          // Support legacy wheelDelta (positive up) and deltaY (negative up)
          var wheelDelta = typeof e.wheelDelta === 'number' ? e.wheelDelta : 0;
          var deltaY = typeof e.deltaY === 'number' ? e.deltaY : 0;
          var up = wheelDelta > 0 || deltaY < 0;
          // Only act if the input is focused to match source-of-truth behavior
          if (document.activeElement === $input[0]) {
            if (up) inst.upOnce();else inst.downOnce();
            ev.preventDefault();
          }
        });

        // Container focusout: stop spin and sanitize when leaving the widget
        if ($container && $container.length) {
          $container.on('focusout.touchspin', function (evt) {
            var next = /** @type {HTMLElement|null} */evt.relatedTarget;
            var contains = next ? $container[0].contains(next) : false;
            if (contains) return;
            setTimeout(function () {
              var ae = /** @type {HTMLElement|null} */document.activeElement;
              if (!ae || !$container[0].contains(ae)) {
                try {
                  inst.stopSpin();
                  var v = inst.getValue();
                  if (isFinite(v)) inst.setValue(v);
                } catch (_unused9) {}
              }
            }, 0);
          });
        }

        // Attribute sync via MutationObserver
        var __observer = null;
        try {
          var el = /** @type {HTMLElement} */$input[0];
          if ('MutationObserver' in window) {
            __observer = new MutationObserver(function () {
              var disabled = $input.is(':disabled');
              var readonly = $input.is('[readonly]');
              if (disabled || readonly) inst.stopSpin();
              /** @type {any} */
              var ns = {};
              var attrMin = $input.attr('min');
              var attrMax = $input.attr('max');
              var attrStep = $input.attr('step');
              ns.min = attrMin !== undefined ? Number(attrMin) : null;
              ns.max = attrMax !== undefined ? Number(attrMax) : null;
              ns.step = attrStep !== undefined ? Number(attrStep) : 1;
              inst.updateSettings(ns);
            });
            __observer.observe(el, {
              attributes: true,
              attributeFilter: ['disabled', 'readonly', 'min', 'max', 'step']
            });
          }
        } catch (_unused0) {}

        // record cleanup hooks
        $input.data('__ts_unsubs', unsubs);
        if (__observer) $input.data('__ts_observer', __observer);
        if (renderer) $input.data('__ts_renderer', renderer);
        if (__detached) $input.data('__ts_detached', __detached);
      });
      function teardown($input) {
        try {
          var inst = $input.data('touchspinInternal');
          if (inst) {
            try {
              inst.destroy();
            } catch (_unused1) {}
          }
        } catch (_unused10) {}
        try {
          var unsubs = $input.data('__ts_unsubs') || [];
          unsubs.forEach(function (u) {
            try {
              u();
            } catch (_unused11) {}
          });
        } catch (_unused12) {}
        try {
          var obs = $input.data('__ts_observer');
          if (obs && obs.disconnect) obs.disconnect();
        } catch (_unused13) {}
        try {
          $input.removeData('__ts_renderer');
        } catch (_unused14) {}
        try {
          $input.removeData('__ts_detached');
        } catch (_unused15) {}
        // Remove container wrapper if present and restore input
        var $wrap = $input.closest('[data-touchspin-injected="wrapper"]');
        if ($wrap.length) {
          $wrap.before($input);
          $wrap.remove();
        } else {
          // Advanced enhancement cleanup: keep parent container (.input-group or [data-touchspin-advanced])
          var $adv = null;
          try {
            $adv = $input.closest('.input-group');
            if (!$adv || !$adv.length) $adv = $input.closest('[data-touchspin-advanced]');
            if (!$adv || !$adv.length) $adv = $input.closest('[data-touchspin-injected="enhanced-wrapper"]');
          } catch (_unused16) {}
          var $scope = $adv && $adv.length ? $adv : $input.parent();
          try {
            $scope.find('[data-touchspin-injected="down"],[data-touchspin-injected="down-wrapper"]').remove();
          } catch (_unused17) {}
          try {
            $scope.find('[data-touchspin-injected="up"],[data-touchspin-injected="up-wrapper"]').remove();
          } catch (_unused18) {}
          try {
            $scope.find('[data-touchspin-injected="prefix"]').remove();
          } catch (_unused19) {}
          try {
            $scope.find('[data-touchspin-injected="postfix"]').remove();
          } catch (_unused20) {}
          try {
            $scope.find('[data-touchspin-injected="vertical-wrapper"]').remove();
          } catch (_unused21) {}
          try {
            if ($adv && $adv.length) {
              $adv.removeAttr('data-touchspin-injected');
              $adv.removeClass('bootstrap-touchspin');
            }
          } catch (_unused22) {}
        }
        $input.off('.touchspin');
        $input.removeData('touchspin');
        $input.removeData('touchspinInternal');
        $input.removeData('__ts_unsubs');
      }
    };
  }
  if (typeof window !== 'undefined' && window.jQuery) {
    installJqueryTouchSpin(window.jQuery);
  }
})();
(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) : factory();
})(function () {
  'use strict';
});
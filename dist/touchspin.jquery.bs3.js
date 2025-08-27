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
(function () {
  "use strict";

  var AbstractRenderer = /*#__PURE__*/function () {
    function AbstractRenderer($, settings, originalinput) {
      _classCallCheck(this, AbstractRenderer);
      this.$ = $;
      this.settings = settings;
      this.originalinput = originalinput;
      this.container = null;
      this.elements = null;
    }
    /**
     * Get framework identifier this renderer supports
     * @returns {string} Framework identifier (e.g., "bootstrap3", "bootstrap4", "bootstrap5", "tailwind")
     */
    return _createClass(AbstractRenderer, [{
      key: "getFrameworkId",
      value: function getFrameworkId() {
        throw new Error("getFrameworkId() must be implemented by subclasses");
      }
      /**
       * Get framework-specific default settings
       * Override this method in subclasses to provide appropriate defaults for each framework
       * @returns {object} Default settings object
       */
    }, {
      key: "getDefaultSettings",
      value: function getDefaultSettings() {
        return {};
      }
      /**
       * Build HTML structure when parent already has input-group class
       * @param {jQuery} parentelement Parent element with input-group class
       */
    }, {
      key: "buildAdvancedInputGroup",
      value: function buildAdvancedInputGroup(parentelement) {
        throw new Error("buildAdvancedInputGroup() must be implemented by subclasses");
      }
      /**
       * Build complete input group from scratch
       * @returns {jQuery} Created input group container
       */
    }, {
      key: "buildInputGroup",
      value: function buildInputGroup() {
        throw new Error("buildInputGroup() must be implemented by subclasses");
      }
      /**
       * Generate vertical buttons HTML
       * @returns {string} Vertical buttons HTML
       */
    }, {
      key: "buildVerticalButtons",
      value: function buildVerticalButtons() {
        throw new Error("buildVerticalButtons() must be implemented by subclasses");
      }
      /**
       * Initialize element references after HTML is built
       * @param {jQuery} container The container element
       */
    }, {
      key: "initElements",
      value: function initElements(container) {
        this.container = container;
        var downButtons = this._findElements(container, "down");
        var upButtons = this._findElements(container, "up");
        if (downButtons.length === 0 || upButtons.length === 0) {
          var verticalContainer = this._findElements(container.parent(), "vertical-wrapper");
          if (verticalContainer.length > 0) {
            downButtons = this._findElements(verticalContainer, "down");
            upButtons = this._findElements(verticalContainer, "up");
          }
        }
        this.elements = {
          down: downButtons,
          up: upButtons,
          input: this.$("input", container),
          prefix: this._findElements(container, "prefix").addClass(this.settings.prefix_extraclass),
          postfix: this._findElements(container, "postfix").addClass(this.settings.postfix_extraclass)
        };
        return this.elements;
      }
      /**
       * Find elements using data attributes
       * @private
       * @param {jQuery} container Container to search within
       * @param {string} role Element role - must be one of: "wrapper", "up", "down", "prefix", "postfix", "vertical-wrapper"
       * @returns {jQuery} Found elements with data-touchspin-injected attribute matching the role
       */
    }, {
      key: "_findElements",
      value: function _findElements(container, role) {
        return this.$("[data-touchspin-injected=\"".concat(role, "\"]"), container);
      }
      /**
       * Hide empty prefix/postfix elements
       * @returns {object} Object with detached prefix/postfix elements
       */
    }, {
      key: "hideEmptyPrefixPostfix",
      value: function hideEmptyPrefixPostfix() {
        var detached = {};
        if (this.settings.prefix === "") {
          detached._detached_prefix = this.elements.prefix.detach();
        }
        if (this.settings.postfix === "") {
          detached._detached_postfix = this.elements.postfix.detach();
        }
        return detached;
      }
      /**
       * Update prefix/postfix content - to be implemented by subclasses
       * @param {object} newsettings New settings object
       * @param {object} detached Detached elements object
       */
    }, {
      key: "updatePrefixPostfix",
      value: function updatePrefixPostfix(newsettings, detached) {
        throw new Error("updatePrefixPostfix() must be implemented by subclasses");
      }
      /**
       * Get wrapper testid attribute based on input's data-testid
       * If input has data-testid="example", returns ' data-testid="example-wrapper"'
       * @returns {string} Testid attribute string or empty string
       */
    }, {
      key: "getWrapperTestId",
      value: function getWrapperTestId() {
        var inputTestId = this.originalinput.attr("data-testid");
        if (inputTestId) {
          return " data-testid=\"".concat(inputTestId, "-wrapper\"");
        }
        return "";
      }
    }]);
  }();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = AbstractRenderer;
  } else if (typeof window !== "undefined") {
    window.AbstractRenderer = AbstractRenderer;
  }
  var Bootstrap3Renderer = /*#__PURE__*/function (_AbstractRenderer) {
    function Bootstrap3Renderer() {
      _classCallCheck(this, Bootstrap3Renderer);
      return _callSuper(this, Bootstrap3Renderer, arguments);
    }
    _inherits(Bootstrap3Renderer, _AbstractRenderer);
    return _createClass(Bootstrap3Renderer, [{
      key: "getFrameworkId",
      value: function getFrameworkId() {
        return "bootstrap3";
      }
      /**
       * Get Bootstrap 3 framework-specific default settings
       * Provides appropriate button classes for Bootstrap 3
       * @returns {object} Bootstrap 3-specific default settings
       */
    }, {
      key: "getDefaultSettings",
      value: function getDefaultSettings() {
        return {
          buttonup_class: "btn btn-default",
          buttondown_class: "btn btn-default",
          verticalupclass: "btn btn-default",
          verticaldownclass: "btn btn-default"
        };
      }
      /**
       * Detect input group size from original input classes (Bootstrap 3 specific)
       * @private
       * @returns {string} Size class for input group
       */
    }, {
      key: "_detectInputGroupSize",
      value: function _detectInputGroupSize() {
        if (this.originalinput.hasClass("input-sm")) {
          return "input-group-sm";
        } else if (this.originalinput.hasClass("input-lg")) {
          return "input-group-lg";
        }
        return "";
      }
      /**
       * Apply size classes to container based on input classes (Bootstrap 3 specific)
       * @private
       */
    }, {
      key: "_applySizeClasses",
      value: function _applySizeClasses() {
        if (this.originalinput.hasClass("input-sm")) {
          this.container.addClass("input-group-sm");
        } else if (this.originalinput.hasClass("input-lg")) {
          this.container.addClass("input-group-lg");
        }
      }
    }, {
      key: "buildVerticalButtons",
      value: function buildVerticalButtons() {
        return "\n      <span class=\"input-group-addon bootstrap-touchspin-vertical-button-wrapper\" data-touchspin-injected=\"vertical-wrapper\">\n        <span class=\"input-group-btn-vertical\">\n          <button tabindex=\"-1\" class=\"".concat(this.settings.buttonup_class, " bootstrap-touchspin-up ").concat(this.settings.verticalupclass, "\" data-touchspin-injected=\"up\" type=\"button\">").concat(this.settings.verticalup, "</button>\n          <button tabindex=\"-1\" class=\"").concat(this.settings.buttondown_class, " bootstrap-touchspin-down ").concat(this.settings.verticaldownclass, "\" data-touchspin-injected=\"down\" type=\"button\">").concat(this.settings.verticaldown, "</button>\n        </span>\n      </span>\n    ");
      }
    }, {
      key: "buildAdvancedInputGroup",
      value: function buildAdvancedInputGroup(parentelement) {
        parentelement.addClass("bootstrap-touchspin");
        parentelement.attr("data-touchspin-injected", "enhanced-wrapper");
        var testidAttr = this.getWrapperTestId();
        if (testidAttr) {
          var testidValue = testidAttr.match(/data-testid="([^"]+)"/);
          if (testidValue) {
            parentelement.attr("data-testid", testidValue[1]);
          }
        }
        var prev = this.originalinput.prev();
        var next = this.originalinput.next();
        var prefixhtml = "\n      <span class=\"input-group-addon\" data-touchspin-injected=\"prefix\">\n        ".concat(this.settings.prefix, "\n      </span>\n    ");
        var postfixhtml = "\n      <span class=\"input-group-addon\" data-touchspin-injected=\"postfix\">\n        ".concat(this.settings.postfix, "\n      </span>\n    ");
        if (this.settings.verticalbuttons) {
          this.$(this.buildVerticalButtons()).insertAfter(this.originalinput);
        } else {
          if (prev.hasClass("input-group-btn")) {
            var downhtml = "\n          <button tabindex=\"-1\" class=\"".concat(this.settings.buttondown_class, " bootstrap-touchspin-down\" data-touchspin-injected=\"down\" type=\"button\">").concat(this.settings.buttondown_txt, "</button>\n        ");
            prev.append(downhtml);
          } else {
            var _downhtml = "\n          <span class=\"input-group-btn\" data-touchspin-injected=\"\">\n            <button tabindex=\"-1\" class=\"".concat(this.settings.buttondown_class, " bootstrap-touchspin-down\" data-touchspin-injected=\"down\" type=\"button\">").concat(this.settings.buttondown_txt, "</button>\n          </span>\n        ");
            this.$(_downhtml).insertBefore(this.originalinput);
          }
          if (next.hasClass("input-group-btn")) {
            var uphtml = "\n          <button tabindex=\"-1\" class=\"".concat(this.settings.buttonup_class, " bootstrap-touchspin-up\" data-touchspin-injected=\"up\" type=\"button\">").concat(this.settings.buttonup_txt, "</button>\n        ");
            next.prepend(uphtml);
          } else {
            var _uphtml = "\n          <span class=\"input-group-btn\" data-touchspin-injected=\"\">\n            <button tabindex=\"-1\" class=\"".concat(this.settings.buttonup_class, " bootstrap-touchspin-up\" data-touchspin-injected=\"up\" type=\"button\">").concat(this.settings.buttonup_txt, "</button>\n          </span>\n        ");
            this.$(_uphtml).insertAfter(this.originalinput);
          }
        }
        this.$(prefixhtml).insertBefore(this.originalinput);
        this.$(postfixhtml).insertAfter(this.originalinput);
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
          html = "\n        <div class=\"input-group ".concat(inputGroupSize, " bootstrap-touchspin\" data-touchspin-injected=\"wrapper\"").concat(testidAttr, ">\n          <span class=\"input-group-addon\" data-touchspin-injected=\"prefix\">\n            ").concat(this.settings.prefix, "\n          </span>\n          <span class=\"input-group-addon\" data-touchspin-injected=\"postfix\">\n            ").concat(this.settings.postfix, "\n          </span>\n          ").concat(this.buildVerticalButtons(), "\n        </div>\n      ");
        } else {
          html = "\n        <div class=\"input-group bootstrap-touchspin\" data-touchspin-injected=\"wrapper\"".concat(testidAttr, ">\n          <span class=\"input-group-btn\">\n            <button tabindex=\"-1\" class=\"").concat(this.settings.buttondown_class, " bootstrap-touchspin-down\" data-touchspin-injected=\"down\" type=\"button\">").concat(this.settings.buttondown_txt, "</button>\n          </span>\n          <span class=\"input-group-addon\" data-touchspin-injected=\"prefix\">\n            ").concat(this.settings.prefix, "\n          </span>\n          <span class=\"input-group-addon\" data-touchspin-injected=\"postfix\">\n            ").concat(this.settings.postfix, "\n          </span>\n          <span class=\"input-group-btn\">\n            <button tabindex=\"-1\" class=\"").concat(this.settings.buttonup_class, " bootstrap-touchspin-up\" data-touchspin-injected=\"up\" type=\"button\">").concat(this.settings.buttonup_txt, "</button>\n          </span>\n        </div>\n      ");
        }
        this.container = this.$(html).insertBefore(this.originalinput);
        this.$('[data-touchspin-injected="prefix"]', this.container).after(this.originalinput);
        this._applySizeClasses();
        return this.container;
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
  if (typeof module !== "undefined" && module.exports) {
    module.exports = Bootstrap3Renderer;
  } else if (typeof window !== "undefined") {
    window.Bootstrap3Renderer = Bootstrap3Renderer;
  }
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
        return "bootstrap3";
      }
    }]);
  }();
  if (typeof window !== "undefined") {
    window.AbstractRenderer = AbstractRenderer;
    window.Bootstrap3Renderer = Bootstrap3Renderer;
    window.RendererFactory = RendererFactory;
  }
})();
(function (factory) {
  typeof define === "function" && define.amd ? define(factory) : factory();
})(function () {
  "use strict";

  (function (factory) {
    if (typeof define === "function" && define.amd) {
      define(["jquery"], factory);
    } else if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === "object" && module.exports) {
      module.exports = function (root, jQuery2) {
        if (jQuery2 === void 0) {
          if (typeof window !== "undefined") {
            jQuery2 = require("jquery");
          } else {
            jQuery2 = require("jquery")(root);
          }
        }
        factory(jQuery2);
        return jQuery2;
      };
    } else {
      factory(jQuery);
    }
  })(function ($) {
    var __touchspinInternalStore = typeof WeakMap !== "undefined" ? /* @__PURE__ */new WeakMap() : null;
    $.fn.TouchSpin = function (options, arg) {
      var defaults = {
        min: 0,
        // If null, there is no minimum enforced
        max: 100,
        // If null, there is no maximum enforced
        initval: "",
        replacementval: "",
        firstclickvalueifempty: null,
        step: 1,
        decimals: 0,
        stepinterval: 100,
        forcestepdivisibility: "round",
        // none | floor | round | ceil
        stepintervaldelay: 500,
        verticalbuttons: false,
        verticalup: "&plus;",
        verticaldown: "&minus;",
        verticalupclass: null,
        // Framework-specific, will be provided by renderer
        verticaldownclass: null,
        // Framework-specific, will be provided by renderer
        prefix: "",
        postfix: "",
        prefix_extraclass: "",
        postfix_extraclass: "",
        booster: true,
        boostat: 10,
        maxboostedstep: false,
        mousewheel: true,
        buttondown_class: null,
        // Framework-specific, will be provided by renderer
        buttonup_class: null,
        // Framework-specific, will be provided by renderer
        buttondown_txt: "&minus;",
        buttonup_txt: "&plus;",
        // Renderer system options
        renderer: null,
        // Custom renderer instance
        /** @type {TouchSpinCalcCallback} */
        callback_before_calculation: function callback_before_calculation(value) {
          return value;
        },
        /** @type {TouchSpinCalcCallback} */
        callback_after_calculation: function callback_after_calculation(value) {
          return value;
        }
      };
      var attributeMap = {
        min: "min",
        max: "max",
        initval: "init-val",
        replacementval: "replacement-val",
        firstclickvalueifempty: "first-click-value-if-empty",
        step: "step",
        decimals: "decimals",
        stepinterval: "step-interval",
        verticalbuttons: "vertical-buttons",
        verticalupclass: "vertical-up-class",
        verticaldownclass: "vertical-down-class",
        forcestepdivisibility: "force-step-divisibility",
        stepintervaldelay: "step-interval-delay",
        prefix: "prefix",
        postfix: "postfix",
        prefix_extraclass: "prefix-extra-class",
        postfix_extraclass: "postfix-extra-class",
        booster: "booster",
        boostat: "boostat",
        maxboostedstep: "max-boosted-step",
        mousewheel: "mouse-wheel",
        buttondown_class: "button-down-class",
        buttonup_class: "button-up-class",
        buttondown_txt: "button-down-txt",
        buttonup_txt: "button-up-txt"
      };
      if (typeof options === "string") {
        var cmd = String(options).toLowerCase();
        var ret;
        this.each(function () {
          var $el = $(this);
          var api = $el.data("touchspinInternal");
          if (!api) return;
          switch (cmd) {
            case "destroy":
              api.destroy();
              break;
            case "uponce":
              api.upOnce();
              break;
            case "downonce":
              api.downOnce();
              break;
            case "startupspin":
              api.startUpSpin();
              break;
            case "startdownspin":
              api.startDownSpin();
              break;
            case "stopspin":
              api.stopSpin();
              break;
            case "updatesettings":
              api.updateSettings(arg || {});
              break;
            case "getvalue":
            case "get":
              if (ret === void 0) ret = api.getValue();
              break;
            case "setvalue":
            case "set":
              api.setValue(arg);
              break;
          }
        });
        return ret === void 0 ? this : ret;
      }
      return this.each(function () {
        var settings,
          originalinput = $(this),
          originalinput_data = originalinput.data(),
          _detached_prefix,
          _detached_postfix,
          container,
          elements,
          renderer,
          value,
          downSpinTimer,
          upSpinTimer,
          downDelayTimeout,
          upDelayTimeout,
          spincount = 0,
          spinning = false,
          mutationObserver,
          _nativeListeners = [],
          inputEl,
          containerEl;
        init();
        function init() {
          if (originalinput.data("alreadyinitialized")) {
            originalinput.trigger("touchspin.destroy");
          }
          originalinput.data("alreadyinitialized", true);
          if (!originalinput.is("input")) {
            console.log("Must be an input.");
            return;
          }
          inputEl = /** @type {HTMLInputElement} */
          originalinput[0];
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
          originalinput.data("touchspinInternal", {
            upOnce: upOnce,
            downOnce: downOnce,
            startUpSpin: startUpSpin,
            startDownSpin: startDownSpin,
            stopSpin: stopSpin,
            updateSettings: changeSettings,
            destroy: function destroy() {
              _destroy();
            },
            getValue: function getValue() {
              var _a;
              var raw = String((_a = inputEl.value) != null ? _a : "");
              if (raw === "") return NaN;
              var num = parseFloat(settings.callback_before_calculation(raw));
              return isFinite(num) ? num : NaN;
            },
            setValue: function setValue(v) {
              var _a;
              if (inputEl.disabled || inputEl.hasAttribute("readonly")) return;
              stopSpin();
              var parsed = Number(v);
              if (!isFinite(parsed)) return;
              var adjusted = parseFloat(_forcestepdivisibility(parsed));
              if (settings.min !== null && adjusted < settings.min) {
                adjusted = settings.min;
              }
              if (settings.max !== null && adjusted > settings.max) {
                adjusted = settings.max;
              }
              var prev = String((_a = inputEl.value) != null ? _a : "");
              var next = _setDisplay(adjusted);
              if (prev !== next) {
                originalinput.trigger("change");
              }
            }
          });
          if (__touchspinInternalStore) {
            try {
              __touchspinInternalStore.set(originalinput[0], originalinput.data("touchspinInternal"));
            } catch (e) {}
          }
        }
        function _setInitval() {
          if (settings.initval !== "" && inputEl.value === "") {
            inputEl.value = settings.initval;
          }
        }
        function changeSettings(newsettings) {
          var _a;
          _updateSettings(newsettings);
          _checkValue(true);
          var raw = String((_a = inputEl.value) != null ? _a : "");
          if (raw !== "") {
            var num = parseFloat(settings.callback_before_calculation(raw));
            if (isFinite(num)) {
              _setDisplay(num);
            }
          }
        }
        function _nextValue(dir, current) {
          var v = current;
          if (isNaN(v)) {
            v = valueIfIsNaN();
          } else {
            var step = _getBoostedStep();
            v = dir === "up" ? v + step : v - step;
          }
          if (settings.max !== null && v >= settings.max) {
            v = settings.max;
          }
          if (settings.min !== null && v <= settings.min) {
            v = settings.min;
          }
          return v;
        }
        function _formatDisplay(num) {
          return settings.callback_after_calculation(parseFloat(num).toFixed(settings.decimals));
        }
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
        function _alignToStep(val, step, dir) {
          if (val == null) return val;
          var k = 1,
            s = step;
          while (s * k % 1 !== 0 && k < 1e6) k *= 10;
          var V = Math.round(val * k),
            S = Math.round(step * k);
          if (S === 0) return val;
          var r = V % S;
          if (r === 0) return val;
          return (dir === "down" ? V - r : V + (S - r)) / k;
        }
        function _initSettings() {
          settings = Object.assign({}, defaults, originalinput_data, _parseAttributes(), options);
          var stepNum = Number(settings.step);
          if (!isFinite(stepNum) || stepNum <= 0) settings.step = 1;
          if (settings.min != null) {
            var minNum = Number(settings.min);
            settings.min = isFinite(minNum) ? minNum : null;
          }
          if (settings.max != null) {
            var maxNum = Number(settings.max);
            settings.max = isFinite(maxNum) ? maxNum : null;
          }
          var dec = parseInt(String(settings.decimals), 10);
          settings.decimals = isFinite(dec) && dec >= 0 ? dec : 0;
          settings.stepinterval = Math.max(0, parseInt(String(settings.stepinterval), 10) || 0);
          settings.stepintervaldelay = Math.max(0, parseInt(String(settings.stepintervaldelay), 10) || 0);
          settings.boostat = Math.max(1, parseInt(String(settings.boostat), 10) || 10);
          if (settings.maxboostedstep !== false) {
            var mbs = Number(settings.maxboostedstep);
            settings.maxboostedstep = isFinite(mbs) && mbs > 0 ? mbs : false;
          }
          if (parseFloat(settings.step) !== 1) {
            settings.max = _alignToStep(settings.max, settings.step, "down");
            settings.min = _alignToStep(settings.min, settings.step, "up");
          }
        }
        function _parseAttributes() {
          var data = {};
          $.each(attributeMap, function (key, value2) {
            var attrName = "bts-" + value2;
            if (originalinput.is("[data-" + attrName + "]")) {
              data[key] = originalinput.data(attrName);
            }
          });
          $.each(["min", "max", "step"], function (i, key) {
            if (originalinput.is("[" + key + "]")) {
              if (data[key] !== void 0) {
                console.warn('Both the "data-bts-' + key + '" data attribute and the "' + key + '" individual attribute were specified, the individual attribute will take precedence on: ', originalinput);
              }
              data[key] = originalinput.attr(key);
            }
          });
          return data;
        }
        function _initRenderer() {
          if (settings.renderer) {
            renderer = settings.renderer;
            return;
          }
          var rf = /** @type {any} */
          typeof globalThis !== "undefined" ? globalThis : {};
          var factory = rf && rf.RendererFactory && typeof rf.RendererFactory.createRenderer === "function" ? rf.RendererFactory : void 0;
          if (!factory || !factory.createRenderer) {
            throw new Error("Bootstrap TouchSpin: RendererFactory not available. This indicates a build system error. Please ensure the renderer files are properly built and included.");
          }
          var tempRenderer = factory.createRenderer($, {}, originalinput);
          if (tempRenderer && typeof tempRenderer.getDefaultSettings === "function") {
            var rendererDefaults = tempRenderer.getDefaultSettings();
            Object.keys(rendererDefaults).forEach(function (key) {
              if (settings[key] === null) {
                settings[key] = rendererDefaults[key];
              }
            });
          }
          renderer = factory.createRenderer($, settings, originalinput);
          if (!renderer) {
            throw new Error("Bootstrap TouchSpin: Failed to create renderer");
          }
        }
        function _destroy() {
          var $parent = originalinput.parent();
          stopSpin();
          originalinput.off("keydown.touchspin keyup.touchspin mousewheel.touchspin DOMMouseScroll.touchspin wheel.touchspin touchspin.destroy touchspin.uponce touchspin.downonce touchspin.startupspin touchspin.startdownspin touchspin.stopspin touchspin.updatesettings");
          if (container) {
            container.off(".touchspin");
          }
          _offAllNative();
          if (mutationObserver) {
            mutationObserver.disconnect();
            mutationObserver = void 0;
          }
          var injectedMarker = $parent.attr("data-touchspin-injected");
          if (injectedMarker === "wrapper") {
            originalinput.siblings("[data-touchspin-injected]").remove();
            originalinput.unwrap();
          } else {
            $("[data-touchspin-injected]", $parent).remove();
            $parent.removeClass("bootstrap-touchspin");
            $parent.removeAttr("data-touchspin-injected");
          }
          originalinput.data("alreadyinitialized", false);
          originalinput.removeData("touchspinInternal");
          if (__touchspinInternalStore) {
            try {
              __touchspinInternalStore.delete(originalinput[0]);
            } catch (e) {}
          }
        }
        function _updateSettings(newsettings) {
          settings = Object.assign({}, settings, newsettings);
          if ((newsettings.step !== void 0 || newsettings.min !== void 0 || newsettings.max !== void 0) && parseFloat(settings.step) !== 1) {
            settings.max = _alignToStep(settings.max, settings.step, "down");
            settings.min = _alignToStep(settings.min, settings.step, "up");
          }
          if ("postfix" in newsettings || "prefix" in newsettings) {
            if (!renderer) {
              throw new Error("Bootstrap TouchSpin: Renderer not available for updating prefix/postfix.");
            }
            renderer.updatePrefixPostfix(newsettings, {
              _detached_prefix: _detached_prefix,
              _detached_postfix: _detached_postfix
            });
          }
          if ("buttonup_txt" in newsettings || "buttondown_txt" in newsettings || "verticalup" in newsettings || "verticaldown" in newsettings) {
            if (newsettings.buttonup_txt !== void 0 && elements.up) {
              elements.up.html(newsettings.buttonup_txt);
            }
            if (newsettings.buttondown_txt !== void 0 && elements.down) {
              elements.down.html(newsettings.buttondown_txt);
            }
            if (newsettings.verticalup !== void 0 && elements.up) {
              elements.up.html(newsettings.verticalup);
            }
            if (newsettings.verticaldown !== void 0 && elements.down) {
              elements.down.html(newsettings.verticaldown);
            }
          }
          if (newsettings.min !== void 0 || newsettings.max !== void 0 || newsettings.step !== void 0) {
            _syncNativeAttributes();
            _updateAriaAttributes();
          }
          _hideEmptyPrefixPostfix();
        }
        function _buildHtml() {
          var initval = inputEl.value,
            parentelement = originalinput.parent();
          if (initval !== "") {
            var raw = settings.callback_before_calculation(initval);
            var num = parseFloat(raw);
            initval = isFinite(num) ? settings.callback_after_calculation(num.toFixed(settings.decimals)) : settings.callback_after_calculation(raw);
          }
          originalinput.data("initvalue", initval).val(initval);
          originalinput.addClass("form-control");
          if (!renderer) {
            throw new Error("Bootstrap TouchSpin: Renderer not initialized. This indicates an initialization error.");
          }
          if (parentelement.hasClass("input-group")) {
            container = renderer.buildAdvancedInputGroup(parentelement);
          } else {
            container = renderer.buildInputGroup();
          }
        }
        function _initElements() {
          if (!renderer) {
            throw new Error("Bootstrap TouchSpin: Renderer not available for element initialization.");
          }
          elements = renderer.initElements(container);
          containerEl = container && container[0];
          elements && elements.up && elements.up[0];
          elements && elements.down && elements.down[0];
        }
        function _initAriaAttributes() {
          if (!inputEl.getAttribute("role")) {
            inputEl.setAttribute("role", "spinbutton");
          }
          if (settings.min !== null && settings.min !== void 0) {
            inputEl.setAttribute("aria-valuemin", String(settings.min));
          }
          if (settings.max !== null && settings.max !== void 0) {
            inputEl.setAttribute("aria-valuemax", String(settings.max));
          }
          var rawInit = inputEl.value;
          var nInit = rawInit !== "" ? parseFloat(String(rawInit)) : NaN;
          if (!isNaN(nInit)) {
            inputEl.setAttribute("aria-valuenow", String(nInit));
          } else {
            inputEl.removeAttribute("aria-valuenow");
          }
          if (elements && elements.up && elements.down) {
            elements.up.attr("aria-label", "Increase value");
            elements.down.attr("aria-label", "Decrease value");
          }
        }
        function _updateAriaAttributes() {
          var _a;
          var raw = String((_a = inputEl.value) != null ? _a : "");
          if (raw === "") {
            inputEl.removeAttribute("aria-valuenow");
            inputEl.removeAttribute("aria-valuetext");
          } else {
            var n = parseFloat(raw);
            if (!isNaN(n)) {
              inputEl.setAttribute("aria-valuenow", String(n));
            } else {
              inputEl.removeAttribute("aria-valuenow");
            }
            inputEl.setAttribute("aria-valuetext", raw);
          }
          if (settings.min !== null && settings.min !== void 0) {
            inputEl.setAttribute("aria-valuemin", String(settings.min));
          } else {
            inputEl.removeAttribute("aria-valuemin");
          }
          if (settings.max !== null && settings.max !== void 0) {
            inputEl.setAttribute("aria-valuemax", String(settings.max));
          } else {
            inputEl.removeAttribute("aria-valuemax");
          }
        }
        function _hideEmptyPrefixPostfix() {
          if (!renderer) {
            throw new Error("Bootstrap TouchSpin: Renderer not available for prefix/postfix handling.");
          }
          var detached = renderer.hideEmptyPrefixPostfix();
          _detached_prefix = detached._detached_prefix;
          _detached_postfix = detached._detached_postfix;
        }
        function _bindEvents() {
          inputEl = /** @type {HTMLInputElement} */
          originalinput[0];
          containerEl = /** @type {HTMLElement} */
          container && container[0];
          elements.up && elements.up[0];
          elements.down && elements.down[0];
          function _onNative(el, type, handler, options2) {
            if (!el) return;
            el.addEventListener(type, handler, options2);
            _nativeListeners.push([el, type, handler, options2]);
          }
          _onNative(inputEl, "keydown", function (ev) {
            var e = /** @type {KeyboardEvent} */
            ev;
            var code = e.keyCode || e.which || 0;
            if (code === 38) {
              if (spinning !== "up") {
                upOnce();
                startUpSpin();
              }
              e.preventDefault();
            } else if (code === 40) {
              if (spinning !== "down") {
                downOnce();
                startDownSpin();
              }
              e.preventDefault();
            } else if (code === 13) {
              _checkValue(true);
            }
          });
          _onNative(inputEl, "keyup", function (ev) {
            var e = /** @type {KeyboardEvent} */
            ev;
            var code = e.keyCode || e.which || 0;
            if (code === 38 || code === 40) {
              stopSpin();
            }
          });
          originalinput.on("blur.touchspin", function () {
            _checkValue(true);
          });
          function leavingWidget(nextEl) {
            return !nextEl || (containerEl ? !containerEl.contains(nextEl) : true);
          }
          _onNative(containerEl, "focusout", function (e) {
            var next = /** @type {HTMLElement|null|undefined} */
            /** @type {FocusEvent} */
            e.relatedTarget;
            if (!leavingWidget(next)) return;
            setTimeout(function () {
              var ae = /** @type {HTMLElement|null} */
              document.activeElement;
              if (leavingWidget(ae)) {
                stopSpin();
                _checkValue(true);
              }
            }, 0);
          });
          elements.down.on("keydown.touchspin", function (ev) {
            var code = ev.keyCode || ev.which;
            if (code === 32 || code === 13) {
              if (spinning !== "down") {
                downOnce();
                startDownSpin();
              }
              ev.preventDefault();
            }
          });
          elements.down.on("keyup.touchspin", function (ev) {
            var code = ev.keyCode || ev.which;
            if (code === 32 || code === 13) {
              stopSpin();
            }
          });
          elements.up.on("keydown.touchspin", function (ev) {
            var code = ev.keyCode || ev.which;
            if (code === 32 || code === 13) {
              if (spinning !== "up") {
                upOnce();
                startUpSpin();
              }
              ev.preventDefault();
            }
          });
          elements.up.on("keyup.touchspin", function (ev) {
            var code = ev.keyCode || ev.which;
            if (code === 32 || code === 13) {
              stopSpin();
            }
          });
          elements.down.on("mousedown.touchspin", function (ev) {
            elements.down.off("touchstart.touchspin");
            if (inputEl.disabled || inputEl.hasAttribute("readonly")) return;
            downOnce();
            startDownSpin();
            ev.preventDefault();
            ev.stopPropagation();
          });
          elements.down.on("touchstart.touchspin", function (ev) {
            elements.down.off("mousedown.touchspin");
            if (inputEl.disabled || inputEl.hasAttribute("readonly")) return;
            downOnce();
            startDownSpin();
            ev.preventDefault();
            ev.stopPropagation();
          });
          elements.up.on("mousedown.touchspin", function (ev) {
            elements.up.off("touchstart.touchspin");
            if (inputEl.disabled || inputEl.hasAttribute("readonly")) return;
            upOnce();
            startUpSpin();
            ev.preventDefault();
            ev.stopPropagation();
          });
          elements.up.on("touchstart.touchspin", function (ev) {
            elements.up.off("mousedown.touchspin");
            if (inputEl.disabled || inputEl.hasAttribute("readonly")) return;
            upOnce();
            startUpSpin();
            ev.preventDefault();
            ev.stopPropagation();
          });
          elements.up.on("mouseup.touchspin mouseout.touchspin touchleave.touchspin touchend.touchspin touchcancel.touchspin", function (ev) {
            if (!spinning) return;
            ev.stopPropagation();
            stopSpin();
          });
          elements.down.on("mouseup.touchspin mouseout.touchspin touchleave.touchspin touchend.touchspin touchcancel.touchspin", function (ev) {
            if (!spinning) return;
            ev.stopPropagation();
            stopSpin();
          });
          elements.down.on("mousemove.touchspin touchmove.touchspin", function (ev) {
            if (!spinning) return;
            ev.stopPropagation();
            ev.preventDefault();
          });
          elements.up.on("mousemove.touchspin touchmove.touchspin", function (ev) {
            if (!spinning) return;
            ev.stopPropagation();
            ev.preventDefault();
          });
          _onNative(inputEl, "wheel", function (ev) {
            if (!settings.mousewheel || document.activeElement !== inputEl) return;
            var oe = /** @type {any} */
            ev;
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
        function _bindEventsInterface() {
          originalinput.on("touchspin.destroy", function () {
            _destroy();
          });
          originalinput.on("touchspin.uponce", function () {
            stopSpin();
            upOnce();
          });
          originalinput.on("touchspin.downonce", function () {
            stopSpin();
            downOnce();
          });
          originalinput.on("touchspin.startupspin", function () {
            startUpSpin();
          });
          originalinput.on("touchspin.startdownspin", function () {
            startDownSpin();
          });
          originalinput.on("touchspin.stopspin", function () {
            stopSpin();
          });
          originalinput.on("touchspin.updatesettings", function (e, newsettings) {
            changeSettings(newsettings);
          });
        }
        function _offAllNative() {
          for (var i = 0; i < _nativeListeners.length; i++) {
            var rec = _nativeListeners[i];
            rec[0].removeEventListener(rec[1], rec[2], rec[3]);
          }
          _nativeListeners = [];
        }
        function _setupMutationObservers() {
          if (typeof MutationObserver !== "undefined") {
            mutationObserver = new MutationObserver(function (mutations) {
              mutations.forEach(function (mutation) {
                if (mutation.type === "attributes") {
                  if (mutation.attributeName === "disabled" || mutation.attributeName === "readonly") {
                    _updateButtonDisabledState();
                  } else if (mutation.attributeName === "min" || mutation.attributeName === "max" || mutation.attributeName === "step") {
                    _syncSettingsFromNativeAttributes();
                  }
                }
              });
            });
            mutationObserver.observe(originalinput[0], {
              attributes: true,
              attributeFilter: ["disabled", "readonly", "min", "max", "step"]
            });
          }
        }
        function _forcestepdivisibility(value2) {
          switch (settings.forcestepdivisibility) {
            case "round":
              return (Math.round(value2 / settings.step) * settings.step).toFixed(settings.decimals);
            case "floor":
              return (Math.floor(value2 / settings.step) * settings.step).toFixed(settings.decimals);
            case "ceil":
              return (Math.ceil(value2 / settings.step) * settings.step).toFixed(settings.decimals);
            default:
              return value2.toFixed(settings.decimals);
          }
        }
        function _checkValue(mayTriggerChange) {
          var _a, _b, _c, _d;
          var val, parsedval, returnval;
          var prevDisplay = String((_a = inputEl.value) != null ? _a : "");
          val = settings.callback_before_calculation(inputEl.value);
          if (val === "") {
            if (settings.replacementval !== "") {
              inputEl.value = String(settings.replacementval);
              _updateAriaAttributes();
            } else {
              inputEl.removeAttribute("aria-valuenow");
            }
            if (mayTriggerChange) {
              var finalDisplay = String((_b = inputEl.value) != null ? _b : "");
              if (finalDisplay !== prevDisplay) {
                originalinput.trigger("change");
              }
            }
            return;
          }
          if (settings.decimals > 0 && val === ".") {
            return;
          }
          parsedval = parseFloat(val);
          if (isNaN(parsedval)) {
            if (settings.replacementval !== "") {
              var rv = parseFloat(String(settings.replacementval));
              parsedval = isNaN(rv) ? 0 : rv;
            } else {
              parsedval = 0;
            }
          }
          returnval = parsedval;
          returnval = _forcestepdivisibility(parsedval);
          if (settings.min !== null && parsedval < settings.min) {
            returnval = settings.min;
          }
          if (settings.max !== null && parsedval > settings.max) {
            returnval = settings.max;
          }
          String((_c = inputEl.value) != null ? _c : "");
          _setDisplay(parseFloat(returnval));
          if (mayTriggerChange) {
            var nextDisplay = String((_d = inputEl.value) != null ? _d : "");
            if (nextDisplay !== prevDisplay) {
              originalinput.trigger("change");
            }
          }
        }
        function _syncNativeAttributes() {
          if (inputEl.getAttribute("type") === "number") {
            if (settings.min !== null && settings.min !== void 0) {
              inputEl.setAttribute("min", String(settings.min));
            } else {
              inputEl.removeAttribute("min");
            }
            if (settings.max !== null && settings.max !== void 0) {
              inputEl.setAttribute("max", String(settings.max));
            } else {
              inputEl.removeAttribute("max");
            }
            if (settings.step !== null && settings.step !== void 0) {
              inputEl.setAttribute("step", String(settings.step));
            } else {
              inputEl.removeAttribute("step");
            }
          }
        }
        function _syncSettingsFromNativeAttributes() {
          var nativeMin = inputEl.getAttribute("min");
          var nativeMax = inputEl.getAttribute("max");
          var nativeStep = inputEl.getAttribute("step");
          var needsUpdate = false;
          var newSettings = {};
          if (nativeMin != null) {
            var parsedMin = nativeMin === "" ? null : parseFloat(nativeMin);
            if (parsedMin != null) {
              var minNum = Number(parsedMin);
              parsedMin = isFinite(minNum) ? minNum : null;
            }
            if (parsedMin !== settings.min) {
              newSettings.min = parsedMin;
              needsUpdate = true;
            }
          } else if (settings.min !== null) {
            newSettings.min = null;
            needsUpdate = true;
          }
          if (nativeMax != null) {
            var parsedMax = nativeMax === "" ? null : parseFloat(nativeMax);
            if (parsedMax != null) {
              var maxNum = Number(parsedMax);
              parsedMax = isFinite(maxNum) ? maxNum : null;
            }
            if (parsedMax !== settings.max) {
              newSettings.max = parsedMax;
              needsUpdate = true;
            }
          } else if (settings.max !== null) {
            newSettings.max = null;
            needsUpdate = true;
          }
          if (nativeStep != null) {
            var parsedStep = nativeStep === "" || nativeStep === "any" ? 1 : parseFloat(nativeStep);
            if (!isFinite(parsedStep) || parsedStep <= 0) parsedStep = 1;
            if (parsedStep !== settings.step) {
              newSettings.step = parsedStep;
              needsUpdate = true;
            }
          } else if (settings.step !== 1) {
            newSettings.step = 1;
            needsUpdate = true;
          }
          if (needsUpdate) {
            settings = Object.assign({}, settings, newSettings);
            if ((newSettings.step !== void 0 || newSettings.min !== void 0 || newSettings.max !== void 0) && parseFloat(settings.step) !== 1) {
              settings.max = _alignToStep(settings.max, settings.step, "down");
              settings.min = _alignToStep(settings.min, settings.step, "up");
            }
            _updateAriaAttributes();
            _checkValue(true);
          }
        }
        function _getBoostedStep() {
          if (!settings.booster) {
            return settings.step;
          } else {
            var boosted = Math.pow(2, Math.floor(spincount / settings.boostat)) * settings.step;
            if (settings.maxboostedstep) {
              if (boosted > settings.maxboostedstep) {
                boosted = settings.maxboostedstep;
                value = Math.round(value / boosted) * boosted;
              }
            }
            return Math.max(settings.step, boosted);
          }
        }
        function _clearSpinTimers() {
          clearTimeout(downDelayTimeout);
          clearTimeout(upDelayTimeout);
          clearInterval(downSpinTimer);
          clearInterval(upSpinTimer);
        }
        function _startSpin(dir) {
          if (inputEl.disabled || inputEl.hasAttribute("readonly")) {
            return;
          }
          _clearSpinTimers();
          spincount = 0;
          spinning = dir;
          originalinput.trigger("touchspin.on.startspin");
          if (dir === "up") {
            originalinput.trigger("touchspin.on.startupspin");
            upDelayTimeout = setTimeout(function () {
              upSpinTimer = setInterval(function () {
                spincount++;
                upOnce();
              }, settings.stepinterval);
            }, settings.stepintervaldelay);
          } else {
            originalinput.trigger("touchspin.on.startdownspin");
            downDelayTimeout = setTimeout(function () {
              downSpinTimer = setInterval(function () {
                spincount++;
                downOnce();
              }, settings.stepinterval);
            }, settings.stepintervaldelay);
          }
        }
        function valueIfIsNaN() {
          if (typeof settings.firstclickvalueifempty === "number") {
            return settings.firstclickvalueifempty;
          } else {
            var min = typeof settings.min === "number" ? settings.min : 0;
            var max = typeof settings.max === "number" ? settings.max : min;
            return (min + max) / 2;
          }
        }
        function _updateButtonDisabledState() {
          var isDisabled = inputEl.disabled || inputEl.hasAttribute("readonly");
          elements.up.prop("disabled", isDisabled);
          elements.down.prop("disabled", isDisabled);
          if (isDisabled) {
            stopSpin();
          }
        }
        function upOnce() {
          var _a;
          if (inputEl.disabled || inputEl.hasAttribute("readonly")) {
            return;
          }
          _checkValue();
          var prevDisplay = String((_a = inputEl.value) != null ? _a : "");
          value = parseFloat(settings.callback_before_calculation(inputEl.value));
          value = _nextValue("up", value);
          if (settings.max !== null && value === settings.max) {
            originalinput.trigger("touchspin.on.max");
            stopSpin();
          }
          var nextDisplay = _setDisplay(value);
          if (prevDisplay !== nextDisplay) originalinput.trigger("change");
        }
        function downOnce() {
          var _a;
          if (inputEl.disabled || inputEl.hasAttribute("readonly")) {
            return;
          }
          _checkValue();
          var prevDisplay = String((_a = inputEl.value) != null ? _a : "");
          value = parseFloat(settings.callback_before_calculation(inputEl.value));
          value = _nextValue("down", value);
          if (settings.min !== null && value === settings.min) {
            originalinput.trigger("touchspin.on.min");
            stopSpin();
          }
          var nextDisplay = _setDisplay(value);
          if (prevDisplay !== nextDisplay) originalinput.trigger("change");
        }
        function startDownSpin() {
          _startSpin("down");
        }
        function startUpSpin() {
          _startSpin("up");
        }
        function stopSpin() {
          _clearSpinTimers();
          switch (spinning) {
            case "up":
              originalinput.trigger("touchspin.on.stopupspin");
              originalinput.trigger("touchspin.on.stopspin");
              break;
            case "down":
              originalinput.trigger("touchspin.on.stopdownspin");
              originalinput.trigger("touchspin.on.stopspin");
              break;
          }
          spincount = 0;
          spinning = false;
        }
      });
    };
  });
});

/* Appended wrapper: src/wrappers/modern-facade.js (via APPEND_WRAPPERS) */
// Modern facade wrapper for Bootstrap TouchSpin.
//
// Purpose: Provide a method-only API without requiring callers to use jQuery
// directly. This wrapper installs on top of the classic jQuery plugin without
// changing its internals or behavior. It mirrors the inline facade currently
// present in the UMD plugin so we can later move/trim that inline code.
//
// Usage in dev/manual pages only (LGTM-7a):
//   1) Load the classic plugin first (src/jquery.bootstrap-touchspin.js or dist/*)
//   2) Then load this file (as a module or classic script).
//
// Notes:
// - Idempotent: If the facade is already installed (by the plugin), this is a no-op.
// - No behavior change: Methods delegate to the plugin’s internal API exposed
//   via $(el).data('touchspinInternal').

/* global window */

function installModernFacade($) {
  try {
    if (typeof window === 'undefined') return;
    // Require jQuery + plugin present
    if (!$ || !$.fn || typeof $.fn.TouchSpin !== 'function') return;

    // If already installed by the plugin or a previous load, skip.
    const _Element = (typeof globalThis !== 'undefined' && /** @type {any} */ (globalThis).Element) || undefined;
    const hasElementProto = !!(_Element && _Element.prototype && _Element.prototype.TouchSpin);
    const hasGlobal = !!(window.TouchSpin && typeof window.TouchSpin.attach === 'function');
    if (hasElementProto && hasGlobal) return;

    // Install global facade
    window.TouchSpin = window.TouchSpin || {};
    window.TouchSpin.attach = function (input, opts) {
      const el = (input && input.nodeType === 1) ? input : document.querySelector(input);
      if (!el) throw new Error('TouchSpin.attach: invalid element');
      const $el = $(el);
      $el.TouchSpin(opts);
      const api = $el.data('touchspinInternal');
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

    // Add convenience on Element.prototype
    if (_Element && _Element.prototype && !_Element.prototype.TouchSpin) {
      Object.defineProperty(_Element.prototype, 'TouchSpin', {
        configurable: true,
        writable: true,
        value: function (opts) { return window.TouchSpin.attach(this, opts); }
      });
    }
  } catch (e) {
    // Silently ignore to avoid breaking manual pages
  }
}

// Auto-install if jQuery is on window, with a short retry loop in case the
// plugin registers asynchronously (ESM twin scenario in manual pages).
let __tsModernFacadeAutoTimer = null;
let __tsModernFacadeInstalled = false;
function tryAutoInstall() {
  try {
    if (typeof window === 'undefined') return done();
    const $ = window.jQuery;
    if (!$) return schedule();
    if ($.fn && typeof $.fn.TouchSpin === 'function') {
      installModernFacade($);
      // Check whether Element.prototype.TouchSpin is now present
      const _Element = (typeof globalThis !== 'undefined' && /** @type {any} */ (globalThis).Element) || undefined;
      if (_Element && _Element.prototype && _Element.prototype.TouchSpin) return done();
    }
    schedule();
  } catch {
    schedule();
  }
}

let __tries = 0;
const __maxTries = 60; // ~3s at 50ms per try
function schedule() {
  if (__tries++ > __maxTries) return done();
  __tsModernFacadeAutoTimer = setTimeout(tryAutoInstall, 50);
}
function done() {
  if (__tsModernFacadeAutoTimer) {
    clearTimeout(__tsModernFacadeAutoTimer);
    __tsModernFacadeAutoTimer = null;
  }
  __tsModernFacadeInstalled = true;
}

try {
  if (typeof window !== 'undefined') {
    tryAutoInstall();
  }
} catch {}


/* End appended wrapper */

/*
 *  Bootstrap Touchspin - v4.7.3
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
  var TailwindRenderer = /*#__PURE__*/function (_AbstractRenderer) {
    function TailwindRenderer() {
      _classCallCheck(this, TailwindRenderer);
      return _callSuper(this, TailwindRenderer, arguments);
    }
    _inherits(TailwindRenderer, _AbstractRenderer);
    return _createClass(TailwindRenderer, [{
      key: "getFrameworkId",
      value: function getFrameworkId() {
        return "tailwind";
      }
      /**
       * Get Tailwind CSS framework-specific default settings
       * Overrides Bootstrap classes with empty strings for CSS independence
       * @returns {object} Tailwind-specific default settings
       */
    }, {
      key: "getDefaultSettings",
      value: function getDefaultSettings() {
        return {
          buttonup_class: "",
          // Remove Bootstrap button classes
          buttondown_class: "",
          // Remove Bootstrap button classes
          verticalupclass: "",
          // Remove Bootstrap button classes for vertical
          verticaldownclass: "",
          // Remove Bootstrap button classes for vertical
          input_class: ""
          // Remove Bootstrap form-control class
        };
      }
      /**
       * Detect input size from Tailwind size classes
       * @private
       * @returns {string} Size classes for container elements
       */
    }, {
      key: "_detectInputSize",
      value: function _detectInputSize() {
        if (this.originalinput.hasClass("text-sm") || this.originalinput.hasClass("py-1")) {
          return "text-sm py-1 px-2";
        } else if (this.originalinput.hasClass("text-lg") || this.originalinput.hasClass("py-3")) {
          return "text-lg py-3 px-4";
        }
        return "text-base py-2 px-3";
      }
      /**
       * Apply size classes to container and elements (Tailwind specific)
       * @private
       */
    }, {
      key: "_applySizeClasses",
      value: function _applySizeClasses() {
        var sizeClasses = this._detectInputSize();
        if (sizeClasses.includes("text-sm")) {
          this.container.addClass("text-sm");
          this.container.find(".tailwind-btn").addClass("py-1 px-2 text-sm");
          this.container.find(".tailwind-addon").addClass("py-1 px-2 text-sm");
        } else if (sizeClasses.includes("text-lg")) {
          this.container.addClass("text-lg");
          this.container.find(".tailwind-btn").addClass("py-3 px-4 text-lg");
          this.container.find(".tailwind-addon").addClass("py-3 px-4 text-lg");
        }
      }
    }, {
      key: "buildAdvancedInputGroup",
      value: function buildAdvancedInputGroup(parentelement) {
        parentelement.addClass("flex rounded-md shadow-sm border border-gray-300 bootstrap-touchspin focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 has-[:disabled]:opacity-60 has-[:disabled]:bg-gray-50 has-[:read-only]:bg-gray-50");
        parentelement.attr("data-touchspin-injected", "enhanced-wrapper");
        var testidAttr = this.getWrapperTestId();
        if (testidAttr) {
          var testidValue = testidAttr.match(/data-testid="([^"]+)"/);
          if (testidValue) {
            parentelement.attr("data-testid", testidValue[1]);
          }
        }
        var prefixhtml = "\n      <span class=\"inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon\" data-touchspin-injected=\"prefix\">\n        ".concat(this.settings.prefix, "\n      </span>\n    ");
        var postfixhtml = "\n      <span class=\"inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon\" data-touchspin-injected=\"postfix\">\n        ".concat(this.settings.postfix, "\n      </span>\n    ");
        if (this.settings.verticalbuttons) {
          var verticalHtml = this.buildVerticalButtons();
          this.$(verticalHtml).insertAfter(this.originalinput);
        } else {
          var downhtml = "\n        <button tabindex=\"-1\" class=\"inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border-0 tailwind-btn bootstrap-touchspin-down ".concat(this.settings.buttondown_class, "\" data-touchspin-injected=\"down\" type=\"button\">\n          ").concat(this.settings.buttondown_txt, "\n        </button>\n      ");
          var uphtml = "\n        <button tabindex=\"-1\" class=\"inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border-0 tailwind-btn bootstrap-touchspin-up ".concat(this.settings.buttonup_class, "\" data-touchspin-injected=\"up\" type=\"button\">\n          ").concat(this.settings.buttonup_txt, "\n        </button>\n      ");
          this.$(downhtml).insertBefore(this.originalinput);
          this.$(uphtml).insertAfter(this.originalinput);
        }
        if (this.settings.prefix !== "") {
          this.$(prefixhtml).insertBefore(this.originalinput);
        }
        if (this.settings.postfix !== "") {
          this.$(postfixhtml).insertAfter(this.originalinput);
        }
        this.originalinput.removeClass("form-control");
        this.originalinput.addClass("flex-1 px-3 py-2 border-0 bg-transparent focus:outline-none text-gray-900 placeholder-gray-500 read-only:bg-gray-50 disabled:cursor-not-allowed");
        this.container = parentelement;
        return parentelement;
      }
    }, {
      key: "buildInputGroup",
      value: function buildInputGroup() {
        var testidAttr = this.getWrapperTestId();
        var html;
        if (this.settings.verticalbuttons) {
          html = "\n        <div class=\"flex rounded-md shadow-sm border border-gray-300 bootstrap-touchspin focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 has-[:disabled]:opacity-60 has-[:disabled]:bg-gray-50 has-[:read-only]:bg-gray-50\" data-touchspin-injected=\"wrapper\"".concat(testidAttr, ">\n          <span class=\"inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon\" data-touchspin-injected=\"prefix\">\n            ").concat(this.settings.prefix, "\n          </span>\n          <span class=\"inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon\" data-touchspin-injected=\"postfix\">\n            ").concat(this.settings.postfix, "\n          </span>\n          <div class=\"flex flex-col ml-1 bootstrap-touchspin-vertical-button-wrapper\" data-touchspin-injected=\"vertical-wrapper\">\n            <button tabindex=\"-1\" class=\"inline-flex items-center justify-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border border-gray-300 rounded-t tailwind-btn bootstrap-touchspin-up ").concat(this.settings.verticalupclass, "\" data-touchspin-injected=\"up\" type=\"button\">\n              ").concat(this.settings.verticalup, "\n            </button>\n            <button tabindex=\"-1\" class=\"inline-flex items-center justify-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border border-t-0 border-gray-300 rounded-b tailwind-btn bootstrap-touchspin-down ").concat(this.settings.verticaldownclass, "\" data-touchspin-injected=\"down\" type=\"button\">\n              ").concat(this.settings.verticaldown, "\n            </button>\n          </div>\n        </div>\n      ");
        } else {
          html = "\n        <div class=\"flex rounded-md shadow-sm border border-gray-300 bootstrap-touchspin focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 has-[:disabled]:opacity-60 has-[:disabled]:bg-gray-50 has-[:read-only]:bg-gray-50\" data-touchspin-injected=\"wrapper\"".concat(testidAttr, ">\n          <button tabindex=\"-1\" class=\"inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border-0 rounded-l-md tailwind-btn bootstrap-touchspin-down ").concat(this.settings.buttondown_class, "\" data-touchspin-injected=\"down\" type=\"button\">\n            ").concat(this.settings.buttondown_txt, "\n          </button>\n          <span class=\"inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon\" data-touchspin-injected=\"prefix\">\n            ").concat(this.settings.prefix, "\n          </span>\n          <span class=\"inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon\" data-touchspin-injected=\"postfix\">\n            ").concat(this.settings.postfix, "\n          </span>\n          <button tabindex=\"-1\" class=\"inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border-0 rounded-r-md tailwind-btn bootstrap-touchspin-up ").concat(this.settings.buttonup_class, "\" data-touchspin-injected=\"up\" type=\"button\">\n            ").concat(this.settings.buttonup_txt, "\n          </button>\n        </div>\n      ");
        }
        this.container = this.$(html).insertBefore(this.originalinput);
        this.$('[data-touchspin-injected="prefix"]', this.container).after(this.originalinput);
        this.originalinput.removeClass("form-control");
        this.originalinput.addClass("flex-1 px-3 py-2 border-0 bg-transparent focus:outline-none text-gray-900 placeholder-gray-500 read-only:bg-gray-50 disabled:cursor-not-allowed");
        this._applySizeClasses();
        return this.container;
      }
    }, {
      key: "buildVerticalButtons",
      value: function buildVerticalButtons() {
        return "\n      <div class=\"flex flex-col ml-1 bootstrap-touchspin-vertical-button-wrapper\" data-touchspin-injected=\"vertical-wrapper\">\n        <button tabindex=\"-1\" class=\"inline-flex items-center justify-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border border-gray-300 rounded-t tailwind-btn bootstrap-touchspin-up ".concat(this.settings.verticalupclass, "\" data-touchspin-injected=\"up\" type=\"button\">\n          ").concat(this.settings.verticalup, "\n        </button>\n        <button tabindex=\"-1\" class=\"inline-flex items-center justify-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border border-t-0 border-gray-300 rounded-b tailwind-btn bootstrap-touchspin-down ").concat(this.settings.verticaldownclass, "\" data-touchspin-injected=\"down\" type=\"button\">\n          ").concat(this.settings.verticaldown, "\n        </button>\n      </div>\n    ");
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
    module.exports = TailwindRenderer;
  } else if (typeof window !== "undefined") {
    window.TailwindRenderer = TailwindRenderer;
  }
  var RendererFactory = /*#__PURE__*/function () {
    function RendererFactory() {
      _classCallCheck(this, RendererFactory);
    }
    return _createClass(RendererFactory, null, [{
      key: "createRenderer",
      value: function createRenderer($, settings, originalinput) {
        return new TailwindRenderer($, settings, originalinput);
      }
    }, {
      key: "getFrameworkId",
      value: function getFrameworkId() {
        return "tailwind";
      }
    }]);
  }();
  if (typeof window !== "undefined") {
    window.AbstractRenderer = AbstractRenderer;
    window.TailwindRenderer = TailwindRenderer;
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
    $.fn.TouchSpin = function (options) {
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
          mutationObserver;
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
              var raw = String((_a = elements.input.val()) != null ? _a : "");
              if (raw === "") return NaN;
              var num = parseFloat(settings.callback_before_calculation(raw));
              return isFinite(num) ? num : NaN;
            },
            setValue: function setValue(v) {
              var _a;
              if (originalinput.is(":disabled,[readonly]")) return;
              stopSpin();
              var num = Number(v);
              if (!isFinite(num)) return;
              if (settings.max !== null && settings.max !== void 0 && num > settings.max) num = settings.max;
              if (settings.min !== null && settings.min !== void 0 && num < settings.min) num = settings.min;
              var prev = String((_a = elements.input.val()) != null ? _a : "");
              var next = settings.callback_after_calculation(parseFloat(num).toFixed(settings.decimals));
              elements.input.val(next);
              _updateAriaAttributes();
              if (prev !== next) {
                originalinput.trigger("change");
              }
            }
          });
        }
        function _setInitval() {
          if (settings.initval !== "" && originalinput.val() === "") {
            originalinput.val(settings.initval);
          }
        }
        function changeSettings(newsettings) {
          var _a;
          _updateSettings(newsettings);
          _checkValue(true);
          var raw = String((_a = elements.input.val()) != null ? _a : "");
          if (raw !== "") {
            var num = parseFloat(settings.callback_before_calculation(raw));
            if (isFinite(num)) {
              elements.input.val(settings.callback_after_calculation(num.toFixed(settings.decimals)));
            }
          }
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
          settings = $.extend({}, defaults, originalinput_data, _parseAttributes(), options);
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
        }
        function _updateSettings(newsettings) {
          settings = $.extend({}, settings, newsettings);
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
          var initval = originalinput.val(),
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
        }
        function _initAriaAttributes() {
          if (!originalinput.attr("role")) {
            originalinput.attr("role", "spinbutton");
          }
          if (settings.min !== null && settings.min !== void 0) {
            originalinput.attr("aria-valuemin", settings.min);
          }
          if (settings.max !== null && settings.max !== void 0) {
            originalinput.attr("aria-valuemax", settings.max);
          }
          var rawInit = originalinput.val();
          var nInit = rawInit !== "" ? parseFloat(String(rawInit)) : NaN;
          if (!isNaN(nInit)) {
            originalinput.attr("aria-valuenow", nInit);
          } else {
            originalinput.removeAttr("aria-valuenow");
          }
          if (elements && elements.up && elements.down) {
            elements.up.attr("aria-label", "Increase value");
            elements.down.attr("aria-label", "Decrease value");
          }
        }
        function _updateAriaAttributes() {
          var _a;
          var raw = String((_a = originalinput.val()) != null ? _a : "");
          if (raw === "") {
            originalinput.removeAttr("aria-valuenow");
            originalinput.removeAttr("aria-valuetext");
          } else {
            var n = parseFloat(raw);
            if (!isNaN(n)) {
              originalinput.attr("aria-valuenow", n);
            } else {
              originalinput.removeAttr("aria-valuenow");
            }
            originalinput.attr("aria-valuetext", raw);
          }
          if (settings.min !== null && settings.min !== void 0) {
            originalinput.attr("aria-valuemin", settings.min);
          } else {
            originalinput.removeAttr("aria-valuemin");
          }
          if (settings.max !== null && settings.max !== void 0) {
            originalinput.attr("aria-valuemax", settings.max);
          } else {
            originalinput.removeAttr("aria-valuemax");
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
          originalinput.on("keydown.touchspin", function (ev) {
            var code = ev.keyCode || ev.which;
            if (code === 38) {
              if (spinning !== "up") {
                upOnce();
                startUpSpin();
              }
              ev.preventDefault();
            } else if (code === 40) {
              if (spinning !== "down") {
                downOnce();
                startDownSpin();
              }
              ev.preventDefault();
            } else if (code === 13) {
              _checkValue(true);
            }
          });
          originalinput.on("keyup.touchspin", function (ev) {
            var code = ev.keyCode || ev.which;
            if (code === 38) {
              stopSpin();
            } else if (code === 40) {
              stopSpin();
            }
          });
          function leavingWidget(nextEl) {
            return !nextEl || !container[0].contains(nextEl);
          }
          container.on("focusout.touchspin", function (e) {
            var next = /** @type {HTMLElement|null|undefined} */
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
            if (originalinput.is(":disabled,[readonly]")) {
              return;
            }
            downOnce();
            startDownSpin();
            ev.preventDefault();
            ev.stopPropagation();
          });
          elements.down.on("touchstart.touchspin", function (ev) {
            elements.down.off("mousedown.touchspin");
            if (originalinput.is(":disabled,[readonly]")) {
              return;
            }
            downOnce();
            startDownSpin();
            ev.preventDefault();
            ev.stopPropagation();
          });
          elements.up.on("mousedown.touchspin", function (ev) {
            elements.up.off("touchstart.touchspin");
            if (originalinput.is(":disabled,[readonly]")) {
              return;
            }
            upOnce();
            startUpSpin();
            ev.preventDefault();
            ev.stopPropagation();
          });
          elements.up.on("touchstart.touchspin", function (ev) {
            elements.up.off("mousedown.touchspin");
            if (originalinput.is(":disabled,[readonly]")) {
              return;
            }
            upOnce();
            startUpSpin();
            ev.preventDefault();
            ev.stopPropagation();
          });
          elements.up.on("mouseup.touchspin mouseout.touchspin touchleave.touchspin touchend.touchspin touchcancel.touchspin", function (ev) {
            if (!spinning) {
              return;
            }
            ev.stopPropagation();
            stopSpin();
          });
          elements.down.on("mouseup.touchspin mouseout.touchspin touchleave.touchspin touchend.touchspin touchcancel.touchspin", function (ev) {
            if (!spinning) {
              return;
            }
            ev.stopPropagation();
            stopSpin();
          });
          elements.down.on("mousemove.touchspin touchmove.touchspin", function (ev) {
            if (!spinning) {
              return;
            }
            ev.stopPropagation();
            ev.preventDefault();
          });
          elements.up.on("mousemove.touchspin touchmove.touchspin", function (ev) {
            if (!spinning) {
              return;
            }
            ev.stopPropagation();
            ev.preventDefault();
          });
          originalinput.on("mousewheel.touchspin DOMMouseScroll.touchspin wheel.touchspin", function (ev) {
            if (!settings.mousewheel || !originalinput.is(":focus")) {
              return;
            }
            var oe = ev.originalEvent || {};
            var delta = oe.wheelDelta || -oe.deltaY || -oe.detail;
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
          var _a, _b, _c;
          var val, parsedval, returnval;
          var prevDisplay = String((_a = originalinput.val()) != null ? _a : "");
          val = settings.callback_before_calculation(originalinput.val());
          if (val === "") {
            if (settings.replacementval !== "") {
              originalinput.val(settings.replacementval);
              _updateAriaAttributes();
            } else {
              originalinput.removeAttr("aria-valuenow");
            }
            if (mayTriggerChange) {
              var finalDisplay = String((_b = originalinput.val()) != null ? _b : "");
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
          var newValue = settings.callback_after_calculation(parseFloat(returnval).toFixed(settings.decimals));
          var currentValue = originalinput.val();
          if (currentValue !== newValue) {
            originalinput.val(newValue);
          }
          _updateAriaAttributes();
          if (mayTriggerChange) {
            var nextDisplay = String((_c = originalinput.val()) != null ? _c : "");
            if (nextDisplay !== prevDisplay) {
              originalinput.trigger("change");
            }
          }
        }
        function _syncNativeAttributes() {
          if (originalinput.attr("type") === "number") {
            if (settings.min !== null && settings.min !== void 0) {
              originalinput.attr("min", settings.min);
            } else {
              originalinput.removeAttr("min");
            }
            if (settings.max !== null && settings.max !== void 0) {
              originalinput.attr("max", settings.max);
            } else {
              originalinput.removeAttr("max");
            }
            if (settings.step !== null && settings.step !== void 0) {
              originalinput.attr("step", settings.step);
            } else {
              originalinput.removeAttr("step");
            }
          }
        }
        function _syncSettingsFromNativeAttributes() {
          var nativeMin = originalinput.attr("min");
          var nativeMax = originalinput.attr("max");
          var nativeStep = originalinput.attr("step");
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
            settings = $.extend({}, settings, newSettings);
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
          var isDisabled = originalinput.is(":disabled,[readonly]");
          elements.up.prop("disabled", isDisabled);
          elements.down.prop("disabled", isDisabled);
          if (isDisabled) {
            stopSpin();
          }
        }
        function upOnce() {
          if (originalinput.is(":disabled,[readonly]")) {
            return;
          }
          _checkValue();
          value = parseFloat(settings.callback_before_calculation(elements.input.val()));
          var initvalue = value;
          var boostedstep;
          if (isNaN(value)) {
            value = valueIfIsNaN();
          } else {
            boostedstep = _getBoostedStep();
            value = value + boostedstep;
          }
          if (settings.max !== null && value >= settings.max) {
            value = settings.max;
            originalinput.trigger("touchspin.on.max");
            stopSpin();
          }
          elements.input.val(settings.callback_after_calculation(parseFloat(value).toFixed(settings.decimals)));
          _updateAriaAttributes();
          if (initvalue !== value) {
            originalinput.trigger("change");
          }
        }
        function downOnce() {
          if (originalinput.is(":disabled,[readonly]")) {
            return;
          }
          _checkValue();
          value = parseFloat(settings.callback_before_calculation(elements.input.val()));
          var initvalue = value;
          var boostedstep;
          if (isNaN(value)) {
            value = valueIfIsNaN();
          } else {
            boostedstep = _getBoostedStep();
            value = value - boostedstep;
          }
          if (settings.min !== null && value <= settings.min) {
            value = settings.min;
            originalinput.trigger("touchspin.on.min");
            stopSpin();
          }
          elements.input.val(settings.callback_after_calculation(parseFloat(value).toFixed(settings.decimals)));
          _updateAriaAttributes();
          if (initvalue !== value) {
            originalinput.trigger("change");
          }
        }
        function startDownSpin() {
          if (originalinput.is(":disabled,[readonly]")) {
            return;
          }
          stopSpin();
          spincount = 0;
          spinning = "down";
          originalinput.trigger("touchspin.on.startspin");
          originalinput.trigger("touchspin.on.startdownspin");
          downDelayTimeout = setTimeout(function () {
            downSpinTimer = setInterval(function () {
              spincount++;
              downOnce();
            }, settings.stepinterval);
          }, settings.stepintervaldelay);
        }
        function startUpSpin() {
          if (originalinput.is(":disabled,[readonly]")) {
            return;
          }
          stopSpin();
          spincount = 0;
          spinning = "up";
          originalinput.trigger("touchspin.on.startspin");
          originalinput.trigger("touchspin.on.startupspin");
          upDelayTimeout = setTimeout(function () {
            upSpinTimer = setInterval(function () {
              spincount++;
              upOnce();
            }, settings.stepinterval);
          }, settings.stepintervaldelay);
        }
        function stopSpin() {
          clearTimeout(downDelayTimeout);
          clearTimeout(upDelayTimeout);
          clearInterval(downSpinTimer);
          clearInterval(upSpinTimer);
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
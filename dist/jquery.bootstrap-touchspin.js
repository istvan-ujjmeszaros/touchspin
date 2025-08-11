/*
 *  Bootstrap Touchspin - v4.7.3
 *  A mobile and touch friendly input spinner component for Bootstrap 3 & 4.
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
(function (factory) {
  typeof define === "function" && define.amd ? define(factory) : factory();
})(function () {
  "use strict";

  var BootstrapRenderer = /*#__PURE__*/function () {
    function BootstrapRenderer($2, settings, originalinput) {
      _classCallCheck(this, BootstrapRenderer);
      this.$ = $2;
      this.settings = settings;
      this.originalinput = originalinput;
      this.container = null;
      this.elements = null;
    }
    /**
     * Get Bootstrap version this renderer supports
     * @returns {number} Bootstrap major version (3, 4, 5, etc.)
     */
    return _createClass(BootstrapRenderer, [{
      key: "getVersion",
      value: function getVersion() {
        throw new Error("getVersion() must be implemented by subclasses");
      }
      /**
       * Get version-specific CSS classes
       * @returns {object} Object containing CSS class mappings
       */
    }, {
      key: "getClasses",
      value: function getClasses() {
        throw new Error("getClasses() must be implemented by subclasses");
      }
      /**
       * Detect input group size from original input classes
       * @returns {string} Size class for input group
       */
    }, {
      key: "detectInputGroupSize",
      value: function detectInputGroupSize() {
        var classes = this.getClasses();
        if (this.originalinput.hasClass(classes.inputSmall) || this.originalinput.hasClass(classes.formControlSmall)) {
          return classes.inputGroupSmall;
        } else if (this.originalinput.hasClass(classes.inputLarge) || this.originalinput.hasClass(classes.formControlLarge)) {
          return classes.inputGroupLarge;
        }
        return "";
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
        this.elements = {
          down: this.$(".bootstrap-touchspin-down", container),
          up: this.$(".bootstrap-touchspin-up", container),
          input: this.$("input", container),
          prefix: this.$(".bootstrap-touchspin-prefix", container).addClass(this.settings.prefix_extraclass),
          postfix: this.$(".bootstrap-touchspin-postfix", container).addClass(this.settings.postfix_extraclass)
        };
        return this.elements;
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
       * Update prefix/postfix content
       * @param {object} newsettings New settings object
       */
    }, {
      key: "updatePrefixPostfix",
      value: function updatePrefixPostfix(newsettings, detached) {
        if (newsettings.postfix) {
          var $postfix = this.originalinput.parent().find(".bootstrap-touchspin-postfix");
          if ($postfix.length === 0 && detached._detached_postfix) {
            detached._detached_postfix.insertAfter(this.originalinput);
          }
          this.originalinput.parent().find(".bootstrap-touchspin-postfix .input-group-text").text(newsettings.postfix);
        }
        if (newsettings.prefix) {
          var $prefix = this.originalinput.parent().find(".bootstrap-touchspin-prefix");
          if ($prefix.length === 0 && detached._detached_prefix) {
            detached._detached_prefix.insertBefore(this.originalinput);
          }
          this.originalinput.parent().find(".bootstrap-touchspin-prefix .input-group-text").text(newsettings.prefix);
        }
      }
      /**
       * Apply size classes to container based on input classes
       */
    }, {
      key: "applySizeClasses",
      value: function applySizeClasses() {
        var classes = this.getClasses();
        if (this.originalinput.hasClass(classes.inputSmall) || this.originalinput.hasClass(classes.formControlSmall)) {
          this.container.addClass(classes.inputGroupSmall);
        } else if (this.originalinput.hasClass(classes.inputLarge) || this.originalinput.hasClass(classes.formControlLarge)) {
          this.container.addClass(classes.inputGroupLarge);
        }
      }
    }]);
  }();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = BootstrapRenderer;
  } else if (typeof window !== "undefined") {
    window.BootstrapRenderer = BootstrapRenderer;
  }
  var Bootstrap3Renderer = /*#__PURE__*/function (_BootstrapRenderer) {
    function Bootstrap3Renderer() {
      _classCallCheck(this, Bootstrap3Renderer);
      return _callSuper(this, Bootstrap3Renderer, arguments);
    }
    _inherits(Bootstrap3Renderer, _BootstrapRenderer);
    return _createClass(Bootstrap3Renderer, [{
      key: "getVersion",
      value: function getVersion() {
        return 3;
      }
    }, {
      key: "getClasses",
      value: function getClasses() {
        return {
          // Input size classes
          inputSmall: "input-sm",
          inputLarge: "input-lg",
          formControlSmall: "form-control-sm",
          // Not used in BS3, but kept for compatibility
          formControlLarge: "form-control-lg",
          // Not used in BS3, but kept for compatibility
          // Input group size classes
          inputGroupSmall: "input-group-sm",
          inputGroupLarge: "input-group-lg",
          // Button wrapper classes
          inputGroupBtn: "input-group-btn",
          inputGroupAddon: "input-group-addon",
          // No prepend/append classes in BS3
          inputGroupPrepend: "",
          inputGroupAppend: "",
          inputGroupText: ""
          // No input-group-text in BS3
        };
      }
    }, {
      key: "buildVerticalButtons",
      value: function buildVerticalButtons() {
        return "\n        <span class=\"input-group-addon bootstrap-touchspin-vertical-button-wrapper\">\n          <span class=\"input-group-btn-vertical\">\n            <button tabindex=\"-1\" class=\"".concat(this.settings.buttondown_class, " bootstrap-touchspin-up ").concat(this.settings.verticalupclass, "\" type=\"button\">").concat(this.settings.verticalup, "</button>\n            <button tabindex=\"-1\" class=\"").concat(this.settings.buttonup_class, " bootstrap-touchspin-down ").concat(this.settings.verticaldownclass, "\" type=\"button\">").concat(this.settings.verticaldown, "</button>\n          </span>\n        </span>\n      ");
      }
    }, {
      key: "buildAdvancedInputGroup",
      value: function buildAdvancedInputGroup(parentelement) {
        parentelement.addClass("bootstrap-touchspin");
        var prev = this.originalinput.prev();
        var next = this.originalinput.next();
        var classes = this.getClasses();
        var prefixhtml = "\n        <span class=\"input-group-addon bootstrap-touchspin-prefix bootstrap-touchspin-injected\">\n          ".concat(this.settings.prefix, "\n        </span>\n      ");
        var postfixhtml = "\n        <span class=\"input-group-addon bootstrap-touchspin-postfix bootstrap-touchspin-injected\">\n          ".concat(this.settings.postfix, "\n        </span>\n      ");
        if (this.settings.verticalbuttons) {
          this.$(this.buildVerticalButtons()).insertAfter(this.originalinput);
        } else {
          if (prev.hasClass(classes.inputGroupBtn)) {
            var downhtml = "\n            <button tabindex=\"-1\" class=\"".concat(this.settings.buttondown_class, " bootstrap-touchspin-down bootstrap-touchspin-injected\" type=\"button\">").concat(this.settings.buttondown_txt, "</button>\n          ");
            prev.append(downhtml);
          } else {
            var _downhtml = "\n            <span class=\"input-group-btn bootstrap-touchspin-injected\">\n              <button tabindex=\"-1\" class=\"".concat(this.settings.buttondown_class, " bootstrap-touchspin-down\" type=\"button\">").concat(this.settings.buttondown_txt, "</button>\n            </span>\n          ");
            this.$(_downhtml).insertBefore(this.originalinput);
          }
          if (next.hasClass(classes.inputGroupBtn)) {
            var uphtml = "\n            <button tabindex=\"-1\" class=\"".concat(this.settings.buttonup_class, " bootstrap-touchspin-up bootstrap-touchspin-injected\" type=\"button\">").concat(this.settings.buttonup_txt, "</button>\n          ");
            next.prepend(uphtml);
          } else {
            var _uphtml = "\n            <span class=\"input-group-btn bootstrap-touchspin-injected\">\n              <button tabindex=\"-1\" class=\"".concat(this.settings.buttonup_class, " bootstrap-touchspin-up\" type=\"button\">").concat(this.settings.buttonup_txt, "</button>\n            </span>\n          ");
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
        var inputGroupSize = this.detectInputGroupSize();
        var html;
        if (this.settings.verticalbuttons) {
          html = "\n          <div class=\"input-group ".concat(inputGroupSize, " bootstrap-touchspin bootstrap-touchspin-injected\">\n            <span class=\"input-group-addon bootstrap-touchspin-prefix\">\n              ").concat(this.settings.prefix, "\n            </span>\n            <span class=\"input-group-addon bootstrap-touchspin-postfix\">\n              ").concat(this.settings.postfix, "\n            </span>\n            ").concat(this.buildVerticalButtons(), "\n          </div>\n        ");
        } else {
          html = "\n          <div class=\"input-group bootstrap-touchspin bootstrap-touchspin-injected\">\n            <span class=\"input-group-btn\">\n              <button tabindex=\"-1\" class=\"".concat(this.settings.buttondown_class, " bootstrap-touchspin-down\" type=\"button\">").concat(this.settings.buttondown_txt, "</button>\n            </span>\n            <span class=\"input-group-addon bootstrap-touchspin-prefix\">\n              ").concat(this.settings.prefix, "\n            </span>\n            <span class=\"input-group-addon bootstrap-touchspin-postfix\">\n              ").concat(this.settings.postfix, "\n            </span>\n            <span class=\"input-group-btn\">\n              <button tabindex=\"-1\" class=\"").concat(this.settings.buttonup_class, " bootstrap-touchspin-up\" type=\"button\">").concat(this.settings.buttonup_txt, "</button>\n            </span>\n          </div>\n        ");
        }
        this.container = this.$(html).insertBefore(this.originalinput);
        this.$(".bootstrap-touchspin-prefix", this.container).after(this.originalinput);
        this.applySizeClasses();
        return this.container;
      }
    }, {
      key: "updatePrefixPostfix",
      value: function updatePrefixPostfix(newsettings, detached) {
        if (newsettings.postfix) {
          var $postfix = this.originalinput.parent().find(".bootstrap-touchspin-postfix");
          if ($postfix.length === 0 && detached._detached_postfix) {
            detached._detached_postfix.insertAfter(this.originalinput);
          }
          this.originalinput.parent().find(".bootstrap-touchspin-postfix").text(newsettings.postfix);
        }
        if (newsettings.prefix) {
          var $prefix = this.originalinput.parent().find(".bootstrap-touchspin-prefix");
          if ($prefix.length === 0 && detached._detached_prefix) {
            detached._detached_prefix.insertBefore(this.originalinput);
          }
          this.originalinput.parent().find(".bootstrap-touchspin-prefix").text(newsettings.prefix);
        }
      }
    }]);
  }(BootstrapRenderer);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = Bootstrap3Renderer;
  } else if (typeof window !== "undefined") {
    window.Bootstrap3Renderer = Bootstrap3Renderer;
  }
  var Bootstrap4Renderer = /*#__PURE__*/function (_BootstrapRenderer2) {
    function Bootstrap4Renderer() {
      _classCallCheck(this, Bootstrap4Renderer);
      return _callSuper(this, Bootstrap4Renderer, arguments);
    }
    _inherits(Bootstrap4Renderer, _BootstrapRenderer2);
    return _createClass(Bootstrap4Renderer, [{
      key: "getVersion",
      value: function getVersion() {
        return 4;
      }
    }, {
      key: "getClasses",
      value: function getClasses() {
        return {
          // Input size classes
          inputSmall: "input-sm",
          // Legacy BS3 class, still supported
          inputLarge: "input-lg",
          // Legacy BS3 class, still supported
          formControlSmall: "form-control-sm",
          // BS4 class
          formControlLarge: "form-control-lg",
          // BS4 class
          // Input group size classes
          inputGroupSmall: "input-group-sm",
          inputGroupLarge: "input-group-lg",
          // Button wrapper classes - BS4 uses input-group-prepend/append
          inputGroupBtn: "input-group-btn",
          // Legacy, still works
          inputGroupPrepend: "input-group-prepend",
          inputGroupAppend: "input-group-append",
          // BS4 addon classes
          inputGroupAddon: "input-group-addon",
          // Deprecated in BS4, but still supported
          inputGroupText: "input-group-text"
          // New BS4 class
        };
      }
    }, {
      key: "buildVerticalButtons",
      value: function buildVerticalButtons() {
        return "\n        <span class=\"input-group-addon bootstrap-touchspin-vertical-button-wrapper\">\n          <span class=\"input-group-btn-vertical\">\n            <button tabindex=\"-1\" class=\"".concat(this.settings.buttondown_class, " bootstrap-touchspin-up ").concat(this.settings.verticalupclass, "\" type=\"button\">").concat(this.settings.verticalup, "</button>\n            <button tabindex=\"-1\" class=\"").concat(this.settings.buttonup_class, " bootstrap-touchspin-down ").concat(this.settings.verticaldownclass, "\" type=\"button\">").concat(this.settings.verticaldown, "</button>\n          </span>\n        </span>\n      ");
      }
    }, {
      key: "buildAdvancedInputGroup",
      value: function buildAdvancedInputGroup(parentelement) {
        parentelement.addClass("bootstrap-touchspin");
        var prev = this.originalinput.prev();
        var next = this.originalinput.next();
        var classes = this.getClasses();
        var prefixhtml = "\n        <div class=\"input-group-prepend bootstrap-touchspin-prefix bootstrap-touchspin-injected\">\n          <span class=\"input-group-text\">".concat(this.settings.prefix, "</span>\n        </div>\n      ");
        var postfixhtml = "\n        <div class=\"input-group-append bootstrap-touchspin-postfix bootstrap-touchspin-injected\">\n          <span class=\"input-group-text\">".concat(this.settings.postfix, "</span>\n        </div>\n      ");
        if (this.settings.verticalbuttons) {
          this.$(this.buildVerticalButtons()).insertAfter(this.originalinput);
        } else {
          if (prev.hasClass(classes.inputGroupBtn) || prev.hasClass(classes.inputGroupPrepend)) {
            var downhtml = "\n            <button tabindex=\"-1\" class=\"".concat(this.settings.buttondown_class, " bootstrap-touchspin-down bootstrap-touchspin-injected\" type=\"button\">").concat(this.settings.buttondown_txt, "</button>\n          ");
            prev.append(downhtml);
          } else {
            var _downhtml2 = "\n            <div class=\"input-group-prepend bootstrap-touchspin-injected\">\n              <button tabindex=\"-1\" class=\"".concat(this.settings.buttondown_class, " bootstrap-touchspin-down\" type=\"button\">").concat(this.settings.buttondown_txt, "</button>\n            </div>\n          ");
            this.$(_downhtml2).insertBefore(this.originalinput);
          }
          if (next.hasClass(classes.inputGroupBtn) || next.hasClass(classes.inputGroupAppend)) {
            var uphtml = "\n            <button tabindex=\"-1\" class=\"".concat(this.settings.buttonup_class, " bootstrap-touchspin-up bootstrap-touchspin-injected\" type=\"button\">").concat(this.settings.buttonup_txt, "</button>\n          ");
            next.prepend(uphtml);
          } else {
            var _uphtml2 = "\n            <div class=\"input-group-append bootstrap-touchspin-injected\">\n              <button tabindex=\"-1\" class=\"".concat(this.settings.buttonup_class, " bootstrap-touchspin-up\" type=\"button\">").concat(this.settings.buttonup_txt, "</button>\n            </div>\n          ");
            this.$(_uphtml2).insertAfter(this.originalinput);
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
        var inputGroupSize = this.detectInputGroupSize();
        var html;
        if (this.settings.verticalbuttons) {
          html = "\n          <div class=\"input-group ".concat(inputGroupSize, " bootstrap-touchspin bootstrap-touchspin-injected\">\n            <div class=\"input-group-prepend bootstrap-touchspin-prefix\">\n              <span class=\"input-group-text\">").concat(this.settings.prefix, "</span>\n            </div>\n            <div class=\"input-group-append bootstrap-touchspin-postfix\">\n              <span class=\"input-group-text\">").concat(this.settings.postfix, "</span>\n            </div>\n            ").concat(this.buildVerticalButtons(), "\n          </div>\n        ");
        } else {
          html = "\n          <div class=\"input-group bootstrap-touchspin bootstrap-touchspin-injected\">\n            <div class=\"input-group-prepend\">\n              <button tabindex=\"-1\" class=\"".concat(this.settings.buttondown_class, " bootstrap-touchspin-down\" type=\"button\">").concat(this.settings.buttondown_txt, "</button>\n            </div>\n            <div class=\"input-group-prepend bootstrap-touchspin-prefix\">\n              <span class=\"input-group-text\">").concat(this.settings.prefix, "</span>\n            </div>\n            <div class=\"input-group-append bootstrap-touchspin-postfix\">\n              <span class=\"input-group-text\">").concat(this.settings.postfix, "</span>\n            </div>\n            <div class=\"input-group-append\">\n              <button tabindex=\"-1\" class=\"").concat(this.settings.buttonup_class, " bootstrap-touchspin-up\" type=\"button\">").concat(this.settings.buttonup_txt, "</button>\n            </div>\n          </div>\n        ");
        }
        this.container = this.$(html).insertBefore(this.originalinput);
        this.$(".bootstrap-touchspin-prefix", this.container).after(this.originalinput);
        this.applySizeClasses();
        return this.container;
      }
    }, {
      key: "updatePrefixPostfix",
      value: function updatePrefixPostfix(newsettings, detached) {
        if (newsettings.postfix) {
          var $postfix = this.originalinput.parent().find(".bootstrap-touchspin-postfix");
          if ($postfix.length === 0 && detached._detached_postfix) {
            detached._detached_postfix.insertAfter(this.originalinput);
          }
          this.originalinput.parent().find(".bootstrap-touchspin-postfix .input-group-text").text(newsettings.postfix);
        }
        if (newsettings.prefix) {
          var $prefix = this.originalinput.parent().find(".bootstrap-touchspin-prefix");
          if ($prefix.length === 0 && detached._detached_prefix) {
            detached._detached_prefix.insertBefore(this.originalinput);
          }
          this.originalinput.parent().find(".bootstrap-touchspin-prefix .input-group-text").text(newsettings.prefix);
        }
      }
    }]);
  }(BootstrapRenderer);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = Bootstrap4Renderer;
  } else if (typeof window !== "undefined") {
    window.Bootstrap4Renderer = Bootstrap4Renderer;
  }
  var Bootstrap5Renderer = /*#__PURE__*/function (_Bootstrap4Renderer) {
    function Bootstrap5Renderer() {
      _classCallCheck(this, Bootstrap5Renderer);
      return _callSuper(this, Bootstrap5Renderer, arguments);
    }
    _inherits(Bootstrap5Renderer, _Bootstrap4Renderer);
    return _createClass(Bootstrap5Renderer, [{
      key: "getVersion",
      value: function getVersion() {
        return 5;
      }
    }, {
      key: "getClasses",
      value: function getClasses() {
        return {
          // Input size classes - BS5 removed .input-sm/.input-lg legacy classes
          inputSmall: "form-control-sm",
          // Only BS4+ form-control-* classes
          inputLarge: "form-control-lg",
          formControlSmall: "form-control-sm",
          formControlLarge: "form-control-lg",
          // Input group size classes
          inputGroupSmall: "input-group-sm",
          inputGroupLarge: "input-group-lg",
          // Button wrapper classes - same as BS4
          inputGroupBtn: "input-group-btn",
          // Removed in BS5, but kept for backward compatibility
          inputGroupPrepend: "input-group-prepend",
          // Removed in BS5
          inputGroupAppend: "input-group-append",
          // Removed in BS5
          // BS5 simplified structure - no prepend/append wrappers needed
          inputGroupAddon: "input-group-addon",
          // Not used in BS5
          inputGroupText: "input-group-text"
          // Still used in BS5
        };
      }
    }, {
      key: "buildAdvancedInputGroup",
      value: function buildAdvancedInputGroup(parentelement) {
        parentelement.addClass("bootstrap-touchspin");
        var prev = this.originalinput.prev();
        var next = this.originalinput.next();
        var prefixhtml = "\n        <span class=\"input-group-text bootstrap-touchspin-prefix bootstrap-touchspin-injected\">".concat(this.settings.prefix, "</span>\n      ");
        var postfixhtml = "\n        <span class=\"input-group-text bootstrap-touchspin-postfix bootstrap-touchspin-injected\">".concat(this.settings.postfix, "</span>\n      ");
        if (this.settings.verticalbuttons) {
          var verticalHtml = "\n          <span class=\"bootstrap-touchspin-vertical-button-wrapper\">\n            <span class=\"input-group-btn-vertical\">\n              <button tabindex=\"-1\" class=\"".concat(this.settings.buttondown_class, " bootstrap-touchspin-up ").concat(this.settings.verticalupclass, "\" type=\"button\">").concat(this.settings.verticalup, "</button>\n              <button tabindex=\"-1\" class=\"").concat(this.settings.buttonup_class, " bootstrap-touchspin-down ").concat(this.settings.verticaldownclass, "\" type=\"button\">").concat(this.settings.verticaldown, "</button>\n            </span>\n          </span>\n        ");
          this.$(verticalHtml).insertAfter(this.originalinput);
        } else {
          var downhtml = "\n          <button tabindex=\"-1\" class=\"".concat(this.settings.buttondown_class, " bootstrap-touchspin-down bootstrap-touchspin-injected\" type=\"button\">").concat(this.settings.buttondown_txt, "</button>\n        ");
          var uphtml = "\n          <button tabindex=\"-1\" class=\"".concat(this.settings.buttonup_class, " bootstrap-touchspin-up bootstrap-touchspin-injected\" type=\"button\">").concat(this.settings.buttonup_txt, "</button>\n        ");
          this.$(downhtml).insertBefore(this.originalinput);
          this.$(uphtml).insertAfter(this.originalinput);
        }
        this.$(prefixhtml).insertBefore(this.originalinput);
        this.$(postfixhtml).insertAfter(this.originalinput);
        this.container = parentelement;
        return parentelement;
      }
    }, {
      key: "buildInputGroup",
      value: function buildInputGroup() {
        var inputGroupSize = this.detectInputGroupSize();
        var html;
        if (this.settings.verticalbuttons) {
          html = "\n          <div class=\"input-group ".concat(inputGroupSize, " bootstrap-touchspin bootstrap-touchspin-injected\">\n            <span class=\"input-group-text bootstrap-touchspin-prefix\">").concat(this.settings.prefix, "</span>\n            <span class=\"input-group-text bootstrap-touchspin-postfix\">").concat(this.settings.postfix, "</span>\n            <span class=\"bootstrap-touchspin-vertical-button-wrapper\">\n              <span class=\"input-group-btn-vertical\">\n                <button tabindex=\"-1\" class=\"").concat(this.settings.buttondown_class, " bootstrap-touchspin-up ").concat(this.settings.verticalupclass, "\" type=\"button\">").concat(this.settings.verticalup, "</button>\n                <button tabindex=\"-1\" class=\"").concat(this.settings.buttonup_class, " bootstrap-touchspin-down ").concat(this.settings.verticaldownclass, "\" type=\"button\">").concat(this.settings.verticaldown, "</button>\n              </span>\n            </span>\n          </div>\n        ");
        } else {
          html = "\n          <div class=\"input-group bootstrap-touchspin bootstrap-touchspin-injected\">\n            <button tabindex=\"-1\" class=\"".concat(this.settings.buttondown_class, " bootstrap-touchspin-down\" type=\"button\">").concat(this.settings.buttondown_txt, "</button>\n            <span class=\"input-group-text bootstrap-touchspin-prefix\">").concat(this.settings.prefix, "</span>\n            <span class=\"input-group-text bootstrap-touchspin-postfix\">").concat(this.settings.postfix, "</span>\n            <button tabindex=\"-1\" class=\"").concat(this.settings.buttonup_class, " bootstrap-touchspin-up\" type=\"button\">").concat(this.settings.buttonup_txt, "</button>\n          </div>\n        ");
        }
        this.container = this.$(html).insertBefore(this.originalinput);
        this.$(".bootstrap-touchspin-prefix", this.container).after(this.originalinput);
        this.applySizeClasses();
        return this.container;
      }
    }, {
      key: "updatePrefixPostfix",
      value: function updatePrefixPostfix(newsettings, detached) {
        if (newsettings.postfix) {
          var $postfix = this.originalinput.parent().find(".bootstrap-touchspin-postfix");
          if ($postfix.length === 0 && detached._detached_postfix) {
            detached._detached_postfix.insertAfter(this.originalinput);
          }
          this.originalinput.parent().find(".bootstrap-touchspin-postfix").text(newsettings.postfix);
        }
        if (newsettings.prefix) {
          var $prefix = this.originalinput.parent().find(".bootstrap-touchspin-prefix");
          if ($prefix.length === 0 && detached._detached_prefix) {
            detached._detached_prefix.insertBefore(this.originalinput);
          }
          this.originalinput.parent().find(".bootstrap-touchspin-prefix").text(newsettings.prefix);
        }
      }
    }]);
  }(Bootstrap4Renderer);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = Bootstrap5Renderer;
  } else if (typeof window !== "undefined") {
    window.Bootstrap5Renderer = Bootstrap5Renderer;
  }
  var RendererFactory = /*#__PURE__*/function () {
    function RendererFactory() {
      _classCallCheck(this, RendererFactory);
    }
    return _createClass(RendererFactory, null, [{
      key: "detectBootstrapVersion",
      value:
      /**
       * Detect Bootstrap version from the DOM/CSS
       * @returns {number} Detected Bootstrap version (3, 4, 5) or null if not detected
       */
      function detectBootstrapVersion() {
        if (window.getComputedStyle && document.documentElement) {
          var styles2 = window.getComputedStyle(document.documentElement);
          if (styles2.getPropertyValue("--bs-blue") || styles2.getPropertyValue("--bs-primary")) {
            return 5;
          }
        }
        try {
          var sheets = document.styleSheets;
          for (var i = 0; i < sheets.length; i++) {
            try {
              var sheet = sheets[i];
              if (sheet.href && (sheet.href.includes("bootstrap") || sheet.href.includes("bs"))) {
                if (sheet.href.includes("bootstrap/5") || sheet.href.includes("bootstrap@5")) {
                  return 5;
                }
                if (sheet.href.includes("bootstrap/4") || sheet.href.includes("bootstrap@4")) {
                  return 4;
                }
                if (sheet.href.includes("bootstrap/3") || sheet.href.includes("bootstrap@3")) {
                  return 3;
                }
              }
            } catch (e) {
              continue;
            }
          }
        } catch (e) {}
        if (typeof window.bootstrap !== "undefined") {
          return 5;
        }
        if (typeof $ !== "undefined" && $.fn && $.fn.modal) {
          if (typeof $.fn.modal.Constructor !== "undefined") {
            var modalProto = $.fn.modal.Constructor.prototype;
            if (typeof modalProto._adjustDialog === "function") {
              return 4;
            }
          }
          return 3;
        }
        var testDiv = document.createElement("div");
        testDiv.className = "input-group-prepend d-none";
        document.body.appendChild(testDiv);
        var styles = window.getComputedStyle(testDiv);
        var hasFlexDisplay = styles.display === "flex" || styles.display === "none";
        document.body.removeChild(testDiv);
        if (hasFlexDisplay) {
          var testDiv2 = document.createElement("div");
          testDiv2.className = "form-select d-none";
          document.body.appendChild(testDiv2);
          var hasFormSelect = window.getComputedStyle(testDiv2).display === "none";
          document.body.removeChild(testDiv2);
          return hasFormSelect ? 5 : 4;
        }
        return 4;
      }
      /**
       * Create appropriate renderer based on Bootstrap version
       * @param {jQuery} $ jQuery instance
       * @param {object} settings Plugin settings
       * @param {jQuery} originalinput Original input element
       * @param {number|string} version Optional explicit version, or 'auto' to detect
       * @returns {BootstrapRenderer} Appropriate renderer instance
       */
    }, {
      key: "createRenderer",
      value: function createRenderer($2, settings, originalinput) {
        var version = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "auto";
        var bootstrapVersion = version;
        if (version === "auto" || version === null || version === void 0) {
          bootstrapVersion = this.detectBootstrapVersion();
        }
        if (typeof bootstrapVersion === "string") {
          bootstrapVersion = parseInt(bootstrapVersion, 10);
        }
        var RendererClass;
        switch (bootstrapVersion) {
          case 3:
            RendererClass = typeof Bootstrap3Renderer !== "undefined" ? Bootstrap3Renderer : typeof require !== "undefined" ? require("./Bootstrap3Renderer") : null;
            break;
          case 5:
            RendererClass = typeof Bootstrap5Renderer !== "undefined" ? Bootstrap5Renderer : typeof require !== "undefined" ? require("./Bootstrap5Renderer") : null;
            break;
          case 4:
          default:
            RendererClass = typeof Bootstrap4Renderer !== "undefined" ? Bootstrap4Renderer : typeof require !== "undefined" ? require("./Bootstrap4Renderer") : null;
            break;
        }
        if (!RendererClass) {
          throw new Error("Bootstrap ".concat(bootstrapVersion, " renderer not available. Make sure the renderer files are loaded."));
        }
        return new RendererClass($2, settings, originalinput);
      }
      /**
       * Get all available renderer versions
       * @returns {Array<number>} Array of supported Bootstrap versions
       */
    }, {
      key: "getAvailableVersions",
      value: function getAvailableVersions() {
        var versions = [];
        if (typeof Bootstrap3Renderer !== "undefined" || typeof require !== "undefined" && require.resolve && require.resolve("./Bootstrap3Renderer")) {
          versions.push(3);
        }
        if (typeof Bootstrap4Renderer !== "undefined" || typeof require !== "undefined" && require.resolve && require.resolve("./Bootstrap4Renderer")) {
          versions.push(4);
        }
        if (typeof Bootstrap5Renderer !== "undefined" || typeof require !== "undefined" && require.resolve && require.resolve("./Bootstrap5Renderer")) {
          versions.push(5);
        }
        return versions;
      }
    }]);
  }();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = RendererFactory;
  } else if (typeof window !== "undefined") {
    window.RendererFactory = RendererFactory;
  }
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
  })(function ($2) {
    var _currentSpinnerId = 0;
    $2.fn.TouchSpin = function (options) {
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
        verticalupclass: "",
        verticaldownclass: "",
        prefix: "",
        postfix: "",
        prefix_extraclass: "",
        postfix_extraclass: "",
        booster: true,
        boostat: 10,
        maxboostedstep: false,
        mousewheel: true,
        buttondown_class: "btn btn-primary",
        buttonup_class: "btn btn-primary",
        buttondown_txt: "&minus;",
        buttonup_txt: "&plus;",
        // New renderer system options
        bootstrap_version: "auto",
        // 'auto', 3, 4, 5, or explicit version
        renderer: null,
        // Custom renderer instance
        callback_before_calculation: function callback_before_calculation(value) {
          return value;
        },
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
          originalinput = $2(this),
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
          spinning = false;
        init();
        function init() {
          if (originalinput.data("alreadyinitialized")) {
            return;
          }
          originalinput.data("alreadyinitialized", true);
          _currentSpinnerId += 1;
          originalinput.data("spinnerid", _currentSpinnerId);
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
          _updateButtonDisabledState();
          _hideEmptyPrefixPostfix();
          _setupMutationObservers();
          _bindEvents();
          _bindEventsInterface();
        }
        function _setInitval() {
          if (settings.initval !== "" && originalinput.val() === "") {
            originalinput.val(settings.initval);
          }
        }
        function changeSettings(newsettings) {
          _updateSettings(newsettings);
          _checkValue();
          var value2 = elements.input.val();
          if (value2 !== "") {
            value2 = parseFloat(settings.callback_before_calculation(elements.input.val()));
            elements.input.val(settings.callback_after_calculation(parseFloat(value2).toFixed(settings.decimals)));
          }
        }
        function _initSettings() {
          settings = $2.extend({}, defaults, originalinput_data, _parseAttributes(), options);
          if (parseFloat(settings.step) !== 1) {
            var remainder;
            remainder = settings.max % settings.step;
            if (remainder !== 0) {
              settings.max = parseFloat(settings.max) - remainder;
            }
            remainder = settings.min % settings.step;
            if (remainder !== 0) {
              settings.min = parseFloat(settings.min) + (parseFloat(settings.step) - remainder);
            }
          }
        }
        function _parseAttributes() {
          var data = {};
          $2.each(attributeMap, function (key, value2) {
            var attrName = "bts-" + value2;
            if (originalinput.is("[data-" + attrName + "]")) {
              data[key] = originalinput.data(attrName);
            }
          });
          $2.each(["min", "max", "step"], function (i, key) {
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
          try {
            if (settings.renderer) {
              renderer = settings.renderer;
            } else if (typeof RendererFactory !== "undefined" && RendererFactory.createRenderer) {
              renderer = RendererFactory.createRenderer($2, settings, originalinput, settings.bootstrap_version);
            } else {
              renderer = null;
              console.warn("Bootstrap TouchSpin: No renderer system available, falling back to legacy rendering");
            }
          } catch (error) {
            console.warn("Bootstrap TouchSpin: Failed to initialize renderer, falling back to legacy rendering", error);
            renderer = null;
          }
        }
        function _destroy() {
          var $parent = originalinput.parent();
          stopSpin();
          originalinput.off(".touchspin");
          if ($parent.hasClass("bootstrap-touchspin-injected")) {
            originalinput.siblings().remove();
            originalinput.unwrap();
          } else {
            $2(".bootstrap-touchspin-injected", $parent).remove();
            $parent.removeClass("bootstrap-touchspin");
          }
          originalinput.data("alreadyinitialized", false);
        }
        function _updateSettings(newsettings) {
          settings = $2.extend({}, settings, newsettings);
          if (renderer && (newsettings.postfix || newsettings.prefix)) {
            renderer.updatePrefixPostfix(newsettings, {
              _detached_prefix: _detached_prefix,
              _detached_postfix: _detached_postfix
            });
          } else if (newsettings.postfix || newsettings.prefix) {
            if (newsettings.postfix) {
              var $postfix = originalinput.parent().find(".bootstrap-touchspin-postfix");
              if ($postfix.length === 0) {
                _detached_postfix.insertAfter(originalinput);
              }
              originalinput.parent().find(".bootstrap-touchspin-postfix .input-group-text").text(newsettings.postfix);
            }
            if (newsettings.prefix) {
              var $prefix = originalinput.parent().find(".bootstrap-touchspin-prefix");
              if ($prefix.length === 0) {
                _detached_prefix.insertBefore(originalinput);
              }
              originalinput.parent().find(".bootstrap-touchspin-prefix .input-group-text").text(newsettings.prefix);
            }
          }
          _hideEmptyPrefixPostfix();
        }
        function _buildHtml() {
          var initval = originalinput.val(),
            parentelement = originalinput.parent();
          if (initval !== "") {
            initval = settings.callback_before_calculation(initval);
            initval = settings.callback_after_calculation(parseFloat(initval).toFixed(settings.decimals));
          }
          originalinput.data("initvalue", initval).val(initval);
          originalinput.addClass("form-control");
          if (renderer) {
            try {
              if (parentelement.hasClass("input-group")) {
                container = renderer.buildAdvancedInputGroup(parentelement);
              } else {
                container = renderer.buildInputGroup();
              }
            } catch (error) {
              console.warn("Bootstrap TouchSpin: Renderer failed, falling back to legacy rendering", error);
              renderer = null;
              _buildHtmlLegacy();
            }
          } else {
            _buildHtmlLegacy();
          }
        }
        function _buildHtmlLegacy() {
          var parentelement = originalinput.parent();
          var verticalbuttons_html = "\n          <span class=\"input-group-addon bootstrap-touchspin-vertical-button-wrapper\">\n            <span class=\"input-group-btn-vertical\">\n              <button tabindex=\"-1\" class=\"".concat(settings.buttondown_class, " bootstrap-touchspin-up ").concat(settings.verticalupclass, "\" type=\"button\">").concat(settings.verticalup, "</button>\n              <button tabindex=\"-1\" class=\"").concat(settings.buttonup_class, " bootstrap-touchspin-down ").concat(settings.verticaldownclass, "\" type=\"button\">").concat(settings.verticaldown, "</button>\n            </span>\n          </span>\n       ");
          if (parentelement.hasClass("input-group")) {
            _advanceInputGroupLegacy(parentelement, verticalbuttons_html);
          } else {
            _buildInputGroupLegacy(verticalbuttons_html);
          }
        }
        function _advanceInputGroupLegacy(parentelement, verticalbuttons_html) {
          parentelement.addClass("bootstrap-touchspin");
          var prev = originalinput.prev(),
            next = originalinput.next();
          var downhtml,
            uphtml,
            prefixhtml = "\n            <span class=\"input-group-addon input-group-prepend bootstrap-touchspin-prefix input-group-prepend bootstrap-touchspin-injected\">\n              <span class=\"input-group-text\">".concat(settings.prefix, "</span>\n            </span>\n          "),
            postfixhtml = "\n            <span class=\"input-group-addon input-group-append bootstrap-touchspin-postfix input-group-append bootstrap-touchspin-injected\">\n              <span class=\"input-group-text\">".concat(settings.postfix, "</span>\n            </span>\n          ");
          if (settings.verticalbuttons) {
            $2(verticalbuttons_html).insertAfter(originalinput);
          } else {
            if (prev.hasClass("input-group-btn") || prev.hasClass("input-group-prepend")) {
              downhtml = "\n              <button tabindex=\"-1\" class=\"".concat(settings.buttondown_class, " bootstrap-touchspin-down bootstrap-touchspin-injected\" type=\"button\">").concat(settings.buttondown_txt, "</button>\n            ");
              prev.append(downhtml);
            } else {
              downhtml = "\n              <span class=\"input-group-btn input-group-prepend bootstrap-touchspin-injected\">\n                <button tabindex=\"-1\" class=\"".concat(settings.buttondown_class, " bootstrap-touchspin-down\" type=\"button\">").concat(settings.buttondown_txt, "</button>\n              </span>\n            ");
              $2(downhtml).insertBefore(originalinput);
            }
            if (next.hasClass("input-group-btn") || next.hasClass("input-group-append")) {
              uphtml = "\n            <button tabindex=\"-1\" class=\"".concat(settings.buttonup_class, " bootstrap-touchspin-up bootstrap-touchspin-injected\" type=\"button\">").concat(settings.buttonup_txt, "</button>\n          ");
              next.prepend(uphtml);
            } else {
              uphtml = "\n            <span class=\"input-group-btn input-group-append bootstrap-touchspin-injected\">\n              <button tabindex=\"-1\" class=\"".concat(settings.buttonup_class, " bootstrap-touchspin-up\" type=\"button\">").concat(settings.buttonup_txt, "</button>\n            </span>\n          ");
              $2(uphtml).insertAfter(originalinput);
            }
          }
          $2(prefixhtml).insertBefore(originalinput);
          $2(postfixhtml).insertAfter(originalinput);
          container = parentelement;
        }
        function _buildInputGroupLegacy(verticalbuttons_html) {
          var html;
          var inputGroupSize = "";
          if (originalinput.hasClass("input-sm") || originalinput.hasClass("form-control-sm")) {
            inputGroupSize = "input-group-sm";
          } else if (originalinput.hasClass("input-lg") || originalinput.hasClass("form-control-lg")) {
            inputGroupSize = "input-group-lg";
          }
          if (settings.verticalbuttons) {
            html = "\n            <div class=\"input-group ".concat(inputGroupSize, " bootstrap-touchspin bootstrap-touchspin-injected\">\n              <span class=\"input-group-addon input-group-prepend bootstrap-touchspin-prefix\">\n                <span class=\"input-group-text\">").concat(settings.prefix, "</span>\n              </span>\n              <span class=\"input-group-addon bootstrap-touchspin-postfix input-group-append\">\n                <span class=\"input-group-text\">").concat(settings.postfix, "</span>\n              </span>\n              ").concat(verticalbuttons_html, "\n            </div>\n          ");
          } else {
            html = "\n            <div class=\"input-group bootstrap-touchspin bootstrap-touchspin-injected\">\n              <span class=\"input-group-btn input-group-prepend\">\n                <button tabindex=\"-1\" class=\"".concat(settings.buttondown_class, " bootstrap-touchspin-down\" type=\"button\">").concat(settings.buttondown_txt, "</button>\n              </span>\n              <span class=\"input-group-addon bootstrap-touchspin-prefix input-group-prepend\">\n                <span class=\"input-group-text\">").concat(settings.prefix, "</span>\n              </span>\n              <span class=\"input-group-addon bootstrap-touchspin-postfix input-group-append\">\n                <span class=\"input-group-text\">").concat(settings.postfix, "</span>\n              </span>\n              <span class=\"input-group-btn input-group-append\">\n                <button tabindex=\"-1\" class=\"").concat(settings.buttonup_class, " bootstrap-touchspin-up\" type=\"button\">").concat(settings.buttonup_txt, "</button>\n              </span>\n            </div>");
          }
          container = $2(html).insertBefore(originalinput);
          $2(".bootstrap-touchspin-prefix", container).after(originalinput);
          if (originalinput.hasClass("input-sm") || originalinput.hasClass("form-control-sm")) {
            container.addClass("input-group-sm");
          } else if (originalinput.hasClass("input-lg") || originalinput.hasClass("form-control-lg")) {
            container.addClass("input-group-lg");
          }
        }
        function _initElements() {
          if (renderer) {
            elements = renderer.initElements(container);
          } else {
            elements = {
              down: $2(".bootstrap-touchspin-down", container),
              up: $2(".bootstrap-touchspin-up", container),
              input: $2("input", container),
              prefix: $2(".bootstrap-touchspin-prefix", container).addClass(settings.prefix_extraclass),
              postfix: $2(".bootstrap-touchspin-postfix", container).addClass(settings.postfix_extraclass)
            };
          }
        }
        function _hideEmptyPrefixPostfix() {
          if (renderer) {
            var detached = renderer.hideEmptyPrefixPostfix();
            _detached_prefix = detached._detached_prefix;
            _detached_postfix = detached._detached_postfix;
          } else {
            if (settings.prefix === "") {
              _detached_prefix = elements.prefix.detach();
            }
            if (settings.postfix === "") {
              _detached_postfix = elements.postfix.detach();
            }
          }
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
            } else if (code === 9 || code === 13) {
              _checkValue();
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
          $2(document).on("mousedown touchstart", function (event) {
            if ($2(event.target).is(originalinput)) {
              return;
            }
            _checkValue();
          });
          originalinput.on("blur.touchspin", function () {
            _checkValue();
          });
          elements.down.on("keydown", function (ev) {
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
          originalinput.on("mousewheel.touchspin DOMMouseScroll.touchspin", function (ev) {
            if (!settings.mousewheel || !originalinput.is(":focus")) {
              return;
            }
            var delta = ev.originalEvent.wheelDelta || -ev.originalEvent.deltaY || -ev.originalEvent.detail;
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
            var observer = new MutationObserver(function (mutations) {
              mutations.forEach(function (mutation) {
                if (mutation.type === "attributes" && (mutation.attributeName === "disabled" || mutation.attributeName === "readonly")) {
                  _updateButtonDisabledState();
                }
              });
            });
            observer.observe(originalinput[0], {
              attributes: true
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
        function _checkValue() {
          var val, parsedval, returnval;
          val = settings.callback_before_calculation(originalinput.val());
          if (val === "") {
            if (settings.replacementval !== "") {
              originalinput.val(settings.replacementval);
              originalinput.trigger("change");
            }
            return;
          }
          if (settings.decimals > 0 && val === ".") {
            return;
          }
          parsedval = parseFloat(val);
          if (isNaN(parsedval)) {
            if (settings.replacementval !== "") {
              parsedval = settings.replacementval;
            } else {
              parsedval = 0;
            }
          }
          returnval = parsedval;
          if (parsedval.toString() !== val) {
            returnval = parsedval;
          }
          returnval = _forcestepdivisibility(parsedval);
          if (settings.min !== null && parsedval < settings.min) {
            returnval = settings.min;
          }
          if (settings.max !== null && parsedval > settings.max) {
            returnval = settings.max;
          }
          if (parseFloat(parsedval).toString() !== parseFloat(returnval).toString()) {
            originalinput.val(returnval);
          }
          originalinput.val(settings.callback_after_calculation(parseFloat(returnval).toFixed(settings.decimals)));
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
            return (settings.min + settings.max) / 2;
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
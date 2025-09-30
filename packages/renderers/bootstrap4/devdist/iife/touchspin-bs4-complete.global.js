"use strict";
var TouchSpinBS4Complete = (() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // ../../core/dist/index.js
  var DEFAULTS = {
    min: 0,
    max: 100,
    initval: "",
    replacementval: "",
    firstclickvalueifempty: null,
    step: 1,
    decimals: 0,
    forcestepdivisibility: "round",
    stepinterval: 100,
    stepintervaldelay: 500,
    verticalbuttons: false,
    verticalup: "+",
    verticaldown: "\u2212",
    verticalupclass: null,
    verticaldownclass: null,
    focusablebuttons: false,
    prefix: "",
    postfix: "",
    prefix_extraclass: "",
    postfix_extraclass: "",
    booster: true,
    boostat: 10,
    maxboostedstep: false,
    mousewheel: true,
    buttonup_class: null,
    buttondown_class: null,
    buttonup_txt: "+",
    buttondown_txt: "&minus;",
    callback_before_calculation: (v) => v,
    callback_after_calculation: (v) => v,
    renderer: null
  };
  var INSTANCE_KEY = "_touchSpinCore";
  var TouchSpinCore = class _TouchSpinCore {
    /**
     * @param inputEl The input element
     * @param opts Partial settings
     */
    constructor(inputEl, opts = {}) {
      this._teardownCallbacks = [];
      this._settingObservers = /* @__PURE__ */ new Map();
      this._spinDelayTimeout = null;
      this._spinIntervalTimer = null;
      this._upButton = null;
      this._originalAttributes = null;
      this._downButton = null;
      this._wrapper = null;
      this._mutationObserver = null;
      if (!inputEl || inputEl.nodeName !== "INPUT") {
        throw new Error("TouchSpinCore requires an <input> element");
      }
      this.input = inputEl;
      const dataAttrs = this._parseDataAttributes(inputEl);
      const globalDefaults = typeof globalThis !== "undefined" && globalThis.TouchSpinDefaultOptions ? _TouchSpinCore.sanitizePartialSettings(
        globalThis.TouchSpinDefaultOptions,
        DEFAULTS
      ) : {};
      this.settings = Object.assign({}, DEFAULTS, globalDefaults, dataAttrs, opts);
      this._sanitizeSettings();
      if (!this.settings.renderer) {
        const g = globalThis;
        if (typeof g !== "undefined" && g.TouchSpinDefaultRenderer) {
          this.settings.renderer = g.TouchSpinDefaultRenderer;
        } else {
          console.warn("TouchSpin: No renderer specified (renderer: null). Only keyboard/wheel events will work. Consider using Bootstrap3/4/5Renderer or TailwindRenderer for UI.");
        }
      }
      this.spinning = false;
      this.spincount = 0;
      this.direction = false;
      this._teardownCallbacks = [];
      this._settingObservers = /* @__PURE__ */ new Map();
      this._spinDelayTimeout = null;
      this._spinIntervalTimer = null;
      this._upButton = null;
      this._downButton = null;
      this._wrapper = null;
      this._handleUpMouseDown = this._handleUpMouseDown.bind(this);
      this._handleDownMouseDown = this._handleDownMouseDown.bind(this);
      this._handleMouseUp = this._handleMouseUp.bind(this);
      this._handleUpKeyDown = this._handleUpKeyDown.bind(this);
      this._handleUpKeyUp = this._handleUpKeyUp.bind(this);
      this._handleDownKeyDown = this._handleDownKeyDown.bind(this);
      this._handleDownKeyUp = this._handleDownKeyUp.bind(this);
      this._handleWindowChangeCapture = this._handleWindowChangeCapture.bind(this);
      this._handleKeyDown = this._handleKeyDown.bind(this);
      this._handleKeyUp = this._handleKeyUp.bind(this);
      this._handleWheel = this._handleWheel.bind(this);
      this._initializeInput();
      if (this.settings.renderer) {
        const Ctor = this.settings.renderer;
        this.renderer = new Ctor(inputEl, this.settings, this);
        this.renderer.init();
      }
      this._setupMutationObserver();
      if (this.renderer) {
        this.renderer.finalizeWrapperAttributes();
      }
      this.input.setAttribute("data-touchspin-injected", "input");
    }
    /**
     * Sanitize a partial settings object BEFORE applying it.
     * Returns a new object with only provided keys normalized.
     * @param {Partial<TouchSpinCoreOptions>} partial
     * @param {TouchSpinCoreOptions} current
     * @returns {Partial<TouchSpinCoreOptions>}
     */
    static sanitizePartialSettings(partial, current) {
      const out = { ...partial };
      if (Object.prototype.hasOwnProperty.call(partial, "step")) {
        const n = Number(partial.step);
        out.step = isFinite(n) && n > 0 ? n : 1;
      }
      if (Object.prototype.hasOwnProperty.call(partial, "decimals")) {
        const n = Number(partial.decimals);
        out.decimals = isFinite(n) && n >= 0 ? Math.floor(n) : 0;
      }
      const hasMin = Object.prototype.hasOwnProperty.call(partial, "min");
      const hasMax = Object.prototype.hasOwnProperty.call(partial, "max");
      if (hasMin) {
        if (partial.min === null || partial.min === void 0 || typeof partial.min === "string" && partial.min === "") {
          out.min = null;
        } else {
          const n = Number(partial.min);
          out.min = isFinite(n) ? n : null;
        }
      }
      if (hasMax) {
        if (partial.max === null || partial.max === void 0 || typeof partial.max === "string" && partial.max === "") {
          out.max = null;
        } else {
          const n = Number(partial.max);
          out.max = isFinite(n) ? n : null;
        }
      }
      if (hasMin && hasMax && out.min != null && out.max != null && typeof out.min === "number" && typeof out.max === "number" && out.min > out.max) {
        const tmp = out.min;
        out.min = out.max;
        out.max = tmp;
      }
      if (Object.prototype.hasOwnProperty.call(partial, "stepinterval")) {
        const n = Number(partial.stepinterval);
        out.stepinterval = isFinite(n) && n >= 0 ? n : DEFAULTS.stepinterval;
      }
      if (Object.prototype.hasOwnProperty.call(partial, "stepintervaldelay")) {
        const n = Number(partial.stepintervaldelay);
        out.stepintervaldelay = isFinite(n) && n >= 0 ? n : DEFAULTS.stepintervaldelay;
      }
      return out;
    }
    /**
     * Initialize input element (core always handles this)
     * @private
     */
    _initializeInput() {
      this._captureOriginalAttributes();
      const initVal = this.settings.initval ?? "";
      if (initVal !== "" && this.input.value === "") {
        this.input.value = String(initVal);
      }
      this._updateAriaAttributes();
      this._syncNativeAttributes();
      this._checkValue(false);
    }
    /**
     * Normalize and validate settings: coerce invalid values to safe defaults.
     * - step: > 0 number, otherwise 1
     * - decimals: integer >= 0, otherwise 0
     * - min/max: finite numbers or null
     * - stepinterval/stepintervaldelay: integers >= 0 (fallback to defaults if invalid)
     * @private
     */
    _sanitizeSettings() {
      const stepNum = Number(this.settings.step);
      if (!isFinite(stepNum) || stepNum <= 0) {
        this.settings.step = 1;
      } else {
        this.settings.step = stepNum;
      }
      const decNum = Number(this.settings.decimals);
      if (!isFinite(decNum) || decNum < 0) {
        this.settings.decimals = 0;
      } else {
        this.settings.decimals = Math.floor(decNum);
      }
      if (this.settings.min === null || this.settings.min === void 0 || typeof this.settings.min === "string" && this.settings.min === "") {
        this.settings.min = null;
      } else {
        const minNum = Number(this.settings.min);
        this.settings.min = isFinite(minNum) ? minNum : null;
      }
      if (this.settings.max === null || this.settings.max === void 0 || typeof this.settings.max === "string" && this.settings.max === "") {
        this.settings.max = null;
      } else {
        const maxNum = Number(this.settings.max);
        this.settings.max = isFinite(maxNum) ? maxNum : null;
      }
      if (this.settings.min !== null && this.settings.max !== null && this.settings.min > this.settings.max) {
        const tmp = this.settings.min;
        this.settings.min = this.settings.max;
        this.settings.max = tmp;
      }
      const si = Number(this.settings.stepinterval);
      if (!isFinite(si) || si < 0) this.settings.stepinterval = DEFAULTS.stepinterval;
      const sid = Number(this.settings.stepintervaldelay);
      if (!isFinite(sid) || sid < 0) this.settings.stepintervaldelay = DEFAULTS.stepintervaldelay;
      this._validateCallbacks();
      this._checkCallbackPairing();
    }
    /**
     * Validate callbacks and automatically convert number inputs to text inputs
     * when formatting callbacks that add non-numeric characters are detected.
     * @private
     */
    _validateCallbacks() {
      const currentType = this.input.getAttribute("type");
      if (currentType !== "number") return;
      const defaultCallback = (v) => v;
      if (!this.settings.callback_after_calculation || this.settings.callback_after_calculation.toString() === defaultCallback.toString()) return;
      const testValue = "123.45";
      const afterResult = this.settings.callback_after_calculation(testValue);
      if (!/^-?\d*\.?\d*$/.test(afterResult)) {
        console.warn(
          'TouchSpin: Detected formatting callback that adds non-numeric characters. Converting input from type="number" to type="text" to support formatting like "' + afterResult + '". This ensures compatibility with custom formatting while maintaining full TouchSpin functionality. The original type will be restored when TouchSpin is destroyed.'
        );
        this._captureOriginalAttributes();
        this.input.setAttribute("type", "text");
        this.input.removeAttribute("min");
        this.input.removeAttribute("max");
        this.input.removeAttribute("step");
      }
    }
    /**
     * Capture the original attributes of the input before TouchSpin modifies them.
     * This ensures complete transparency - the input can be restored to its exact original state.
     * @private
     */
    _captureOriginalAttributes() {
      if (this._originalAttributes !== null) return;
      const attributesToTrack = [
        "role",
        "aria-valuemin",
        "aria-valuemax",
        "aria-valuenow",
        "aria-valuetext",
        "min",
        "max",
        "step"
      ];
      this._originalAttributes = {
        type: this.input.getAttribute("type"),
        attributes: /* @__PURE__ */ new Map()
      };
      attributesToTrack.forEach((attr) => {
        this._originalAttributes.attributes.set(attr, this.input.getAttribute(attr));
      });
    }
    /**
     * Restore the input to its original state by restoring all original attributes.
     * This ensures complete transparency - the input returns to its exact original state.
     * @private
     */
    _restoreOriginalAttributes() {
      if (this._originalAttributes === null) return;
      const currentValue = this.input.value;
      if (currentValue && this.settings.callback_before_calculation && this._originalAttributes.type === "number" && this.input.getAttribute("type") === "text") {
        const numericValue = this.settings.callback_before_calculation(currentValue);
        this.input.value = numericValue;
      }
      if (this._originalAttributes.type) {
        this.input.setAttribute("type", this._originalAttributes.type);
      }
      this._originalAttributes.attributes.forEach((originalValue, attrName) => {
        if (originalValue === null) {
          this.input.removeAttribute(attrName);
        } else {
          this.input.setAttribute(attrName, originalValue);
        }
      });
      this._originalAttributes = null;
    }
    /**
     * Parse data-bts-* attributes from the input element.
     * @param {HTMLInputElement} inputEl
     * @returns {Partial<TouchSpinCoreOptions>}
     * @private
     */
    _parseDataAttributes(inputEl) {
      const attributeMap = {
        min: "min",
        max: "max",
        initval: "init-val",
        replacementval: "replacement-val",
        firstclickvalueifempty: "first-click-value-if-empty",
        step: "step",
        decimals: "decimals",
        stepinterval: "step-interval",
        verticalbuttons: "vertical-buttons",
        verticalup: "vertical-up",
        verticaldown: "vertical-down",
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
      const parsed = {};
      for (const [optionName, attrName] of Object.entries(attributeMap)) {
        const fullAttrName = `data-bts-${attrName}`;
        if (inputEl.hasAttribute(fullAttrName)) {
          const rawValue = inputEl.getAttribute(fullAttrName);
          parsed[optionName] = this._coerceAttributeValue(optionName, rawValue ?? "");
        }
      }
      for (const nativeAttr of ["min", "max", "step"]) {
        if (inputEl.hasAttribute(nativeAttr)) {
          const rawValue = inputEl.getAttribute(nativeAttr);
          if (parsed[nativeAttr] !== void 0) {
            console.warn(`Both "data-bts-${nativeAttr}" and "${nativeAttr}" attributes specified. Native attribute takes precedence.`, inputEl);
          }
          parsed[nativeAttr] = this._coerceAttributeValue(nativeAttr, rawValue ?? "");
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
    _coerceAttributeValue(optionName, rawValue) {
      if (rawValue === null || rawValue === void 0) {
        return rawValue;
      }
      if (["booster", "mousewheel", "verticalbuttons", "focusablebuttons"].includes(optionName)) {
        return rawValue === "true" || rawValue === "" || rawValue === optionName;
      }
      if ([
        "min",
        "max",
        "step",
        "decimals",
        "stepinterval",
        "stepintervaldelay",
        "boostat",
        "maxboostedstep",
        "firstclickvalueifempty"
      ].includes(optionName)) {
        const num = parseFloat(rawValue);
        return isNaN(num) ? rawValue : num;
      }
      return rawValue;
    }
    /** Increment once according to step */
    upOnce() {
      if (this.input.disabled || this.input.hasAttribute("readonly")) {
        return;
      }
      const v = this.getValue();
      const next = this._nextValue("up", v);
      if (this.settings.max !== null && v === this.settings.max) {
        if (this.spinning && this.direction === "up") {
          this.stopSpin();
        }
        return;
      }
      if (this.settings.max !== null && next === this.settings.max) {
        this.emit("max");
        if (this.spinning && this.direction === "up") {
          this.stopSpin();
        }
      }
      this._setDisplay(next, true);
    }
    /** Decrement once according to step */
    downOnce() {
      if (this.input.disabled || this.input.hasAttribute("readonly")) {
        return;
      }
      const v = this.getValue();
      const next = this._nextValue("down", v);
      if (this.settings.min !== null && v === this.settings.min) {
        if (this.spinning && this.direction === "down") {
          this.stopSpin();
        }
        return;
      }
      if (this.settings.min !== null && next === this.settings.min) {
        this.emit("min");
        if (this.spinning && this.direction === "down") {
          this.stopSpin();
        }
      }
      this._setDisplay(next, true);
    }
    /** Start increasing repeatedly; no immediate step here. */
    startUpSpin() {
      this._startSpin("up");
    }
    /** Start decreasing repeatedly; no immediate step here. */
    startDownSpin() {
      this._startSpin("down");
    }
    /** Stop spinning (placeholder) */
    stopSpin() {
      this._clearSpinTimers();
      if (this.spinning) {
        if (this.direction === "up") {
          this.emit("stopupspin");
          this.emit("stopspin");
        } else if (this.direction === "down") {
          this.emit("stopdownspin");
          this.emit("stopspin");
        }
      }
      this.spinning = false;
      this.direction = false;
      this.spincount = 0;
    }
    updateSettings(opts) {
      const oldSettings = { ...this.settings };
      const newSettings = opts || {};
      const sanitizedPartial = _TouchSpinCore.sanitizePartialSettings(newSettings, oldSettings);
      Object.assign(this.settings, sanitizedPartial);
      this._sanitizeSettings();
      const step = Number(this.settings.step || 1);
      if ((sanitizedPartial.step !== void 0 || sanitizedPartial.min !== void 0 || sanitizedPartial.max !== void 0) && step !== 1) {
        if (this.settings.max !== null) {
          this.settings.max = this._alignToStep(Number(this.settings.max), step, "down");
        }
        if (this.settings.min !== null) {
          this.settings.min = this._alignToStep(Number(this.settings.min), step, "up");
        }
      }
      Object.keys(this.settings).forEach((key) => {
        if (oldSettings[key] !== this.settings[key]) {
          const observers = this._settingObservers.get(String(key));
          if (observers) {
            observers.forEach((callback) => {
              try {
                callback(this.settings[key], oldSettings[key]);
              } catch (error) {
                console.error("TouchSpin: Error in setting observer callback:", error);
              }
            });
          }
        }
      });
      this._updateAriaAttributes();
      this._syncNativeAttributes();
      this._checkValue(true);
      this._checkCallbackPairing();
    }
    getValue() {
      let raw = this.input.value;
      const repl = this.settings.replacementval ?? "";
      if (raw === "" && repl !== "") {
        raw = String(repl);
      }
      if (raw === "") return NaN;
      const before = this.settings.callback_before_calculation || ((v) => v);
      const num = parseFloat(before(String(raw)));
      return isNaN(num) ? NaN : num;
    }
    setValue(v) {
      if (this.input.disabled || this.input.hasAttribute("readonly")) return;
      const parsed = Number(v);
      if (!isFinite(parsed)) return;
      const adjusted = this._applyConstraints(parsed);
      const wasSanitized = parsed !== adjusted;
      this._setDisplay(adjusted, true, wasSanitized, true);
    }
    /**
     * Initialize DOM event handling by finding elements and attaching listeners.
     * Must be called after the renderer has created the DOM structure.
     */
    initDOMEventHandling() {
      this._findDOMElements();
      this._attachDOMEventListeners();
    }
    /**
     * Register a teardown callback that will be called when the instance is destroyed.
     * This allows wrapper libraries to register cleanup logic.
     * @param {Function} callback - Function to call on destroy
     * @returns {Function} - Unregister function
     */
    registerTeardown(callback) {
      if (typeof callback !== "function") {
        throw new Error("Teardown callback must be a function");
      }
      this._teardownCallbacks.push(callback);
      return () => {
        const index = this._teardownCallbacks.indexOf(callback);
        if (index > -1) {
          this._teardownCallbacks.splice(index, 1);
        }
      };
    }
    /** Cleanup and destroy the TouchSpin instance */
    destroy() {
      this.input.removeAttribute("data-touchspin-injected");
      this.stopSpin();
      if (this.renderer && this.renderer.teardown) {
        this.renderer.teardown();
      }
      this._detachDOMEventListeners();
      this._teardownCallbacks.forEach((callback) => {
        try {
          callback();
        } catch (error) {
          console.error("TouchSpin teardown callback error:", error);
        }
      });
      this._teardownCallbacks.length = 0;
      this._settingObservers.clear();
      if (this._mutationObserver) {
        this._mutationObserver.disconnect();
        this._mutationObserver = null;
      }
      this._upButton = null;
      this._downButton = null;
      this._restoreOriginalAttributes();
      const inst = this.input[INSTANCE_KEY];
      if (inst && inst === this) {
        delete this.input[INSTANCE_KEY];
      }
    }
    /**
     * Create a plain public API object with bound methods for wrappers.
     * @returns {TouchSpinCorePublicAPI}
     */
    toPublicApi() {
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
    attachUpEvents(element) {
      if (!element) {
        console.warn("TouchSpin: attachUpEvents called with null element");
        return;
      }
      this._upButton = element;
      element.addEventListener("mousedown", this._handleUpMouseDown);
      element.addEventListener("touchstart", this._handleUpMouseDown, { passive: false });
      if (this.settings.focusablebuttons) {
        element.addEventListener("keydown", this._handleUpKeyDown);
        element.addEventListener("keyup", this._handleUpKeyUp);
      }
      this._updateButtonDisabledState();
    }
    /**
     * Attach down button events to an element
     * Called by renderers after creating down button
     * @param {HTMLElement|null} element - The element to attach events to
     */
    attachDownEvents(element) {
      if (!element) {
        console.warn("TouchSpin: attachDownEvents called with null element");
        return;
      }
      this._downButton = element;
      element.addEventListener("mousedown", this._handleDownMouseDown);
      element.addEventListener("touchstart", this._handleDownMouseDown, { passive: false });
      if (this.settings.focusablebuttons) {
        element.addEventListener("keydown", this._handleDownKeyDown);
        element.addEventListener("keyup", this._handleDownKeyUp);
      }
      this._updateButtonDisabledState();
    }
    // --- Settings Observer Pattern ---
    /**
     * Allow renderers to observe setting changes
     * @param {string} settingName - Name of setting to observe
     * @param {Function} callback - Function to call when setting changes (newValue, oldValue)
     * @returns {Function} Unsubscribe function
     */
    observeSetting(settingName, callback) {
      const key = String(settingName);
      if (!this._settingObservers.has(key)) {
        this._settingObservers.set(key, /* @__PURE__ */ new Set());
      }
      const observers = this._settingObservers.get(key);
      observers.add(callback);
      return () => observers.delete(callback);
    }
    // --- Minimal internal emitter API ---
    /**
     * Emit a core event as DOM CustomEvent (matching original jQuery plugin behavior)
     * TODO: Consider making some events cancelable (e.g., startspin) for user control
     * @param {string} event
     * @param {any=} detail - Currently unused, kept for future extensibility
     */
    emit(event, detail) {
      const domEventName = `touchspin.on.${event}`;
      const customEvent = new CustomEvent(domEventName, {
        bubbles: true
        // cancelable: false (default) - no cancellation logic implemented yet
      });
      this.input.dispatchEvent(customEvent);
    }
    /**
     * Internal: start timed spin in a direction with initial step, delay, then interval.
     * @param {'up'|'down'} dir
     */
    _startSpin(dir) {
      if (this.input.disabled || this.input.hasAttribute("readonly")) return;
      if (this.spinning && this.direction === dir) {
        return;
      }
      if (this.spinning && this.direction !== dir) {
        this.stopSpin();
      }
      const direction_changed = !this.spinning || this.direction !== dir;
      if (direction_changed) {
        this.spinning = true;
        this.direction = dir;
        this.spincount = 0;
        this.emit("startspin");
        if (dir === "up") this.emit("startupspin");
        else this.emit("startdownspin");
      }
      if (dir === "up") this.upOnce();
      else this.downOnce();
      const v = this.getValue();
      if (dir === "up" && this.settings.max !== null && v === this.settings.max) {
        return;
      }
      if (dir === "down" && this.settings.min !== null && v === this.settings.min) {
        return;
      }
      this._clearSpinTimers();
      const delay = this.settings.stepintervaldelay || 500;
      const interval = this.settings.stepinterval || 100;
      this._spinDelayTimeout = setTimeout(() => {
        this._spinDelayTimeout = null;
        this._spinIntervalTimer = setInterval(() => {
          if (!this.spinning || this.direction !== dir) return;
          this._spinStep(dir);
        }, interval);
      }, delay);
    }
    _clearSpinTimers() {
      try {
        if (this._spinDelayTimeout) {
          clearTimeout(this._spinDelayTimeout);
        }
      } catch {
      }
      try {
        if (this._spinIntervalTimer) {
          clearInterval(this._spinIntervalTimer);
        }
      } catch {
      }
      this._spinDelayTimeout = null;
      this._spinIntervalTimer = null;
    }
    /**
     * Compute the next numeric value for a direction, respecting step, booster and bounds.
     * @param {'up'|'down'} dir
     * @param {number} current
     */
    _nextValue(dir, current) {
      let v = current;
      if (isNaN(v)) {
        v = this._valueIfIsNaN();
      } else {
        const base = this.settings.step || 1;
        const mbs = this.settings.maxboostedstep;
        let stepCandidate = base;
        if (this.settings.booster) {
          const boostat = Math.max(1, parseInt(String(this.settings.boostat || 10), 10));
          stepCandidate = Math.pow(2, Math.floor(this.spincount / boostat)) * base;
        }
        let step = stepCandidate;
        if (mbs && isFinite(mbs) && stepCandidate > Number(mbs)) {
          step = Number(mbs);
          v = Math.round(v / step) * step;
        }
        step = Math.max(base, step);
        v = dir === "up" ? v + step : v - step;
      }
      return this._applyConstraints(v);
    }
    /** Returns a reasonable value to use when current is NaN. */
    _valueIfIsNaN() {
      if (typeof this.settings.firstclickvalueifempty === "number") {
        return this.settings.firstclickvalueifempty;
      }
      const min = typeof this.settings.min === "number" ? this.settings.min : 0;
      const max = typeof this.settings.max === "number" ? this.settings.max : min;
      return (min + max) / 2;
    }
    /** Apply step divisibility and clamp to min/max. */
    _applyConstraints(v) {
      const aligned = this._forcestepdivisibility(v);
      const min = this.settings.min ?? null;
      const max = this.settings.max ?? null;
      let clamped = aligned;
      if (typeof min === "number" && clamped < min) clamped = min;
      if (typeof max === "number" && clamped > max) clamped = max;
      return clamped;
    }
    /** Determine the effective step with booster if enabled. */
    _getBoostedStep() {
      const base = this.settings.step || 1;
      if (!this.settings.booster) return base;
      const boostat = Math.max(1, parseInt(String(this.settings.boostat || 10), 10));
      let boosted = Math.pow(2, Math.floor(this.spincount / boostat)) * base;
      const mbs = this.settings.maxboostedstep;
      if (mbs && isFinite(mbs)) {
        const cap = Number(mbs);
        if (boosted > cap) boosted = cap;
      }
      return Math.max(base, boosted);
    }
    /** Aligns value to step per forcestepdivisibility. */
    _forcestepdivisibility(val) {
      const mode = this.settings.forcestepdivisibility || "round";
      const step = this.settings.step || 1;
      const dec = this.settings.decimals || 0;
      let out;
      switch (mode) {
        case "floor":
          out = Math.floor(val / step) * step;
          break;
        case "ceil":
          out = Math.ceil(val / step) * step;
          break;
        case "none":
          out = val;
          break;
        case "round":
        default:
          out = Math.round(val / step) * step;
          break;
      }
      const result = Number(out.toFixed(dec));
      return result;
    }
    /** Aligns a value to nearest step boundary using integer arithmetic. */
    _alignToStep(val, step, dir) {
      if (step === 0) return val;
      let k = 1;
      const s = step;
      while (s * k % 1 !== 0 && k < 1e6) k *= 10;
      const V = Math.round(val * k);
      const S = Math.round(step * k);
      const r = V % S;
      if (r === 0) return val;
      return (dir === "down" ? V - r : V + (S - r)) / k;
    }
    /** Format and write to input, optionally emit change if different. */
    _setDisplay(num, mayTriggerChange, forceTrigger = false, onlyTriggerIfSanitized = false) {
      const prev = String(this.input.value ?? "");
      const next = this._formatDisplay(num);
      this.input.value = next;
      this._updateAriaAttributes();
      if (mayTriggerChange && (onlyTriggerIfSanitized ? forceTrigger : forceTrigger || prev !== next)) {
        this.input.dispatchEvent(new Event("change", { bubbles: true }));
      }
      return next;
    }
    _formatDisplay(num) {
      const dec = this.settings.decimals || 0;
      const after = this.settings.callback_after_calculation || ((v) => v);
      const s = Number(num).toFixed(dec);
      return after(s);
    }
    /**
     * Perform one spin step in a direction while tracking spincount for booster.
     * @param {'up'|'down'} dir
     */
    _spinStep(dir) {
      this.spincount++;
      if (dir === "up") this.upOnce();
      else this.downOnce();
    }
    /** Sanitize current input value and update display; optionally emits change. */
    _checkValue(mayTriggerChange) {
      const v = this.getValue();
      if (!isFinite(v)) return;
      const adjusted = this._applyConstraints(v);
      const wasSanitized = v !== adjusted;
      this._setDisplay(adjusted, !!mayTriggerChange, wasSanitized);
    }
    _updateAriaAttributes() {
      const el = this.input;
      if (el.getAttribute("role") !== "spinbutton") {
        el.setAttribute("role", "spinbutton");
      }
      const min = this.settings.min ?? null;
      const max = this.settings.max ?? null;
      if (typeof min === "number") el.setAttribute("aria-valuemin", String(min));
      else el.removeAttribute("aria-valuemin");
      if (typeof max === "number") el.setAttribute("aria-valuemax", String(max));
      else el.removeAttribute("aria-valuemax");
      const raw = el.value;
      const before = this.settings.callback_before_calculation || ((v) => v);
      const num = parseFloat(before(String(raw)));
      if (isFinite(num)) el.setAttribute("aria-valuenow", String(num));
      else el.removeAttribute("aria-valuenow");
      el.setAttribute("aria-valuetext", String(raw));
    }
    /**
     * Synchronize TouchSpin settings to native input attributes.
     * Only applies to type="number" inputs to maintain browser consistency.
     * @private
     */
    _syncNativeAttributes() {
      if (this.input.getAttribute("type") === "number") {
        const min = this.settings.min ?? null;
        if (typeof min === "number" && isFinite(min)) {
          this.input.setAttribute("min", String(min));
        } else {
          this.input.removeAttribute("min");
        }
        const max = this.settings.max ?? null;
        if (typeof max === "number" && isFinite(max)) {
          this.input.setAttribute("max", String(max));
        } else {
          this.input.removeAttribute("max");
        }
        const step = this.settings.step;
        if (typeof step === "number" && isFinite(step) && step > 0) {
          this.input.setAttribute("step", String(step));
        } else {
          this.input.removeAttribute("step");
        }
      }
    }
    /**
     * Update TouchSpin settings from native attribute changes.
     * Called by mutation observer when min/max/step attributes change.
     * @private
     */
    _syncSettingsFromNativeAttributes() {
      const nativeMin = this.input.getAttribute("min");
      const nativeMax = this.input.getAttribute("max");
      const nativeStep = this.input.getAttribute("step");
      let needsUpdate = false;
      const newSettings = {};
      if (nativeMin !== null) {
        const parsedMin = nativeMin === "" ? null : parseFloat(nativeMin);
        const minNum = parsedMin !== null && isFinite(parsedMin) ? parsedMin : null;
        if (minNum !== this.settings.min) {
          newSettings.min = minNum;
          needsUpdate = true;
        }
      } else if (this.settings.min !== null) {
        newSettings.min = null;
        needsUpdate = true;
      }
      if (nativeMax !== null) {
        const parsedMax = nativeMax === "" ? null : parseFloat(nativeMax);
        const maxNum = parsedMax !== null && isFinite(parsedMax) ? parsedMax : null;
        if (maxNum !== this.settings.max) {
          newSettings.max = maxNum;
          needsUpdate = true;
        }
      } else if (this.settings.max !== null) {
        newSettings.max = null;
        needsUpdate = true;
      }
      if (nativeStep !== null) {
        const parsedStep = nativeStep === "" ? void 0 : parseFloat(nativeStep);
        const stepNum = parsedStep !== void 0 && isFinite(parsedStep) && parsedStep > 0 ? parsedStep : void 0;
        if (stepNum !== this.settings.step) {
          newSettings.step = stepNum ?? 1;
          needsUpdate = true;
        }
      } else if (this.settings.step !== 1) {
        newSettings.step = 1;
        needsUpdate = true;
      }
      if (needsUpdate) {
        this.updateSettings(newSettings);
      }
    }
    // --- DOM Event Handling Methods ---
    /**
     * Find and store references to DOM elements using data-touchspin-injected attributes.
     * @private
     */
    _findDOMElements() {
      let wrapper = this.input.parentElement;
      while (wrapper && !wrapper.hasAttribute("data-touchspin-injected")) {
        wrapper = wrapper.parentElement;
      }
      this._wrapper = wrapper;
    }
    /**
     * Attach DOM event listeners to elements.
     * @private
     */
    _attachDOMEventListeners() {
      document.addEventListener("mouseup", this._handleMouseUp);
      document.addEventListener("mouseleave", this._handleMouseUp);
      document.addEventListener("touchend", this._handleMouseUp);
      window.addEventListener("change", this._handleWindowChangeCapture, true);
      this.input.addEventListener("keydown", this._handleKeyDown);
      this.input.addEventListener("keyup", this._handleKeyUp);
      this.input.addEventListener("wheel", this._handleWheel);
    }
    /**
     * Remove DOM event listeners.
     * @private
     */
    _detachDOMEventListeners() {
      document.removeEventListener("mouseup", this._handleMouseUp);
      document.removeEventListener("mouseleave", this._handleMouseUp);
      document.removeEventListener("touchend", this._handleMouseUp);
      window.removeEventListener("change", this._handleWindowChangeCapture, true);
      this.input.removeEventListener("keydown", this._handleKeyDown);
      this.input.removeEventListener("keyup", this._handleKeyUp);
      this.input.removeEventListener("wheel", this._handleWheel);
    }
    // --- DOM Event Handlers ---
    /**
     * Handle mousedown/touchstart on up button.
     * @private
     */
    _handleUpMouseDown(e) {
      e.preventDefault();
      this.startUpSpin();
    }
    /**
     * Handle mousedown/touchstart on down button.
     * @private
     */
    _handleDownMouseDown(e) {
      e.preventDefault();
      this.startDownSpin();
    }
    /**
     * Handle mouseup/touchend/mouseleave to stop spinning.
     * @private
     */
    _handleMouseUp(e) {
      this.stopSpin();
    }
    /**
     * Handle keydown events on up button.
     * @private
     */
    _handleUpKeyDown(e) {
      if (e.keyCode === 13 || e.keyCode === 32) {
        e.preventDefault();
        if (e.repeat) return;
        this.startUpSpin();
      }
    }
    /**
     * Handle keyup events on up button.
     * @private
     */
    _handleUpKeyUp(e) {
      if (e.keyCode === 13 || e.keyCode === 32) {
        this.stopSpin();
      }
    }
    /**
     * Handle keydown events on down button.
     * @private
     */
    _handleDownKeyDown(e) {
      if (e.keyCode === 13 || e.keyCode === 32) {
        e.preventDefault();
        if (e.repeat) return;
        this.startDownSpin();
      }
    }
    /**
     * Handle keyup events on down button.
     * @private
     */
    _handleDownKeyUp(e) {
      if (e.keyCode === 13 || e.keyCode === 32) {
        this.stopSpin();
      }
    }
    /**
     * Sanitize value before other capture listeners observe unsanitized input.
     * @private
     */
    _handleWindowChangeCapture(e) {
      const target = e.target;
      if (!target || target !== this.input) return;
      const currentValue = this.getValue();
      if (!isFinite(currentValue)) return;
      const sanitized = this._applyConstraints(currentValue);
      if (sanitized !== currentValue) {
        this._setDisplay(sanitized, false);
      }
    }
    /**
     * Handle keydown events on the input element.
     * @private
     */
    _handleKeyDown(e) {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          if (e.repeat) return;
          this.startUpSpin();
          break;
        case "ArrowDown":
          e.preventDefault();
          if (e.repeat) return;
          this.startDownSpin();
          break;
        case "Enter":
          this._checkValue(false);
          break;
      }
    }
    /**
     * Handle keyup events on the input element.
     * @private
     */
    _handleKeyUp(e) {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        this.stopSpin();
      }
    }
    /**
     * Handle wheel events on the input element.
     * @private
     */
    _handleWheel(e) {
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
    _setupMutationObserver() {
      if (typeof MutationObserver !== "undefined") {
        this._mutationObserver = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === "attributes") {
              if (mutation.attributeName === "disabled" || mutation.attributeName === "readonly") {
                this._updateButtonDisabledState();
              } else if (mutation.attributeName === "min" || mutation.attributeName === "max" || mutation.attributeName === "step") {
                this._syncSettingsFromNativeAttributes();
              }
            }
          });
        });
        this._mutationObserver.observe(this.input, {
          attributes: true,
          attributeFilter: ["disabled", "readonly", "min", "max", "step"]
        });
      }
    }
    /**
     * Update button disabled state based on input disabled/readonly state
     * @private
     */
    _updateButtonDisabledState() {
      const isDisabled = this.input.disabled || this.input.hasAttribute("readonly");
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
    /**
     * Check if callbacks are properly paired and warn if not
     * @private
     */
    _checkCallbackPairing() {
      const defCb = (v) => v;
      const hasBefore = this.settings.callback_before_calculation && this.settings.callback_before_calculation.toString() !== defCb.toString();
      const hasAfter = this.settings.callback_after_calculation && this.settings.callback_after_calculation.toString() !== defCb.toString();
      if (hasBefore && !hasAfter) {
        console.warn(
          "TouchSpin: callback_before_calculation is defined but callback_after_calculation is missing. These callbacks should be used together - one removes formatting, the other adds it back."
        );
      } else if (!hasBefore && hasAfter) {
        console.warn(
          "TouchSpin: callback_after_calculation is defined but callback_before_calculation is missing. These callbacks should be used together - one removes formatting, the other adds it back."
        );
      }
    }
  };
  function TouchSpin(inputEl, opts) {
    if (!inputEl || inputEl.nodeName !== "INPUT") {
      console.warn("Must be an input.");
      return null;
    }
    if (opts !== void 0) {
      if (inputEl[INSTANCE_KEY]) {
        console.warn("TouchSpin: Destroying existing instance and reinitializing. Consider using updateSettings() instead.");
        inputEl[INSTANCE_KEY].destroy();
      }
      const core = new TouchSpinCore(inputEl, opts);
      inputEl[INSTANCE_KEY] = core;
      core.initDOMEventHandling();
      return core.toPublicApi();
    }
    if (!inputEl[INSTANCE_KEY]) {
      const core = new TouchSpinCore(inputEl, {});
      inputEl[INSTANCE_KEY] = core;
      core.initDOMEventHandling();
      return core.toPublicApi();
    }
    return inputEl[INSTANCE_KEY].toPublicApi();
  }
  var CORE_EVENTS = Object.freeze({
    MIN: "min",
    MAX: "max",
    START_SPIN: "startspin",
    START_UP: "startupspin",
    START_DOWN: "startdownspin",
    STOP_SPIN: "stopspin",
    STOP_UP: "stopupspin",
    STOP_DOWN: "stopdownspin"
  });

  // ../../core/dist/renderer.js
  var TOUCHSPIN_ATTRIBUTE = "data-touchspin-injected";
  var TEST_ID_ATTRIBUTE = "data-testid";
  var WRAPPER_TYPE_DEFAULT = "wrapper";
  var WRAPPER_TYPE_ADVANCED = "wrapper-advanced";
  var WRAPPER_READY_CLASS = "bootstrap-touchspin";
  var AbstractRenderer = class {
    constructor(input, settings, core) {
      this.wrapper = null;
      this.wrapperType = WRAPPER_TYPE_DEFAULT;
      this.input = input;
      this.settings = settings;
      this.core = core;
    }
    teardown() {
      this.removeInjectedElements();
    }
    removeInjectedElements() {
      this.removeInjectedNodesWithinWrapper();
      this.removeNearbyInjectedNodes();
    }
    finalizeWrapperAttributes() {
      if (!this.wrapper) return;
      const testId = this.input.getAttribute(TEST_ID_ATTRIBUTE);
      if (testId && !this.wrapper.hasAttribute(TEST_ID_ATTRIBUTE)) {
        this.wrapper.setAttribute(TEST_ID_ATTRIBUTE, `${testId}-wrapper`);
      }
      this.wrapper.setAttribute(TOUCHSPIN_ATTRIBUTE, this.wrapperType);
    }
    getUpButtonTestId() {
      return this.buildDataTestId("up");
    }
    getDownButtonTestId() {
      return this.buildDataTestId("down");
    }
    getPrefixTestId() {
      return this.buildDataTestId("prefix");
    }
    getPostfixTestId() {
      return this.buildDataTestId("postfix");
    }
    extractRendererSettings(schema, sourceSettings = this.settings) {
      const selected = {};
      for (const key in schema) {
        if (Object.prototype.hasOwnProperty.call(sourceSettings, key)) {
          selected[key] = sourceSettings[key];
        }
      }
      return selected;
    }
    // Backward compatibility alias
    projectRendererOptions(schema, from = this.settings) {
      return this.extractRendererSettings(schema, from);
    }
    removeInjectedNodesWithinWrapper() {
      const { wrapper } = this;
      if (!wrapper) return;
      wrapper.querySelectorAll(`[${TOUCHSPIN_ATTRIBUTE}]`).forEach((element) => element.remove());
      if (!wrapper.hasAttribute(TOUCHSPIN_ATTRIBUTE) || !wrapper.parentElement) {
        return;
      }
      const wrapperType = wrapper.getAttribute(TOUCHSPIN_ATTRIBUTE);
      if (wrapperType === WRAPPER_TYPE_ADVANCED) {
        wrapper.classList.remove(WRAPPER_READY_CLASS);
        wrapper.removeAttribute(TOUCHSPIN_ATTRIBUTE);
        return;
      }
      wrapper.parentElement.insertBefore(this.input, wrapper);
      wrapper.remove();
    }
    removeNearbyInjectedNodes() {
      const injectedNodes = document.querySelectorAll(`[${TOUCHSPIN_ATTRIBUTE}]`);
      injectedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node === this.input) return;
        if (!this.isNodeRelatedToInput(node)) return;
        node.remove();
      });
    }
    isNodeRelatedToInput(node) {
      const parent = node.parentElement;
      const inputParent = this.input.parentElement;
      const nodeContainsInput = node.contains(this.input);
      const parentContainsInput = parent?.contains(this.input) ?? false;
      const inputContainsNode = inputParent?.contains(node) ?? false;
      return nodeContainsInput || parentContainsInput || inputContainsNode;
    }
    buildDataTestId(suffix) {
      const base = this.input.getAttribute(TEST_ID_ATTRIBUTE);
      return base ? ` data-testid="${base}-${suffix}"` : "";
    }
  };
  var AbstractRenderer_default = AbstractRenderer;

  // src/Bootstrap4Renderer.ts
  var Bootstrap4Renderer = class extends AbstractRenderer_default {
    constructor() {
      super(...arguments);
      __publicField(this, "prefixEl", null);
      __publicField(this, "postfixEl", null);
      __publicField(this, "_formControlAdded");
    }
    init() {
      this.prefixEl = null;
      this.postfixEl = null;
      if (!this.input.classList.contains("form-control")) {
        this.input.classList.add("form-control");
        this._formControlAdded = true;
      }
      this.buildAndAttachDOM();
      this.core.observeSetting("prefix", (newValue) => this.updatePrefix(newValue));
      this.core.observeSetting("postfix", (newValue) => this.updatePostfix(newValue));
      this.core.observeSetting("buttonup_class", (newValue) => this.updateButtonClass("up", newValue));
      this.core.observeSetting("buttondown_class", (newValue) => this.updateButtonClass("down", newValue));
      this.core.observeSetting("verticalupclass", (newValue) => this.updateVerticalButtonClass("up", newValue));
      this.core.observeSetting("verticaldownclass", (newValue) => this.updateVerticalButtonClass("down", newValue));
      this.core.observeSetting("verticalup", (newValue) => this.updateVerticalButtonText("up", newValue));
      this.core.observeSetting("verticaldown", (newValue) => this.updateVerticalButtonText("down", newValue));
      this.core.observeSetting("buttonup_txt", (newValue) => this.updateButtonText("up", newValue));
      this.core.observeSetting("buttondown_txt", (newValue) => this.updateButtonText("down", newValue));
      this.core.observeSetting("prefix_extraclass", (newValue) => this.updatePrefixClasses());
      this.core.observeSetting("postfix_extraclass", (newValue) => this.updatePostfixClasses());
      this.core.observeSetting("verticalbuttons", (newValue) => this.handleVerticalButtonsChange(newValue));
      this.core.observeSetting("focusablebuttons", (newValue) => this.updateButtonFocusability(newValue));
    }
    teardown() {
      if (this._formControlAdded) {
        this.input.classList.remove("form-control");
        this._formControlAdded = false;
      }
      super.teardown();
    }
    buildInputGroup() {
      const existingInputGroup = this.input.closest(".input-group");
      if (existingInputGroup) {
        return this.buildAdvancedInputGroup(existingInputGroup);
      } else {
        return this.buildBasicInputGroup();
      }
    }
    buildBasicInputGroup() {
      const inputGroupSize = this._detectInputGroupSize();
      let html;
      if (this.settings.verticalbuttons) {
        html = `
        <div class="input-group ${inputGroupSize} bootstrap-touchspin">
          ${this.settings.prefix ? `<div class="input-group-prepend bootstrap-touchspin-prefix" data-touchspin-injected="prefix"${this.getPrefixTestId()}>
            <span class="input-group-text ${this.settings.prefix_extraclass || ""}">${this.settings.prefix}</span>
          </div>` : ""}
          ${this.settings.postfix ? `<div class="input-group-append bootstrap-touchspin-postfix" data-touchspin-injected="postfix"${this.getPostfixTestId()}>
            <span class="input-group-text ${this.settings.postfix_extraclass || ""}">${this.settings.postfix}</span>
          </div>` : ""}
          ${this.buildVerticalButtons()}
        </div>
      `;
      } else {
        html = `
        <div class="input-group ${inputGroupSize} bootstrap-touchspin">
          <div class="input-group-prepend" data-touchspin-injected="prepend-wrapper">
            <button tabindex="${this.settings.focusablebuttons ? "0" : "-1"}" class="${this.settings.buttondown_class || "btn btn-outline-secondary"} bootstrap-touchspin-down" data-touchspin-injected="down"${this.getDownButtonTestId()} type="button" aria-label="Decrease value">${this.settings.buttondown_txt || "\u2212"}</button>
            ${this.settings.prefix ? `<span class="input-group-text bootstrap-touchspin-prefix ${this.settings.prefix_extraclass || ""}" data-touchspin-injected="prefix"${this.getPrefixTestId()}>${this.settings.prefix}</span>` : ""}
          </div>
          <div class="input-group-append" data-touchspin-injected="append-wrapper">
            ${this.settings.postfix ? `<span class="input-group-text bootstrap-touchspin-postfix ${this.settings.postfix_extraclass || ""}" data-touchspin-injected="postfix"${this.getPostfixTestId()}>${this.settings.postfix}</span>` : ""}
            <button tabindex="${this.settings.focusablebuttons ? "0" : "-1"}" class="${this.settings.buttonup_class || "btn btn-outline-secondary"} bootstrap-touchspin-up" data-touchspin-injected="up"${this.getUpButtonTestId()} type="button" aria-label="Increase value">${this.settings.buttonup_txt || "+"}</button>
          </div>
        </div>
      `;
      }
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html.trim();
      const wrapper = tempDiv.firstChild;
      if (this.input.parentElement && wrapper) {
        this.input.parentElement.insertBefore(wrapper, this.input);
      }
      if (this.settings.verticalbuttons) {
        const prefixWrapper = wrapper.querySelector('[data-touchspin-injected="prefix"]');
        const postfixWrapper = wrapper.querySelector('[data-touchspin-injected="postfix"]');
        if (prefixWrapper) {
          if (wrapper) wrapper.insertBefore(this.input, prefixWrapper.nextSibling);
        } else if (postfixWrapper) {
          if (wrapper) wrapper.insertBefore(this.input, postfixWrapper);
        } else {
          const verticalWrapper = wrapper.querySelector('[data-touchspin-injected="vertical-wrapper"]');
          if (wrapper && verticalWrapper) wrapper.insertBefore(this.input, verticalWrapper);
        }
      } else {
        const appendWrapper = wrapper.querySelector('[data-touchspin-injected="append-wrapper"]');
        if (wrapper && appendWrapper) wrapper.insertBefore(this.input, appendWrapper);
      }
      return wrapper;
    }
    buildAdvancedInputGroup(existingInputGroup) {
      existingInputGroup.classList.add("bootstrap-touchspin");
      this.wrapperType = "wrapper-advanced";
      let elementsHtml;
      if (this.settings.verticalbuttons) {
        elementsHtml = `
        ${this.settings.prefix ? `<div class="input-group-prepend bootstrap-touchspin-prefix" data-touchspin-injected="prefix"${this.getPrefixTestId()}>
          <span class="input-group-text ${this.settings.prefix_extraclass || ""}">${this.settings.prefix}</span>
        </div>` : ""}
        ${this.settings.postfix ? `<div class="input-group-append bootstrap-touchspin-postfix" data-touchspin-injected="postfix"${this.getPostfixTestId()}>
          <span class="input-group-text ${this.settings.postfix_extraclass || ""}">${this.settings.postfix}</span>
        </div>` : ""}
        ${this.buildVerticalButtons()}
      `;
      } else {
        elementsHtml = `
        <div class="input-group-prepend" data-touchspin-injected="prepend-wrapper">
          <button tabindex="${this.settings.focusablebuttons ? "0" : "-1"}" class="${this.settings.buttondown_class || "btn btn-outline-secondary"} bootstrap-touchspin-down" data-touchspin-injected="down"${this.getDownButtonTestId()} type="button">${this.settings.buttondown_txt || "-"}</button>
          ${this.settings.prefix ? `<span class="input-group-text bootstrap-touchspin-prefix ${this.settings.prefix_extraclass || ""}" data-touchspin-injected="prefix"${this.getPrefixTestId()}>${this.settings.prefix}</span>` : ""}
        </div>
        <div class="input-group-append" data-touchspin-injected="append-wrapper">
          ${this.settings.postfix ? `<span class="input-group-text bootstrap-touchspin-postfix ${this.settings.postfix_extraclass || ""}" data-touchspin-injected="postfix"${this.getPostfixTestId()}>${this.settings.postfix}</span>` : ""}
          <button tabindex="${this.settings.focusablebuttons ? "0" : "-1"}" class="${this.settings.buttonup_class || "btn btn-outline-secondary"} bootstrap-touchspin-up" data-touchspin-injected="up"${this.getUpButtonTestId()} type="button">${this.settings.buttonup_txt || "+"}</button>
        </div>
      `;
      }
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = elementsHtml;
      let prefixEl;
      let postfixEl;
      this.ensureInputInGroup(existingInputGroup);
      if (this.settings.verticalbuttons) {
        prefixEl = tempDiv.querySelector('[data-touchspin-injected="prefix"]');
        if (prefixEl) {
          existingInputGroup.insertBefore(prefixEl, this.input);
        }
        postfixEl = tempDiv.querySelector('[data-touchspin-injected="postfix"]');
        if (postfixEl) {
          existingInputGroup.insertBefore(postfixEl, this.input.nextSibling);
        }
        const verticalButtonWrapper = tempDiv.querySelector('[data-touchspin-injected="vertical-wrapper"]');
        if (verticalButtonWrapper) {
          existingInputGroup.insertBefore(verticalButtonWrapper, postfixEl ? postfixEl.nextSibling : this.input.nextSibling);
        }
      } else {
        const prependWrapper = tempDiv.querySelector('[data-touchspin-injected="prepend-wrapper"]');
        if (prependWrapper) {
          existingInputGroup.insertBefore(prependWrapper, this.input);
        }
        const appendWrapper = tempDiv.querySelector('[data-touchspin-injected="append-wrapper"]');
        if (appendWrapper) {
          existingInputGroup.insertBefore(appendWrapper, this.input.nextSibling);
        }
        prefixEl = prependWrapper ? prependWrapper.querySelector('[data-touchspin-injected="prefix"]') : null;
        postfixEl = appendWrapper ? appendWrapper.querySelector('[data-touchspin-injected="postfix"]') : null;
      }
      this.prefixEl = prefixEl;
      this.postfixEl = postfixEl;
      return existingInputGroup;
    }
    _detectInputGroupSize() {
      const classList = this.input.className;
      if (classList.includes("form-control-sm")) {
        return "input-group-sm";
      } else if (classList.includes("form-control-lg")) {
        return "input-group-lg";
      }
      return "";
    }
    buildAndAttachDOM() {
      this.wrapper = this.buildInputGroup();
      if (!this.wrapper) return;
      const upButton = this.wrapper.querySelector('[data-touchspin-injected="up"]');
      const downButton = this.wrapper.querySelector('[data-touchspin-injected="down"]');
      this.prefixEl = this.wrapper.querySelector('[data-touchspin-injected="prefix"]');
      this.postfixEl = this.wrapper.querySelector('[data-touchspin-injected="postfix"]');
      this.core.attachUpEvents(upButton);
      this.core.attachDownEvents(downButton);
    }
    /**
     * Ensures input element is properly positioned within the input group before using it as reference
     * Fixes DOM insertion bug when input loses parent-child relationship during rebuilds
     */
    ensureInputInGroup(existingInputGroup) {
      if (this.input.parentElement === existingInputGroup) {
        return;
      }
      existingInputGroup.appendChild(this.input);
    }
    updatePrefix(value) {
      const prefixEl = this.prefixEl;
      if (value && value !== "") {
        if (prefixEl) {
          prefixEl.textContent = value;
          prefixEl.style.display = "";
          prefixEl.className = `input-group-text bootstrap-touchspin-prefix ${this.settings.prefix_extraclass || ""}`.trim();
        } else {
          this.rebuildDOM();
        }
      } else if (prefixEl) {
        this.rebuildDOM();
      }
    }
    updatePostfix(value) {
      const postfixEl = this.postfixEl;
      if (value && value !== "") {
        if (postfixEl) {
          postfixEl.textContent = value;
          postfixEl.style.display = "";
          postfixEl.className = `input-group-text bootstrap-touchspin-postfix ${this.settings.postfix_extraclass || ""}`.trim();
        } else {
          this.rebuildDOM();
        }
      } else if (postfixEl) {
        this.rebuildDOM();
      }
    }
    updateButtonClass(type, className) {
      if (!this.wrapper) return;
      const button = this.wrapper.querySelector(`[data-touchspin-injected="${type}"]`);
      if (button) {
        button.className = `${className || "btn btn-outline-secondary"} bootstrap-touchspin-${type}`;
      }
    }
    buildVerticalButtons() {
      return `
      <span class="input-group-text bootstrap-touchspin-vertical-button-wrapper" data-touchspin-injected="vertical-wrapper">
        <span class="input-group-btn-vertical">
          <button tabindex="${this.settings.focusablebuttons ? "0" : "-1"}" class="${this.settings.buttonup_class || "btn btn-outline-secondary"} ${this.settings.verticalupclass || "btn btn-outline-secondary"} bootstrap-touchspin-up" data-touchspin-injected="up"${this.getUpButtonTestId()} type="button" aria-label="Increase value">${this.settings.verticalup || "+"}</button>
          <button tabindex="${this.settings.focusablebuttons ? "0" : "-1"}" class="${this.settings.buttondown_class || "btn btn-outline-secondary"} ${this.settings.verticaldownclass || "btn btn-outline-secondary"} bootstrap-touchspin-down" data-touchspin-injected="down"${this.getDownButtonTestId()} type="button" aria-label="Decrease value">${this.settings.verticaldown || "\u2212"}</button>
        </span>
      </span>
    `;
    }
    updateVerticalButtonClass(type, className) {
      if (!this.wrapper) return;
      const verticalWrapper = this.wrapper.querySelector('[data-touchspin-injected="vertical-wrapper"]');
      if (verticalWrapper) {
        const button = verticalWrapper.querySelector(`[data-touchspin-injected="${type}"]`);
        if (button) {
          const baseClasses = this.settings.buttonup_class || this.settings.buttondown_class || "btn btn-outline-secondary";
          button.className = `${baseClasses} ${className || "btn btn-outline-secondary"} bootstrap-touchspin-${type}`;
        }
      }
    }
    updateVerticalButtonText(type, text) {
      if (!this.wrapper) return;
      const verticalWrapper = this.wrapper.querySelector('[data-touchspin-injected="vertical-wrapper"]');
      if (verticalWrapper) {
        const button = verticalWrapper.querySelector(`[data-touchspin-injected="${type}"]`);
        if (button) {
          button.textContent = text || (type === "up" ? "+" : "\u2212");
        }
      }
    }
    updateButtonText(type, text) {
      if (!this.wrapper) return;
      const button = this.wrapper.querySelector(`[data-touchspin-injected="${type}"]`);
      if (button) {
        button.textContent = text || (type === "up" ? "+" : "\u2212");
      }
    }
    updatePrefixClasses() {
      const prefixEl = this.prefixEl;
      if (prefixEl) {
        prefixEl.className = `input-group-text bootstrap-touchspin-prefix ${this.settings.prefix_extraclass || ""}`.trim();
      }
    }
    updatePostfixClasses() {
      const postfixEl = this.postfixEl;
      if (postfixEl) {
        postfixEl.className = `input-group-text bootstrap-touchspin-postfix ${this.settings.postfix_extraclass || ""}`.trim();
      }
    }
    handleVerticalButtonsChange(newValue) {
      this.rebuildDOM();
    }
    rebuildDOM() {
      this.removeInjectedElements();
      this.wrapper = null;
      this.prefixEl = null;
      this.postfixEl = null;
      this.buildAndAttachDOM();
      if (this.wrapper) {
        this.finalizeWrapperAttributes();
      }
    }
    updateButtonFocusability(newValue) {
      if (!this.wrapper) return;
      const buttons = this.wrapper.querySelectorAll('[data-touchspin-injected="up"], [data-touchspin-injected="down"]');
      const tabindex = newValue ? "0" : "-1";
      buttons.forEach((button) => {
        button.setAttribute("tabindex", tabindex);
      });
    }
  };
  var Bootstrap4Renderer_default = Bootstrap4Renderer;

  // src/touchspin-bs4-complete.ts
  globalThis.TouchSpinDefaultRenderer = Bootstrap4Renderer_default;
  window.TouchSpinCore = TouchSpin;
  window.Bootstrap4Renderer = Bootstrap4Renderer_default;
  window.testPageReady = true;
})();
//# sourceMappingURL=touchspin-bs4-complete.global.js.map
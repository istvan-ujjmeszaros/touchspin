"use strict";
var TouchSpinBS5 = (() => {
  // ../core/dist/index.js
  var TouchSpinCallableEvent = /* @__PURE__ */ ((TouchSpinCallableEvent2) => {
    TouchSpinCallableEvent2["UPDATE_SETTINGS"] = "touchspin.updatesettings";
    TouchSpinCallableEvent2["UP_ONCE"] = "touchspin.uponce";
    TouchSpinCallableEvent2["DOWN_ONCE"] = "touchspin.downonce";
    TouchSpinCallableEvent2["START_UP_SPIN"] = "touchspin.startupspin";
    TouchSpinCallableEvent2["START_DOWN_SPIN"] = "touchspin.startdownspin";
    TouchSpinCallableEvent2["STOP_SPIN"] = "touchspin.stopspin";
    TouchSpinCallableEvent2["DESTROY"] = "touchspin.destroy";
    return TouchSpinCallableEvent2;
  })(TouchSpinCallableEvent || {});
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
      var _a;
      this._captureOriginalAttributes();
      const initVal = (_a = this.settings.initval) != null ? _a : "";
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
          parsed[optionName] = this._coerceAttributeValue(optionName, rawValue != null ? rawValue : "");
        }
      }
      for (const nativeAttr of ["min", "max", "step"]) {
        if (inputEl.hasAttribute(nativeAttr)) {
          const rawValue = inputEl.getAttribute(nativeAttr);
          if (parsed[nativeAttr] !== void 0) {
            console.warn(`Both "data-bts-${nativeAttr}" and "${nativeAttr}" attributes specified. Native attribute takes precedence.`, inputEl);
          }
          parsed[nativeAttr] = this._coerceAttributeValue(nativeAttr, rawValue != null ? rawValue : "");
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
      var _a;
      let raw = this.input.value;
      const repl = (_a = this.settings.replacementval) != null ? _a : "";
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
      } catch (e) {
      }
      try {
        if (this._spinIntervalTimer) {
          clearInterval(this._spinIntervalTimer);
        }
      } catch (e) {
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
      var _a, _b;
      const aligned = this._forcestepdivisibility(v);
      const min = (_a = this.settings.min) != null ? _a : null;
      const max = (_b = this.settings.max) != null ? _b : null;
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
      var _a;
      const prev = String((_a = this.input.value) != null ? _a : "");
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
      var _a, _b;
      const el = this.input;
      if (el.getAttribute("role") !== "spinbutton") {
        el.setAttribute("role", "spinbutton");
      }
      const min = (_a = this.settings.min) != null ? _a : null;
      const max = (_b = this.settings.max) != null ? _b : null;
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
      var _a, _b;
      if (this.input.getAttribute("type") === "number") {
        const min = (_a = this.settings.min) != null ? _a : null;
        if (typeof min === "number" && isFinite(min)) {
          this.input.setAttribute("min", String(min));
        } else {
          this.input.removeAttribute("min");
        }
        const max = (_b = this.settings.max) != null ? _b : null;
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
          newSettings.step = stepNum != null ? stepNum : 1;
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
  function getTouchSpin(inputEl) {
    return inputEl[INSTANCE_KEY] ? inputEl[INSTANCE_KEY].toPublicApi() : null;
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

  // src/index.ts
  function installJqueryTouchSpin($) {
    $.fn.TouchSpin = function(options, arg) {
      if (typeof options === "string") {
        const cmd = String(options).toLowerCase();
        let ret;
        this.each(function() {
          const inputEl = this;
          const api = getTouchSpin(inputEl);
          if ((cmd === "getvalue" || cmd === "get") && ret === void 0) {
            if (api) {
              ret = api.getValue();
            } else {
              ret = inputEl.value;
            }
            return;
          }
          if (!api) return;
          switch (cmd) {
            case "destroy":
              api.destroy();
              break;
            // Core removes instance from element
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
            case "setvalue":
            case "set":
              api.setValue(arg);
              break;
          }
        });
        return ret === void 0 ? this : ret;
      }
      return this.each(function() {
        const $input = $(this);
        const inputEl = this;
        const inst = TouchSpin(inputEl, options || {});
        if (!inst) {
          return;
        }
        const jqueryTeardown = () => {
          $input.off(`${TouchSpinCallableEvent.UP_ONCE} ${TouchSpinCallableEvent.DOWN_ONCE} ${TouchSpinCallableEvent.START_UP_SPIN} ${TouchSpinCallableEvent.START_DOWN_SPIN} ${TouchSpinCallableEvent.STOP_SPIN} ${TouchSpinCallableEvent.UPDATE_SETTINGS} ${TouchSpinCallableEvent.DESTROY} blur.touchspin`);
        };
        inst.registerTeardown(jqueryTeardown);
        $input.on(TouchSpinCallableEvent.UP_ONCE, () => {
          const api = getTouchSpin(inputEl);
          if (api) api.upOnce();
        });
        $input.on(TouchSpinCallableEvent.DOWN_ONCE, () => {
          const api = getTouchSpin(inputEl);
          if (api) api.downOnce();
        });
        $input.on(TouchSpinCallableEvent.START_UP_SPIN, () => {
          const api = getTouchSpin(inputEl);
          if (api) api.startUpSpin();
        });
        $input.on(TouchSpinCallableEvent.START_DOWN_SPIN, () => {
          const api = getTouchSpin(inputEl);
          if (api) api.startDownSpin();
        });
        $input.on(TouchSpinCallableEvent.STOP_SPIN, () => {
          const api = getTouchSpin(inputEl);
          if (api) api.stopSpin();
        });
        $input.on(TouchSpinCallableEvent.UPDATE_SETTINGS, (_e, o) => {
          const api = getTouchSpin(inputEl);
          if (api) api.updateSettings(o || {});
        });
        $input.on(TouchSpinCallableEvent.DESTROY, () => {
          const api = getTouchSpin(inputEl);
          if (api) api.destroy();
        });
        $input.on("blur.touchspin", () => {
          var _a;
          const core = inputEl["_touchSpinCore"];
          (_a = core == null ? void 0 : core._checkValue) == null ? void 0 : _a.call(core, true);
        });
      });
    };
  }
  function installWithRenderer(renderer) {
    globalThis.TouchSpinDefaultRenderer = renderer;
    const $ = globalThis.jQuery;
    if ($) {
      installJqueryTouchSpin($);
    } else {
      console.warn("installWithRenderer: jQuery not found on window. Call installJqueryTouchSpin($) manually.");
    }
  }

  // ../core/dist/renderer.js
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
      var _a, _b;
      const parent = node.parentElement;
      const inputParent = this.input.parentElement;
      const nodeContainsInput = node.contains(this.input);
      const parentContainsInput = (_a = parent == null ? void 0 : parent.contains(this.input)) != null ? _a : false;
      const inputContainsNode = (_b = inputParent == null ? void 0 : inputParent.contains(node)) != null ? _b : false;
      return nodeContainsInput || parentContainsInput || inputContainsNode;
    }
    buildDataTestId(suffix) {
      const base = this.input.getAttribute(TEST_ID_ATTRIBUTE);
      return base ? ` data-testid="${base}-${suffix}"` : "";
    }
  };
  var AbstractRenderer_default = AbstractRenderer;

  // ../renderers/bootstrap5/dist/index.js
  var bootstrap5Schema = Object.freeze({
    // Button text
    buttonup_txt: { kind: "string" },
    buttondown_txt: { kind: "string" },
    // Button classes
    buttonup_class: { kind: "string" },
    buttondown_class: { kind: "string" },
    // Vertical layout
    verticalbuttons: { kind: "boolean" },
    verticalup: { kind: "string" },
    verticaldown: { kind: "string" },
    verticalupclass: { kind: "string" },
    verticaldownclass: { kind: "string" },
    // Prefix/postfix
    prefix: { kind: "string" },
    postfix: { kind: "string" },
    prefix_extraclass: { kind: "string" },
    postfix_extraclass: { kind: "string" }
  });
  var CSS_CLASSES = {
    FORM_CONTROL: "form-control",
    INPUT_GROUP: "input-group",
    INPUT_GROUP_TEXT: "input-group-text",
    BOOTSTRAP_TOUCHSPIN: "bootstrap-touchspin",
    BTN_VERTICAL: "input-group-btn-vertical",
    DEFAULT_BUTTON: "btn btn-outline-secondary"
  };
  var SELECTORS = {
    UP_BUTTON: '[data-touchspin-injected="up"]',
    DOWN_BUTTON: '[data-touchspin-injected="down"]',
    PREFIX: '[data-touchspin-injected="prefix"]',
    POSTFIX: '[data-touchspin-injected="postfix"]',
    VERTICAL_WRAPPER: '[data-touchspin-injected="vertical-wrapper"]'
  };
  var BUTTON_TEXT = {
    UP: "+",
    DOWN: "\u2212"
  };
  var INJECTED_TYPES = {
    UP: "up",
    DOWN: "down",
    PREFIX: "prefix",
    POSTFIX: "postfix",
    VERTICAL_WRAPPER: "vertical-wrapper"
  };
  var Bootstrap5Renderer = class extends AbstractRenderer_default {
    constructor(...args) {
      super(...args);
      this.opts = {};
      this.prefixEl = null;
      this.postfixEl = null;
      this.formControlAdded = false;
      const [input] = args;
      this.initialInputGroup = input.closest(`.${CSS_CLASSES.INPUT_GROUP}`);
    }
    init() {
      this.initializeOptions();
      this.resetElementReferences();
      this.ensureFormControlClass();
      this.buildAndAttachDOM();
      this.registerSettingObservers();
    }
    teardown() {
      this.restoreFormControlClass();
      super.teardown();
    }
    // Initialization helpers
    initializeOptions() {
      this.opts = this.extractRendererSettings(bootstrap5Schema);
    }
    resetElementReferences() {
      this.prefixEl = null;
      this.postfixEl = null;
    }
    ensureFormControlClass() {
      if (!this.input.classList.contains(CSS_CLASSES.FORM_CONTROL)) {
        this.input.classList.add(CSS_CLASSES.FORM_CONTROL);
        this.formControlAdded = true;
      }
    }
    restoreFormControlClass() {
      if (this.formControlAdded) {
        this.input.classList.remove(CSS_CLASSES.FORM_CONTROL);
        this.formControlAdded = false;
      }
    }
    // DOM building
    buildInputGroup() {
      const closestGroup = this.input.closest(`.${CSS_CLASSES.INPUT_GROUP}`);
      const existingInputGroup = closestGroup != null ? closestGroup : this.initialInputGroup;
      return existingInputGroup ? this.buildAdvancedInputGroup(existingInputGroup) : this.buildBasicInputGroup();
    }
    buildBasicInputGroup() {
      const inputGroupSize = this.detectInputGroupSize();
      const wrapper = this.createInputGroupWrapper(inputGroupSize);
      this.appendElementsToWrapper(wrapper);
      this.insertWrapperAndInput(wrapper);
      this.positionInputWithinWrapper(wrapper);
      return wrapper;
    }
    buildAdvancedInputGroup(existingInputGroup) {
      existingInputGroup.classList.add(CSS_CLASSES.BOOTSTRAP_TOUCHSPIN);
      this.wrapperType = "wrapper-advanced";
      this.insertElementsIntoExistingGroup(existingInputGroup);
      this.storeElementReferences(existingInputGroup);
      return existingInputGroup;
    }
    createInputGroupWrapper(sizeClass) {
      const wrapper = document.createElement("div");
      wrapper.className = this.buildClasses([
        CSS_CLASSES.INPUT_GROUP,
        sizeClass,
        CSS_CLASSES.BOOTSTRAP_TOUCHSPIN
      ]);
      return wrapper;
    }
    appendElementsToWrapper(wrapper) {
      if (!this.opts.verticalbuttons) {
        wrapper.appendChild(this.createDownButton());
      }
      if (this.opts.prefix) {
        wrapper.appendChild(this.createPrefixElement());
      }
      if (this.opts.postfix) {
        wrapper.appendChild(this.createPostfixElement());
      }
      if (this.opts.verticalbuttons) {
        wrapper.appendChild(this.createVerticalButtonWrapper());
      } else {
        wrapper.appendChild(this.createUpButton());
      }
    }
    insertWrapperAndInput(wrapper) {
      if (this.input.parentElement) {
        this.input.parentElement.insertBefore(wrapper, this.input);
      }
    }
    positionInputWithinWrapper(wrapper) {
      const insertionPoint = this.findInputInsertionPoint(wrapper);
      wrapper.insertBefore(this.input, insertionPoint);
    }
    findInputInsertionPoint(wrapper) {
      if (this.opts.verticalbuttons) {
        return this.findVerticalInsertionPoint(wrapper);
      }
      return this.findHorizontalInsertionPoint(wrapper);
    }
    findVerticalInsertionPoint(wrapper) {
      const prefixEl = wrapper.querySelector(SELECTORS.PREFIX);
      const postfixEl = wrapper.querySelector(SELECTORS.POSTFIX);
      const verticalWrapper = wrapper.querySelector(SELECTORS.VERTICAL_WRAPPER);
      if (prefixEl) return prefixEl.nextSibling;
      if (postfixEl) return postfixEl;
      return verticalWrapper;
    }
    findHorizontalInsertionPoint(wrapper) {
      const prefixEl = wrapper.querySelector(SELECTORS.PREFIX);
      const postfixEl = wrapper.querySelector(SELECTORS.POSTFIX);
      const upButton = wrapper.querySelector(SELECTORS.UP_BUTTON);
      if (prefixEl) return prefixEl.nextSibling;
      if (postfixEl) return postfixEl;
      return upButton;
    }
    insertElementsIntoExistingGroup(existingInputGroup) {
      var _a, _b, _c, _d;
      this.ensureInputInGroup(existingInputGroup);
      if (!this.opts.verticalbuttons) {
        existingInputGroup.insertBefore(this.createDownButton(), this.input);
      }
      if (this.opts.prefix) {
        existingInputGroup.insertBefore(this.createPrefixElement(), this.input);
      }
      if (this.opts.postfix) {
        existingInputGroup.insertBefore(this.createPostfixElement(), this.input.nextSibling);
      }
      if (this.opts.verticalbuttons) {
        const insertionPoint = this.opts.postfix ? (_b = (_a = existingInputGroup.querySelector(SELECTORS.POSTFIX)) == null ? void 0 : _a.nextSibling) != null ? _b : null : this.input.nextSibling;
        existingInputGroup.insertBefore(this.createVerticalButtonWrapper(), insertionPoint);
      } else {
        const insertionPoint = this.opts.postfix ? (_d = (_c = existingInputGroup.querySelector(SELECTORS.POSTFIX)) == null ? void 0 : _c.nextSibling) != null ? _d : null : this.input.nextSibling;
        existingInputGroup.insertBefore(this.createUpButton(), insertionPoint);
      }
    }
    ensureInputInGroup(existingInputGroup) {
      if (this.input.parentElement === existingInputGroup) {
        return;
      }
      existingInputGroup.appendChild(this.input);
    }
    // Element creation helpers
    createButton(type, isVertical = false) {
      const button = document.createElement("button");
      button.type = "button";
      button.tabIndex = this.settings.focusablebuttons ? 0 : -1;
      button.setAttribute("data-touchspin-injected", type);
      button.setAttribute("aria-label", type === "up" ? "Increase value" : "Decrease value");
      const inputTestId = this.input.getAttribute("data-testid");
      if (inputTestId) {
        button.setAttribute("data-testid", `${inputTestId}-${type}`);
      }
      button.className = this.getButtonClass(type, isVertical);
      const rawLabel = this.getButtonSetting(type, isVertical);
      const fallback = this.getButtonFallback(type);
      this.applyButtonLabel(button, rawLabel, fallback);
      return button;
    }
    createUpButton() {
      return this.createButton("up");
    }
    createDownButton() {
      return this.createButton("down");
    }
    createPrefixElement() {
      const element = document.createElement("span");
      element.className = this.buildClasses([
        CSS_CLASSES.INPUT_GROUP_TEXT,
        "bootstrap-touchspin-prefix",
        this.opts.prefix_extraclass
      ]);
      element.setAttribute("data-touchspin-injected", INJECTED_TYPES.PREFIX);
      element.textContent = this.opts.prefix || "";
      const inputTestId = this.input.getAttribute("data-testid");
      if (inputTestId) {
        element.setAttribute("data-testid", `${inputTestId}-prefix`);
      }
      return element;
    }
    createPostfixElement() {
      const element = document.createElement("span");
      element.className = this.buildClasses([
        CSS_CLASSES.INPUT_GROUP_TEXT,
        "bootstrap-touchspin-postfix",
        this.opts.postfix_extraclass
      ]);
      element.setAttribute("data-touchspin-injected", INJECTED_TYPES.POSTFIX);
      element.textContent = this.opts.postfix || "";
      const inputTestId = this.input.getAttribute("data-testid");
      if (inputTestId) {
        element.setAttribute("data-testid", `${inputTestId}-postfix`);
      }
      return element;
    }
    createVerticalButtonWrapper() {
      const wrapper = document.createElement("span");
      wrapper.className = this.buildClasses([
        CSS_CLASSES.INPUT_GROUP_TEXT,
        "bootstrap-touchspin-vertical-button-wrapper"
      ]);
      wrapper.setAttribute("data-touchspin-injected", INJECTED_TYPES.VERTICAL_WRAPPER);
      const buttonContainer = document.createElement("span");
      buttonContainer.className = CSS_CLASSES.BTN_VERTICAL;
      buttonContainer.appendChild(this.createButton("up", true));
      buttonContainer.appendChild(this.createButton("down", true));
      wrapper.appendChild(buttonContainer);
      return wrapper;
    }
    // Utility helpers
    buildClasses(classes) {
      return classes.filter(Boolean).join(" ");
    }
    getButtonClass(type, isVertical = false) {
      const baseClass = type === "up" ? this.opts.buttonup_class || CSS_CLASSES.DEFAULT_BUTTON : this.opts.buttondown_class || CSS_CLASSES.DEFAULT_BUTTON;
      const verticalClass = isVertical && type === "up" ? this.opts.verticalupclass || CSS_CLASSES.DEFAULT_BUTTON : isVertical && type === "down" ? this.opts.verticaldownclass || CSS_CLASSES.DEFAULT_BUTTON : "";
      return this.buildClasses([
        baseClass,
        verticalClass,
        `bootstrap-touchspin-${type}`
      ]);
    }
    getButtonSetting(type, isVertical) {
      return isVertical ? type === "up" ? this.opts.verticalup : this.opts.verticaldown : type === "up" ? this.opts.buttonup_txt : this.opts.buttondown_txt;
    }
    getButtonFallback(type) {
      return type === "up" ? BUTTON_TEXT.UP : BUTTON_TEXT.DOWN;
    }
    detectInputGroupSize() {
      const classList = this.input.className;
      if (classList.includes("form-control-sm")) return "input-group-sm";
      if (classList.includes("form-control-lg")) return "input-group-lg";
      return "";
    }
    findInjectedElement(type) {
      var _a;
      return (_a = this.wrapper) == null ? void 0 : _a.querySelector(`[data-touchspin-injected="${type}"]`);
    }
    // DOM building coordination
    buildAndAttachDOM() {
      this.initializeOptions();
      this.wrapper = this.buildInputGroup();
      this.storeElementReferences(this.wrapper);
      this.attachEventsToButtons();
    }
    storeElementReferences(wrapper) {
      if (!wrapper) return;
      this.prefixEl = wrapper.querySelector(SELECTORS.PREFIX);
      this.postfixEl = wrapper.querySelector(SELECTORS.POSTFIX);
    }
    attachEventsToButtons() {
      if (!this.wrapper) return;
      const upButton = this.wrapper.querySelector(SELECTORS.UP_BUTTON);
      const downButton = this.wrapper.querySelector(SELECTORS.DOWN_BUTTON);
      this.core.attachUpEvents(upButton instanceof HTMLElement ? upButton : null);
      this.core.attachDownEvents(downButton instanceof HTMLElement ? downButton : null);
    }
    // Setting observers
    registerSettingObservers() {
      this.core.observeSetting("prefix", (value) => this.updatePrefix(value));
      this.core.observeSetting("postfix", (value) => this.updatePostfix(value));
      this.core.observeSetting("buttonup_class", (value) => this.updateButtonClass("up", value));
      this.core.observeSetting("buttondown_class", (value) => this.updateButtonClass("down", value));
      this.core.observeSetting("verticalupclass", (value) => this.updateVerticalButtonClass("up", value));
      this.core.observeSetting("verticaldownclass", (value) => this.updateVerticalButtonClass("down", value));
      this.core.observeSetting("verticalup", (value) => this.updateVerticalButtonText("up", value));
      this.core.observeSetting("verticaldown", (value) => this.updateVerticalButtonText("down", value));
      this.core.observeSetting("buttonup_txt", (value) => this.updateButtonText("up", value));
      this.core.observeSetting("buttondown_txt", (value) => this.updateButtonText("down", value));
      this.core.observeSetting("prefix_extraclass", () => this.updatePrefixClasses());
      this.core.observeSetting("postfix_extraclass", () => this.updatePostfixClasses());
      this.core.observeSetting("verticalbuttons", (value) => this.handleVerticalButtonsChange(value));
      this.core.observeSetting("focusablebuttons", (value) => this.updateButtonFocusability(value));
    }
    // Update methods
    updatePrefix(value) {
      if (value && value !== "") {
        if (this.prefixEl) {
          this.prefixEl.textContent = value;
          this.prefixEl.style.display = "";
          this.updatePrefixClasses();
        } else {
          this.rebuildDOM();
        }
      } else if (this.prefixEl) {
        this.rebuildDOM();
      }
    }
    updatePostfix(value) {
      if (value && value !== "") {
        if (this.postfixEl) {
          this.postfixEl.textContent = value;
          this.postfixEl.style.display = "";
          this.updatePostfixClasses();
        } else {
          this.rebuildDOM();
        }
      } else if (this.postfixEl) {
        this.rebuildDOM();
      }
    }
    updateButtonClass(type, className) {
      const button = this.findInjectedElement(type);
      if (button) {
        button.className = this.buildClasses([
          className || CSS_CLASSES.DEFAULT_BUTTON,
          `bootstrap-touchspin-${type}`
        ]);
      }
    }
    updateVerticalButtonClass(type, className) {
      var _a, _b;
      const verticalWrapper = this.findInjectedElement(INJECTED_TYPES.VERTICAL_WRAPPER);
      const button = verticalWrapper == null ? void 0 : verticalWrapper.querySelector(`[data-touchspin-injected="${type}"]`);
      if (button) {
        this.initializeOptions();
        const baseClass = type === "up" ? (_a = this.opts.buttonup_class) != null ? _a : CSS_CLASSES.DEFAULT_BUTTON : (_b = this.opts.buttondown_class) != null ? _b : CSS_CLASSES.DEFAULT_BUTTON;
        button.className = this.buildClasses([
          baseClass,
          className != null ? className : CSS_CLASSES.DEFAULT_BUTTON,
          `bootstrap-touchspin-${type}`
        ]);
      }
    }
    updateVerticalButtonText(type, text) {
      const verticalWrapper = this.findInjectedElement(INJECTED_TYPES.VERTICAL_WRAPPER);
      const button = verticalWrapper ? verticalWrapper.querySelector(`[data-touchspin-injected="${type}"]`) : null;
      if (button) {
        this.initializeOptions();
        const fallback = this.getButtonFallback(type);
        const raw = text != null ? text : this.getButtonSetting(type, true);
        this.applyButtonLabel(button, raw, fallback);
      }
    }
    updateButtonText(type, text) {
      const button = this.findInjectedElement(type);
      if (button) {
        this.initializeOptions();
        const fallback = this.getButtonFallback(type);
        const raw = text != null ? text : this.getButtonSetting(type, false);
        this.applyButtonLabel(button, raw, fallback);
      }
    }
    updatePrefixClasses() {
      if (this.prefixEl) {
        this.initializeOptions();
        this.prefixEl.className = this.buildClasses([
          CSS_CLASSES.INPUT_GROUP_TEXT,
          "bootstrap-touchspin-prefix",
          this.opts.prefix_extraclass
        ]);
      }
    }
    updatePostfixClasses() {
      if (this.postfixEl) {
        this.initializeOptions();
        this.postfixEl.className = this.buildClasses([
          CSS_CLASSES.INPUT_GROUP_TEXT,
          "bootstrap-touchspin-postfix",
          this.opts.postfix_extraclass
        ]);
      }
    }
    updateButtonFocusability(newValue) {
      if (!this.wrapper) return;
      const buttons = this.wrapper.querySelectorAll(`${SELECTORS.UP_BUTTON}, ${SELECTORS.DOWN_BUTTON}`);
      const tabindex = newValue ? "0" : "-1";
      buttons.forEach((button) => {
        button.setAttribute("tabindex", tabindex);
      });
    }
    handleVerticalButtonsChange(_newValue) {
      this.rebuildDOM();
    }
    rebuildDOM() {
      this.removeInjectedElements();
      this.resetStateAfterRemoval();
      this.buildAndAttachDOM();
      if (this.wrapper) {
        this.finalizeWrapperAttributes();
      }
    }
    resetStateAfterRemoval() {
      this.wrapper = null;
      this.prefixEl = null;
      this.postfixEl = null;
    }
    applyButtonLabel(button, raw, fallback) {
      const { value, isHtml } = this.resolveButtonContent(raw, fallback);
      if (isHtml) {
        button.innerHTML = value;
        return;
      }
      button.textContent = value;
    }
    resolveButtonContent(raw, fallback) {
      if (raw === void 0 || raw === null) {
        return { value: fallback, isHtml: false };
      }
      const trimmed = raw.trim();
      if (trimmed === "") {
        return { value: fallback, isHtml: false };
      }
      if (this.containsHtml(trimmed)) {
        return { value: trimmed, isHtml: true };
      }
      const decoded = this.decodeHtml(trimmed);
      if (decoded === void 0 || decoded === "") {
        return { value: fallback, isHtml: false };
      }
      return { value: decoded, isHtml: false };
    }
    containsHtml(value) {
      return /<\/?[a-zA-Z][\s\S]*>/.test(value);
    }
    decodeHtml(value) {
      if (typeof document === "undefined" || !value.includes("&")) return value;
      const parser = document.createElement("textarea");
      parser.innerHTML = value;
      return parser.value;
    }
  };
  var Bootstrap5Renderer_default = Bootstrap5Renderer;

  // src/jquery-touchspin-bs5.ts
  installWithRenderer(Bootstrap5Renderer_default);
})();
//# sourceMappingURL=jquery-touchspin-bs5.js.map
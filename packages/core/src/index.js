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

const DEFAULTS = {
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
  callback_before_calculation: (v) => v,
  callback_after_calculation: (v) => v,
};

const INSTANCE_KEY = '_touchSpinCore';

export class TouchSpinCore {
  /**
   * @param {HTMLInputElement} inputEl
   * @param {Partial<TouchSpinCoreOptions>=} opts
   */
  constructor(inputEl, opts = {}) {
    if (!inputEl || inputEl.nodeName !== 'INPUT') {
      throw new Error('TouchSpinCore requires an <input> element');
    }

    /** @type {HTMLInputElement} */
    this.input = inputEl;
    /** @type {TouchSpinCoreOptions} */
    this.settings = Object.assign({}, DEFAULTS, opts);

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
  _initializeInput() {
    // Set initial value if specified and input is empty
    if (this.settings.initval !== '' && this.input.value === '') {
      this.input.value = this.settings.initval;
    }
    
    // Core always handles these for the input
    this._updateAriaAttributes();
    this._checkValue(false);
  }

  /** Increment once according to step */
  upOnce() {
    if (this.input.disabled || this.input.hasAttribute('readonly')) {
      return;
    }

    const v = this.getValue();
    const next = this._nextValue('up', v);
    const prevNum = v;
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
  downOnce() {
    if (this.input.disabled || this.input.hasAttribute('readonly')) {
      return;
    }

    const v = this.getValue();
    const next = this._nextValue('down', v);
    const prevNum = v;
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
  startUpSpin() { this._startSpin('up'); }

  /** Start decreasing repeatedly (placeholder) */
  startDownSpin() { this._startSpin('down'); }

  /** Stop spinning (placeholder) */
  stopSpin() {
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
  updateSettings(opts) {
    const oldSettings = { ...this.settings };
    const newSettings = opts || {};

    this.settings = Object.assign({}, this.settings, newSettings);

    // If step/min/max changed and step != 1, align bounds to step like the jQuery plugin
    const step = Number(this.settings.step || 1);
    if ((newSettings.step !== undefined || newSettings.min !== undefined || newSettings.max !== undefined) && step !== 1) {
      if (this.settings.max != null) {
        this.settings.max = this._alignToStep(Number(this.settings.max), step, 'down');
      }
      if (this.settings.min != null) {
        this.settings.min = this._alignToStep(Number(this.settings.min), step, 'up');
      }
    }

    // Notify observers of changed settings
    Object.keys(newSettings).forEach(key => {
      if (oldSettings[key] !== newSettings[key]) {
        const observers = this._settingObservers.get(key);
        if (observers) {
          observers.forEach(callback => {
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
    this._checkValue(false);
  }

  /** @returns {number} */
  getValue() {
    let raw = this.input.value;
    if (raw === '' && this.settings.replacementval !== '') {
      raw = this.settings.replacementval;
    }
    if (raw === '') return NaN;
    const before = this.settings.callback_before_calculation || ((v) => v);
    const num = parseFloat(before(String(raw)));
    return isNaN(num) ? NaN : num;
  }

  /**
   * @param {number|string} v
   */
  setValue(v) {
    if (this.input.disabled || this.input.hasAttribute('readonly')) return;
    const parsed = Number(v);
    if (!isFinite(parsed)) return;
    const adjusted = this._applyConstraints(parsed);
    this._setDisplay(adjusted, true);
  }

  /**
   * Initialize DOM event handling by finding elements and attaching listeners.
   * Must be called after the renderer has created the DOM structure.
   */
  initDOMEventHandling() {
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
  registerTeardown(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Teardown callback must be a function');
    }
    this._teardownCallbacks.push(callback);

    // Return unregister function
    return () => {
      const index = this._teardownCallbacks.indexOf(callback);
      if (index > -1) {
        this._teardownCallbacks.splice(index, 1);
      }
    };
  }

  /** Cleanup and destroy the TouchSpin instance */
  destroy() {
    this.stopSpin();

    // Renderer cleans up its added elements
    if (this.renderer && this.renderer.teardown) {
      this.renderer.teardown();
    }

    // Core cleans up input events only
    this._detachDOMEventListeners();

    // Call all registered teardown callbacks (for wrapper cleanup)
    this._teardownCallbacks.forEach(callback => {
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
      on: this.on.bind(this),
      off: this.off.bind(this),
      initDOMEventHandling: this.initDOMEventHandling.bind(this),
      registerTeardown: this.registerTeardown.bind(this),
      attachUpEvents: this.attachUpEvents.bind(this),
      attachDownEvents: this.attachDownEvents.bind(this),
      observeSetting: this.observeSetting.bind(this),
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
      console.warn('TouchSpin: attachUpEvents called with null element');
      return;
    }

    this._upButton = element;
    element.addEventListener('mousedown', this._handleUpMouseDown);
    element.addEventListener('touchstart', this._handleUpMouseDown, {passive: false});
    
    // Update disabled state immediately after attaching
    this._updateButtonDisabledState();
  }

  /**
   * Attach down button events to an element
   * Called by renderers after creating down button
   * @param {HTMLElement|null} element - The element to attach events to
   */
  attachDownEvents(element) {
    if (!element) {
      console.warn('TouchSpin: attachDownEvents called with null element');
      return;
    }

    this._downButton = element;
    element.addEventListener('mousedown', this._handleDownMouseDown);
    element.addEventListener('touchstart', this._handleDownMouseDown, {passive: false});
    
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
  observeSetting(settingName, callback) {
    if (!this._settingObservers.has(settingName)) {
      this._settingObservers.set(settingName, new Set());
    }

    const observers = this._settingObservers.get(settingName);
    observers.add(callback);

    // Return unsubscribe function
    return () => observers.delete(callback);
  }

  // --- Minimal internal emitter API ---
  /**
   * Subscribe to a core event.
   * Events: 'min', 'max', 'startspin', 'startupspin', 'startdownspin', 'stopspin', 'stopupspin', 'stopdownspin'
   * @param {string} event
   * @param {(detail?: any) => void} handler
   */
  on(event, handler) {
    const set = this._events.get(event) || new Set();
    set.add(handler);
    this._events.set(event, set);
    return () => this.off(event, handler);
  }

  /**
   * Unsubscribe from a core event.
   * @param {string} event
   * @param {(detail?: any) => void=} handler
   */
  off(event, handler) {
    const set = this._events.get(event);
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
  emit(event, detail) {
    const set = this._events.get(event);
    if (!set || set.size === 0) return;
    for (const fn of [...set]) {
      try { fn(detail); } catch (_) {}
    }
  }

  /**
   * Internal: start timed spin in a direction with initial step, delay, then interval.
   * @param {'up'|'down'} dir
   */
  _startSpin(dir) {
    if (this.input.disabled || this.input.hasAttribute('readonly')) return;
    // If changing direction, reset counters
    const changed = (!this.spinning || this.direction !== dir);
    if (changed) {
      this.spinning = true;
      this.direction = dir;
      this.spincount = 0;
      // Match jQuery plugin event order: startspin then direction-specific
      this.emit('startspin');
      if (dir === 'up') this.emit('startupspin'); else this.emit('startdownspin');
    }

    // Clear previous timers
    this._clearSpinTimers();
    // Schedule repeat after delay, then at interval (no immediate step; wrapper triggers first step)
    const delay = this.settings.stepintervaldelay || 500;
    const interval = this.settings.stepinterval || 100;
    this._spinDelayTimeout = setTimeout(() => {
      this._spinDelayTimeout = null;
      this._spinIntervalTimer = setInterval(() => {
        if (!this.spinning || this.direction !== dir) return; // safety
        this._spinStep(dir);
      }, interval);
    }, delay);
  }

  _clearSpinTimers() {
    try { if (this._spinDelayTimeout) { clearTimeout(this._spinDelayTimeout); } } catch {}
    try { if (this._spinIntervalTimer) { clearInterval(this._spinIntervalTimer); } } catch {}
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
      const boostat = Math.max(1, parseInt(String(this.settings.boostat || 10), 10));
      const stepUnclamped = Math.pow(2, Math.floor(this.spincount / boostat)) * base;
      const mbs = this.settings.maxboostedstep;
      let step = stepUnclamped;
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
  _valueIfIsNaN() {
    if (typeof this.settings.firstclickvalueifempty === 'number') {
      return this.settings.firstclickvalueifempty;
    }
    const min = (typeof this.settings.min === 'number') ? this.settings.min : 0;
    const max = (typeof this.settings.max === 'number') ? this.settings.max : min;
    return (min + max) / 2;
  }

  /** Apply step divisibility and clamp to min/max. */
  _applyConstraints(v) {
    const aligned = this._forcestepdivisibility(v);
    const min = this.settings.min;
    const max = this.settings.max;
    let clamped = aligned;
    if (min != null && clamped < min) clamped = min;
    if (max != null && clamped > max) clamped = max;
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
    const mode = this.settings.forcestepdivisibility || 'round';
    const step = this.settings.step || 1;
    const dec = this.settings.decimals || 0;
    let out;
    switch (mode) {
      case 'floor':
        out = Math.floor(val / step) * step; break;
      case 'ceil':
        out = Math.ceil(val / step) * step; break;
      case 'none':
        out = val; break;
      case 'round':
      default:
        out = Math.round(val / step) * step; break;
    }
    // Normalize to configured decimals without string pipeline; formatting applies later
    return Number(out.toFixed(dec));
  }

  /** Aligns a value to nearest step boundary using integer arithmetic. */
  _alignToStep(val, step, dir) {
    if (step === 0) return val;
    let k = 1, s = step;
    while (((s * k) % 1) !== 0 && k < 1e6) k *= 10;
    const V = Math.round(val * k);
    const S = Math.round(step * k);
    const r = V % S;
    if (r === 0) return val;
    return (dir === 'down' ? (V - r) : (V + (S - r))) / k;
  }

  /** Format and write to input, optionally emit change if different. */
  _setDisplay(num, mayTriggerChange) {
    const prev = String(this.input.value ?? '');
    const next = this._formatDisplay(num);
    this.input.value = next;
    this._updateAriaAttributes();
    if (mayTriggerChange && prev !== next) {
      // mirror plugin behavior: trigger a native change event
      this.input.dispatchEvent(new Event('change', { bubbles: true }));
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
    if (dir === 'up') this.upOnce(); else this.downOnce();
  }

  /** Sanitize current input value and update display; optionally emits change. */
  _checkValue(mayTriggerChange) {
    const v = this.getValue();
    if (!isFinite(v)) return;
    const adjusted = this._applyConstraints(v);
    this._setDisplay(adjusted, !!mayTriggerChange);
  }

  _updateAriaAttributes() {
    const el = this.input;
    if (el.getAttribute('role') !== 'spinbutton') {
      el.setAttribute('role', 'spinbutton');
    }
    const min = this.settings.min;
    const max = this.settings.max;
    if (min != null) el.setAttribute('aria-valuemin', String(min)); else el.removeAttribute('aria-valuemin');
    if (max != null) el.setAttribute('aria-valuemax', String(max)); else el.removeAttribute('aria-valuemax');
    const raw = el.value;
    const before = this.settings.callback_before_calculation || ((v) => v);
    const num = parseFloat(before(String(raw)));
    if (isFinite(num)) el.setAttribute('aria-valuenow', String(num)); else el.removeAttribute('aria-valuenow');
    el.setAttribute('aria-valuetext', String(raw));
  }

  // --- DOM Event Handling Methods ---

  /**
   * Find and store references to DOM elements using data-touchspin-injected attributes.
   * @private
   */
  _findDOMElements() {
    // Core doesn't need to find buttons - renderers handle button events directly
    // We only need to find the wrapper for potential future use
    let wrapper = this.input.parentElement;
    while (wrapper && !wrapper.hasAttribute('data-touchspin-injected')) {
      wrapper = wrapper.parentElement;
    }
    this._wrapper = wrapper;
  }

  /**
   * Attach DOM event listeners to elements.
   * @private
   */
  _attachDOMEventListeners() {
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
  _detachDOMEventListeners() {
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
  _handleUpMouseDown(e) {
    e.preventDefault();
    this.upOnce();
    this.startUpSpin();
  }

  /**
   * Handle mousedown/touchstart on down button.
   * @private
   */
  _handleDownMouseDown(e) {
    e.preventDefault();
    this.downOnce();
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
   * Intercept change events to prevent wrong values from propagating.
   * @private
   */
  _handleInputChange(e) {
    const currentValue = this.getValue();
    const wouldBeSanitized = this._applyConstraints(currentValue);
    
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
  _handleInputBlur(e) {
    this._checkValue(true);
  }

  /**
   * Handle keydown events on the input element.
   * @private
   */
  _handleKeyDown(e) {
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
        this._checkValue(true);
        break;
    }
  }

  /**
   * Handle keyup events on the input element.
   * @private
   */
  _handleKeyUp(e) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
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
    if (typeof MutationObserver !== 'undefined') {
      this._mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes') {
            if (mutation.attributeName === 'disabled' || mutation.attributeName === 'readonly') {
              this._updateButtonDisabledState();
            }
          }
        });
      });

      this._mutationObserver.observe(this.input, {
        attributes: true,
        attributeFilter: ['disabled', 'readonly']
      });
    }
  }

  /**
   * Update button disabled state based on input disabled/readonly state
   * @private
   */
  _updateButtonDisabledState() {
    const isDisabled = this.input.disabled || this.input.hasAttribute('readonly');
    
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
}

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
 * @returns {TouchSpinCorePublicAPI}
 */
export function TouchSpin(inputEl, opts) {
  // If options provided, initialize/reinitialize
  if (opts !== undefined) {
    // Destroy existing instance if it exists (destroy() removes itself from element)
    if (inputEl[INSTANCE_KEY]) {
      inputEl[INSTANCE_KEY].destroy();
    }

    // Create new instance and store on element
    const core = new TouchSpinCore(inputEl, opts);
    inputEl[INSTANCE_KEY] = core;

    // Initialize DOM event handling
    core.initDOMEventHandling();

    return core.toPublicApi();
  }

  // No options - return existing instance or create with defaults
  if (!inputEl[INSTANCE_KEY]) {
    const core = new TouchSpinCore(inputEl, {});
    inputEl[INSTANCE_KEY] = core;
    core.initDOMEventHandling();
    return core.toPublicApi();
  }

  return inputEl[INSTANCE_KEY].toPublicApi();
}

/**
 * Get existing TouchSpin instance from input element (without creating one).
 * @param {HTMLInputElement} inputEl
 * @returns {TouchSpinCorePublicAPI|null}
 */
export function getTouchSpin(inputEl) {
  return inputEl[INSTANCE_KEY] ? inputEl[INSTANCE_KEY].toPublicApi() : null;
}

/**
 * Create and return a plain public API bound to a new core instance.
 * @param {HTMLInputElement} inputEl
 * @param {Partial<TouchSpinCoreOptions>=} opts
 * @returns {TouchSpinCorePublicAPI}
 * @deprecated Use TouchSpin() instead
 */
export function createPublicApi(inputEl, opts) {
  return TouchSpin(inputEl, opts);
}

/** Event name constants for wrappers to map/bridge. */
export const CORE_EVENTS = Object.freeze({
  MIN: 'min',
  MAX: 'max',
  START_SPIN: 'startspin',
  START_UP: 'startupspin',
  START_DOWN: 'startdownspin',
  STOP_SPIN: 'stopspin',
  STOP_UP: 'stopupspin',
  STOP_DOWN: 'stopdownspin',
});

/**
 * Convenience helper to attach core to an input element.
 * @param {HTMLInputElement} inputEl
 * @param {Partial<TouchSpinCoreOptions>=} opts
 * @returns {TouchSpinCore}
 */
export function attach(inputEl, opts) {
  return new TouchSpinCore(inputEl, opts);
}

export default TouchSpinCore;

// Note: AbstractRenderer is not exported as it's only needed by renderer implementations
// Renderers should import it directly: import AbstractRenderer from '../../../core/src/AbstractRenderer.js';

/*
 *  Bootstrap Touchspin - v4.8.0
 *  A mobile and touch friendly input spinner component for Bootstrap 3, 4 & 5.
 *  https://www.virtuosoft.eu/code/bootstrap-touchspin/
 *
 *  Made by István Ujj-Mészáros
 *  Under MIT License
 */
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
  callback_before_calculation: (v) => v,
  callback_after_calculation: (v) => v,
};

class TouchSpinCore {
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
    this.settings = Object.assign({}, this.settings, opts || {});
    // If step/min/max changed and step != 1, align bounds to step like the jQuery plugin
    const ns = opts || {};
    const step = Number(this.settings.step || 1);
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
  getValue() {
    const raw = this.input.value;
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

  /** Cleanup (placeholder) */
  destroy() {
    this.stopSpin();
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
    };
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
const CORE_EVENTS = Object.freeze({
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
function attach(inputEl, opts) {
  return new TouchSpinCore(inputEl, opts);
}

export { CORE_EVENTS, TouchSpinCore, attach, createPublicApi, TouchSpinCore as default };
//# sourceMappingURL=touchspin.js.map

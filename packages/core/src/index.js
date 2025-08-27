// @ts-check

/**
 * @fileoverview Framework-agnostic core scaffold for TouchSpin.
 * Phase A (A1): minimal public API surface to enable incremental extraction.
 * This is a placeholder; logic will be ported from TouchSpinCore.migrated.js in A2–A7.
 */

/**
 * @typedef {Object} TouchSpinCoreOptions
 * @property {number|null=} min
 * @property {number|null=} max
 * @property {number=} step
 * @property {number=} decimals
 */

const DEFAULTS = {
  min: 0,
  max: 100,
  step: 1,
  decimals: 0,
};

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
    /** @type {boolean} */
    this.spinning = false;
  }

  /** Increment once according to step */
  upOnce() {
    const v = this.getValue();
    const step = this.settings.step || 1;
    const next = (isFinite(v) ? v : 0) + step;
    this.setValue(next);
  }

  /** Decrement once according to step */
  downOnce() {
    const v = this.getValue();
    const step = this.settings.step || 1;
    const next = (isFinite(v) ? v : 0) - step;
    this.setValue(next);
  }

  /** Start increasing repeatedly (placeholder) */
  startUpSpin() {
    this.spinning = true;
  }

  /** Start decreasing repeatedly (placeholder) */
  startDownSpin() {
    this.spinning = true;
  }

  /** Stop spinning (placeholder) */
  stopSpin() {
    this.spinning = false;
  }

  /**
   * @param {Partial<TouchSpinCoreOptions>} opts
   */
  updateSettings(opts) {
    this.settings = Object.assign({}, this.settings, opts || {});
  }

  /** @returns {number} */
  getValue() {
    const raw = this.input.value;
    const num = parseFloat(raw);
    return isNaN(num) ? NaN : num;
  }

  /**
   * @param {number|string} v
   */
  setValue(v) {
    this.input.value = String(v);
  }

  /** Cleanup (placeholder) */
  destroy() {
    this.stopSpin();
  }
}

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


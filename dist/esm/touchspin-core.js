/*
 *  Bootstrap Touchspin - v4.8.0
 *  A mobile and touch friendly input spinner component for Bootstrap 3, 4 & 5.
 *  https://www.virtuosoft.eu/code/bootstrap-touchspin/
 *
 *  Made by István Ujj-Mészáros
 *  Under MIT License
 */
// ESM Core scaffold for TouchSpin
// This file defines a framework-agnostic core class with an instance API.
// It does not wire any jQuery behavior or callable events. The jQuery
// wrapper will bridge legacy events to these methods.

/**
 * @typedef {Object} TouchSpinOptions
 * @property {number} [min]
 * @property {number} [max]
 * @property {number} [step]
 * @property {number} [decimals]
 * @property {string|null} [prefix]
 * @property {string|null} [postfix]
 * @property {boolean} [verticalbuttons]
 */

class TouchSpinCore {
  /**
   * @param {HTMLInputElement} inputEl
   * @param {TouchSpinOptions} [options]
   */
  constructor(inputEl, options = {}) {
    this.input = inputEl;
    this.options = { ...options };
    this._spinning = false;
  }

  /** Initialize behavior and attach needed listeners */
  init() {
    // Placeholder: real implementation will render, attach listeners, and sync state
    return this;
  }

  /** Destroy behavior and cleanup */
  destroy() {
    this._spinning = false;
  }

  /**
   * @param {Partial<TouchSpinOptions>} newOptions
   */
  updateSettings(newOptions) {
    this.options = { ...this.options, ...newOptions };
  }

  upOnce() {
    // Placeholder: compute next value and update
  }

  downOnce() {
    // Placeholder: compute previous value and update
  }

  startUpSpin() {
    this._spinning = true;
  }

  startDownSpin() {
    this._spinning = true;
  }

  stopSpin() {
    this._spinning = false;
  }

  /**
   * @returns {number}
   */
  getValue() {
    const v = parseFloat(this.input.value);
    return Number.isFinite(v) ? v : 0;
  }

  /**
   * @param {number|string} value
   */
  setValue(value) {
    this.input.value = String(value);
  }
}

export { TouchSpinCore, TouchSpinCore as default };
//# sourceMappingURL=touchspin.js.map

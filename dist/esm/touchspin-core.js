var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
class TouchSpinCore {
  /**
   * @param {HTMLInputElement} inputEl
   * @param {TouchSpinOptions} [options]
   */
  constructor(inputEl, options = {}) {
    this.input = inputEl;
    this.options = __spreadValues({}, options);
    this._spinning = false;
  }
  /** Initialize behavior and attach needed listeners */
  init() {
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
    this.options = __spreadValues(__spreadValues({}, this.options), newOptions);
  }
  upOnce() {
  }
  downOnce() {
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
export {
  TouchSpinCore,
  TouchSpinCore as default
};
//# sourceMappingURL=touchspin.js.map

/**
 * Framework-agnostic core for TouchSpin (TypeScript)
 */

export type ForceStepDivisibility = 'none' | 'floor' | 'round' | 'ceil';

export type TouchSpinCalcCallback = (value: string) => string;

export type { TouchSpinUpdateSettingsData } from './events.js';
// Export event types
export { TouchSpinCallableEvent, TouchSpinEmittedEvent } from './events.js';

import type { Renderer, RendererConstructor } from './renderer.js';

type WithCoreElement = HTMLInputElement & { [INSTANCE_KEY]?: TouchSpinCore };

export interface TouchSpinCoreOptions {
  min?: number | null;
  max?: number | null;
  firstclickvalueifempty?: number | null;
  step?: number;
  decimals?: number;
  forcestepdivisibility?: ForceStepDivisibility;
  stepinterval?: number;
  stepintervaldelay?: number;
  booster?: boolean;
  boostat?: number;
  maxboostedstep?: number | false;
  callback_before_calculation?: TouchSpinCalcCallback;
  callback_after_calculation?: TouchSpinCalcCallback;
  // Renderer constructor (e.g., Bootstrap5Renderer) or null for no UI
  renderer?: RendererConstructor | null | undefined;
  initval?: string | number;
  replacementval?: string | number;
  mousewheel?: boolean;
  verticalbuttons?: boolean;
  verticalup?: string;
  verticaldown?: string;
  verticalupclass?: string | null;
  verticaldownclass?: string | null;
  focusablebuttons?: boolean;
  prefix?: string;
  postfix?: string;
  prefix_extraclass?: string;
  postfix_extraclass?: string;
  buttonup_class?: string | null;
  buttondown_class?: string | null;
  buttonup_txt?: string;
  buttondown_txt?: string;
}

const DEFAULTS: Required<Omit<TouchSpinCoreOptions, 'renderer'>> & { renderer: null } = {
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
  verticaldown: '−',
  verticalupclass: null,
  verticaldownclass: null,
  focusablebuttons: false,
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
  buttondown_txt: '&minus;',
  callback_before_calculation: (v) => v,
  callback_after_calculation: (v) => v,
  renderer: null,
};

const INSTANCE_KEY = '_touchSpinCore' as const;

type CoreEventName =
  | 'min'
  | 'max'
  | 'startspin'
  | 'startupspin'
  | 'startdownspin'
  | 'stopspin'
  | 'stopupspin'
  | 'stopdownspin';

export class TouchSpinCore {
  input: HTMLInputElement;
  settings: TouchSpinCoreOptions;
  spinning: boolean;
  spincount: number;
  direction: false | 'up' | 'down';
  private _teardownCallbacks: Array<() => void> = [];
  private _settingObservers: Map<string, Set<(value: unknown, prev?: unknown) => void>> = new Map();
  private _spinDelayTimeout: ReturnType<typeof setTimeout> | null = null;
  private _spinIntervalTimer: ReturnType<typeof setInterval> | null = null;
  private _upButton: (HTMLElement & { disabled?: boolean }) | null = null;
  private _originalAttributes: {
    type: string | null;
    attributes: Map<string, string | null>;
  } | null = null;
  private _downButton: (HTMLElement & { disabled?: boolean }) | null = null;
  private _wrapper: HTMLElement | null = null;
  private _mutationObserver: MutationObserver | null = null;
  renderer?: Renderer;
  /**
   * Sanitize a partial settings object BEFORE applying it.
   * Returns a new object with only provided keys normalized.
   * @param {Partial<TouchSpinCoreOptions>} partial
   * @param {TouchSpinCoreOptions} current
   * @returns {Partial<TouchSpinCoreOptions>}
   */
  static sanitizePartialSettings(
    partial: Partial<TouchSpinCoreOptions>,
    _current: TouchSpinCoreOptions
  ): Partial<TouchSpinCoreOptions> {
    const out = { ...partial };

    if (Object.hasOwn(partial, 'step')) {
      const n = Number(partial.step);
      out.step = Number.isFinite(n) && n > 0 ? n : 1;
    }

    if (Object.hasOwn(partial, 'decimals')) {
      const n = Number(partial.decimals);
      out.decimals = Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
    }

    const hasMin = Object.hasOwn(partial, 'min');
    const hasMax = Object.hasOwn(partial, 'max');
    if (hasMin) {
      if (
        partial.min === null ||
        partial.min === undefined ||
        (typeof partial.min === 'string' && partial.min === '')
      ) {
        out.min = null;
      } else {
        const n = Number(partial.min);
        out.min = Number.isFinite(n) ? n : null;
      }
    }
    if (hasMax) {
      if (
        partial.max === null ||
        partial.max === undefined ||
        (typeof partial.max === 'string' && partial.max === '')
      ) {
        out.max = null;
      } else {
        const n = Number(partial.max);
        out.max = Number.isFinite(n) ? n : null;
      }
    }
    if (
      hasMin &&
      hasMax &&
      out.min != null &&
      out.max != null &&
      typeof out.min === 'number' &&
      typeof out.max === 'number' &&
      out.min > out.max
    ) {
      const tmp = out.min;
      out.min = out.max;
      out.max = tmp;
    }

    if (Object.hasOwn(partial, 'stepinterval')) {
      const n = Number(partial.stepinterval);
      out.stepinterval = Number.isFinite(n) && n >= 0 ? n : DEFAULTS.stepinterval;
    }
    if (Object.hasOwn(partial, 'stepintervaldelay')) {
      const n = Number(partial.stepintervaldelay);
      out.stepintervaldelay = Number.isFinite(n) && n >= 0 ? n : DEFAULTS.stepintervaldelay;
    }

    return out;
  }
  /**
   * @param inputEl The input element
   * @param opts Partial settings
   */
  constructor(inputEl: HTMLInputElement, opts: Partial<TouchSpinCoreOptions> = {}) {
    if (!inputEl || inputEl.nodeName !== 'INPUT') {
      throw new Error('TouchSpinCore requires an <input> element');
    }

    /** @type {HTMLInputElement} */
    this.input = inputEl;

    // Parse data-bts-* attributes
    const dataAttrs = this._parseDataAttributes(inputEl);

    // Allow global default options (e.g., to set a global default renderer or defaults)
    /** @type {Partial<TouchSpinCoreOptions>} */
    const globalDefaults =
      typeof globalThis !== 'undefined' &&
      (globalThis as unknown as { TouchSpinDefaultOptions?: Partial<TouchSpinCoreOptions> })
        .TouchSpinDefaultOptions
        ? TouchSpinCore.sanitizePartialSettings(
            (globalThis as unknown as { TouchSpinDefaultOptions?: Partial<TouchSpinCoreOptions> })
              .TouchSpinDefaultOptions!,
            DEFAULTS
          )
        : {};

    /** @type {TouchSpinCoreOptions} */
    this.settings = Object.assign({}, DEFAULTS, globalDefaults, dataAttrs, opts);
    // Sanitize settings to ensure safe, predictable behavior
    this._sanitizeSettings();

    // Check for renderer: explicit option > global default > none
    if (!this.settings.renderer) {
      // Check for global default renderer
      const g = globalThis as unknown as { TouchSpinDefaultRenderer?: RendererConstructor };
      if (g?.TouchSpinDefaultRenderer) {
        this.settings.renderer = g.TouchSpinDefaultRenderer;
      } else {
        // Allow no renderer for keyboard/wheel-only functionality
        console.warn(
          'TouchSpin: No renderer specified (renderer: null). Only keyboard/wheel events will work. Consider using Bootstrap3/4/5Renderer or TailwindRenderer for UI.'
        );
      }
    }

    /** @type {boolean} */
    this.spinning = false;
    /** @type {number} */
    this.spincount = 0;
    /** @type {false|'up'|'down'} */
    this.direction = false;
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
    this._handleUpKeyDown = this._handleUpKeyDown.bind(this);
    this._handleUpKeyUp = this._handleUpKeyUp.bind(this);
    this._handleDownKeyDown = this._handleDownKeyDown.bind(this);
    this._handleDownKeyUp = this._handleDownKeyUp.bind(this);
    this._handleWindowChangeCapture = this._handleWindowChangeCapture.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._handleKeyUp = this._handleKeyUp.bind(this);
    this._handleWheel = this._handleWheel.bind(this);

    // Core always manages the input element
    this._initializeInput();

    // Initialize renderer with reference to core
    if (this.settings.renderer) {
      const Ctor = this.settings.renderer as unknown as new (
        inputEl: HTMLInputElement,
        settings: Readonly<Record<string, unknown>>,
        core: unknown
      ) => Renderer;
      this.renderer = new Ctor(
        inputEl,
        this.settings as unknown as Readonly<Record<string, unknown>>,
        this
      );
      this.renderer.init();
    }

    // Set up mutation observer to watch for disabled/readonly changes
    this._setupMutationObserver();

    // Finalize wrapper attributes after complete initialization
    //
    // The data-touchspin-injected attribute serves as a marker that the TouchSpin
    // component is fully constructed - DOM is built, event handlers are attached,
    // and mutation observer is active. Tests use this attribute to detect when
    // components are ready for interaction.
    //
    // By setting these attributes as the final initialization step, we prevent race
    // conditions where tests might try to interact with components before their DOM
    // structure, event handlers, or internal monitoring are ready. This is especially
    // important under high CPU load where DOM operations may take longer.
    //
    // Complete initialization sequence:
    // 1. renderer.init() - Constructs DOM and attaches event handlers
    // 2. _setupMutationObserver() - Starts monitoring input attribute changes
    // 3. renderer.finalizeWrapperAttributes() - Marks component as ready:
    //    - Adds data-testid for test element selection
    //    - Adds data-touchspin-injected to signal component is fully ready
    if (this.renderer) {
      this.renderer.finalizeWrapperAttributes();
    }

    this.input.setAttribute('data-touchspin-injected', 'input');
  }

  /**
   * Initialize input element (core always handles this)
   * @private
   */
  _initializeInput(): void {
    // Capture original attributes before TouchSpin modifies anything
    this._captureOriginalAttributes();

    // Set initial value if specified and input is empty
    const initVal = this.settings.initval ?? '';
    if (initVal !== '' && this.input.value === '') {
      this.input.value = String(initVal);
    }

    // Core always handles these for the input
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
  _sanitizeSettings(): void {
    // step
    const stepNum = Number(this.settings.step);
    if (!Number.isFinite(stepNum) || stepNum <= 0) {
      this.settings.step = 1;
    } else {
      this.settings.step = stepNum;
    }

    // decimals
    const decNum = Number(this.settings.decimals);
    if (!Number.isFinite(decNum) || decNum < 0) {
      this.settings.decimals = 0;
    } else {
      this.settings.decimals = Math.floor(decNum);
    }

    // min/max
    // Preserve explicit nulls; coerce other values to numbers or null
    if (
      this.settings.min === null ||
      this.settings.min === undefined ||
      (typeof this.settings.min === 'string' && this.settings.min === '')
    ) {
      this.settings.min = null;
    } else {
      const minNum = Number(this.settings.min);
      this.settings.min = Number.isFinite(minNum) ? minNum : null;
    }
    if (
      this.settings.max === null ||
      this.settings.max === undefined ||
      (typeof this.settings.max === 'string' && this.settings.max === '')
    ) {
      this.settings.max = null;
    } else {
      const maxNum = Number(this.settings.max);
      this.settings.max = Number.isFinite(maxNum) ? maxNum : null;
    }

    // Ensure min <= max when both present
    if (
      this.settings.min !== null &&
      this.settings.max !== null &&
      this.settings.min > this.settings.max
    ) {
      // Swap to maintain logical bounds
      const tmp = this.settings.min;
      this.settings.min = this.settings.max;
      this.settings.max = tmp;
    }

    // stepinterval
    const si = Number(this.settings.stepinterval);
    if (!Number.isFinite(si) || si < 0) this.settings.stepinterval = DEFAULTS.stepinterval;

    // stepintervaldelay
    const sid = Number(this.settings.stepintervaldelay);
    if (!Number.isFinite(sid) || sid < 0)
      this.settings.stepintervaldelay = DEFAULTS.stepintervaldelay;

    // Validate callbacks and handle input type conversion if needed
    this._validateCallbacks();

    // Check for callback pairing and warn if needed
    this._checkCallbackPairing();
  }

  /**
   * Validate callbacks and automatically convert number inputs to text inputs
   * when formatting callbacks that add non-numeric characters are detected.
   * @private
   */
  _validateCallbacks(): void {
    // Only validate for number inputs
    const currentType = this.input.getAttribute('type');
    if (currentType !== 'number') return;

    // Only check if callbacks are set (not default)
    const defaultCallback = (v: string) => v;
    if (
      !this.settings.callback_after_calculation ||
      this.settings.callback_after_calculation.toString() === defaultCallback.toString()
    )
      return;

    // Test the callback with a sample value
    const testValue = '123.45';
    const afterResult = this.settings.callback_after_calculation(testValue);

    // Check if result contains non-numeric characters
    // Allow: optional minus, digits, optional decimal point and digits
    if (!/^-?\d*\.?\d*$/.test(afterResult)) {
      console.warn(
        'TouchSpin: Detected formatting callback that adds non-numeric characters. ' +
          'Converting input from type="number" to type="text" to support formatting like "' +
          afterResult +
          '". ' +
          'This ensures compatibility with custom formatting while maintaining full TouchSpin functionality. ' +
          'The original type will be restored when TouchSpin is destroyed.'
      );

      // Capture original attributes before making any changes
      this._captureOriginalAttributes();

      // Convert input type to text to support formatting
      this.input.setAttribute('type', 'text');

      // Remove number-specific native attributes since they only work on number inputs
      this.input.removeAttribute('min');
      this.input.removeAttribute('max');
      this.input.removeAttribute('step');
    }
  }

  /**
   * Capture the original attributes of the input before TouchSpin modifies them.
   * This ensures complete transparency - the input can be restored to its exact original state.
   * @private
   */
  _captureOriginalAttributes(): void {
    if (this._originalAttributes !== null) return; // Already captured

    const attributesToTrack = [
      'role',
      'aria-valuemin',
      'aria-valuemax',
      'aria-valuenow',
      'aria-valuetext',
      'min',
      'max',
      'step',
    ];

    this._originalAttributes = {
      type: this.input.getAttribute('type'),
      attributes: new Map(),
    };

    // Store original values (null if attribute didn't exist)
    attributesToTrack.forEach((attr) => {
      this._originalAttributes?.attributes.set(attr, this.input.getAttribute(attr));
    });
  }

  /**
   * Restore the input to its original state by restoring all original attributes.
   * This ensures complete transparency - the input returns to its exact original state.
   * @private
   */
  _restoreOriginalAttributes(): void {
    if (this._originalAttributes === null) return; // Nothing to restore

    // Strip formatting from value if converting back to number
    const currentValue = this.input.value;
    if (
      currentValue &&
      this.settings.callback_before_calculation &&
      this._originalAttributes.type === 'number' &&
      this.input.getAttribute('type') === 'text'
    ) {
      const numericValue = this.settings.callback_before_calculation(currentValue);
      this.input.value = numericValue;
    }

    // Restore original type
    if (this._originalAttributes.type) {
      this.input.setAttribute('type', this._originalAttributes.type);
    }

    // Restore all original attributes
    this._originalAttributes.attributes.forEach((originalValue, attrName) => {
      if (originalValue === null) {
        // Attribute didn't exist originally, remove it
        this.input.removeAttribute(attrName);
      } else {
        // Restore original value
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
  _parseDataAttributes(inputEl: HTMLInputElement): Partial<TouchSpinCoreOptions> {
    const attributeMap: Partial<Record<keyof TouchSpinCoreOptions, string>> = {
      min: 'min',
      max: 'max',
      initval: 'init-val',
      replacementval: 'replacement-val',
      firstclickvalueifempty: 'first-click-value-if-empty',
      step: 'step',
      decimals: 'decimals',
      stepinterval: 'step-interval',
      verticalbuttons: 'vertical-buttons',
      verticalup: 'vertical-up',
      verticaldown: 'vertical-down',
      verticalupclass: 'vertical-up-class',
      verticaldownclass: 'vertical-down-class',
      forcestepdivisibility: 'force-step-divisibility',
      stepintervaldelay: 'step-interval-delay',
      prefix: 'prefix',
      postfix: 'postfix',
      prefix_extraclass: 'prefix-extra-class',
      postfix_extraclass: 'postfix-extra-class',
      booster: 'booster',
      boostat: 'boostat',
      maxboostedstep: 'max-boosted-step',
      mousewheel: 'mouse-wheel',
      buttondown_class: 'button-down-class',
      buttonup_class: 'button-up-class',
      buttondown_txt: 'button-down-txt',
      buttonup_txt: 'button-up-txt',
    };

    const parsed: Partial<TouchSpinCoreOptions> = {};

    // Parse data-bts-* attributes
    for (const [optionName, attrName] of Object.entries(attributeMap) as Array<
      [keyof TouchSpinCoreOptions, string]
    >) {
      const fullAttrName = `data-bts-${attrName}`;
      if (inputEl.hasAttribute(fullAttrName)) {
        const rawValue = inputEl.getAttribute(fullAttrName);
        // Assign strongly typed value

        // @ts-expect-error - narrow via optionName switch
        parsed[optionName] = this._coerceAttributeValue(optionName as string, rawValue ?? '');
      }
    }

    // Also handle native attributes with precedence (warn if both specified)
    for (const nativeAttr of ['min', 'max', 'step']) {
      if (inputEl.hasAttribute(nativeAttr)) {
        const rawValue = inputEl.getAttribute(nativeAttr);
        if ((parsed as Record<string, unknown>)[nativeAttr] !== undefined) {
          console.warn(
            `Both "data-bts-${nativeAttr}" and "${nativeAttr}" attributes specified. Native attribute takes precedence.`,
            inputEl
          );
        }

        // @ts-expect-error
        parsed[nativeAttr as keyof TouchSpinCoreOptions] = this._coerceAttributeValue(
          nativeAttr,
          rawValue ?? ''
        );
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
  _coerceAttributeValue(optionName: string, rawValue: string) {
    if (rawValue === null || rawValue === undefined) {
      return rawValue;
    }

    // Boolean attributes
    if (['booster', 'mousewheel', 'verticalbuttons', 'focusablebuttons'].includes(optionName)) {
      return rawValue === 'true' || rawValue === '' || rawValue === optionName;
    }

    // Numeric attributes
    if (
      [
        'min',
        'max',
        'step',
        'decimals',
        'stepinterval',
        'stepintervaldelay',
        'boostat',
        'maxboostedstep',
        'firstclickvalueifempty',
      ].includes(optionName)
    ) {
      const num = parseFloat(rawValue);
      return Number.isNaN(num) ? rawValue : num;
    }

    // String attributes - return as-is
    return rawValue;
  }

  /** Increment once according to step */
  upOnce(): void {
    if (this.input.disabled || this.input.hasAttribute('readonly')) {
      return;
    }

    const v = this.getValue();
    const next = this._nextValue('up', v);

    // Check if already at max boundary before incrementing
    if (this.settings.max !== null && v === this.settings.max) {
      this.emit('max'); // Emit event for feedback
      if (this.spinning && this.direction === 'up') {
        this.stopSpin();
      }
      return;
    }

    // Fire max event BEFORE setting display if we're reaching max
    if (this.settings.max !== null && next === this.settings.max) {
      this.emit('max');
      if (this.spinning && this.direction === 'up') {
        this.stopSpin();
      }
    }

    this._setDisplay(next, true);
  }

  /** Decrement once according to step */
  downOnce(): void {
    if (this.input.disabled || this.input.hasAttribute('readonly')) {
      return;
    }

    const v = this.getValue();
    const next = this._nextValue('down', v);

    // Check if already at min boundary before decrementing
    if (this.settings.min !== null && v === this.settings.min) {
      this.emit('min'); // Emit event for feedback
      if (this.spinning && this.direction === 'down') {
        this.stopSpin();
      }
      return;
    }

    // Fire min event BEFORE setting display if we're reaching min
    if (this.settings.min !== null && next === this.settings.min) {
      this.emit('min');
      if (this.spinning && this.direction === 'down') {
        this.stopSpin();
      }
    }

    this._setDisplay(next, true);
  }

  /** Start increasing repeatedly; no immediate step here. */
  startUpSpin(): void {
    this._startSpin('up');
  }

  /** Start decreasing repeatedly; no immediate step here. */
  startDownSpin(): void {
    this._startSpin('down');
  }

  /** Stop spinning (placeholder) */
  stopSpin(): void {
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

  updateSettings(opts: Partial<TouchSpinCoreOptions>): void {
    const oldSettings = { ...this.settings };
    const newSettings = opts || {};

    // Sanitize the incoming partial BEFORE merge
    const sanitizedPartial = TouchSpinCore.sanitizePartialSettings(newSettings, oldSettings);

    // Apply incoming changes (sanitized) first
    Object.assign(this.settings, sanitizedPartial);
    // Extra safety: sanitize full settings after merge
    this._sanitizeSettings();

    // If step/min/max changed and step != 1, align bounds to step like the jQuery plugin
    const step = Number(this.settings.step || 1);
    if (
      (sanitizedPartial.step !== undefined ||
        sanitizedPartial.min !== undefined ||
        sanitizedPartial.max !== undefined) &&
      step !== 1
    ) {
      if (this.settings.max !== null) {
        this.settings.max = this._alignToStep(Number(this.settings.max), step, 'down');
      }
      if (this.settings.min !== null) {
        this.settings.min = this._alignToStep(Number(this.settings.min), step, 'up');
      }
    }

    // Notify observers of keys whose EFFECTIVE values changed after sanitization
    (Object.keys(this.settings) as Array<keyof TouchSpinCoreOptions>).forEach((key) => {
      if (oldSettings[key] !== this.settings[key]) {
        const observers = this._settingObservers.get(String(key));
        if (observers) {
          observers.forEach((callback) => {
            try {
              callback(this.settings[key] as unknown, oldSettings[key] as unknown);
            } catch (error) {
              console.error('TouchSpin: Error in setting observer callback:', error);
            }
          });
        }
      }
    });

    // Core handles its own setting changes
    this._updateAriaAttributes();
    this._syncNativeAttributes();
    this._checkValue(true); // Emit change events when updateSettings clamps values

    // Check for callback pairing and warn if needed
    this._checkCallbackPairing();
  }

  getValue(): number {
    let raw = this.input.value;
    const repl = this.settings.replacementval ?? '';
    if (raw === '' && repl !== '') {
      raw = String(repl);
    }
    if (raw === '') return NaN;
    const before = this.settings.callback_before_calculation || ((v) => v);
    const num = parseFloat(before(String(raw)));
    return Number.isNaN(num) ? NaN : num;
  }

  setValue(v: number | string): void {
    if (this.input.disabled || this.input.hasAttribute('readonly')) return;
    const parsed = Number(v);
    if (!Number.isFinite(parsed)) return;
    const adjusted = this._applyConstraints(parsed);
    const wasSanitized = parsed !== adjusted;
    this._setDisplay(adjusted, true, wasSanitized, true);
  }

  /**
   * Initialize DOM event handling by finding elements and attaching listeners.
   * Must be called after the renderer has created the DOM structure.
   */
  initDOMEventHandling(): void {
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
  registerTeardown(callback: () => void): () => void {
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
  destroy(): void {
    // Remove the data-touchspin-injected attribute first to signal plugin is no longer ready
    this.input.removeAttribute('data-touchspin-injected');

    this.stopSpin();

    // Renderer cleans up its added elements
    if (this.renderer?.teardown) {
      this.renderer.teardown();
    }

    // Core cleans up input events only
    this._detachDOMEventListeners();

    // Call all registered teardown callbacks (for wrapper cleanup)
    this._teardownCallbacks.forEach((callback) => {
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

    // Restore all original attributes
    this._restoreOriginalAttributes();

    // Remove instance from element (type-safe guard)
    type WithCore = HTMLInputElement & { [INSTANCE_KEY]?: TouchSpinCore };
    const inst = (this.input as WithCore)[INSTANCE_KEY];
    if (inst && inst === this) {
      delete (this.input as WithCore)[INSTANCE_KEY];
    }
  }

  /**
   * Create a plain public API object with bound methods for wrappers.
   * @returns {TouchSpinCorePublicAPI}
   */
  toPublicApi(): TouchSpinCorePublicAPI {
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
      observeSetting: this.observeSetting.bind(this),
    };
  }

  // --- Renderer Event Attachment Methods ---
  /**
   * Attach up button events to an element
   * Called by renderers after creating up button
   * @param {HTMLElement|null} element - The element to attach events to
   */
  attachUpEvents(element: HTMLElement | null): void {
    if (!element) {
      console.warn('TouchSpin: attachUpEvents called with null element');
      return;
    }

    this._upButton = element;
    element.addEventListener('mousedown', this._handleUpMouseDown);
    element.addEventListener('touchstart', this._handleUpMouseDown, { passive: false });

    // Add keyboard event listeners if focusable buttons are enabled
    if (this.settings.focusablebuttons) {
      element.addEventListener('keydown', this._handleUpKeyDown);
      element.addEventListener('keyup', this._handleUpKeyUp);
    }

    // Update disabled state immediately after attaching
    this._updateButtonDisabledState();
  }

  /**
   * Attach down button events to an element
   * Called by renderers after creating down button
   * @param {HTMLElement|null} element - The element to attach events to
   */
  attachDownEvents(element: HTMLElement | null): void {
    if (!element) {
      console.warn('TouchSpin: attachDownEvents called with null element');
      return;
    }

    this._downButton = element;
    element.addEventListener('mousedown', this._handleDownMouseDown);
    element.addEventListener('touchstart', this._handleDownMouseDown, { passive: false });

    // Add keyboard event listeners if focusable buttons are enabled
    if (this.settings.focusablebuttons) {
      element.addEventListener('keydown', this._handleDownKeyDown);
      element.addEventListener('keyup', this._handleDownKeyUp);
    }

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
  observeSetting<K extends keyof TouchSpinCoreOptions>(
    settingName: K,
    callback: (
      newValue: NonNullable<TouchSpinCoreOptions[K]>,
      oldValue?: TouchSpinCoreOptions[K]
    ) => void
  ): () => void {
    const key = String(settingName);
    if (!this._settingObservers.has(key)) {
      this._settingObservers.set(key, new Set());
    }

    const observers = this._settingObservers.get(key)!;
    observers.add(callback as (value: unknown, prev?: unknown) => void);

    // Return unsubscribe function
    return () => observers.delete(callback as (value: unknown, prev?: unknown) => void);
  }

  // --- Minimal internal emitter API ---

  /**
   * Emit a core event as DOM CustomEvent (matching original jQuery plugin behavior)
   * TODO: Consider making some events cancelable (e.g., startspin) for user control
   * @param {string} event
   * @param {any=} detail - Currently unused, kept for future extensibility
   */
  emit(event: CoreEventName, detail?: unknown): void {
    const domEventName = `touchspin.on.${event}`;
    const customEvent = new CustomEvent(domEventName, {
      detail,
      bubbles: true,
      // cancelable: false (default) - no cancellation logic implemented yet
    });
    this.input.dispatchEvent(customEvent);
  }

  /**
   * Internal: start timed spin in a direction with initial step, delay, then interval.
   * @param {'up'|'down'} dir
   */
  _startSpin(dir: 'up' | 'down'): void {
    if (this.input.disabled || this.input.hasAttribute('readonly')) return;

    // Check if ALREADY at boundary before starting spin
    // Emit min/max event as feedback, but don't start spinning
    const currentValue = this.getValue();
    if (dir === 'up' && this.settings.max !== null && currentValue === this.settings.max) {
      this.emit('max');
      return;
    }
    if (dir === 'down' && this.settings.min !== null && currentValue === this.settings.min) {
      this.emit('min');
      return;
    }

    // If already spinning in the same direction, do nothing (idempotent)
    if (this.spinning && this.direction === dir) {
      return;
    }
    // If switching direction while spinning, stop first
    if (this.spinning && this.direction !== dir) {
      this.stopSpin();
    }

    // Emit start events BEFORE the immediate step to get correct event order
    // (start events → change event from step → stop events)
    const direction_changed = !this.spinning || this.direction !== dir;
    if (direction_changed) {
      this.spinning = true;
      this.direction = dir;
      this.spincount = 0;
      // Match jQuery plugin event order: startspin then direction-specific
      this.emit('startspin');
      if (dir === 'up') this.emit('startupspin');
      else this.emit('startdownspin');
    }

    // Perform an immediate single step after emitting start events (parity with jQuery plugin UX)
    if (dir === 'up') this.upOnce();
    else this.downOnce();

    // If we reached a boundary after the initial step, don't start continuous spin
    const v = this.getValue();
    if (dir === 'up' && this.settings.max !== null && v === this.settings.max) {
      return;
    }
    if (dir === 'down' && this.settings.min !== null && v === this.settings.min) {
      return;
    }

    // Clear previous timers
    this._clearSpinTimers();
    // Schedule repeat after delay, then at interval
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

  _clearSpinTimers(): void {
    try {
      if (this._spinDelayTimeout) {
        clearTimeout(this._spinDelayTimeout);
      }
    } catch {
      // Ignore timer cleanup errors
    }
    try {
      if (this._spinIntervalTimer) {
        clearInterval(this._spinIntervalTimer);
      }
    } catch {
      // Ignore timer cleanup errors
    }
    this._spinDelayTimeout = null;
    this._spinIntervalTimer = null;
  }

  /**
   * Compute the next numeric value for a direction, respecting step, booster and bounds.
   * @param {'up'|'down'} dir
   * @param {number} current
   */
  _nextValue(dir: 'up' | 'down', current: number): number {
    let v = current;
    if (Number.isNaN(v)) {
      v = this._valueIfIsNaN();
    } else {
      const base = this.settings.step || 1;
      const mbs = this.settings.maxboostedstep;
      let stepCandidate = base;
      // Apply booster only if enabled
      if (this.settings.booster) {
        const boostat = Math.max(1, parseInt(String(this.settings.boostat || 10), 10));
        stepCandidate = 2 ** Math.floor(this.spincount / boostat) * base;
      }
      let step = stepCandidate;
      if (mbs && Number.isFinite(mbs) && stepCandidate > Number(mbs)) {
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
  _valueIfIsNaN(): number {
    if (typeof this.settings.firstclickvalueifempty === 'number') {
      return this.settings.firstclickvalueifempty;
    }
    const min = typeof this.settings.min === 'number' ? this.settings.min : 0;
    const max = typeof this.settings.max === 'number' ? this.settings.max : min;
    return (min + max) / 2;
  }

  /** Apply step divisibility and clamp to min/max. */
  _applyConstraints(v: number): number {
    const aligned = this._forcestepdivisibility(v);
    const min = this.settings.min ?? null;
    const max = this.settings.max ?? null;
    let clamped = aligned;
    if (typeof min === 'number' && clamped < min) clamped = min;
    if (typeof max === 'number' && clamped > max) clamped = max;
    return clamped;
  }

  /** Determine the effective step with booster if enabled. */
  _getBoostedStep(): number {
    const base = this.settings.step || 1;
    if (!this.settings.booster) return base;
    const boostat = Math.max(1, parseInt(String(this.settings.boostat || 10), 10));
    let boosted = 2 ** Math.floor(this.spincount / boostat) * base;
    const mbs = this.settings.maxboostedstep;
    if (mbs && Number.isFinite(mbs)) {
      const cap = Number(mbs);
      if (boosted > cap) boosted = cap;
    }
    return Math.max(base, boosted);
  }

  /** Aligns value to step per forcestepdivisibility. */
  _forcestepdivisibility(val: number): number {
    const mode = this.settings.forcestepdivisibility || 'round';
    const step = this.settings.step || 1;
    const dec = this.settings.decimals || 0;
    let out;
    switch (mode) {
      case 'floor':
        out = Math.floor(val / step) * step;
        break;
      case 'ceil':
        out = Math.ceil(val / step) * step;
        break;
      case 'none':
        out = val;
        break;
      default:
        out = Math.round(val / step) * step;
        break;
    }
    const result = Number(out.toFixed(dec));
    // Normalize to configured decimals without string pipeline; formatting applies later
    return result;
  }

  /** Aligns a value to nearest step boundary using integer arithmetic. */
  _alignToStep(val: number, step: number, dir: 'up' | 'down'): number {
    if (step === 0) return val;
    let k = 1;
    const s = step;
    while ((s * k) % 1 !== 0 && k < 1e6) k *= 10;
    const V = Math.round(val * k);
    const S = Math.round(step * k);
    const r = V % S;
    if (r === 0) return val;
    return (dir === 'down' ? V - r : V + (S - r)) / k;
  }

  /** Format and write to input, optionally emit change if different. */
  _setDisplay(
    num: number,
    mayTriggerChange: boolean,
    forceTrigger: boolean = false,
    onlyTriggerIfSanitized: boolean = false
  ): string {
    const prev = String(this.input.value ?? '');
    const next = this._formatDisplay(num);
    this.input.value = next;
    this._updateAriaAttributes();

    // Emit change based on context:
    // - For programmatic setValue: only if sanitized (forceTrigger)
    // - For user interactions: if sanitized OR display changed
    if (
      mayTriggerChange &&
      (onlyTriggerIfSanitized ? forceTrigger : forceTrigger || prev !== next)
    ) {
      // mirror plugin behavior: trigger a native change event
      this.input.dispatchEvent(new Event('change', { bubbles: true }));
    }
    return next;
  }

  _formatDisplay(num: number): string {
    const dec = this.settings.decimals || 0;
    const after = this.settings.callback_after_calculation || ((v) => v);
    const s = Number(num).toFixed(dec);
    return after(s);
  }

  /**
   * Perform one spin step in a direction while tracking spincount for booster.
   * @param {'up'|'down'} dir
   */
  _spinStep(dir: 'up' | 'down'): void {
    this.spincount++;
    if (dir === 'up') this.upOnce();
    else this.downOnce();
  }

  /** Sanitize current input value and update display; optionally emits change. */
  _checkValue(mayTriggerChange: boolean): void {
    const v = this.getValue();
    if (!Number.isFinite(v)) return;
    const adjusted = this._applyConstraints(v);
    const wasSanitized = v !== adjusted;
    this._setDisplay(adjusted, !!mayTriggerChange, wasSanitized);
  }

  _updateAriaAttributes(): void {
    const el = this.input;
    if (el.getAttribute('role') !== 'spinbutton') {
      el.setAttribute('role', 'spinbutton');
    }
    const min = this.settings.min ?? null;
    const max = this.settings.max ?? null;
    if (typeof min === 'number') el.setAttribute('aria-valuemin', String(min));
    else el.removeAttribute('aria-valuemin');
    if (typeof max === 'number') el.setAttribute('aria-valuemax', String(max));
    else el.removeAttribute('aria-valuemax');
    const raw = el.value;
    const before = this.settings.callback_before_calculation || ((v) => v);
    const num = parseFloat(before(String(raw)));
    if (Number.isFinite(num)) el.setAttribute('aria-valuenow', String(num));
    else el.removeAttribute('aria-valuenow');
    el.setAttribute('aria-valuetext', String(raw));
  }

  /**
   * Synchronize TouchSpin settings to native input attributes.
   * Only applies to type="number" inputs to maintain browser consistency.
   * @private
   */
  _syncNativeAttributes(): void {
    // Only set native attributes on number inputs
    if (this.input.getAttribute('type') === 'number') {
      // Sync min attribute
      const min = this.settings.min ?? null;
      if (typeof min === 'number' && Number.isFinite(min)) {
        this.input.setAttribute('min', String(min));
      } else {
        this.input.removeAttribute('min');
      }

      // Sync max attribute
      const max = this.settings.max ?? null;
      if (typeof max === 'number' && Number.isFinite(max)) {
        this.input.setAttribute('max', String(max));
      } else {
        this.input.removeAttribute('max');
      }

      // Sync step attribute
      const step = this.settings.step;
      if (typeof step === 'number' && Number.isFinite(step) && step > 0) {
        this.input.setAttribute('step', String(step));
      } else {
        this.input.removeAttribute('step');
      }
    }
  }

  /**
   * Update TouchSpin settings from native attribute changes.
   * Called by mutation observer when min/max/step attributes change.
   * @private
   */
  _syncSettingsFromNativeAttributes(): void {
    const nativeMin = this.input.getAttribute('min');
    const nativeMax = this.input.getAttribute('max');
    const nativeStep = this.input.getAttribute('step');
    let needsUpdate = false;
    const newSettings: Partial<TouchSpinCoreOptions> = {};

    // Check min attribute
    if (nativeMin !== null) {
      const parsedMin = nativeMin === '' ? null : parseFloat(nativeMin);
      const minNum = parsedMin !== null && Number.isFinite(parsedMin) ? parsedMin : null;
      if (minNum !== this.settings.min) {
        newSettings.min = minNum;
        needsUpdate = true;
      }
    } else if (this.settings.min !== null) {
      // Attribute was removed
      newSettings.min = null;
      needsUpdate = true;
    }

    // Check max attribute
    if (nativeMax !== null) {
      const parsedMax = nativeMax === '' ? null : parseFloat(nativeMax);
      const maxNum = parsedMax !== null && Number.isFinite(parsedMax) ? parsedMax : null;
      if (maxNum !== this.settings.max) {
        newSettings.max = maxNum;
        needsUpdate = true;
      }
    } else if (this.settings.max !== null) {
      // Attribute was removed
      newSettings.max = null;
      needsUpdate = true;
    }

    // Check step attribute
    if (nativeStep !== null) {
      const parsedStep = nativeStep === '' ? undefined : parseFloat(nativeStep);
      const stepNum: number | undefined =
        parsedStep !== undefined && Number.isFinite(parsedStep) && parsedStep > 0
          ? parsedStep
          : undefined;
      if (stepNum !== this.settings.step) {
        newSettings.step = stepNum ?? 1;
        needsUpdate = true;
      }
    } else if (this.settings.step !== 1) {
      // Attribute was removed, reset to default
      newSettings.step = 1;
      needsUpdate = true;
    }

    // Apply updates if needed
    if (needsUpdate) {
      this.updateSettings(newSettings);
    }
  }

  // --- DOM Event Handling Methods ---

  /**
   * Find and store references to DOM elements using data-touchspin-injected attributes.
   * @private
   */
  _findDOMElements(): void {
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
  _attachDOMEventListeners(): void {
    // Core should NOT attach button events - renderers handle that via attachUpEvents/attachDownEvents

    // Global mouseup/touchend to stop spinning
    document.addEventListener('mouseup', this._handleMouseUp);
    document.addEventListener('mouseleave', this._handleMouseUp);
    document.addEventListener('touchend', this._handleMouseUp);
    window.addEventListener('change', this._handleWindowChangeCapture, true);

    // Input events (always attach these - they work without renderer UI)
    this.input.addEventListener('keydown', this._handleKeyDown);
    this.input.addEventListener('keyup', this._handleKeyUp);
    this.input.addEventListener('wheel', this._handleWheel);
  }

  /**
   * Remove DOM event listeners.
   * @private
   */
  _detachDOMEventListeners(): void {
    // Core does not manage button events - renderers handle their own cleanup

    // Global events
    document.removeEventListener('mouseup', this._handleMouseUp);
    document.removeEventListener('mouseleave', this._handleMouseUp);
    document.removeEventListener('touchend', this._handleMouseUp);
    window.removeEventListener('change', this._handleWindowChangeCapture, true);

    // Input events
    this.input.removeEventListener('keydown', this._handleKeyDown);
    this.input.removeEventListener('keyup', this._handleKeyUp);
    this.input.removeEventListener('wheel', this._handleWheel);
  }

  // --- DOM Event Handlers ---

  /**
   * Handle mousedown/touchstart on up button.
   * @private
   */
  _handleUpMouseDown(e: MouseEvent | TouchEvent): void {
    e.preventDefault();
    this.startUpSpin();
  }

  /**
   * Handle mousedown/touchstart on down button.
   * @private
   */
  _handleDownMouseDown(e: MouseEvent | TouchEvent): void {
    e.preventDefault();
    this.startDownSpin();
  }

  /**
   * Handle mouseup/touchend/mouseleave to stop spinning.
   * @private
   */
  _handleMouseUp(_e: MouseEvent | TouchEvent): void {
    this.stopSpin();
  }

  /**
   * Handle keydown events on up button.
   * @private
   */
  _handleUpKeyDown(e: KeyboardEvent): void {
    // Only handle Enter and Space keys
    if (e.keyCode === 13 || e.keyCode === 32) {
      // Enter or Space
      e.preventDefault();
      // Ignore auto-repeat while holding the key
      if (e.repeat) return;
      this.startUpSpin();
    }
  }

  /**
   * Handle keyup events on up button.
   * @private
   */
  _handleUpKeyUp(e: KeyboardEvent): void {
    // Only handle Enter and Space keys
    if (e.keyCode === 13 || e.keyCode === 32) {
      // Enter or Space
      this.stopSpin();
    }
  }

  /**
   * Handle keydown events on down button.
   * @private
   */
  _handleDownKeyDown(e: KeyboardEvent): void {
    // Only handle Enter and Space keys
    if (e.keyCode === 13 || e.keyCode === 32) {
      // Enter or Space
      e.preventDefault();
      // Ignore auto-repeat while holding the key
      if (e.repeat) return;
      this.startDownSpin();
    }
  }

  /**
   * Handle keyup events on down button.
   * @private
   */
  _handleDownKeyUp(e: KeyboardEvent): void {
    // Only handle Enter and Space keys
    if (e.keyCode === 13 || e.keyCode === 32) {
      // Enter or Space
      this.stopSpin();
    }
  }

  /**
   * Sanitize value before other capture listeners observe unsanitized input.
   * @private
   */
  _handleWindowChangeCapture(e: Event): void {
    const target = e.target as HTMLInputElement | null;
    if (!target || target !== this.input) return;
    const currentValue = this.getValue();
    if (!Number.isFinite(currentValue)) return;
    const sanitized = this._applyConstraints(currentValue);
    if (sanitized !== currentValue) {
      this._setDisplay(sanitized, false);
    }
  }

  /**
   * Handle keydown events on the input element.
   * @private
   */
  _handleKeyDown(e: KeyboardEvent): void {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (e.repeat) return; // ignore auto-repeat
        this.startUpSpin();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (e.repeat) return; // ignore auto-repeat
        this.startDownSpin();
        break;
      case 'Enter':
        this._checkValue(false);
        break;
    }
  }

  /**
   * Handle keyup events on the input element.
   * @private
   */
  _handleKeyUp(e: KeyboardEvent): void {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      this.stopSpin();
    }
  }

  /**
   * Handle wheel events on the input element.
   * @private
   */
  _handleWheel(e: WheelEvent): void {
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
  _setupMutationObserver(): void {
    if (typeof MutationObserver !== 'undefined') {
      this._mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes') {
            if (mutation.attributeName === 'disabled' || mutation.attributeName === 'readonly') {
              this._updateButtonDisabledState();
            } else if (
              mutation.attributeName === 'min' ||
              mutation.attributeName === 'max' ||
              mutation.attributeName === 'step'
            ) {
              this._syncSettingsFromNativeAttributes();
            }
          }
        });
      });

      this._mutationObserver.observe(this.input, {
        attributes: true,
        attributeFilter: ['disabled', 'readonly', 'min', 'max', 'step'],
      });
    }
  }

  /**
   * Update button disabled state based on input disabled/readonly state
   * @private
   */
  _updateButtonDisabledState(): void {
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

  /**
   * Check if callbacks are properly paired and warn if not
   * @private
   */
  _checkCallbackPairing(): void {
    const defCb = (v: string) => v;
    const hasBefore =
      this.settings.callback_before_calculation &&
      this.settings.callback_before_calculation.toString() !== defCb.toString();
    const hasAfter =
      this.settings.callback_after_calculation &&
      this.settings.callback_after_calculation.toString() !== defCb.toString();

    if (hasBefore && !hasAfter) {
      console.warn(
        'TouchSpin: callback_before_calculation is defined but callback_after_calculation is missing. ' +
          'These callbacks should be used together - one removes formatting, the other adds it back.'
      );
    } else if (!hasBefore && hasAfter) {
      console.warn(
        'TouchSpin: callback_after_calculation is defined but callback_before_calculation is missing. ' +
          'These callbacks should be used together - one removes formatting, the other adds it back.'
      );
    }
  }
}

export interface TouchSpinCorePublicAPI {
  upOnce: () => void;
  downOnce: () => void;
  startUpSpin: () => void;
  startDownSpin: () => void;
  stopSpin: () => void;
  updateSettings: (opts: Partial<TouchSpinCoreOptions>) => void;
  getValue: () => number;
  setValue: (v: number | string) => void;
  destroy: () => void;
  initDOMEventHandling: () => void;
  registerTeardown: (callback: () => void) => () => void;
  attachUpEvents: (el: HTMLElement | null) => void;
  attachDownEvents: (el: HTMLElement | null) => void;
  observeSetting: <K extends keyof TouchSpinCoreOptions>(
    key: K,
    cb: (value: NonNullable<TouchSpinCoreOptions[K]>, prev?: TouchSpinCoreOptions[K]) => void
  ) => () => void;
}

/**
 * Initialize TouchSpin on an input element or get existing instance.
 * @param {HTMLInputElement} inputEl
 * @param {Partial<TouchSpinCoreOptions>=} opts
 * @returns {TouchSpinCorePublicAPI|null}
 */
export function TouchSpin(
  inputEl: HTMLInputElement,
  opts?: Partial<TouchSpinCoreOptions>
): TouchSpinCorePublicAPI | null {
  // Check if element is an input (graceful handling for public API)
  if (!inputEl || inputEl.nodeName !== 'INPUT') {
    console.warn('Must be an input.');
    return null;
  }

  // If options provided, initialize/reinitialize
  if (opts !== undefined) {
    // Destroy existing instance if it exists (destroy() removes itself from element)
    if ((inputEl as WithCoreElement)[INSTANCE_KEY]) {
      console.warn(
        'TouchSpin: Destroying existing instance and reinitializing. Consider using updateSettings() instead.'
      );
      (inputEl as WithCoreElement)[INSTANCE_KEY]?.destroy();
    }

    // Create new instance and store on element
    const core = new TouchSpinCore(inputEl, opts);
    (inputEl as WithCoreElement)[INSTANCE_KEY] = core;

    // Initialize DOM event handling
    core.initDOMEventHandling();

    return core.toPublicApi();
  }

  // No options - return existing instance or create with defaults
  if (!(inputEl as WithCoreElement)[INSTANCE_KEY]) {
    const core = new TouchSpinCore(inputEl, {});
    (inputEl as WithCoreElement)[INSTANCE_KEY] = core;
    core.initDOMEventHandling();
    return core.toPublicApi();
  }

  return ((inputEl as WithCoreElement)[INSTANCE_KEY] as TouchSpinCore).toPublicApi();
}

/**
 * Get existing TouchSpin instance from input element (without creating one).
 * @param {HTMLInputElement} inputEl
 * @returns {TouchSpinCorePublicAPI|null}
 */
export function getTouchSpin(inputEl: HTMLInputElement): TouchSpinCorePublicAPI | null {
  return (inputEl as WithCoreElement)[INSTANCE_KEY]
    ? ((inputEl as WithCoreElement)[INSTANCE_KEY] as TouchSpinCore).toPublicApi()
    : null;
}

/**
 * Create and return a plain public API bound to a new core instance.
 * @param {HTMLInputElement} inputEl
 * @param {Partial<TouchSpinCoreOptions>=} opts
 * @returns {TouchSpinCorePublicAPI}
 * @deprecated Use TouchSpin() instead
 */
export function createPublicApi(
  inputEl: HTMLInputElement,
  opts?: Partial<TouchSpinCoreOptions>
): TouchSpinCorePublicAPI | null {
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
} as const);

/**
 * Convenience helper to attach core to an input element.
 * @param {HTMLInputElement} inputEl
 * @param {Partial<TouchSpinCoreOptions>=} opts
 * @returns {TouchSpinCore}
 */
export function attach(
  inputEl: HTMLInputElement,
  opts?: Partial<TouchSpinCoreOptions>
): TouchSpinCore {
  return new TouchSpinCore(inputEl, opts ?? {});
}

export default TouchSpinCore;

// Note: AbstractRendererBase is not exported as it's only needed by renderer implementations
// Renderers should import it directly: import AbstractRendererBase from '../../../core/src/AbstractRendererBase.js';

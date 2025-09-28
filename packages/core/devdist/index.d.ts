/**
 * Framework-agnostic core for TouchSpin (TypeScript)
 */
export type ForceStepDivisibility = 'none' | 'floor' | 'round' | 'ceil';
export type TouchSpinCalcCallback = (value: string) => string;
export { TouchSpinCallableEvent, TouchSpinEmittedEvent } from './events.js';
export type { TouchSpinUpdateSettingsData } from './events.js';
import type { Renderer, RendererConstructor } from './renderer.js';
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
type CoreEventName = 'min' | 'max' | 'startspin' | 'startupspin' | 'startdownspin' | 'stopspin' | 'stopupspin' | 'stopdownspin';
export declare class TouchSpinCore {
    input: HTMLInputElement;
    settings: TouchSpinCoreOptions;
    spinning: boolean;
    spincount: number;
    direction: false | 'up' | 'down';
    private _teardownCallbacks;
    private _settingObservers;
    private _spinDelayTimeout;
    private _spinIntervalTimer;
    private _upButton;
    private _originalAttributes;
    private _downButton;
    private _wrapper;
    private _mutationObserver;
    renderer?: Renderer;
    /**
     * Sanitize a partial settings object BEFORE applying it.
     * Returns a new object with only provided keys normalized.
     * @param {Partial<TouchSpinCoreOptions>} partial
     * @param {TouchSpinCoreOptions} current
     * @returns {Partial<TouchSpinCoreOptions>}
     */
    static sanitizePartialSettings(partial: Partial<TouchSpinCoreOptions>, current: TouchSpinCoreOptions): Partial<TouchSpinCoreOptions>;
    /**
     * @param inputEl The input element
     * @param opts Partial settings
     */
    constructor(inputEl: HTMLInputElement, opts?: Partial<TouchSpinCoreOptions>);
    /**
     * Initialize input element (core always handles this)
     * @private
     */
    _initializeInput(): void;
    /**
     * Normalize and validate settings: coerce invalid values to safe defaults.
     * - step: > 0 number, otherwise 1
     * - decimals: integer >= 0, otherwise 0
     * - min/max: finite numbers or null
     * - stepinterval/stepintervaldelay: integers >= 0 (fallback to defaults if invalid)
     * @private
     */
    _sanitizeSettings(): void;
    /**
     * Validate callbacks and automatically convert number inputs to text inputs
     * when formatting callbacks that add non-numeric characters are detected.
     * @private
     */
    _validateCallbacks(): void;
    /**
     * Capture the original attributes of the input before TouchSpin modifies them.
     * This ensures complete transparency - the input can be restored to its exact original state.
     * @private
     */
    _captureOriginalAttributes(): void;
    /**
     * Restore the input to its original state by restoring all original attributes.
     * This ensures complete transparency - the input returns to its exact original state.
     * @private
     */
    _restoreOriginalAttributes(): void;
    /**
     * Parse data-bts-* attributes from the input element.
     * @param {HTMLInputElement} inputEl
     * @returns {Partial<TouchSpinCoreOptions>}
     * @private
     */
    _parseDataAttributes(inputEl: HTMLInputElement): Partial<TouchSpinCoreOptions>;
    /**
     * Convert string attribute values to appropriate types.
     * @param {string} optionName
     * @param {string} rawValue
     * @returns {any}
     * @private
     */
    _coerceAttributeValue(optionName: string, rawValue: string): string | number | boolean;
    /** Increment once according to step */
    upOnce(): void;
    /** Decrement once according to step */
    downOnce(): void;
    /** Start increasing repeatedly; no immediate step here. */
    startUpSpin(): void;
    /** Start decreasing repeatedly; no immediate step here. */
    startDownSpin(): void;
    /** Stop spinning (placeholder) */
    stopSpin(): void;
    updateSettings(opts: Partial<TouchSpinCoreOptions>): void;
    getValue(): number;
    setValue(v: number | string): void;
    /**
     * Initialize DOM event handling by finding elements and attaching listeners.
     * Must be called after the renderer has created the DOM structure.
     */
    initDOMEventHandling(): void;
    /**
     * Register a teardown callback that will be called when the instance is destroyed.
     * This allows wrapper libraries to register cleanup logic.
     * @param {Function} callback - Function to call on destroy
     * @returns {Function} - Unregister function
     */
    registerTeardown(callback: () => void): () => void;
    /** Cleanup and destroy the TouchSpin instance */
    destroy(): void;
    /**
     * Create a plain public API object with bound methods for wrappers.
     * @returns {TouchSpinCorePublicAPI}
     */
    toPublicApi(): TouchSpinCorePublicAPI;
    /**
     * Attach up button events to an element
     * Called by renderers after creating up button
     * @param {HTMLElement|null} element - The element to attach events to
     */
    attachUpEvents(element: HTMLElement | null): void;
    /**
     * Attach down button events to an element
     * Called by renderers after creating down button
     * @param {HTMLElement|null} element - The element to attach events to
     */
    attachDownEvents(element: HTMLElement | null): void;
    /**
     * Allow renderers to observe setting changes
     * @param {string} settingName - Name of setting to observe
     * @param {Function} callback - Function to call when setting changes (newValue, oldValue)
     * @returns {Function} Unsubscribe function
     */
    observeSetting<K extends keyof TouchSpinCoreOptions>(settingName: K, callback: (newValue: NonNullable<TouchSpinCoreOptions[K]>, oldValue?: TouchSpinCoreOptions[K]) => void): () => void;
    /**
     * Emit a core event as DOM CustomEvent (matching original jQuery plugin behavior)
     * TODO: Consider making some events cancelable (e.g., startspin) for user control
     * @param {string} event
     * @param {any=} detail - Currently unused, kept for future extensibility
     */
    emit(event: CoreEventName, detail?: unknown): void;
    /**
     * Internal: start timed spin in a direction with initial step, delay, then interval.
     * @param {'up'|'down'} dir
     */
    _startSpin(dir: 'up' | 'down'): void;
    _clearSpinTimers(): void;
    /**
     * Compute the next numeric value for a direction, respecting step, booster and bounds.
     * @param {'up'|'down'} dir
     * @param {number} current
     */
    _nextValue(dir: 'up' | 'down', current: number): number;
    /** Returns a reasonable value to use when current is NaN. */
    _valueIfIsNaN(): number;
    /** Apply step divisibility and clamp to min/max. */
    _applyConstraints(v: number): number;
    /** Determine the effective step with booster if enabled. */
    _getBoostedStep(): number;
    /** Aligns value to step per forcestepdivisibility. */
    _forcestepdivisibility(val: number): number;
    /** Aligns a value to nearest step boundary using integer arithmetic. */
    _alignToStep(val: number, step: number, dir: 'up' | 'down'): number;
    /** Format and write to input, optionally emit change if different. */
    _setDisplay(num: number, mayTriggerChange: boolean, forceTrigger?: boolean, onlyTriggerIfSanitized?: boolean): string;
    _formatDisplay(num: number): string;
    /**
     * Perform one spin step in a direction while tracking spincount for booster.
     * @param {'up'|'down'} dir
     */
    _spinStep(dir: 'up' | 'down'): void;
    /** Sanitize current input value and update display; optionally emits change. */
    _checkValue(mayTriggerChange: boolean): void;
    _updateAriaAttributes(): void;
    /**
     * Synchronize TouchSpin settings to native input attributes.
     * Only applies to type="number" inputs to maintain browser consistency.
     * @private
     */
    _syncNativeAttributes(): void;
    /**
     * Update TouchSpin settings from native attribute changes.
     * Called by mutation observer when min/max/step attributes change.
     * @private
     */
    _syncSettingsFromNativeAttributes(): void;
    /**
     * Find and store references to DOM elements using data-touchspin-injected attributes.
     * @private
     */
    _findDOMElements(): void;
    /**
     * Attach DOM event listeners to elements.
     * @private
     */
    _attachDOMEventListeners(): void;
    /**
     * Remove DOM event listeners.
     * @private
     */
    _detachDOMEventListeners(): void;
    /**
     * Handle mousedown/touchstart on up button.
     * @private
     */
    _handleUpMouseDown(e: MouseEvent | TouchEvent): void;
    /**
     * Handle mousedown/touchstart on down button.
     * @private
     */
    _handleDownMouseDown(e: MouseEvent | TouchEvent): void;
    /**
     * Handle mouseup/touchend/mouseleave to stop spinning.
     * @private
     */
    _handleMouseUp(e: MouseEvent | TouchEvent): void;
    /**
     * Handle keydown events on up button.
     * @private
     */
    _handleUpKeyDown(e: KeyboardEvent): void;
    /**
     * Handle keyup events on up button.
     * @private
     */
    _handleUpKeyUp(e: KeyboardEvent): void;
    /**
     * Handle keydown events on down button.
     * @private
     */
    _handleDownKeyDown(e: KeyboardEvent): void;
    /**
     * Handle keyup events on down button.
     * @private
     */
    _handleDownKeyUp(e: KeyboardEvent): void;
    /**
     * Sanitize value before other capture listeners observe unsanitized input.
     * @private
     */
    _handleWindowChangeCapture(e: Event): void;
    /**
     * Handle keydown events on the input element.
     * @private
     */
    _handleKeyDown(e: KeyboardEvent): void;
    /**
     * Handle keyup events on the input element.
     * @private
     */
    _handleKeyUp(e: KeyboardEvent): void;
    /**
     * Handle wheel events on the input element.
     * @private
     */
    _handleWheel(e: WheelEvent): void;
    /**
     * Set up mutation observer to watch for disabled/readonly attribute changes
     * @private
     */
    _setupMutationObserver(): void;
    /**
     * Update button disabled state based on input disabled/readonly state
     * @private
     */
    _updateButtonDisabledState(): void;
    /**
     * Check if callbacks are properly paired and warn if not
     * @private
     */
    _checkCallbackPairing(): void;
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
    observeSetting: <K extends keyof TouchSpinCoreOptions>(key: K, cb: (value: NonNullable<TouchSpinCoreOptions[K]>, prev?: TouchSpinCoreOptions[K]) => void) => () => void;
}
/**
 * Initialize TouchSpin on an input element or get existing instance.
 * @param {HTMLInputElement} inputEl
 * @param {Partial<TouchSpinCoreOptions>=} opts
 * @returns {TouchSpinCorePublicAPI|null}
 */
export declare function TouchSpin(inputEl: HTMLInputElement, opts?: Partial<TouchSpinCoreOptions>): TouchSpinCorePublicAPI | null;
/**
 * Get existing TouchSpin instance from input element (without creating one).
 * @param {HTMLInputElement} inputEl
 * @returns {TouchSpinCorePublicAPI|null}
 */
export declare function getTouchSpin(inputEl: HTMLInputElement): TouchSpinCorePublicAPI | null;
/**
 * Create and return a plain public API bound to a new core instance.
 * @param {HTMLInputElement} inputEl
 * @param {Partial<TouchSpinCoreOptions>=} opts
 * @returns {TouchSpinCorePublicAPI}
 * @deprecated Use TouchSpin() instead
 */
export declare function createPublicApi(inputEl: HTMLInputElement, opts?: Partial<TouchSpinCoreOptions>): TouchSpinCorePublicAPI | null;
/** Event name constants for wrappers to map/bridge. */
export declare const CORE_EVENTS: Readonly<{
    readonly MIN: "min";
    readonly MAX: "max";
    readonly START_SPIN: "startspin";
    readonly START_UP: "startupspin";
    readonly START_DOWN: "startdownspin";
    readonly STOP_SPIN: "stopspin";
    readonly STOP_UP: "stopupspin";
    readonly STOP_DOWN: "stopdownspin";
}>;
/**
 * Convenience helper to attach core to an input element.
 * @param {HTMLInputElement} inputEl
 * @param {Partial<TouchSpinCoreOptions>=} opts
 * @returns {TouchSpinCore}
 */
export declare function attach(inputEl: HTMLInputElement, opts?: Partial<TouchSpinCoreOptions>): TouchSpinCore;
export default TouchSpinCore;
//# sourceMappingURL=index.d.ts.map
/**
 * TouchSpinBase - Abstract base class for TouchSpin Web Components
 * Provides core functionality that all renderer-specific components inherit
 */

import { TouchSpin } from '@touchspin/core';
import {
  attributeToSetting,
  getSettingsFromAttributes,
  OBSERVED_ATTRIBUTES,
  parseAttributeValue,
} from '../attribute-mapping.js';
import { bridgeEvents } from '../event-bridge.js';

/**
 * Abstract base class for TouchSpin web components
 * Subclasses must implement getRenderer() to provide their specific renderer
 */
export abstract class TouchSpinBase extends HTMLElement {
  private _touchspin: ReturnType<typeof TouchSpin> | null;
  private _input: HTMLInputElement | null;
  private _eventUnsubscribers: Array<() => void>;
  private _isConnected: boolean;

  /**
   * Observed attributes for reactive updates
   */
  static get observedAttributes() {
    return OBSERVED_ATTRIBUTES.filter((attr) => attr !== 'renderer');
  }

  /**
   * Get the renderer for this component
   * Must be implemented by subclasses to return their specific renderer
   */
  protected abstract getRenderer(): any;

  constructor() {
    super();
    this._touchspin = null;
    this._input = null;
    this._eventUnsubscribers = [];
    this._isConnected = false;
  }

  /**
   * Called when element is inserted into DOM
   */
  connectedCallback(): void {
    this._isConnected = true;
    this._initialize();
  }

  /**
   * Called when element is removed from DOM
   */
  disconnectedCallback(): void {
    this._isConnected = false;
    this._cleanup();
  }

  /**
   * Called when observed attributes change
   * @param {string} name - Attribute name
   * @param {string|null} oldValue - Previous value
   * @param {string|null} newValue - New value
   */
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (!this._isConnected || !this._touchspin) return;

    // Handle special attributes
    if (name === 'value') {
      if (newValue !== oldValue) {
        this._touchspin.setValue(newValue ?? '');
      }
      return;
    }

    if (name === 'disabled') {
      if (this._input) {
        this._input.disabled = newValue !== null;
      }
      return;
    }

    if (name === 'readonly') {
      if (this._input) {
        this._input.readOnly = newValue !== null;
      }
      return;
    }

    // Handle other TouchSpin settings
    const settingName = attributeToSetting(name);
    const value = parseAttributeValue(newValue, settingName);

    if (this._touchspin?.updateSettings) {
      this._touchspin.updateSettings({ [settingName]: value });
    }
  }

  /**
   * Initialize TouchSpin instance
   * @private
   */
  _initialize(): void {
    // Find or create input element
    this._input = (this.querySelector('input[type="number"]') ||
      this.querySelector('input')) as HTMLInputElement | null;

    if (!this._input) {
      this._input = document.createElement('input');
      this._input.type = 'number';
      this.appendChild(this._input);
    }

    // Get settings from attributes
    const settings = getSettingsFromAttributes(this);

    // Set renderer from subclass
    settings.renderer = this.getRenderer();

    // Apply initial input attributes
    this._applyInputAttributes();

    // Initialize TouchSpin
    this._touchspin = TouchSpin(
      this._input,
      settings as unknown as import('@touchspin/core').TouchSpinCoreOptions
    );

    // Bridge events
    if (this._touchspin) {
      this._eventUnsubscribers = bridgeEvents(this._touchspin, this);
    }
  }

  /**
   * Apply HTML attributes to input element
   * @private
   */
  _applyInputAttributes(): void {
    if (!this._input) return;

    // Apply value
    const value = this.getAttribute('value');
    if (value !== null) {
      this._input.value = value;
    }

    // Apply disabled state
    if (this.hasAttribute('disabled')) {
      this._input.disabled = true;
    }

    // Apply readonly state
    if (this.hasAttribute('readonly')) {
      this._input.readOnly = true;
    }

    // Apply other native input attributes
    const nativeAttributes = ['min', 'max', 'step', 'placeholder'];
    for (const attr of nativeAttributes) {
      const value = this.getAttribute(attr);
      if (value !== null) {
        this._input.setAttribute(attr, String(value));
      }
    }
  }

  /**
   * Cleanup TouchSpin instance and event listeners
   * @private
   */
  _cleanup(): void {
    // Cleanup event bridge
    this._eventUnsubscribers.forEach((unsubscribe) => unsubscribe());
    this._eventUnsubscribers = [];

    // Destroy TouchSpin instance
    if (this._touchspin?.destroy) {
      this._touchspin.destroy();
    }
    this._touchspin = null;
  }

  // Public API - Properties

  /**
   * Get/set current value
   */
  get value(): string | number {
    return this._touchspin ? this._touchspin.getValue() : this._input ? this._input.value : '';
  }

  set value(val: string | number) {
    this.setAttribute('value', String(val));
  }

  /**
   * Get/set minimum value
   */
  get min(): string | null {
    return this.getAttribute('min');
  }

  set min(val: string | number | null) {
    if (val === null) this.removeAttribute('min');
    else this.setAttribute('min', String(val));
  }

  /**
   * Get/set maximum value
   */
  get max(): string | null {
    return this.getAttribute('max');
  }

  set max(val: string | number | null) {
    if (val === null) this.removeAttribute('max');
    else this.setAttribute('max', String(val));
  }

  /**
   * Get/set step value
   */
  get step(): string | null {
    return this.getAttribute('step');
  }

  set step(val: string | number | null) {
    if (val === null) this.removeAttribute('step');
    else this.setAttribute('step', String(val));
  }

  /**
   * Get/set disabled state
   */
  get disabled(): boolean {
    return this.hasAttribute('disabled');
  }

  set disabled(val: boolean) {
    if (val) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  /**
   * Get/set readonly state
   */
  get readonly(): boolean {
    return this.hasAttribute('readonly');
  }

  set readonly(val: boolean) {
    if (val) {
      this.setAttribute('readonly', '');
    } else {
      this.removeAttribute('readonly');
    }
  }

  // Public API - Methods

  /**
   * Increment value once
   */
  upOnce(): void {
    if (this._touchspin?.upOnce) {
      this._touchspin.upOnce();
    }
  }

  /**
   * Decrement value once
   */
  downOnce(): void {
    if (this._touchspin?.downOnce) {
      this._touchspin.downOnce();
    }
  }

  /**
   * Start spinning up
   */
  startUpSpin(): void {
    if (this._touchspin?.startUpSpin) {
      this._touchspin.startUpSpin();
    }
  }

  /**
   * Start spinning down
   */
  startDownSpin(): void {
    if (this._touchspin?.startDownSpin) {
      this._touchspin.startDownSpin();
    }
  }

  /**
   * Stop spinning
   */
  stopSpin(): void {
    if (this._touchspin?.stopSpin) {
      this._touchspin.stopSpin();
    }
  }

  /**
   * Update TouchSpin settings
   * @param {Object} options - Settings to update
   */
  updateSettings(options: Record<string, unknown>): void {
    if (this._touchspin?.updateSettings) {
      this._touchspin.updateSettings(options);
    }
  }

  /**
   * Get TouchSpin instance (for advanced usage)
   * @returns {Object|null} - TouchSpin instance
   */
  getTouchSpinInstance() {
    return this._touchspin;
  }

  /**
   * Manually destroy and cleanup
   */
  destroy(): void {
    this._cleanup();
  }
}

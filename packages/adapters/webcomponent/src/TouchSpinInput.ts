/**
 * TouchSpinInput - Web Component implementation
 * Single custom element that works with any renderer
 */

import type { TouchSpinCoreOptions } from '@touchspin/core';
import { TouchSpin } from '@touchspin/core';
import {
  attributeToSetting,
  getSettingsFromAttributes,
  OBSERVED_ATTRIBUTES,
  parseAttributeValue,
} from './attribute-mapping.js';
import { bridgeEvents } from './event-bridge.js';

/**
 * TouchSpin Custom Element
 * A single tag that works with all renderers
 *
 * @example
 * <touchspin-input min="0" max="100" value="50"></touchspin-input>
 */
export class TouchSpinInput extends HTMLElement {
  private _touchspin: ReturnType<typeof TouchSpin> | null;
  private _input: HTMLInputElement | null;
  private _eventUnsubscribers: Array<() => void>;
  private _isConnected: boolean;
  private _renderer: any;

  /**
   * Observed attributes for reactive updates
   */
  static get observedAttributes() {
    return OBSERVED_ATTRIBUTES.filter((attr) => attr !== 'renderer');
  }

  constructor(renderer?: any) {
    super();
    this._touchspin = null;
    this._input = null;
    this._eventUnsubscribers = [];
    this._isConnected = false;
    this._renderer = renderer;
  }

  /**
   * Set the renderer for this instance
   * Should be called before connectedCallback
   */
  setRenderer(renderer: any): void {
    this._renderer = renderer;
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
   */
  private _initialize(): void {
    // Find or create input element with name attribute for form submission
    this._input = (this.querySelector('input[type="number"]') ||
      this.querySelector('input')) as HTMLInputElement | null;

    if (!this._input) {
      this._input = document.createElement('input');
      this._input.type = 'number';
      // Copy name attribute from custom element to input for form submission
      const nameAttr = this.getAttribute('name');
      if (nameAttr) {
        this._input.setAttribute('name', nameAttr);
      }
      this.appendChild(this._input);
    }

    // Get settings from attributes
    const settings = getSettingsFromAttributes(this);

    // Use renderer from constructor or fall back
    if (this._renderer) {
      settings.renderer = this._renderer;
    }

    // Apply initial input attributes
    this._applyInputAttributes();

    // Initialize TouchSpin
    this._touchspin = TouchSpin(this._input, settings as TouchSpinCoreOptions);

    // Bridge events
    if (this._touchspin) {
      this._eventUnsubscribers = bridgeEvents(this._touchspin, this);
    }
  }

  /**
   * Apply HTML attributes to input element
   */
  private _applyInputAttributes(): void {
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

    // Apply name for form submission
    const name = this.getAttribute('name');
    if (name !== null) {
      this._input.setAttribute('name', name);
    }

    // Copy data-testid from custom element to input with -input suffix
    // This allows: custom element = "testid", input = "testid-input"
    // Renderer then derives: wrapper = "testid-input-wrapper", buttons = "testid-input-up/down"
    const testId = this.getAttribute('data-testid');
    if (testId !== null) {
      this._input.setAttribute('data-testid', `${testId}-input`);
      // Keep original testid on custom element for method access
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
   */
  private _cleanup(): void {
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

  get value(): string | number {
    return this._touchspin ? this._touchspin.getValue() : this._input ? this._input.value : '';
  }

  set value(val: string | number) {
    this.setAttribute('value', String(val));
  }

  get min(): string | null {
    return this.getAttribute('min');
  }

  set min(val: string | number | null) {
    if (val === null) this.removeAttribute('min');
    else this.setAttribute('min', String(val));
  }

  get max(): string | null {
    return this.getAttribute('max');
  }

  set max(val: string | number | null) {
    if (val === null) this.removeAttribute('max');
    else this.setAttribute('max', String(val));
  }

  get step(): string | null {
    return this.getAttribute('step');
  }

  set step(val: string | number | null) {
    if (val === null) this.removeAttribute('step');
    else this.setAttribute('step', String(val));
  }

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

  upOnce(): void {
    if (this._touchspin?.upOnce) {
      this._touchspin.upOnce();
    }
  }

  downOnce(): void {
    if (this._touchspin?.downOnce) {
      this._touchspin.downOnce();
    }
  }

  startUpSpin(): void {
    if (this._touchspin?.startUpSpin) {
      this._touchspin.startUpSpin();
    }
  }

  startDownSpin(): void {
    if (this._touchspin?.startDownSpin) {
      this._touchspin.startDownSpin();
    }
  }

  stopSpin(): void {
    if (this._touchspin?.stopSpin) {
      this._touchspin.stopSpin();
    }
  }

  updateSettings(options: Record<string, unknown>): void {
    if (this._touchspin?.updateSettings) {
      this._touchspin.updateSettings(options);
    }
  }

  getTouchSpinInstance() {
    return this._touchspin;
  }

  destroy(): void {
    this._cleanup();
  }
}

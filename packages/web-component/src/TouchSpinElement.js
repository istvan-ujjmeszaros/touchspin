/**
 * TouchSpinElement - Web Component implementation
 * Standards-based custom element providing TouchSpin functionality
 */

import { TouchSpin, getTouchSpin } from '../../core/src/index.js';
import { VanillaRenderer } from '../../vanilla-renderer/src/index.js';
import { getSettingsFromAttributes, OBSERVED_ATTRIBUTES, attributeToSetting, parseAttributeValue } from './attribute-mapping.js';
import { bridgeEvents } from './event-bridge.js';

/**
 * TouchSpin Custom Element
 * 
 * @example
 * <touchspin-element min="0" max="100" value="50"></touchspin-element>
 */
export class TouchSpinElement extends HTMLElement {
  
  /**
   * Observed attributes for reactive updates
   */
  static get observedAttributes() {
    return OBSERVED_ATTRIBUTES;
  }
  
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
  connectedCallback() {
    this._isConnected = true;
    this._initialize();
  }
  
  /**
   * Called when element is removed from DOM  
   */
  disconnectedCallback() {
    this._isConnected = false;
    this._cleanup();
  }
  
  /**
   * Called when observed attributes change
   * @param {string} name - Attribute name
   * @param {string|null} oldValue - Previous value
   * @param {string|null} newValue - New value
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (!this._isConnected || !this._touchspin) return;
    
    // Handle special attributes
    if (name === 'value') {
      if (newValue !== oldValue) {
        this._touchspin.setValue(newValue);
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
    
    // Handle renderer changes
    if (name === 'renderer') {
      this._handleRendererChange(newValue);
      return;
    }
    
    // Handle other TouchSpin settings
    const settingName = attributeToSetting(name);
    const value = parseAttributeValue(newValue, settingName);
    
    if (this._touchspin && this._touchspin.updateSettings) {
      this._touchspin.updateSettings({ [settingName]: value });
    }
  }
  
  /**
   * Initialize TouchSpin instance
   * @private
   */
  _initialize() {
    // Find or create input element
    this._input = this.querySelector('input[type="number"]') || this.querySelector('input');
    
    if (!this._input) {
      this._input = document.createElement('input');
      this._input.type = 'number';
      this.appendChild(this._input);
    }
    
    // Get settings from attributes
    const settings = getSettingsFromAttributes(this);
    
    // Set default renderer if not specified
    if (!settings.renderer) {
      settings.renderer = VanillaRenderer;
    } else if (typeof settings.renderer === 'string') {
      settings.renderer = this._resolveRenderer(settings.renderer);
    }
    
    // Apply initial input attributes
    this._applyInputAttributes();
    
    // Initialize TouchSpin
    this._touchspin = TouchSpin(this._input, settings);
    
    // Bridge events
    this._eventUnsubscribers = bridgeEvents(this._touchspin, this);
  }
  
  /**
   * Apply HTML attributes to input element
   * @private
   */
  _applyInputAttributes() {
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
        this._input.setAttribute(attr, value);
      }
    }
  }
  
  /**
   * Handle renderer changes
   * @param {string} rendererName - Name of renderer to switch to
   * @private
   */
  _handleRendererChange(rendererName) {
    if (!rendererName || !this._touchspin) return;
    
    const renderer = this._resolveRenderer(rendererName);
    if (renderer) {
      // Recreate TouchSpin with new renderer
      this._cleanup();
      this._initialize();
    }
  }
  
  /**
   * Resolve renderer from string name
   * @param {string} name - Renderer name
   * @returns {Function|null} - Renderer class
   * @private
   */
  _resolveRenderer(name) {
    // This would need to be extended to support dynamic renderer loading
    // For now, return VanillaRenderer as fallback
    if (name === 'VanillaRenderer' || name === 'vanilla') {
      return VanillaRenderer;
    }
    
    // Could be extended to support:
    // - 'bootstrap5' -> Bootstrap5Renderer
    // - 'tailwind' -> TailwindRenderer
    // - etc.
    
    console.warn(`Unknown renderer: ${name}, falling back to VanillaRenderer`);
    return VanillaRenderer;
  }
  
  /**
   * Cleanup TouchSpin instance and event listeners
   * @private
   */
  _cleanup() {
    // Cleanup event bridge
    this._eventUnsubscribers.forEach(unsubscribe => unsubscribe());
    this._eventUnsubscribers = [];
    
    // Destroy TouchSpin instance
    if (this._touchspin && this._touchspin.destroy) {
      this._touchspin.destroy();
    }
    this._touchspin = null;
  }
  
  // Public API - Properties
  
  /**
   * Get/set current value
   */
  get value() {
    return this._touchspin ? this._touchspin.getValue() : (this._input ? this._input.value : '');
  }
  
  set value(val) {
    this.setAttribute('value', val);
  }
  
  /**
   * Get/set minimum value
   */
  get min() {
    return this.getAttribute('min');
  }
  
  set min(val) {
    this.setAttribute('min', val);
  }
  
  /**
   * Get/set maximum value  
   */
  get max() {
    return this.getAttribute('max');
  }
  
  set max(val) {
    this.setAttribute('max', val);
  }
  
  /**
   * Get/set step value
   */
  get step() {
    return this.getAttribute('step');
  }
  
  set step(val) {
    this.setAttribute('step', val);
  }
  
  /**
   * Get/set disabled state
   */
  get disabled() {
    return this.hasAttribute('disabled');
  }
  
  set disabled(val) {
    if (val) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }
  
  /**
   * Get/set readonly state
   */
  get readonly() {
    return this.hasAttribute('readonly');
  }
  
  set readonly(val) {
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
  upOnce() {
    if (this._touchspin && this._touchspin.upOnce) {
      this._touchspin.upOnce();
    }
  }
  
  /**
   * Decrement value once  
   */
  downOnce() {
    if (this._touchspin && this._touchspin.downOnce) {
      this._touchspin.downOnce();
    }
  }
  
  /**
   * Start spinning up
   */
  startUpSpin() {
    if (this._touchspin && this._touchspin.startUpSpin) {
      this._touchspin.startUpSpin();
    }
  }
  
  /**
   * Start spinning down
   */
  startDownSpin() {
    if (this._touchspin && this._touchspin.startDownSpin) {
      this._touchspin.startDownSpin();
    }
  }
  
  /**
   * Stop spinning
   */
  stopSpin() {
    if (this._touchspin && this._touchspin.stopSpin) {
      this._touchspin.stopSpin();
    }
  }
  
  /**
   * Update TouchSpin settings
   * @param {Object} options - Settings to update
   */
  updateSettings(options) {
    if (this._touchspin && this._touchspin.updateSettings) {
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
  destroy() {
    this._cleanup();
  }
}
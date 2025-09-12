/**
 * AbstractRenderer - Base class for TouchSpin renderers
 * Part of @touchspin/core package to avoid duplication across renderer packages
 *
 * @example
 * class CustomRenderer extends AbstractRenderer {
 *   init() {
 *     this.wrapper = this.buildUI();
 *     const upBtn = this.wrapper.querySelector('[data-touchspin-injected="up"]');
 *     const downBtn = this.wrapper.querySelector('[data-touchspin-injected="down"]');
 *     this.core.attachUpEvents(upBtn);
 *     this.core.attachDownEvents(downBtn);
 *     this.core.observeSetting('prefix', (value) => this.updatePrefix(value));
 *   }
 * }
 */
import type { TouchSpinCoreOptions } from './index';

class AbstractRenderer {
  /**
   * @param {HTMLInputElement} inputEl - The input element to render around
   * @param {Object} settings - TouchSpin settings (read-only)
   * @param {Object} core - TouchSpin core instance for event delegation
   */
  input: HTMLInputElement;
  settings: Readonly<TouchSpinCoreOptions>;
  // Core instance provides specific methods used by renderers
  // Using a structural type to avoid circular import
  core: {
    attachUpEvents: (el: HTMLElement | null) => void;
    attachDownEvents: (el: HTMLElement | null) => void;
    observeSetting: <K extends keyof TouchSpinCoreOptions>(key: K, cb: (value: NonNullable<TouchSpinCoreOptions[K]>) => void) => () => void;
  };
  wrapper: HTMLElement | null;
  wrapperType: string;

  constructor(inputEl: HTMLInputElement, settings: Readonly<TouchSpinCoreOptions>, core: { attachUpEvents: (el: HTMLElement | null) => void; attachDownEvents: (el: HTMLElement | null) => void; observeSetting: <K extends keyof TouchSpinCoreOptions>(key: K, cb: (value: NonNullable<TouchSpinCoreOptions[K]>) => void) => () => void; }) {
    // New renderer architecture
    this.input = inputEl;
    this.settings = settings; // Read-only access to settings
    this.core = core; // Reference to core for calling attachment methods
    this.wrapper = null; // Set by subclasses during init()
    this.wrapperType = 'wrapper'; // Default wrapper type, set to 'wrapper-advanced' by buildAdvancedInputGroup

    // No legacy properties needed in modern architecture
  }

  /**
   * Initialize the renderer - build DOM structure and attach events
   * Must be implemented by subclasses
   * @abstract
   */
  init(): void {
    throw new Error('init() must be implemented by renderer');
  }

  /**
   * Cleanup renderer - remove injected elements and restore original state
   * Default implementation removes all injected elements
   * Subclasses can override for custom teardown
   */
  teardown(): void {
    // Default implementation - remove all injected elements
    this.removeInjectedElements();
    // Subclasses can override for custom teardown
  }

  /**
   * Utility method to remove all injected TouchSpin elements
   * Handles both regular wrappers and advanced input groups
   * Called automatically by teardown()
   */
  removeInjectedElements(): void {
    // Find and remove all elements with data-touchspin-injected attribute
    if (this.wrapper) {
      const injected = this.wrapper.querySelectorAll('[data-touchspin-injected]');
      injected.forEach((el) => (el as HTMLElement).remove());

      // If wrapper itself was injected and is not the original parent
      if (this.wrapper.hasAttribute('data-touchspin-injected') && this.wrapper.parentElement) {
        const injectedType = this.wrapper.getAttribute('data-touchspin-injected');

        if (injectedType === 'wrapper-advanced') {
          // For advanced input groups, just remove the TouchSpin classes and attribute
          // but keep the original input-group structure intact
          this.wrapper.classList.remove('bootstrap-touchspin');
          this.wrapper.removeAttribute('data-touchspin-injected');
        } else {
          // For regular wrappers, unwrap the input element
          const parent = this.wrapper.parentElement as HTMLElement;
          parent.insertBefore(this.input, this.wrapper);
          this.wrapper.remove();
        }
      }
    }

    // Also find any injected elements that might be siblings or elsewhere
    const allInjected = document.querySelectorAll('[data-touchspin-injected]');
    allInjected.forEach((el) => {
      // Only remove if it's related to this input (check if input is descendant or sibling)
      if (el.contains(this.input) ||
          (el.parentElement && el.parentElement.contains(this.input)) ||
          (this.input.parentElement ? this.input.parentElement.contains(el) : false)) {
        // Don't remove the input itself
        if (el !== this.input) {
          (el as HTMLElement).remove();
        }
      }
    });
  }

  // All legacy jQuery-based methods have been removed
  // Modern renderers implement their own init() method and use vanilla JS

  /**
   * Get testid attribute for up button
   * @returns {string} Testid attribute or empty string
   */
  getUpButtonTestId(): string {
    const inputTestId = this.input.getAttribute('data-testid');
    if (inputTestId) return ` data-testid="${inputTestId}-up"`;
    return '';
  }

  /**
   * Get testid attribute for down button
   * @returns {string} Testid attribute or empty string
   */
  getDownButtonTestId(): string {
    const inputTestId = this.input.getAttribute('data-testid');
    if (inputTestId) return ` data-testid="${inputTestId}-down"`;
    return '';
  }

  /**
   * Get testid attribute for prefix element
   * @returns {string} Testid attribute or empty string
   */
  getPrefixTestId(): string {
    const inputTestId = this.input.getAttribute('data-testid');
    if (inputTestId) return ` data-testid="${inputTestId}-prefix"`;
    return '';
  }

  /**
   * Get testid attribute for postfix element
   * @returns {string} Testid attribute or empty string
   */
  getPostfixTestId(): string {
    const inputTestId = this.input.getAttribute('data-testid');
    if (inputTestId) return ` data-testid="${inputTestId}-postfix"`;
    return '';
  }

  /**
   * Finalize wrapper attributes after DOM construction and event attachment.
   * Sets both data-testid and data-touchspin-injected attributes.
   * Called by core as the final initialization step.
   */
  finalizeWrapperAttributes(): void {
    if (this.wrapper) {
      // Set test ID if input has one and wrapper doesn't already have one
      const testid = this.input.getAttribute('data-testid');
      if (testid && !this.wrapper.hasAttribute('data-testid')) {
        this.wrapper.setAttribute('data-testid', testid + '-wrapper');
      }
      
      // Mark component as ready (DOM built, events attached)
      this.wrapper.setAttribute('data-touchspin-injected', this.wrapperType);
    }
  }
}

export default AbstractRenderer;

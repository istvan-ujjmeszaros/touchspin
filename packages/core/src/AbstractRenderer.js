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
class AbstractRenderer {
  /**
   * @param {HTMLInputElement} inputEl - The input element to render around
   * @param {Object} settings - TouchSpin settings (read-only)
   * @param {Object} core - TouchSpin core instance for event delegation
   */
  constructor(inputEl, settings, core) {
    // New renderer architecture
    /** @type {HTMLInputElement} */
    this.input = inputEl;
    /** @type {Object} */
    this.settings = settings; // Read-only access to settings
    /** @type {Object} */
    this.core = core; // Reference to core for calling attachment methods
    /** @type {HTMLElement|null} */
    this.wrapper = null; // Set by subclasses during init()
    
    // Legacy compatibility (transitional)
    this.$ = typeof $ !== 'undefined' ? $ : null;
    this.originalinput = this.$ ? this.$(inputEl) : null;
    this.container = null;
    this.elements = null;
  }

  /**
   * Initialize the renderer - build DOM structure and attach events
   * Must be implemented by subclasses
   * @abstract
   */
  init() { 
    throw new Error('init() must be implemented by renderer'); 
  }
  
  /**
   * Cleanup renderer - remove injected elements and restore original state
   * Default implementation removes all injected elements
   * Subclasses can override for custom teardown
   */
  teardown() {
    // Default implementation - remove all injected elements
    this.removeInjectedElements();
    // Subclasses can override for custom teardown
  }
  
  /**
   * Utility method to remove all injected TouchSpin elements
   * Handles both regular wrappers and advanced input groups
   * Called automatically by teardown()
   */
  removeInjectedElements() {
    // Find and remove all elements with data-touchspin-injected attribute
    if (this.wrapper) {
      const injected = this.wrapper.querySelectorAll('[data-touchspin-injected]');
      injected.forEach(el => el.remove());
      
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
          const parent = this.wrapper.parentElement;
          parent.insertBefore(this.input, this.wrapper);
          this.wrapper.remove();
        }
      }
    }
    
    // Also find any injected elements that might be siblings or elsewhere
    const allInjected = document.querySelectorAll('[data-touchspin-injected]');
    allInjected.forEach(el => {
      // Only remove if it's related to this input (check if input is descendant or sibling)
      if (el.contains(this.input) || 
          (el.parentElement && el.parentElement.contains(this.input)) ||
          this.input.parentElement?.contains(el)) {
        // Don't remove the input itself
        if (el !== this.input) {
          el.remove();
        }
      }
    });
  }

  // Legacy methods (transitional - for backward compatibility)
  getFrameworkId() { throw new Error('getFrameworkId() must be implemented by subclasses'); }
  buildAdvancedInputGroup(parentelement) { throw new Error('buildAdvancedInputGroup() must be implemented by subclasses'); }
  buildInputGroup() { throw new Error('buildInputGroup() must be implemented by subclasses'); }
  buildVerticalButtons() { throw new Error('buildVerticalButtons() must be implemented by subclasses'); }

  initElements(container) {
    this.container = container;
    let downButtons = this._findElements(container, 'down');
    let upButtons = this._findElements(container, 'up');
    if (downButtons.length === 0 || upButtons.length === 0) {
      const verticalContainer = this._findElements(container.parent(), 'vertical-wrapper');
      if (verticalContainer.length > 0) {
        downButtons = this._findElements(verticalContainer, 'down');
        upButtons = this._findElements(verticalContainer, 'up');
      }
    }
    
    // Ensure input element has data-touchspin-injected="input" for core event targeting
    this.originalinput.attr('data-touchspin-injected', 'input');
    
    this.elements = {
      down: downButtons,
      up: upButtons,
      input: this.$('input', container),
      prefix: this._findElements(container, 'prefix').addClass(this.settings.prefix_extraclass),
      postfix: this._findElements(container, 'postfix').addClass(this.settings.postfix_extraclass)
    };
    return this.elements;
  }

  _findElements(container, role) { return this.$(`[data-touchspin-injected="${role}"]`, container); }

  hideEmptyPrefixPostfix() {
    const detached = {};
    if (this.settings.prefix === '') detached._detached_prefix = this.elements.prefix.detach();
    if (this.settings.postfix === '') detached._detached_postfix = this.elements.postfix.detach();
    return detached;
  }

  updatePrefixPostfix(newsettings, detached) { throw new Error('updatePrefixPostfix() must be implemented by subclasses'); }

  getWrapperTestId() {
    // Modern vanilla JS version
    const inputTestId = this.input.getAttribute('data-testid');
    if (inputTestId) return ` data-testid="${inputTestId}-wrapper"`;
    return '';
  }

  /**
   * Get testid attribute for up button
   * @returns {string} Testid attribute or empty string
   */
  getUpButtonTestId() {
    const inputTestId = this.input.getAttribute('data-testid');
    if (inputTestId) return ` data-testid="${inputTestId}-up"`;
    return '';
  }

  /**
   * Get testid attribute for down button
   * @returns {string} Testid attribute or empty string
   */
  getDownButtonTestId() {
    const inputTestId = this.input.getAttribute('data-testid');
    if (inputTestId) return ` data-testid="${inputTestId}-down"`;
    return '';
  }

  /**
   * Get testid attribute for prefix element
   * @returns {string} Testid attribute or empty string
   */
  getPrefixTestId() {
    const inputTestId = this.input.getAttribute('data-testid');
    if (inputTestId) return ` data-testid="${inputTestId}-prefix"`;
    return '';
  }

  /**
   * Get testid attribute for postfix element
   * @returns {string} Testid attribute or empty string
   */
  getPostfixTestId() {
    const inputTestId = this.input.getAttribute('data-testid');
    if (inputTestId) return ` data-testid="${inputTestId}-postfix"`;
    return '';
  }
}

export default AbstractRenderer;
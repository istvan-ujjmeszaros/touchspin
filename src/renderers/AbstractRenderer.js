/**
 * Abstract Renderer Base Class
 * Defines the interface and common functionality for Bootstrap version-specific renderers
 */
class AbstractRenderer {
  constructor($, settings, originalinput) {
    this.$ = $;
    this.settings = settings;
    this.originalinput = originalinput;
    this.container = null;
    this.elements = null;
  }

  /**
   * Get framework identifier this renderer supports
   * @returns {string} Framework identifier (e.g., "bootstrap3", "bootstrap4", "bootstrap5", "tailwind")
   */
  getFrameworkId() {
    throw new Error('getFrameworkId() must be implemented by subclasses');
  }

  /**
   * Get framework-specific default settings
   * Override this method in subclasses to provide appropriate defaults for each framework
   * @returns {object} Default settings object
   */
  getDefaultSettings() {
    // Base defaults - can be overridden by subclasses
    return {};
  }


  /**
   * Build HTML structure when parent already has input-group class
   * @param {jQuery} parentelement Parent element with input-group class
   */
  buildAdvancedInputGroup(parentelement) {
    throw new Error('buildAdvancedInputGroup() must be implemented by subclasses');
  }

  /**
   * Build complete input group from scratch
   * @returns {jQuery} Created input group container
   */
  buildInputGroup() {
    throw new Error('buildInputGroup() must be implemented by subclasses');
  }

  /**
   * Generate vertical buttons HTML
   * @returns {string} Vertical buttons HTML
   */
  buildVerticalButtons() {
    throw new Error('buildVerticalButtons() must be implemented by subclasses');
  }

  /**
   * Initialize element references after HTML is built
   * @param {jQuery} container The container element
   */
  initElements(container) {
    this.container = container;

    // Look for elements within container first
    let downButtons = this.$('.bootstrap-touchspin-down', container);
    let upButtons = this.$('.bootstrap-touchspin-up', container);

    // If not found in container, look for vertical buttons as siblings of the input
    if (downButtons.length === 0 || upButtons.length === 0) {
      const verticalContainer = this.$('.bootstrap-touchspin-vertical-button-wrapper', container.parent());
      if (verticalContainer.length > 0) {
        downButtons = this.$('.bootstrap-touchspin-down', verticalContainer);
        upButtons = this.$('.bootstrap-touchspin-up', verticalContainer);
      }
    }

    this.elements = {
      down: downButtons,
      up: upButtons,
      input: this.$('input', container),
      prefix: this.$('.bootstrap-touchspin-prefix', container).addClass(this.settings.prefix_extraclass),
      postfix: this.$('.bootstrap-touchspin-postfix', container).addClass(this.settings.postfix_extraclass)
    };
    return this.elements;
  }

  /**
   * Hide empty prefix/postfix elements
   * @returns {object} Object with detached prefix/postfix elements
   */
  hideEmptyPrefixPostfix() {
    const detached = {};

    if (this.settings.prefix === '') {
      detached._detached_prefix = this.elements.prefix.detach();
    }

    if (this.settings.postfix === '') {
      detached._detached_postfix = this.elements.postfix.detach();
    }

    return detached;
  }

  /**
   * Update prefix/postfix content - to be implemented by subclasses
   * @param {object} newsettings New settings object
   * @param {object} detached Detached elements object
   */
  updatePrefixPostfix(newsettings, detached) {
    throw new Error('updatePrefixPostfix() must be implemented by subclasses');
  }


  /**
   * Get wrapper testid attribute based on input's data-testid
   * If input has data-testid="example", returns ' data-testid="example-wrapper"'
   * @returns {string} Testid attribute string or empty string
   */
  getWrapperTestId() {
    const inputTestId = this.originalinput.attr('data-testid');
    if (inputTestId) {
      return ` data-testid="${inputTestId}-wrapper"`;
    }
    return '';
  }
}

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AbstractRenderer;
} else if (typeof window !== 'undefined') {
  window.AbstractRenderer = AbstractRenderer;
}
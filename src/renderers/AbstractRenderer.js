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
   * Get Bootstrap version this renderer supports
   * @returns {number} Bootstrap major version (3, 4, 5, etc.)
   */
  getVersion() {
    throw new Error('getVersion() must be implemented by subclasses');
  }

  /**
   * Get version-specific CSS classes
   * @returns {object} Object containing CSS class mappings
   */
  getClasses() {
    throw new Error('getClasses() must be implemented by subclasses');
  }

  /**
   * Detect input group size from original input classes
   * @returns {string} Size class for input group
   */
  detectInputGroupSize() {
    const classes = this.getClasses();

    if (this.originalinput.hasClass(classes.inputSmall) || this.originalinput.hasClass(classes.formControlSmall)) {
      return classes.inputGroupSmall;
    } else if (this.originalinput.hasClass(classes.inputLarge) || this.originalinput.hasClass(classes.formControlLarge)) {
      return classes.inputGroupLarge;
    }
    return '';
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
   * Update prefix/postfix content
   * @param {object} newsettings New settings object
   */
  updatePrefixPostfix(newsettings, detached) {
    if (newsettings.postfix) {
      const $postfix = this.originalinput.parent().find('.bootstrap-touchspin-postfix');

      if ($postfix.length === 0 && detached._detached_postfix) {
        detached._detached_postfix.insertAfter(this.originalinput);
      }

      this.originalinput.parent().find('.bootstrap-touchspin-postfix .input-group-text').text(newsettings.postfix);
    }

    if (newsettings.prefix) {
      const $prefix = this.originalinput.parent().find('.bootstrap-touchspin-prefix');

      if ($prefix.length === 0 && detached._detached_prefix) {
        detached._detached_prefix.insertBefore(this.originalinput);
      }

      this.originalinput.parent().find('.bootstrap-touchspin-prefix .input-group-text').text(newsettings.prefix);
    }
  }

  /**
   * Apply size classes to container based on input classes
   */
  applySizeClasses() {
    const classes = this.getClasses();

    if (this.originalinput.hasClass(classes.inputSmall) || this.originalinput.hasClass(classes.formControlSmall)) {
      this.container.addClass(classes.inputGroupSmall);
    } else if (this.originalinput.hasClass(classes.inputLarge) || this.originalinput.hasClass(classes.formControlLarge)) {
      this.container.addClass(classes.inputGroupLarge);
    }
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
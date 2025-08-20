/**
 * Bootstrap 5 Renderer
 * Handles HTML generation for Bootstrap 5 specific classes and structure
 * Bootstrap 5 simplified input group structure by removing prepend/append wrappers
 */
class Bootstrap5Renderer extends AbstractRenderer {

  getFrameworkId() {
    return 'bootstrap5';
  }

  /**
   * Detect input group size from original input classes (Bootstrap 5 specific)
   * @private
   * @returns {string} Size class for input group
   */
  _detectInputGroupSize() {
    if (this.originalinput.hasClass('form-control-sm')) {
      return 'input-group-sm';
    } else if (this.originalinput.hasClass('form-control-lg')) {
      return 'input-group-lg';
    }
    return '';
  }

  /**
   * Apply size classes to container based on input classes (Bootstrap 5 specific)
   * @private
   */
  _applySizeClasses() {
    if (this.originalinput.hasClass('form-control-sm')) {
      this.container.addClass('input-group-sm');
    } else if (this.originalinput.hasClass('form-control-lg')) {
      this.container.addClass('input-group-lg');
    }
  }

  buildAdvancedInputGroup(parentelement) {
    parentelement.addClass('bootstrap-touchspin');

    // Add testid to existing input-group wrapper
    const testidAttr = this.getWrapperTestId();
    if (testidAttr) {
      const testidValue = testidAttr.match(/data-testid="([^"]+)"/);
      if (testidValue) {
        parentelement.attr('data-testid', testidValue[1]);
      }
    }

    const prev = this.originalinput.prev();
    const next = this.originalinput.next();

    // BS5 simplified prefix and postfix HTML - no prepend/append wrappers
    const prefixhtml = `
      <span class="input-group-text bootstrap-touchspin-prefix bootstrap-touchspin-injected">${this.settings.prefix}</span>
    `;

    const postfixhtml = `
      <span class="input-group-text bootstrap-touchspin-postfix bootstrap-touchspin-injected">${this.settings.postfix}</span>
    `;

    if (this.settings.verticalbuttons) {
      // Use the buildVerticalButtons method for consistency
      const verticalHtml = this.buildVerticalButtons();
      this.$(verticalHtml).insertAfter(this.originalinput);
    } else {
      // BS5 simplified structure - buttons are direct children of input-group
      const downhtml = `
        <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-down bootstrap-touchspin-injected" type="button">${this.settings.buttondown_txt}</button>
      `;

      const uphtml = `
        <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-up bootstrap-touchspin-injected" type="button">${this.settings.buttonup_txt}</button>
      `;

      // Insert buttons directly as siblings of the input
      this.$(downhtml).insertBefore(this.originalinput);
      this.$(uphtml).insertAfter(this.originalinput);
    }

    // Add prefix and postfix
    this.$(prefixhtml).insertBefore(this.originalinput);
    this.$(postfixhtml).insertAfter(this.originalinput);

    this.container = parentelement;
    return parentelement;
  }

  buildInputGroup() {
    const inputGroupSize = this._detectInputGroupSize();
    const testidAttr = this.getWrapperTestId();
    let html;

    if (this.settings.verticalbuttons) {
      html = `
        <div class="input-group ${inputGroupSize} bootstrap-touchspin bootstrap-touchspin-injected"${testidAttr}>
          <span class="input-group-text bootstrap-touchspin-prefix">${this.settings.prefix}</span>
          <span class="input-group-text bootstrap-touchspin-postfix">${this.settings.postfix}</span>
          <span class="bootstrap-touchspin-vertical-button-wrapper">
            <span class="input-group-btn-vertical">
              <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-up ${this.settings.verticalupclass}" type="button">${this.settings.verticalup}</button>
              <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-down ${this.settings.verticaldownclass}" type="button">${this.settings.verticaldown}</button>
            </span>
          </span>
        </div>
      `;
    } else {
      html = `
        <div class="input-group bootstrap-touchspin bootstrap-touchspin-injected"${testidAttr}>
          <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-down" type="button">${this.settings.buttondown_txt}</button>
          <span class="input-group-text bootstrap-touchspin-prefix">${this.settings.prefix}</span>
          <span class="input-group-text bootstrap-touchspin-postfix">${this.settings.postfix}</span>
          <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-up" type="button">${this.settings.buttonup_txt}</button>
        </div>
      `;
    }

    this.container = this.$(html).insertBefore(this.originalinput);

    // Insert the original input after the prefix
    this.$('.bootstrap-touchspin-prefix', this.container).after(this.originalinput);

    // Apply size classes
    this._applySizeClasses();

    return this.container;
  }

  buildVerticalButtons() {
    return `
      <span class="input-group-text bootstrap-touchspin-vertical-button-wrapper">
        <span class="input-group-btn-vertical">
          <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-up ${this.settings.verticalupclass}" type="button">${this.settings.verticalup}</button>
          <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-down ${this.settings.verticaldownclass}" type="button">${this.settings.verticaldown}</button>
        </span>
      </span>
    `;
  }

  updatePrefixPostfix(newsettings, detached) {
    if (newsettings.postfix) {
      const $postfix = this.originalinput.parent().find('.bootstrap-touchspin-postfix');

      if ($postfix.length === 0 && detached._detached_postfix) {
        detached._detached_postfix.insertAfter(this.originalinput);
      }

      // BS5 - content goes directly in input-group-text
      this.originalinput.parent().find('.bootstrap-touchspin-postfix').text(newsettings.postfix);
    }

    if (newsettings.prefix) {
      const $prefix = this.originalinput.parent().find('.bootstrap-touchspin-prefix');

      if ($prefix.length === 0 && detached._detached_prefix) {
        detached._detached_prefix.insertBefore(this.originalinput);
      }

      // BS5 - content goes directly in input-group-text
      this.originalinput.parent().find('.bootstrap-touchspin-prefix').text(newsettings.prefix);
    }
  }
}

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Bootstrap5Renderer;
} else if (typeof window !== 'undefined') {
  window.Bootstrap5Renderer = Bootstrap5Renderer;
}
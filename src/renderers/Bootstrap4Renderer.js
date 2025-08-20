/**
 * Bootstrap 4 Renderer
 * Handles HTML generation for Bootstrap 4 specific classes and structure
 */
class Bootstrap4Renderer extends AbstractRenderer {

  getFrameworkId() {
    return 'bootstrap4';
  }

  /**
   * Detect input group size from original input classes (Bootstrap 4 specific)
   * @private
   * @returns {string} Size class for input group
   */
  _detectInputGroupSize() {
    if (this.originalinput.hasClass('input-sm') || this.originalinput.hasClass('form-control-sm')) {
      return 'input-group-sm';
    } else if (this.originalinput.hasClass('input-lg') || this.originalinput.hasClass('form-control-lg')) {
      return 'input-group-lg';
    }
    return '';
  }

  /**
   * Apply size classes to container based on input classes (Bootstrap 4 specific)
   * @private
   */
  _applySizeClasses() {
    if (this.originalinput.hasClass('input-sm') || this.originalinput.hasClass('form-control-sm')) {
      this.container.addClass('input-group-sm');
    } else if (this.originalinput.hasClass('input-lg') || this.originalinput.hasClass('form-control-lg')) {
      this.container.addClass('input-group-lg');
    }
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

    // Prefix and postfix HTML for BS4 using input-group-text
    const prefixhtml = `
      <div class="input-group-prepend bootstrap-touchspin-prefix bootstrap-touchspin-injected">
        <span class="input-group-text">${this.settings.prefix}</span>
      </div>
    `;

    const postfixhtml = `
      <div class="input-group-append bootstrap-touchspin-postfix bootstrap-touchspin-injected">
        <span class="input-group-text">${this.settings.postfix}</span>
      </div>
    `;

    if (this.settings.verticalbuttons) {
      this.$(this.buildVerticalButtons()).insertAfter(this.originalinput);
    } else {
      // Handle down button - BS4 prefers input-group-prepend
      if (prev.hasClass('input-group-btn') || prev.hasClass('input-group-prepend')) {
        const downhtml = `
          <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-down bootstrap-touchspin-injected" type="button">${this.settings.buttondown_txt}</button>
        `;
        prev.append(downhtml);
      } else {
        const downhtml = `
          <div class="input-group-prepend bootstrap-touchspin-injected">
            <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-down" type="button">${this.settings.buttondown_txt}</button>
          </div>
        `;
        this.$(downhtml).insertBefore(this.originalinput);
      }

      // Handle up button - BS4 prefers input-group-append
      if (next.hasClass('input-group-btn') || next.hasClass('input-group-append')) {
        const uphtml = `
          <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-up bootstrap-touchspin-injected" type="button">${this.settings.buttonup_txt}</button>
        `;
        next.prepend(uphtml);
      } else {
        const uphtml = `
          <div class="input-group-append bootstrap-touchspin-injected">
            <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-up" type="button">${this.settings.buttonup_txt}</button>
          </div>
        `;
        this.$(uphtml).insertAfter(this.originalinput);
      }
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
          <div class="input-group-prepend bootstrap-touchspin-prefix">
            <span class="input-group-text">${this.settings.prefix}</span>
          </div>
          <div class="input-group-append bootstrap-touchspin-postfix">
            <span class="input-group-text">${this.settings.postfix}</span>
          </div>
          ${this.buildVerticalButtons()}
        </div>
      `;
    } else {
      html = `
        <div class="input-group bootstrap-touchspin bootstrap-touchspin-injected"${testidAttr}>
          <div class="input-group-prepend">
            <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-down" type="button">${this.settings.buttondown_txt}</button>
          </div>
          <div class="input-group-prepend bootstrap-touchspin-prefix">
            <span class="input-group-text">${this.settings.prefix}</span>
          </div>
          <div class="input-group-append bootstrap-touchspin-postfix">
            <span class="input-group-text">${this.settings.postfix}</span>
          </div>
          <div class="input-group-append">
            <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-up" type="button">${this.settings.buttonup_txt}</button>
          </div>
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

  updatePrefixPostfix(newsettings, detached) {
    if (newsettings.postfix) {
      const $postfix = this.originalinput.parent().find('.bootstrap-touchspin-postfix');

      if ($postfix.length === 0 && detached._detached_postfix) {
        detached._detached_postfix.insertAfter(this.originalinput);
      }

      // BS4 uses input-group-text for content
      this.originalinput.parent().find('.bootstrap-touchspin-postfix .input-group-text').text(newsettings.postfix);
    }

    if (newsettings.prefix) {
      const $prefix = this.originalinput.parent().find('.bootstrap-touchspin-prefix');

      if ($prefix.length === 0 && detached._detached_prefix) {
        detached._detached_prefix.insertBefore(this.originalinput);
      }

      // BS4 uses input-group-text for content
      this.originalinput.parent().find('.bootstrap-touchspin-prefix .input-group-text').text(newsettings.prefix);
    }
  }
}

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Bootstrap4Renderer;
} else if (typeof window !== 'undefined') {
  window.Bootstrap4Renderer = Bootstrap4Renderer;
}
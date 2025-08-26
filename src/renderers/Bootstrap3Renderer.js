/**
 * Bootstrap 3 Renderer
 * Handles HTML generation for Bootstrap 3 specific classes and structure
 */
class Bootstrap3Renderer extends AbstractRenderer {

  getFrameworkId() {
    return 'bootstrap3';
  }

  /**
   * Get Bootstrap 3 framework-specific default settings
   * Provides appropriate button classes for Bootstrap 3
   * @returns {object} Bootstrap 3-specific default settings
   */
  getDefaultSettings() {
    return {
      buttonup_class: 'btn btn-default',
      buttondown_class: 'btn btn-default',
      verticalupclass: 'btn btn-default',
      verticaldownclass: 'btn btn-default'
    };
  }

  /**
   * Detect input group size from original input classes (Bootstrap 3 specific)
   * @private
   * @returns {string} Size class for input group
   */
  _detectInputGroupSize() {
    if (this.originalinput.hasClass('input-sm')) {
      return 'input-group-sm';
    } else if (this.originalinput.hasClass('input-lg')) {
      return 'input-group-lg';
    }
    return '';
  }

  /**
   * Apply size classes to container based on input classes (Bootstrap 3 specific)
   * @private
   */
  _applySizeClasses() {
    if (this.originalinput.hasClass('input-sm')) {
      this.container.addClass('input-group-sm');
    } else if (this.originalinput.hasClass('input-lg')) {
      this.container.addClass('input-group-lg');
    }
  }

  buildVerticalButtons() {
    return `
      <span class="input-group-addon bootstrap-touchspin-vertical-button-wrapper" data-touchspin-injected="vertical-wrapper">
        <span class="input-group-btn-vertical">
          <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-up ${this.settings.verticalupclass}" data-touchspin-injected="up" type="button">${this.settings.verticalup}</button>
          <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-down ${this.settings.verticaldownclass}" data-touchspin-injected="down" type="button">${this.settings.verticaldown}</button>
        </span>
      </span>
    `;
  }

  buildAdvancedInputGroup(parentelement) {
    parentelement.addClass('bootstrap-touchspin');
    parentelement.attr('data-touchspin-injected', 'enhanced-wrapper');

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

    // Prefix and postfix HTML for BS3
    const prefixhtml = `
      <span class="input-group-addon" data-touchspin-injected="prefix">
        ${this.settings.prefix}
      </span>
    `;

    const postfixhtml = `
      <span class="input-group-addon" data-touchspin-injected="postfix">
        ${this.settings.postfix}
      </span>
    `;

    if (this.settings.verticalbuttons) {
      this.$(this.buildVerticalButtons()).insertAfter(this.originalinput);
    } else {
      // Handle down button
      if (prev.hasClass('input-group-btn')) {
        const downhtml = `
          <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-down" data-touchspin-injected="down" type="button">${this.settings.buttondown_txt}</button>
        `;
        prev.append(downhtml);
      } else {
        const downhtml = `
          <span class="input-group-btn" data-touchspin-injected="">
            <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-down" data-touchspin-injected="down" type="button">${this.settings.buttondown_txt}</button>
          </span>
        `;
        this.$(downhtml).insertBefore(this.originalinput);
      }

      // Handle up button
      if (next.hasClass('input-group-btn')) {
        const uphtml = `
          <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-up" data-touchspin-injected="up" type="button">${this.settings.buttonup_txt}</button>
        `;
        next.prepend(uphtml);
      } else {
        const uphtml = `
          <span class="input-group-btn" data-touchspin-injected="">
            <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-up" data-touchspin-injected="up" type="button">${this.settings.buttonup_txt}</button>
          </span>
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
        <div class="input-group ${inputGroupSize} bootstrap-touchspin" data-touchspin-injected="wrapper"${testidAttr}>
          <span class="input-group-addon" data-touchspin-injected="prefix">
            ${this.settings.prefix}
          </span>
          <span class="input-group-addon" data-touchspin-injected="postfix">
            ${this.settings.postfix}
          </span>
          ${this.buildVerticalButtons()}
        </div>
      `;
    } else {
      html = `
        <div class="input-group bootstrap-touchspin" data-touchspin-injected="wrapper"${testidAttr}>
          <span class="input-group-btn">
            <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-down" data-touchspin-injected="down" type="button">${this.settings.buttondown_txt}</button>
          </span>
          <span class="input-group-addon" data-touchspin-injected="prefix">
            ${this.settings.prefix}
          </span>
          <span class="input-group-addon" data-touchspin-injected="postfix">
            ${this.settings.postfix}
          </span>
          <span class="input-group-btn">
            <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-up" data-touchspin-injected="up" type="button">${this.settings.buttonup_txt}</button>
          </span>
        </div>
      `;
    }

    this.container = this.$(html).insertBefore(this.originalinput);

    // Insert the original input after the prefix
    this.$('[data-touchspin-injected="prefix"]', this.container).after(this.originalinput);

    // Apply size classes
    this._applySizeClasses();

    return this.container;
  }

  updatePrefixPostfix(newsettings, detached) {
    if (newsettings.postfix) {
      const $postfix = this.originalinput.parent().find('[data-touchspin-injected="postfix"]');

      if ($postfix.length === 0 && detached._detached_postfix) {
        detached._detached_postfix.insertAfter(this.originalinput);
      }

      // BS3 doesn't use input-group-text, content goes directly in addon
      this.originalinput.parent().find('[data-touchspin-injected="postfix"]').text(newsettings.postfix);
    }

    if (newsettings.prefix) {
      const $prefix = this.originalinput.parent().find('[data-touchspin-injected="prefix"]');

      if ($prefix.length === 0 && detached._detached_prefix) {
        detached._detached_prefix.insertBefore(this.originalinput);
      }

      // BS3 doesn't use input-group-text, content goes directly in addon
      this.originalinput.parent().find('[data-touchspin-injected="prefix"]').text(newsettings.prefix);
    }
  }
}

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Bootstrap3Renderer;
} else if (typeof window !== 'undefined') {
  window.Bootstrap3Renderer = Bootstrap3Renderer;
}

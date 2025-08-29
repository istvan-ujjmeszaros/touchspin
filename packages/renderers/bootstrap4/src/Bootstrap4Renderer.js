/**
 * Migrated copy from src/renderers/Bootstrap4Renderer.js (transitional)
 */
import AbstractRenderer from '@touchspin/core/AbstractRenderer';

class Bootstrap4Renderer extends AbstractRenderer {

  getFrameworkId() {
    return 'bootstrap4';
  }

  /**
   * Get Bootstrap 4 framework-specific default settings
   * Provides appropriate button classes for Bootstrap 4
   * @returns {object} Bootstrap 4-specific default settings
   */
  getDefaultSettings() {
    return {
      buttonup_class: 'btn btn-outline-secondary',
      buttondown_class: 'btn btn-outline-secondary',
      verticalupclass: 'btn btn-outline-secondary',
      verticaldownclass: 'btn btn-outline-secondary'
    };
  }

  /**
   * Detect input group size from original input classes (Bootstrap 4 specific)
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
   * Apply size classes to container based on input classes (Bootstrap 4 specific)
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
    parentelement.attr('data-touchspin-injected', 'enhanced-wrapper');

    // Use wrapper testid for consistency
    const testidAttr = this.getWrapperTestId();
    if (testidAttr) {
      const testidValue = testidAttr.match(/data-testid=\"([^\"]+)\"/);
      if (testidValue) {
        parentelement.attr('data-testid', testidValue[1]);
      }
    }

  // Bootstrap 4 structure uses input-group-prepend and input-group-append wrappers
    const prev = this.originalinput.prev();
    const next = this.originalinput.next();

    if (this.settings.verticalbuttons) {
      // Use the buildVerticalButtons method for consistency
      const verticalHtml = this.buildVerticalButtons();
      this.$(verticalHtml).insertAfter(this.originalinput);
    } else {
      // BS4 standard horizontal buttons
      if (prev.hasClass('input-group-prepend') || prev.hasClass('input-group-btn')) {
        const downhtml = `
          <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-down" data-touchspin-injected="down" type="button">${this.settings.buttondown_txt}</button>
        `;
        prev.append(downhtml);
      } else {
        const downhtml = `
          <div class="input-group-prepend" data-touchspin-injected="">
            <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-down" data-touchspin-injected="down" type="button">${this.settings.buttondown_txt}</button>
          </div>
        `;
        this.$(downhtml).insertBefore(this.originalinput);
      }

      if (next.hasClass('input-group-append') || next.hasClass('input-group-btn')) {
        const uphtml = `
          <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-up" data-touchspin-injected="up" type="button">${this.settings.buttonup_txt}</button>
        `;
        next.prepend(uphtml);
      } else {
        const uphtml = `
          <div class="input-group-append" data-touchspin-injected="">
            <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-up" data-touchspin-injected="up" type="button">${this.settings.buttonup_txt}</button>
          </div>
        `;
        this.$(uphtml).insertAfter(this.originalinput);
      }
    }

    // Prefix and postfix
    const prefixhtml = `
      <div class="input-group-prepend" data-touchspin-injected="prefix">
        <span class="input-group-text">${this.settings.prefix}</span>
      </div>
    `;

    const postfixhtml = `
      <div class="input-group-append" data-touchspin-injected="postfix">
        <span class="input-group-text">${this.settings.postfix}</span>
      </div>
    `;

    if (prev.hasClass('input-group-prepend') && prev.find('.input-group-text').length) {
      // Reuse existing prefix wrapper
    } else {
      this.$(prefixhtml).insertBefore(this.originalinput);
    }
    if (next.hasClass('input-group-append') && next.find('.input-group-text').length) {
      // Reuse existing postfix wrapper
    } else {
      this.$(postfixhtml).insertAfter(this.originalinput);
    }

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
          <div class="input-group-prepend" data-touchspin-injected="prefix"><span class="input-group-text">${this.settings.prefix}</span></div>
          <div class="input-group-append" data-touchspin-injected="postfix"><span class="input-group-text">${this.settings.postfix}</span></div>
          <span class="bootstrap-touchspin-vertical-button-wrapper" data-touchspin-injected="vertical-wrapper">
            <span class="input-group-btn-vertical">
              <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-up ${this.settings.verticalupclass}" data-touchspin-injected="up" type="button">${this.settings.verticalup}</button>
              <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-down ${this.settings.verticaldownclass}" data-touchspin-injected="down" type="button">${this.settings.verticaldown}</button>
            </span>
          </span>
        </div>
      `;
    } else {
      html = `
        <div class="input-group ${inputGroupSize} bootstrap-touchspin" data-touchspin-injected="wrapper"${testidAttr}>
          <div class="input-group-prepend" data-touchspin-injected="down">
            <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-down" data-touchspin-injected="down" type="button">${this.settings.buttondown_txt}</button>
          </div>
          <div class="input-group-prepend" data-touchspin-injected="prefix"><span class="input-group-text">${this.settings.prefix}</span></div>
          <div class="input-group-append" data-touchspin-injected="postfix"><span class="input-group-text">${this.settings.postfix}</span></div>
          <div class="input-group-append" data-touchspin-injected="up">
            <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-up" data-touchspin-injected="up" type="button">${this.settings.buttonup_txt}</button>
          </div>
        </div>
      `;
    }

    this.container = this.$(html).insertBefore(this.originalinput);
    this.$('[data-touchspin-injected="prefix"]', this.container).after(this.originalinput);
    this._applySizeClasses();
    return this.container;
  }

  buildVerticalButtons() {
    return `
      <span class="input-group-text bootstrap-touchspin-vertical-button-wrapper" data-touchspin-injected="vertical-wrapper">
        <span class="input-group-btn-vertical">
          <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-up ${this.settings.verticalupclass}" data-touchspin-injected="up" type="button">${this.settings.verticalup}</button>
          <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-down ${this.settings.verticaldownclass}" data-touchspin-injected="down" type="button">${this.settings.verticaldown}</button>
        </span>
      </span>
    `;
  }

  updatePrefixPostfix(newsettings, detached) {
    if (newsettings.postfix) {
      const $postfix = this.originalinput.parent().find('[data-touchspin-injected="postfix"]');
      if ($postfix.length === 0 && detached._detached_postfix) {
        detached._detached_postfix.insertAfter(this.originalinput);
      }
      this.originalinput.parent().find('[data-touchspin-injected="postfix"] .input-group-text').text(newsettings.postfix);
    }

    if (newsettings.prefix) {
      const $prefix = this.originalinput.parent().find('[data-touchspin-injected="prefix"]');
      if ($prefix.length === 0 && detached._detached_prefix) {
        detached._detached_prefix.insertBefore(this.originalinput);
      }
      this.originalinput.parent().find('[data-touchspin-injected="prefix"] .input-group-text').text(newsettings.prefix);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Bootstrap4Renderer;
} else if (typeof window !== 'undefined') {
  window.Bootstrap4Renderer = Bootstrap4Renderer;
}

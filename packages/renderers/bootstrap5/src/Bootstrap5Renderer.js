/**
 * Migrated copy from src/renderers/Bootstrap5Renderer.js (transitional)
 */
import AbstractRenderer from '@touchspin/core/AbstractRenderer';

class Bootstrap5Renderer extends AbstractRenderer {

  getFrameworkId() {
    return 'bootstrap5';
  }

  getDefaultSettings() {
    return {
      buttonup_class: 'btn btn-outline-secondary',
      buttondown_class: 'btn btn-outline-secondary',
      verticalupclass: 'btn btn-outline-secondary',
      verticaldownclass: 'btn btn-outline-secondary'
    };
  }

  _detectInputGroupSize() {
    if (this.originalinput.hasClass('form-control-sm')) {
      return 'input-group-sm';
    } else if (this.originalinput.hasClass('form-control-lg')) {
      return 'input-group-lg';
    }
    return '';
  }

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

    const testidAttr = this.getWrapperTestId();
    if (testidAttr) {
      const testidValue = testidAttr.match(/data-testid=\"([^\"]+)\"/);
      if (testidValue) {
        parentelement.attr('data-testid', testidValue[1]);
      }
    }

    const prev = this.originalinput.prev();
    const next = this.originalinput.next();

    if (this.settings.verticalbuttons) {
      const verticalHtml = this.buildVerticalButtons();
      this.$(verticalHtml).insertAfter(this.originalinput);
    } else {
      const downhtml = `
        <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-down" data-touchspin-injected="down" type="button">${this.settings.buttondown_txt}</button>
      `;

      const uphtml = `
        <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-up" data-touchspin-injected="up" type="button">${this.settings.buttonup_txt}</button>
      `;

      this.$(downhtml).insertBefore(this.originalinput);
      this.$(uphtml).insertAfter(this.originalinput);
    }

    const prefixhtml = `
      <span class="input-group-text" data-touchspin-injected="prefix">${this.settings.prefix}</span>
    `;

    const postfixhtml = `
      <span class="input-group-text" data-touchspin-injected="postfix">${this.settings.postfix}</span>
    `;

    if (prev.hasClass('input-group-text')) {
      // Reuse existing prefix text element
    } else {
      this.$(prefixhtml).insertBefore(this.originalinput);
    }
    if (next.hasClass('input-group-text')) {
      // Reuse existing postfix text element
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
          <span class="input-group-text" data-touchspin-injected="prefix">${this.settings.prefix}</span>
          <span class="input-group-text" data-touchspin-injected="postfix">${this.settings.postfix}</span>
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
        <div class="input-group bootstrap-touchspin" data-touchspin-injected="wrapper"${testidAttr}>
          <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-down" data-touchspin-injected="down" type="button">${this.settings.buttondown_txt}</button>
          <span class="input-group-text" data-touchspin-injected="prefix">${this.settings.prefix}</span>
          <span class="input-group-text" data-touchspin-injected="postfix">${this.settings.postfix}</span>
          <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-up" data-touchspin-injected="up" type="button">${this.settings.buttonup_txt}</button>
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
      this.originalinput.parent().find('[data-touchspin-injected="postfix"]').text(newsettings.postfix);
    }

    if (newsettings.prefix) {
      const $prefix = this.originalinput.parent().find('[data-touchspin-injected="prefix"]');
      if ($prefix.length === 0 && detached._detached_prefix) {
        detached._detached_prefix.insertBefore(this.originalinput);
      }
      this.originalinput.parent().find('[data-touchspin-injected="prefix"]').text(newsettings.prefix);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Bootstrap5Renderer;
} else if (typeof window !== 'undefined') {
  window.Bootstrap5Renderer = Bootstrap5Renderer;
}

/**
 * Migrated copy from src/renderers/TailwindRenderer.js (transitional)
 */
class TailwindRenderer extends AbstractRenderer {

  getFrameworkId() {
    return 'tailwind';
  }

  getDefaultSettings() {
    return {
      buttonup_class: 'px-3 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
      buttondown_class: 'px-3 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
      verticalupclass: 'px-3 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
      verticaldownclass: 'px-3 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
      input_class: 'px-2 py-2 border border-gray-300 rounded'
    };
  }

  _applySizeClasses() {
    // Tailwind renderer does not automatically apply input-group sizing classes
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
      <span class="inline-flex items-center px-3 text-gray-700 bg-gray-100 border border-r-0 border-gray-300 rounded-l" data-touchspin-injected="prefix">${this.settings.prefix}</span>
    `;

    const postfixhtml = `
      <span class="inline-flex items-center px-3 text-gray-700 bg-gray-100 border border-l-0 border-gray-300 rounded-r" data-touchspin-injected="postfix">${this.settings.postfix}</span>
    `;

    this.$(prefixhtml).insertBefore(this.originalinput);
    this.$(postfixhtml).insertAfter(this.originalinput);

    // Apply input class if provided
    if (this.settings.input_class) {
      this.originalinput.addClass(this.settings.input_class);
    }

    this.container = parentelement;
    return parentelement;
  }

  buildInputGroup() {
    const testidAttr = this.getWrapperTestId();
    let html;

    if (this.settings.verticalbuttons) {
      html = `
        <div class="inline-flex items-stretch bootstrap-touchspin" data-touchspin-injected="wrapper"${testidAttr}>
          <span class="inline-flex items-center px-3 text-gray-700 bg-gray-100 border border-r-0 border-gray-300" data-touchspin-injected="prefix">${this.settings.prefix}</span>
          <span class="inline-flex items-center px-3 text-gray-700 bg-gray-100 border border-l-0 border-gray-300" data-touchspin-injected="postfix">${this.settings.postfix}</span>
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
        <div class="inline-flex items-stretch bootstrap-touchspin" data-touchspin-injected="wrapper"${testidAttr}>
          <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-down" data-touchspin-injected="down" type="button">${this.settings.buttondown_txt}</button>
          <span class="inline-flex items-center px-3 text-gray-700 bg-gray-100 border border-r-0 border-gray-300" data-touchspin-injected="prefix">${this.settings.prefix}</span>
          <span class="inline-flex items-center px-3 text-gray-700 bg-gray-100 border border-l-0 border-gray-300" data-touchspin-injected="postfix">${this.settings.postfix}</span>
          <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-up" data-touchspin-injected="up" type="button">${this.settings.buttonup_txt}</button>
        </div>
      `;
    }

    this.container = this.$(html).insertBefore(this.originalinput);
    this.$('[data-touchspin-injected="prefix"]', this.container).after(this.originalinput);
    if (this.settings.input_class) this.originalinput.addClass(this.settings.input_class);
    return this.container;
  }

  buildVerticalButtons() {
    return `
      <span class="inline-flex items-center bootstrap-touchspin-vertical-button-wrapper" data-touchspin-injected="vertical-wrapper">
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
  module.exports = TailwindRenderer;
} else if (typeof window !== 'undefined') {
  window.TailwindRenderer = TailwindRenderer;
}


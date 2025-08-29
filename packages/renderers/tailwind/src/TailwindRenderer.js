/**
 * Tailwind CSS Renderer (aligned with src/renderers/TailwindRenderer.js)
 * Uses Tailwind utility classes only; no Bootstrap CSS dependency.
 */
import AbstractRenderer from '@touchspin/core/AbstractRenderer';

class TailwindRenderer extends AbstractRenderer {

  getFrameworkId() { return 'tailwind'; }

  getDefaultSettings() {
    return {
      buttonup_class: '',
      buttondown_class: '',
      verticalupclass: '',
      verticaldownclass: '',
      input_class: ''
    };
  }

  _detectInputSize() {
    if (this.originalinput.hasClass('text-sm') || this.originalinput.hasClass('py-1')) return 'text-sm py-1 px-2';
    if (this.originalinput.hasClass('text-lg') || this.originalinput.hasClass('py-3')) return 'text-lg py-3 px-4';
    return 'text-base py-2 px-3';
  }

  _applySizeClasses() {
    const s = this._detectInputSize();
    if (s.includes('text-sm')) {
      this.container.addClass('text-sm');
      this.container.find('.tailwind-btn').addClass('py-1 px-2 text-sm');
      this.container.find('.tailwind-addon').addClass('py-1 px-2 text-sm');
    } else if (s.includes('text-lg')) {
      this.container.addClass('text-lg');
      this.container.find('.tailwind-btn').addClass('py-3 px-4 text-lg');
      this.container.find('.tailwind-addon').addClass('py-3 px-4 text-lg');
    }
  }

  buildAdvancedInputGroup(parentelement) {
    parentelement.addClass('flex rounded-md shadow-sm border border-gray-300 bootstrap-touchspin focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 has-[:disabled]:opacity-60 has-[:disabled]:bg-gray-50 has-[:read-only]:bg-gray-50');
    parentelement.attr('data-touchspin-injected', 'enhanced-wrapper');
    const testidAttr = this.getWrapperTestId();
    if (testidAttr) {
      const m = testidAttr.match(/data-testid=\"([^\"]+)\"/);
      if (m) parentelement.attr('data-testid', m[1]);
    }

    const prefixhtml = `
      <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon" data-touchspin-injected="prefix">${this.settings.prefix}</span>`;
    const postfixhtml = `
      <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon" data-touchspin-injected="postfix">${this.settings.postfix}</span>`;

    if (this.settings.verticalbuttons) {
      const verticalHtml = this.buildVerticalButtons();
      this.$(verticalHtml).insertAfter(this.originalinput);
    } else {
      const downhtml = `
        <button tabindex="-1" class="inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border-0 tailwind-btn bootstrap-touchspin-down ${this.settings.buttondown_class}" data-touchspin-injected="down" type="button">${this.settings.buttondown_txt}</button>`;
      const uphtml = `
        <button tabindex="-1" class="inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border-0 tailwind-btn bootstrap-touchspin-up ${this.settings.buttonup_class}" data-touchspin-injected="up" type="button">${this.settings.buttonup_txt}</button>`;
      this.$(downhtml).insertBefore(this.originalinput);
      this.$(uphtml).insertAfter(this.originalinput);
    }

    if (this.settings.prefix !== '') this.$(prefixhtml).insertBefore(this.originalinput);
    if (this.settings.postfix !== '') this.$(postfixhtml).insertAfter(this.originalinput);

    this.originalinput.removeClass('form-control');
    this.originalinput.addClass('flex-1 px-3 py-2 border-0 bg-transparent focus:outline-none text-gray-900 placeholder-gray-500 read-only:bg-gray-50 disabled:cursor-not-allowed');

    this.container = parentelement;
    return parentelement;
  }

  buildInputGroup() {
    const testidAttr = this.getWrapperTestId();
    let html;
    if (this.settings.verticalbuttons) {
      html = `
        <div class="flex rounded-md shadow-sm border border-gray-300 bootstrap-touchspin focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 has-[:disabled]:opacity-60 has-[:disabled]:bg-gray-50 has-[:read-only]:bg-gray-50" data-touchspin-injected="wrapper"${testidAttr}>
          <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon" data-touchspin-injected="prefix">${this.settings.prefix}</span>
          <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon" data-touchspin-injected="postfix">${this.settings.postfix}</span>
          <div class="flex flex-col ml-1 bootstrap-touchspin-vertical-button-wrapper" data-touchspin-injected="vertical-wrapper">
            <button tabindex="-1" class="inline-flex items-center justify-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border border-gray-300 rounded-t tailwind-btn bootstrap-touchspin-up ${this.settings.verticalupclass}" data-touchspin-injected="up" type="button">${this.settings.verticalup}</button>
            <button tabindex="-1" class="inline-flex items-center justify-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border border-t-0 border-gray-300 rounded-b tailwind-btn bootstrap-touchspin-down ${this.settings.verticaldownclass}" data-touchspin-injected="down" type="button">${this.settings.verticaldown}</button>
          </div>
        </div>`;
    } else {
      html = `
        <div class="flex rounded-md shadow-sm border border-gray-300 bootstrap-touchspin focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 has-[:disabled]:opacity-60 has-[:disabled]:bg-gray-50 has-[:read-only]:bg-gray-50" data-touchspin-injected="wrapper"${testidAttr}>
          <button tabindex="-1" class="inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border-0 rounded-l-md tailwind-btn bootstrap-touchspin-down ${this.settings.buttondown_class}" data-touchspin-injected="down" type="button">${this.settings.buttondown_txt}</button>
          <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon" data-touchspin-injected="prefix">${this.settings.prefix}</span>
          <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon" data-touchspin-injected="postfix">${this.settings.postfix}</span>
          <button tabindex="-1" class="inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border-0 rounded-r-md tailwind-btn bootstrap-touchspin-up ${this.settings.buttonup_class}" data-touchspin-injected="up" type="button">${this.settings.buttonup_txt}</button>
        </div>`;
    }

    this.container = this.$(html).insertBefore(this.originalinput);
    this.$('[data-touchspin-injected="prefix"]', this.container).after(this.originalinput);
    this.originalinput.removeClass('form-control');
    this.originalinput.addClass('flex-1 px-3 py-2 border-0 bg-transparent focus:outline-none text-gray-900 placeholder-gray-500 read-only:bg-gray-50 disabled:cursor-not-allowed');
    this._applySizeClasses();
    return this.container;
  }

  buildVerticalButtons() {
    return `
      <div class="flex flex-col ml-1 bootstrap-touchspin-vertical-button-wrapper" data-touchspin-injected="vertical-wrapper">
        <button tabindex="-1" class="inline-flex items-center justify-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border border-gray-300 rounded-t tailwind-btn bootstrap-touchspin-up ${this.settings.verticalupclass}" data-touchspin-injected="up" type="button">${this.settings.verticalup}</button>
        <button tabindex="-1" class="inline-flex items-center justify-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border border-t-0 border-gray-300 rounded-b tailwind-btn bootstrap-touchspin-down ${this.settings.verticaldownclass}" data-touchspin-injected="down" type="button">${this.settings.verticaldown}</button>
      </div>`;
  }

  updatePrefixPostfix(newsettings, detached) {
    if (newsettings.postfix) {
      const $postfix = this.originalinput.parent().find('[data-touchspin-injected="postfix"]');
      if ($postfix.length === 0 && detached._detached_postfix) detached._detached_postfix.insertAfter(this.originalinput);
      this.originalinput.parent().find('[data-touchspin-injected="postfix"]').text(newsettings.postfix);
    }
    if (newsettings.prefix) {
      const $prefix = this.originalinput.parent().find('[data-touchspin-injected="prefix"]');
      if ($prefix.length === 0 && detached._detached_prefix) detached._detached_prefix.insertBefore(this.originalinput);
      this.originalinput.parent().find('[data-touchspin-injected="prefix"]').text(newsettings.prefix);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TailwindRenderer;
} else if (typeof window !== 'undefined') {
  window.TailwindRenderer = TailwindRenderer;
}

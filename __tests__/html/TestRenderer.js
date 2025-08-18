/**
 * Test Renderer (based on Bootstrap 5)
 * Custom renderer for testing the renderer system functionality
 * Adds special CSS classes for test identification
 */
class TestRenderer extends AbstractRenderer {

  getVersion() {
    return 999; // Custom version for testing
  }

  getClasses() {
    return {
      // Input size classes - same as BS5
      inputSmall: 'form-control-sm',
      inputLarge: 'form-control-lg', 
      formControlSmall: 'form-control-sm',
      formControlLarge: 'form-control-lg',

      // Input group size classes
      inputGroupSmall: 'input-group-sm',
      inputGroupLarge: 'input-group-lg',

      // Button wrapper classes - simplified like BS5
      inputGroupBtn: '',
      inputGroupPrepend: '',
      inputGroupAppend: '',

      // Text wrapper classes
      inputGroupAddon: '',
      inputGroupText: 'input-group-text'
    };
  }

  buildAdvancedInputGroup(parentelement) {
    parentelement.addClass('bootstrap-touchspin test-renderer-wrapper');

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

    // Test renderer specific prefix and postfix HTML
    const prefixhtml = `
      <span class="input-group-text bootstrap-touchspin-prefix bootstrap-touchspin-injected test-prefix">${this.settings.prefix}</span>
    `;

    const postfixhtml = `
      <span class="input-group-text bootstrap-touchspin-postfix bootstrap-touchspin-injected test-postfix">${this.settings.postfix}</span>
    `;

    if (this.settings.verticalbuttons) {
      const verticalHtml = this.buildVerticalButtons();
      this.$(verticalHtml).insertAfter(this.originalinput);
    } else {
      // Test renderer buttons with special classes
      const downhtml = `
        <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-down bootstrap-touchspin-injected test-btn-down" type="button">${this.settings.buttondown_txt}</button>
      `;

      const uphtml = `
        <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-up bootstrap-touchspin-injected test-btn-up" type="button">${this.settings.buttonup_txt}</button>
      `;

      // Insert buttons directly as siblings of the input
      this.$(downhtml).insertBefore(this.originalinput);
      this.$(uphtml).insertAfter(this.originalinput);
    }

    // Add prefix and postfix if they have content
    if (this.settings.prefix !== '') {
      this.$(prefixhtml).insertBefore(this.originalinput);
    }
    if (this.settings.postfix !== '') {
      this.$(postfixhtml).insertAfter(this.originalinput);
    }

    this.container = parentelement;
    return parentelement;
  }

  buildInputGroup() {
    const inputGroupSize = this.detectInputGroupSize();
    const testidAttr = this.getWrapperTestId();
    let html;

    if (this.settings.verticalbuttons) {
      html = `
        <div class="input-group ${inputGroupSize} bootstrap-touchspin bootstrap-touchspin-injected test-renderer-wrapper"${testidAttr}>
          <span class="input-group-text bootstrap-touchspin-prefix test-prefix">${this.settings.prefix}</span>
          <span class="input-group-text bootstrap-touchspin-postfix test-postfix">${this.settings.postfix}</span>
          <span class="bootstrap-touchspin-vertical-button-wrapper test-vertical-wrapper">
            <span class="input-group-btn-vertical">
              <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-up ${this.settings.verticalupclass} test-btn-up" type="button">${this.settings.verticalup}</button>
              <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-down ${this.settings.verticaldownclass} test-btn-down" type="button">${this.settings.verticaldown}</button>
            </span>
          </span>
        </div>
      `;
    } else {
      html = `
        <div class="input-group bootstrap-touchspin bootstrap-touchspin-injected test-renderer-wrapper"${testidAttr}>
          <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-down test-btn-down" type="button">${this.settings.buttondown_txt}</button>
          <span class="input-group-text bootstrap-touchspin-prefix test-prefix">${this.settings.prefix}</span>
          <span class="input-group-text bootstrap-touchspin-postfix test-postfix">${this.settings.postfix}</span>
          <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-up test-btn-up" type="button">${this.settings.buttonup_txt}</button>
        </div>
      `;
    }

    this.container = this.$(html).insertBefore(this.originalinput);

    // Insert the original input after the prefix
    this.$('.bootstrap-touchspin-prefix', this.container).after(this.originalinput);

    // Apply size classes
    this.applySizeClasses();

    return this.container;
  }

  buildVerticalButtons() {
    return `
      <span class="input-group-text bootstrap-touchspin-vertical-button-wrapper test-vertical-wrapper">
        <span class="input-group-btn-vertical">
          <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-up ${this.settings.verticalupclass} test-btn-up" type="button">${this.settings.verticalup}</button>
          <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-down ${this.settings.verticaldownclass} test-btn-down" type="button">${this.settings.verticaldown}</button>
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

      this.originalinput.parent().find('.bootstrap-touchspin-postfix').text(newsettings.postfix);
    }

    if (newsettings.prefix) {
      const $prefix = this.originalinput.parent().find('.bootstrap-touchspin-prefix');

      if ($prefix.length === 0 && detached._detached_prefix) {
        detached._detached_prefix.insertBefore(this.originalinput);
      }

      this.originalinput.parent().find('.bootstrap-touchspin-prefix').text(newsettings.prefix);
    }
  }
}

// Export for both CommonJS and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TestRenderer;
} else if (typeof window !== 'undefined') {
  window.TestRenderer = TestRenderer;
}
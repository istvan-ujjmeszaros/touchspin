/**
 * Bootstrap 5 Renderer
 * Handles HTML generation for Bootstrap 5 specific classes and structure
 * Bootstrap 5 is very similar to Bootstrap 4 in terms of input groups
 */
class Bootstrap5Renderer extends Bootstrap4Renderer {
  
  getVersion() {
    return 5;
  }

  getClasses() {
    return {
      // Input size classes - BS5 removed .input-sm/.input-lg legacy classes
      inputSmall: 'form-control-sm', // Only BS4+ form-control-* classes
      inputLarge: 'form-control-lg',
      formControlSmall: 'form-control-sm',
      formControlLarge: 'form-control-lg',
      
      // Input group size classes
      inputGroupSmall: 'input-group-sm',
      inputGroupLarge: 'input-group-lg',
      
      // Button wrapper classes - BS5 doesn't use these
      inputGroupBtn: '', // Removed in BS5
      inputGroupPrepend: '', // Removed in BS5
      inputGroupAppend: '', // Removed in BS5
      
      // BS5 simplified structure - no prepend/append wrappers needed
      inputGroupAddon: '', // Not used in BS5
      inputGroupText: 'input-group-text' // Still used in BS5
    };
  }

  buildAdvancedInputGroup(parentelement) {
    parentelement.addClass('bootstrap-touchspin');

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
      // For vertical buttons, we still need a wrapper
      const verticalHtml = `
        <span class="bootstrap-touchspin-vertical-button-wrapper">
          <span class="input-group-btn-vertical">
            <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-up ${this.settings.verticalupclass}" type="button">${this.settings.verticalup}</button>
            <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-down ${this.settings.verticaldownclass}" type="button">${this.settings.verticaldown}</button>
          </span>
        </span>
      `;
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
    const inputGroupSize = this.detectInputGroupSize();
    let html;

    if (this.settings.verticalbuttons) {
      html = `
        <div class="input-group ${inputGroupSize} bootstrap-touchspin bootstrap-touchspin-injected">
          <span class="input-group-text bootstrap-touchspin-prefix">${this.settings.prefix}</span>
          <span class="input-group-text bootstrap-touchspin-postfix">${this.settings.postfix}</span>
          <span class="bootstrap-touchspin-vertical-button-wrapper">
            <span class="input-group-btn-vertical">
              <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-up ${this.settings.verticalupclass}" type="button">${this.settings.verticalup}</button>
              <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-down ${this.settings.verticaldownclass}" type="button">${this.settings.verticaldown}</button>
            </span>
          </span>
        </div>
      `;
    } else {
      html = `
        <div class="input-group bootstrap-touchspin bootstrap-touchspin-injected">
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
    this.applySizeClasses();

    return this.container;
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
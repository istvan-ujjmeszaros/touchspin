/**
 * Bootstrap 3 Renderer
 * Handles HTML generation for Bootstrap 3 specific classes and structure
 */
class Bootstrap3Renderer extends BootstrapRenderer {
  
  getVersion() {
    return 3;
  }

  getClasses() {
    return {
      // Input size classes
      inputSmall: 'input-sm',
      inputLarge: 'input-lg',
      formControlSmall: 'form-control-sm', // Not used in BS3, but kept for compatibility
      formControlLarge: 'form-control-lg', // Not used in BS3, but kept for compatibility
      
      // Input group size classes
      inputGroupSmall: 'input-group-sm',
      inputGroupLarge: 'input-group-lg',
      
      // Button wrapper classes
      inputGroupBtn: 'input-group-btn',
      inputGroupAddon: 'input-group-addon',
      
      // No prepend/append classes in BS3
      inputGroupPrepend: '',
      inputGroupAppend: '',
      inputGroupText: '' // No input-group-text in BS3
    };
  }

  buildVerticalButtons() {
    return `
      <span class="input-group-addon bootstrap-touchspin-vertical-button-wrapper">
        <span class="input-group-btn-vertical">
          <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-up ${this.settings.verticalupclass}" type="button">${this.settings.verticalup}</button>
          <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-down ${this.settings.verticaldownclass}" type="button">${this.settings.verticaldown}</button>
        </span>
      </span>
    `;
  }

  buildAdvancedInputGroup(parentelement) {
    parentelement.addClass('bootstrap-touchspin');

    const prev = this.originalinput.prev();
    const next = this.originalinput.next();
    const classes = this.getClasses();

    // Prefix and postfix HTML for BS3
    const prefixhtml = `
      <span class="input-group-addon bootstrap-touchspin-prefix bootstrap-touchspin-injected">
        ${this.settings.prefix}
      </span>
    `;
    
    const postfixhtml = `
      <span class="input-group-addon bootstrap-touchspin-postfix bootstrap-touchspin-injected">
        ${this.settings.postfix}
      </span>
    `;

    if (this.settings.verticalbuttons) {
      this.$(this.buildVerticalButtons()).insertAfter(this.originalinput);
    } else {
      // Handle down button
      if (prev.hasClass(classes.inputGroupBtn)) {
        const downhtml = `
          <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-down bootstrap-touchspin-injected" type="button">${this.settings.buttondown_txt}</button>
        `;
        prev.append(downhtml);
      } else {
        const downhtml = `
          <span class="input-group-btn bootstrap-touchspin-injected">
            <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-down" type="button">${this.settings.buttondown_txt}</button>
          </span>
        `;
        this.$(downhtml).insertBefore(this.originalinput);
      }

      // Handle up button
      if (next.hasClass(classes.inputGroupBtn)) {
        const uphtml = `
          <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-up bootstrap-touchspin-injected" type="button">${this.settings.buttonup_txt}</button>
        `;
        next.prepend(uphtml);
      } else {
        const uphtml = `
          <span class="input-group-btn bootstrap-touchspin-injected">
            <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-up" type="button">${this.settings.buttonup_txt}</button>
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
    const inputGroupSize = this.detectInputGroupSize();
    let html;

    if (this.settings.verticalbuttons) {
      html = `
        <div class="input-group ${inputGroupSize} bootstrap-touchspin bootstrap-touchspin-injected">
          <span class="input-group-addon bootstrap-touchspin-prefix">
            ${this.settings.prefix}
          </span>
          <span class="input-group-addon bootstrap-touchspin-postfix">
            ${this.settings.postfix}
          </span>
          ${this.buildVerticalButtons()}
        </div>
      `;
    } else {
      html = `
        <div class="input-group bootstrap-touchspin bootstrap-touchspin-injected">
          <span class="input-group-btn">
            <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-down" type="button">${this.settings.buttondown_txt}</button>
          </span>
          <span class="input-group-addon bootstrap-touchspin-prefix">
            ${this.settings.prefix}
          </span>
          <span class="input-group-addon bootstrap-touchspin-postfix">
            ${this.settings.postfix}
          </span>
          <span class="input-group-btn">
            <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-up" type="button">${this.settings.buttonup_txt}</button>
          </span>
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

      // BS3 doesn't use input-group-text, content goes directly in addon
      this.originalinput.parent().find('.bootstrap-touchspin-postfix').text(newsettings.postfix);
    }

    if (newsettings.prefix) {
      const $prefix = this.originalinput.parent().find('.bootstrap-touchspin-prefix');

      if ($prefix.length === 0 && detached._detached_prefix) {
        detached._detached_prefix.insertBefore(this.originalinput);
      }

      // BS3 doesn't use input-group-text, content goes directly in addon
      this.originalinput.parent().find('.bootstrap-touchspin-prefix').text(newsettings.prefix);
    }
  }
}

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Bootstrap3Renderer;
} else if (typeof window !== 'undefined') {
  window.Bootstrap3Renderer = Bootstrap3Renderer;
}
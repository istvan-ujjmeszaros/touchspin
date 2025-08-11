/**
 * Bootstrap 4 Renderer
 * Handles HTML generation for Bootstrap 4 specific classes and structure
 */
class Bootstrap4Renderer extends BootstrapRenderer {
  
  getVersion() {
    return 4;
  }

  getClasses() {
    return {
      // Input size classes
      inputSmall: 'input-sm', // Legacy BS3 class, still supported
      inputLarge: 'input-lg', // Legacy BS3 class, still supported
      formControlSmall: 'form-control-sm', // BS4 class
      formControlLarge: 'form-control-lg', // BS4 class
      
      // Input group size classes
      inputGroupSmall: 'input-group-sm',
      inputGroupLarge: 'input-group-lg',
      
      // Button wrapper classes - BS4 uses input-group-prepend/append
      inputGroupBtn: 'input-group-btn', // Legacy, still works
      inputGroupPrepend: 'input-group-prepend',
      inputGroupAppend: 'input-group-append',
      
      // BS4 addon classes
      inputGroupAddon: 'input-group-addon', // Deprecated in BS4, but still supported
      inputGroupText: 'input-group-text' // New BS4 class
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
      if (prev.hasClass(classes.inputGroupBtn) || prev.hasClass(classes.inputGroupPrepend)) {
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
      if (next.hasClass(classes.inputGroupBtn) || next.hasClass(classes.inputGroupAppend)) {
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
    const inputGroupSize = this.detectInputGroupSize();
    let html;

    if (this.settings.verticalbuttons) {
      html = `
        <div class="input-group ${inputGroupSize} bootstrap-touchspin bootstrap-touchspin-injected">
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
        <div class="input-group bootstrap-touchspin bootstrap-touchspin-injected">
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
    this.applySizeClasses();

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
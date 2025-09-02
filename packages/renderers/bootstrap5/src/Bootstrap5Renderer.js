/**
 * Bootstrap 5 Renderer - New Architecture
 * Builds Bootstrap 5 UI elements around TouchSpin input
 */
import AbstractRenderer from '../../../core/src/AbstractRenderer.js';

class Bootstrap5Renderer extends AbstractRenderer {

  init() {
    // Initialize internal element references
    this.prefixEl = null;
    this.postfixEl = null;
    
    // Add form-control class if not present (Bootstrap requirement)
    if (!this.input.classList.contains('form-control')) {
      this.input.classList.add('form-control');
      this._formControlAdded = true; // Track if we added it
    }
    
    // 1. Build and inject DOM structure around input
    this.wrapper = this.buildInputGroup();
    
    // 2. Find created buttons and store prefix/postfix references
    const upButton = this.wrapper.querySelector('[data-touchspin-injected="up"]');
    const downButton = this.wrapper.querySelector('[data-touchspin-injected="down"]');
    this.prefixEl = this.wrapper.querySelector('[data-touchspin-injected="prefix"]');
    this.postfixEl = this.wrapper.querySelector('[data-touchspin-injected="postfix"]');
    
    // 3. Tell core to attach its event handlers
    this.core.attachUpEvents(upButton);
    this.core.attachDownEvents(downButton);
    
    // 4. Register for setting changes we care about
    this.core.observeSetting('prefix', (newValue) => this.updatePrefix(newValue));
    this.core.observeSetting('postfix', (newValue) => this.updatePostfix(newValue));
    this.core.observeSetting('buttonup_class', (newValue) => this.updateButtonClass('up', newValue));
    this.core.observeSetting('buttondown_class', (newValue) => this.updateButtonClass('down', newValue));
    this.core.observeSetting('verticalupclass', (newValue) => this.updateVerticalButtonClass('up', newValue));
    this.core.observeSetting('verticaldownclass', (newValue) => this.updateVerticalButtonClass('down', newValue));
    this.core.observeSetting('verticalup', (newValue) => this.updateVerticalButtonText('up', newValue));
    this.core.observeSetting('verticaldown', (newValue) => this.updateVerticalButtonText('down', newValue));
    this.core.observeSetting('buttonup_txt', (newValue) => this.updateButtonText('up', newValue));
    this.core.observeSetting('buttondown_txt', (newValue) => this.updateButtonText('down', newValue));
    this.core.observeSetting('prefix_extraclass', (newValue) => this.updatePrefixClasses());
    this.core.observeSetting('postfix_extraclass', (newValue) => this.updatePostfixClasses());
  }

  teardown() {
    // Remove form-control class only if we added it
    if (this._formControlAdded) {
      this.input.classList.remove('form-control');
      this._formControlAdded = false;
    }
    
    // Call parent teardown to handle DOM cleanup
    super.teardown();
  }

  buildInputGroup() {
    // Check if input is already inside an input-group
    const existingInputGroup = this.input.closest('.input-group');
    
    if (existingInputGroup) {
      return this.buildAdvancedInputGroup(existingInputGroup);
    } else {
      return this.buildBasicInputGroup();
    }
  }
  
  buildBasicInputGroup() {
    const inputGroupSize = this._detectInputGroupSize();
    const testidAttr = this.getWrapperTestId();
    
    let html;
    if (this.settings.verticalbuttons) {
      html = `
        <div class="input-group ${inputGroupSize} bootstrap-touchspin" data-touchspin-injected="wrapper"${testidAttr}>
          <span class="input-group-text bootstrap-touchspin-prefix ${this.settings.prefix_extraclass || ''}" data-touchspin-injected="prefix">${this.settings.prefix || ''}</span>
          <span class="input-group-text bootstrap-touchspin-postfix ${this.settings.postfix_extraclass || ''}" data-touchspin-injected="postfix">${this.settings.postfix || ''}</span>
          ${this.buildVerticalButtons()}
        </div>
      `;
    } else {
      html = `
        <div class="input-group ${inputGroupSize} bootstrap-touchspin" data-touchspin-injected="wrapper"${testidAttr}>
          <span class="input-group-text bootstrap-touchspin-prefix ${this.settings.prefix_extraclass || ''}" data-touchspin-injected="prefix">${this.settings.prefix || ''}</span>
          <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="${this.settings.buttondown_class || 'btn btn-outline-secondary'} bootstrap-touchspin-down" data-touchspin-injected="down" type="button" aria-label="Decrease value">${this.settings.buttondown_txt || '−'}</button>
          <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="${this.settings.buttonup_class || 'btn btn-outline-secondary'} bootstrap-touchspin-up" data-touchspin-injected="up" type="button" aria-label="Increase value">${this.settings.buttonup_txt || '+'}</button>
          <span class="input-group-text bootstrap-touchspin-postfix ${this.settings.postfix_extraclass || ''}" data-touchspin-injected="postfix">${this.settings.postfix || ''}</span>
        </div>
      `;
    }
    
    // Create wrapper and wrap the input
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html.trim();
    const wrapper = tempDiv.firstChild;
    
    // Insert wrapper and move input into it
    this.input.parentElement.insertBefore(wrapper, this.input);
    
    // Find the position to insert input
    if (this.settings.verticalbuttons) {
      // For vertical buttons, insert after prefix
      const prefixEl = wrapper.querySelector('[data-touchspin-injected="prefix"]');
      wrapper.insertBefore(this.input, prefixEl.nextSibling);
    } else {
      // For horizontal buttons, insert after down button, before up button
      const upButton = wrapper.querySelector('[data-touchspin-injected="up"]');
      wrapper.insertBefore(this.input, upButton);
    }
    
    // Hide empty prefix/postfix (pass wrapper directly since this.wrapper isn't set yet)
    this.hideEmptyPrefixPostfix(wrapper);
    
    return wrapper;
  }
  
  buildAdvancedInputGroup(existingInputGroup) {
    // Add bootstrap-touchspin class to existing input-group
    existingInputGroup.classList.add('bootstrap-touchspin');
    existingInputGroup.setAttribute('data-touchspin-injected', 'wrapper-advanced');
    
    // Add testid if input has one
    const inputTestId = this.input.getAttribute('data-testid');
    if (inputTestId) {
      existingInputGroup.setAttribute('data-testid', `${inputTestId}-wrapper`);
    }
    
    // Create elements based on vertical or horizontal layout
    let elementsHtml;
    if (this.settings.verticalbuttons) {
      elementsHtml = `
        <span class="input-group-text bootstrap-touchspin-prefix ${this.settings.prefix_extraclass || ''}" data-touchspin-injected="prefix">${this.settings.prefix || ''}</span>
        <span class="input-group-text bootstrap-touchspin-postfix ${this.settings.postfix_extraclass || ''}" data-touchspin-injected="postfix">${this.settings.postfix || ''}</span>
        ${this.buildVerticalButtons()}
      `;
    } else {
      elementsHtml = `
        <span class="input-group-text bootstrap-touchspin-prefix ${this.settings.prefix_extraclass || ''}" data-touchspin-injected="prefix">${this.settings.prefix || ''}</span>
        <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="${this.settings.buttondown_class || 'btn btn-outline-secondary'} bootstrap-touchspin-down" data-touchspin-injected="down" type="button" aria-label="Decrease value">${this.settings.buttondown_txt || '−'}</button>
        <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="${this.settings.buttonup_class || 'btn btn-outline-secondary'} bootstrap-touchspin-up" data-touchspin-injected="up" type="button" aria-label="Increase value">${this.settings.buttonup_txt || '+'}</button>
        <span class="input-group-text bootstrap-touchspin-postfix ${this.settings.postfix_extraclass || ''}" data-touchspin-injected="postfix">${this.settings.postfix || ''}</span>
      `;
    }
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = elementsHtml;
    
    // Insert prefix before the input
    const prefixEl = tempDiv.querySelector('[data-touchspin-injected="prefix"]');
    existingInputGroup.insertBefore(prefixEl, this.input);
    
    if (this.settings.verticalbuttons) {
      // For vertical buttons, insert vertical wrapper after input
      const verticalWrapper = tempDiv.querySelector('[data-touchspin-injected="vertical-wrapper"]');
      existingInputGroup.insertBefore(verticalWrapper, this.input.nextSibling);
      
      // Insert postfix after vertical wrapper
      const postfixEl = tempDiv.querySelector('[data-touchspin-injected="postfix"]');
      existingInputGroup.insertBefore(postfixEl, verticalWrapper.nextSibling);
    } else {
      // For horizontal buttons, insert them around the input
      const downButton = tempDiv.querySelector('[data-touchspin-injected="down"]');
      existingInputGroup.insertBefore(downButton, this.input);
      
      const upButton = tempDiv.querySelector('[data-touchspin-injected="up"]');
      existingInputGroup.insertBefore(upButton, this.input.nextSibling);
      
      // Insert postfix after up button
      const postfixEl = tempDiv.querySelector('[data-touchspin-injected="postfix"]');
      existingInputGroup.insertBefore(postfixEl, upButton.nextSibling);
    }
    
    // Store internal references for advanced mode too
    this.prefixEl = prefixEl;
    this.postfixEl = postfixEl;
    
    // Hide empty prefix/postfix
    this.hideEmptyPrefixPostfix(existingInputGroup);
    
    return existingInputGroup;
  }

  _detectInputGroupSize() {
    const classList = this.input.className;
    if (classList.includes('form-control-sm')) {
      return 'input-group-sm';
    } else if (classList.includes('form-control-lg')) {
      return 'input-group-lg';
    }
    return '';
  }

  hideEmptyPrefixPostfix(wrapper = this.wrapper) {
    // Use internal references if available, otherwise query from wrapper
    const prefixEl = this.prefixEl || wrapper.querySelector('[data-touchspin-injected="prefix"]');
    const postfixEl = this.postfixEl || wrapper.querySelector('[data-touchspin-injected="postfix"]');
    
    if (prefixEl && (!this.settings.prefix || this.settings.prefix === '')) {
      prefixEl.style.display = 'none';
    }
    if (postfixEl && (!this.settings.postfix || this.settings.postfix === '')) {
      postfixEl.style.display = 'none';
    }
  }

  updatePrefix(value) {
    // Use internal reference
    const prefixEl = this.prefixEl;
    
    if (value && value !== '') {
      if (prefixEl) {
        prefixEl.textContent = value;
        prefixEl.style.display = '';
        // Update classes in case prefix_extraclass changed
        prefixEl.className = `input-group-text bootstrap-touchspin-prefix ${this.settings.prefix_extraclass || ''}`.trim();
      }
    } else if (prefixEl) {
      // Hide element if value is empty but keep it in DOM
      prefixEl.style.display = 'none';
    }
  }
  
  updatePostfix(value) {
    // Use internal reference
    const postfixEl = this.postfixEl;
    
    if (value && value !== '') {
      if (postfixEl) {
        postfixEl.textContent = value;
        postfixEl.style.display = '';
        // Update classes in case postfix_extraclass changed
        postfixEl.className = `input-group-text bootstrap-touchspin-postfix ${this.settings.postfix_extraclass || ''}`.trim();
      }
    } else if (postfixEl) {
      // Hide element if value is empty but keep it in DOM
      postfixEl.style.display = 'none';
    }
  }
  
  updateButtonClass(type, className) {
    const button = this.wrapper.querySelector(`[data-touchspin-injected="${type}"]`);
    if (button) {
      button.className = `${className || 'btn btn-outline-secondary'} bootstrap-touchspin-${type}`;
    }
  }

  buildVerticalButtons() {
    // Bootstrap 5: Return complete wrapper since there's no outer wrapper in the calling code
    return `
      <span class="input-group-text bootstrap-touchspin-vertical-button-wrapper" data-touchspin-injected="vertical-wrapper">
        <span class="input-group-btn-vertical">
          <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="${this.settings.buttonup_class || 'btn btn-outline-secondary'} ${this.settings.verticalupclass || 'btn btn-outline-secondary'} bootstrap-touchspin-up" data-touchspin-injected="up" type="button" aria-label="Increase value">${this.settings.verticalup || '+'}</button>
          <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="${this.settings.buttondown_class || 'btn btn-outline-secondary'} ${this.settings.verticaldownclass || 'btn btn-outline-secondary'} bootstrap-touchspin-down" data-touchspin-injected="down" type="button" aria-label="Decrease value">${this.settings.verticaldown || '−'}</button>
        </span>
      </span>
    `;
  }

  updateVerticalButtonClass(type, className) {
    const verticalWrapper = this.wrapper.querySelector('[data-touchspin-injected="vertical-wrapper"]');
    if (verticalWrapper) {
      const button = verticalWrapper.querySelector(`[data-touchspin-injected="${type}"]`);
      if (button) {
        // Update the vertical-specific class while preserving base classes
        const baseClasses = this.settings.buttonup_class || this.settings.buttondown_class || 'btn btn-outline-secondary';
        button.className = `${baseClasses} ${className || 'btn btn-outline-secondary'} bootstrap-touchspin-${type}`;
      }
    }
  }

  updateVerticalButtonText(type, text) {
    const verticalWrapper = this.wrapper.querySelector('[data-touchspin-injected="vertical-wrapper"]');
    if (verticalWrapper) {
      const button = verticalWrapper.querySelector(`[data-touchspin-injected="${type}"]`);
      if (button) {
        button.textContent = text || (type === 'up' ? '+' : '−');
      }
    }
  }

  updateButtonText(type, text) {
    const button = this.wrapper.querySelector(`[data-touchspin-injected="${type}"]`);
    if (button) {
      button.textContent = text || (type === 'up' ? '+' : '−');
    }
  }

  updatePrefixClasses() {
    const prefixEl = this.prefixEl;
    if (prefixEl) {
      prefixEl.className = `input-group-text bootstrap-touchspin-prefix ${this.settings.prefix_extraclass || ''}`.trim();
    }
  }

  updatePostfixClasses() {
    const postfixEl = this.postfixEl;
    if (postfixEl) {
      postfixEl.className = `input-group-text bootstrap-touchspin-postfix ${this.settings.postfix_extraclass || ''}`.trim();
    }
  }
}

export default Bootstrap5Renderer;
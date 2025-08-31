/**
 * Bootstrap 4 Renderer - New Architecture
 * Builds Bootstrap 4 UI elements around TouchSpin input
 * Uses input-group-prepend and input-group-append for Bootstrap 4 compatibility
 */
import AbstractRenderer from '../../../core/src/AbstractRenderer.js';

class Bootstrap4Renderer extends AbstractRenderer {

  init() {
    // Add form-control class if not present (Bootstrap requirement)
    if (!this.input.classList.contains('form-control')) {
      this.input.classList.add('form-control');
      this._formControlAdded = true; // Track if we added it
    }
    
    // 1. Build and inject DOM structure around input
    this.wrapper = this.buildInputGroup();
    
    // 2. Find created buttons
    const upButton = this.wrapper.querySelector('[data-touchspin-injected="up"]');
    const downButton = this.wrapper.querySelector('[data-touchspin-injected="down"]');
    
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
          <div class="input-group-prepend bootstrap-touchspin-prefix" data-touchspin-injected="prefix">
            <span class="input-group-text">${this.settings.prefix || ''}</span>
          </div>
          <div class="input-group-append bootstrap-touchspin-postfix" data-touchspin-injected="postfix">
            <span class="input-group-text">${this.settings.postfix || ''}</span>
          </div>
          ${this.buildVerticalButtons()}
        </div>
      `;
    } else {
      html = `
        <div class="input-group ${inputGroupSize} bootstrap-touchspin" data-touchspin-injected="wrapper"${testidAttr}>
          <div class="input-group-prepend bootstrap-touchspin-prefix" data-touchspin-injected="prefix">
            <span class="input-group-text">${this.settings.prefix || ''}</span>
          </div>
          <div class="input-group-prepend">
            <button tabindex="-1" class="${this.settings.buttondown_class || 'btn btn-outline-secondary'} bootstrap-touchspin-down" data-touchspin-injected="down" type="button" aria-label="Decrease value">${this.settings.buttondown_txt || '−'}</button>
          </div>
          <div class="input-group-append">
            <button tabindex="-1" class="${this.settings.buttonup_class || 'btn btn-outline-secondary'} bootstrap-touchspin-up" data-touchspin-injected="up" type="button" aria-label="Increase value">${this.settings.buttonup_txt || '+'}</button>
          </div>
          <div class="input-group-append bootstrap-touchspin-postfix" data-touchspin-injected="postfix">
            <span class="input-group-text">${this.settings.postfix || ''}</span>
          </div>
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
      const prefixWrapper = wrapper.querySelector('[data-touchspin-injected="prefix"]');
      wrapper.insertBefore(this.input, prefixWrapper.nextSibling);
    } else {
      // For horizontal buttons, insert after down button, before up button
      const upButtonWrapper = wrapper.querySelector('.input-group-append');
      wrapper.insertBefore(this.input, upButtonWrapper);
    }
    
    // Hide empty prefix/postfix
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
        <div class="input-group-prepend bootstrap-touchspin-prefix" data-touchspin-injected="prefix">
          <span class="input-group-text">${this.settings.prefix || ''}</span>
        </div>
        <div class="input-group-append bootstrap-touchspin-postfix" data-touchspin-injected="postfix">
          <span class="input-group-text">${this.settings.postfix || ''}</span>
        </div>
        ${this.buildVerticalButtons()}
      `;
    } else {
      elementsHtml = `
        <div class="input-group-prepend bootstrap-touchspin-prefix" data-touchspin-injected="prefix">
          <span class="input-group-text">${this.settings.prefix || ''}</span>
        </div>
        <div class="input-group-prepend">
          <button tabindex="-1" class="${this.settings.buttondown_class || 'btn btn-outline-secondary'} bootstrap-touchspin-down" data-touchspin-injected="down" type="button">${this.settings.buttondown_txt || '-'}</button>
        </div>
        <div class="input-group-append">
          <button tabindex="-1" class="${this.settings.buttonup_class || 'btn btn-outline-secondary'} bootstrap-touchspin-up" data-touchspin-injected="up" type="button">${this.settings.buttonup_txt || '+'}</button>
        </div>
        <div class="input-group-append bootstrap-touchspin-postfix" data-touchspin-injected="postfix">
          <span class="input-group-text">${this.settings.postfix || ''}</span>
        </div>
      `;
    }
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = elementsHtml;
    
    // Insert prefix before the input
    const prefixEl = tempDiv.querySelector('[data-touchspin-injected="prefix"]');
    existingInputGroup.insertBefore(prefixEl, this.input);
    
    if (this.settings.verticalbuttons) {
      // For vertical buttons, insert vertical wrapper after input
      const verticalButtonWrapper = tempDiv.querySelector('[data-touchspin-injected="vertical-wrapper"]');
      existingInputGroup.insertBefore(verticalButtonWrapper, this.input.nextSibling);
      
      // Insert postfix after vertical wrapper
      const postfixEl = tempDiv.querySelector('[data-touchspin-injected="postfix"]');
      existingInputGroup.insertBefore(postfixEl, verticalButtonWrapper.nextSibling);
    } else {
      // For horizontal buttons, insert them around the input
      const downButtonWrapper = tempDiv.querySelector('.input-group-prepend:not([data-touchspin-injected="prefix"])');
      existingInputGroup.insertBefore(downButtonWrapper, this.input);
      
      const upButtonWrapper = tempDiv.querySelector('.input-group-append:not([data-touchspin-injected="postfix"])');
      existingInputGroup.insertBefore(upButtonWrapper, this.input.nextSibling);
      
      // Insert postfix after up button
      const postfixEl = tempDiv.querySelector('[data-touchspin-injected="postfix"]');
      existingInputGroup.insertBefore(postfixEl, upButtonWrapper.nextSibling);
    }
    
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
    const prefixEl = wrapper.querySelector('[data-touchspin-injected="prefix"]');
    const postfixEl = wrapper.querySelector('[data-touchspin-injected="postfix"]');
    
    if (prefixEl && (!this.settings.prefix || this.settings.prefix === '')) {
      prefixEl.remove();
    }
    if (postfixEl && (!this.settings.postfix || this.settings.postfix === '')) {
      postfixEl.remove();
    }
  }

  updatePrefix(value) {
    let prefixEl = this.wrapper.querySelector('[data-touchspin-injected="prefix"]');
    
    if (value && value !== '') {
      if (!prefixEl) {
        // Re-create prefix element if it was removed
        prefixEl = document.createElement('div');
        prefixEl.className = 'input-group-prepend bootstrap-touchspin-prefix';
        prefixEl.setAttribute('data-touchspin-injected', 'prefix');
        prefixEl.innerHTML = `<span class="input-group-text">${value}</span>`;
        // Insert at the beginning of the wrapper
        this.wrapper.insertBefore(prefixEl, this.wrapper.firstChild);
      } else {
        prefixEl.querySelector('.input-group-text').textContent = value;
      }
    } else if (prefixEl) {
      // Remove element if value is empty
      prefixEl.remove();
    }
  }
  
  updatePostfix(value) {
    let postfixEl = this.wrapper.querySelector('[data-touchspin-injected="postfix"]');
    
    if (value && value !== '') {
      if (!postfixEl) {
        // Re-create postfix element if it was removed
        postfixEl = document.createElement('div');
        postfixEl.className = 'input-group-append bootstrap-touchspin-postfix';
        postfixEl.setAttribute('data-touchspin-injected', 'postfix');
        postfixEl.innerHTML = `<span class="input-group-text">${value}</span>`;
        // Insert at the end of the wrapper
        this.wrapper.appendChild(postfixEl);
      } else {
        postfixEl.querySelector('.input-group-text').textContent = value;
      }
    } else if (postfixEl) {
      // Remove element if value is empty
      postfixEl.remove();
    }
  }
  
  updateButtonClass(type, className) {
    const button = this.wrapper.querySelector(`[data-touchspin-injected="${type}"]`);
    if (button) {
      button.className = `${className || 'btn btn-outline-secondary'} bootstrap-touchspin-${type}`;
    }
  }

  buildVerticalButtons() {
    // Bootstrap 4: Return complete structure with input-group-text wrapper (matches original)
    return `
      <span class="input-group-text bootstrap-touchspin-vertical-button-wrapper" data-touchspin-injected="vertical-wrapper">
        <span class="input-group-btn-vertical">
          <button tabindex="-1" class="${this.settings.buttonup_class || 'btn btn-outline-secondary'} ${this.settings.verticalupclass || 'btn btn-outline-secondary'} bootstrap-touchspin-up" data-touchspin-injected="up" type="button" aria-label="Increase value">${this.settings.verticalup || '+'}</button>
          <button tabindex="-1" class="${this.settings.buttondown_class || 'btn btn-outline-secondary'} ${this.settings.verticaldownclass || 'btn btn-outline-secondary'} bootstrap-touchspin-down" data-touchspin-injected="down" type="button" aria-label="Decrease value">${this.settings.verticaldown || '−'}</button>
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
}

export default Bootstrap4Renderer;
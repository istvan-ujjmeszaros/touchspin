/**
 * Bootstrap 3 Renderer - New Architecture
 * Builds Bootstrap 3 UI elements around TouchSpin input
 * Uses input-group-btn and input-group-addon for Bootstrap 3 compatibility
 */
import AbstractRenderer from '../../../core/src/AbstractRenderer.js';

class Bootstrap3Renderer extends AbstractRenderer {

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
          <span class="input-group-addon" data-touchspin-injected="prefix">${this.settings.prefix || ''}</span>
          <span class="input-group-addon" data-touchspin-injected="postfix">${this.settings.postfix || ''}</span>
          <span class="input-group-btn bootstrap-touchspin-vertical-button-wrapper" data-touchspin-injected="vertical-wrapper">
            ${this.buildVerticalButtons()}
          </span>
        </div>
      `;
    } else {
      html = `
        <div class="input-group ${inputGroupSize} bootstrap-touchspin" data-touchspin-injected="wrapper"${testidAttr}>
          <span class="input-group-addon" data-touchspin-injected="prefix">${this.settings.prefix || ''}</span>
          <span class="input-group-btn" data-touchspin-injected="down-wrapper">
            <button tabindex="-1" class="${this.settings.buttondown_class || 'btn btn-default'} bootstrap-touchspin-down" data-touchspin-injected="down" type="button">${this.settings.buttondown_txt || '-'}</button>
          </span>
          <span class="input-group-btn" data-touchspin-injected="up-wrapper">
            <button tabindex="-1" class="${this.settings.buttonup_class || 'btn btn-default'} bootstrap-touchspin-up" data-touchspin-injected="up" type="button">${this.settings.buttonup_txt || '+'}</button>
          </span>
          <span class="input-group-addon" data-touchspin-injected="postfix">${this.settings.postfix || ''}</span>
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
      // For horizontal buttons, find the position after down button, before up button
      const upButton = wrapper.querySelector('.input-group-btn:has([data-touchspin-injected="up"])') || wrapper.querySelector('[data-touchspin-injected="up-wrapper"]');
      wrapper.insertBefore(this.input, upButton);
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
        <span class="input-group-addon" data-touchspin-injected="prefix">${this.settings.prefix || ''}</span>
        <span class="input-group-addon" data-touchspin-injected="postfix">${this.settings.postfix || ''}</span>
        <span class="input-group-btn bootstrap-touchspin-vertical-button-wrapper" data-touchspin-injected="vertical-wrapper">
          ${this.buildVerticalButtons()}
        </span>
      `;
    } else {
      elementsHtml = `
        <span class="input-group-addon" data-touchspin-injected="prefix">${this.settings.prefix || ''}</span>
        <span class="input-group-btn" data-touchspin-injected="down-wrapper">
          <button tabindex="-1" class="${this.settings.buttondown_class || 'btn btn-default'} bootstrap-touchspin-down" data-touchspin-injected="down" type="button">${this.settings.buttondown_txt || '-'}</button>
        </span>
        <span class="input-group-btn" data-touchspin-injected="up-wrapper">
          <button tabindex="-1" class="${this.settings.buttonup_class || 'btn btn-default'} bootstrap-touchspin-up" data-touchspin-injected="up" type="button">${this.settings.buttonup_txt || '+'}</button>
        </span>
        <span class="input-group-addon" data-touchspin-injected="postfix">${this.settings.postfix || ''}</span>
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
      const downButtonWrapper = tempDiv.querySelector('.input-group-btn:has([data-touchspin-injected="down"])') || tempDiv.querySelector('[data-touchspin-injected="down-wrapper"]');
      existingInputGroup.insertBefore(downButtonWrapper, this.input);
      
      const upButtonWrapper = tempDiv.querySelector('.input-group-btn:has([data-touchspin-injected="up"])') || tempDiv.querySelector('[data-touchspin-injected="up-wrapper"]');
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
    if (classList.includes('input-sm')) {
      return 'input-group-sm';
    } else if (classList.includes('input-lg')) {
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
        prefixEl = document.createElement('span');
        prefixEl.className = 'input-group-addon';
        prefixEl.setAttribute('data-touchspin-injected', 'prefix');
        prefixEl.textContent = value;
        // Insert at the beginning of the wrapper
        this.wrapper.insertBefore(prefixEl, this.wrapper.firstChild);
      } else {
        prefixEl.textContent = value;
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
        postfixEl = document.createElement('span');
        postfixEl.className = 'input-group-addon';
        postfixEl.setAttribute('data-touchspin-injected', 'postfix');
        postfixEl.textContent = value;
        // Insert at the end of the wrapper
        this.wrapper.appendChild(postfixEl);
      } else {
        postfixEl.textContent = value;
      }
    } else if (postfixEl) {
      // Remove element if value is empty
      postfixEl.remove();
    }
  }
  
  updateButtonClass(type, className) {
    const button = this.wrapper.querySelector(`[data-touchspin-injected="${type}"]`);
    if (button) {
      button.className = `${className || 'btn btn-default'} bootstrap-touchspin-${type}`;
    }
  }

  buildVerticalButtons() {
    // Bootstrap 3: Return content for input-group-btn wrapper
    // The outer wrapper is handled by the calling code
    return `
      <span class="input-group-btn-vertical">
        <button tabindex="-1" class="${this.settings.buttonup_class || 'btn btn-default'} ${this.settings.verticalupclass || 'btn btn-default'} bootstrap-touchspin-up" data-touchspin-injected="up" type="button">${this.settings.verticalup || '+'}</button>
        <button tabindex="-1" class="${this.settings.buttondown_class || 'btn btn-default'} ${this.settings.verticaldownclass || 'btn btn-default'} bootstrap-touchspin-down" data-touchspin-injected="down" type="button">${this.settings.verticaldown || '-'}</button>
      </span>
    `;
  }

  updateVerticalButtonClass(type, className) {
    const verticalWrapper = this.wrapper.querySelector('[data-touchspin-injected="vertical-wrapper"]');
    if (verticalWrapper) {
      const button = verticalWrapper.querySelector(`[data-touchspin-injected="${type}"]`);
      if (button) {
        // Update the vertical-specific class while preserving base classes
        const baseClasses = this.settings.buttonup_class || this.settings.buttondown_class || 'btn btn-default';
        button.className = `${baseClasses} ${className || 'btn btn-default'} bootstrap-touchspin-${type}`;
      }
    }
  }

  updateVerticalButtonText(type, text) {
    const verticalWrapper = this.wrapper.querySelector('[data-touchspin-injected="vertical-wrapper"]');
    if (verticalWrapper) {
      const button = verticalWrapper.querySelector(`[data-touchspin-injected="${type}"]`);
      if (button) {
        button.textContent = text || (type === 'up' ? '+' : '-');
      }
    }
  }
}

export default Bootstrap3Renderer;
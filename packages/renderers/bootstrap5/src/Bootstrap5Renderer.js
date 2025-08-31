/**
 * Bootstrap 5 Renderer - New Architecture
 * Builds Bootstrap 5 UI elements around TouchSpin input
 */
import AbstractRenderer from '../../../core/src/AbstractRenderer.js';

class Bootstrap5Renderer extends AbstractRenderer {

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
    
    const html = `
      <div class="input-group ${inputGroupSize} bootstrap-touchspin" data-touchspin-injected="wrapper"${testidAttr}>
        <span class="input-group-text" data-touchspin-injected="prefix">${this.settings.prefix || ''}</span>
        <button tabindex="-1" class="${this.settings.buttondown_class || 'btn btn-outline-secondary'} bootstrap-touchspin-down" data-touchspin-injected="down" type="button">${this.settings.buttondown_txt || '-'}</button>
        <button tabindex="-1" class="${this.settings.buttonup_class || 'btn btn-outline-secondary'} bootstrap-touchspin-up" data-touchspin-injected="up" type="button">${this.settings.buttonup_txt || '+'}</button>
        <span class="input-group-text" data-touchspin-injected="postfix">${this.settings.postfix || ''}</span>
      </div>
    `;
    
    // Create wrapper and wrap the input
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html.trim();
    const wrapper = tempDiv.firstChild;
    
    // Insert wrapper and move input into it
    this.input.parentElement.insertBefore(wrapper, this.input);
    
    // Find the position to insert input (after down button, before up button)
    const upButton = wrapper.querySelector('[data-touchspin-injected="up"]');
    wrapper.insertBefore(this.input, upButton);
    
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
    
    // Create buttons and prefix/postfix elements
    const elementsHtml = `
      <span class="input-group-text" data-touchspin-injected="prefix">${this.settings.prefix || ''}</span>
      <button tabindex="-1" class="${this.settings.buttondown_class || 'btn btn-outline-secondary'} bootstrap-touchspin-down" data-touchspin-injected="down" type="button">${this.settings.buttondown_txt || '-'}</button>
      <button tabindex="-1" class="${this.settings.buttonup_class || 'btn btn-outline-secondary'} bootstrap-touchspin-up" data-touchspin-injected="up" type="button">${this.settings.buttonup_txt || '+'}</button>
      <span class="input-group-text" data-touchspin-injected="postfix">${this.settings.postfix || ''}</span>
    `;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = elementsHtml;
    
    // Insert prefix before the input
    const prefixEl = tempDiv.querySelector('[data-touchspin-injected="prefix"]');
    existingInputGroup.insertBefore(prefixEl, this.input);
    
    // Insert down button before the input
    const downButton = tempDiv.querySelector('[data-touchspin-injected="down"]');
    existingInputGroup.insertBefore(downButton, this.input);
    
    // Insert up button after the input
    const upButton = tempDiv.querySelector('[data-touchspin-injected="up"]');
    existingInputGroup.insertBefore(upButton, this.input.nextSibling);
    
    // Insert postfix after the up button
    const postfixEl = tempDiv.querySelector('[data-touchspin-injected="postfix"]');
    existingInputGroup.insertBefore(postfixEl, upButton.nextSibling);
    
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
        prefixEl = document.createElement('span');
        prefixEl.className = 'input-group-text';
        prefixEl.setAttribute('data-touchspin-injected', 'prefix');
        // Insert at the beginning of the wrapper
        this.wrapper.insertBefore(prefixEl, this.wrapper.firstChild);
      }
      prefixEl.textContent = value;
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
        postfixEl.className = 'input-group-text';
        postfixEl.setAttribute('data-touchspin-injected', 'postfix');
        // Insert at the end of the wrapper
        this.wrapper.appendChild(postfixEl);
      }
      postfixEl.textContent = value;
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
}

export default Bootstrap5Renderer;
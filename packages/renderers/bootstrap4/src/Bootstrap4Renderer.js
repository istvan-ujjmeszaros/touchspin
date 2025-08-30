/**
 * Bootstrap 4 Renderer - New Architecture
 * Builds Bootstrap 4 UI elements around TouchSpin input
 * Uses input-group-prepend and input-group-append for Bootstrap 4 compatibility
 */
import AbstractRenderer from '../../../core/src/AbstractRenderer.js';

class Bootstrap4Renderer extends AbstractRenderer {

  init() {
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

  // teardown() uses inherited removeInjectedElements() - no override needed

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
    
    const html = `
      <div class="input-group ${inputGroupSize} bootstrap-touchspin" data-touchspin-injected="wrapper">
        <div class="input-group-prepend" data-touchspin-injected="prefix">
          <span class="input-group-text">${this.settings.prefix || ''}</span>
        </div>
        <div class="input-group-prepend">
          <button tabindex="-1" class="${this.settings.buttondown_class || 'btn btn-outline-secondary'} bootstrap-touchspin-down" data-touchspin-injected="down" type="button">${this.settings.buttondown_txt || '-'}</button>
        </div>
        <div class="input-group-append">
          <button tabindex="-1" class="${this.settings.buttonup_class || 'btn btn-outline-secondary'} bootstrap-touchspin-up" data-touchspin-injected="up" type="button">${this.settings.buttonup_txt || '+'}</button>
        </div>
        <div class="input-group-append" data-touchspin-injected="postfix">
          <span class="input-group-text">${this.settings.postfix || ''}</span>
        </div>
      </div>
    `;
    
    // Create wrapper and wrap the input
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html.trim();
    const wrapper = tempDiv.firstChild;
    
    // Insert wrapper and move input into it
    this.input.parentElement.insertBefore(wrapper, this.input);
    
    // Find the position to insert input (after down button, before up button)
    const upButtonWrapper = wrapper.querySelector('.input-group-append');
    wrapper.insertBefore(this.input, upButtonWrapper);
    
    // Hide empty prefix/postfix
    this.hideEmptyPrefixPostfix(wrapper);
    
    return wrapper;
  }
  
  buildAdvancedInputGroup(existingInputGroup) {
    // Add bootstrap-touchspin class to existing input-group
    existingInputGroup.classList.add('bootstrap-touchspin');
    existingInputGroup.setAttribute('data-touchspin-injected', 'wrapper-advanced');
    
    // Create buttons and prefix/postfix elements with Bootstrap 4 structure
    const elementsHtml = `
      <div class="input-group-prepend" data-touchspin-injected="prefix">
        <span class="input-group-text">${this.settings.prefix || ''}</span>
      </div>
      <div class="input-group-prepend">
        <button tabindex="-1" class="${this.settings.buttondown_class || 'btn btn-outline-secondary'} bootstrap-touchspin-down" data-touchspin-injected="down" type="button">${this.settings.buttondown_txt || '-'}</button>
      </div>
      <div class="input-group-append">
        <button tabindex="-1" class="${this.settings.buttonup_class || 'btn btn-outline-secondary'} bootstrap-touchspin-up" data-touchspin-injected="up" type="button">${this.settings.buttonup_txt || '+'}</button>
      </div>
      <div class="input-group-append" data-touchspin-injected="postfix">
        <span class="input-group-text">${this.settings.postfix || ''}</span>
      </div>
    `;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = elementsHtml;
    
    // Insert prefix before the input
    const prefixEl = tempDiv.querySelector('[data-touchspin-injected="prefix"]');
    existingInputGroup.insertBefore(prefixEl, this.input);
    
    // Insert down button before the input
    const downButtonWrapper = tempDiv.querySelector('.input-group-prepend:not([data-touchspin-injected="prefix"])');
    existingInputGroup.insertBefore(downButtonWrapper, this.input);
    
    // Insert up button after the input
    const upButtonWrapper = tempDiv.querySelector('.input-group-append:not([data-touchspin-injected="postfix"])');
    existingInputGroup.insertBefore(upButtonWrapper, this.input.nextSibling);
    
    // Insert postfix after the up button
    const postfixEl = tempDiv.querySelector('[data-touchspin-injected="postfix"]');
    existingInputGroup.insertBefore(postfixEl, upButtonWrapper.nextSibling);
    
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
        prefixEl.className = 'input-group-prepend';
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
        postfixEl.className = 'input-group-append';
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
}

export default Bootstrap4Renderer;
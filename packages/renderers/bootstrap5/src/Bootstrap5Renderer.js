/**
 * Bootstrap 5 Renderer - New Architecture
 * Builds Bootstrap 5 UI elements around TouchSpin input
 */
import AbstractRenderer from '../../../core/src/AbstractRenderer.js';

class Bootstrap5Renderer extends AbstractRenderer {

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
      prefixEl.style.display = 'none';
    }
    if (postfixEl && (!this.settings.postfix || this.settings.postfix === '')) {
      postfixEl.style.display = 'none';
    }
  }

  updatePrefix(value) {
    const prefixEl = this.wrapper.querySelector('[data-touchspin-injected="prefix"]');
    if (prefixEl) {
      prefixEl.textContent = value || '';
      prefixEl.style.display = value ? '' : 'none';
    }
  }
  
  updatePostfix(value) {
    const postfixEl = this.wrapper.querySelector('[data-touchspin-injected="postfix"]');
    if (postfixEl) {
      postfixEl.textContent = value || '';
      postfixEl.style.display = value ? '' : 'none';
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
/**
 * Tailwind CSS Renderer - New Architecture
 * Uses Tailwind utility classes only; no Bootstrap CSS dependency.
 */
import AbstractRenderer from '../../../core/src/AbstractRenderer.js';

class TailwindRenderer extends AbstractRenderer {

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
    this.core.observeSetting('verticalupclass', (newValue) => this.updateVerticalButtonClass('up', newValue));
    this.core.observeSetting('verticaldownclass', (newValue) => this.updateVerticalButtonClass('down', newValue));
    this.core.observeSetting('verticalup', (newValue) => this.updateVerticalButtonText('up', newValue));
    this.core.observeSetting('verticaldown', (newValue) => this.updateVerticalButtonText('down', newValue));
  }

  // teardown() uses inherited removeInjectedElements() - no override needed

  buildInputGroup() {
    // Check if input is already inside a flex container
    const existingContainer = this.input.closest('.flex');
    
    if (existingContainer && existingContainer.classList.contains('rounded-md')) {
      return this.buildAdvancedInputGroup(existingContainer);
    } else {
      return this.buildBasicInputGroup();
    }
  }

  buildBasicInputGroup() {
    const inputSize = this._detectInputSize();
    const isVertical = this.settings.verticalbuttons;
    const testidAttr = this.getWrapperTestId();
    
    let html;
    if (isVertical) {
      html = `
        <div class="flex rounded-md shadow-sm border border-gray-300 bootstrap-touchspin focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 has-[:disabled]:opacity-60 has-[:disabled]:bg-gray-50 has-[:read-only]:bg-gray-50" data-touchspin-injected="wrapper"${testidAttr}>
          <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon" data-touchspin-injected="prefix">${this.settings.prefix || ''}</span>
          ${this.buildVerticalButtons()}
          <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon" data-touchspin-injected="postfix">${this.settings.postfix || ''}</span>
        </div>
      `;
    } else {
      html = `
        <div class="flex rounded-md shadow-sm border border-gray-300 bootstrap-touchspin focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 has-[:disabled]:opacity-60 has-[:disabled]:bg-gray-50 has-[:read-only]:bg-gray-50" data-touchspin-injected="wrapper"${testidAttr}>
          <button tabindex="-1" class="inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border-0 rounded-l-md tailwind-btn bootstrap-touchspin-down ${this.settings.buttondown_class || ''}" data-touchspin-injected="down" type="button">${this.settings.buttondown_txt || '-'}</button>
          <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon" data-touchspin-injected="prefix">${this.settings.prefix || ''}</span>
          <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon" data-touchspin-injected="postfix">${this.settings.postfix || ''}</span>
          <button tabindex="-1" class="inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border-0 rounded-r-md tailwind-btn bootstrap-touchspin-up ${this.settings.buttonup_class || ''}" data-touchspin-injected="up" type="button">${this.settings.buttonup_txt || '+'}</button>
        </div>
      `;
    }
    
    // Create wrapper and wrap the input
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html.trim();
    const wrapper = tempDiv.firstChild;
    
    // Insert wrapper and move input into it
    this.input.parentElement.insertBefore(wrapper, this.input);
    
    // Find the position to insert input (after prefix, before postfix)
    const prefixEl = wrapper.querySelector('[data-touchspin-injected="prefix"]');
    if (prefixEl) {
      wrapper.insertBefore(this.input, prefixEl.nextSibling);
    } else {
      const postfixEl = wrapper.querySelector('[data-touchspin-injected="postfix"]');
      wrapper.insertBefore(this.input, postfixEl);
    }
    
    // Apply input styling
    this.input.className = this.input.className.replace('form-control', '');
    this.input.classList.add('flex-1', 'px-3', 'py-2', 'border-0', 'bg-transparent', 'focus:outline-none', 'text-gray-900', 'placeholder-gray-500');
    
    // Apply size classes
    this._applySizeClasses(wrapper);
    
    // Hide empty prefix/postfix
    this.hideEmptyPrefixPostfix(wrapper);
    
    return wrapper;
  }

  buildAdvancedInputGroup(existingContainer) {
    // Add bootstrap-touchspin class to existing container
    existingContainer.classList.add('bootstrap-touchspin');
    existingContainer.setAttribute('data-touchspin-injected', 'wrapper-advanced');
    
    // Add testid if input has one
    const inputTestId = this.input.getAttribute('data-testid');
    if (inputTestId) {
      existingContainer.setAttribute('data-testid', `${inputTestId}-wrapper`);
    }
    
    const isVertical = this.settings.verticalbuttons;
    
    // Create elements HTML
    let elementsHtml;
    if (isVertical) {
      elementsHtml = `
        <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon" data-touchspin-injected="prefix">${this.settings.prefix || ''}</span>
        ${this.buildVerticalButtons()}
        <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon" data-touchspin-injected="postfix">${this.settings.postfix || ''}</span>
      `;
    } else {
      elementsHtml = `
        <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon" data-touchspin-injected="prefix">${this.settings.prefix || ''}</span>
        <button tabindex="-1" class="inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border-0 tailwind-btn bootstrap-touchspin-down ${this.settings.buttondown_class || ''}" data-touchspin-injected="down" type="button">${this.settings.buttondown_txt || '-'}</button>
        <button tabindex="-1" class="inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border-0 tailwind-btn bootstrap-touchspin-up ${this.settings.buttonup_class || ''}" data-touchspin-injected="up" type="button">${this.settings.buttonup_txt || '+'}</button>
        <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon" data-touchspin-injected="postfix">${this.settings.postfix || ''}</span>
      `;
    }
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = elementsHtml;
    
    // Insert prefix before the input
    const prefixEl = tempDiv.querySelector('[data-touchspin-injected="prefix"]');
    existingContainer.insertBefore(prefixEl, this.input);
    
    if (isVertical) {
      // Insert vertical button wrapper after the input
      const verticalWrapper = tempDiv.querySelector('[data-touchspin-injected="vertical-wrapper"]');
      existingContainer.insertBefore(verticalWrapper, this.input.nextSibling);
    } else {
      // Insert down button before the input
      const downButton = tempDiv.querySelector('[data-touchspin-injected="down"]');
      existingContainer.insertBefore(downButton, this.input);
      
      // Insert up button after the input
      const upButton = tempDiv.querySelector('[data-touchspin-injected="up"]');
      existingContainer.insertBefore(upButton, this.input.nextSibling);
    }
    
    // Insert postfix after everything
    const postfixEl = tempDiv.querySelector('[data-touchspin-injected="postfix"]');
    existingContainer.appendChild(postfixEl);
    
    // Apply input styling
    this.input.className = this.input.className.replace('form-control', '');
    this.input.classList.add('flex-1', 'px-3', 'py-2', 'border-0', 'bg-transparent', 'focus:outline-none', 'text-gray-900', 'placeholder-gray-500');
    
    // Apply size classes
    this._applySizeClasses(existingContainer);
    
    // Hide empty prefix/postfix
    this.hideEmptyPrefixPostfix(existingContainer);
    
    return existingContainer;
  }

  _detectInputSize() {
    const classList = this.input.className;
    if (classList.includes('text-sm') || classList.includes('py-1')) {
      return 'text-sm py-1 px-2';
    } else if (classList.includes('text-lg') || classList.includes('py-3')) {
      return 'text-lg py-3 px-4';
    }
    return 'text-base py-2 px-3';
  }

  _applySizeClasses(wrapper = this.wrapper) {
    const s = this._detectInputSize();
    if (s.includes('text-sm')) {
      wrapper.classList.add('text-sm');
      wrapper.querySelectorAll('.tailwind-btn').forEach(btn => {
        btn.classList.add('py-1', 'px-2', 'text-sm');
      });
      wrapper.querySelectorAll('.tailwind-addon').forEach(addon => {
        addon.classList.add('py-1', 'px-2', 'text-sm');
      });
    } else if (s.includes('text-lg')) {
      wrapper.classList.add('text-lg');
      wrapper.querySelectorAll('.tailwind-btn').forEach(btn => {
        btn.classList.add('py-3', 'px-4', 'text-lg');
      });
      wrapper.querySelectorAll('.tailwind-addon').forEach(addon => {
        addon.classList.add('py-3', 'px-4', 'text-lg');
      });
    }
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
        prefixEl.className = 'inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon';
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
        postfixEl.className = 'inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon';
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
      // Remove old custom classes and add new ones
      const baseClasses = 'inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border-0 tailwind-btn';
      const directionalClass = type === 'up' ? 'bootstrap-touchspin-up' : 'bootstrap-touchspin-down';
      button.className = `${baseClasses} ${directionalClass} ${className || ''}`;
    }
  }

  buildVerticalButtons() {
    return `
      <div class="flex flex-col ml-1 bootstrap-touchspin-vertical-button-wrapper" data-touchspin-injected="vertical-wrapper">
        <button tabindex="-1" class="inline-flex items-center justify-center px-2 py-1 text-xs ${this.settings.verticalupclass || 'bg-gray-100 hover:bg-gray-200 text-gray-700'} font-medium border border-gray-300 rounded-t tailwind-btn bootstrap-touchspin-up disabled:opacity-50 disabled:cursor-not-allowed" data-touchspin-injected="up" type="button">${this.settings.verticalup || '+'}</button>
        <button tabindex="-1" class="inline-flex items-center justify-center px-2 py-1 text-xs ${this.settings.verticaldownclass || 'bg-gray-100 hover:bg-gray-200 text-gray-700'} font-medium border border-t-0 border-gray-300 rounded-b tailwind-btn bootstrap-touchspin-down disabled:opacity-50 disabled:cursor-not-allowed" data-touchspin-injected="down" type="button">${this.settings.verticaldown || '-'}</button>
      </div>
    `;
  }

  updateVerticalButtonClass(type, className) {
    const verticalWrapper = this.wrapper.querySelector('[data-touchspin-injected="vertical-wrapper"]');
    if (verticalWrapper) {
      const button = verticalWrapper.querySelector(`[data-touchspin-injected="${type}"]`);
      if (button) {
        // Update the vertical-specific class while preserving base classes
        const baseClasses = 'inline-flex items-center justify-center px-2 py-1 text-xs font-medium border border-gray-300 tailwind-btn disabled:opacity-50 disabled:cursor-not-allowed';
        const roundingClass = type === 'up' ? 'rounded-t border-b-0' : 'rounded-b border-t-0';
        const directionalClass = `bootstrap-touchspin-${type}`;
        button.className = `${baseClasses} ${roundingClass} ${directionalClass} ${className || 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`;
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

export default TailwindRenderer;

/**
 * Tailwind CSS Renderer - New Architecture
 * Using Tailwind utility classes only; no external CSS dependency.
 */
import AbstractRenderer from '../../../core/src/AbstractRenderer.js';

class TailwindRenderer extends AbstractRenderer {

  init() {
    // Initialize internal element references
    this.prefixEl = null;
    this.postfixEl = null;

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
    this.core.observeSetting('verticalbuttons', (newValue) => this.handleVerticalButtonsChange(newValue));
    this.core.observeSetting('focusablebuttons', (newValue) => this.updateButtonFocusability(newValue));
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
    const _inputSize = this._detectInputSize();
    const isVertical = this.settings.verticalbuttons;

    let html;
    if (isVertical) {
      html = `
        <div class="flex rounded-md shadow-sm border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 has-[:disabled]:opacity-60 has-[:disabled]:bg-gray-50 has-[:read-only]:bg-gray-50" data-touchspin-injected="wrapper">
          <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 rounded-l-md tailwind-addon ${this.settings.prefix_extraclass || ''}" data-touchspin-injected="prefix"${this.getPrefixTestId()}>${this.settings.prefix || ''}</span>
          <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon ${this.settings.postfix_extraclass || ''}" data-touchspin-injected="postfix"${this.getPostfixTestId()}>${this.settings.postfix || ''}</span>
          ${this.buildVerticalButtons()}
        </div>
      `;
    } else {
      html = `
        <div class="flex rounded-md shadow-sm border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 has-[:disabled]:opacity-60 has-[:disabled]:bg-gray-50 has-[:read-only]:bg-gray-50" data-touchspin-injected="wrapper">
          <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border-0 rounded-l-md tailwind-btn ${this.settings.buttondown_class || ''}" data-touchspin-injected="down"${this.getDownButtonTestId()} type="button" aria-label="Decrease value">${this.settings.buttondown_txt || '−'}</button>
          <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon ${this.settings.prefix_extraclass || ''}" data-touchspin-injected="prefix"${this.getPrefixTestId()}>${this.settings.prefix || ''}</span>
          <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon ${this.settings.postfix_extraclass || ''}" data-touchspin-injected="postfix"${this.getPostfixTestId()}>${this.settings.postfix || ''}</span>
          <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border-0 rounded-r-md tailwind-btn ${this.settings.buttonup_class || ''}" data-touchspin-injected="up"${this.getUpButtonTestId()} type="button" aria-label="Increase value">${this.settings.buttonup_txt || '+'}</button>
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
    existingContainer.setAttribute('data-touchspin-injected', 'wrapper-advanced');

    // Add testid if wrapper doesn't already have one and input has one
    const inputTestId = this.input.getAttribute('data-testid');
    const existingWrapperTestId = existingContainer.getAttribute('data-testid');
    if (!existingWrapperTestId && inputTestId) {
      existingContainer.setAttribute('data-testid', `${inputTestId}-wrapper`);
    }

    const isVertical = this.settings.verticalbuttons;

    // Create elements HTML
    let elementsHtml;
    if (isVertical) {
      elementsHtml = `
        <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon ${this.settings.prefix_extraclass || ''}" data-touchspin-injected="prefix"${this.getPrefixTestId()}>${this.settings.prefix || ''}</span>
        ${this.buildVerticalButtons()}
        <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon ${this.settings.postfix_extraclass || ''}" data-touchspin-injected="postfix"${this.getPostfixTestId()}>${this.settings.postfix || ''}</span>
      `;
    } else {
      elementsHtml = `
        <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon ${this.settings.prefix_extraclass || ''}" data-touchspin-injected="prefix"${this.getPrefixTestId()}>${this.settings.prefix || ''}</span>
        <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border-0 tailwind-btn ${this.settings.buttondown_class || ''}" data-touchspin-injected="down"${this.getDownButtonTestId()} type="button" aria-label="Decrease value">${this.settings.buttondown_txt || '−'}</button>
        <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border-0 tailwind-btn ${this.settings.buttonup_class || ''}" data-touchspin-injected="up"${this.getUpButtonTestId()} type="button" aria-label="Increase value">${this.settings.buttonup_txt || '+'}</button>
        <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon ${this.settings.postfix_extraclass || ''}" data-touchspin-injected="postfix"${this.getPostfixTestId()}>${this.settings.postfix || ''}</span>
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

    // Store internal references for advanced mode too
    this.prefixEl = prefixEl;
    this.postfixEl = postfixEl;

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
        prefixEl.className = `inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon ${this.settings.prefix_extraclass || ''}`.trim();
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
        postfixEl.className = `inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon ${this.settings.postfix_extraclass || ''}`.trim();
      }
    } else if (postfixEl) {
      // Hide element if value is empty but keep it in DOM
      postfixEl.style.display = 'none';
    }
  }

  updateButtonClass(type, className) {
    const button = this.wrapper.querySelector(`[data-touchspin-injected="${type}"]`);
    if (button) {
      // Remove old custom classes and add new ones
      const baseClasses = 'inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border-0 tailwind-btn';
      button.className = `${baseClasses} ${className || ''}`;
    }
  }

  buildVerticalButtons() {
    return `
      <div class="flex flex-col" data-touchspin-injected="vertical-wrapper">
        <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="inline-flex items-center justify-center px-2 py-1 text-xs ${this.settings.verticalupclass || 'bg-gray-100 hover:bg-gray-200 text-gray-700'} font-medium border border-gray-300 rounded-tr tailwind-btn disabled:opacity-50 disabled:cursor-not-allowed" data-touchspin-injected="up"${this.getUpButtonTestId()} type="button" aria-label="Increase value">${this.settings.verticalup || '+'}</button>
        <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="inline-flex items-center justify-center px-2 py-1 text-xs ${this.settings.verticaldownclass || 'bg-gray-100 hover:bg-gray-200 text-gray-700'} font-medium border border-t-0 border-gray-300 rounded-br tailwind-btn disabled:opacity-50 disabled:cursor-not-allowed" data-touchspin-injected="down"${this.getDownButtonTestId()} type="button" aria-label="Decrease value">${this.settings.verticaldown || '−'}</button>
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
        button.className = `${baseClasses} ${roundingClass} ${className || 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`;
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
      prefixEl.className = `inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon ${this.settings.prefix_extraclass || ''}`.trim();
    }
  }

  updatePostfixClasses() {
    const postfixEl = this.postfixEl;
    if (postfixEl) {
      postfixEl.className = `inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon ${this.settings.postfix_extraclass || ''}`.trim();
    }
  }

  handleVerticalButtonsChange(newValue) {
    // Remove old DOM and rebuild with new layout
    this.rebuildDOM();
  }

  rebuildDOM() {
    // Remove old DOM and rebuild with current settings
    this.removeInjectedElements();
    // Reset wrapper reference since it was removed
    this.wrapper = null;
    this.prefixEl = null;
    this.postfixEl = null;
    this.buildAndAttachDOM();
  }

  buildAndAttachDOM() {
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
  }

  updateButtonFocusability(newValue) {
    // Find all buttons and update their tabindex
    const buttons = this.wrapper.querySelectorAll('[data-touchspin-injected="up"], [data-touchspin-injected="down"]');
    const tabindex = newValue ? '0' : '-1';
    buttons.forEach(button => {
      button.setAttribute('tabindex', tabindex);
    });
  }

}

export default TailwindRenderer;

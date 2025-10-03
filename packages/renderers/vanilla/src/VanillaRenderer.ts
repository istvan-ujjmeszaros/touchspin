/**
 * VanillaRenderer - Vanilla CSS-based TouchSpin renderer
 * Framework-agnostic renderer using pure CSS without dependencies
 */
import { AbstractRenderer } from '@touchspin/core/renderer';

class VanillaRenderer extends AbstractRenderer {
  private prefixEl: HTMLElement | null = null;
  private postfixEl: HTMLElement | null = null;

  init(): void {
    // Initialize internal element references
    this.prefixEl = null;
    this.postfixEl = null;

    // Build and inject DOM structure
    this.wrapper = this.buildInputGroup();
    const wrapper = this.wrapper;
    if (!wrapper) return;

    // Find created elements and store references
    const upButtonEl = wrapper.querySelector('[data-touchspin-injected="up"]');
    const downButtonEl = wrapper.querySelector('[data-touchspin-injected="down"]');
    this.prefixEl = wrapper.querySelector(
      '[data-touchspin-injected="prefix"]'
    ) as HTMLElement | null;
    this.postfixEl = wrapper.querySelector(
      '[data-touchspin-injected="postfix"]'
    ) as HTMLElement | null;

    // Attach core event handlers to buttons
    const upButton = upButtonEl instanceof HTMLElement ? upButtonEl : null;
    const downButton = downButtonEl instanceof HTMLElement ? downButtonEl : null;
    this.core.attachUpEvents(upButton);
    this.core.attachDownEvents(downButton);

    // Register for setting changes
    this.core.observeSetting('prefix', (newValue) => this.updatePrefix(newValue));
    this.core.observeSetting('postfix', (newValue) => this.updatePostfix(newValue));
    this.core.observeSetting('buttonup_class', (newValue) =>
      this.updateButtonClass('up', newValue)
    );
    this.core.observeSetting('buttondown_class', (newValue) =>
      this.updateButtonClass('down', newValue)
    );
    this.core.observeSetting('verticalupclass', (newValue) =>
      this.updateVerticalButtonClass('up', newValue)
    );
    this.core.observeSetting('verticaldownclass', (newValue) =>
      this.updateVerticalButtonClass('down', newValue)
    );
    this.core.observeSetting('verticalup', (newValue) =>
      this.updateVerticalButtonText('up', newValue)
    );
    this.core.observeSetting('verticaldown', (newValue) =>
      this.updateVerticalButtonText('down', newValue)
    );
    this.core.observeSetting('buttonup_txt', (newValue) => this.updateButtonText('up', newValue));
    this.core.observeSetting('buttondown_txt', (newValue) =>
      this.updateButtonText('down', newValue)
    );
    this.core.observeSetting('prefix_extraclass', (_newValue) => this.updatePrefixClasses());
    this.core.observeSetting('postfix_extraclass', (_newValue) => this.updatePostfixClasses());
    this.core.observeSetting('verticalbuttons', (newValue) =>
      this.handleVerticalButtonsChange(newValue)
    );
    this.core.observeSetting('focusablebuttons', (newValue) =>
      this.updateButtonFocusability(newValue)
    );
  }

  buildInputGroup(): HTMLElement {
    const isVertical = this.settings.verticalbuttons;

    let html;
    if (isVertical) {
      html = `
        <div class="ts-wrapper ts-wrapper--vertical" data-touchspin-injected="wrapper">
          <span class="ts-addon ts-prefix ${this.settings.prefix_extraclass || ''}" data-touchspin-injected="prefix"${this.getPrefixTestId()}>${this.settings.prefix || ''}</span>
          <span class="ts-addon ts-postfix ${this.settings.postfix_extraclass || ''}" data-touchspin-injected="postfix"${this.getPostfixTestId()}>${this.settings.postfix || ''}</span>
          ${this.buildVerticalButtons()}
        </div>
      `;
    } else {
      html = `
        <div class="ts-wrapper" data-touchspin-injected="wrapper">
          <button 
            tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" 
            class="ts-btn ts-btn--down ${this.settings.buttondown_class || ''}" 
            data-touchspin-injected="down"${this.getDownButtonTestId()} 
            type="button" 
            aria-label="Decrease value"
            ${this.input.disabled ? 'disabled' : ''}
          >${this.settings.buttondown_txt || '−'}</button>
          <span class="ts-addon ts-prefix ${this.settings.prefix_extraclass || ''}" data-touchspin-injected="prefix"${this.getPrefixTestId()}>${this.settings.prefix || ''}</span>
          <span class="ts-addon ts-postfix ${this.settings.postfix_extraclass || ''}" data-touchspin-injected="postfix"${this.getPostfixTestId()}>${this.settings.postfix || ''}</span>
          <button 
            tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" 
            class="ts-btn ts-btn--up ${this.settings.buttonup_class || ''}" 
            data-touchspin-injected="up"${this.getUpButtonTestId()} 
            type="button" 
            aria-label="Increase value"
            ${this.input.disabled ? 'disabled' : ''}
          >${this.settings.buttonup_txt || '+'}</button>
        </div>
      `;
    }

    // Create wrapper element
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html.trim();
    const wrapper = tempDiv.firstChild as HTMLElement;

    // Insert wrapper and move input into it
    const parent = this.input.parentElement;
    if (parent) {
      parent.insertBefore(wrapper, this.input);
    }

    // Position input correctly - after prefix, before postfix
    const postfixEl = wrapper.querySelector('[data-touchspin-injected="postfix"]');
    if (postfixEl) {
      wrapper.insertBefore(this.input, postfixEl);
    } else {
      // Fallback if no postfix - before up button
      const upButton = wrapper.querySelector('[data-touchspin-injected="up"]');
      wrapper.insertBefore(this.input, upButton);
    }

    // Add input styling class
    this.input.classList.add('ts-input');

    // Hide empty prefix/postfix elements
    this.hideEmptyPrefixPostfix(wrapper);

    return wrapper;
  }

  buildVerticalButtons(): string {
    return `
      <div class="ts-vertical-wrapper" data-touchspin-injected="vertical-wrapper">
        <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="ts-btn ts-btn--vertical ts-btn--vertical-up ${this.settings.verticalupclass || ''}" data-touchspin-injected="up"${this.getUpButtonTestId()} type="button" aria-label="Increase value">${this.settings.verticalup || '+'}</button>
        <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="ts-btn ts-btn--vertical ts-btn--vertical-down ${this.settings.verticaldownclass || ''}" data-touchspin-injected="down"${this.getDownButtonTestId()} type="button" aria-label="Decrease value">${this.settings.verticaldown || '−'}</button>
      </div>
    `;
  }

  hideEmptyPrefixPostfix(wrapper: HTMLElement | null = this.wrapper) {
    const prefixEl = this.prefixEl || wrapper?.querySelector('[data-touchspin-injected="prefix"]');
    const postfixEl =
      this.postfixEl || wrapper?.querySelector('[data-touchspin-injected="postfix"]');

    if (prefixEl && (!this.settings.prefix || this.settings.prefix === '')) {
      prefixEl.style.display = 'none';
    }
    if (postfixEl && (!this.settings.postfix || this.settings.postfix === '')) {
      postfixEl.style.display = 'none';
    }
  }

  updatePrefix(value: string): void {
    const prefixEl = this.prefixEl;
    if (!prefixEl) return;

    if (value && value !== '') {
      prefixEl.textContent = value;
      prefixEl.style.display = '';
      prefixEl.className = `ts-addon ts-prefix ${this.settings.prefix_extraclass || ''}`.trim();
    } else {
      prefixEl.style.display = 'none';
    }
  }

  updatePostfix(value: string): void {
    const postfixEl = this.postfixEl;
    if (!postfixEl) return;

    if (value && value !== '') {
      postfixEl.textContent = value;
      postfixEl.style.display = '';
      postfixEl.className = `ts-addon ts-postfix ${this.settings.postfix_extraclass || ''}`.trim();
    } else {
      postfixEl.style.display = 'none';
    }
  }

  updateButtonClass(type: 'up' | 'down', className: string | null | undefined): void {
    if (!this.wrapper) return;
    const button = this.wrapper.querySelector(`[data-touchspin-injected="${type}"]`);
    if (!button) return;

    // Preserve base classes and add custom class
    const baseClasses = `ts-btn ts-btn--${type}`;
    const verticalClass = button.classList.contains('ts-btn--vertical') ? ' ts-btn--vertical' : '';
    button.className = `${baseClasses}${verticalClass} ${className || ''}`.trim();
  }

  updateVerticalButtonClass(type: 'up' | 'down', className: string | null | undefined): void {
    if (!this.wrapper) return;
    const verticalWrapper = this.wrapper.querySelector(
      '[data-touchspin-injected="vertical-wrapper"]'
    );
    if (!verticalWrapper) return;

    const button = verticalWrapper.querySelector(`[data-touchspin-injected="${type}"]`);
    if (!button) return;

    // Update vertical-specific class while preserving base classes
    const baseClasses = `ts-btn ts-btn--${type} ts-btn--vertical`;
    const buttonClass = this.settings.buttonup_class || this.settings.buttondown_class || '';
    button.className = `${baseClasses} ${buttonClass} ${className || ''}`.trim();
  }

  updateVerticalButtonText(type: 'up' | 'down', text?: string): void {
    if (!this.wrapper) return;
    const verticalWrapper = this.wrapper.querySelector(
      '[data-touchspin-injected="vertical-wrapper"]'
    );
    if (!verticalWrapper) return;

    const button = verticalWrapper.querySelector(`[data-touchspin-injected="${type}"]`);
    if (button) {
      button.textContent = text || (type === 'up' ? '+' : '−');
    }
  }

  updateButtonText(type: 'up' | 'down', text?: string): void {
    if (!this.wrapper) return;
    const button = this.wrapper.querySelector(`[data-touchspin-injected="${type}"]`);
    if (button) {
      button.textContent = text || (type === 'up' ? '+' : '−');
    }
  }

  updatePrefixClasses(): void {
    const prefixEl = this.prefixEl;
    if (prefixEl) {
      prefixEl.className = `ts-addon ts-prefix ${this.settings.prefix_extraclass || ''}`.trim();
    }
  }

  updatePostfixClasses(): void {
    const postfixEl = this.postfixEl;
    if (postfixEl) {
      postfixEl.className = `ts-addon ts-postfix ${this.settings.postfix_extraclass || ''}`.trim();
    }
  }

  handleVerticalButtonsChange(_newValue: boolean): void {
    // Remove old DOM and rebuild with new layout
    this.rebuildDOM();
  }

  rebuildDOM(): void {
    // Remove old DOM and rebuild with current settings
    this.removeInjectedElements();
    // Reset wrapper reference since it was removed
    this.wrapper = null;
    this.prefixEl = null;
    this.postfixEl = null;
    this.buildAndAttachDOM();

    if (this.wrapper) {
      this.finalizeWrapperAttributes();
    }
  }

  buildAndAttachDOM(): void {
    // Build and inject DOM structure
    this.wrapper = this.buildInputGroup();
    const wrapper = this.wrapper;
    if (!wrapper) return;

    // Find created elements and store references
    const upButtonEl = wrapper.querySelector('[data-touchspin-injected="up"]');
    const downButtonEl = wrapper.querySelector('[data-touchspin-injected="down"]');
    this.prefixEl = wrapper.querySelector(
      '[data-touchspin-injected="prefix"]'
    ) as HTMLElement | null;
    this.postfixEl = wrapper.querySelector(
      '[data-touchspin-injected="postfix"]'
    ) as HTMLElement | null;

    // Attach core event handlers to buttons
    const upButton = upButtonEl instanceof HTMLElement ? upButtonEl : null;
    const downButton = downButtonEl instanceof HTMLElement ? downButtonEl : null;
    this.core.attachUpEvents(upButton);
    this.core.attachDownEvents(downButton);
  }

  updateButtonFocusability(newValue: boolean): void {
    // Find all buttons and update their tabindex
    if (!this.wrapper) return;
    const buttons = this.wrapper.querySelectorAll(
      '[data-touchspin-injected="up"], [data-touchspin-injected="down"]'
    );
    const tabindex = newValue ? '0' : '-1';
    buttons.forEach((button) => {
      button.setAttribute('tabindex', tabindex);
    });
  }

  /**
   * Apply theme via CSS custom properties
   * @param {Object} theme - Theme object with CSS property values
   */
  // Accept any record of CSS custom property values (read-only for clarity)
  setTheme(theme: Readonly<Record<string, string>>): void {
    const wrapper = this.wrapper;
    if (!wrapper || !theme) return;

    Object.entries(theme).forEach(([key, value]) => {
      const cssProperty = key.startsWith('--') ? key : `--ts-${key}`;
      wrapper.style.setProperty(cssProperty, value);
    });
  }

  teardown() {
    // Remove added classes from input
    this.input.classList.remove('ts-input');

    // Call parent teardown to handle DOM cleanup
    super.teardown();
  }
}

export default VanillaRenderer;

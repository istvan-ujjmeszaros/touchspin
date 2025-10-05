/**
 * Bootstrap 3 Renderer - New Architecture
 * Builds Bootstrap 3 UI elements around TouchSpin input
 * Uses input-group-btn and input-group-addon for Bootstrap 3 compatibility
 */
import { AbstractRendererSimple } from '@touchspin/core/renderer';

class Bootstrap3Renderer extends AbstractRendererSimple {
  private prefixEl: HTMLElement | null = null;
  private postfixEl: HTMLElement | null = null;
  private _formControlAdded?: boolean;
  declare wrapper: HTMLElement | null;

  init() {
    // Initialize internal element references
    this.prefixEl = null;
    this.postfixEl = null;

    // Add form-control class if not present (Bootstrap requirement)
    if (!this.input.classList.contains('form-control')) {
      this.input.classList.add('form-control');
      this._formControlAdded = true; // Track if we added it
    }

    // Build DOM structure and attach events
    this.buildAndAttachDOM();

    // 4. Register for setting changes we care about
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

  teardown(): void {
    // Remove form-control class only if we added it
    if (this._formControlAdded) {
      this.input.classList.remove('form-control');
      this._formControlAdded = false;
    }

    // Call parent teardown to handle DOM cleanup
    super.teardown();
  }

  buildAndAttachDOM(): void {
    // 1. Build and inject DOM structure around input
    this.wrapper = this.buildInputGroup();

    // 2. Find created buttons and store prefix/postfix references
    if (!this.wrapper) return;
    const upButton = this.wrapper.querySelector<HTMLElement>('[data-touchspin-injected="up"]');
    const downButton = this.wrapper.querySelector<HTMLElement>('[data-touchspin-injected="down"]');
    this.prefixEl = this.wrapper.querySelector<HTMLElement>('[data-touchspin-injected="prefix"]');
    this.postfixEl = this.wrapper.querySelector<HTMLElement>('[data-touchspin-injected="postfix"]');

    // 3. Tell core to attach its event handlers
    this.core.attachUpEvents(upButton);
    this.core.attachDownEvents(downButton);
  }

  /**
   * Ensures input element is properly positioned within the input group before using it as reference
   * Fixes DOM insertion bug when input loses parent-child relationship during rebuilds
   */
  private ensureInputInGroup(existingInputGroup: HTMLElement): void {
    // Check if input is already a direct child of the group
    if (this.input.parentElement === existingInputGroup) {
      return;
    }
    // If input is not in the group, append it (it may have been moved during DOM manipulations)
    existingInputGroup.appendChild(this.input);
  }

  buildInputGroup(): HTMLElement {
    // Check if input is already inside an input-group
    const existingInputGroup = this.input.closest('.input-group') as HTMLElement | null;

    if (existingInputGroup) {
      return this.buildAdvancedInputGroup(existingInputGroup);
    } else {
      return this.buildBasicInputGroup();
    }
  }

  buildBasicInputGroup(): HTMLElement {
    const inputGroupSize = this._detectInputGroupSize();

    let html;
    if (this.settings.verticalbuttons) {
      html = `
        <div class="input-group ${inputGroupSize} bootstrap-touchspin">
          ${this.settings.prefix ? `<span class="input-group-addon bootstrap-touchspin-prefix ${this.settings.prefix_extraclass || ''}" data-touchspin-injected="prefix"${this.getPrefixTestId()}>${this.settings.prefix}</span>` : ''}
          ${this.settings.postfix ? `<span class="input-group-addon bootstrap-touchspin-postfix ${this.settings.postfix_extraclass || ''}" data-touchspin-injected="postfix"${this.getPostfixTestId()}>${this.settings.postfix}</span>` : ''}
          <span class="input-group-btn bootstrap-touchspin-vertical-button-wrapper" data-touchspin-injected="vertical-wrapper">
            ${this.buildVerticalButtons()}
          </span>
        </div>
      `;
    } else {
      html = `
        <div class="input-group ${inputGroupSize} bootstrap-touchspin">
          <span class="input-group-btn" data-touchspin-injected="down-wrapper">
            <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="${this.settings.buttondown_class || 'btn btn-default'} bootstrap-touchspin-down" data-touchspin-injected="down"${this.getDownButtonTestId()} type="button" aria-label="Decrease value">${this.settings.buttondown_txt || '−'}</button>
          </span>
          ${this.settings.prefix ? `<span class="input-group-addon bootstrap-touchspin-prefix ${this.settings.prefix_extraclass || ''}" data-touchspin-injected="prefix"${this.getPrefixTestId()}>${this.settings.prefix}</span>` : ''}
          ${this.settings.postfix ? `<span class="input-group-addon bootstrap-touchspin-postfix ${this.settings.postfix_extraclass || ''}" data-touchspin-injected="postfix"${this.getPostfixTestId()}>${this.settings.postfix}</span>` : ''}
          <span class="input-group-btn" data-touchspin-injected="up-wrapper">
            <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="${this.settings.buttonup_class || 'btn btn-default'} bootstrap-touchspin-up" data-touchspin-injected="up"${this.getUpButtonTestId()} type="button" aria-label="Increase value">${this.settings.buttonup_txt || '+'}</button>
          </span>
        </div>
      `;
    }

    // Create wrapper and wrap the input
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html.trim();
    const wrapper = tempDiv.firstChild as HTMLElement | null;

    // Insert wrapper and move input into it
    if (this.input.parentElement && wrapper) {
      this.input.parentElement.insertBefore(wrapper, this.input);
    }

    // Find the position to insert input
    if (this.settings.verticalbuttons) {
      // For vertical buttons: prefix -> input -> postfix -> vertical-buttons
      const prefixEl = wrapper
        ? wrapper.querySelector<HTMLElement>('[data-touchspin-injected="prefix"]')
        : null;
      const postfixEl = wrapper
        ? wrapper.querySelector<HTMLElement>('[data-touchspin-injected="postfix"]')
        : null;

      if (prefixEl && wrapper) {
        // Insert after prefix
        wrapper.insertBefore(this.input, prefixEl.nextSibling);
      } else if (postfixEl && wrapper) {
        // No prefix, insert before postfix
        wrapper.insertBefore(this.input, postfixEl);
      } else {
        // No prefix or postfix, insert before vertical wrapper
        const verticalWrapper = wrapper?.querySelector<HTMLElement>(
          '[data-touchspin-injected="vertical-wrapper"]'
        );
        if (wrapper && verticalWrapper) wrapper.insertBefore(this.input, verticalWrapper);
      }
    } else {
      // For horizontal buttons: down -> prefix -> input -> postfix -> up
      const prefixEl = wrapper
        ? wrapper.querySelector<HTMLElement>('[data-touchspin-injected="prefix"]')
        : null;
      const _postfixEl = wrapper
        ? wrapper.querySelector<HTMLElement>('[data-touchspin-injected="postfix"]')
        : null;

      if (prefixEl) {
        // Insert after prefix
        if (wrapper) wrapper.insertBefore(this.input, (prefixEl as HTMLElement).nextSibling);
      } else {
        // No prefix, insert after down button
        const downButton = wrapper?.querySelector<HTMLElement>(
          '[data-touchspin-injected="down-wrapper"]'
        );
        if (wrapper && downButton) wrapper.insertBefore(this.input, downButton.nextSibling);
      }
    }

    return wrapper as HTMLElement;
  }

  buildAdvancedInputGroup(existingInputGroup: HTMLElement): HTMLElement {
    // Add bootstrap-touchspin class to existing input-group
    existingInputGroup.classList.add('bootstrap-touchspin');

    // Mark this as an advanced wrapper
    this.wrapperType = 'wrapper-advanced';

    // Create elements based on vertical or horizontal layout
    let elementsHtml;
    if (this.settings.verticalbuttons) {
      elementsHtml = `
        ${this.settings.prefix ? `<span class="input-group-addon bootstrap-touchspin-prefix ${this.settings.prefix_extraclass || ''}" data-touchspin-injected="prefix"${this.getPrefixTestId()}>${this.settings.prefix}</span>` : ''}
        ${this.settings.postfix ? `<span class="input-group-addon bootstrap-touchspin-postfix ${this.settings.postfix_extraclass || ''}" data-touchspin-injected="postfix"${this.getPostfixTestId()}>${this.settings.postfix}</span>` : ''}
        <span class="input-group-btn bootstrap-touchspin-vertical-button-wrapper" data-touchspin-injected="vertical-wrapper">
          ${this.buildVerticalButtons()}
        </span>
      `;
    } else {
      elementsHtml = `
        <span class="input-group-btn" data-touchspin-injected="down-wrapper">
          <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="${this.settings.buttondown_class || 'btn btn-default'} bootstrap-touchspin-down" data-touchspin-injected="down"${this.getDownButtonTestId()} type="button" aria-label="Decrease value">${this.settings.buttondown_txt || '−'}</button>
        </span>
        ${this.settings.prefix ? `<span class="input-group-addon bootstrap-touchspin-prefix ${this.settings.prefix_extraclass || ''}" data-touchspin-injected="prefix"${this.getPrefixTestId()}>${this.settings.prefix}</span>` : ''}
        ${this.settings.postfix ? `<span class="input-group-addon bootstrap-touchspin-postfix ${this.settings.postfix_extraclass || ''}" data-touchspin-injected="postfix"${this.getPostfixTestId()}>${this.settings.postfix}</span>` : ''}
        <span class="input-group-btn" data-touchspin-injected="up-wrapper">
          <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="${this.settings.buttonup_class || 'btn btn-default'} bootstrap-touchspin-up" data-touchspin-injected="up"${this.getUpButtonTestId()} type="button" aria-label="Increase value">${this.settings.buttonup_txt || '+'}</button>
        </span>
      `;
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = elementsHtml;

    // Declare element references at function scope
    let prefixEl: HTMLElement | null;
    let postfixEl: HTMLElement | null;

    // Ensure input is properly positioned in the group before using it as reference
    this.ensureInputInGroup(existingInputGroup);

    if (this.settings.verticalbuttons) {
      // For vertical buttons: prefix -> input -> postfix -> vertical wrapper
      prefixEl = tempDiv.querySelector('[data-touchspin-injected="prefix"]');
      if (prefixEl) {
        existingInputGroup.insertBefore(prefixEl, this.input);
      }

      postfixEl = tempDiv.querySelector('[data-touchspin-injected="postfix"]');
      if (postfixEl) {
        existingInputGroup.insertBefore(postfixEl, this.input.nextSibling);
      }

      const verticalWrapper = tempDiv.querySelector<HTMLElement>(
        '[data-touchspin-injected="vertical-wrapper"]'
      );
      if (verticalWrapper) {
        existingInputGroup.insertBefore(
          verticalWrapper,
          postfixEl ? (postfixEl as HTMLElement).nextSibling : this.input.nextSibling
        );
      }
    } else {
      // For horizontal buttons: down -> prefix -> input -> postfix -> up
      const downButtonWrapper = tempDiv.querySelector<HTMLElement>(
        '[data-touchspin-injected="down-wrapper"]'
      );
      if (downButtonWrapper) {
        existingInputGroup.insertBefore(downButtonWrapper, this.input);
      }

      prefixEl = tempDiv.querySelector('[data-touchspin-injected="prefix"]');
      if (prefixEl) {
        existingInputGroup.insertBefore(prefixEl, this.input);
      }

      postfixEl = tempDiv.querySelector('[data-touchspin-injected="postfix"]');
      if (postfixEl) {
        existingInputGroup.insertBefore(postfixEl, this.input.nextSibling);
      }

      const upButtonWrapper = tempDiv.querySelector<HTMLElement>(
        '[data-touchspin-injected="up-wrapper"]'
      );
      if (upButtonWrapper) {
        existingInputGroup.insertBefore(
          upButtonWrapper,
          postfixEl ? (postfixEl as HTMLElement).nextSibling : this.input.nextSibling
        );
      }
    }

    // Store internal references for advanced mode too
    this.prefixEl = prefixEl;
    this.postfixEl = postfixEl;

    return existingInputGroup;
  }

  _detectInputGroupSize(): string {
    const classList = this.input.className;
    if (classList.includes('input-sm')) {
      return 'input-group-sm';
    } else if (classList.includes('input-lg')) {
      return 'input-group-lg';
    }
    return '';
  }

  updatePrefix(value: string | null | undefined): void {
    // Use internal reference
    const prefixEl = this.prefixEl;

    if (value && value !== '') {
      if (prefixEl) {
        prefixEl.textContent = value;
        prefixEl.style.display = '';
        // Update classes in case prefix_extraclass changed
        prefixEl.className =
          `input-group-addon bootstrap-touchspin-prefix ${this.settings.prefix_extraclass || ''}`.trim();
      } else {
        // Element doesn't exist, need to rebuild DOM
        this.rebuildDOM();
      }
    } else if (prefixEl) {
      // Remove element if value is empty
      this.rebuildDOM();
    }
  }

  updatePostfix(value: string | null | undefined): void {
    // Use internal reference
    const postfixEl = this.postfixEl;

    if (value && value !== '') {
      if (postfixEl) {
        postfixEl.textContent = value;
        postfixEl.style.display = '';
        // Update classes in case postfix_extraclass changed
        postfixEl.className =
          `input-group-addon bootstrap-touchspin-postfix ${this.settings.postfix_extraclass || ''}`.trim();
      } else {
        // Element doesn't exist, need to rebuild DOM
        this.rebuildDOM();
      }
    } else if (postfixEl) {
      // Remove element if value is empty
      this.rebuildDOM();
    }
  }

  updateButtonClass(type: 'up' | 'down', className?: string | null): void {
    if (!this.wrapper) return;
    const button = this.wrapper.querySelector<HTMLElement>(`[data-touchspin-injected="${type}"]`);
    if (button) {
      button.className = `${className || 'btn btn-default'} bootstrap-touchspin-${type}`;
    }
  }

  buildVerticalButtons(): string {
    // Bootstrap 3: Return content for input-group-btn wrapper
    // The outer wrapper is handled by the calling code
    return `
      <span class="input-group-btn-vertical">
        <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="${this.settings.buttonup_class || 'btn btn-default'} ${this.settings.verticalupclass || ''} bootstrap-touchspin-up" data-touchspin-injected="up"${this.getUpButtonTestId()} type="button" aria-label="Increase value">${this.settings.verticalup || '+'}</button>
        <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="${this.settings.buttondown_class || 'btn btn-default'} ${this.settings.verticaldownclass || ''} bootstrap-touchspin-down" data-touchspin-injected="down"${this.getDownButtonTestId()} type="button" aria-label="Decrease value">${this.settings.verticaldown || '−'}</button>
      </span>
    `;
  }

  updateVerticalButtonClass(type: 'up' | 'down', className?: string | null): void {
    if (!this.wrapper) return;
    const verticalWrapper = this.wrapper.querySelector<HTMLElement>(
      '[data-touchspin-injected="vertical-wrapper"]'
    );
    if (verticalWrapper) {
      const button = verticalWrapper.querySelector<HTMLElement>(
        `[data-touchspin-injected="${type}"]`
      );
      if (button) {
        // Update the vertical-specific class while preserving base classes
        const baseClasses =
          this.settings.buttonup_class || this.settings.buttondown_class || 'btn btn-default';
        button.className = `${baseClasses} ${className || 'btn btn-default'} bootstrap-touchspin-${type}`;
      }
    }
  }

  updateVerticalButtonText(type: 'up' | 'down', text?: string | null): void {
    if (!this.wrapper) return;
    const verticalWrapper = this.wrapper.querySelector<HTMLElement>(
      '[data-touchspin-injected="vertical-wrapper"]'
    );
    if (verticalWrapper) {
      const button = verticalWrapper.querySelector<HTMLElement>(
        `[data-touchspin-injected="${type}"]`
      );
      if (button) {
        button.textContent = text || (type === 'up' ? '+' : '−');
      }
    }
  }

  updateButtonText(type: 'up' | 'down', text?: string | null): void {
    if (!this.wrapper) return;
    const button = this.wrapper.querySelector<HTMLElement>(`[data-touchspin-injected="${type}"]`);
    if (button) {
      button.textContent = text || (type === 'up' ? '+' : '−');
    }
  }

  updatePrefixClasses(): void {
    const prefixEl = this.prefixEl;
    if (prefixEl) {
      prefixEl.className =
        `input-group-addon bootstrap-touchspin-prefix ${this.settings.prefix_extraclass || ''}`.trim();
    }
  }

  updatePostfixClasses(): void {
    const postfixEl = this.postfixEl;
    if (postfixEl) {
      postfixEl.className =
        `input-group-addon bootstrap-touchspin-postfix ${this.settings.postfix_extraclass || ''}`.trim();
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

    this.buildAndAttachDOM();

    if (this.wrapper) {
      this.finalizeWrapperAttributes();
    }
  }

  updateButtonFocusability(newValue: boolean): void {
    // Find all buttons and update their tabindex
    if (!this.wrapper) return;
    const buttons = this.wrapper.querySelectorAll<HTMLElement>(
      '[data-touchspin-injected="up"], [data-touchspin-injected="down"]'
    );
    const tabindex = newValue ? '0' : '-1';

    buttons.forEach((button) => {
      button.setAttribute('tabindex', tabindex);
    });
  }
}

export default Bootstrap3Renderer;

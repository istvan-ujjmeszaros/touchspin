/**
 * Bootstrap 5 Renderer - New Architecture
 * Builds Bootstrap 5 UI elements around TouchSpin input
 */
import { AbstractRenderer } from '@touchspin/core/renderer';
import type { InferOptionsFromSchema, RendererOptionSchema } from '@touchspin/core/renderer';

const schema = Object.freeze({
  buttonup_txt: { kind: 'string' },
  buttondown_txt: { kind: 'string' },
  buttonup_class: { kind: 'string' },
  buttondown_class: { kind: 'string' },
  verticalbuttons: { kind: 'boolean' },
  verticalup: { kind: 'string' },
  verticaldown: { kind: 'string' },
  verticalupclass: { kind: 'string' },
  verticaldownclass: { kind: 'string' },
  prefix: { kind: 'string' },
  postfix: { kind: 'string' },
  prefix_extraclass: { kind: 'string' },
  postfix_extraclass: { kind: 'string' },
} as const satisfies RendererOptionSchema);

class Bootstrap5Renderer extends AbstractRenderer {
  private opts!: Readonly<Partial<InferOptionsFromSchema<typeof schema>>>;
  private prefixEl: HTMLElement | null = null;
  private postfixEl: HTMLElement | null = null;
  private _formControlAdded?: boolean;
  declare wrapper: HTMLElement | null;

  init(): void {
    // Schema keys are read via `opts` (typed projection). Live values update via `settings`.
    // Rebuild paths call refreshOpts() to keep the projection fresh.
    this.refreshOpts();
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

  private refreshOpts(): void {
    this.opts = this.projectRendererOptions(schema);
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
    this.refreshOpts();
    const inputGroupSize = this._detectInputGroupSize();

    let html;
    if (this.opts.verticalbuttons) {
      html = `
        <div class="input-group ${inputGroupSize} bootstrap-touchspin">
          ${this.opts.prefix ? `<span class="input-group-text bootstrap-touchspin-prefix ${this.opts.prefix_extraclass || ''}" data-touchspin-injected="prefix"${this.getPrefixTestId()}>${this.opts.prefix}</span>` : ''}
          ${this.opts.postfix ? `<span class="input-group-text bootstrap-touchspin-postfix ${this.opts.postfix_extraclass || ''}" data-touchspin-injected="postfix"${this.getPostfixTestId()}>${this.opts.postfix}</span>` : ''}
          ${this.buildVerticalButtons()}
        </div>
      `;
    } else {
      html = `
        <div class="input-group ${inputGroupSize} bootstrap-touchspin">
          <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="${this.opts.buttondown_class || 'btn btn-outline-secondary'} bootstrap-touchspin-down" data-touchspin-injected="down"${this.getDownButtonTestId()} type="button" aria-label="Decrease value">${this.opts.buttondown_txt || '−'}</button>
          ${this.opts.prefix ? `<span class="input-group-text bootstrap-touchspin-prefix ${this.opts.prefix_extraclass || ''}" data-touchspin-injected="prefix"${this.getPrefixTestId()}>${this.opts.prefix}</span>` : ''}
          ${this.opts.postfix ? `<span class="input-group-text bootstrap-touchspin-postfix ${this.opts.postfix_extraclass || ''}" data-touchspin-injected="postfix"${this.getPostfixTestId()}>${this.opts.postfix}</span>` : ''}
          <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="${this.opts.buttonup_class || 'btn btn-outline-secondary'} bootstrap-touchspin-up" data-touchspin-injected="up"${this.getUpButtonTestId()} type="button" aria-label="Increase value">${this.opts.buttonup_txt || '+'}</button>
        </div>
      `;
    }

    // Create wrapper and wrap the input
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html.trim();
    const wrapper = tempDiv.firstChild as HTMLElement;

    // Insert wrapper and move input into it
    if (this.input.parentElement && wrapper) {
      this.input.parentElement.insertBefore(wrapper, this.input);
    }

    // Find the position to insert input
    if (this.opts.verticalbuttons) {
      // For vertical buttons: prefix -> input -> postfix -> vertical-buttons
      const prefixEl = wrapper.querySelector('[data-touchspin-injected="prefix"]');
      const postfixEl = wrapper.querySelector('[data-touchspin-injected="postfix"]');

      if (prefixEl) {
        // Insert after prefix
        wrapper.insertBefore(this.input, prefixEl.nextSibling);
      } else if (postfixEl) {
        // No prefix, insert before postfix
        wrapper.insertBefore(this.input, postfixEl);
      } else {
        // No prefix or postfix, insert before vertical wrapper
        const verticalWrapper = wrapper.querySelector('[data-touchspin-injected="vertical-wrapper"]');
        wrapper.insertBefore(this.input, verticalWrapper);
      }
    } else {
      // For horizontal buttons: down -> prefix -> input -> postfix -> up
      const prefixEl = wrapper.querySelector('[data-touchspin-injected="prefix"]');
      const postfixEl = wrapper.querySelector('[data-touchspin-injected="postfix"]');

      if (prefixEl) {
        // Insert after prefix
        wrapper.insertBefore(this.input, prefixEl.nextSibling);
      } else if (postfixEl) {
        // No prefix, insert before postfix
        wrapper.insertBefore(this.input, postfixEl);
      } else {
        // No prefix or postfix, insert before up button
        const upButton = wrapper.querySelector('[data-touchspin-injected="up"]');
        wrapper.insertBefore(this.input, upButton);
      }
    }

    return wrapper;
  }

  buildAdvancedInputGroup(existingInputGroup: HTMLElement): HTMLElement {
    this.refreshOpts();
    // Add bootstrap-touchspin class to existing input-group
    existingInputGroup.classList.add('bootstrap-touchspin');

    // Mark this as an advanced wrapper
    this.wrapperType = 'wrapper-advanced';

    // Create elements based on vertical or horizontal layout
    let elementsHtml: string;
    if (this.opts.verticalbuttons) {
      elementsHtml = `
        ${this.opts.prefix ? `<span class="input-group-text bootstrap-touchspin-prefix ${this.opts.prefix_extraclass || ''}" data-touchspin-injected="prefix"${this.getPrefixTestId()}>${this.opts.prefix}</span>` : ''}
        ${this.opts.postfix ? `<span class="input-group-text bootstrap-touchspin-postfix ${this.opts.postfix_extraclass || ''}" data-touchspin-injected="postfix"${this.getPostfixTestId()}>${this.opts.postfix}</span>` : ''}
        ${this.buildVerticalButtons()}
      `;
    } else {
      elementsHtml = `
        <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="${this.opts.buttondown_class || 'btn btn-outline-secondary'} bootstrap-touchspin-down" data-touchspin-injected="down"${this.getDownButtonTestId()} type="button" aria-label="Decrease value">${this.opts.buttondown_txt || '−'}</button>
        ${this.opts.prefix ? `<span class="input-group-text bootstrap-touchspin-prefix ${this.opts.prefix_extraclass || ''}" data-touchspin-injected="prefix"${this.getPrefixTestId()}>${this.opts.prefix}</span>` : ''}
        ${this.opts.postfix ? `<span class="input-group-text bootstrap-touchspin-postfix ${this.opts.postfix_extraclass || ''}" data-touchspin-injected="postfix"${this.getPostfixTestId()}>${this.opts.postfix}</span>` : ''}
        <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="${this.opts.buttonup_class || 'btn btn-outline-secondary'} bootstrap-touchspin-up" data-touchspin-injected="up"${this.getUpButtonTestId()} type="button" aria-label="Increase value">${this.opts.buttonup_txt || '+'}</button>
      `;
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = elementsHtml;

    // Declare element references at function scope
    let prefixEl: HTMLElement | null;
    let postfixEl: HTMLElement | null;

    if (this.opts.verticalbuttons) {
      // For vertical buttons: prefix -> input -> postfix -> vertical-buttons
      prefixEl = tempDiv.querySelector('[data-touchspin-injected="prefix"]');
      if (prefixEl) {
        existingInputGroup.insertBefore(prefixEl, this.input);
      }

      postfixEl = tempDiv.querySelector('[data-touchspin-injected="postfix"]');
      if (postfixEl) {
        existingInputGroup.insertBefore(postfixEl, this.input.nextSibling);
      }

      const verticalWrapper = tempDiv.querySelector('[data-touchspin-injected="vertical-wrapper"]');
      if (verticalWrapper) {
        existingInputGroup.insertBefore(verticalWrapper, postfixEl ? postfixEl.nextSibling : this.input.nextSibling);
      }
    } else {
      // For horizontal buttons: down -> prefix -> input -> postfix -> up
      const downButton = tempDiv.querySelector('[data-touchspin-injected="down"]') as HTMLElement | null;
      if (downButton) {
        existingInputGroup.insertBefore(downButton, this.input);
      }

      prefixEl = tempDiv.querySelector('[data-touchspin-injected="prefix"]');
      if (prefixEl) {
        existingInputGroup.insertBefore(prefixEl, this.input);
      }

      postfixEl = tempDiv.querySelector('[data-touchspin-injected="postfix"]');
      if (postfixEl) {
        existingInputGroup.insertBefore(postfixEl, this.input.nextSibling);
      }

      const upButton = tempDiv.querySelector('[data-touchspin-injected="up"]') as HTMLElement | null;
      if (upButton) {
        existingInputGroup.insertBefore(upButton, postfixEl ? postfixEl.nextSibling : this.input.nextSibling);
      }
    }

    // Store internal references for advanced mode too
    this.prefixEl = prefixEl;
    this.postfixEl = postfixEl;

    return existingInputGroup;
  }

  _detectInputGroupSize(): string {
    const classList = this.input.className;
    if (classList.includes('form-control-sm')) {
      return 'input-group-sm';
    } else if (classList.includes('form-control-lg')) {
      return 'input-group-lg';
    }
    return '';
  }

  buildAndAttachDOM(): void {
    // 1. Build and inject DOM structure around input
    this.wrapper = this.buildInputGroup();
    const wrapper = this.wrapper;
    if (!wrapper) return;

    // 2. Find created buttons and store prefix/postfix references
    const upButton = wrapper.querySelector('[data-touchspin-injected="up"]');
    const downButton = wrapper.querySelector('[data-touchspin-injected="down"]');
    this.prefixEl = wrapper.querySelector('[data-touchspin-injected="prefix"]') as HTMLElement | null;
    this.postfixEl = wrapper.querySelector('[data-touchspin-injected="postfix"]') as HTMLElement | null;

    // 3. Tell core to attach its event handlers
    this.core.attachUpEvents(upButton instanceof HTMLElement ? upButton : null);
    this.core.attachDownEvents(downButton instanceof HTMLElement ? downButton : null);
  }

  updatePrefix(value: string): void {
    // Use internal reference
    const prefixEl = this.prefixEl;

    if (value && value !== '') {
      if (prefixEl) {
        prefixEl.textContent = value;
        prefixEl.style.display = '';
        // Update classes in case prefix_extraclass changed
        prefixEl.className = `input-group-text bootstrap-touchspin-prefix ${this.opts.prefix_extraclass || ''}`.trim();
      } else {
        // Element doesn't exist, need to rebuild DOM
        this.rebuildDOM();
      }
    } else if (prefixEl) {
      // Remove element if value is empty
      this.rebuildDOM();
    }
  }

  updatePostfix(value: string): void {
    // Use internal reference
    const postfixEl = this.postfixEl;

    if (value && value !== '') {
      if (postfixEl) {
        postfixEl.textContent = value;
        postfixEl.style.display = '';
        // Update classes in case postfix_extraclass changed
        postfixEl.className = `input-group-text bootstrap-touchspin-postfix ${this.opts.postfix_extraclass || ''}`.trim();
      } else {
        // Element doesn't exist, need to rebuild DOM
        this.rebuildDOM();
      }
    } else if (postfixEl) {
      // Remove element if value is empty
      this.rebuildDOM();
    }
  }

  updateButtonClass(type: 'up' | 'down', className: string | null | undefined): void {
    if (!this.wrapper) return;
    const button = this.wrapper.querySelector(`[data-touchspin-injected="${type}"]`);
    if (button) {
      button.className = `${className || 'btn btn-outline-secondary'} bootstrap-touchspin-${type}`;
    }
  }

  buildVerticalButtons(): string {
    this.refreshOpts();
    // Bootstrap 5: Return complete wrapper since there's no outer wrapper in the calling code
    return `
      <span class="input-group-text bootstrap-touchspin-vertical-button-wrapper" data-touchspin-injected="vertical-wrapper">
        <span class="input-group-btn-vertical">
          <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="${this.opts.buttonup_class || 'btn btn-outline-secondary'} ${this.opts.verticalupclass || 'btn btn-outline-secondary'} bootstrap-touchspin-up" data-touchspin-injected="up"${this.getUpButtonTestId()} type="button" aria-label="Increase value">${this.opts.verticalup || '+'}</button>
          <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="${this.opts.buttondown_class || 'btn btn-outline-secondary'} ${this.opts.verticaldownclass || 'btn btn-outline-secondary'} bootstrap-touchspin-down" data-touchspin-injected="down"${this.getDownButtonTestId()} type="button" aria-label="Decrease value">${this.opts.verticaldown || '−'}</button>
        </span>
      </span>
    `;
  }

  updateVerticalButtonClass(type: 'up' | 'down', className: string | null | undefined): void {
    if (!this.wrapper) return;
    this.refreshOpts();
    const verticalWrapper = this.wrapper.querySelector('[data-touchspin-injected="vertical-wrapper"]');
    if (verticalWrapper) {
      const button = verticalWrapper.querySelector(`[data-touchspin-injected="${type}"]`);
      if (button) {
        // Preserve the correct base class per button kind, then apply the vertical override
        const base =
          type === 'up'
            ? (this.opts.buttonup_class ?? 'btn btn-outline-secondary')
            : (this.opts.buttondown_class ?? 'btn btn-outline-secondary');
        button.className = `${base} ${className ?? 'btn btn-outline-secondary'} bootstrap-touchspin-${type}`;
      }
    }
  }

  updateVerticalButtonText(type: 'up' | 'down', text?: string): void {
    if (!this.wrapper) return;
    const verticalWrapper = this.wrapper.querySelector('[data-touchspin-injected="vertical-wrapper"]');
    if (verticalWrapper) {
      const button = verticalWrapper.querySelector(`[data-touchspin-injected="${type}"]`);
      if (button) {
        button.textContent = text || (type === 'up' ? '+' : '−');
      }
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
      prefixEl.className = `input-group-text bootstrap-touchspin-prefix ${this.opts.prefix_extraclass || ''}`.trim();
    }
  }

  updatePostfixClasses(): void {
    const postfixEl = this.postfixEl;
    if (postfixEl) {
      postfixEl.className = `input-group-text bootstrap-touchspin-postfix ${this.opts.postfix_extraclass || ''}`.trim();
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
  }

  updateButtonFocusability(newValue: boolean): void {
    // Find all buttons and update their tabindex
    if (!this.wrapper) return;
    const buttons = this.wrapper.querySelectorAll('[data-touchspin-injected="up"], [data-touchspin-injected="down"]');
    const tabindex = newValue ? '0' : '-1';
    buttons.forEach(button => {
      button.setAttribute('tabindex', tabindex);
    });
  }
}

export default Bootstrap5Renderer;

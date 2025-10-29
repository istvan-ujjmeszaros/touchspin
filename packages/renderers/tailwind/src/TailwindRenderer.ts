/**
 * Tailwind CSS Renderer - REPLACE Semantics
 *
 * This renderer uses utility-first Tailwind CSS classes with REPLACE semantics:
 * custom settings completely replace defaults rather than concatenating with them.
 *
 * KEY CHANGES FROM OTHER RENDERERS:
 *
 * 1. NO prefix_extraclass / postfix_extraclass Support
 *    - Use prefix_classes_override / postfix_classes_override instead
 *    - These settings completely REPLACE the default addon classes
 *
 * 2. Marker Classes Always Present
 *    - Structural marker classes (ts-input, ts-wrapper, ts-addon) are always added
 *    - These ensure proper DOM identification regardless of custom classes
 *
 * 3. No shadow-sm in Defaults
 *    - The default wrapper no longer includes shadow-sm utility class
 *    - Add it manually via wrapper_classes if needed
 *
 * MIGRATION GUIDE:
 *
 * Before (Other Renderers):
 *   prefix_extraclass: 'custom-class'  // Adds to defaults
 *
 * After (Tailwind Renderer):
 *   prefix_classes_override: 'inline-flex items-center px-3 py-2 custom-class'
 *   // Completely replaces defaults, marker classes (ts-addon ts-prefix) added automatically
 *
 * Settings Using REPLACE Semantics:
 * - input_classes: Replaces DEFAULT_INPUT (marker: ts-input added automatically)
 * - wrapper_classes: Replaces DEFAULT_WRAPPER (marker: ts-wrapper added automatically)
 * - prefix_classes_override: Replaces default addon classes (markers: ts-addon ts-prefix added automatically)
 * - postfix_classes_override: Replaces default addon classes (markers: ts-addon ts-postfix added automatically)
 * - buttonup_class / buttondown_class: Replaces button defaults (no markers)
 * - verticalupclass / verticaldownclass: Replaces vertical button defaults (no markers)
 */
import type { TouchSpinCoreOptions } from '@touchspin/core';
import { AbstractRendererSimple } from '@touchspin/core/renderer';

const BUTTON_MARKER = 'tailwind-btn';
const BUTTON_MARKER_HORIZONTAL_UP = `${BUTTON_MARKER} ts-btn ts-btn--up`;
const BUTTON_MARKER_HORIZONTAL_DOWN = `${BUTTON_MARKER} ts-btn ts-btn--down`;
const BUTTON_MARKER_VERTICAL_BASE = `${BUTTON_MARKER} ts-btn ts-btn--vertical`;
const BUTTON_MARKER_VERTICAL_UP = `${BUTTON_MARKER_VERTICAL_BASE} ts-btn--vertical-up`;
const BUTTON_MARKER_VERTICAL_DOWN = `${BUTTON_MARKER_VERTICAL_BASE} ts-btn--vertical-down`;

// Default class strings (REPLACE semantics: setting || default)
const DEFAULT_WRAPPER =
  'ts-wrapper flex rounded-md border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 has-[:disabled]:opacity-60 has-[:disabled]:bg-gray-50 has-[:read-only]:bg-gray-50 overflow-hidden';

const DEFAULT_INPUT =
  'ts-input flex-1 px-3 py-2 border-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500';

const DEFAULT_BUTTON_BASE =
  'inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-medium border-0 disabled:opacity-50 disabled:cursor-not-allowed';

const DEFAULT_BUTTON_DOWN = `${BUTTON_MARKER_HORIZONTAL_DOWN} ${DEFAULT_BUTTON_BASE}`;

const DEFAULT_BUTTON_UP = `${BUTTON_MARKER_HORIZONTAL_UP} ${DEFAULT_BUTTON_BASE}`;

const DEFAULT_PREFIX_ADDON =
  'ts-addon ts-prefix inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0';

const DEFAULT_POSTFIX_ADDON =
  'ts-addon ts-postfix inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0';

const DEFAULT_BUTTON_VERTICAL_BASE =
  'inline-flex items-center justify-center w-full px-3 py-1 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-medium border-0 disabled:opacity-50 disabled:cursor-not-allowed';

const DEFAULT_BUTTON_VERTICAL_UP = `${BUTTON_MARKER_VERTICAL_UP} ${DEFAULT_BUTTON_VERTICAL_BASE}`;

const DEFAULT_BUTTON_VERTICAL_DOWN = `${BUTTON_MARKER_VERTICAL_DOWN} ${DEFAULT_BUTTON_VERTICAL_BASE}`;

/**
 * TailwindRenderer-specific options that extend core options
 */
interface TailwindRendererOptions extends TouchSpinCoreOptions {
  input_classes?: string;
  wrapper_classes?: string;
  // Only REPLACE semantics - no extraclass support
  prefix_classes_override?: string;
  postfix_classes_override?: string;
}

class TailwindRenderer extends AbstractRendererSimple {
  private prefixEl: HTMLElement | null = null;
  private postfixEl: HTMLElement | null = null;
  private initialFlexContainer: HTMLElement | null = null;
  private initialInputClassSnapshot = '';
  declare wrapper: HTMLElement | null;

  // Type the settings for TailwindRenderer-specific options
  declare settings: TailwindRendererOptions;

  init(): void {
    // Initialize internal element references
    this.prefixEl = null;
    this.postfixEl = null;

    // Store initial flex container for rebuild fallback (same pattern as Bootstrap5)
    this.initialFlexContainer = this.input.closest('.flex.rounded-md') as HTMLElement | null;
    this.initialInputClassSnapshot = this.input.className;

    // 1. Build and inject DOM structure around input
    this.wrapper = this.buildInputGroup();

    // 2. Find created buttons and store prefix/postfix references
    const upButton = this.wrapper.querySelector<HTMLElement>('[data-touchspin-injected="up"]');
    const downButton = this.wrapper.querySelector<HTMLElement>('[data-touchspin-injected="down"]');
    this.prefixEl = this.wrapper.querySelector<HTMLElement>('[data-touchspin-injected="prefix"]');
    this.postfixEl = this.wrapper.querySelector<HTMLElement>('[data-touchspin-injected="postfix"]');

    // 3. Tell core to attach its event handlers
    this.core.attachUpEvents(upButton);
    this.core.attachDownEvents(downButton);

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
    this.core.observeSetting('input_classes' as keyof TouchSpinCoreOptions, () =>
      this.rebuildDOM()
    );
    this.core.observeSetting('wrapper_classes' as keyof TouchSpinCoreOptions, () =>
      this.rebuildDOM()
    );
    this.core.observeSetting('prefix_classes_override' as keyof TouchSpinCoreOptions, () =>
      this.rebuildDOM()
    );
    this.core.observeSetting('postfix_classes_override' as keyof TouchSpinCoreOptions, () =>
      this.rebuildDOM()
    );
    this.core.observeSetting('verticalbuttons', (newValue) =>
      this.handleVerticalButtonsChange(newValue)
    );
    this.core.observeSetting('focusablebuttons', (newValue) =>
      this.updateButtonFocusability(newValue)
    );
  }

  // teardown() uses inherited removeInjectedElements() - no override needed

  buildInputGroup(): HTMLElement {
    // Check if input is already inside a flex container (with fallback like Bootstrap5)
    const closestContainer = this.input.closest('.flex') as HTMLElement | null;
    const existingContainer = closestContainer ?? this.initialFlexContainer;

    if (existingContainer?.classList.contains('rounded-md')) {
      return this.buildAdvancedInputGroup(existingContainer);
    } else {
      return this.buildBasicInputGroup();
    }
  }

  buildBasicInputGroup(): HTMLElement {
    const isVertical = Boolean(this.settings.verticalbuttons);

    // REPLACE semantics with marker class preservation
    const wrapperClasses = this.settings.wrapper_classes
      ? `ts-wrapper ${this.settings.wrapper_classes}`
      : DEFAULT_WRAPPER;
    const inputClasses = this.settings.input_classes
      ? `ts-input ${this.settings.input_classes}`
      : DEFAULT_INPUT;
    const downButtonClasses = this.composeHorizontalButtonClasses(
      'down',
      this.settings.buttondown_class
    );
    const upButtonClasses = this.composeHorizontalButtonClasses('up', this.settings.buttonup_class);

    // Addon classes with override support and marker preservation
    const prefixClasses = this.composeAddonClasses('prefix');
    const postfixClasses = this.composeAddonClasses('postfix');

    const verticalUpClasses = this.composeVerticalButtonClasses(
      'up',
      this.settings.verticalupclass
    );
    const verticalDownOverride = this.settings.verticaldownclass ?? this.settings.verticalupclass;
    const verticalDownClasses = this.composeVerticalButtonClasses('down', verticalDownOverride);

    // Add vertical modifier to wrapper if needed
    const finalWrapperClasses = isVertical
      ? `${wrapperClasses} ts-wrapper--vertical`
      : wrapperClasses;

    let html;
    if (isVertical) {
      html = `
        <div class="${finalWrapperClasses}">
          <span class="${prefixClasses}" data-touchspin-injected="prefix"${this.getPrefixTestId()}>${this.settings.prefix || ''}</span>
          <span class="${postfixClasses}" data-touchspin-injected="postfix"${this.getPostfixTestId()}>${this.settings.postfix || ''}</span>
          ${this.buildVerticalButtonsSimple(verticalUpClasses, verticalDownClasses)}
        </div>
      `;
    } else {
      html = `
        <div class="${finalWrapperClasses}">
          <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="${downButtonClasses}" data-touchspin-injected="down"${this.getDownButtonTestId()} type="button" aria-label="Decrease value">${this.settings.buttondown_txt}</button>
          <span class="${prefixClasses}" data-touchspin-injected="prefix"${this.getPrefixTestId()}>${this.settings.prefix || ''}</span>
          <span class="${postfixClasses}" data-touchspin-injected="postfix"${this.getPostfixTestId()}>${this.settings.postfix || ''}</span>
          <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="${upButtonClasses}" data-touchspin-injected="up"${this.getUpButtonTestId()} type="button" aria-label="Increase value">${this.settings.buttonup_txt}</button>
        </div>
      `;
    }

    // Create wrapper and wrap the input
    const tempDiv = document.createElement('div');
    // CodeQL [js/xss-through-dom] - Safe: HTML string is constructed from trusted configuration settings
    // (prefix, postfix, button classes/text) provided by the developer, not from user-controlled DOM content.
    tempDiv.innerHTML = html.trim();
    const wrapper = tempDiv.firstChild as HTMLElement;

    // Insert wrapper and move input into it
    if (this.input.parentElement) {
      this.input.parentElement.insertBefore(wrapper, this.input);
    }

    // Find the position to insert input (after prefix, before postfix)
    const prefixEl = wrapper.querySelector<HTMLElement>('[data-touchspin-injected="prefix"]');
    if (prefixEl) {
      wrapper.insertBefore(this.input, prefixEl.nextSibling);
    } else {
      const postfixEl = wrapper.querySelector<HTMLElement>('[data-touchspin-injected="postfix"]');
      if (postfixEl) wrapper.insertBefore(this.input, postfixEl);
    }

    // Apply input classes (already includes ts-input marker)
    this.input.className = inputClasses;

    // Apply size classes
    this._applySizeClasses(wrapper as HTMLElement);

    // Hide empty prefix/postfix
    this.hideEmptyPrefixPostfix(wrapper as HTMLElement);

    return wrapper as HTMLElement;
  }

  /**
   * Ensures the input element is a child of the given container.
   * Fixes DOM insertion bug during layout rebuilds.
   */
  private ensureInputInContainer(existingContainer: HTMLElement): void {
    if (this.input.parentElement === existingContainer) {
      return;
    }
    existingContainer.appendChild(this.input);
  }

  buildAdvancedInputGroup(existingContainer: HTMLElement): HTMLElement {
    // Mark this as an advanced wrapper
    this.wrapperType = 'wrapper-advanced';

    // Add testid if wrapper doesn't already have one and input has one
    const inputTestId = this.input.getAttribute('data-testid');
    const existingWrapperTestId = existingContainer.getAttribute('data-testid');
    if (!existingWrapperTestId && inputTestId) {
      existingContainer.setAttribute('data-testid', `${inputTestId}-wrapper`);
    }

    // Ensure input is in container before any insertBefore operations
    this.ensureInputInContainer(existingContainer);

    const isVertical = Boolean(this.settings.verticalbuttons);

    // REPLACE semantics with marker class preservation
    const inputClasses = this.settings.input_classes
      ? `ts-input ${this.settings.input_classes}`
      : DEFAULT_INPUT;
    const downButtonClasses = this.composeHorizontalButtonClasses(
      'down',
      this.settings.buttondown_class
    );
    const upButtonClasses = this.composeHorizontalButtonClasses('up', this.settings.buttonup_class);

    // Addon classes with override support and marker preservation
    const prefixClasses = this.composeAddonClasses('prefix');
    const postfixClasses = this.composeAddonClasses('postfix');

    const verticalUpClasses = this.composeVerticalButtonClasses(
      'up',
      this.settings.verticalupclass
    );
    const verticalDownOverride = this.settings.verticaldownclass ?? this.settings.verticalupclass;
    const verticalDownClasses = this.composeVerticalButtonClasses('down', verticalDownOverride);

    // Apply wrapper classes if custom ones provided (merge with existing container classes)
    if (this.settings.wrapper_classes) {
      existingContainer.className = `ts-wrapper ${this.settings.wrapper_classes}`;
    } else {
      // Keep existing classes but ensure ts-wrapper is present
      if (!existingContainer.classList.contains('ts-wrapper')) {
        existingContainer.classList.add('ts-wrapper');
      }
    }

    if (isVertical) {
      existingContainer.classList.add('ts-wrapper--vertical');
    } else {
      existingContainer.classList.remove('ts-wrapper--vertical');
    }

    // Create elements HTML
    let elementsHtml;
    if (isVertical) {
      elementsHtml = `
        <span class="${prefixClasses}" data-touchspin-injected="prefix"${this.getPrefixTestId()}>${this.settings.prefix || ''}</span>
        ${this.buildVerticalButtonsSimple(verticalUpClasses, verticalDownClasses)}
        <span class="${postfixClasses}" data-touchspin-injected="postfix"${this.getPostfixTestId()}>${this.settings.postfix || ''}</span>
      `;
    } else {
      elementsHtml = `
        <span class="${prefixClasses}" data-touchspin-injected="prefix"${this.getPrefixTestId()}>${this.settings.prefix || ''}</span>
        <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="${downButtonClasses}" data-touchspin-injected="down"${this.getDownButtonTestId()} type="button" aria-label="Decrease value">${this.settings.buttondown_txt}</button>
        <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="${upButtonClasses}" data-touchspin-injected="up"${this.getUpButtonTestId()} type="button" aria-label="Increase value">${this.settings.buttonup_txt}</button>
        <span class="${postfixClasses}" data-touchspin-injected="postfix"${this.getPostfixTestId()}>${this.settings.postfix || ''}</span>
      `;
    }

    const tempDiv = document.createElement('div');
    // CodeQL [js/xss-through-dom] - Safe: HTML string is constructed from trusted configuration settings
    // (prefix, postfix, button classes/text) provided by the developer, not from user-controlled DOM content.
    tempDiv.innerHTML = elementsHtml;

    // Insert prefix before the input
    const prefixEl = tempDiv.querySelector<HTMLElement>('[data-touchspin-injected="prefix"]');
    if (prefixEl) existingContainer.insertBefore(prefixEl, this.input);

    if (isVertical) {
      // Insert vertical button wrapper after the input
      const verticalWrapper = tempDiv.querySelector<HTMLElement>(
        '[data-touchspin-injected="vertical-wrapper"]'
      );
      if (verticalWrapper) existingContainer.insertBefore(verticalWrapper, this.input.nextSibling);
    } else {
      // Insert down button before the input
      const downButton = tempDiv.querySelector<HTMLElement>('[data-touchspin-injected="down"]');
      if (downButton) existingContainer.insertBefore(downButton, this.input);

      // Insert up button after the input
      const upButton = tempDiv.querySelector<HTMLElement>('[data-touchspin-injected="up"]');
      if (upButton) existingContainer.insertBefore(upButton, this.input.nextSibling);
    }

    // Insert postfix after everything
    const postfixEl = tempDiv.querySelector<HTMLElement>('[data-touchspin-injected="postfix"]');
    if (postfixEl) existingContainer.appendChild(postfixEl);

    // Store internal references for advanced mode too
    this.prefixEl = prefixEl;
    this.postfixEl = postfixEl;

    // Apply input classes (already includes ts-input marker)
    this.input.className = inputClasses;

    // Apply size classes
    this._applySizeClasses(existingContainer);

    // Hide empty prefix/postfix
    this.hideEmptyPrefixPostfix(existingContainer);

    return existingContainer;
  }

  /**
   * Simplified vertical buttons builder that takes classes directly
   */
  private buildVerticalButtonsSimple(upClass: string, downClass: string): string {
    return `
      <div class="flex flex-col" data-touchspin-injected="vertical-wrapper">
        <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="${upClass}" data-touchspin-injected="up"${this.getUpButtonTestId()} type="button" aria-label="Increase value">${this.settings.verticalup}</button>
        <button tabindex="${this.settings.focusablebuttons ? '0' : '-1'}" class="${downClass}" data-touchspin-injected="down"${this.getDownButtonTestId()} type="button" aria-label="Decrease value">${this.settings.verticaldown}</button>
      </div>
    `;
  }

  private composeHorizontalButtonClasses(
    type: 'up' | 'down',
    override: string | null | undefined
  ): string {
    const fallback = type === 'up' ? DEFAULT_BUTTON_UP : DEFAULT_BUTTON_DOWN;
    const markers = type === 'up' ? BUTTON_MARKER_HORIZONTAL_UP : BUTTON_MARKER_HORIZONTAL_DOWN;
    return this.composeButtonClasses(override, fallback, markers);
  }

  private composeVerticalButtonClasses(
    type: 'up' | 'down',
    override: string | null | undefined
  ): string {
    const fallback = type === 'up' ? DEFAULT_BUTTON_VERTICAL_UP : DEFAULT_BUTTON_VERTICAL_DOWN;
    const markers = type === 'up' ? BUTTON_MARKER_VERTICAL_UP : BUTTON_MARKER_VERTICAL_DOWN;
    return this.composeButtonClasses(override, fallback, markers);
  }

  private composeAddonClasses(kind: 'prefix' | 'postfix'): string {
    const override =
      kind === 'prefix'
        ? this.settings.prefix_classes_override
        : this.settings.postfix_classes_override;
    const markers = kind === 'prefix' ? 'ts-addon ts-prefix' : 'ts-addon ts-postfix';
    const fallback = kind === 'prefix' ? DEFAULT_PREFIX_ADDON : DEFAULT_POSTFIX_ADDON;
    if (override && override.trim() !== '') {
      return `${markers} ${override}`.trim();
    }
    return fallback;
  }

  private composeButtonClasses(
    customClass: string | null | undefined,
    fallbackWithMarker: string,
    markerPrefix: string
  ): string {
    const trimmed = customClass?.trim();
    if (trimmed) {
      return `${markerPrefix} ${trimmed}`.trim();
    }
    return fallbackWithMarker;
  }

  private resolveSizeSource(): string {
    const custom = this.settings.input_classes?.trim();
    if (custom && custom !== '') {
      return custom;
    }
    const initial = this.initialInputClassSnapshot?.trim();
    if (initial && initial !== '') {
      return initial;
    }
    return this.input.className;
  }

  _detectInputSize(): string {
    const classList = this.resolveSizeSource();
    if (classList.includes('text-sm') || classList.includes('py-1')) {
      return 'text-sm py-1 px-2';
    } else if (classList.includes('text-lg') || classList.includes('py-3')) {
      return 'text-lg py-3 px-4';
    }
    return 'text-base py-2 px-3';
  }

  private resetSizeClasses(wrapper: HTMLElement): void {
    wrapper.classList.remove('text-sm', 'text-lg');
    const buttonSelectors = '[data-touchspin-injected="up"], [data-touchspin-injected="down"]';
    wrapper.querySelectorAll<HTMLElement>(buttonSelectors).forEach((btn) => {
      btn.classList.remove('py-1', 'px-2', 'text-sm', 'py-3', 'px-4', 'text-lg');
    });
    const addonSelectors =
      '[data-touchspin-injected="prefix"], [data-touchspin-injected="postfix"]';
    wrapper.querySelectorAll<HTMLElement>(addonSelectors).forEach((addon) => {
      addon.classList.remove('py-1', 'px-2', 'text-sm', 'py-3', 'px-4', 'text-lg');
    });
  }

  _applySizeClasses(wrapper: HTMLElement | null = this.wrapper): void {
    if (!wrapper) return;
    this.resetSizeClasses(wrapper);
    const s = this._detectInputSize();
    if (s.includes('text-sm')) {
      wrapper.classList.add('text-sm');
      wrapper
        .querySelectorAll('[data-touchspin-injected="up"], [data-touchspin-injected="down"]')
        .forEach((btn) => {
          btn.classList.add('py-1', 'px-2', 'text-sm');
        });
      wrapper
        .querySelectorAll('[data-touchspin-injected="prefix"], [data-touchspin-injected="postfix"]')
        .forEach((addon) => {
          addon.classList.add('py-1', 'px-2', 'text-sm');
        });
    } else if (s.includes('text-lg')) {
      wrapper.classList.add('text-lg');
      wrapper
        .querySelectorAll('[data-touchspin-injected="up"], [data-touchspin-injected="down"]')
        .forEach((btn) => {
          btn.classList.add('py-3', 'px-4', 'text-lg');
        });
      wrapper
        .querySelectorAll('[data-touchspin-injected="prefix"], [data-touchspin-injected="postfix"]')
        .forEach((addon) => {
          addon.classList.add('py-3', 'px-4', 'text-lg');
        });
    }
  }

  hideEmptyPrefixPostfix(wrapper: HTMLElement | null = this.wrapper): void {
    if (!wrapper) return;
    // Use internal references if available, otherwise query from wrapper
    const prefixEl =
      this.prefixEl || wrapper.querySelector<HTMLElement>('[data-touchspin-injected="prefix"]');
    const postfixEl =
      this.postfixEl || wrapper.querySelector<HTMLElement>('[data-touchspin-injected="postfix"]');

    if (prefixEl && (!this.settings.prefix || this.settings.prefix === '')) {
      prefixEl.style.display = 'none';
    }
    if (postfixEl && (!this.settings.postfix || this.settings.postfix === '')) {
      postfixEl.style.display = 'none';
    }
  }

  updatePrefix(value: string | null | undefined): void {
    const prefixEl = this.prefixEl;

    if (value && value !== '') {
      if (prefixEl) {
        prefixEl.textContent = value;
        prefixEl.style.display = '';
      }
    } else if (prefixEl) {
      prefixEl.style.display = 'none';
    }
  }

  updatePostfix(value: string | null | undefined): void {
    const postfixEl = this.postfixEl;

    if (value && value !== '') {
      if (postfixEl) {
        postfixEl.textContent = value;
        postfixEl.style.display = '';
      }
    } else if (postfixEl) {
      postfixEl.style.display = 'none';
    }
  }

  updateButtonClass(type: 'up' | 'down', className?: string | null): void {
    if (!this.wrapper) return;
    const button = this.wrapper.querySelector<HTMLElement>(`[data-touchspin-injected="${type}"]`);
    if (!button) return;

    button.className = this.composeHorizontalButtonClasses(type, className ?? undefined);
  }

  updateVerticalButtonClass(type: 'up' | 'down', className?: string | null): void {
    if (!this.wrapper) return;
    const verticalWrapper = this.wrapper.querySelector<HTMLElement>(
      '[data-touchspin-injected="vertical-wrapper"]'
    );
    if (!verticalWrapper) return;

    const button = verticalWrapper.querySelector<HTMLElement>(
      `[data-touchspin-injected="${type}"]`
    );
    if (!button) return;

    button.className = this.composeVerticalButtonClasses(type, className ?? undefined);
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
        button.textContent = text ?? '';
      }
    }
  }

  updateButtonText(type: 'up' | 'down', text?: string | null): void {
    if (!this.wrapper) return;
    const button = this.wrapper.querySelector<HTMLElement>(`[data-touchspin-injected="${type}"]`);
    if (button) {
      button.textContent = text ?? '';
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
    this.finalizeWrapperAttributes();
  }

  buildAndAttachDOM(): void {
    // Refresh cached DOM references before rebuilding
    const flexContainer = this.input.closest('.flex.rounded-md') as HTMLElement | null;
    if (flexContainer) {
      this.initialFlexContainer = flexContainer;
    }
    this.initialInputClassSnapshot = this.input.className;

    // 1. Build and inject DOM structure around input
    this.wrapper = this.buildInputGroup();

    // 2. Find created buttons and store prefix/postfix references
    const upButton = this.wrapper.querySelector<HTMLElement>('[data-touchspin-injected="up"]');
    const downButton = this.wrapper.querySelector<HTMLElement>('[data-touchspin-injected="down"]');
    this.prefixEl = this.wrapper.querySelector<HTMLElement>('[data-touchspin-injected="prefix"]');
    this.postfixEl = this.wrapper.querySelector<HTMLElement>('[data-touchspin-injected="postfix"]');

    // 3. Tell core to attach its event handlers
    this.core.attachUpEvents(upButton);
    this.core.attachDownEvents(downButton);
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

export default TailwindRenderer;

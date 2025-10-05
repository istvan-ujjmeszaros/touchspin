import type { InferOptionsFromSchema, RendererOptionSchema } from '@touchspin/core/renderer';
import { AbstractRendererSurgical } from '@touchspin/core/renderer';

// Schema definition
const bootstrap5Schema = Object.freeze({
  // Button text
  buttonup_txt: { kind: 'string' },
  buttondown_txt: { kind: 'string' },

  // Button classes
  buttonup_class: { kind: 'string' },
  buttondown_class: { kind: 'string' },

  // Vertical layout
  verticalbuttons: { kind: 'boolean' },
  verticalup: { kind: 'string' },
  verticaldown: { kind: 'string' },
  verticalupclass: { kind: 'string' },
  verticaldownclass: { kind: 'string' },

  // Prefix/postfix
  prefix: { kind: 'string' },
  postfix: { kind: 'string' },
  prefix_extraclass: { kind: 'string' },
  postfix_extraclass: { kind: 'string' },
} as const satisfies RendererOptionSchema);

// Constants
const CSS_CLASSES = {
  FORM_CONTROL: 'form-control',
  INPUT_GROUP: 'input-group',
  INPUT_GROUP_TEXT: 'input-group-text',
  BOOTSTRAP_TOUCHSPIN: 'bootstrap-touchspin',
  BTN_VERTICAL: 'input-group-btn-vertical',
  DEFAULT_BUTTON: 'btn btn-outline-secondary',
} as const;

const SELECTORS = {
  UP_BUTTON: '[data-touchspin-injected="up"]',
  DOWN_BUTTON: '[data-touchspin-injected="down"]',
  PREFIX: '[data-touchspin-injected="prefix"]',
  POSTFIX: '[data-touchspin-injected="postfix"]',
  VERTICAL_WRAPPER: '[data-touchspin-injected="vertical-wrapper"]',
} as const;

const BUTTON_TEXT = {
  UP: '+',
  DOWN: '−',
} as const;

const INJECTED_TYPES = {
  UP: 'up',
  DOWN: 'down',
  PREFIX: 'prefix',
  POSTFIX: 'postfix',
  VERTICAL_WRAPPER: 'vertical-wrapper',
} as const;

type RendererOptions = Readonly<Partial<InferOptionsFromSchema<typeof bootstrap5Schema>>>;

/**
 * Bootstrap5Renderer - Renders TouchSpin with Bootstrap 5 markup
 *
 * ## Floating Label Support
 *
 * ### Basic Floating Label
 * Wraps .form-floating in .input-group, with buttons/affixes outside:
 * - .input-group.bootstrap-touchspin (wrapper)
 *   - button (down)
 *   - .form-floating
 *     - input
 *     - label
 *   - button (up)
 *
 * ### Advanced Floating Label (existing input-group)
 * Preserves existing .input-group structure, .form-floating stays between prefix/postfix:
 * - .input-group.bootstrap-touchspin (existing wrapper)
 *   - span.input-group-text (prefix, if present)
 *   - button (down)
 *   - .form-floating
 *     - input
 *     - label
 *   - button (up)
 *   - span.input-group-text (postfix, if present)
 *
 * ### Vertical Buttons
 * For both basic and advanced cases, vertical wrapper comes after .form-floating:
 * - .input-group.bootstrap-touchspin
 *   - [prefix] (advanced only)
 *   - .form-floating
 *     - input
 *     - label
 *   - span.input-group-text.bootstrap-touchspin-vertical-button-wrapper
 *     - span.input-group-btn-vertical
 *       - button (up)
 *       - button (down)
 *   - [postfix] (advanced only)
 */
class Bootstrap5Renderer extends AbstractRendererSurgical {
  private readonly initialInputGroup: HTMLElement | null;
  private readonly floatingContainer: HTMLElement | null;
  private readonly floatingLabel: HTMLLabelElement | null;
  private opts: RendererOptions = {};
  private prefixEl: HTMLElement | null = null;
  private postfixEl: HTMLElement | null = null;
  private formControlAdded = false;
  declare wrapper: HTMLElement | null;

  constructor(...args: ConstructorParameters<typeof AbstractRendererSurgical>) {
    super(...args);
    const [input] = args;

    // Detect floating label structure
    this.floatingContainer = input.closest('.form-floating') as HTMLElement | null;
    this.floatingLabel = this.floatingContainer?.querySelector('label') as HTMLLabelElement | null;

    // Detect existing input-group
    this.initialInputGroup = input.closest(`.${CSS_CLASSES.INPUT_GROUP}`) as HTMLElement | null;
  }

  init(): void {
    // Register special elements for renderer logic
    this.registerSpecialElement('input', this.input);

    if (this.initialInputGroup) {
      this.registerSpecialElement('inputGroup', this.initialInputGroup);
    }
    if (this.floatingContainer) {
      this.registerSpecialElement('floatingContainer', this.floatingContainer);
    }
    if (this.floatingLabel) {
      this.registerSpecialElement('floatingLabel', this.floatingLabel);
    }

    // Determine the "input container" - what needs to be moved as a unit
    // This is either the floating container (with input+label) or just the input itself
    const inputContainer = this.floatingContainer || this.input;
    this.registerSpecialElement('inputContainer', inputContainer);

    // Fix any malformed DOM structure (not tracked - happens before we start tracking)
    this.ensureFloatingLabelStructure();

    this.initializeOptions();
    this.resetElementReferences();
    this.handleFloatingMargins(); // Handle margin classes before building
    this.ensureFormControlClass();
    this.buildAndAttachDOM();
    this.registerSettingObservers();
  }

  /**
   * Ensure input and label are correctly positioned in .form-floating
   * This runs BEFORE tracking starts to fix any malformed DOM structure
   */
  private ensureFloatingLabelStructure(): void {
    if (!this.floatingContainer || !this.floatingLabel) return;

    // Ensure input is in floating container
    if (this.input.parentElement !== this.floatingContainer) {
      this.trackMoveElement(this.input, this.floatingContainer, this.floatingContainer.firstChild);
    }

    // Ensure label is in floating container (after input)
    if (this.floatingLabel.parentElement !== this.floatingContainer) {
      this.trackMoveElement(this.floatingLabel, this.floatingContainer);
    }
  }

  teardown(): void {
    this.restoreFormControlClass();
    super.teardown(); // Handles everything via metadata tracking!
  }

  // Initialization helpers
  private initializeOptions(): void {
    this.opts = this.filterRendererSettings(bootstrap5Schema);
  }

  private resetElementReferences(): void {
    this.prefixEl = null;
    this.postfixEl = null;
  }

  private ensureFormControlClass(): void {
    if (!this.input.classList.contains(CSS_CLASSES.FORM_CONTROL)) {
      this.trackAddClass(this.input, CSS_CLASSES.FORM_CONTROL);
      this.formControlAdded = true;
    }
  }

  private restoreFormControlClass(): void {
    // Note: formControlAdded tracking is kept for backward compatibility,
    // but undo stack will handle restoration automatically
    if (this.formControlAdded) {
      this.trackRemoveClass(this.input, CSS_CLASSES.FORM_CONTROL);
      this.formControlAdded = false;
    }
  }

  /**
   * Handle margin classes on .form-floating
   * Bootstrap margin classes (m*, mt*, mb*, etc.) on .form-floating break button height
   * Move them to the wrapper instead, metadata tracking will restore on destroy
   */
  private handleFloatingMargins(): void {
    if (!this.floatingContainer) return;

    // Detect Bootstrap margin classes: m-*, mt-*, mb-*, ml-*, mr-*, mx-*, my-*
    const marginClasses = Array.from(this.floatingContainer.classList).filter((cls) =>
      /^m[tblrxy]?-\d+$/.test(cls)
    );

    // Move margin classes from floating container to wrapper (will be created later)
    // Track this so undo stack can restore them on destroy
    marginClasses.forEach((cls) => {
      this.trackRemoveClass(this.floatingContainer!, cls);
      // Note: We'll add to wrapper after it's created in buildAndAttachDOM
      // Store them temporarily for now
      if (!this.floatingContainer!.dataset.movedMargins) {
        this.floatingContainer!.dataset.movedMargins = cls;
      } else {
        this.floatingContainer!.dataset.movedMargins += ` ${cls}`;
      }
    });
  }

  // DOM building
  buildInputGroup(): HTMLElement {
    // Handle floating labels first
    if (this.floatingContainer && this.initialInputGroup) {
      // Mode B: Floating label inside input-group
      return this.buildFloatingLabelInInputGroup();
    }

    if (this.floatingContainer) {
      // Mode A: Basic floating label
      return this.buildBasicFloatingLabel();
    }

    // Regular (non-floating) logic
    const closestGroup = this.input.closest(`.${CSS_CLASSES.INPUT_GROUP}`) as HTMLElement | null;
    const existingInputGroup = closestGroup ?? this.initialInputGroup;

    return existingInputGroup
      ? this.buildAdvancedInputGroup(existingInputGroup)
      : this.buildBasicInputGroup();
  }

  buildBasicInputGroup(): HTMLElement {
    const inputGroupSize = this.detectInputGroupSize();
    const wrapper = this.createInputGroupWrapper(inputGroupSize);

    this.appendElementsToWrapper(wrapper);
    this.insertWrapperAndInput(wrapper);
    this.positionInputWithinWrapper(wrapper);

    return wrapper;
  }

  /**
   * Build basic floating label structure
   *
   * Expected DOM (horizontal buttons):
   * <div class="input-group bootstrap-touchspin" data-touchspin-injected="wrapper">
   *   <button data-touchspin-injected="down">−</button>
   *   <div class="form-floating">
   *     <input class="form-control">
   *     <label>Label Text</label>
   *   </div>
   *   <button data-touchspin-injected="up">+</button>
   * </div>
   *
   * Expected DOM (vertical buttons):
   * <div class="input-group bootstrap-touchspin" data-touchspin-injected="wrapper">
   *   <div class="form-floating">
   *     <input class="form-control">
   *     <label>Label Text</label>
   *   </div>
   *   <span class="input-group-text bootstrap-touchspin-vertical-button-wrapper">
   *     <span class="input-group-btn-vertical">
   *       <button data-touchspin-injected="up">▲</button>
   *       <button data-touchspin-injected="down">▼</button>
   *     </span>
   *   </span>
   * </div>
   */
  buildBasicFloatingLabel(): HTMLElement {
    // For basic floating labels, we wrap .form-floating in .input-group
    // instead of putting .input-group inside .form-floating
    const inputGroupSize = this.detectInputGroupSize();
    const wrapper = this.createInputGroupWrapper(inputGroupSize);

    // Wrap the entire .form-floating container
    if (this.floatingContainer && this.floatingContainer.parentElement) {
      this.trackMoveElement(wrapper, this.floatingContainer.parentElement, this.floatingContainer);
    }

    // Add buttons and affixes to the wrapper
    if (!this.opts.verticalbuttons) {
      this.trackMoveElement(this.createDownButton(), wrapper);
    }

    if (this.opts.prefix) {
      this.trackMoveElement(this.createPrefixElement(), wrapper);
    }

    // Move the entire .form-floating into the wrapper
    if (this.floatingContainer) {
      this.trackMoveElement(this.floatingContainer, wrapper);
    }

    if (this.opts.postfix) {
      this.trackMoveElement(this.createPostfixElement(), wrapper);
    }

    if (this.opts.verticalbuttons) {
      this.trackMoveElement(this.createVerticalButtonWrapper(), wrapper);
    } else {
      this.trackMoveElement(this.createUpButton(), wrapper);
    }

    // Note: Input and label should already be correctly positioned in .form-floating
    // from the fixture. The metadata tracking system will preserve their positions.
    // DO NOT move them here as it breaks metadata tracking.

    return wrapper;
  }

  /**
   * Build advanced floating label structure (existing input-group)
   *
   * Expected DOM (horizontal buttons):
   * <div class="input-group bootstrap-touchspin" data-touchspin-injected="wrapper-advanced">
   *   <span class="input-group-text">$</span>
   *   <button data-touchspin-injected="down">−</button>
   *   <div class="form-floating">
   *     <input class="form-control">
   *     <label>Label Text</label>
   *   </div>
   *   <button data-touchspin-injected="up">+</button>
   *   <span class="input-group-text">.00</span>
   * </div>
   *
   * Expected DOM (vertical buttons):
   * <div class="input-group bootstrap-touchspin" data-touchspin-injected="wrapper-advanced">
   *   <span class="input-group-text">€</span>
   *   <div class="form-floating">
   *     <input class="form-control">
   *     <label>Label Text</label>
   *   </div>
   *   <span class="input-group-text bootstrap-touchspin-vertical-button-wrapper">
   *     <span class="input-group-btn-vertical">
   *       <button data-touchspin-injected="up">▲</button>
   *       <button data-touchspin-injected="down">▼</button>
   *     </span>
   *   </span>
   *   <span class="input-group-text">.00</span>
   * </div>
   */
  buildFloatingLabelInInputGroup(): HTMLElement {
    const inputGroup = this.initialInputGroup as HTMLElement;
    this.trackAddClass(inputGroup, CSS_CLASSES.BOOTSTRAP_TOUCHSPIN);
    this.wrapperType = 'wrapper-advanced';

    // Note: .form-floating, input, and label should already be correctly positioned
    // from the fixture. The undo stack will restore their positions.
    // DO NOT move them here unless absolutely necessary.

    // Add buttons OUTSIDE .form-floating but INSIDE .input-group
    if (!this.opts.verticalbuttons) {
      this.trackMoveElement(this.createDownButton(), inputGroup, this.floatingContainer);
    }

    if (this.opts.prefix) {
      this.trackMoveElement(this.createPrefixElement(), inputGroup, this.floatingContainer);
    }

    if (this.opts.postfix) {
      const nextSibling = this.floatingContainer?.nextSibling ?? null;
      this.trackMoveElement(this.createPostfixElement(), inputGroup, nextSibling);
    }

    if (this.opts.verticalbuttons) {
      const nextSibling = this.floatingContainer?.nextSibling ?? null;
      this.trackMoveElement(this.createVerticalButtonWrapper(), inputGroup, nextSibling);
    } else {
      const nextSibling = this.floatingContainer?.nextSibling ?? null;
      this.trackMoveElement(this.createUpButton(), inputGroup, nextSibling);
    }

    this.storeElementReferences(inputGroup);

    return inputGroup;
  }

  buildAdvancedInputGroup(existingInputGroup: HTMLElement): HTMLElement {
    this.trackAddClass(existingInputGroup, CSS_CLASSES.BOOTSTRAP_TOUCHSPIN);
    this.wrapperType = 'wrapper-advanced';

    this.insertElementsIntoExistingGroup(existingInputGroup);
    this.storeElementReferences(existingInputGroup);

    return existingInputGroup;
  }

  private createInputGroupWrapper(sizeClass: string): HTMLElement {
    const wrapper = this.createTrackedElement('div');

    // Track each class individually for proper teardown
    this.trackAddClass(wrapper, CSS_CLASSES.INPUT_GROUP);
    if (sizeClass) {
      this.trackAddClass(wrapper, sizeClass);
    }
    this.trackAddClass(wrapper, CSS_CLASSES.BOOTSTRAP_TOUCHSPIN);

    return wrapper;
  }

  private appendElementsToWrapper(wrapper: HTMLElement): void {
    if (!this.opts.verticalbuttons) {
      this.trackMoveElement(this.createDownButton(), wrapper);
    }

    if (this.opts.prefix) {
      this.trackMoveElement(this.createPrefixElement(), wrapper);
    }

    if (this.opts.postfix) {
      this.trackMoveElement(this.createPostfixElement(), wrapper);
    }

    if (this.opts.verticalbuttons) {
      this.trackMoveElement(this.createVerticalButtonWrapper(), wrapper);
    } else {
      this.trackMoveElement(this.createUpButton(), wrapper);
    }
  }

  private insertWrapperAndInput(wrapper: HTMLElement): void {
    if (this.input.parentElement) {
      this.trackMoveElement(wrapper, this.input.parentElement, this.input);
    }
  }

  private positionInputWithinWrapper(wrapper: HTMLElement): void {
    const insertionPoint = this.findInputInsertionPoint(wrapper);
    this.trackMoveElement(this.input, wrapper, insertionPoint);
  }

  private findInputInsertionPoint(wrapper: HTMLElement): Node | null {
    if (this.opts.verticalbuttons) {
      return this.findVerticalInsertionPoint(wrapper);
    }
    return this.findHorizontalInsertionPoint(wrapper);
  }

  private findVerticalInsertionPoint(wrapper: HTMLElement): Node | null {
    const prefixEl = wrapper.querySelector(SELECTORS.PREFIX);
    const postfixEl = wrapper.querySelector(SELECTORS.POSTFIX);
    const verticalWrapper = wrapper.querySelector(SELECTORS.VERTICAL_WRAPPER);

    if (prefixEl) return prefixEl.nextSibling;
    if (postfixEl) return postfixEl;
    return verticalWrapper;
  }

  private findHorizontalInsertionPoint(wrapper: HTMLElement): Node | null {
    const prefixEl = wrapper.querySelector(SELECTORS.PREFIX);
    const postfixEl = wrapper.querySelector(SELECTORS.POSTFIX);
    const upButton = wrapper.querySelector(SELECTORS.UP_BUTTON);

    if (prefixEl) return prefixEl.nextSibling;
    if (postfixEl) return postfixEl;
    return upButton;
  }

  private insertElementsIntoExistingGroup(existingInputGroup: HTMLElement): void {
    // Ensure input is a child of the existing group before using it as a reference
    this.ensureInputInGroup(existingInputGroup);

    if (!this.opts.verticalbuttons) {
      this.trackMoveElement(this.createDownButton(), existingInputGroup, this.input);
    }

    if (this.opts.prefix) {
      this.trackMoveElement(this.createPrefixElement(), existingInputGroup, this.input);
    }

    if (this.opts.postfix) {
      this.trackMoveElement(
        this.createPostfixElement(),
        existingInputGroup,
        this.input.nextSibling
      );
    }

    if (this.opts.verticalbuttons) {
      const insertionPoint = this.opts.postfix
        ? (existingInputGroup.querySelector(SELECTORS.POSTFIX)?.nextSibling ?? null)
        : this.input.nextSibling;
      this.trackMoveElement(this.createVerticalButtonWrapper(), existingInputGroup, insertionPoint);
    } else {
      const insertionPoint = this.opts.postfix
        ? (existingInputGroup.querySelector(SELECTORS.POSTFIX)?.nextSibling ?? null)
        : this.input.nextSibling;
      this.trackMoveElement(this.createUpButton(), existingInputGroup, insertionPoint);
    }
  }

  private ensureInputInGroup(existingInputGroup: HTMLElement): void {
    // Check if input is already a direct child of the group
    if (this.input.parentElement === existingInputGroup) {
      return;
    }

    // If input is not in the group, append it (it may have been moved during DOM manipulations)
    this.trackMoveElement(this.input, existingInputGroup);
  }

  // Element creation helpers
  private createButton(type: 'up' | 'down', isVertical = false): HTMLElement {
    const button = this.createTrackedElement('button');

    this.trackAddAttribute(button, 'type', 'button');
    button.tabIndex = this.settings.focusablebuttons ? 0 : -1;
    this.trackAddAttribute(button, 'data-touchspin-injected', type);
    this.trackAddAttribute(
      button,
      'aria-label',
      type === 'up' ? 'Increase value' : 'Decrease value'
    );

    const inputTestId = this.input.getAttribute('data-testid');
    if (inputTestId) {
      this.trackAddAttribute(button, 'data-testid', `${inputTestId}-${type}`);
    }

    button.className = this.getButtonClass(type, isVertical);
    const rawLabel = this.getButtonSetting(type, isVertical);
    const fallback = this.getButtonFallback(type);
    this.applyButtonLabel(button, rawLabel, fallback);

    return button;
  }

  private createUpButton(): HTMLElement {
    return this.createButton('up');
  }

  private createDownButton(): HTMLElement {
    return this.createButton('down');
  }

  private createPrefixElement(): HTMLElement {
    const element = this.createTrackedElement('span');
    element.className = this.buildClasses([
      CSS_CLASSES.INPUT_GROUP_TEXT,
      'bootstrap-touchspin-prefix',
      this.opts.prefix_extraclass,
    ]);
    this.trackAddAttribute(element, 'data-touchspin-injected', INJECTED_TYPES.PREFIX);
    element.textContent = this.opts.prefix || '';

    const inputTestId = this.input.getAttribute('data-testid');
    if (inputTestId) {
      this.trackAddAttribute(element, 'data-testid', `${inputTestId}-prefix`);
    }

    return element;
  }

  private createPostfixElement(): HTMLElement {
    const element = this.createTrackedElement('span');
    element.className = this.buildClasses([
      CSS_CLASSES.INPUT_GROUP_TEXT,
      'bootstrap-touchspin-postfix',
      this.opts.postfix_extraclass,
    ]);
    this.trackAddAttribute(element, 'data-touchspin-injected', INJECTED_TYPES.POSTFIX);
    element.textContent = this.opts.postfix || '';

    const inputTestId = this.input.getAttribute('data-testid');
    if (inputTestId) {
      this.trackAddAttribute(element, 'data-testid', `${inputTestId}-postfix`);
    }

    return element;
  }

  private createVerticalButtonWrapper(): HTMLElement {
    const wrapper = this.createTrackedElement('span');
    wrapper.className = this.buildClasses([
      CSS_CLASSES.INPUT_GROUP_TEXT,
      'bootstrap-touchspin-vertical-button-wrapper',
    ]);
    this.trackAddAttribute(wrapper, 'data-touchspin-injected', INJECTED_TYPES.VERTICAL_WRAPPER);

    const buttonContainer = this.createTrackedElement('span');
    buttonContainer.className = CSS_CLASSES.BTN_VERTICAL;

    this.trackMoveElement(this.createButton('up', true), buttonContainer);
    this.trackMoveElement(this.createButton('down', true), buttonContainer);

    this.trackMoveElement(buttonContainer, wrapper);
    return wrapper;
  }

  // Utility helpers
  private buildClasses(classes: (string | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
  }

  private getButtonClass(type: 'up' | 'down', isVertical = false): string {
    const baseClass =
      type === 'up'
        ? this.opts.buttonup_class || CSS_CLASSES.DEFAULT_BUTTON
        : this.opts.buttondown_class || CSS_CLASSES.DEFAULT_BUTTON;

    const verticalClass =
      isVertical && type === 'up'
        ? this.opts.verticalupclass || CSS_CLASSES.DEFAULT_BUTTON
        : isVertical && type === 'down'
          ? this.opts.verticaldownclass || CSS_CLASSES.DEFAULT_BUTTON
          : '';

    return this.buildClasses([baseClass, verticalClass, `bootstrap-touchspin-${type}`]);
  }

  private getButtonSetting(type: 'up' | 'down', isVertical: boolean): string | null | undefined {
    return isVertical
      ? type === 'up'
        ? this.opts.verticalup
        : this.opts.verticaldown
      : type === 'up'
        ? this.opts.buttonup_txt
        : this.opts.buttondown_txt;
  }

  private getButtonFallback(type: 'up' | 'down'): string {
    return type === 'up' ? BUTTON_TEXT.UP : BUTTON_TEXT.DOWN;
  }

  private detectInputGroupSize(): string {
    const classList = this.input.className;
    if (classList.includes('form-control-sm')) return 'input-group-sm';
    if (classList.includes('form-control-lg')) return 'input-group-lg';
    return '';
  }

  private findInjectedElement(type: string): HTMLElement | null {
    return this.wrapper?.querySelector(`[data-touchspin-injected="${type}"]`) as HTMLElement | null;
  }

  // DOM building coordination
  buildAndAttachDOM(): void {
    this.initializeOptions();
    this.wrapper = this.buildInputGroup();
    this.applyMovedMargins(); // Apply margin classes that were moved from .form-floating
    this.storeElementReferences(this.wrapper);
    this.attachEventsToButtons();
  }

  /**
   * Apply margin classes that were moved from .form-floating to wrapper
   */
  private applyMovedMargins(): void {
    if (!this.wrapper || !this.floatingContainer) return;

    const movedMargins = this.floatingContainer.dataset.movedMargins;
    if (movedMargins) {
      movedMargins.split(' ').forEach((cls) => {
        this.trackAddClass(this.wrapper!, cls);
      });
      // Clean up temporary storage
      delete this.floatingContainer.dataset.movedMargins;
    }
  }

  private storeElementReferences(wrapper: HTMLElement | null): void {
    if (!wrapper) return;

    this.prefixEl = wrapper.querySelector(SELECTORS.PREFIX) as HTMLElement | null;
    this.postfixEl = wrapper.querySelector(SELECTORS.POSTFIX) as HTMLElement | null;
  }

  private attachEventsToButtons(): void {
    if (!this.wrapper) return;

    const upButton = this.wrapper.querySelector(SELECTORS.UP_BUTTON);
    const downButton = this.wrapper.querySelector(SELECTORS.DOWN_BUTTON);

    this.core.attachUpEvents(upButton instanceof HTMLElement ? upButton : null);
    this.core.attachDownEvents(downButton instanceof HTMLElement ? downButton : null);
  }

  // Setting observers
  private registerSettingObservers(): void {
    this.core.observeSetting('prefix', (value) => this.updatePrefix(value as string));
    this.core.observeSetting('postfix', (value) => this.updatePostfix(value as string));
    this.core.observeSetting('buttonup_class', (value) =>
      this.updateButtonClass('up', value as string)
    );
    this.core.observeSetting('buttondown_class', (value) =>
      this.updateButtonClass('down', value as string)
    );
    this.core.observeSetting('verticalupclass', (value) =>
      this.updateVerticalButtonClass('up', value as string)
    );
    this.core.observeSetting('verticaldownclass', (value) =>
      this.updateVerticalButtonClass('down', value as string)
    );
    this.core.observeSetting('verticalup', (value) =>
      this.updateVerticalButtonText('up', value as string)
    );
    this.core.observeSetting('verticaldown', (value) =>
      this.updateVerticalButtonText('down', value as string)
    );
    this.core.observeSetting('buttonup_txt', (value) =>
      this.updateButtonText('up', value as string)
    );
    this.core.observeSetting('buttondown_txt', (value) =>
      this.updateButtonText('down', value as string)
    );
    this.core.observeSetting('prefix_extraclass', () => this.updatePrefixClasses());
    this.core.observeSetting('postfix_extraclass', () => this.updatePostfixClasses());
    this.core.observeSetting('verticalbuttons', (value) =>
      this.handleVerticalButtonsChange(value as boolean)
    );
    this.core.observeSetting('focusablebuttons', (value) =>
      this.updateButtonFocusability(value as boolean)
    );
  }

  // Update methods
  updatePrefix(value: string): void {
    if (value && value !== '') {
      if (this.prefixEl) {
        this.prefixEl.textContent = value;
        this.prefixEl.style.display = '';
        this.updatePrefixClasses();
      } else {
        this.rebuildDOM();
      }
    } else if (this.prefixEl) {
      this.rebuildDOM();
    }
  }

  updatePostfix(value: string): void {
    if (value && value !== '') {
      if (this.postfixEl) {
        this.postfixEl.textContent = value;
        this.postfixEl.style.display = '';
        this.updatePostfixClasses();
      } else {
        this.rebuildDOM();
      }
    } else if (this.postfixEl) {
      this.rebuildDOM();
    }
  }

  updateButtonClass(type: 'up' | 'down', className: string | null | undefined): void {
    const button = this.findInjectedElement(type);
    if (button) {
      button.className = this.buildClasses([
        className || CSS_CLASSES.DEFAULT_BUTTON,
        `bootstrap-touchspin-${type}`,
      ]);
    }
  }

  updateVerticalButtonClass(type: 'up' | 'down', className: string | null | undefined): void {
    const verticalWrapper = this.findInjectedElement(INJECTED_TYPES.VERTICAL_WRAPPER);
    const button = verticalWrapper?.querySelector(`[data-touchspin-injected="${type}"]`) as
      | HTMLElement
      | null
      | undefined;

    if (button) {
      this.initializeOptions(); // Refresh opts for current values
      const baseClass =
        type === 'up'
          ? (this.opts.buttonup_class ?? CSS_CLASSES.DEFAULT_BUTTON)
          : (this.opts.buttondown_class ?? CSS_CLASSES.DEFAULT_BUTTON);

      button.className = this.buildClasses([
        baseClass,
        className ?? CSS_CLASSES.DEFAULT_BUTTON,
        `bootstrap-touchspin-${type}`,
      ]);
    }
  }

  updateVerticalButtonText(type: 'up' | 'down', text?: string): void {
    const verticalWrapper = this.findInjectedElement(INJECTED_TYPES.VERTICAL_WRAPPER);
    const button = verticalWrapper
      ? verticalWrapper.querySelector<HTMLElement>(`[data-touchspin-injected="${type}"]`)
      : null;

    if (button) {
      this.initializeOptions();
      const fallback = this.getButtonFallback(type);
      const raw = text ?? this.getButtonSetting(type, true);
      this.applyButtonLabel(button, raw, fallback);
    }
  }

  updateButtonText(type: 'up' | 'down', text?: string): void {
    const button = this.findInjectedElement(type);
    if (button) {
      this.initializeOptions();
      const fallback = this.getButtonFallback(type);
      const raw = text ?? this.getButtonSetting(type, false);
      this.applyButtonLabel(button, raw, fallback);
    }
  }

  updatePrefixClasses(): void {
    if (this.prefixEl) {
      this.initializeOptions(); // Refresh opts
      this.prefixEl.className = this.buildClasses([
        CSS_CLASSES.INPUT_GROUP_TEXT,
        'bootstrap-touchspin-prefix',
        this.opts.prefix_extraclass,
      ]);
    }
  }

  updatePostfixClasses(): void {
    if (this.postfixEl) {
      this.initializeOptions(); // Refresh opts
      this.postfixEl.className = this.buildClasses([
        CSS_CLASSES.INPUT_GROUP_TEXT,
        'bootstrap-touchspin-postfix',
        this.opts.postfix_extraclass,
      ]);
    }
  }

  updateButtonFocusability(newValue: boolean): void {
    if (!this.wrapper) return;

    const buttons = this.wrapper.querySelectorAll(
      `${SELECTORS.UP_BUTTON}, ${SELECTORS.DOWN_BUTTON}`
    );
    const tabindex = newValue ? '0' : '-1';

    buttons.forEach((button) => {
      button.setAttribute('tabindex', tabindex);
    });
  }

  handleVerticalButtonsChange(_newValue: boolean): void {
    this.rebuildDOM();
  }

  rebuildDOM(): void {
    this.teardown();
    this.resetStateAfterRemoval();
    this.buildAndAttachDOM();

    if (this.wrapper) {
      this.finalizeWrapperAttributes();
    }
  }

  private resetStateAfterRemoval(): void {
    this.wrapper = null;
    this.prefixEl = null;
    this.postfixEl = null;
  }

  private applyButtonLabel(
    button: HTMLElement,
    raw: string | null | undefined,
    fallback: string
  ): void {
    const { value, isHtml } = this.resolveButtonContent(raw, fallback);

    if (isHtml) {
      button.innerHTML = value;
      return;
    }

    button.textContent = value;
  }

  private resolveButtonContent(
    raw: string | null | undefined,
    fallback: string
  ): { value: string; isHtml: boolean } {
    if (raw === undefined || raw === null) {
      return { value: fallback, isHtml: false };
    }

    const trimmed = raw.trim();
    if (trimmed === '') {
      return { value: fallback, isHtml: false };
    }

    if (this.containsHtml(trimmed)) {
      return { value: trimmed, isHtml: true };
    }

    const decoded = this.decodeHtml(trimmed);
    if (decoded === undefined || decoded === '') {
      return { value: fallback, isHtml: false };
    }

    return { value: decoded, isHtml: false };
  }

  private containsHtml(value: string): boolean {
    return /<\/?[a-zA-Z][\s\S]*>/.test(value);
  }

  private decodeHtml(value: string): string | undefined {
    if (typeof document === 'undefined' || !value.includes('&')) return value;
    const parser = document.createElement('textarea');
    parser.innerHTML = value;
    return parser.value;
  }
}

export default Bootstrap5Renderer;

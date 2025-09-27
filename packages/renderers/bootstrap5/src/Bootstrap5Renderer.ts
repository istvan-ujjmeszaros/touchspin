import { AbstractRenderer } from '@touchspin/core/renderer';
import type { InferOptionsFromSchema, RendererOptionSchema } from '@touchspin/core/renderer';

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

class Bootstrap5Renderer extends AbstractRenderer {
  private readonly initialInputGroup: HTMLElement | null;
  private opts: RendererOptions = {};
  private prefixEl: HTMLElement | null = null;
  private postfixEl: HTMLElement | null = null;
  private formControlAdded = false;
  declare wrapper: HTMLElement | null;

  constructor(...args: ConstructorParameters<typeof AbstractRenderer>) {
    super(...args);
    const [input] = args;
    this.initialInputGroup = input.closest(`.${CSS_CLASSES.INPUT_GROUP}`) as HTMLElement | null;
  }

  init(): void {
    this.initializeOptions();
    this.resetElementReferences();
    this.ensureFormControlClass();
    this.buildAndAttachDOM();
    this.registerSettingObservers();
  }

  teardown(): void {
    this.restoreFormControlClass();
    super.teardown();
  }

  // Initialization helpers
  private initializeOptions(): void {
    this.opts = this.extractRendererSettings(bootstrap5Schema);
  }

  private resetElementReferences(): void {
    this.prefixEl = null;
    this.postfixEl = null;
  }

  private ensureFormControlClass(): void {
    if (!this.input.classList.contains(CSS_CLASSES.FORM_CONTROL)) {
      this.input.classList.add(CSS_CLASSES.FORM_CONTROL);
      this.formControlAdded = true;
    }
  }

  private restoreFormControlClass(): void {
    if (this.formControlAdded) {
      this.input.classList.remove(CSS_CLASSES.FORM_CONTROL);
      this.formControlAdded = false;
    }
  }

  // DOM building
  buildInputGroup(): HTMLElement {
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

  buildAdvancedInputGroup(existingInputGroup: HTMLElement): HTMLElement {
    existingInputGroup.classList.add(CSS_CLASSES.BOOTSTRAP_TOUCHSPIN);
    this.wrapperType = 'wrapper-advanced';

    this.insertElementsIntoExistingGroup(existingInputGroup);
    this.storeElementReferences(existingInputGroup);

    return existingInputGroup;
  }

  private createInputGroupWrapper(sizeClass: string): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = this.buildClasses([
      CSS_CLASSES.INPUT_GROUP,
      sizeClass,
      CSS_CLASSES.BOOTSTRAP_TOUCHSPIN
    ]);
    return wrapper;
  }

  private appendElementsToWrapper(wrapper: HTMLElement): void {
    if (!this.opts.verticalbuttons) {
      wrapper.appendChild(this.createDownButton());
    }

    if (this.opts.prefix) {
      wrapper.appendChild(this.createPrefixElement());
    }

    if (this.opts.postfix) {
      wrapper.appendChild(this.createPostfixElement());
    }

    if (this.opts.verticalbuttons) {
      wrapper.appendChild(this.createVerticalButtonWrapper());
    } else {
      wrapper.appendChild(this.createUpButton());
    }
  }

  private insertWrapperAndInput(wrapper: HTMLElement): void {
    if (this.input.parentElement) {
      this.input.parentElement.insertBefore(wrapper, this.input);
    }
  }

  private positionInputWithinWrapper(wrapper: HTMLElement): void {
    const insertionPoint = this.findInputInsertionPoint(wrapper);
    wrapper.insertBefore(this.input, insertionPoint);
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
    if (!this.opts.verticalbuttons) {
      existingInputGroup.insertBefore(this.createDownButton(), this.input);
    }

    if (this.opts.prefix) {
      existingInputGroup.insertBefore(this.createPrefixElement(), this.input);
    }

    if (this.opts.postfix) {
      existingInputGroup.insertBefore(this.createPostfixElement(), this.input.nextSibling);
    }

    if (this.opts.verticalbuttons) {
      const insertionPoint = this.opts.postfix
        ? existingInputGroup.querySelector(SELECTORS.POSTFIX)?.nextSibling ?? null
        : this.input.nextSibling;
      existingInputGroup.insertBefore(this.createVerticalButtonWrapper(), insertionPoint);
    } else {
      const insertionPoint = this.opts.postfix
        ? existingInputGroup.querySelector(SELECTORS.POSTFIX)?.nextSibling ?? null
        : this.input.nextSibling;
      existingInputGroup.insertBefore(this.createUpButton(), insertionPoint);
    }
  }

  // Element creation helpers
  private createButton(type: 'up' | 'down', isVertical = false): HTMLElement {
    const button = document.createElement('button');

    button.type = 'button';
    button.tabIndex = this.settings.focusablebuttons ? 0 : -1;
    button.setAttribute('data-touchspin-injected', type);
    button.setAttribute('aria-label', type === 'up' ? 'Increase value' : 'Decrease value');

    const inputTestId = this.input.getAttribute('data-testid');
    if (inputTestId) {
      button.setAttribute('data-testid', `${inputTestId}-${type}`);
    }

    button.className = this.getButtonClass(type, isVertical);
    button.textContent = this.getButtonText(type, isVertical);

    return button;
  }

  private createUpButton(): HTMLElement {
    return this.createButton('up');
  }

  private createDownButton(): HTMLElement {
    return this.createButton('down');
  }

  private createPrefixElement(): HTMLElement {
    const element = document.createElement('span');
    element.className = this.buildClasses([
      CSS_CLASSES.INPUT_GROUP_TEXT,
      'bootstrap-touchspin-prefix',
      this.opts.prefix_extraclass
    ]);
    element.setAttribute('data-touchspin-injected', INJECTED_TYPES.PREFIX);
    element.textContent = this.opts.prefix || '';

    const inputTestId = this.input.getAttribute('data-testid');
    if (inputTestId) {
      element.setAttribute('data-testid', `${inputTestId}-prefix`);
    }

    return element;
  }

  private createPostfixElement(): HTMLElement {
    const element = document.createElement('span');
    element.className = this.buildClasses([
      CSS_CLASSES.INPUT_GROUP_TEXT,
      'bootstrap-touchspin-postfix',
      this.opts.postfix_extraclass
    ]);
    element.setAttribute('data-touchspin-injected', INJECTED_TYPES.POSTFIX);
    element.textContent = this.opts.postfix || '';

    const inputTestId = this.input.getAttribute('data-testid');
    if (inputTestId) {
      element.setAttribute('data-testid', `${inputTestId}-postfix`);
    }

    return element;
  }

  private createVerticalButtonWrapper(): HTMLElement {
    const wrapper = document.createElement('span');
    wrapper.className = this.buildClasses([
      CSS_CLASSES.INPUT_GROUP_TEXT,
      'bootstrap-touchspin-vertical-button-wrapper'
    ]);
    wrapper.setAttribute('data-touchspin-injected', INJECTED_TYPES.VERTICAL_WRAPPER);

    const buttonContainer = document.createElement('span');
    buttonContainer.className = CSS_CLASSES.BTN_VERTICAL;

    buttonContainer.appendChild(this.createButton('up', true));
    buttonContainer.appendChild(this.createButton('down', true));

    wrapper.appendChild(buttonContainer);
    return wrapper;
  }

  // Utility helpers
  private buildClasses(classes: (string | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
  }

  private getButtonClass(type: 'up' | 'down', isVertical = false): string {
    const baseClass = type === 'up'
      ? (this.opts.buttonup_class || CSS_CLASSES.DEFAULT_BUTTON)
      : (this.opts.buttondown_class || CSS_CLASSES.DEFAULT_BUTTON);

    const verticalClass = isVertical && type === 'up'
      ? (this.opts.verticalupclass || CSS_CLASSES.DEFAULT_BUTTON)
      : isVertical && type === 'down'
        ? (this.opts.verticaldownclass || CSS_CLASSES.DEFAULT_BUTTON)
        : '';

    return this.buildClasses([
      baseClass,
      verticalClass,
      `bootstrap-touchspin-${type}`
    ]);
  }

  private getButtonText(type: 'up' | 'down', isVertical = false): string {
    const fallback = type === 'up' ? BUTTON_TEXT.UP : BUTTON_TEXT.DOWN;

    if (isVertical) {
      const raw = type === 'up' ? this.opts.verticalup : this.opts.verticaldown;
      return this.resolveButtonLabel(raw, fallback);
    }

    const raw = type === 'up' ? this.opts.buttonup_txt : this.opts.buttondown_txt;
    return this.resolveButtonLabel(raw, fallback);
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
    this.storeElementReferences(this.wrapper);
    this.attachEventsToButtons();
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
    this.core.observeSetting('buttonup_class', (value) => this.updateButtonClass('up', value as string));
    this.core.observeSetting('buttondown_class', (value) => this.updateButtonClass('down', value as string));
    this.core.observeSetting('verticalupclass', (value) => this.updateVerticalButtonClass('up', value as string));
    this.core.observeSetting('verticaldownclass', (value) => this.updateVerticalButtonClass('down', value as string));
    this.core.observeSetting('verticalup', (value) => this.updateVerticalButtonText('up', value as string));
    this.core.observeSetting('verticaldown', (value) => this.updateVerticalButtonText('down', value as string));
    this.core.observeSetting('buttonup_txt', (value) => this.updateButtonText('up', value as string));
    this.core.observeSetting('buttondown_txt', (value) => this.updateButtonText('down', value as string));
    this.core.observeSetting('prefix_extraclass', () => this.updatePrefixClasses());
    this.core.observeSetting('postfix_extraclass', () => this.updatePostfixClasses());
    this.core.observeSetting('verticalbuttons', (value) => this.handleVerticalButtonsChange(value as boolean));
    this.core.observeSetting('focusablebuttons', (value) => this.updateButtonFocusability(value as boolean));
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
        `bootstrap-touchspin-${type}`
      ]);
    }
  }

  updateVerticalButtonClass(type: 'up' | 'down', className: string | null | undefined): void {
    const verticalWrapper = this.findInjectedElement(INJECTED_TYPES.VERTICAL_WRAPPER);
    const button = verticalWrapper?.querySelector(`[data-touchspin-injected="${type}"]`);

    if (button) {
      this.initializeOptions(); // Refresh opts for current values
      const baseClass = type === 'up'
        ? (this.opts.buttonup_class ?? CSS_CLASSES.DEFAULT_BUTTON)
        : (this.opts.buttondown_class ?? CSS_CLASSES.DEFAULT_BUTTON);

      button.className = this.buildClasses([
        baseClass,
        className ?? CSS_CLASSES.DEFAULT_BUTTON,
        `bootstrap-touchspin-${type}`
      ]);
    }
  }

  updateVerticalButtonText(type: 'up' | 'down', text?: string): void {
    const verticalWrapper = this.findInjectedElement(INJECTED_TYPES.VERTICAL_WRAPPER);
    const button = verticalWrapper?.querySelector(`[data-touchspin-injected="${type}"]`);

    if (button) {
      const fallback = this.getButtonText(type, true);
      button.textContent = this.resolveButtonLabel(text, fallback);
    }
  }

  updateButtonText(type: 'up' | 'down', text?: string): void {
    const button = this.findInjectedElement(type);
    if (button) {
      const fallback = this.getButtonText(type, false);
      button.textContent = this.resolveButtonLabel(text, fallback);
    }
  }

  updatePrefixClasses(): void {
    if (this.prefixEl) {
      this.initializeOptions(); // Refresh opts
      this.prefixEl.className = this.buildClasses([
        CSS_CLASSES.INPUT_GROUP_TEXT,
        'bootstrap-touchspin-prefix',
        this.opts.prefix_extraclass
      ]);
    }
  }

  updatePostfixClasses(): void {
    if (this.postfixEl) {
      this.initializeOptions(); // Refresh opts
      this.postfixEl.className = this.buildClasses([
        CSS_CLASSES.INPUT_GROUP_TEXT,
        'bootstrap-touchspin-postfix',
        this.opts.postfix_extraclass
      ]);
    }
  }

  updateButtonFocusability(newValue: boolean): void {
    if (!this.wrapper) return;

    const buttons = this.wrapper.querySelectorAll(`${SELECTORS.UP_BUTTON}, ${SELECTORS.DOWN_BUTTON}`);
    const tabindex = newValue ? '0' : '-1';

    buttons.forEach(button => {
      button.setAttribute('tabindex', tabindex);
    });
  }

  handleVerticalButtonsChange(_newValue: boolean): void {
    this.rebuildDOM();
  }

  rebuildDOM(): void {
    this.removeInjectedElements();
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

  private resolveButtonLabel(raw: string | null | undefined, fallback: string): string {
    if (raw === undefined || raw === null || raw === '') {
      return fallback;
    }

    const decoded = this.decodeHtml(raw);
    if (decoded === undefined || decoded === '') {
      return fallback;
    }

    return decoded;
  }

  private decodeHtml(value: string): string | undefined {
    if (typeof document === 'undefined' || !value.includes('&')) return value;
    const parser = document.createElement('textarea');
    parser.innerHTML = value;
    return parser.value;
  }
}

export default Bootstrap5Renderer;

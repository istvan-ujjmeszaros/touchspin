import type { TouchSpinCoreOptions } from './index';
import type { Renderer } from './renderer';

export type RendererOptionKind = 'string' | 'boolean' | 'number' | 'enum';

type RendererOptionDefinition =
  | { kind: 'string' }
  | { kind: 'boolean' }
  | { kind: 'number' }
  | { kind: 'enum'; values: readonly string[] };

export type RendererOptionDef = RendererOptionDefinition;
export type RendererOptionSchema = Readonly<Record<string, RendererOptionDefinition>>;

type RendererOptionValue<Definition extends RendererOptionDefinition> =
  Definition extends { kind: 'string' }
    ? string | undefined
    : Definition extends { kind: 'boolean' }
    ? boolean | undefined
    : Definition extends { kind: 'number' }
    ? number | undefined
    : Definition extends { kind: 'enum'; values: readonly (infer Option)[] }
    ? Option | undefined
    : unknown;

export type InferOptionsFromSchema<Schema extends RendererOptionSchema> = {
  [Key in keyof Schema]: RendererOptionValue<Schema[Key]>;
};

type RendererCoreBridge = {
  attachUpEvents: (element: HTMLElement | null) => void;
  attachDownEvents: (element: HTMLElement | null) => void;
  observeSetting: <Key extends keyof TouchSpinCoreOptions>(
    key: Key,
    listener: (value: NonNullable<TouchSpinCoreOptions[Key]>) => void
  ) => () => void;
};

type SettingsRecord = Record<string, unknown>;

const TOUCHSPIN_ATTRIBUTE = 'data-touchspin-injected';
const TEST_ID_ATTRIBUTE = 'data-testid';
const WRAPPER_TYPE_DEFAULT = 'wrapper';
const WRAPPER_TYPE_ADVANCED = 'wrapper-advanced';
const WRAPPER_READY_CLASS = 'bootstrap-touchspin';

abstract class AbstractRenderer implements Renderer {
  protected readonly input: HTMLInputElement;
  protected readonly settings: Readonly<TouchSpinCoreOptions>;
  protected readonly core: RendererCoreBridge;

  protected wrapper: HTMLElement | null = null;
  protected wrapperType = WRAPPER_TYPE_DEFAULT;

  constructor(
    input: HTMLInputElement,
    settings: Readonly<TouchSpinCoreOptions>,
    core: RendererCoreBridge
  ) {
    this.input = input;
    this.settings = settings;
    this.core = core;
  }

  abstract init(): void;

  teardown(): void {
    this.removeInjectedElements();
  }

  removeInjectedElements(): void {
    this.removeInjectedNodesWithinWrapper();
    this.removeNearbyInjectedNodes();
  }

  finalizeWrapperAttributes(): void {
    if (!this.wrapper) return;

    const testId = this.input.getAttribute(TEST_ID_ATTRIBUTE);
    if (testId && !this.wrapper.hasAttribute(TEST_ID_ATTRIBUTE)) {
      this.wrapper.setAttribute(TEST_ID_ATTRIBUTE, `${testId}-wrapper`);
    }

    this.wrapper.setAttribute(TOUCHSPIN_ATTRIBUTE, this.wrapperType);
  }

  getUpButtonTestId(): string {
    return this.buildDataTestId('up');
  }

  getDownButtonTestId(): string {
    return this.buildDataTestId('down');
  }

  getPrefixTestId(): string {
    return this.buildDataTestId('prefix');
  }

  getPostfixTestId(): string {
    return this.buildDataTestId('postfix');
  }

  protected filterRendererSettings<Schema extends RendererOptionSchema>(
    schema: Schema,
    sourceSettings: SettingsRecord = this.settings as SettingsRecord
  ): Readonly<Partial<InferOptionsFromSchema<Schema>>> {
    const filteredSettings: Record<string, unknown> = {};

    for (const key in schema) {
      if (Object.prototype.hasOwnProperty.call(sourceSettings, key)) {
        filteredSettings[key] = sourceSettings[key];
      }
    }

    return filteredSettings as Readonly<Partial<InferOptionsFromSchema<Schema>>>;
  }

  private removeInjectedNodesWithinWrapper(): void {
    const { wrapper } = this;
    if (!wrapper) return;

    wrapper
      .querySelectorAll(`[${TOUCHSPIN_ATTRIBUTE}]`)
      .forEach((element) => (element as HTMLElement).remove());

    if (!wrapper.hasAttribute(TOUCHSPIN_ATTRIBUTE) || !wrapper.parentElement) {
      return;
    }

    const wrapperType = wrapper.getAttribute(TOUCHSPIN_ATTRIBUTE);
    if (wrapperType === WRAPPER_TYPE_ADVANCED) {
      wrapper.classList.remove(WRAPPER_READY_CLASS);
      wrapper.removeAttribute(TOUCHSPIN_ATTRIBUTE);
      return;
    }

    wrapper.parentElement.insertBefore(this.input, wrapper);
    wrapper.remove();
  }

  private removeNearbyInjectedNodes(): void {
    const injectedNodes = document.querySelectorAll(`[${TOUCHSPIN_ATTRIBUTE}]`);

    injectedNodes.forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      if (node === this.input) return;
      if (!this.isNodeRelatedToInput(node)) return;

      node.remove();
    });
  }

  private isNodeRelatedToInput(node: Element): boolean {
    const parent = node.parentElement;
    const inputParent = this.input.parentElement;

    const nodeContainsInput = node.contains(this.input);
    const parentContainsInput = parent?.contains(this.input) ?? false;
    const inputContainsNode = inputParent?.contains(node) ?? false;

    return nodeContainsInput || parentContainsInput || inputContainsNode;
  }

  private buildDataTestId(suffix: string): string {
    const base = this.input.getAttribute(TEST_ID_ATTRIBUTE);
    return base ? ` data-testid="${base}-${suffix}"` : '';
  }
}

export default AbstractRenderer;

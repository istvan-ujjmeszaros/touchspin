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

type RendererOptionValue<Definition extends RendererOptionDefinition> = Definition extends {
  kind: 'string';
}
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

export type RendererCoreBridge = {
  attachUpEvents: (element: HTMLElement | null) => void;
  attachDownEvents: (element: HTMLElement | null) => void;
  observeSetting: <Key extends keyof TouchSpinCoreOptions>(
    key: Key,
    listener: (value: NonNullable<TouchSpinCoreOptions[Key]>) => void
  ) => () => void;
};

type SettingsRecord = Record<string, unknown>;

const TEST_ID_ATTRIBUTE = 'data-testid';
export const TOUCHSPIN_ATTRIBUTE = 'data-touchspin-injected';

/**
 * Base abstract renderer class.
 * Provides common interface and utilities for all renderer strategies.
 * Concrete implementations should extend AbstractRendererTracked or AbstractRendererAttributeBased.
 */
abstract class AbstractRendererBase implements Renderer {
  protected readonly input: HTMLInputElement;
  protected readonly settings: Readonly<TouchSpinCoreOptions>;
  protected readonly core: RendererCoreBridge;

  protected wrapper: HTMLElement | null = null;
  protected wrapperType = 'wrapper';

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
  abstract teardown(): void;

  /**
   * Finalize wrapper attributes as the last step of rendering.
   *
   * This method is called by Core after the renderer has completed all DOM construction
   * and event handler attachment. It adds the final attributes that signal rendering is complete:
   *
   * 1. data-testid="{input-testid}-wrapper" - Enables test element selection
   * 2. data-touchspin-injected="{wrapperType}" - Signals renderer has finished
   *
   * The presence of data-testid on the wrapper indicates that:
   * - All DOM elements have been created and positioned
   * - All event handlers have been attached by Core
   * - The component is fully initialized and ready for interaction
   *
   * Tests rely on this attribute to detect when components are ready.
   */
  finalizeWrapperAttributes(): void {
    const testId = this.input.getAttribute(TEST_ID_ATTRIBUTE);
    if (testId && !this.wrapper?.hasAttribute(TEST_ID_ATTRIBUTE)) {
      this.wrapper?.setAttribute(TEST_ID_ATTRIBUTE, `${testId}-wrapper`);
    }

    this.wrapper?.setAttribute(TOUCHSPIN_ATTRIBUTE, this.wrapperType);
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
      if (Object.hasOwn(sourceSettings, key)) {
        filteredSettings[key] = sourceSettings[key];
      }
    }

    return filteredSettings as Readonly<Partial<InferOptionsFromSchema<Schema>>>;
  }

  private buildDataTestId(suffix: string): string {
    const base = this.input.getAttribute(TEST_ID_ATTRIBUTE);
    return base ? ` data-testid="${base}-${suffix}"` : '';
  }
}

export default AbstractRendererBase;

import type { TouchSpinCoreOptions } from './index';
import type { Renderer } from './renderer';

export type RendererOptionKind = 'string' | 'boolean' | 'number' | 'enum';

/**
 * Metadata tracked for each user element during DOM modifications.
 * Stored as invisible property on HTMLElement for restoration during teardown.
 */
interface TouchSpinMeta {
  /** Unique fingerprint for position matching */
  fingerprint: number;
  /** Original classes before TouchSpin modifications */
  originalClasses: string[];
  /** Classes added by TouchSpin (to be removed on teardown) */
  addedClasses: string[];
  /** Classes removed by TouchSpin (to be restored on teardown) */
  removedClasses: string[];
  /** Original attributes before TouchSpin modifications */
  originalAttributes: Record<string, string>;
  /** Attributes added by TouchSpin (to be removed on teardown) */
  addedAttributes: string[];
  /** Attributes modified by TouchSpin (old → new values) */
  modifiedAttributes: Record<string, { old: string; new: string }>;
}

/**
 * Extend HTMLElement to include invisible metadata property
 */
declare global {
  interface HTMLElement {
    __touchspinMeta?: TouchSpinMeta;
  }
}

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

  /** DOM snapshot for metadata-based restoration */
  private originalDOM: HTMLElement | null = null;
  /** Whether metadata tracking is enabled for complex DOM cases */
  private metadataTrackingEnabled = false;

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

  /**
   * Enable metadata tracking for complex DOM structures.
   * Call this before making any DOM modifications.
   * Captures snapshot and fingerprints all user elements.
   */
  protected enableMetadataTracking(): void {
    this.metadataTrackingEnabled = true;
    this.captureSnapshot();
  }

  /**
   * Capture DOM snapshot and fingerprint all user elements.
   * Only elements without TOUCHSPIN_ATTRIBUTE are tracked.
   */
  private captureSnapshot(): void {
    const root = this.input.parentElement;
    if (!root) return;

    // Clone the original DOM structure for position reference
    this.originalDOM = root.cloneNode(true) as HTMLElement;

    // Walk the live DOM and fingerprint all user elements
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
    let fingerprintId = 0;

    let node = walker.nextNode();
    while (node) {
      const element = node as HTMLElement;

      // Skip injected elements
      if (!element.hasAttribute(TOUCHSPIN_ATTRIBUTE)) {
        element.__touchspinMeta = {
          fingerprint: fingerprintId++,
          originalClasses: Array.from(element.classList),
          addedClasses: [],
          removedClasses: [],
          originalAttributes: this.captureAttributes(element),
          addedAttributes: [],
          modifiedAttributes: {},
        };
      }

      node = walker.nextNode();
    }
  }

  /**
   * Capture all attributes of an element (excluding internal ones)
   */
  private captureAttributes(element: HTMLElement): Record<string, string> {
    const attrs: Record<string, string> = {};
    for (const attr of Array.from(element.attributes)) {
      // Don't track internal TouchSpin attributes
      if (attr.name !== TOUCHSPIN_ATTRIBUTE) {
        attrs[attr.name] = attr.value;
      }
    }
    return attrs;
  }

  /**
   * Add a class to an element with tracking (if enabled).
   * Tracks the addition so it can be removed on teardown.
   */
  protected addTrackedClass(element: HTMLElement, className: string): void {
    if (!this.metadataTrackingEnabled || !element.__touchspinMeta) {
      element.classList.add(className);
      return;
    }

    element.classList.add(className);
    const meta = element.__touchspinMeta;

    // If class was originally present, don't track it
    if (!meta.originalClasses.includes(className)) {
      meta.addedClasses.push(className);
    }
  }

  /**
   * Remove a class from an element with tracking (if enabled).
   * Tracks the removal so it can be restored on teardown.
   */
  protected removeTrackedClass(element: HTMLElement, className: string): void {
    if (!this.metadataTrackingEnabled || !element.__touchspinMeta) {
      element.classList.remove(className);
      return;
    }

    element.classList.remove(className);
    const meta = element.__touchspinMeta;

    // If class was originally present, track its removal
    if (meta.originalClasses.includes(className)) {
      meta.removedClasses.push(className);
    }
  }

  /**
   * Set an attribute on an element with tracking (if enabled).
   * Tracks the modification so it can be reverted on teardown.
   */
  protected setTrackedAttribute(element: HTMLElement, name: string, value: string): void {
    if (!this.metadataTrackingEnabled || !element.__touchspinMeta) {
      element.setAttribute(name, value);
      return;
    }

    const meta = element.__touchspinMeta;
    const oldValue = meta.originalAttributes[name];

    if (oldValue !== undefined) {
      // Track as modification
      meta.modifiedAttributes[name] = {
        old: oldValue,
        new: value,
      };
    } else {
      // Track as addition
      meta.addedAttributes.push(name);
    }

    element.setAttribute(name, value);
  }

  /**
   * Remove an attribute from an element with tracking (if enabled).
   * Tracks the removal so it can be restored on teardown.
   */
  protected removeTrackedAttribute(element: HTMLElement, name: string): void {
    if (!this.metadataTrackingEnabled || !element.__touchspinMeta) {
      element.removeAttribute(name);
      return;
    }

    const meta = element.__touchspinMeta;
    const oldValue = meta.originalAttributes[name];

    if (oldValue !== undefined) {
      // Track as modification (removed)
      meta.modifiedAttributes[name] = {
        old: oldValue,
        new: '', // Empty means removed
      };
    }

    element.removeAttribute(name);
  }

  teardown(): void {
    if (this.metadataTrackingEnabled) {
      this.restoreFromMetadata();
    } else {
      this.removeInjectedElements();
    }
  }

  removeInjectedElements(): void {
    this.removeInjectedNodesWithinWrapper();
    this.removeNearbyInjectedNodes();
  }

  /**
   * Restore DOM from metadata tracking.
   * 1. Restore element states (classes/attributes)
   * 2. Restore element positions
   * 3. Remove injected elements
   * 4. Cleanup metadata
   */
  private restoreFromMetadata(): void {
    if (!this.originalDOM) return;

    // Find all elements with metadata
    const elements = this.findMetadataElements();

    // Step 1: Restore states (classes/attributes)
    elements.forEach((el) => this.restoreElementState(el));

    // Step 2: Restore positions
    this.restoreElementPositions(elements);

    // Step 3: Remove injected elements
    this.removeInjectedElements();

    // Step 4: Cleanup metadata
    elements.forEach((el) => delete el.__touchspinMeta);
    this.originalDOM = null;
    this.metadataTrackingEnabled = false;
  }

  /**
   * Find all elements with metadata in current DOM
   */
  private findMetadataElements(): HTMLElement[] {
    const elements: HTMLElement[] = [];
    const root = this.input.parentElement;
    if (!root) return elements;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
    let node = walker.nextNode();

    while (node) {
      const element = node as HTMLElement;
      if (element.__touchspinMeta) {
        elements.push(element);
      }
      node = walker.nextNode();
    }

    return elements;
  }

  /**
   * Restore element state (classes/attributes) from metadata
   */
  private restoreElementState(element: HTMLElement): void {
    const meta = element.__touchspinMeta;
    if (!meta) return;

    // Restore classes (diff-based)
    meta.addedClasses.forEach((cls) => element.classList.remove(cls));
    meta.removedClasses.forEach((cls) => element.classList.add(cls));

    // Restore attributes (diff-based)
    meta.addedAttributes.forEach((attr) => element.removeAttribute(attr));
    Object.entries(meta.modifiedAttributes).forEach(([name, { old }]) => {
      if (old === '') {
        // Was removed, restore removal
        element.removeAttribute(name);
      } else {
        // Was modified, restore old value
        element.setAttribute(name, old);
      }
    });
  }

  /**
   * Restore element positions from metadata fingerprints
   */
  private restoreElementPositions(elements: HTMLElement[]): void {
    if (!this.originalDOM) return;

    // Build position map from original DOM
    const positionMap = this.buildPositionMap(this.originalDOM);

    // Sort elements by fingerprint (restore in order)
    const sorted = elements.sort((a, b) => {
      const fpA = a.__touchspinMeta?.fingerprint ?? 0;
      const fpB = b.__touchspinMeta?.fingerprint ?? 0;
      return fpA - fpB;
    });

    // Restore each element to its original position
    sorted.forEach((element) => {
      const meta = element.__touchspinMeta;
      if (!meta) return;

      const position = positionMap.get(meta.fingerprint);
      if (!position) return;

      // Find the parent in live DOM
      const parent = this.findLiveElement(position.parentFingerprint, elements);
      if (!parent) return;

      // Find the reference sibling
      const refSibling = position.nextSiblingFingerprint
        ? this.findLiveElement(position.nextSiblingFingerprint, elements)
        : null;

      // Move element to correct position
      if (refSibling) {
        parent.insertBefore(element, refSibling);
      } else {
        parent.appendChild(element);
      }
    });
  }

  /**
   * Build position map from snapshot DOM
   */
  private buildPositionMap(
    root: HTMLElement
  ): Map<number, { parentFingerprint: number; nextSiblingFingerprint: number | null }> {
    const map = new Map<
      number,
      { parentFingerprint: number; nextSiblingFingerprint: number | null }
    >();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
    let node = walker.nextNode();

    while (node) {
      const element = node as HTMLElement;
      const meta = (element as any).__touchspinMeta as TouchSpinMeta | undefined;

      if (meta) {
        const parent = element.parentElement;
        const parentMeta = (parent as any)?.__touchspinMeta as TouchSpinMeta | undefined;
        const nextSibling = element.nextElementSibling;
        const nextMeta = (nextSibling as any)?.__touchspinMeta as TouchSpinMeta | undefined;

        map.set(meta.fingerprint, {
          parentFingerprint: parentMeta?.fingerprint ?? -1,
          nextSiblingFingerprint: nextMeta?.fingerprint ?? null,
        });
      }

      node = walker.nextNode();
    }

    return map;
  }

  /**
   * Find live element by fingerprint
   */
  private findLiveElement(fingerprint: number, elements: HTMLElement[]): HTMLElement | null {
    return elements.find((el) => el.__touchspinMeta?.fingerprint === fingerprint) ?? null;
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
      if (Object.hasOwn(sourceSettings, key)) {
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

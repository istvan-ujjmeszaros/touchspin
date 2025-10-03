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
  /** Nested set left value (for hierarchical position tracking) */
  left: number;
  /** Nested set right value (for hierarchical position tracking) */
  right: number;
  /** Parent element's fingerprint (null for root) */
  parentFingerprint: number | null;
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

  /** Whether metadata tracking is enabled for complex DOM cases */
  private metadataTrackingEnabled = false;
  /** Original DOM structure snapshot */
  private originalDOM: HTMLElement | null = null;
  /** Original parent container (where root element should be restored to) */
  private originalParentContainer: HTMLElement | null = null;

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
    console.log('[Metadata] Tracking enabled, snapshot captured');
  }

  /**
   * Capture DOM snapshot and fingerprint all user elements.
   * Only elements without TOUCHSPIN_ATTRIBUTE are tracked.
   */
  private captureSnapshot(): void {
    const root = this.input.parentElement;
    if (!root) return;

    // Store the original parent container (where root should be restored to)
    this.originalParentContainer = root.parentElement;

    // Clone the original DOM structure for position reference
    this.originalDOM = root.cloneNode(true) as HTMLElement;

    // Walk the live DOM and assign nested set values + fingerprints
    let fingerprintId = 0;
    let nestedSetCounter = 0;

    const assignNestedSet = (
      element: HTMLElement,
      depth = 0,
      parentFp: number | null = null
    ): void => {
      const leftValue = nestedSetCounter++;

      // Use provided parent fingerprint (for root element)
      // or find parent's fingerprint from DOM
      let parentFingerprint: number | null = parentFp;

      if (parentFingerprint === null) {
        const parent = element.parentElement;
        if (parent && parent !== root.parentElement) {
          parentFingerprint = parent.__touchspinMeta?.fingerprint ?? null;
        }
      }

      // Assign metadata
      element.__touchspinMeta = {
        fingerprint: fingerprintId++,
        left: leftValue,
        right: 0, // Will be set after processing children
        parentFingerprint,
        originalClasses: Array.from(element.classList),
        addedClasses: [],
        removedClasses: [],
        originalAttributes: this.captureAttributes(element),
        addedAttributes: [],
        modifiedAttributes: {},
      };

      // Log the element being tracked
      const indent = '  '.repeat(depth);
      const tag = element.tagName.toLowerCase();
      const id = element.id ? `#${element.id}` : '';
      const classes = element.className ? `.${element.className.split(' ').join('.')}` : '';
      const label = `${tag}${id}${classes}`;
      console.log(
        `${indent}[Snapshot] fp:${element.__touchspinMeta.fingerprint} left:${leftValue} parent:${parentFingerprint} - ${label}`
      );

      // Process children
      for (let i = 0; i < element.children.length; i++) {
        const child = element.children[i] as HTMLElement;
        if (!child.hasAttribute(TOUCHSPIN_ATTRIBUTE)) {
          assignNestedSet(child, depth + 1);
        }
      }

      // Set right value after processing all children
      element.__touchspinMeta.right = nestedSetCounter++;
      console.log(
        `${indent}[Snapshot] fp:${element.__touchspinMeta.fingerprint} right:${element.__touchspinMeta.right}`
      );
    };

    console.log('[Snapshot] Building nested set hierarchy:');
    // IMPORTANT: Start from root itself (e.g., .form-floating), not just its children
    // This ensures the container is tracked along with its contents
    if (!root.hasAttribute(TOUCHSPIN_ATTRIBUTE)) {
      assignNestedSet(root);
    } else {
      // If root is a TouchSpin element, track its children
      for (let i = 0; i < root.children.length; i++) {
        const child = root.children[i] as HTMLElement;
        if (!child.hasAttribute(TOUCHSPIN_ATTRIBUTE)) {
          assignNestedSet(child);
        }
      }
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
   * Restore DOM from metadata tracking using nested set hierarchy.
   * 1. Collect all user elements (with metadata)
   * 2. Reconstruct original DOM structure using nested set (before removing wrapper!)
   * 3. Remove injected elements (now safe - user elements already moved out)
   * 4. Restore element states (classes/attributes)
   * 5. Cleanup metadata
   */
  private restoreFromMetadata(): void {
    if (!this.originalDOM) return;

    console.log('[Restore] Starting metadata-based restoration');

    // Step 1: Find all elements with metadata (before any DOM changes)
    const elements = this.findMetadataElements();
    console.log(`[Restore] Found ${elements.length} elements with metadata`);

    // Step 2: Reconstruct original hierarchy using nested set BEFORE removing wrapper
    console.log('[Restore] Step 2: Reconstructing hierarchy from nested set...');
    this.reconstructHierarchyFromNestedSet(elements);

    // Step 3: Now safe to remove injected elements (user elements already moved out)
    console.log('[Restore] Step 3: Removing injected elements...');
    this.removeInjectedElements();

    // Step 4: Restore states (classes/attributes)
    console.log('[Restore] Step 4: Restoring element states...');
    elements.forEach((el) => this.restoreElementState(el));

    // Step 5: Cleanup metadata
    console.log('[Restore] Step 5: Cleaning up metadata...');
    elements.forEach((el) => delete el.__touchspinMeta);
    this.originalDOM = null;
    this.metadataTrackingEnabled = false;
    console.log('[Restore] Restoration complete');
  }

  /**
   * Find all elements with metadata in current DOM
   */
  private findMetadataElements(): HTMLElement[] {
    const elements: HTMLElement[] = [];
    const root = this.input.parentElement;
    if (!root) {
      console.log('[FindElements] ERROR: No root element (input.parentElement is null)');
      return elements;
    }

    console.log(
      `[FindElements] Searching from root: ${root.tagName.toLowerCase()}.${root.className.split(' ').slice(0, 2).join('.')}`
    );

    // Check if root itself has metadata
    if (root.__touchspinMeta) {
      console.log(
        `[FindElements] Root has metadata fp:${root.__touchspinMeta.fingerprint} - ADDED`
      );
      elements.push(root);
    } else {
      console.log('[FindElements] Root has NO metadata');
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
    let node = walker.nextNode();

    while (node) {
      const element = node as HTMLElement;
      if (element.__touchspinMeta) {
        const tag = element.tagName.toLowerCase();
        const id = element.id ? `#${element.id}` : '';
        console.log(
          `[FindElements] Found fp:${element.__touchspinMeta.fingerprint} ${tag}${id} - ADDED`
        );
        elements.push(element);
      }
      node = walker.nextNode();
    }

    console.log(`[FindElements] Total elements found: ${elements.length}`);
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
   * Reconstruct original DOM hierarchy using nested set values.
   * This moves ALL user elements back to their original positions BEFORE removing wrapper.
   * Uses left/right values to determine parent-child relationships and order.
   */
  private reconstructHierarchyFromNestedSet(elements: HTMLElement[]): void {
    // Sort by left value (parent always processed before children)
    const sorted = elements.sort((a, b) => {
      const leftA = a.__touchspinMeta?.left ?? 0;
      const leftB = b.__touchspinMeta?.left ?? 0;
      return leftA - leftB;
    });

    console.log('[Reconstruct] Processing elements in nested set order:');
    sorted.forEach((el) => {
      const meta = el.__touchspinMeta;
      const tag = el.tagName.toLowerCase();
      const id = el.id ? `#${el.id}` : '';
      const classes = el.className ? `.${el.className.split(' ').slice(0, 2).join('.')}` : '';
      console.log(
        `  fp:${meta?.fingerprint} left:${meta?.left} right:${meta?.right} parent:${meta?.parentFingerprint} - ${tag}${id}${classes}`
      );
    });

    // Find the common ancestor (the container before TouchSpin wrapped it)
    const root = this.input.parentElement;
    if (!root) {
      console.log('[Reconstruct] ERROR: No root element found');
      return;
    }
    console.log(`[Reconstruct] Root element: ${root.tagName.toLowerCase()}`);

    // Build a map of fingerprint -> element for quick lookups
    const elementMap = new Map<number, HTMLElement>();
    sorted.forEach((el) => {
      if (el.__touchspinMeta) {
        elementMap.set(el.__touchspinMeta.fingerprint, el);
      }
    });

    // Reconstruct hierarchy using nested set relationships
    sorted.forEach((element) => {
      const meta = element.__touchspinMeta;
      if (!meta) return;

      const tag = element.tagName.toLowerCase();
      const id = element.id ? `#${element.id}` : '';
      const classes = element.className
        ? `.${element.className.split(' ').slice(0, 2).join('.')}`
        : '';
      const label = `${tag}${id}${classes}`;

      // Find parent
      let parentElement: HTMLElement | null = null;
      if (meta.parentFingerprint !== null) {
        parentElement = elementMap.get(meta.parentFingerprint) ?? null;
        console.log(
          `[Reconstruct] fp:${meta.fingerprint} ${label} - Looking for parent fp:${meta.parentFingerprint} - ${parentElement ? 'FOUND' : 'NOT FOUND'}`
        );
      } else {
        console.log(
          `[Reconstruct] fp:${meta.fingerprint} ${label} - No parent fingerprint (root-level element)`
        );
      }

      // If no parent found, use original parent container (for root element)
      if (!parentElement) {
        if (this.originalParentContainer) {
          parentElement = this.originalParentContainer;
          console.log(
            `[Reconstruct] fp:${meta.fingerprint} ${label} - Using originalParentContainer as fallback`
          );
        } else if (root.parentElement) {
          parentElement = root.parentElement;
          console.log(
            `[Reconstruct] fp:${meta.fingerprint} ${label} - Using root.parentElement as fallback`
          );
        }
      }

      if (!parentElement) {
        console.log(
          `[Reconstruct] fp:${meta.fingerprint} ${label} - ERROR: No parent found, skipping`
        );
        return;
      }

      const parentTag = parentElement.tagName.toLowerCase();
      const parentId = parentElement.id ? `#${parentElement.id}` : '';
      const parentClasses = parentElement.className
        ? `.${parentElement.className.split(' ').slice(0, 2).join('.')}`
        : '';
      const parentLabel = `${parentTag}${parentId}${parentClasses}`;

      // Find correct position among siblings (using left/right values)
      const siblings = Array.from(parentElement.children) as HTMLElement[];
      let insertBefore: HTMLElement | null = null;

      for (const sibling of siblings) {
        const siblingMeta = sibling.__touchspinMeta;
        if (siblingMeta && siblingMeta.left > meta.left) {
          insertBefore = sibling;
          break;
        }
      }

      // Move element to correct position
      if (insertBefore) {
        const sibTag = insertBefore.tagName.toLowerCase();
        const sibId = insertBefore.id ? `#${insertBefore.id}` : '';
        console.log(
          `[Reconstruct] fp:${meta.fingerprint} ${label} - INSERT BEFORE ${sibTag}${sibId} in ${parentLabel}`
        );
        parentElement.insertBefore(element, insertBefore);
      } else {
        console.log(`[Reconstruct] fp:${meta.fingerprint} ${label} - APPEND to ${parentLabel}`);
        parentElement.appendChild(element);
      }
    });
  }

  /**
   * Restore element positions from metadata fingerprints
   * NOTE: This method is now replaced by reconstructHierarchyFromNestedSet() but kept for reference
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

    // User elements already moved out via reconstructHierarchyFromNestedSet()
    // Safe to just remove the wrapper and move input out
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

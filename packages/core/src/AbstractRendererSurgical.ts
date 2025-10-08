import AbstractRendererBase from './AbstractRendererBase.js';

/**
 * Undo events for LIFO stack-based DOM restoration.
 * Each event records an operation that can be reversed during teardown.
 */
type UndoEvent =
  | { type: 'CREATE_ELEMENT'; element: HTMLElement }
  | { type: 'ADD_CLASS'; element: HTMLElement; className: string }
  | { type: 'REMOVE_CLASS'; element: HTMLElement; className: string }
  | { type: 'SET_ATTRIBUTE'; element: HTMLElement; name: string; originalValue: string | null }
  | {
      type: 'MOVE_ELEMENT';
      element: HTMLElement;
      originalParent: HTMLElement;
      originalNextSibling: Node | null;
    };

/**
 * Surgical renderer strategy using LIFO operation tracking.
 *
 * This strategy provides precise, operation-by-operation DOM restoration by tracking
 * every DOM modification in a Last-In-First-Out (LIFO) undo stack. During teardown,
 * it reverses all operations in exact reverse order.
 *
 * ## How it works
 * - During `init()`: Use tracking methods (trackMoveElement, trackAddClass, etc.)
 * - Operations are pushed onto an undo stack
 * - During `teardown()`: Pop and reverse each operation in LIFO order
 * - Provides surgical precision for complex DOM manipulation
 *
 * ## When to use AbstractRendererSurgical
 * ✅ When elements need to be moved between different parent containers
 * ✅ Complex nested structures (e.g., Bootstrap 5 floating labels)
 * ✅ When you need to modify existing DOM elements and restore them exactly
 * ✅ When elements are repositioned or have their attributes changed
 * ✅ When you need precise control over DOM restoration order
 *
 * ## When to use AbstractRendererSimple instead
 * ❌ Standard input wrappers that don't move elements
 * ❌ Simple DOM structures where you just add/remove elements
 * ❌ When all your elements stay in their original positions
 * ❌ When you want simpler, easier-to-understand code
 *
 * ## Getting Started
 * Most developers should start with `AbstractRendererSimple` for easier implementation.
 * Switch to `AbstractRendererSurgical` only when you discover you need:
 * - Element movement between parents (trackMoveElement)
 * - Modification of existing elements (trackSetAttribute, trackAddClass)
 * - Precise restoration of original DOM state
 *
 * ## Available Tracking Methods
 * - `createTrackedElement(tagName)` - Create and track new element
 * - `trackMoveElement(el, newParent, before?)` - Move element and track original position
 * - `trackAddClass(el, className)` - Add class and track for removal
 * - `trackRemoveClass(el, className)` - Remove class and track for re-addition
 * - `trackSetAttribute(el, name, value)` - Set attribute and track original value
 * - `trackAddAttribute(el, name, value)` - Set attribute without tracking (for new elements)
 *
 * @example
 * ```typescript
 * import { AbstractRendererSurgical } from '@touchspin/core/renderer';
 *
 * class ComplexRenderer extends AbstractRendererSurgical {
 *   init(): void {
 *     // Track element movement (e.g., moving input into a floating label container)
 *     const floatingContainer = this.input.parentElement;
 *     this.trackMoveElement(this.input, newWrapper, insertionPoint);
 *
 *     // Track class modifications on existing elements
 *     this.trackAddClass(existingElement, 'touchspin-active');
 *
 *     // Create new elements (tracked for removal)
 *     const btn = this.createTrackedElement('button');
 *
 *     // teardown() will automatically undo all operations in reverse order
 *   }
 * }
 * ```
 *
 * Currently used by: Bootstrap5Renderer (for floating label support)
 */
abstract class AbstractRendererSurgical extends AbstractRendererBase {
  /** LIFO stack of operations to undo during teardown */
  protected undoStack: UndoEvent[] = [];

  /** Special elements that need to be tracked for renderer logic */
  protected specialElements: Map<string, HTMLElement> = new Map();

  abstract init(): void;

  /**
   * Register a special element for renderer logic (not for undo tracking).
   * Used to store references to important original elements like input-group, floating containers, etc.
   */
  protected registerSpecialElement(key: string, element: HTMLElement): void {
    this.specialElements.set(key, element);
  }

  /**
   * Create a new element and track it for removal during teardown.
   */
  protected createTrackedElement(tagName: string): HTMLElement {
    const element = document.createElement(tagName);
    this.undoStack.push({ type: 'CREATE_ELEMENT', element });
    return element;
  }

  /**
   * Add a class to an element and track for removal during teardown.
   */
  protected trackAddClass(element: HTMLElement, className: string): void {
    element.classList.add(className);
    this.undoStack.push({ type: 'ADD_CLASS', element, className });
  }

  /**
   * Remove a class from an element and track for re-addition during teardown.
   */
  protected trackRemoveClass(element: HTMLElement, className: string): void {
    element.classList.remove(className);
    this.undoStack.push({ type: 'REMOVE_CLASS', element, className });
  }

  /**
   * Set an attribute on an element and track original value for restoration during teardown.
   * Use this for modifying existing elements.
   */
  protected trackSetAttribute(element: HTMLElement, name: string, value: string): void {
    const originalValue = element.getAttribute(name);
    element.setAttribute(name, value);
    this.undoStack.push({ type: 'SET_ATTRIBUTE', element, name, originalValue });
  }

  /**
   * Set an attribute on an element without tracking (for attributes on injected elements).
   * Use this for ARIA attributes, data-testid, etc. on elements created with createTrackedElement().
   */
  protected trackAddAttribute(element: HTMLElement, name: string, value: string): void {
    element.setAttribute(name, value);
    // Not tracked - element will be removed entirely during teardown
  }

  /**
   * Move an element to a new parent and track original position for restoration during teardown.
   */
  protected trackMoveElement(
    element: HTMLElement,
    newParent: HTMLElement,
    beforeNode: Node | null = null
  ): void {
    const originalParent = element.parentElement;
    const originalNextSibling = element.nextSibling;

    if (beforeNode) {
      newParent.insertBefore(element, beforeNode);
    } else {
      newParent.appendChild(element);
    }

    // Only track if element actually moved
    if (originalParent) {
      this.undoStack.push({
        type: 'MOVE_ELEMENT',
        element,
        originalParent,
        originalNextSibling,
      });
    }
  }

  /**
   * Override to use tracking methods for wrapper attributes.
   */
  override finalizeWrapperAttributes(): void {
    const testIdAttr = this.input.getAttribute('data-testid');
    if (testIdAttr && !this.wrapper!.hasAttribute('data-testid')) {
      this.trackAddAttribute(this.wrapper!, 'data-testid', `${testIdAttr}-wrapper`);
    }

    this.trackSetAttribute(this.wrapper!, 'data-touchspin-injected', this.wrapperType);
  }

  /**
   * LIFO stack-based teardown.
   *
   * Reverses all DOM operations tracked during init() in exact reverse order.
   * Each renderer should use tracking methods (createTrackedElement, trackMoveElement, etc.)
   * to record operations, and this teardown automatically undoes them.
   *
   * This approach provides surgical, predictable DOM restoration without "smart" logic.
   */
  teardown(): void {
    // Undo all operations in reverse order (LIFO)
    while (this.undoStack.length > 0) {
      const event = this.undoStack.pop()!;

      switch (event.type) {
        case 'CREATE_ELEMENT':
          // Remove injected element
          event.element.remove();
          break;

        case 'ADD_CLASS':
          // Remove class that was added
          event.element.classList.remove(event.className);
          break;

        case 'REMOVE_CLASS':
          // Re-add class that was removed
          event.element.classList.add(event.className);
          break;

        case 'SET_ATTRIBUTE':
          // Restore original attribute value
          if (event.originalValue === null) {
            event.element.removeAttribute(event.name);
          } else {
            event.element.setAttribute(event.name, event.originalValue);
          }
          break;

        case 'MOVE_ELEMENT':
          // Move element back to original position
          if (event.originalNextSibling && event.originalNextSibling.parentElement) {
            event.originalParent.insertBefore(event.element, event.originalNextSibling);
          } else {
            event.originalParent.appendChild(event.element);
          }
          break;
      }
    }

    // Clear special elements
    this.specialElements.clear();
  }
}

export default AbstractRendererSurgical;

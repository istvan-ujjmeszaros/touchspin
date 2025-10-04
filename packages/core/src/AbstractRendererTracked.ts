import AbstractRenderer from './AbstractRenderer.js';

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
 * Abstract renderer using LIFO (Last In First Out) undo stack strategy.
 * Tracks DOM operations as events and undoes them in reverse order during teardown.
 * Suitable for Bootstrap5 renderer (floating labels, input groups).
 */
abstract class AbstractRendererTracked extends AbstractRenderer {
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
    if (!this.wrapper) return;

    const testIdAttr = this.input.getAttribute('data-testid');
    if (testIdAttr && !this.wrapper.hasAttribute('data-testid')) {
      this.trackAddAttribute(this.wrapper, 'data-testid', `${testIdAttr}-wrapper`);
    }

    this.trackSetAttribute(this.wrapper, 'data-touchspin-injected', this.wrapperType);
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

export default AbstractRendererTracked;

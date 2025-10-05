import AbstractRendererBase, { TOUCHSPIN_ATTRIBUTE } from './AbstractRendererBase.js';

const WRAPPER_TYPE_DEFAULT = 'wrapper';
const WRAPPER_TYPE_ADVANCED = 'wrapper-advanced';
const WRAPPER_READY_CLASS = 'bootstrap-touchspin';

/**
 * Simple renderer strategy using attribute-based cleanup.
 *
 * This is the recommended starting point for most custom renderers. It provides
 * straightforward DOM cleanup by removing all elements marked with the
 * `data-touchspin-injected` attribute during teardown.
 *
 * ## How it works
 * - During `init()`: Create DOM elements and mark them with `data-touchspin-injected`
 * - During `teardown()`: Find and remove all marked elements
 * - No operation tracking or state management required
 *
 * ## When to use AbstractRendererSimple
 * ✅ Standard input wrappers without element movement
 * ✅ Framework renderers with clean component boundaries (Bootstrap 3/4, Tailwind)
 * ✅ Cases where injected elements stay in their original positions
 * ✅ Simple DOM structures where elements don't need to move between parents
 *
 * ## When to use AbstractRendererSurgical instead
 * ❌ When elements need to be moved between different parent containers
 * ❌ When working with complex nested structures (e.g., floating labels)
 * ❌ When you need precise restoration of original DOM state
 * ❌ When elements are repositioned or have their attributes modified
 *
 * ## Getting Started
 * Most developers should start with `AbstractRendererSimple`. It's easier to implement,
 * understand, and debug. If you later discover you need element movement or more
 * precise DOM control, you can switch to `AbstractRendererSurgical`.
 *
 * @example
 * ```typescript
 * import { AbstractRendererSimple } from '@touchspin/core/renderer';
 *
 * class MyRenderer extends AbstractRendererSimple {
 *   init(): void {
 *     // Create wrapper and mark it
 *     this.wrapper = document.createElement('div');
 *     this.wrapper.setAttribute('data-touchspin-injected', 'wrapper');
 *
 *     // Create buttons and mark them
 *     const upBtn = document.createElement('button');
 *     upBtn.setAttribute('data-touchspin-injected', 'up');
 *     // ... teardown() will automatically remove all marked elements
 *   }
 * }
 * ```
 *
 * Currently used by: Bootstrap3, Bootstrap4, Vanilla, Tailwind renderers
 */
abstract class AbstractRendererSimple extends AbstractRendererBase {
  abstract init(): void;

  teardown(): void {
    this.removeInjectedElements();
  }

  removeInjectedElements(): void {
    this.removeInjectedNodesWithinWrapper();
    this.removeNearbyInjectedNodes();
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

    // For simple wrappers, move input out and remove wrapper
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
}

export default AbstractRendererSimple;

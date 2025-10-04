import AbstractRenderer, { TOUCHSPIN_ATTRIBUTE } from './AbstractRenderer.js';

const WRAPPER_TYPE_DEFAULT = 'wrapper';
const WRAPPER_TYPE_ADVANCED = 'wrapper-advanced';
const WRAPPER_READY_CLASS = 'bootstrap-touchspin';

/**
 * Abstract renderer using attribute-based cleanup strategy.
 *
 * Removes all elements marked with data-touchspin-injected attribute during teardown.
 * Simple, predictable DOM cleanup without tracking or snapshots.
 *
 * Use cases:
 * - Standard input wrappers without complex DOM manipulation
 * - Cases where injected elements are cleanly separated from user content
 * - Bootstrap 3/4 renderers with simple input-group structures
 *
 * Currently used by: Bootstrap3, Bootstrap4, Vanilla, Tailwind renderers
 */
abstract class AbstractRendererAttributeBased extends AbstractRenderer {
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

export default AbstractRendererAttributeBased;

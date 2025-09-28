const TOUCHSPIN_ATTRIBUTE = 'data-touchspin-injected';
const TEST_ID_ATTRIBUTE = 'data-testid';
const WRAPPER_TYPE_DEFAULT = 'wrapper';
const WRAPPER_TYPE_ADVANCED = 'wrapper-advanced';
const WRAPPER_READY_CLASS = 'bootstrap-touchspin';
class AbstractRenderer {
    constructor(input, settings, core) {
        this.wrapper = null;
        this.wrapperType = WRAPPER_TYPE_DEFAULT;
        this.input = input;
        this.settings = settings;
        this.core = core;
    }
    teardown() {
        this.removeInjectedElements();
    }
    removeInjectedElements() {
        this.removeInjectedNodesWithinWrapper();
        this.removeNearbyInjectedNodes();
    }
    finalizeWrapperAttributes() {
        if (!this.wrapper)
            return;
        const testId = this.input.getAttribute(TEST_ID_ATTRIBUTE);
        if (testId && !this.wrapper.hasAttribute(TEST_ID_ATTRIBUTE)) {
            this.wrapper.setAttribute(TEST_ID_ATTRIBUTE, `${testId}-wrapper`);
        }
        this.wrapper.setAttribute(TOUCHSPIN_ATTRIBUTE, this.wrapperType);
    }
    getUpButtonTestId() {
        return this.buildDataTestId('up');
    }
    getDownButtonTestId() {
        return this.buildDataTestId('down');
    }
    getPrefixTestId() {
        return this.buildDataTestId('prefix');
    }
    getPostfixTestId() {
        return this.buildDataTestId('postfix');
    }
    extractRendererSettings(schema, sourceSettings = this.settings) {
        const selected = {};
        for (const key in schema) {
            if (Object.prototype.hasOwnProperty.call(sourceSettings, key)) {
                selected[key] = sourceSettings[key];
            }
        }
        return selected;
    }
    // Backward compatibility alias
    projectRendererOptions(schema, from = this.settings) {
        return this.extractRendererSettings(schema, from);
    }
    removeInjectedNodesWithinWrapper() {
        const { wrapper } = this;
        if (!wrapper)
            return;
        wrapper
            .querySelectorAll(`[${TOUCHSPIN_ATTRIBUTE}]`)
            .forEach((element) => element.remove());
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
    removeNearbyInjectedNodes() {
        const injectedNodes = document.querySelectorAll(`[${TOUCHSPIN_ATTRIBUTE}]`);
        injectedNodes.forEach((node) => {
            if (!(node instanceof HTMLElement))
                return;
            if (node === this.input)
                return;
            if (!this.isNodeRelatedToInput(node))
                return;
            node.remove();
        });
    }
    isNodeRelatedToInput(node) {
        const parent = node.parentElement;
        const inputParent = this.input.parentElement;
        const nodeContainsInput = node.contains(this.input);
        const parentContainsInput = parent?.contains(this.input) ?? false;
        const inputContainsNode = inputParent?.contains(node) ?? false;
        return nodeContainsInput || parentContainsInput || inputContainsNode;
    }
    buildDataTestId(suffix) {
        const base = this.input.getAttribute(TEST_ID_ATTRIBUTE);
        return base ? ` data-testid="${base}-${suffix}"` : '';
    }
}
export default AbstractRenderer;
//# sourceMappingURL=AbstractRenderer.js.map
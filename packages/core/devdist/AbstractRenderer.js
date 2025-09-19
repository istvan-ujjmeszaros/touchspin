class AbstractRenderer {
    constructor(inputEl, settings, core) {
        // New renderer architecture
        this.input = inputEl;
        this.settings = settings; // Read-only access to settings
        this.core = core; // Reference to core for calling attachment methods
        this.wrapper = null; // Set by subclasses during init()
        this.wrapperType = 'wrapper'; // Default wrapper type, set to 'wrapper-advanced' by buildAdvancedInputGroup
        // No legacy properties needed in modern architecture
    }
    /**
     * Cleanup renderer - remove injected elements and restore original state
     * Default implementation removes all injected elements
     * Subclasses can override for custom teardown
     */
    teardown() {
        // Default implementation - remove all injected elements
        this.removeInjectedElements();
        // Subclasses can override for custom teardown
    }
    /**
     * Utility method to remove all injected TouchSpin elements
     * Handles both regular wrappers and advanced input groups
     * Called automatically by teardown()
     */
    removeInjectedElements() {
        // Find and remove all elements with data-touchspin-injected attribute
        if (this.wrapper) {
            const injected = this.wrapper.querySelectorAll('[data-touchspin-injected]');
            injected.forEach((el) => el.remove());
            // If wrapper itself was injected and is not the original parent
            if (this.wrapper.hasAttribute('data-touchspin-injected') && this.wrapper.parentElement) {
                const injectedType = this.wrapper.getAttribute('data-touchspin-injected');
                if (injectedType === 'wrapper-advanced') {
                    // For advanced input groups, just remove the TouchSpin classes and attribute
                    // but keep the original input-group structure intact
                    this.wrapper.classList.remove('bootstrap-touchspin');
                    this.wrapper.removeAttribute('data-touchspin-injected');
                }
                else {
                    // For regular wrappers, unwrap the input element
                    const parent = this.wrapper.parentElement;
                    parent.insertBefore(this.input, this.wrapper);
                    this.wrapper.remove();
                }
            }
        }
        // Also find any injected elements that might be siblings or elsewhere
        const allInjected = document.querySelectorAll('[data-touchspin-injected]');
        allInjected.forEach((el) => {
            // Only remove if it's related to this input (check if input is descendant or sibling)
            if (el.contains(this.input) ||
                (el.parentElement && el.parentElement.contains(this.input)) ||
                (this.input.parentElement ? this.input.parentElement.contains(el) : false)) {
                // Don't remove the input itself
                if (el !== this.input) {
                    el.remove();
                }
            }
        });
    }
    // All legacy jQuery-based methods have been removed
    // Modern renderers implement their own init() method and use vanilla JS
    /**
     * Get testid attribute for up button
     * @returns {string} Testid attribute or empty string
     */
    getUpButtonTestId() {
        const inputTestId = this.input.getAttribute('data-testid');
        if (inputTestId)
            return ` data-testid="${inputTestId}-up"`;
        return '';
    }
    /**
     * Get testid attribute for down button
     * @returns {string} Testid attribute or empty string
     */
    getDownButtonTestId() {
        const inputTestId = this.input.getAttribute('data-testid');
        if (inputTestId)
            return ` data-testid="${inputTestId}-down"`;
        return '';
    }
    /**
     * Get testid attribute for prefix element
     * @returns {string} Testid attribute or empty string
     */
    getPrefixTestId() {
        const inputTestId = this.input.getAttribute('data-testid');
        if (inputTestId)
            return ` data-testid="${inputTestId}-prefix"`;
        return '';
    }
    /**
     * Get testid attribute for postfix element
     * @returns {string} Testid attribute or empty string
     */
    getPostfixTestId() {
        const inputTestId = this.input.getAttribute('data-testid');
        if (inputTestId)
            return ` data-testid="${inputTestId}-postfix"`;
        return '';
    }
    /**
     * Finalize wrapper attributes after DOM construction and event attachment.
     * Sets both data-testid and data-touchspin-injected attributes.
     * Called by core as the final initialization step.
     */
    finalizeWrapperAttributes() {
        if (this.wrapper) {
            // Set test ID if input has one and wrapper doesn't already have one
            const testid = this.input.getAttribute('data-testid');
            if (testid && !this.wrapper.hasAttribute('data-testid')) {
                this.wrapper.setAttribute('data-testid', testid + '-wrapper');
            }
            // Mark component as ready (DOM built, events attached)
            this.wrapper.setAttribute('data-touchspin-injected', this.wrapperType);
        }
    }
    /**
     * Helper to project flat core settings into a typed renderer-specific view.
     * No coercion; simply narrows known keys per schema for better DX.
     */
    projectRendererOptions(schema, from = this.settings) {
        const out = {};
        for (const key in schema) {
            if (Object.prototype.hasOwnProperty.call(from, key)) {
                out[key] = from[key];
            }
        }
        return out;
    }
}
export default AbstractRenderer;
//# sourceMappingURL=AbstractRenderer.js.map
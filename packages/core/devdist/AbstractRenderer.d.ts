/**
 * AbstractRenderer - Base class for TouchSpin renderers
 * Part of @touchspin/core package to avoid duplication across renderer packages
 *
 * @example
 * class CustomRenderer extends AbstractRenderer {
 *   init() {
 *     this.wrapper = this.buildUI();
 *     const upBtn = this.wrapper.querySelector('[data-touchspin-injected="up"]');
 *     const downBtn = this.wrapper.querySelector('[data-touchspin-injected="down"]');
 *     this.core.attachUpEvents(upBtn);
 *     this.core.attachDownEvents(downBtn);
 *     this.core.observeSetting('prefix', (value) => this.updatePrefix(value));
 *   }
 * }
 */
import type { TouchSpinCoreOptions } from './index';
import type { Renderer } from './renderer';
export type RendererOptionKind = 'string' | 'boolean' | 'number' | 'enum';
export type RendererOptionDef = {
    kind: 'string';
} | {
    kind: 'boolean';
} | {
    kind: 'number';
} | {
    kind: 'enum';
    values: readonly string[];
};
export type RendererOptionSchema = Readonly<Record<string, RendererOptionDef>>;
type InferOption<S extends RendererOptionDef> = S extends {
    kind: 'string';
} ? string | undefined : S extends {
    kind: 'boolean';
} ? boolean | undefined : S extends {
    kind: 'number';
} ? number | undefined : S extends {
    kind: 'enum';
    values: readonly (infer V)[];
} ? V | undefined : unknown;
export type InferOptionsFromSchema<S extends RendererOptionSchema> = {
    [K in keyof S]: InferOption<S[K]>;
};
declare abstract class AbstractRenderer implements Renderer {
    /**
     * @param {HTMLInputElement} inputEl - The input element to render around
     * @param {Object} settings - TouchSpin settings (read-only)
     * @param {Object} core - TouchSpin core instance for event delegation
     */
    input: HTMLInputElement;
    settings: Readonly<TouchSpinCoreOptions>;
    core: {
        attachUpEvents: (el: HTMLElement | null) => void;
        attachDownEvents: (el: HTMLElement | null) => void;
        observeSetting: <K extends keyof TouchSpinCoreOptions>(key: K, cb: (value: NonNullable<TouchSpinCoreOptions[K]>) => void) => () => void;
    };
    wrapper: HTMLElement | null;
    wrapperType: string;
    constructor(inputEl: HTMLInputElement, settings: Readonly<TouchSpinCoreOptions>, core: {
        attachUpEvents: (el: HTMLElement | null) => void;
        attachDownEvents: (el: HTMLElement | null) => void;
        observeSetting: <K extends keyof TouchSpinCoreOptions>(key: K, cb: (value: NonNullable<TouchSpinCoreOptions[K]>) => void) => () => void;
    });
    /**
     * Initialize the renderer - build DOM structure and attach events
     * Must be implemented by subclasses
     * @abstract
     */
    abstract init(): void;
    /**
     * Cleanup renderer - remove injected elements and restore original state
     * Default implementation removes all injected elements
     * Subclasses can override for custom teardown
     */
    teardown(): void;
    /**
     * Utility method to remove all injected TouchSpin elements
     * Handles both regular wrappers and advanced input groups
     * Called automatically by teardown()
     */
    removeInjectedElements(): void;
    /**
     * Get testid attribute for up button
     * @returns {string} Testid attribute or empty string
     */
    getUpButtonTestId(): string;
    /**
     * Get testid attribute for down button
     * @returns {string} Testid attribute or empty string
     */
    getDownButtonTestId(): string;
    /**
     * Get testid attribute for prefix element
     * @returns {string} Testid attribute or empty string
     */
    getPrefixTestId(): string;
    /**
     * Get testid attribute for postfix element
     * @returns {string} Testid attribute or empty string
     */
    getPostfixTestId(): string;
    /**
     * Finalize wrapper attributes after DOM construction and event attachment.
     * Sets both data-testid and data-touchspin-injected attributes.
     * Called by core as the final initialization step.
     */
    finalizeWrapperAttributes(): void;
    /**
     * Helper to project flat core settings into a typed renderer-specific view.
     * No coercion; simply narrows known keys per schema for better DX.
     */
    protected projectRendererOptions<S extends RendererOptionSchema>(schema: S, from?: Record<string, unknown>): Readonly<Partial<InferOptionsFromSchema<S>>>;
}
export default AbstractRenderer;
//# sourceMappingURL=AbstractRenderer.d.ts.map
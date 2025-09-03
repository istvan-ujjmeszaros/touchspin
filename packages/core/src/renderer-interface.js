// @ts-check

/**
 * Renderer Interfaces for TouchSpin Core (Transitional + Future)
 *
 * Context:
 * - Transitional (current): renderers are jQuery-based and return JQuery objects.
 * - Future (framework-agnostic core): renderers operate on native DOM elements.
 *
 * Both interfaces are documented here to guide extraction and ensure
 * compatibility while moving from jQuery to framework-agnostic renderers.
 */

/**
 * @typedef {Object} TSJQueryElements
 * @property {import('jquery').JQuery<HTMLInputElement>} input
 * @property {import('jquery').JQuery<HTMLButtonElement>} up
 * @property {import('jquery').JQuery<HTMLButtonElement>} down
 */

/**
 * Transitional jQuery-based renderer interface (used by legacy plugin).
 * Methods mirror current `src/renderers/*Renderer.js` shape.
 * @typedef {Object} TSJQueryRenderer
 * @property {() => import('jquery').JQuery} buildInputGroup
 * @property {(originalinput: import('jquery').JQuery) => import('jquery').JQuery} buildAdvancedInputGroup
 * @property {(container: import('jquery').JQuery) => TSJQueryElements} initElements
 * @property {() => { _detached_prefix: import('jquery').JQuery|null, _detached_postfix: import('jquery').JQuery|null }} hideEmptyPrefixPostfix
 * @property {(newsettings: Partial<any>, detached: { _detached_prefix: import('jquery').JQuery|null, _detached_postfix: import('jquery').JQuery|null }) => void} updatePrefixPostfix
 */

/**
 * Transitional factory signature for jQuery renderers.
 * @typedef {(jQuery: import('jquery').JQueryStatic, settings: any, originalinput: import('jquery').JQuery) => TSJQueryRenderer} TSJQueryRendererFactory
 */

/**
 * @typedef {Object} TSElements
 * @property {HTMLInputElement} input
 * @property {HTMLButtonElement} up
 * @property {HTMLButtonElement} down
 * @property {HTMLElement} container
 */

/**
 * Future renderer interface (framework-agnostic, DOM-centric).
 *
 * Responsibilities:
 * - Build DOM structure around the given input element (if needed).
 * - Return stable references to `input`, `up`, `down`, and `container`.
 * - Handle prefix/postfix visibility and updates.
 * - Do not attach global/document listeners; core will bind events.
 * - **CRITICAL**: Add data-touchspin-role attributes for core event targeting.
 *
 * Required Data Attributes (for core DOM event handling):
 * - `data-touchspin-injected="up"` on increment buttons
 * - `data-touchspin-injected="down"` on decrement buttons
 * - `data-touchspin-injected="input"` on the input element
 * - `data-touchspin-injected="wrapper"` on wrapper element (buildInputGroup)
 * - `data-touchspin-injected="enhanced-wrapper"` on enhanced parent element (buildAdvancedInputGroup)
 * - `data-touchspin-injected="prefix"` on prefix text elements
 * - `data-touchspin-injected="postfix"` on postfix text elements
 * - `data-touchspin-injected="vertical-wrapper"` on vertical button wrapper elements
 *
 * Event Targeting Strategy:
 * - Core uses data-touchspin-injected attributes with role values for event targeting
 * - NO dependency on CSS class names for event binding
 * - All renderers MUST add these role-based data-touchspin-injected attributes
 *
 * @typedef {Object} TSRenderer
 * @property {(inputEl: HTMLInputElement) => HTMLElement} buildInputGroup
 * @property {(containerEl: HTMLElement) => TSElements} initElements
 * @property {() => { _detached_prefix: HTMLElement|null, _detached_postfix: HTMLElement|null }} hideEmptyPrefixPostfix
 * @property {(newsettings: Partial<any>, detached: { _detached_prefix: HTMLElement|null, _detached_postfix: HTMLElement|null }) => void} updatePrefixPostfix
 */

// Note: This file exports no runtime symbols. It exists to centralize
// JSDoc typedefs that other JS files can reference via `import('...')`.


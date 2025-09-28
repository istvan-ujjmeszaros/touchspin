/**
 * VanillaRenderer - Vanilla CSS-based TouchSpin renderer
 * Framework-agnostic renderer using pure CSS without dependencies
 */
import { AbstractRenderer } from '@touchspin/core/renderer';
declare class VanillaRenderer extends AbstractRenderer {
    private prefixEl;
    private postfixEl;
    init(): void;
    buildInputGroup(): HTMLElement;
    buildVerticalButtons(): string;
    hideEmptyPrefixPostfix(wrapper?: HTMLElement | null): void;
    updatePrefix(value: string): void;
    updatePostfix(value: string): void;
    updateButtonClass(type: 'up' | 'down', className: string | null | undefined): void;
    updateVerticalButtonClass(type: 'up' | 'down', className: string | null | undefined): void;
    updateVerticalButtonText(type: 'up' | 'down', text?: string): void;
    updateButtonText(type: 'up' | 'down', text?: string): void;
    updatePrefixClasses(): void;
    updatePostfixClasses(): void;
    handleVerticalButtonsChange(_newValue: boolean): void;
    rebuildDOM(): void;
    buildAndAttachDOM(): void;
    updateButtonFocusability(newValue: boolean): void;
    /**
     * Apply theme via CSS custom properties
     * @param {Object} theme - Theme object with CSS property values
     */
    setTheme(theme: Readonly<Record<string, string>>): void;
    teardown(): void;
}
export default VanillaRenderer;
//# sourceMappingURL=VanillaRenderer.d.ts.map
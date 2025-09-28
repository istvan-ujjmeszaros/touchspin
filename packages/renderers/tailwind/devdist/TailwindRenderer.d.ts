/**
 * Tailwind CSS Renderer - New Architecture
 * Using Tailwind utility classes only; no external CSS dependency.
 */
import { AbstractRenderer } from '@touchspin/core/renderer';
declare class TailwindRenderer extends AbstractRenderer {
    private prefixEl;
    private postfixEl;
    wrapper: HTMLElement | null;
    init(): void;
    buildInputGroup(): HTMLElement;
    buildBasicInputGroup(): HTMLElement;
    buildAdvancedInputGroup(existingContainer: HTMLElement): HTMLElement;
    _detectInputSize(): string;
    _applySizeClasses(wrapper?: HTMLElement | null): void;
    hideEmptyPrefixPostfix(wrapper?: HTMLElement | null): void;
    updatePrefix(value: string | null | undefined): void;
    updatePostfix(value: string | null | undefined): void;
    updateButtonClass(type: 'up' | 'down', className?: string | null): void;
    buildVerticalButtons(): string;
    updateVerticalButtonClass(type: 'up' | 'down', className?: string | null): void;
    updateVerticalButtonText(type: 'up' | 'down', text?: string | null): void;
    updateButtonText(type: 'up' | 'down', text?: string | null): void;
    updatePrefixClasses(): void;
    updatePostfixClasses(): void;
    handleVerticalButtonsChange(newValue: boolean): void;
    rebuildDOM(): void;
    buildAndAttachDOM(): void;
    updateButtonFocusability(newValue: boolean): void;
}
export default TailwindRenderer;
//# sourceMappingURL=TailwindRenderer.d.ts.map
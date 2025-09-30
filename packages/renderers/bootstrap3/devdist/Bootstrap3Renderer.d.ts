/**
 * Bootstrap 3 Renderer - New Architecture
 * Builds Bootstrap 3 UI elements around TouchSpin input
 * Uses input-group-btn and input-group-addon for Bootstrap 3 compatibility
 */
import { AbstractRenderer } from '@touchspin/core/renderer';
declare class Bootstrap3Renderer extends AbstractRenderer {
    private prefixEl;
    private postfixEl;
    private _formControlAdded?;
    wrapper: HTMLElement | null;
    init(): void;
    teardown(): void;
    buildAndAttachDOM(): void;
    /**
     * Ensures input element is properly positioned within the input group before using it as reference
     * Fixes DOM insertion bug when input loses parent-child relationship during rebuilds
     */
    private ensureInputInGroup;
    buildInputGroup(): HTMLElement;
    buildBasicInputGroup(): HTMLElement;
    buildAdvancedInputGroup(existingInputGroup: HTMLElement): HTMLElement;
    _detectInputGroupSize(): string;
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
    updateButtonFocusability(newValue: boolean): void;
}
export default Bootstrap3Renderer;
//# sourceMappingURL=Bootstrap3Renderer.d.ts.map
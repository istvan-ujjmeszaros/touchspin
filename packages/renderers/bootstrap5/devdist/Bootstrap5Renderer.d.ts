/**
 * Bootstrap 5 Renderer - New Architecture
 * Builds Bootstrap 5 UI elements around TouchSpin input
 */
import { AbstractRenderer } from '@touchspin/core/renderer';
declare class Bootstrap5Renderer extends AbstractRenderer {
    private opts;
    private prefixEl;
    private postfixEl;
    private _formControlAdded?;
    wrapper: HTMLElement | null;
    init(): void;
    private refreshOpts;
    teardown(): void;
    buildInputGroup(): HTMLElement;
    buildBasicInputGroup(): HTMLElement;
    buildAdvancedInputGroup(existingInputGroup: HTMLElement): HTMLElement;
    _detectInputGroupSize(): string;
    buildAndAttachDOM(): void;
    updatePrefix(value: string): void;
    updatePostfix(value: string): void;
    updateButtonClass(type: 'up' | 'down', className: string | null | undefined): void;
    buildVerticalButtons(): string;
    updateVerticalButtonClass(type: 'up' | 'down', className: string | null | undefined): void;
    updateVerticalButtonText(type: 'up' | 'down', text?: string): void;
    updateButtonText(type: 'up' | 'down', text?: string): void;
    updatePrefixClasses(): void;
    updatePostfixClasses(): void;
    handleVerticalButtonsChange(_newValue: boolean): void;
    rebuildDOM(): void;
    updateButtonFocusability(newValue: boolean): void;
}
export default Bootstrap5Renderer;
//# sourceMappingURL=Bootstrap5Renderer.d.ts.map
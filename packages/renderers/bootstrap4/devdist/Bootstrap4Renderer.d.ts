/**
 * Bootstrap 4 Renderer - New Architecture
 * Builds Bootstrap 4 UI elements around TouchSpin input
 * Uses input-group-prepend and input-group-append for Bootstrap 4 compatibility
 */
import { AbstractRenderer } from '@touchspin/core/renderer';
declare class Bootstrap4Renderer extends AbstractRenderer {
    private prefixEl;
    private postfixEl;
    private _formControlAdded?;
    wrapper: HTMLElement | null;
    init(): void;
    teardown(): void;
    buildInputGroup(): HTMLElement;
    buildBasicInputGroup(): HTMLElement;
    buildAdvancedInputGroup(existingInputGroup: HTMLElement): HTMLElement;
    _detectInputGroupSize(): string;
    buildAndAttachDOM(): void;
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
export default Bootstrap4Renderer;
//# sourceMappingURL=Bootstrap4Renderer.d.ts.map
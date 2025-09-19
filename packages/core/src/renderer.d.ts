export { default as AbstractRenderer } from './AbstractRenderer';
export type { RendererOptionKind, RendererOptionDef, RendererOptionSchema, InferOptionsFromSchema, } from './AbstractRenderer';
export interface Renderer {
    init(): void;
    finalizeWrapperAttributes(): void;
    teardown?(): void;
}
export type CoreFacade = {
    attachUpEvents: (el: HTMLElement | null) => void;
    attachDownEvents: (el: HTMLElement | null) => void;
    observeSetting: (key: string, cb: (value: unknown) => void) => () => void;
};
export type RendererConstructor = new (inputEl: HTMLInputElement, settings: Readonly<Record<string, unknown>>, core: CoreFacade) => Renderer;
export type RendererElements = {
    input: HTMLInputElement;
    up: HTMLButtonElement | HTMLElement;
    down: HTMLButtonElement | HTMLElement;
    container: HTMLElement;
};
export type TSRenderer = RendererConstructor;
export type TSElements = RendererElements;
//# sourceMappingURL=renderer.d.ts.map